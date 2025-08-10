import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { grades } from '@/lib/data';

export default function Home() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">
          Berkan Matematik
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Matematikte başarının adresi. 5, 6, 7. sınıf ve LGS hazırlık öğrencileri için özel olarak hazırlanmış video dersler, dökümanlar ve interaktif uygulamalar.
        </p>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-center mb-8">Sınıflar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {grades.map((grade) => (
            <Link href={`/${grade.slug}`} key={grade.slug} className="group">
              <Card className="h-full flex flex-col transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:-translate-y-2 group-hover:border-primary">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="bg-primary/10 p-4 rounded-full">
                      <GraduationCap className="w-10 h-10 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl text-center">{grade.name}</CardTitle>
                  <CardDescription className="text-center min-h-[40px]">{grade.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex items-end justify-center">
                  <div className="text-sm font-semibold text-primary flex items-center">
                    Derslere Göz At
                    <ArrowRight className="w-4 h-4 ml-2 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
