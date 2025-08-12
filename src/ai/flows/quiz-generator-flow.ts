
'use server';
/**
 * @fileOverview Bir matematik konusu için AI tabanlı bir quiz üretici.
 *
 * - generateQuiz - Belirtilen konu ve sınıf seviyesi için bir test oluşturan fonksiyon.
 * - QuizInput - generateQuiz fonksiyonu için giriş tipi.
 * - QuizOutput - generateQuiz fonksiyonu için dönüş tipi.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Zod şemaları, giriş ve çıkış verilerinin yapısını tanımlar.
const QuizInputSchema = z.object({
  topic: z.string().describe('Testin oluşturulacağı matematik konusu.'),
  grade: z.string().describe('Testin hedeflediği sınıf seviyesi (örn: 5. Sınıf, LGS Hazırlık).'),
  prompt: z.string().optional().describe('Quiz oluşturma için ek talimatlar.'),
});
export type QuizInput = z.infer<typeof QuizInputSchema>;

const QuestionSchema = z.object({
    questionText: z.string().describe("Sorunun metni."),
    options: z.array(z.string()).length(4).describe("Soru için 4 adet seçenek. Örn: ['15', '20', '25', '30']"),
    correctAnswer: z.enum(["A", "B", "C", "D"]).describe("Doğru olan seçeneğin harfi (A, B, C, veya D).")
});

const QuizOutputSchema = z.object({
  questions: z.array(QuestionSchema).length(5).describe('Konuyla ilgili 5 adet çoktan seçmeli soru.'),
});
export type Quiz = z.infer<typeof QuizOutputSchema>;


// Bu, dışa aktarılan ve istemci tarafından çağrılacak olan ana fonksiyondur.
export async function generateQuiz(input: QuizInput): Promise<Quiz> {
  return generateQuizFlow(input);
}

// Genkit prompt'u, AI modeline ne yapacağını söyleyen şablondur.
const quizPrompt = ai.definePrompt({
  name: 'quizGeneratorPrompt',
  input: { schema: QuizInputSchema },
  output: { schema: QuizOutputSchema },
  prompt: `
    Sen, {{grade}} seviyesindeki öğrenciler için matematik testleri hazırlayan uzman bir öğretmensin.
    
    Aşağıdaki konuyla ilgili, 5 soruluk, her biri 4 seçenekli (A, B, C, D) bir çoktan seçmeli test hazırla.
    
    Konu: {{{topic}}}
    
    Her soru için, sorunun metnini, dört adet seçeneği ve doğru cevabın harfini (A, B, C veya D) belirt.
    Soruların zorluk seviyesi {{grade}} düzeyine uygun olmalıdır. Çıktıyı istenen JSON formatında sağla.

    {{#if prompt}}
    Ek Talimatlar:
    {{{prompt}}}
    {{/if}}
  `,
});

// Genkit flow'u, bir veya daha fazla adımı (prompt'lar, araçlar vb.) yönetir.
const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: QuizInputSchema,
    outputSchema: QuizOutputSchema,
  },
  async (input) => {
    const { output } = await quizPrompt(input);
    if (!output) {
      throw new Error("AI modeli bir yanıt döndürmedi.");
    }
    return output;
  }
);
