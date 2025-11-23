'use client';

import { useState, useEffect, useTransition } from 'react';
import { assessInterviewPerformance } from '@/ai/flows/assess-interview-performance';
import type { AssessInterviewPerformanceOutput } from '@/ai/flows/assess-interview-performance';
import { providePersonalizedFeedback } from '@/ai/flows/provide-personalized-feedback';
import type { InterviewEntry, InterviewRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, MessageSquareQuote, RefreshCw, Star, BrainCircuit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Badge } from '@/components/ui/badge';

interface FeedbackScreenProps {
  role: InterviewRole;
  interviewHistory: InterviewEntry[];
  onRestart: () => void;
}

export default function FeedbackScreen({ role, interviewHistory, onRestart }: FeedbackScreenProps) {
  const [assessment, setAssessment] = useState<AssessInterviewPerformanceOutput['assessment'] | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    startTransition(async () => {
      try {
        // Step 1: Assess performance
        const questionsAndAnswers = interviewHistory
          .filter(entry => entry.speaker === 'user')
          .map((userEntry, index) => {
            const questionEntry = interviewHistory.slice(0, interviewHistory.indexOf(userEntry)).reverse().find(q => q.speaker === 'ai');
            return {
              question: questionEntry?.text || 'N/A',
              answer: userEntry.text,
            };
          });

        const assessmentResult = await assessInterviewPerformance({
          role,
          questionsAndAnswers,
        });
        setAssessment(assessmentResult.assessment);

        // Step 2: Get personalized feedback
        const transcript = interviewHistory.map(e => `${e.speaker === 'ai' ? 'Interviewer' : 'You'}: ${e.text}`).join('\n');
        const feedbackResult = await providePersonalizedFeedback({
          interviewTranscript: transcript,
          selectedRole: role,
          performanceAssessment: JSON.stringify(assessmentResult.assessment),
        });
        setFeedback(feedbackResult.personalizedFeedback);

      } catch (error) {
        console.error('Error getting feedback:', error);
        toast({
          variant: 'destructive',
          title: 'An error occurred',
          description: 'Failed to generate your interview feedback. Please try again later.',
        });
      }
    });
  }, [interviewHistory, role, toast]);

  const chartData = assessment ? [
    { name: "Communication", score: assessment.scores.communication },
    { name: "Technical", score: assessment.scores.technical },
    { name: "Overall", score: assessment.scores.overall },
  ] : [];

  const chartConfig = {
    score: {
      label: "Score",
      color: "hsl(var(--primary))",
    },
  };

  if (isPending || !assessment || !feedback) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
        <Loader className="w-16 h-16 animate-spin text-primary mb-6" />
        <h2 className="text-3xl font-bold text-foreground">Analyzing Your Performance...</h2>
        <p className="mt-2 text-lg text-muted-foreground">Our AI is preparing your personalized feedback. This may take a moment.</p>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in-up space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Your Interview Feedback</h2>
         <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Here's a breakdown of your performance for the {role} role.
        </p>
        {assessment.summary && (
          <Badge className="mt-4 text-lg" variant={
            assessment.summary.toLowerCase() === 'excellent' || assessment.summary.toLowerCase() === 'good'
            ? 'default' : 'destructive'
          }>
            {assessment.summary}
          </Badge>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <BrainCircuit className="w-8 h-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">Performance Dashboard</CardTitle>
                <CardDescription>A visual summary of your scores.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
             <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} stroke="" />
                <YAxis domain={[0, 10]} stroke="" />
                <RechartsTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="score" fill="var(--color-score)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <BrainCircuit className="w-8 h-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">Personalized Coaching</CardTitle>
                <CardDescription>Actionable advice to help you improve.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-foreground whitespace-pre-wrap prose-sm prose-p:my-2 prose-ul:my-2">{feedback}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
             <div className="flex items-center gap-3">
              <MessageSquareQuote className="w-8 h-8 text-accent" />
              <div>
                <CardTitle>Communication Skills</CardTitle>
                 <CardDescription>Clarity, conciseness, and engagement.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground whitespace-pre-wrap prose-sm prose-p:my-2 prose-ul:my-2">{assessment.communicationSkills}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
             <div className="flex items-center gap-3">
              <BrainCircuit className="w-8 h-8 text-accent" />
               <div>
                <CardTitle>Technical Knowledge</CardTitle>
                 <CardDescription>Expertise and application of concepts.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground whitespace-pre-wrap prose-sm prose-p:my-2 prose-ul:my-2">{assessment.technicalKnowledge}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-accent" />
              <div>
                <CardTitle>Overall Performance</CardTitle>
                <CardDescription>Strengths and weaknesses highlight.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground whitespace-pre-wrap prose-sm prose-p:my-2 prose-ul:my-2">{assessment.overallPerformance}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
             <div className="flex items-center gap-3">
              <RefreshCw className="w-8 h-8 text-accent" />
              <div>
                <CardTitle>Areas for Improvement</CardTitle>
                <CardDescription>Actionable recommendations.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              {assessment.areasForImprovement.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

      </div>
      <div className="text-center pt-6">
        <Button size="lg" onClick={onRestart}>
          <RefreshCw className="mr-2 h-5 w-5" />
          Practice Again
        </Button>
      </div>
    </div>
  );
}
