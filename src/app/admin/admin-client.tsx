
"use client";

import { useState } from 'react';
import type { courseData as CourseDataType, GradeSlug, Resource } from '@/lib/data';
import { grades } from '@/lib/data';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type AdminClientProps = {
  initialData: typeof CourseDataType;
}

type EditableResource = {
  id?: string;
  grade: GradeSlug | '';
  category: 'videos' | 'documents' | 'applications' | '';
  title: string;
  url: string;
}

export function AdminClient({ initialData }: AdminClientProps) {
  const [data, setData] = useState(initialData);
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentResource, setCurrentResource] = useState<EditableResource>({ grade: '', category: '', title: '', url: '' });

  const handleSaveResource = () => {
    // In a real app, you would make an API call here.
    // This is a simulation.
    console.log("Saving resource:", currentResource);
    toast({
      title: "Başarılı",
      description: `Kaynak "${currentResource.title}" kaydedildi. (Simülasyon)`,
    });
    // This part is complex and omitted: update the state `data` to reflect changes.
    // A real implementation would involve updating the specific array in the nested object.
    setIsDialogOpen(false);
  };
  
  const handleDeleteResource = (grade: GradeSlug, category: keyof Omit<typeof data[GradeSlug], 'name'|'description'>, resourceId: string) => {
    console.log(`Deleting ${resourceId} from ${grade}/${category}`);
    toast({
      title: "Kaynak Silindi",
      variant: "destructive",
      description: `Kaynak başarıyla silindi. (Simülasyon)`,
    });
     // Again, update state `data` in a real app.
  }

  const openAddDialog = () => {
    setCurrentResource({ grade: '', category: '', title: '', url: '' });
    setIsDialogOpen(true);
  }

  const openEditDialog = (grade: GradeSlug, category: 'videos' | 'documents' | 'applications', resource: Resource) => {
    setCurrentResource({ ...resource, grade, category });
    setIsDialogOpen(true);
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
          <Accordion type="single" collapsible className="w-full">
            {grades.map(grade => (
              <AccordionItem value={grade.slug} key={grade.slug}>
                <AccordionTrigger className="text-lg font-semibold px-6 py-4">{grade.name}</AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <Tabs defaultValue="videos" className="w-full">
                    <TabsList className="bg-secondary">
                      <TabsTrigger value="videos">Videolar</TabsTrigger>
                      <TabsTrigger value="documents">Dökümanlar</TabsTrigger>
                      <TabsTrigger value="applications">Uygulamalar</TabsTrigger>
                    </TabsList>
                    <TabsContent value="videos" className="mt-4">
                      <ResourceTable resources={data[grade.slug].videos} onEdit={(r) => openEditDialog(grade.slug, 'videos', r)} onDelete={(id) => handleDeleteResource(grade.slug, 'videos', id)} />
                    </TabsContent>
                    <TabsContent value="documents" className="mt-4">
                      <ResourceTable resources={data[grade.slug].documents} onEdit={(r) => openEditDialog(grade.slug, 'documents', r)} onDelete={(id) => handleDeleteResource(grade.slug, 'documents', id)}/>
                    </TabsContent>
                    <TabsContent value="applications" className="mt-4">
                      <ResourceTable resources={data[grade.slug].applications} onEdit={(r) => openEditDialog(grade.slug, 'applications', r)} onDelete={(id) => handleDeleteResource(grade.slug, 'applications', id)}/>
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
              Kaynak bilgilerini girerek sisteme ekleyebilirsiniz. Değişiklikler yalnızca bu oturum için geçerlidir.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="grade-select" className="text-right">Sınıf</Label>
              <Select value={currentResource.grade} onValueChange={(value) => setCurrentResource(prev => ({...prev, grade: value as GradeSlug}))}>
                <SelectTrigger id="grade-select" className="col-span-3"><SelectValue placeholder="Sınıf seçin" /></SelectTrigger>
                <SelectContent>
                  {grades.map(g => <SelectItem key={g.slug} value={g.slug}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category-select" className="text-right">Kategori</Label>
              <Select value={currentResource.category} onValueChange={(value) => setCurrentResource(prev => ({...prev, category: value as 'videos' | 'documents' | 'applications'}))}>
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
              <Input id="title" value={currentResource.title} onChange={(e) => setCurrentResource(prev => ({...prev, title: e.target.value}))} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">URL</Label>
              <Input id="url" value={currentResource.url} onChange={(e) => setCurrentResource(prev => ({...prev, url: e.target.value}))} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>İptal</Button>
            <Button onClick={handleSaveResource}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function ResourceTable({ resources, onEdit, onDelete }: { resources: Resource[], onEdit: (resource: Resource) => void, onDelete: (id: string) => void }) {
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
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onDelete(resource.id)}>
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
