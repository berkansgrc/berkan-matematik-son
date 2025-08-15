
import { doc, getDoc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { db } from '@/lib/firebase';
import type { Quiz } from '@/lib/data';
import { QuizClient } from './quiz-client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const QUIZZES_COLLECTION = 'quizzes';

async function getQuizData(quizId: string): Promise<Quiz | null> {
  try {
    const quizDocRef = doc(db, QUIZZES_COLLECTION, quizId);
    const quizDocSnap = await getDoc(quizDocRef);

    if (quizDocSnap.exists()) {
      return quizDocSnap.data() as Quiz;
    }
    return null;
  } catch (error) {
    console.error("Error fetching quiz data:", error);
    return null;
  }
}

export default async function QuizPage({ params }: { params: { quizId: string } }) {
  const quizData = await getQuizData(params.quizId);

  if (!quizData) {
    notFound();
  }

  return (
     <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8">
            <Button variant="ghost" asChild className="mb-4 -ml-4">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Ana Sayfa
              </Link>
            </Button>
            <h1 className="text-4xl font-extrabold tracking-tight text-primary">{quizData.title}</h1>
            <p className="mt-2 text-lg text-muted-foreground">{quizData.grade} / {quizData.subject}</p>
        </header>
        <QuizClient quiz={quizData} />
    </div>
  );
}
