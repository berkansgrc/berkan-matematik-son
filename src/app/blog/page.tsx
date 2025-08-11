
import Link from 'next/link';
import { getPosts } from '@/lib/blog-actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

function truncateText(text: string, length: number) {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">Punto</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Matematik dünyasından en son yazılar, ipuçları ve haberler.
        </p>
      </header>
      
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <Link href={`/blog/${post.slug}`} key={post.id} className="group block">
                <Card className="flex flex-col h-full overflow-hidden transition-shadow duration-300 hover:shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">{post.title}</CardTitle>
                        <CardDescription className="flex items-center text-sm text-muted-foreground pt-2">
                            <CalendarDays className="mr-2 h-4 w-4" />
                            <span>{format(new Date(post.createdAt), 'dd MMMM yyyy')}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-muted-foreground">{truncateText(post.content, 150)}</p>
                    </CardContent>
                    <CardFooter>
                        <div className="text-sm font-semibold text-primary flex items-center">
                            Devamını Oku
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                    </CardFooter>
                </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Henüz hiç blog yazısı eklenmemiş.</p>
        </div>
      )}
    </div>
  );
}
