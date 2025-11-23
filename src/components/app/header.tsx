import { Briefcase } from 'lucide-react';

export default function Header() {
  return (
    <header className="w-full border-b border-border/50 bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Briefcase className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Ace the Interview</h1>
        </div>
      </div>
    </header>
  );
}
