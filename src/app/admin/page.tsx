
import { AdminClient } from './admin-client';

export default function AdminPage() {
  // The AdminClient component now fetches its own data.
  // We no longer need to fetch it here and pass it as a prop.
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">Yönetim Paneli</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Sınıflara göre ders kaynaklarını (video, döküman, uygulama) buradan yönetin.
        </p>
      </header>
      <AdminClient />
    </div>
  );
}

    