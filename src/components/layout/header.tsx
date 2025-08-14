
"use client";

import { Home, LogOut, Shield, ChevronDown, Calculator } from "lucide-react";
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
import { grades } from "@/lib/data";

const Logo = () => (
    <div className="flex items-center gap-3 text-primary" style={{ height: '40px' }}>
      <svg
        viewBox="0 0 165 40"
        height="40"
        xmlns="http://www.w3.org/2000/svg"
        className="fill-current text-primary"
      >
        <g>
          {/* Calculator Icon Box */}
          <rect x="0.5" y="0.5" width="39" height="39" rx="6" ry="6" className="stroke-current" fillOpacity="0" strokeWidth="1" />
          {/* Lines */}
          <line x1="20" y1="0" x2="20" y2="40" className="stroke-current" strokeWidth="1" />
          <line x1="0" y1="20" x2="40" y2="20" className="stroke-current" strokeWidth="1" />
          
          {/* Symbols */}
          <text x="10" y="13" textAnchor="middle" alignmentBaseline="middle" fontSize="16" fontWeight="normal" className="fill-current">+</text>
          <text x="30" y="13" textAnchor="middle" alignmentBaseline="middle" fontSize="20" fontWeight="normal" className="fill-current">-</text>
          <text x="10" y="31" textAnchor="middle" alignmentBaseline="middle" fontSize="16" fontWeight="normal" className="fill-current">×</text>
          <text x="30" y="31" textAnchor="middle" alignmentBaseline="middle" fontSize="20" fontWeight="normal" className="fill-current">÷</text>
        </g>
        <g>
           {/* Text */}
          <text x="50" y="16" fontSize="19" fontWeight="bold" className="fill-current">Berkan</text>
          <text x="50" y="36" fontSize="19" fontWeight="bold" className="fill-current">Matematik</text>
        </g>
      </svg>
    </div>
);


export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
            <Logo />
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex transition-all hover:bg-accent/80 hover:scale-110">
            <Link href="/" aria-label="Ana Sayfa">
              <Home className="h-5 w-5" />
              <span className="sr-only">Ana Sayfa</span>
            </Link>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="transition-all hover:bg-accent/80 hover:scale-105">
                Sınıflar
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {grades.map((grade) => (
                <DropdownMenuItem key={grade.slug} asChild>
                  <Link href={`/${grade.slug}`}>{grade.name}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {user && user.role === 'admin' && (
            <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex transition-all hover:bg-accent/80 hover:scale-110">
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
                 {user.role === 'admin' && (
                    <DropdownMenuItem asChild className="sm:hidden">
                        <Link href="/admin">
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Admin Paneli</span>
                        </Link>
                    </DropdownMenuItem>
                 )}
                <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Çıkış Yap</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
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
