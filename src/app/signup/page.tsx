
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { signUp } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
        setError("Şifreler uyuşmuyor.");
        return;
    }

    try {
      await signUp(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Hesap Oluştur</CardTitle>
          <CardDescription>Yeni bir hesap oluşturmak için bilgilerinizi girin</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Şifre</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="password-confirm">Şifreyi Onayla</Label>
              <Input 
                id="password-confirm" 
                type="password" 
                required 
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
              Kayıt Ol
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
            Zaten bir hesabınız var mı?{' '}
            <Link href="/login" className="underline">
              Giriş Yapın
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
