
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AppWindow, FileText, Video, AlertCircle } from 'lucide-react';
import { grades, type GradeSlug, type Resource, type GradeData, ResourceCategory } from '@/lib/data';
import { getCourseData } from '@/lib/course-actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export async function generateStaticParams() {
  return grades.map((grade) => ({
    grade: grade.slug,
  }));
}

export default async function GradePage({ params }: { params: { grade: GradeSlug } }) {
  const gradeInfo = grades.find(g => g.slug === params.grade);
  
  // Fetch all data from Firestore
  const allCourseData = await getCourseData();
  const data = allCourseData[params.grade];

  if (!data || !gradeInfo) {
    notFound();
  }

  const getResourceLink = (category: ResourceCategory, resource: Resource) => {
    if (category === 'applications') {
        return `/view-app?url=${encodeURIComponent(resource.url)}`;
    }
    return resource.url;
  }

  const getLinkTarget = (category: ResourceCategory) => {
    if (category === 'applications') {
        return '_blank'; // Open iframe wrapper in a new tab
    }
    return '_blank';
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-8">
        <Button variant="ghost" asChild className="mb-4 -ml-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tüm Sınıflar
          </Link>
        </Button>
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">{data.name} Kaynakları</h1>
        <p className="mt-2 text-lg text-muted-foreground">{data.description}</p>
      </header>

      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-secondary">
          <TabsTrigger value="videos" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            <Video className="mr-2 h-5 w-5" /> Videolar
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            <FileText className="mr-2 h-5 w-5" /> Dökümanlar
          </TabsTrigger>
          <TabsTrigger value="applications" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            <AppWindow className="mr-2 h-5 w-5" /> Uygulamalar
          </TabsTrigger>
        </TabsList>
        <TabsContent value="videos" className="mt-6">
          {data.videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.videos.map(item => (
                <ResourceCard 
                    key={item.id} 
                    resource={item} 
                    icon={<Video className="w-6 h-6 text-primary" />} 
                    href={getResourceLink('videos', item)}
                    target={getLinkTarget('videos')}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="Henüz video eklenmemiş." />
          )}
        </TabsContent>
        <TabsContent value="documents" className="mt-6">
          {data.documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.documents.map(item => (
                <ResourceCard 
                    key={item.id} 
                    resource={item} 
                    icon={<FileText className="w-6 h-6 text-primary" />}
                    href={getResourceLink('documents', item)}
                    target={getLinkTarget('documents')}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="Henüz döküman eklenmemiş." />
          )}
        </TabsContent>
        <TabsContent value="applications" className="mt-6">
          {data.applications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.applications.map(item => (
                <ResourceCard 
                    key={item.id} 
                    resource={item} 
                    icon={<AppWindow className="w-6 h-6 text-primary" />} 
                    href={getResourceLink('applications', item)}
                    target={getLinkTarget('applications')}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="Henüz uygulama eklenmemiş." />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ResourceCard({ resource, icon, href, target }: { resource: Resource; icon: React.ReactNode; href: string; target: string; }) {
  return (
    <a href={href} target={target} rel="noopener noreferrer" className="group">
      <Card className="h-full transition-all duration-300 ease-in-out group-hover:shadow-lg group-hover:border-accent">
        <CardHeader className="flex flex-row items-center gap-4 p-4">
          <div className="bg-primary/10 p-3 rounded-lg">
            {icon}
          </div>
          <CardTitle className="text-base font-medium">{resource.title}</CardTitle>
        </CardHeader>
      </Card>
    </a>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 border-2 border-dashed rounded-lg bg-card">
       <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
