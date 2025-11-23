'use server';

/**
 * @fileOverview A flow for providing personalized feedback on interview performance.
 *
 * - providePersonalizedFeedback - A function that generates personalized feedback on interview performance.
 * - ProvidePersonalizedFeedbackInput - The input type for the providePersonalizedFeedback function.
 * - ProvidePersonalizedFeedbackOutput - The return type for the providePersonalizedFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvidePersonalizedFeedbackInputSchema = z.object({
  interviewTranscript: z
    .string()
    .describe('The transcript of the mock interview, including questions and answers.'),
  selectedRole: z.string().describe('The job role the user selected for the mock interview.'),
  performanceAssessment: z
    .string()
    .describe('The AI assessment of the interview, detailing strengths and weaknesses.'),
});
export type ProvidePersonalizedFeedbackInput = z.infer<typeof ProvidePersonalizedFeedbackInputSchema>;

const ProvidePersonalizedFeedbackOutputSchema = z.object({
  personalizedFeedback: z
    .string()
    .describe('Personalized feedback on the interview performance, including areas for improvement and relevant best practices.'),
});
export type ProvidePersonalizedFeedbackOutput = z.infer<typeof ProvidePersonalizedFeedbackOutputSchema>;

export async function providePersonalizedFeedback(
  input: ProvidePersonalizedFeedbackInput
): Promise<ProvidePersonalizedFeedbackOutput> {
  return providePersonalizedFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'providePersonalizedFeedbackPrompt',
  input: {schema: ProvidePersonalizedFeedbackInputSchema},
  output: {schema: ProvidePersonalizedFeedbackOutputSchema},
  prompt: `You are an expert career coach providing personalized feedback on mock job interviews.

  Based on the interview transcript, selected role, and AI performance assessment, provide actionable feedback to the user.

  Interview Transcript: {{{interviewTranscript}}}
  Selected Role: {{{selectedRole}}}
  Performance Assessment: {{{performanceAssessment}}}

  IMPORTANT: Structure the feedback exactly as follows, keeping it concise and using markdown for formatting.

  Start with a brief, encouraging opening sentence.

  Then, provide 2-3 key feedback points. For each point, use this format:
  ### **[Feedback Area Title]**
  A 1-2 sentence summary of the feedback.
  *   **Best Practice:** A short, actionable tip.

  End with a short, motivational closing sentence.
  `,
});

const providePersonalizedFeedbackFlow = ai.defineFlow(
  {
    name: 'providePersonalizedFeedbackFlow',
    inputSchema: ProvidePersonalizedFeedbackInputSchema,
    outputSchema: ProvidePersonalizedFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
