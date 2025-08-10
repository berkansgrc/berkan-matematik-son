
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowRight, GraduationCap, PlayCircle } from 'lucide-react';
import { grades, Resource } from '@/lib/data';
import { HeroAnimation } from '@/components/layout/hero-animation';
import { TypewriterHero } from '@/components/layout/typewriter-hero';
import { getCourseData } from '@/lib/course-actions';
import { Button } from '@/components/ui/button';

export default async function Home() {
  const allCourseData = await getCourseData();
  
  const allVideos: Resource[] = Object.values(allCourseData)
    .flatMap(grade => grade.videos)
    .filter(video => video.createdAt) // Ensure createdAt exists
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
    
  const featuredVideos = allVideos.slice(0, 4);

  return (
    <>
      <section className="relative h-[60vh] flex items-center justify-center text-center text-white overflow-hidden">
        <HeroAnimation className="absolute z-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8">
          <TypewriterHero />
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <section>
          <h2 className="text-3xl font-bold text-center mb-8">Sınıflar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {grades.map((grade) => (
              <Link href={`/${grade.slug}`} key={grade.slug} className="group">
                <Card className="h-full flex flex-col transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:-translate-y-2 group-hover:border-primary">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className="bg-primary/10 p-4 rounded-full">
                        <GraduationCap className="w-10 h-10 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-xl text-center">{grade.name}</CardTitle>
                    <CardDescription className="text-center min-h-[40px]">{grade.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex items-end justify-center">
                    <div className="text-sm font-semibold text-primary flex items-center">
                      Derslere Göz At
                      <ArrowRight className="w-4 h-4 ml-2 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {featuredVideos.length > 0 && (
          <section className="mt-20">
            <h2 className="text-3xl font-bold text-center mb-8">Öne Çıkan Videolar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredVideos.map((video) => (
                <Card key={video.id} className="group overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2">
                   <CardHeader className="p-0">
                     <a href={video.url} target="_blank" rel="noopener noreferrer" className="block relative aspect-video">
                        <img
                          src={`https://placehold.co/600x400.png`}
                          alt={video.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          data-ai-hint="math lesson"
                        />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                         <h3 className="text-white font-bold text-lg p-4">{video.title}</h3>
                       </div>
                       <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <PlayCircle className="w-16 h-16 text-white" />
                       </div>
                     </a>
                   </CardHeader>
                   <CardContent className="p-4">
                     <Button asChild className="w-full">
                       <a href={video.url} target="_blank" rel="noopener noreferrer">
                         <PlayCircle className="mr-2 h-4 w-4" />
                         Şimdi İzle
                       </a>
                     </Button>
                   </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
