
"use client";

import { AdminClient } from './admin-client';
import { courseData } from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/');
      }
    }
  }, [user, loading, router]);
  
  if (loading || !user || user.role !== 'admin') {
      return (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center items-center">
              <p>Yükleniyor veya yetkiniz yok...</p>
          </div>
      )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">Admin Paneli</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Ders kaynaklarını (video, döküman, uygulama) buradan yönetebilirsiniz.
        </p>
      </header>
      <AdminClient initialData={courseData} />
    </div>
  );
}
