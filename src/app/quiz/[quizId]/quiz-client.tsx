
'use client';

import { useState, useMemo } from 'react';
import type { Quiz, Question } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Award, Target, BookCopy } from 'lucide-react';
import Confetti from 'react-dom-confetti';

type QuizClientProps = {
  quiz: Quiz;
};

type AnswerState = 'unanswered' | 'correct' | 'incorrect';

export function QuizClient({ quiz }: QuizClientProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  const handleAnswerSelect = (questionId: string, option: string) => {
    if (isFinished) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    setIsFinished(true);
    const score = scoreDetails.correct;
    const total = quiz.questions.length;
    if ((score / total) >= 0.7) { // Confetti for 70% or more correct
        setShowConfetti(true);
    }
  };
  
  const handleRestart = () => {
      setIsFinished(false);
      setSelectedAnswers({});
      setCurrentQuestionIndex(0);
      setShowConfetti(false);
  }

  const scoreDetails = useMemo(() => {
    if (!isFinished) return { correct: 0, incorrect: 0, total: quiz.questions.length };
    
    let correct = 0;
    quiz.questions.forEach(q => {
      const selectedOption = selectedAnswers[q.id];
      const correctOptionLetter = q.correctAnswer;
      const correctOptionIndex = correctOptionLetter.charCodeAt(0) - 65;
      const correctOptionText = q.options[correctOptionIndex];
      
      if (selectedOption === correctOptionText) {
        correct++;
      }
    });

    return {
      correct,
      incorrect: quiz.questions.length - correct,
      total: quiz.questions.length,
    };
  }, [isFinished, selectedAnswers, quiz.questions]);
  
  const getAnswerState = (question: Question, option: string): AnswerState => {
      if (!isFinished) return 'unanswered';
      
      const correctOptionLetter = question.correctAnswer;
      const correctOptionIndex = correctOptionLetter.charCodeAt(0) - 65;
      const correctOptionText = question.options[correctOptionIndex];
      
      const selectedOption = selectedAnswers[question.id];

      if (option === correctOptionText) return 'correct';
      if (option === selectedOption && option !== correctOptionText) return 'incorrect';
      
      return 'unanswered';
  }

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center">
        <Confetti active={showConfetti} config={{
            angle: 90,
            spread: 360,
            startVelocity: 40,
            elementCount: 100,
            decay: 0.9,
        }}/>
        <Card className="w-full max-w-2xl text-center">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                <Award className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-3xl">Test Tamamlandı!</CardTitle>
            <CardDescription>İşte sonucun:</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-lg">
                <div className="p-4 bg-green-100/60 rounded-lg">
                    <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-6 h-6 text-green-700" />
                        <span className="font-bold">Doğru</span>
                    </div>
                    <p className="text-3xl font-bold">{scoreDetails.correct}</p>
                </div>
                 <div className="p-4 bg-red-100/60 rounded-lg">
                    <div className="flex items-center justify-center gap-2">
                        <XCircle className="w-6 h-6 text-red-700" />
                        <span className="font-bold">Yanlış</span>
                    </div>
                    <p className="text-3xl font-bold">{scoreDetails.incorrect}</p>
                </div>
            </div>
             <div className="p-4 bg-blue-100/60 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                    <Target className="w-6 h-6 text-blue-700" />
                    <span className="font-bold">Başarı</span>
                </div>
                <p className="text-3xl font-bold">%{((scoreDetails.correct / scoreDetails.total) * 100).toFixed(0)}</p>
            </div>

            <div className="text-left pt-6">
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2"><BookCopy className="w-5 h-5"/> Cevap Anahtarı</h3>
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                    {quiz.questions.map((q, index) => (
                        <div key={q.id} className="p-3 rounded-md bg-muted/50">
                            <p className="font-semibold">{index + 1}. {q.questionText}</p>
                            <div className="mt-2 space-y-1">
                                {q.options.map((opt, i) => {
                                    const state = getAnswerState(q, opt);
                                    return (
                                        <div key={i} className={`flex items-center gap-2 p-1 rounded-sm ${state === 'correct' ? 'bg-green-200/70' : ''} ${state === 'incorrect' ? 'bg-red-200/70 line-through' : ''}`}>
                                            {state === 'correct' && <CheckCircle className="w-4 h-4 text-green-800" />}
                                            {state === 'incorrect' && <XCircle className="w-4 h-4 text-red-800" />}
                                            <span className={`${state !== 'unanswered' ? 'font-semibold' : ''}`}>{String.fromCharCode(65 + i)}) {opt}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button onClick={handleRestart}>Tekrar Çöz</Button>
            <Button variant="outline" asChild><Link href="/">Ana Sayfaya Dön</Link></Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
            <CardTitle>Soru {currentQuestionIndex + 1} / {quiz.questions.length}</CardTitle>
            <Progress value={progress} className="w-full mt-2" />
        </CardHeader>
        <CardContent className="min-h-[300px]">
            <p className="text-lg md:text-xl font-semibold mb-6">{currentQuestion.questionText}</p>
            <RadioGroup
                value={selectedAnswers[currentQuestion.id]}
                onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
                className="space-y-4"
            >
                {currentQuestion.options.map((option, index) => (
                    <Label key={index} className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-accent has-[input:checked]:bg-accent has-[input:checked]:border-accent-foreground">
                        <RadioGroupItem value={option} id={`${currentQuestion.id}-${index}`} />
                        <span className="text-base">{String.fromCharCode(65 + index)}) {option}</span>
                    </Label>
                ))}
            </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                Önceki Soru
            </Button>
            {currentQuestionIndex < quiz.questions.length - 1 ? (
                <Button onClick={handleNext}>
                    Sonraki Soru
                </Button>
            ) : (
                <Button onClick={handleFinish} disabled={Object.keys(selectedAnswers).length !== quiz.questions.length}>
                    Testi Bitir
                </Button>
            )}
        </CardFooter>
    </Card>
  );
}
