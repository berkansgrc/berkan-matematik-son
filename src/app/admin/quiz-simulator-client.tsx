
'use client';

import { useState, useMemo, useCallback } from 'react';
import { generateQuiz, type Quiz as AIGeneratedQuiz } from '@/ai/flows/quiz-generator-flow';
import type { CourseData, GradeSlug, Quiz, Resource, Subject } from '@/lib/data';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Wand2, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Textarea } from '@/components/ui/textarea';
import { grades } from '@/lib/data';

type QuizSimulatorClientProps = {
    courseData: CourseData;
}

const COURSE_COLLECTION = 'courseData';
const SINGLE_DOCUMENT_ID = 'allGrades';
const QUIZZES_COLLECTION = 'quizzes';

export function QuizSimulatorClient({ courseData: initialCourseData }: QuizSimulatorClientProps) {
  const [topic, setTopic] = useState('');
  const [prompt, setPrompt] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<GradeSlug | ''>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<AIGeneratedQuiz | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  // We manage the course data in state to allow optimistic updates
  const [courseData, setCourseData] = useState<CourseData>(initialCourseData);

  const subjectsForSelectedGrade = useMemo(() => {
    if (!selectedGrade || !courseData) return [];
    return courseData[selectedGrade].subjects;
  }, [selectedGrade, courseData]);

  const handleGenerateQuiz = async () => {
    if (!topic || !selectedGrade || !courseData) {
        setError("Lütfen bir konu başlığı girin ve bir sınıf seçin.");
        return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedQuiz(null);
    try {
        const gradeName = courseData[selectedGrade].name;
        const result = await generateQuiz({ topic, grade: gradeName, prompt });
        if (!result || !result.questions || result.questions.length === 0) {
            throw new Error("Yapay zeka bir test üretemedi. Lütfen konuyu daha spesifik hale getirin.");
        }
        setGeneratedQuiz(result);
    } catch (err: any) {
        setError(err.message || "Test üretilirken bir hata oluştu.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleSaveQuiz = async () => {
    if (!generatedQuiz || !selectedGrade || !selectedSubject || !courseData) {
        toast({ title: "Hata", description: "Kaydedilecek test, sınıf veya konu bulunamadı.", variant: "destructive"});
        return;
    }
    setIsSaving(true);

    const subjectData = subjectsForSelectedGrade.find(s => s.id === selectedSubject);
    if (!subjectData) {
        toast({ title: "Hata", description: "Seçilen ders konusu bulunamadı.", variant: "destructive"});
        setIsSaving(false);
        return;
    }

    const quizToSave: Quiz = {
        id: uuidv4(),
        title: `${topic} Testi`,
        grade: courseData[selectedGrade].name,
        subject: subjectData.title,
        questions: generatedQuiz.questions.map(q => ({...q, id: uuidv4()})),
        createdAt: new Date().toISOString(),
    };
    
    const quizResource: Resource = {
        id: quizToSave.id,
        title: quizToSave.title,
        url: `/quiz/${quizToSave.id}`,
        createdAt: quizToSave.createdAt,
    };

    try {
        // 1. Save the quiz to its own collection
        const quizDocRef = doc(db, QUIZZES_COLLECTION, quizToSave.id);
        
        // 2. Add the resource link to the course data document
        const courseDocRef = doc(db, COURSE_COLLECTION, SINGLE_DOCUMENT_ID);

        // We could use a batch write here for atomicity
        await setDoc(quizDocRef, quizToSave);
        // To be safer, we should read the document first, but for this operation, we assume we can just append.
        const courseDocSnap = await getDoc(courseDocRef);
        if (!courseDocSnap.exists()) throw new Error('Ana ders dökümanı bulunamadı.');

        const currentCourseData = courseDocSnap.data() as CourseData;
        const gradeData = currentCourseData[selectedGrade];
        const subjectIndex = gradeData.subjects.findIndex((s: Subject) => s.id === selectedSubject);
        if (subjectIndex === -1) {
            throw new Error(`Ders konusu (ID: ${selectedSubject}) ${selectedGrade} sınıfında bulunamadı.`);
        }
        
        const updatedApplications = [...(gradeData.subjects[subjectIndex].applications || []), quizResource];
        
        await updateDoc(courseDocRef, {
            [`${selectedGrade}.subjects.${subjectIndex}.applications`]: updatedApplications
        });

        // Optimistic UI update
        setCourseData(prevData => {
            const newData = JSON.parse(JSON.stringify(prevData));
            const gradeToUpdate = newData[selectedGrade];
            const subjectToUpdate = gradeToUpdate.subjects.find((s: Subject) => s.id === selectedSubject);
            if(subjectToUpdate) {
                if(!subjectToUpdate.applications) subjectToUpdate.applications = [];
                subjectToUpdate.applications.push(quizResource);
            }
            return newData;
        });

        toast({
            title: "Başarılı!",
            description: `Test başarıyla kaydedildi ve "${subjectData.title}" konusunun uygulamalar bölümüne eklendi.`,
        });

        // Reset state
        setGeneratedQuiz(null);
        setTopic('');
        setPrompt('');
        
    } catch (err: any) {
        console.error("Quiz save error:", err);
        toast({ title: "Kaydetme Hatası", description: err.message || "Bilinmeyen bir hata oluştu.", variant: "destructive"});
    } finally {
        setIsSaving(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Quiz Simülatörü</CardTitle>
        <CardDescription>Bir konu girin, sınıf ve dersi seçin, yapay zeka sizin için bir test oluştursun.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="topic">Konu Başlığı (Test Adı)</Label>
            <Input 
                id="topic" 
                placeholder="Örn: Kesirlerle Toplama İşlemi" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading || isSaving}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="grade">Sınıf</Label>
            <Select 
                value={selectedGrade} 
                onValueChange={(value) => {
                    setSelectedGrade(value as GradeSlug);
                    setSelectedSubject(''); // Reset subject when grade changes
                }}
                disabled={isLoading || isSaving}
            >
              <SelectTrigger id="grade">
                <SelectValue placeholder="Sınıf seçin" />
              </SelectTrigger>
              <SelectContent>
                {grades.map(grade => (
                  <SelectItem key={grade.slug} value={grade.slug}>{grade.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-2">
            <Label htmlFor="prompt">Ek Talimatlar (İsteğe Bağlı)</Label>
            <Textarea
                id="prompt"
                placeholder="Örn: Sorular daha çok problem çözme odaklı olsun. Bir soru mutlaka denklem içersin."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading || isSaving}
                className="min-h-[100px]"
            />
        </div>
        {selectedGrade && (
             <div className="grid gap-2">
                <Label htmlFor="subject">Ders Konusu (Testin Ekleneceği Yer)</Label>
                <Select
                    value={selectedSubject}
                    onValueChange={(value) => setSelectedSubject(value)}
                    disabled={isLoading || isSaving || subjectsForSelectedGrade.length === 0}
                >
                <SelectTrigger id="subject">
                    <SelectValue placeholder={subjectsForSelectedGrade.length > 0 ? "Ders konusu seçin" : "Bu sınıf için ders konusu yok"} />
                </SelectTrigger>
                <SelectContent>
                    {subjectsForSelectedGrade.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>{subject.title}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
        )}

        <Button onClick={handleGenerateQuiz} disabled={isLoading || isSaving || !topic || !selectedGrade}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
          AI ile Test Oluştur
        </Button>

        {error && (
            <div className="flex items-center gap-2 text-destructive border border-destructive/50 bg-destructive/10 p-3 rounded-md">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">{error}</p>
            </div>
        )}

        {generatedQuiz && (
            <div className="border-t pt-6">
                <h3 className="text-xl font-bold mb-4">Oluşturulan Test Önizlemesi</h3>
                <div className="space-y-6">
                    {generatedQuiz.questions.map((q, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-muted/50">
                            <p className="font-semibold">{index + 1}. {q.questionText}</p>
                            <ul className="mt-2 space-y-1 list-inside">
                                {q.options.map((opt, i) => {
                                    const optionLetter = String.fromCharCode(65 + i);
                                    const isCorrect = optionLetter === q.correctAnswer;
                                    return (
                                        <li key={i} className={`flex items-center gap-2 ${isCorrect ? 'font-bold text-green-700' : ''}`}>
                                           {isCorrect && <CheckCircle className="h-4 w-4" />} 
                                           <span>{optionLetter}) {opt}</span>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    ))}
                </div>
                 <Button 
                    onClick={handleSaveQuiz} 
                    disabled={isSaving || !selectedSubject}
                    className="w-full mt-6"
                >
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Testi Kaydet ve Yayınla
                </Button>
                 {!selectedSubject && <p className="text-center text-sm text-muted-foreground mt-2">Testi kaydetmek için bir ders konusu seçmelisiniz.</p>}
            </div>
        )}
      </CardContent>
    </Card>
  );
}

    