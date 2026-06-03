import React from 'react';

export function Logo() {
  return (
    <div className="relative flex items-center justify-center h-10 w-10 group">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        {/* Modern Tripzy Stylized Icon */}
        <rect x="10" y="20" width="80" height="60" rx="20" fill="hsl(var(--primary))" />
        <path
          d="M30 40L50 65L70 40"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="50" cy="35" r="5" fill="white" />
      </svg>
    </div>
  );
}