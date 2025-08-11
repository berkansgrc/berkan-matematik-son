
import { AdminClient } from './admin-client';
import { getCourseData } from '@/lib/course-actions';

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
      
       <div>
           <h2 className="text-2xl font-bold mb-4">Ders İçerik Yönetimi</h2>
           <p className="text-muted-foreground mb-6">Sınıflara göre ders kaynaklarını (video, döküman, uygulama) buradan yönetin.</p>
           <AdminClient initialData={initialCourseData} />
        </div>
    </div>
  );
}
