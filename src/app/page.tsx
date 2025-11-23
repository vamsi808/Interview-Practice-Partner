'use client';

import { useState } from 'react';
import type { InterviewEntry, InterviewRole } from '@/lib/types';
import RoleSelection from '@/components/app/role-selection';
import InterviewScreen from '@/components/app/interview-screen';
import FeedbackScreen from '@/components/app/feedback-screen';

type AppStep = 'role-selection' | 'interview' | 'feedback';

export default function Home() {
  const [step, setStep] = useState<AppStep>('role-selection');
  const [selectedRole, setSelectedRole] = useState<InterviewRole>('');
  const [interviewHistory, setInterviewHistory] = useState<InterviewEntry[]>([]);

  const handleRoleSelect = (role: InterviewRole) => {
    setSelectedRole(role);
    setStep('interview');
  };

  const handleInterviewFinish = (history: InterviewEntry[]) => {
    setInterviewHistory(history);
    setStep('feedback');
  };

  const handleRestart = () => {
    setSelectedRole('');
    setInterviewHistory([]);
    setStep('role-selection');
  };

  const renderStep = () => {
    switch (step) {
      case 'interview':
        return <InterviewScreen role={selectedRole!} onInterviewFinish={handleInterviewFinish} />;
      case 'feedback':
        return <FeedbackScreen role={selectedRole!} interviewHistory={interviewHistory} onRestart={handleRestart} />;
      case 'role-selection':
      default:
        return <RoleSelection onRoleSelect={handleRoleSelect} />;
    }
  };

  return (
    <div className="w-full max-w-4xl flex-1 flex flex-col">
      {renderStep()}
    </div>
  );
}
