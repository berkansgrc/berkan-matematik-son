
import { AdminClient } from './admin-client';
import { getCourseData } from '@/lib/course-actions';
import { QuizSimulatorClient } from './quiz-simulator-client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function AdminPage() {
  const initialCourseData = await getCourseData();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">Yönetim Paneli</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Site içeriğini buradan yönetin.
        </p>
      </header>
      
       <Tabs defaultValue="content-management">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content-management">Ders İçerik Yönetimi</TabsTrigger>
            <TabsTrigger value="quiz-simulator">Quiz Oluşturma Simülatörü</TabsTrigger>
          </TabsList>
          <TabsContent value="content-management" className="mt-6">
             <h2 className="text-2xl font-bold mb-4">Ders İçerik Yönetimi</h2>
             <p className="text-muted-foreground mb-6">Sınıflara göre ders kaynaklarını (video, döküman, uygulama) buradan yönetin.</p>
             <AdminClient initialData={initialCourseData} />
          </TabsContent>
          <TabsContent value="quiz-simulator" className="mt-6">
              <h2 className="text-2xl font-bold mb-4">AI Quiz Oluşturma Simülatörü</h2>
              <p className="text-muted-foreground mb-6">Yapay zeka yardımıyla belirli bir konu için hızlıca çoktan seçmeli testler oluşturun. Oluşturulan testler, seçilen sınıf ve konunun "Uygulamalar" bölümüne otomatik olarak eklenir.</p>
              <QuizSimulatorClient courseData={initialCourseData} />
          </TabsContent>
       </Tabs>
    </div>
  );
}
