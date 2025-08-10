"use client";

import { Home, LogOut, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import Image from 'next/image'; // Temporarily commented out for testing
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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
           {/* Using a standard img tag for troubleshooting */}
           <img
              src="/logo.png"
              alt="Berkan Matematik Logo"
              style={{ height: '160px', width: 'auto' }}
              className="transition-transform duration-300 group-hover:scale-105"
            />
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="transition-all hover:bg-accent/80 hover:scale-110">
            <Link href="/" aria-label="Ana Sayfa">
              <Home className="h-5 w-5" />
              <span className="sr-only">Ana Sayfa</span>
            </Link>
          </Button>
          {user && user.role === 'admin' && (
            <Button variant="ghost" size="icon" asChild className="transition-all hover:bg-accent/80 hover:scale-110">
              <Link href="/admin" aria-label="Admin Paneli">
                <Shield className="h-5 w-5" />
                <span className="sr-only">Admin Paneli</span>
              </Link>
            </Button>
          )}
           {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full transition-transform hover:scale-110">
                  <Avatar className="h-9 w-9 border-2 border-transparent group-hover:border-primary">
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
                <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Çıkış Yap</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
               <Button asChild variant="outline" size="sm" className="transition-all hover:scale-105">
                <Link href="/login">Giriş Yap</Link>
              </Button>
              <Button asChild size="sm" className="transition-all hover:scale-105">
                <Link href="/signup">Kayıt Ol</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
