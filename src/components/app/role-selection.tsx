'use client';

import { useState } from 'react';
import type { InterviewRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight } from 'lucide-react';
import { Label } from '../ui/label';

interface RoleSelectionProps {
  onRoleSelect: (role: InterviewRole) => void;
}

export default function RoleSelection({ onRoleSelect }: RoleSelectionProps) {
  const [customRole, setCustomRole] = useState('');

  const handleStart = () => {
    if (customRole.trim()) {
      onRoleSelect(customRole.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in-up">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Interview Practice Partner
          </CardTitle>
          <CardDescription className="mt-4 text-lg text-muted-foreground">
            Enter the role or topic you want to practice for. Our AI will guide you through a tailored mock interview.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2 text-left">
            <Label htmlFor="role-input">Interview Role or Job Description</Label>
            <Input
              id="role-input"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleStart();
                }
              }}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleStart} className="w-full" disabled={!customRole.trim()}>
            Start Interview <ArrowRight className="ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
