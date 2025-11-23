'use server';

/**
 * @fileOverview An AI agent that assesses interview performance based on responses.
 *
 * - assessInterviewPerformance - A function that handles the interview performance assessment process.
 * - AssessInterviewPerformanceInput - The input type for the assessInterviewPerformance function.
 * - AssessInterviewPerformanceOutput - The return type for the assessInterviewPerformance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessInterviewPerformanceInputSchema = z.object({
  role: z.string().describe('The job role for the interview (e.g., software engineer, sales manager).'),
  questionsAndAnswers: z.array(
    z.object({
      question: z.string().describe('The interview question asked.'),
      answer: z.string().describe('The interviewee\'s response to the question.'),
    })
  ).describe('An array of interview questions and the corresponding answers.'),
});
export type AssessInterviewPerformanceInput = z.infer<typeof AssessInterviewPerformanceInputSchema>;

const PerformanceAssessmentSchema = z.object({
  summary: z.string().describe('A single word summarizing the performance (e.g., Excellent, Good, Average, Needs Improvement).'),
  communicationSkills: z.string().describe('Assessment of communication skills as 2-3 concise bullet points.'),
  technicalKnowledge: z.string().describe('Assessment of technical knowledge and expertise as 2-3 concise bullet points.'),
  overallPerformance: z.string().describe('Overall assessment of the interviewee\'s performance as 2-3 concise bullet points highlighting strengths and weaknesses.'),
  areasForImprovement: z.array(z.string()).describe('Specific areas for improvement with actionable recommendations, as a list of bullet points.'),
  scores: z.object({
    communication: z.number().min(0).max(10).describe('A score from 0-10 for communication skills.'),
    technical: z.number().min(0).max(10).describe('A score from 0-10 for technical knowledge.'),
    overall: z.number().min(0).max(10).describe('An overall score from 0-10 for performance.'),
  }).describe('Numerical scores for performance evaluation.'),
});

const AssessInterviewPerformanceOutputSchema = z.object({
  assessment: PerformanceAssessmentSchema.describe('The assessment of the interview performance.'),
});
export type AssessInterviewPerformanceOutput = z.infer<typeof AssessInterviewPerformanceOutputSchema>;

export async function assessInterviewPerformance(input: AssessInterviewPerformanceInput): Promise<AssessInterviewPerformanceOutput> {
  return assessInterviewPerformanceFlow(input);
}

const performanceRubricTool = ai.defineTool({
  name: 'performanceRubric',
  description: 'This tool provides a rubric for assessing interview performance based on communication skills, technical knowledge, and overall performance. Use this as a guide to construct the assessment.',
  inputSchema: z.object({
    communicationSkillsCriteria: z.string().describe('Criteria for evaluating communication skills.'),
    technicalKnowledgeCriteria: z.string().describe('Criteria for evaluating technical knowledge.'),
    overallPerformanceCriteria: z.string().describe('Criteria for overall performance assessment.'),
    areasForImprovementCriteria: z.string().describe('Criteria for providing areas for improvement.'),
  }),
  outputSchema: z.string(),
}, async (input) => {
  // This tool provides a static rubric for the LLM to use as a reference.
  return `Rubric Criteria:\nCommunication Skills: ${input.communicationSkillsCriteria}\nTechnical Knowledge: ${input.technicalKnowledgeCriteria}\nOverall Performance: ${input.overallPerformanceCriteria}\nAreas for Improvement: ${input.areasForImprovementCriteria}`;
});

const assessInterviewPerformancePrompt = ai.definePrompt({
  name: 'assessInterviewPerformancePrompt',
  input: {schema: AssessInterviewPerformanceInputSchema},
  output: {schema: AssessInterviewPerformanceOutputSchema},
  tools: [performanceRubricTool],
  prompt: `You are an AI-powered interview performance assessor. Your role is to evaluate a candidate's performance in a mock interview and provide constructive feedback.

Here's the job role the candidate was interviewing for: {{{role}}}

Here are the questions and answers from the interview:
{{#each questionsAndAnswers}}
Question: {{{question}}}
Answer: {{{answer}}}
{{/each}}

Use the 'performanceRubric' tool to get the rubric for assessing the performance. Then, provide an assessment based on communication skills, technical knowledge, and overall performance.

First, based on the overall score, provide a one-word summary of the performance (e.g., Excellent, Good, Average, Needs Improvement).

IMPORTANT: Keep all text-based assessments concise and use bullet points. For communication, technical, and overall performance, provide 2-3 brief bullet points. For areas for improvement, provide a list of bullet points.

Provide scores from 0-10 for communication, technical, and overall performance.

Output the assessment in the following JSON format:
{{outputSchema}}`,
});

const assessInterviewPerformanceFlow = ai.defineFlow(
  {
    name: 'assessInterviewPerformanceFlow',
    inputSchema: AssessInterviewPerformanceInputSchema,
    outputSchema: AssessInterviewPerformanceOutputSchema,
  },
  async input => {
    // Define the criteria for the performance rubric tool
    const rubricCriteria = {
      communicationSkillsCriteria: 'Clarity, conciseness, engagement, and active listening.',
      technicalKnowledgeCriteria: 'Depth of knowledge, accuracy, and practical application of concepts.',
      overallPerformanceCriteria: 'Confidence, problem-solving ability, and suitability for the role.',
      areasForImprovementCriteria: 'Specific, actionable steps for enhancing performance as a list of bullet points.',
    };

    // Call the performanceRubric tool to get the rubric
    await performanceRubricTool(rubricCriteria);

    const {output} = await assessInterviewPerformancePrompt(input);
    return output!;
  }
);
