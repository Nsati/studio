import React from 'react';
import { Mountain } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center h-10 w-10 group cursor-pointer", className)}>
      {/* Animated Glowing Ring on Hover */}
      <div className="absolute inset-0 bg-accent/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-110" />
      
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full relative z-10 transition-transform duration-500 group-hover:scale-105"
      >
        {/* Modern Northern Harrier Node Icon */}
        <rect x="10" y="10" width="80" height="80" rx="20" fill="hsl(var(--primary))" className="transition-all duration-500 group-hover:fill-primary" />
        <path
          d="M30 45L50 70L70 45"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-500 group-hover:translate-y-1"
        />
        <circle cx="50" cy="35" r="6" fill="hsl(var(--accent))" className="animate-pulse" />
      </svg>
      
      {/* Visual Identity reinforcement */}
      <div className="sr-only">Northern Harrier Logo</div>
    </div>
  );
}
