
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function AppViewerPage() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setError('Görüntülenecek bir uygulama URL\'si belirtilmedi.');
    }
    // A small delay to allow iframe to start loading, in case it's fast.
    const timer = setTimeout(() => {
        // We can't reliably know if the iframe loaded successfully due to cross-origin policies.
        // So we will just stop showing the loader after a few seconds. A better implementation
        // might involve a message passing system if you control the iframed content.
        setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [url]);

  if (error) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-center">
        <h1 className="text-2xl font-bold text-destructive">Bir Hata Oluştu</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!url) {
    return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Uygulama yükleniyor...</p>
        </div>
    )
  }

  return (
    <div className="relative h-screen w-screen">
      {isLoading && (
         <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Uygulama yükleniyor...</p>
        </div>
      )}
      <iframe
        src={url}
        className="h-full w-full border-0"
        title="Uygulama Görüntüleyici"
        onLoad={() => setIsLoading(false)}
        onError={() => {
            setIsLoading(false);
            setError('Bu uygulama yüklenemedi. Uygulama, site içinde görüntülenmeyi desteklemiyor olabilir.');
        }}
      />
    </div>
  );
}
