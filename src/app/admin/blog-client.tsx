
"use client";

import { useState } from 'react';
import type { Post } from '@/lib/data';
import { savePost, deletePost } from '@/lib/blog-actions';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';

type BlogClientProps = {
  initialPosts: Post[];
};

export function BlogClient({ initialPosts }: BlogClientProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<Post> | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleOpenDialog = (post: Partial<Post> | null = null) => {
    setCurrentPost(post);
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setCurrentPost(null);
    setSelectedFile(null);
    setIsDialogOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    if (!currentPost || !currentPost.title) {
      toast({ title: "Hata", description: "Başlık alanı zorunludur.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      let thumbnailUrl = currentPost.thumbnailUrl;

      // If a new file is selected, upload it
      if (selectedFile) {
        const storageRef = ref(storage, `blog-thumbnails/${Date.now()}_${selectedFile.name}`);
        const snapshot = await uploadBytes(storageRef, selectedFile);
        thumbnailUrl = await getDownloadURL(snapshot.ref);
        toast({ title: "Başarılı", description: "Görsel yüklendi." });
      }

      const savedPost = await savePost({
        id: currentPost.id,
        title: currentPost.title,
        content: currentPost.content,
        thumbnailUrl: thumbnailUrl,
      });

      if (currentPost.id) {
        // Edit
        setPosts(posts.map(p => p.id === savedPost.id ? savedPost : p));
        toast({ title: "Başarılı", description: "Yazı güncellendi." });
      } else {
        // Add
        setPosts([savedPost, ...posts]);
        toast({ title: "Başarılı", description: "Yeni yazı eklendi." });
      }
      handleCloseDialog();
    } catch (error: any) {
        console.error("Save post error:", error);
      toast({ title: "Hata", description: "İşlem sırasında bir hata oluştu. Lütfen Firestore güvenlik kurallarınızı ve dosya yükleme izinlerini kontrol edin.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (postId: string) => {
    if (!confirm('Bu yazıyı silmek istediğinizden emin misiniz?')) return;
    
    setIsSubmitting(true);
    try {
        await deletePost(postId);
        setPosts(posts.filter(p => p.id !== postId));
        toast({ title: 'Başarılı', description: 'Yazı silindi.' });
    } catch (error: any) {
        toast({ title: 'Hata', description: "Yazı silinirken bir hata oluştu. Lütfen Firestore güvenlik kurallarınızı kontrol edin.", variant: 'destructive' });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="flex justify-end mb-6">
        <Button onClick={() => handleOpenDialog({})}>
          <PlusCircle className="mr-2 h-4 w-4" /> Yeni Yazı Ekle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <Card key={post.id} className="flex flex-col">
             {post.thumbnailUrl && (
                <div className="relative h-48 w-full">
                    <Image src={post.thumbnailUrl} alt={post.title} layout="fill" objectFit="cover" className="rounded-t-lg" />
                </div>
            )}
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
              <CardDescription>
                Son Güncelleme: {format(new Date(post.updatedAt), 'dd MMMM yyyy, HH:mm')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                {/* We can add a snippet of content here in the future if needed */}
            </CardContent>
            <CardFooter className="mt-auto flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpenDialog(post)}>
                    <Edit className="mr-2 h-4 w-4"/> Düzenle
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(post.id)}>
                    <Trash2 className="mr-2 h-4 w-4"/> Sil
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{currentPost?.id ? 'Yazıyı Düzenle' : 'Yeni Yazı Oluştur'}</DialogTitle>
            <DialogDescription>
              Blog yazınızın başlığını, içeriğini ve görselini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid items-center gap-2">
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                value={currentPost?.title || ''}
                onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
             <div className="grid items-center gap-2">
                <Label htmlFor="thumbnail">Görsel</Label>
                 <Input
                    id="thumbnail"
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                {(selectedFile || currentPost?.thumbnailUrl) && (
                    <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                        <ImageIcon className="w-4 h-4"/>
                        <span>{selectedFile ? selectedFile.name : "Mevcut görsel korunacak. Değiştirmek için yeni bir dosya seçin."}</span>
                    </div>
                )}
            </div>
            <div className="grid items-center gap-2">
              <Label htmlFor="content">İçerik</Label>
              <Textarea
                id="content"
                className="min-h-[250px]"
                value={currentPost?.content || ''}
                onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>İptal</Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {selectedFile ? <Upload className="mr-2 h-4 w-4" /> : null}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
