
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { CourseData, GradeSlug, Resource, ResourceCategory } from '@/lib/data';
import { grades } from '@/lib/data';
import { getCourseData } from '@/lib/course-actions';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, collection, arrayUnion, arrayRemove } from 'firebase/firestore';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type AdminClientProps = {
  initialData: CourseData;
}

type EditableResource = {
  id?: string;
  grade: GradeSlug | '';
  category: ResourceCategory | '';
  title: string;
  url: string;
}

const COURSE_COLLECTION = 'courseData';
const SINGLE_DOCUMENT_ID = 'allGrades';

export function AdminClient({ initialData }: AdminClientProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<CourseData>(initialData);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentResource, setCurrentResource] = useState<EditableResource>({ grade: '', category: '', title: '', url: '' });

  const refreshData = async () => {
    setIsDataLoading(true);
    const updatedData = await getCourseData();
    setData(updatedData);
    setIsDataLoading(false);
  };
  
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    setData(initialData);
    setIsDataLoading(false);
  }, [initialData]);

  // Client-side Firestore update function
  const updateFirestore = async (grade: GradeSlug, category: ResourceCategory, newResources: Resource[]) => {
      const docRef = doc(db, COURSE_COLLECTION, SINGLE_DOCUMENT_ID);
      const fieldKey = `${grade}.${category}`;
      await setDoc(docRef, { [grade]: { [category]: newResources } }, { merge: true });
  }

  const handleSaveResource = async () => {
    if (!currentResource.grade || !currentResource.category || !currentResource.title || !currentResource.url) {
        toast({ title: "Hata", description: "Lütfen tüm alanları doldurun.", variant: "destructive" });
        return;
    }
    if (user?.role !== 'admin') {
        toast({ title: "Hata", description: "Bu işlem için yetkiniz yok.", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    const { grade, category } = currentResource;
    
    try {
        const docRef = doc(db, COURSE_COLLECTION, SINGLE_DOCUMENT_ID);
        const docSnap = await getDoc(docRef);
        const currentData = docSnap.exists() ? docSnap.data() : {};

        const currentCategoryResources: Resource[] = currentData[grade]?.[category] ?? [];
        
        if (currentResource.id) { // Update existing
            const resourceIndex = currentCategoryResources.findIndex(r => r.id === currentResource.id);
            if (resourceIndex > -1) {
                const resourceToUpdate = currentCategoryResources[resourceIndex];
                const updatedResource = { ...resourceToUpdate, title: currentResource.title, url: currentResource.url };
                await updateFirestore(grade, category, [
                    ...currentCategoryResources.slice(0, resourceIndex),
                    updatedResource,
                    ...currentCategoryResources.slice(resourceIndex + 1),
                ]);
            }
            toast({ title: "Başarılı", description: "Kaynak güncellendi." });
        } else { // Add new
            const newId = doc(collection(db, '_')).id;
            const newResource: Resource = { id: newId, title: currentResource.title, url: currentResource.url };
            await updateFirestore(grade, category, [...currentCategoryResources, newResource]);
            toast({ title: "Başarılı", description: "Yeni kaynak eklendi." });
        }

        setIsDialogOpen(false);
        await refreshData();
    } catch (error) {
        console.error("Failed to save resource:", error);
        toast({ title: "Hata", description: "Kaynak kaydedilemedi. İzinlerinizi kontrol edin.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleDeleteResource = async (grade: GradeSlug, category: ResourceCategory, resourceToDelete: Resource) => {
    if (!confirm("Bu kaynağı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) return;
     if (user?.role !== 'admin') {
        toast({ title: "Hata", description: "Bu işlem için yetkiniz yok.", variant: "destructive" });
        return;
    }

    try {
      const docRef = doc(db, COURSE_COLLECTION, SINGLE_DOCUMENT_ID);
      const fieldKey = `${grade}.${category}`;
      await setDoc(docRef, { [grade]: { [category]: arrayRemove(resourceToDelete) } }, { merge: true });
      
      toast({ title: "Kaynak Silindi", description: `Kaynak başarıyla silindi.` });
      await refreshData();
    } catch (error) {
      console.error("Failed to delete resource:", error);
      toast({ title: "Hata", description: "Kaynak silinemedi.", variant: "destructive" });
    }
  }

  const openAddDialog = () => {
    setCurrentResource({ id: undefined, grade: '', category: '', title: '', url: '' });
    setIsDialogOpen(true);
  }

  const openEditDialog = (grade: GradeSlug, category: ResourceCategory, resource: Resource) => {
    setCurrentResource({ ...resource, grade, category });
    setIsDialogOpen(true);
  }
  
  if (authLoading || !user || user.role !== 'admin') {
      return (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center items-center">
              <Loader2 className="mr-2 h-8 w-8 animate-spin" />
              <p>Yükleniyor veya yetkiniz yok...</p>
          </div>
      )
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openAddDialog} variant="default">
          <PlusCircle className="mr-2 h-4 w-4" /> Yeni Kaynak Ekle
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Accordion type="single" collapsible className="w-full" defaultValue={grades[0].slug}>
            {grades.map(grade => (
              <AccordionItem value={grade.slug} key={grade.slug}>
                <AccordionTrigger className="text-lg font-semibold px-6 py-4">{grade.name}</AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <Tabs defaultValue="videos" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-secondary">
                      <TabsTrigger value="videos">Videolar</TabsTrigger>
                      <TabsTrigger value="documents">Dökümanlar</TabsTrigger>
                      <TabsTrigger value="applications">Uygulamalar</TabsTrigger>
                    </TabsList>
                    <TabsContent value="videos" className="mt-4">
                      <ResourceTable isLoading={isDataLoading} resources={data[grade.slug]?.videos ?? []} onEdit={(r) => openEditDialog(grade.slug, 'videos', r)} onDelete={(r) => handleDeleteResource(grade.slug, 'videos', r)} />
                    </TabsContent>
                    <TabsContent value="documents" className="mt-4">
                      <ResourceTable isLoading={isDataLoading} resources={data[grade.slug]?.documents ?? []} onEdit={(r) => openEditDialog(grade.slug, 'documents', r)} onDelete={(r) => handleDeleteResource(grade.slug, 'documents', r)}/>
                    </TabsContent>
                    <TabsContent value="applications" className="mt-4">
                      <ResourceTable isLoading={isDataLoading} resources={data[grade.slug]?.applications ?? []} onEdit={(r) => openEditDialog(grade.slug, 'applications', r)} onDelete={(r) => handleDeleteResource(grade.slug, 'applications', r)}/>
                    </TabsContent>
                  </Tabs>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentResource.id ? 'Kaynağı Düzenle' : 'Yeni Kaynak Ekle'}</DialogTitle>
            <DialogDescription>
              Kaynak bilgilerini girerek sisteme ekleyebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="grade-select" className="text-right">Sınıf</Label>
              <Select disabled={isSubmitting || !!currentResource.id} value={currentResource.grade} onValueChange={(value) => setCurrentResource(prev => ({...prev, grade: value as GradeSlug}))}>
                <SelectTrigger id="grade-select" className="col-span-3"><SelectValue placeholder="Sınıf seçin" /></SelectTrigger>
                <SelectContent>
                  {grades.map(g => <SelectItem key={g.slug} value={g.slug}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category-select" className="text-right">Kategori</Label>
              <Select disabled={isSubmitting || !!currentResource.id} value={currentResource.category} onValueChange={(value) => setCurrentResource(prev => ({...prev, category: value as ResourceCategory}))}>
                <SelectTrigger id="category-select" className="col-span-3"><SelectValue placeholder="Kategori seçin" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="videos">Video</SelectItem>
                  <SelectItem value="documents">Döküman</SelectItem>
                  <SelectItem value="applications">Uygulama</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Başlık</Label>
              <Input id="title" disabled={isSubmitting} value={currentResource.title} onChange={(e) => setCurrentResource(prev => ({...prev, title: e.target.value}))} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">URL</Label>
              <Input id="url" disabled={isSubmitting} value={currentResource.url} onChange={(e) => setCurrentResource(prev => ({...prev, url: e.target.value}))} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => setIsDialogOpen(false)}>İptal</Button>
            <Button onClick={handleSaveResource} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {currentResource.id ? 'Güncelle' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function ResourceTable({ isLoading, resources, onEdit, onDelete }: { isLoading: boolean; resources: Resource[], onEdit: (resource: Resource) => void, onDelete: (resource: Resource) => void }) {
  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  if (resources.length === 0) return <p className="text-muted-foreground p-4 text-center border rounded-md">Bu kategoride kaynak bulunmuyor.</p>;
  
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Başlık</TableHead>
            <TableHead>URL</TableHead>
            <TableHead className="text-right w-[100px]">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resources.map((resource) => (
            <TableRow key={resource.id}>
              <TableCell className="font-medium">{resource.title}</TableCell>
              <TableCell><a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-xs block">{resource.url}</a></TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => onEdit(resource)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onDelete(resource)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
