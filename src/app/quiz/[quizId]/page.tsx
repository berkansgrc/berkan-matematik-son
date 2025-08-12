
'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { getQuizData } from '@/lib/course-actions';
import type { Quiz, Question } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, XCircle, Percent, Target, Repeat } from 'lucide-react';
import Confetti from 'react-dom-confetti';

export default function QuizPage({ params }: { params: { quizId: string } }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      const quizData = await getQuizData(params.quizId);
      if (!quizData) {
        notFound();
      }
      setQuiz(quizData);
      setLoading(false);
    };
    fetchQuiz();
  }, [params.quizId]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    if (!quiz) return;
    let currentScore = 0;
    quiz.questions.forEach(q => {
      const selectedOptionIndex = q.options.indexOf(answers[q.id]);
      const selectedOptionLetter = String.fromCharCode(65 + selectedOptionIndex);
       if (selectedOptionLetter === q.correctAnswer) {
        currentScore++;
      }
    });
    setScore(currentScore);
    setSubmitted(true);
    if (currentScore / quiz.questions.length >= 0.7) {
        setShowConfetti(true);
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setShowConfetti(false);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto flex h-[80vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!quiz) {
    // This case should be handled by notFound, but as a fallback:
    return <div className="container mx-auto text-center py-12">Test bulunamadı.</div>;
  }
  
  const getOptionLetter = (index: number) => String.fromCharCode(65 + index);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-extrabold">{quiz.title}</CardTitle>
                <CardDescription className="text-lg">{quiz.grade} - {quiz.subject}</CardDescription>
            </CardHeader>
            <CardContent>
                {!submitted ? (
                    <div className="space-y-8">
                        {quiz.questions.map((q, index) => (
                            <div key={q.id} className="p-4 border rounded-lg">
                                <p className="font-semibold text-lg mb-4">{index + 1}. {q.questionText}</p>
                                <RadioGroup onValueChange={(value) => handleAnswerChange(q.id, value)} value={answers[q.id]}>
                                    {q.options.map((option, i) => (
                                         <div key={i} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted transition-colors">
                                            <RadioGroupItem value={option} id={`${q.id}-${i}`} />
                                            <Label htmlFor={`${q.id}-${i}`} className="flex-1 cursor-pointer">{getOptionLetter(i)}) {option}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-8">
                         <div className="text-center p-8 bg-muted/50 rounded-lg relative">
                             <Confetti active={ showConfetti } config={{angle: 90, spread: 360, startVelocity: 40, elementCount: 200, dragFriction: 0.12, duration: 5000, stagger: 3, width: "10px", height: "10px"}} />
                            <h2 className="text-2xl font-bold mb-2">Test Tamamlandı!</h2>
                            <p className="text-xl text-muted-foreground">Sonucunuz:</p>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-center">
                                <div className="p-4 bg-background rounded-lg shadow-sm">
                                    <Target className="h-8 w-8 mx-auto text-primary mb-2" />
                                    <p className="text-2xl font-bold">{score}/{quiz.questions.length}</p>
                                    <p className="text-sm text-muted-foreground">Skor</p>
                                </div>
                                <div className="p-4 bg-background rounded-lg shadow-sm">
                                    <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
                                    <p className="text-2xl font-bold">{score}</p>
                                    <p className="text-sm text-muted-foreground">Doğru</p>
                                </div>
                                <div className="p-4 bg-background rounded-lg shadow-sm">
                                    <XCircle className="h-8 w-8 mx-auto text-destructive mb-2" />
                                    <p className="text-2xl font-bold">{quiz.questions.length - score}</p>
                                    <p className="text-sm text-muted-foreground">Yanlış</p>
                                </div>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold mt-12">Cevap Anahtarı</h3>
                         {quiz.questions.map((q, index) => {
                             const userAnswer = answers[q.id];
                             const userOptionIndex = q.options.indexOf(userAnswer);
                             const userOptionLetter = userAnswer ? getOptionLetter(userOptionIndex) : "Boş";
                             const isCorrect = userOptionLetter === q.correctAnswer;

                             return (
                                <div key={q.id} className={`p-4 border-l-4 rounded-r-lg ${isCorrect ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
                                    <p className="font-semibold text-lg mb-4">{index + 1}. {q.questionText}</p>
                                     <div className="space-y-2">
                                        {q.options.map((option, i) => {
                                            const optionLetter = getOptionLetter(i);
                                            const isCorrectAnswer = optionLetter === q.correctAnswer;
                                            const isUserAnswer = userAnswer === option;
                                            return (
                                                 <div key={i} className={`flex items-center gap-2 p-2 rounded-md ${isCorrectAnswer ? 'bg-green-500/20' : ''} ${isUserAnswer && !isCorrectAnswer ? 'bg-red-500/20' : ''}`}>
                                                     {isCorrectAnswer ? <CheckCircle className="h-5 w-5 text-green-600"/> : isUserAnswer ? <XCircle className="h-5 w-5 text-red-600"/> : <div className="h-5 w-5"/>}
                                                    <span className={`${isCorrectAnswer ? 'font-bold' : ''}`}>{optionLetter}) {option}</span>
                                                </div>
                                            )
                                        })}
                                     </div>
                                      <p className="mt-4 text-sm font-medium">Sizin Cevabınız: <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>{userOptionLetter}</span> - Doğru Cevap: <span className="text-green-600">{q.correctAnswer}</span></p>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-center">
                 <Button onClick={!submitted ? handleSubmit : resetQuiz} size="lg" disabled={Object.keys(answers).length !== quiz.questions.length && !submitted}>
                     {submitted ? <><Repeat className="mr-2 h-4 w-4"/>Tekrar Çöz</> : 'Testi Bitir'}
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
}
