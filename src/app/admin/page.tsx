
import { AdminClient } from './admin-client';
import { BlogClient } from './blog-client';
import { getCourseData } from '@/lib/course-actions';
import { getPosts } from '@/lib/blog-actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function AdminPage() {
  const initialCourseData = await getCourseData();
  const initialPosts = await getPosts();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">Yönetim Paneli</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Site içeriğini buradan yönetin.
        </p>
      </header>
      
      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="courses">Ders İçerikleri</TabsTrigger>
          <TabsTrigger value="blog">Blog Yazıları</TabsTrigger>
        </TabsList>
        <TabsContent value="courses" className="mt-6">
           <h2 className="text-2xl font-bold mb-4">Ders İçerik Yönetimi</h2>
           <p className="text-muted-foreground mb-6">Sınıflara göre ders kaynaklarını (video, döküman, uygulama) buradan yönetin.</p>
           <AdminClient initialData={initialCourseData} />
        </TabsContent>
        <TabsContent value="blog" className="mt-6">
          <h2 className="text-2xl font-bold mb-4">Blog Yazı Yönetimi</h2>
          <p className="text-muted-foreground mb-6">Blog yazılarını buradan oluşturun, düzenleyin ve silin.</p>
          <BlogClient initialPosts={initialPosts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
