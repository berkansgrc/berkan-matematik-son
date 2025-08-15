
'use server';
/**
 * @fileOverview A quiz generation AI agent.
 *
 * - generateQuiz - A function that handles the quiz generation process.
 * - QuizInput - The input type for the generateQuiz function.
 * - Quiz - The return type for the generateQuiz function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit/zod';

// Define Zod schemas for structured input and output

const QuizInputSchema = z.object({
  topic: z.string().describe('The specific topic for the quiz (e.g., "Fractions", "Algebraic Expressions").'),
  grade: z.string().describe('The grade level for the quiz (e.g., "5. Sınıf", "LGS Hazırlık").'),
  prompt: z.string().optional().describe('Optional additional instructions for the AI (e.g., "Make questions more focused on problem-solving.").'),
});

const QuestionSchema = z.object({
  questionText: z.string().describe('The text of the quiz question.'),
  options: z.array(z.string()).length(4).describe('An array of four possible answers.'),
  correctAnswer: z.enum(['A', 'B', 'C', 'D']).describe('The letter corresponding to the correct answer.'),
});

const QuizOutputSchema = z.object({
  questions: z.array(QuestionSchema).length(5).describe('An array of 5 quiz questions.'),
});


// Export types for use in the application
export type QuizInput = z.infer<typeof QuizInputSchema>;
export type Quiz = z.infer<typeof QuizOutputSchema>;

// Define the Genkit prompt
const quizPrompt = ai.definePrompt({
  name: 'quizPrompt',
  input: { schema: QuizInputSchema },
  output: { schema: QuizOutputSchema },
  prompt: `
    You are an expert mathematics teacher in Turkey. Generate a 5-question multiple-choice quiz.

    Instructions:
    1.  The quiz must be in TURKISH.
    2.  The topic of the quiz is: {{{topic}}}.
    3.  The target grade level is: {{{grade}}}.
    4.  Create 5 multiple-choice questions.
    5.  Each question must have 4 options (A, B, C, D).
    6.  The questions should be appropriate for the specified grade level's curriculum in Turkey.
    7.  Ensure there is only one correct answer for each question.
    8.  Vary the question types (e.g., calculations, word problems, definitions).
    {{#if prompt}}
    9.  Follow these additional instructions: {{{prompt}}}
    {{/if}}

    Return the output in the specified JSON format. Do not include any extra text or explanations.
    `,
});


// Define the Genkit flow
const quizFlow = ai.defineFlow(
  {
    name: 'quizFlow',
    inputSchema: QuizInputSchema,
    outputSchema: QuizOutputSchema,
  },
  async (input) => {
    const { output } = await quizPrompt(input);
    if (!output) {
      throw new Error('AI failed to generate a quiz. Please try again.');
    }
    return output;
  }
);


// Export a wrapper function to be called from the server-side
export async function generateQuiz(input: QuizInput): Promise<Quiz> {
  return await quizFlow(input);
}

