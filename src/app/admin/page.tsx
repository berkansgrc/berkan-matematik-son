
// This is a server component, so we can fetch data directly.
import { AdminClient } from './admin-client';
import { getCourseData } from '@/lib/course-actions';

export default async function AdminPage() {
  // Fetch initial data from Firestore.
  // Note: This data will be passed to the client, but the client 
  // will also re-fetch and manage its own state for real-time updates.
  const initialData = await getCourseData();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">Admin Paneli</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Ders kaynaklarını (video, döküman, uygulama) buradan yönetebilirsiniz.
        </p>
      </header>
      <AdminClient initialData={initialData} />
    </div>
  );
}
