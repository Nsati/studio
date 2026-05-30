import React from 'react';

export function Logo() {
  return (
    <div className="relative flex items-center justify-center h-12 w-12 group">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full transition-transform duration-700 group-hover:rotate-12"
      >
        {/* Background Circle with depth */}
        <circle cx="50" cy="50" r="45" fill="white" fillOpacity="0.1" stroke="white" strokeWidth="0.5" />
        
        {/* Abstract Mountain Shape (Forest Green) */}
        <path
          d="M20 70L50 25L80 70H20Z"
          fill="hsl(var(--accent))"
          className="transition-all duration-700 group-hover:fill-white"
        />
        
        {/* The 'T' in Tripzy incorporated as paths */}
        <path
          d="M35 35H65M50 35V75"
          stroke="white"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Energy Sparkle */}
        <circle cx="75" cy="25" r="5" fill="white" className="animate-pulse" />
      </svg>
    </div>
  );
}