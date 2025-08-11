
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
import { PlusCircle, Edit, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

type BlogClientProps = {
  initialPosts: Post[];
};

export function BlogClient({ initialPosts }: BlogClientProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<Post> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleOpenDialog = (post: Partial<Post> | null = null) => {
    setCurrentPost(post);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setCurrentPost(null);
    setIsDialogOpen(false);
  };

  const handleSave = async () => {
    if (!currentPost || !currentPost.title) {
      toast({ title: "Hata", description: "Başlık alanı zorunludur.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      // Use the new Genkit flow for saving
      const savedPost = await savePost({
        id: currentPost.id,
        title: currentPost.title,
        content: currentPost.content,
        thumbnailUrl: currentPost.thumbnailUrl,
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
      toast({ title: "Hata", description: error.message || "İşlem sırasında bir hata oluştu.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (postId: string) => {
    if (!confirm('Bu yazıyı silmek istediğinizden emin misiniz?')) return;
    
    setIsSubmitting(true);
    try {
        // Use the new Genkit flow for deleting
        await deletePost(postId);
        setPosts(posts.filter(p => p.id !== postId));
        toast({ title: 'Başarılı', description: 'Yazı silindi.' });
    } catch (error: any) {
        toast({ title: 'Hata', description: error.message || 'Yazı silinirken bir hata oluştu.', variant: 'destructive' });
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
                <div className="relative w-full h-48">
                    <Image 
                        src={post.thumbnailUrl} 
                        alt={post.title}
                        fill
                        className="object-cover rounded-t-lg"
                    />
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
              <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
              <Input
                id="thumbnailUrl"
                placeholder="https://ornek.com/resim.jpg"
                value={currentPost?.thumbnailUrl || ''}
                onChange={(e) => setCurrentPost({ ...currentPost, thumbnailUrl: e.target.value })}
                disabled={isSubmitting}
              />
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
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
