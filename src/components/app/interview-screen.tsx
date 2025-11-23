'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { generateDynamicFollowUpQuestions } from '@/ai/flows/generate-dynamic-follow-up-questions';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import type { InterviewEntry, InterviewRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, Loader, Mic, MicOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

const MAX_QUESTIONS = 5;

// SpeechRecognition API might not be available on all browsers
const SpeechRecognition =
  (typeof window !== 'undefined' && window.SpeechRecognition) ||
  (typeof window !== 'undefined' && (window as any).webkitSpeechRecognition);

interface InterviewScreenProps {
  role: InterviewRole;
  onInterviewFinish: (history: InterviewEntry[]) => void;
}

export default function InterviewScreen({ role, onInterviewFinish }: InterviewScreenProps) {
  const [history, setHistory] = useState<InterviewEntry[]>([]);
  const [interviewState, setInterviewState] = useState<'questioning' | 'closing'>('questioning');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const initialQuestionAsked = useRef(false);

  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const questionCount = history.filter(entry => entry.speaker === 'ai' && entry.isQuestion).length;

  // Function to play audio from a data URI
  const playAudio = (audioDataUri: string) => {
    return new Promise<void>((resolve, reject) => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const newAudio = new Audio(audioDataUri);
      audioRef.current = newAudio;
      setIsAiSpeaking(true);
      newAudio.play().catch(e => {
        console.error("Audio play failed:", e);
        // Don't reject here, as we want the flow to continue.
        // The user can still read the text.
        setIsAiSpeaking(false);
        resolve();
      });
      newAudio.onended = () => {
        setIsAiSpeaking(false);
        resolve();
      };
      newAudio.onerror = (e) => {
        console.error("Error playing audio:", e);
        setIsAiSpeaking(false);
        // Don't reject, just resolve.
        resolve();
      }
    });
  };

  // Function to ask a question (TTS)
  const askQuestion = async (text: string, isQuestion: boolean = true) => {
    // Show text immediately
    setHistory(prev => [...prev, { speaker: 'ai', text, isQuestion }]);
    
    // Generate and play audio in the background
    try {
      const { audio } = await textToSpeech(text);
      await playAudio(audio);
    } catch (error) {
      console.error('Error with TTS:', error);
      toast({ variant: 'destructive', title: 'Could not generate audio question.' });
    } finally {
        // After AI finishes speaking (or fails), start listening for the user's answer
        if (interviewState === 'questioning' || (interviewState === 'closing' && !/goodbye/i.test(text))) {
            startListening();
        }
    }
  };

  // Initial greeting
  useEffect(() => {
    if (!initialQuestionAsked.current) {
      initialQuestionAsked.current = true;
      const initialGreeting = `Hello! Thanks for coming in today. Let's start the interview for the ${role} position. Tell me a bit about yourself and why you're interested in this role.`;
      startTransition(() => {
        askQuestion(initialGreeting);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  // Speech Recognition setup
  useEffect(() => {
    if (!SpeechRecognition) {
      toast({ title: "Your browser doesn't support voice recognition.", variant: 'destructive' });
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join('');
      setCurrentAnswer(transcript);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech' || event.error === 'aborted') {
        stopListening(true);
        return;
      }
      console.error('Speech recognition error:', event.error);
      toast({ title: 'Speech recognition error', description: event.error, variant: 'destructive' });
      stopListening(false);
    };
    
    recognition.onend = () => {
      if (isListening) {
        stopListening(true);
      }
    };

    recognitionRef.current = recognition;

    return () => {
        if(recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);


  const startListening = () => {
    if (isAiSpeaking || isPending || isListening) return;
    setIsListening(true);
    setCurrentAnswer('');
    try {
        recognitionRef.current?.start();
    } catch(e) {
        // Could be "Invalid state" if it's already started.
        console.error("Could not start recognition", e);
    }
  };

  const stopListening = (shouldProcessAnswer: boolean) => {
    if (!isListening) return;
    setIsListening(false);
    recognitionRef.current?.stop();

    const finalAnswer = currentAnswer; // Capture currentAnswer before it's cleared
    if (shouldProcessAnswer && finalAnswer.trim()) {
      handleSendAnswer(finalAnswer);
    }
  };


  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [history]);
  
  const handleSendAnswer = async (answer: string) => {
    if (!answer.trim()) return;

    // Special case for exiting
    if (interviewState === 'closing' && /exit/i.test(answer)) {
      onInterviewFinish([...history, { speaker: 'user', text: answer }]);
      return;
    }

    const newHistory: InterviewEntry[] = [...history, { speaker: 'user', text: answer }];
    setHistory(newHistory);
    setCurrentAnswer('');

    let nextState = interviewState;
    if (interviewState === 'questioning' && questionCount >= MAX_QUESTIONS) {
      nextState = 'closing';
      setInterviewState('closing');
    }

    startTransition(async () => {
      try {
        const lastQuestion = newHistory.findLast(entry => entry.speaker === 'ai')?.text;
        if (!lastQuestion) throw new Error("Could not find the last question.");
        
        let promptText: string;

        if (nextState === 'closing' && interviewState === 'questioning') {
            // This is the transition from questioning to closing
            promptText = `That was my last question. Thank you for your responses. Do you have any questions for me about the interview process? You can say "exit" at any time to finish.`;
        } else {
            const result = await generateDynamicFollowUpQuestions({
                previousQuestion: lastQuestion,
                userAnswer: answer,
                jobRole: role,
                interviewState: nextState,
            });
            promptText = result.followUpQuestion;
        }

        // If the AI says goodbye, end the interview
        if (/goodbye/i.test(promptText)) {
            setHistory(prev => [...prev, { speaker: 'ai', text: promptText, isQuestion: false }]);
            onInterviewFinish([...newHistory, { speaker: 'ai', text: promptText, isQuestion: false }]);
            return;
        }

        await askQuestion(promptText, nextState === 'questioning');

      } catch (error) {
        console.error('Error generating follow-up question:', error);
        toast({
          variant: 'destructive',
          title: 'An error occurred',
          description: 'Failed to get a response from the AI.',
        });
        // Graceful recovery
        if(nextState === 'questioning'){
            await askQuestion("I'm sorry, I seem to have encountered an issue. Let's move to the next question. What is your greatest strength?", true);
        } else {
            await askQuestion("I'm sorry, I couldn't process that. Could you repeat, or say 'exit' to finish?", false);
        }
      }
    });
  };

  const isInterviewOver = interviewState === 'closing' && history.some(e => /my last question/i.test(e.text));

  return (
    <Card className="w-full h-full flex flex-col animate-fade-in">
      <CardContent className="p-6 flex-1 flex flex-col gap-4">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold">Mock Interview: {role}</h2>
          {interviewState === 'questioning' ? (
             <p className="text-muted-foreground">Question {Math.min(questionCount, MAX_QUESTIONS)} of {MAX_QUESTIONS}. Good luck!</p>
          ) : (
            <p className="text-muted-foreground">The interview has concluded. You may ask follow-up questions or say "exit".</p>
          )}
        </div>
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {history.map((entry, index) => (
              <div key={index} className={cn('flex items-start gap-4', entry.speaker === 'user' && 'justify-end')}>
                {entry.speaker === 'ai' && (
                  <Avatar className="w-10 h-10 border-2 border-primary">
                    <AvatarFallback><Bot /></AvatarFallback>
                  </Avatar>
                )}
                <div className={cn('max-w-[75%] rounded-lg p-3 text-sm', entry.speaker === 'ai' ? 'bg-muted' : 'bg-primary text-primary-foreground')}>
                  <p className="whitespace-pre-wrap">{entry.text}</p>
                </div>
                {entry.speaker === 'user' && (
                  <Avatar className="w-10 h-10 border-2 border-accent">
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {currentAnswer && isListening && (
               <div className={'flex items-start gap-4 justify-end'}>
                <div className={cn('max-w-[75%] rounded-lg p-3 text-sm bg-primary text-primary-foreground opacity-70')}>
                  <p className="whitespace-pre-wrap">{currentAnswer}</p>
                </div>
                <Avatar className="w-10 h-10 border-2 border-accent">
                  <AvatarFallback><User /></AvatarFallback>
                </Avatar>
              </div>
            )}
            {isPending && (
              <div className="flex items-start gap-4">
                <Avatar className="w-10 h-10 border-2 border-primary">
                  <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
                <div className="max-w-[75%] rounded-lg p-3 bg-muted flex items-center gap-2">
                  <Loader className="animate-spin w-4 h-4" />
                  <span className="text-sm text-muted-foreground italic">
                    Thinking...
                  </span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="mt-auto pt-4 border-t flex flex-col items-center gap-4">
          <Button
            size="lg"
            className={cn("rounded-full w-20 h-20", isListening && "bg-destructive hover:bg-destructive/90")}
            onClick={() => {
              if (isListening) {
                stopListening(true);
              } else {
                startListening();
              }
            }}
            disabled={isPending || isAiSpeaking}
          >
            {isListening ? <MicOff size={32} /> : <Mic size={32} />}
          </Button>
          {isInterviewOver && (
             <div className="text-center text-muted-foreground">
                <p>Say "exit" to finish the interview and get your feedback.</p>
              </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
