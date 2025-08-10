
"use client";

import { BookOpenCheck, Home, LogOut, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <BookOpenCheck className="h-8 w-8 text-primary transition-transform duration-300 group-hover:rotate-[-5deg] group-hover:scale-110" />
            <span className="text-xl font-bold tracking-tight">
              Berkan Matematik
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/" aria-label="Ana Sayfa">
                <Home className="h-5 w-5" />
                <span className="sr-only">Ana Sayfa</span>
              </Link>
            </Button>
            {user && (
              <Button variant="ghost" size="icon" asChild>
                <Link href="/admin" aria-label="Admin Paneli">
                  <Shield className="h-5 w-5" />
                  <span className="sr-only">Admin Paneli</span>
                </Link>
              </Button>
            )}
             {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL ?? ''} alt={user.email ?? ''} />
                      <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Giriş yapıldı</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Çıkış Yap</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                 <Button asChild variant="outline" size="sm">
                  <Link href="/login">Giriş Yap</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/signup">Kayıt Ol</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
