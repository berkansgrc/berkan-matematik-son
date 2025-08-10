import { BookOpenCheck, Home, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
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
          <nav className="flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/" aria-label="Ana Sayfa">
                <Home className="h-5 w-5" />
                <span className="sr-only">Ana Sayfa</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin" aria-label="Admin Paneli">
                <Shield className="h-5 w-5" />
                <span className="sr-only">Admin Paneli</span>
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
