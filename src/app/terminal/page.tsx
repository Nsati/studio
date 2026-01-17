'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Terminal as TerminalIcon } from 'lucide-react';

interface HistoryItem {
  type: 'command' | 'response';
  text: string;
}

export default function TerminalPage() {
  const [history, setHistory] = useState<HistoryItem[]>([
      { type: 'response', text: 'Welcome to the AI Terminal. Type a command to start.' }
  ]);
  const [input, setInput] = useState('');
  const endOfHistoryRef = useRef<HTMLDivElement>(null);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newHistory: HistoryItem[] = [...history, { type: 'command', text: input }];
    
    // Mock response for now
    const responseText = `Command received: "${input}". AI processing is not yet implemented.`;
    newHistory.push({ type: 'response', text: responseText });

    setHistory(newHistory);
    setInput('');
  };
  
  useEffect(() => {
    endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);


  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 md:px-6">
      <div className="flex items-center gap-4 mb-8">
        <TerminalIcon className="h-10 w-10" />
        <div>
            <h1 className="font-headline text-4xl font-bold">AI Terminal</h1>
            <p className="text-muted-foreground">An experimental interface to interact with the app's AI.</p>
        </div>
      </div>
      <div className="bg-black text-white font-mono text-sm rounded-lg p-4 h-96 overflow-y-auto">
        {history.map((item, index) => (
          <div key={index} className="flex gap-2">
            {item.type === 'command' && <span className="text-green-400">$</span>}
            <p className={item.type === 'command' ? 'text-green-400' : ''}>{item.text}</p>
          </div>
        ))}
        <div ref={endOfHistoryRef} />
      </div>
      <form onSubmit={handleCommand} className="mt-4">
        <div className="relative">
             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 font-mono">$</span>
            <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your command here..."
                className="bg-black text-green-400 font-mono pl-8 focus-visible:ring-offset-0 focus-visible:ring-green-500"
                autoFocus
            />
        </div>
      </form>
    </div>
  );
}
