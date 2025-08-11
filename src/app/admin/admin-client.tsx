
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { CourseData, GradeSlug, Resource, ResourceCategory, Subject } from '@/lib/data';
import { grades } from '@/lib/data';
import { getCourseData } from '@/lib/course-actions';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, collection, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Trash2, Loader2, FileText, Video, AppWindow, BookOpen, GripVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type AdminClientProps = {
  initialData: CourseData;
}

type DialogMode = 'addSubject' | 'editSubject' | 'addResource' | 'editResource';

type DialogState = {
  isOpen: boolean;
  mode: DialogMode | null;
  grade: GradeSlug | null;
  subject?: Subject;
  resource?: Resource;
  category?: ResourceCategory;
}

const COURSE_COLLECTION = 'courseData';
const SINGLE_DOCUMENT_ID = 'allGrades';

export function AdminClient({ initialData }: AdminClientProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<CourseData>(initialData);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const { toast } = useToast();
  
  const [dialogState, setDialogState] = useState<DialogState>({ isOpen: false, mode: null, grade: null });
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) router.push('/login');
      else if (user.role !== 'admin') router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    setData(initialData);
    setIsDataLoading(false);
  }, [initialData]);

  const refreshData = async () => {
    setIsDataLoading(true);
    const updatedData = await getCourseData();
    setData(updatedData);
    setIsDataLoading(false);
  };
  
  const handleOpenDialog = (mode: DialogMode, grade: GradeSlug, subject?: Subject, category?: ResourceCategory, resource?: Resource) => {
    setDialogState({ isOpen: true, mode, grade, subject, category, resource });
    if (mode === 'editSubject' || mode === 'addSubject') {
      setCurrentTitle(mode === 'editSubject' ? subject?.title || '' : '');
    } else if (mode === 'editResource' || mode === 'addResource') {
      setCurrentTitle(resource?.title || '');
      setCurrentUrl(resource?.url || '');
    }
  }

  const handleCloseDialog = () => {
    setDialogState({ isOpen: false, mode: null, grade: null });
    setCurrentTitle('');
    setCurrentUrl('');
  }

  const handleSave = async () => {
    if (user?.role !== 'admin') {
      toast({ title: "Hata", description: "Bu işlem için yetkiniz yok.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    
    const { mode, grade, subject, resource, category } = dialogState;

    try {
        const docRef = doc(db, COURSE_COLLECTION, SINGLE_DOCUMENT_ID);
        const docSnap = await getDoc(docRef);
        const currentData = docSnap.exists() ? docSnap.data() as CourseData : getEmptyCourseData();

        if (!grade) throw new Error("Sınıf seçimi yapılmadı.");

        let gradeSubjects = currentData[grade]?.subjects ?? [];
        
        switch(mode) {
            case 'addSubject':
                const newSubject: Subject = { id: doc(collection(db, '_')).id, title: currentTitle, videos: [], documents: [], applications: [] };
                gradeSubjects.push(newSubject);
                toast({ title: "Başarılı", description: "Yeni konu eklendi." });
                break;
            
            case 'editSubject':
                if (!subject) throw new Error("Konu bulunamadı.");
                gradeSubjects = gradeSubjects.map(s => s.id === subject.id ? { ...s, title: currentTitle } : s);
                toast({ title: "Başarılı", description: "Konu güncellendi." });
                break;
            
            case 'addResource':
                if (!subject || !category) throw new Error("Konu veya kategori bulunamadı.");
                const newResource: Resource = { id: doc(collection(db, '_')).id, title: currentTitle, url: currentUrl, createdAt: new Date().toISOString() };
                gradeSubjects = gradeSubjects.map(s => {
                    if (s.id === subject.id) {
                        return { ...s, [category]: [...s[category], newResource] };
                    }
                    return s;
                });
                toast({ title: "Başarılı", description: "Yeni kaynak eklendi." });
                break;

            case 'editResource':
                if (!subject || !category || !resource) throw new Error("Konu, kategori veya kaynak bulunamadı.");
                 gradeSubjects = gradeSubjects.map(s => {
                    if (s.id === subject.id) {
                       const updatedCategoryResources = s[category].map(r => r.id === resource.id ? { ...r, title: currentTitle, url: currentUrl } : r);
                       return { ...s, [category]: updatedCategoryResources };
                    }
                    return s;
                });
                toast({ title: "Başarılı", description: "Kaynak güncellendi." });
                break;
        }

        await setDoc(docRef, { ...currentData, [grade]: { ...currentData[grade], subjects: gradeSubjects } });
        
        handleCloseDialog();
        await refreshData();
    } catch (error: any) {
        console.error("Failed to save:", error);
        toast({ title: "Hata", description: error.message || "İşlem sırasında bir hata oluştu.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleDelete = async (grade: GradeSlug, subjectToDelete?: Subject, category?: ResourceCategory, resourceToDelete?: Resource) => {
     if (!confirm(`Bu ${resourceToDelete ? 'kaynağı' : 'konuyu'} silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) return;
     if (user?.role !== 'admin') {
        toast({ title: "Hata", description: "Bu işlem için yetkiniz yok.", variant: "destructive" });
        return;
    }

    try {
      const docRef = doc(db, COURSE_COLLECTION, SINGLE_DOCUMENT_ID);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error("Veritabanı dökümanı bulunamadı.");
      const currentData = docSnap.data() as CourseData;
      let gradeSubjects = currentData[grade]?.subjects ?? [];
      
      if (resourceToDelete && subjectToDelete && category) { // Delete a resource
        gradeSubjects = gradeSubjects.map(s => {
            if (s.id === subjectToDelete.id) {
                const updatedCategory = s[category].filter(r => r.id !== resourceToDelete.id);
                return { ...s, [category]: updatedCategory };
            }
            return s;
        });
        toast({ title: "Başarılı", description: "Kaynak silindi." });
      } else if (subjectToDelete) { // Delete a subject
         if (subjectToDelete.videos.length > 0 || subjectToDelete.documents.length > 0 || subjectToDelete.applications.length > 0) {
            if (!confirm("Bu konunun içinde kaynaklar var. Konuyu silerseniz içindeki tüm kaynaklar da silinir. Emin misiniz?")) return;
        }
        gradeSubjects = gradeSubjects.filter(s => s.id !== subjectToDelete.id);
        toast({ title: "Başarılı", description: "Konu ve içindeki tüm kaynaklar silindi." });
      }

      await setDoc(docRef, { ...currentData, [grade]: { ...currentData[grade], subjects: gradeSubjects } });
      await refreshData();

    } catch (error: any) {
      console.error("Failed to delete:", error);
      toast({ title: "Hata", description: "Silme işlemi sırasında hata.", variant: "destructive" });
    }
  }

  if (authLoading || !user || user.role !== 'admin') {
      return (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center items-center h-screen">
              <Loader2 className="mr-2 h-8 w-8 animate-spin" />
              <p>Yükleniyor...</p>
          </div>
      )
  }

  return (
    <>
      <Tabs defaultValue={grades[0].slug} className="w-full">
        <div className="flex justify-between items-center mb-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-auto">
                {grades.map(grade => (
                     <TabsTrigger key={grade.slug} value={grade.slug}>{grade.name}</TabsTrigger>
                ))}
            </TabsList>
             <Button onClick={() => handleOpenDialog('addSubject', (document.querySelector('[data-state="active"]') as HTMLElement)?.dataset.value as GradeSlug || grades[0].slug)} variant="default">
                <PlusCircle className="mr-2 h-4 w-4" /> Yeni Konu Ekle
            </Button>
        </div>

        {grades.map(grade => (
            <TabsContent key={grade.slug} value={grade.slug} className="mt-6">
                 {isDataLoading ? <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : 
                    data[grade.slug]?.subjects.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {data[grade.slug].subjects.map(subject => (
                            <AccordionItem value={subject.id} key={subject.id} className="border rounded-lg overflow-hidden">
                                <AccordionTrigger className="bg-card hover:no-underline p-4 text-lg font-semibold flex justify-between w-full items-center">
                                    <div className="flex items-center gap-3">
                                        <BookOpen className="h-6 w-6 text-primary" />
                                        <span>{subject.title}</span>
                                    </div>
                                    <div className="flex items-center gap-2 pr-4">
                                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenDialog('editSubject', grade.slug, subject); }}>
                                            <Edit className="h-4 w-4 mr-2"/> Düzenle
                                        </Button>
                                         <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(grade.slug, subject); }}>
                                            <Trash2 className="h-4 w-4 mr-2"/> Sil
                                        </Button>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="bg-muted/50 p-4 md:p-6">
                                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <ResourceColumn 
                                            title="Videolar"
                                            icon={<Video className="w-5 h-5 text-primary"/>}
                                            category="videos"
                                            resources={subject.videos}
                                            onAdd={() => handleOpenDialog('addResource', grade.slug, subject, 'videos')}
                                            onEdit={(resource) => handleOpenDialog('editResource', grade.slug, subject, 'videos', resource)}
                                            onDelete={(resource) => handleDelete(grade.slug, subject, 'videos', resource)}
                                        />
                                        <ResourceColumn 
                                            title="Dökümanlar"
                                            icon={<FileText className="w-5 h-5 text-primary"/>}
                                            category="documents"
                                            resources={subject.documents}
                                            onAdd={() => handleOpenDialog('addResource', grade.slug, subject, 'documents')}
                                            onEdit={(resource) => handleOpenDialog('editResource', grade.slug, subject, 'documents', resource)}
                                            onDelete={(resource) => handleDelete(grade.slug, subject, 'documents', resource)}
                                        />
                                        <ResourceColumn 
                                            title="Uygulamalar"
                                            icon={<AppWindow className="w-5 h-5 text-primary"/>}
                                            category="applications"
                                            resources={subject.applications}
                                            onAdd={() => handleOpenDialog('addResource', grade.slug, subject, 'applications')}
                                            onEdit={(resource) => handleOpenDialog('editResource', grade.slug, subject, 'applications', resource)}
                                            onDelete={(resource) => handleDelete(grade.slug, subject, 'applications', resource)}
                                        />
                                     </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                 ) : (
                    <div className="flex flex-col items-center justify-center text-center py-16 border-2 border-dashed rounded-lg bg-card">
                       <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Bu sınıf için henüz konu eklenmemiş. "Yeni Konu Ekle" butonu ile başlayın.</p>
                    </div>
                 )}
            </TabsContent>
        ))}
      </Tabs>
      
      <Dialog open={dialogState.isOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
                {dialogState.mode === 'addSubject' && 'Yeni Konu Ekle'}
                {dialogState.mode === 'editSubject' && 'Konuyu Düzenle'}
                {dialogState.mode === 'addResource' && 'Yeni Kaynak Ekle'}
                {dialogState.mode === 'editResource' && 'Kaynağı Düzenle'}
            </DialogTitle>
             <DialogDescription>
               {dialogState.mode?.includes('Subject') ? `"${grades.find(g => g.slug === dialogState.grade)?.name}" sınıfı için konu başlığı girin.` : `"${dialogState.subject?.title}" konusuna yeni bir kaynak ekleyin.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Başlık</Label>
                <Input id="title" disabled={isSubmitting} value={currentTitle} onChange={(e) => setCurrentTitle(e.target.value)} className="col-span-3" />
             </div>
             {(dialogState.mode === 'addResource' || dialogState.mode === 'editResource') && (
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="url" className="text-right">URL</Label>
                    <Input id="url" disabled={isSubmitting} value={currentUrl} onChange={(e) => setCurrentUrl(e.target.value)} className="col-span-3" />
                </div>
             )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={handleCloseDialog}>İptal</Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function ResourceColumn({ title, icon, category, resources, onAdd, onEdit, onDelete }: { title: string; icon: React.ReactNode; category: ResourceCategory; resources: Resource[]; onAdd: () => void; onEdit: (r: Resource) => void; onDelete: (r: Resource) => void; }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">{icon} {title}</CardTitle>
                    <Button size="sm" variant="outline" onClick={onAdd}><PlusCircle className="mr-2 h-4 w-4" /> Ekle</Button>
                </div>
            </CardHeader>
            <CardContent>
                {resources.length > 0 ? (
                    <ul className="space-y-2">
                      {resources.slice().sort((a,b) => (a.createdAt && b.createdAt) ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : 0).map(resource => (
                        <li key={resource.id} className="flex items-center justify-between bg-background p-2 rounded-md border">
                            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex-1 truncate" title={resource.url}>
                                {resource.title}
                            </a>
                            <div className="flex items-center">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(resource)}><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(resource)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        </li>
                      ))}
                    </ul>
                ) : (
                    <p className="text-muted-foreground text-sm text-center py-4">Bu kategoride kaynak yok.</p>
                )}
            </CardContent>
        </Card>
    )
}

function getEmptyCourseData(): CourseData {
    const emptyData: any = {};
    grades.forEach(g => {
        emptyData[g.slug] = {
            name: g.name,
            description: g.description,
            subjects: [],
        };
    });
    return emptyData;
}
