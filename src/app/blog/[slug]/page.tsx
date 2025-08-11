
import { getPostBySlug, getPosts } from '@/lib/blog-actions';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map(post => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <Button variant="ghost" asChild className="mb-8 -ml-4">
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tüm Yazılar
          </Link>
        </Button>

      <article className="prose prose-lg dark:prose-invert max-w-none">
        <header className="mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-primary md:text-5xl">{post.title}</h1>
            <div className="mt-4 flex items-center text-muted-foreground">
                <CalendarDays className="mr-2 h-5 w-5" />
                <time dateTime={post.createdAt}>
                    {format(new Date(post.createdAt), 'dd MMMM yyyy')}
                </time>
            </div>
        </header>

        {post.thumbnailUrl && (
            <div className="relative aspect-video w-full mb-8 rounded-lg overflow-hidden">
                <Image 
                    src={post.thumbnailUrl} 
                    alt={post.title}
                    layout="fill"
                    objectFit="cover"
                    priority
                />
            </div>
        )}

        {/* Using a div to render content with preserved whitespace */}
        <div className="whitespace-pre-wrap text-foreground/90">
          {post.content}
        </div>
      </article>
    </div>
  );
}
