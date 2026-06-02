import React from 'react';

export function Logo() {
  return (
    <div className="relative flex items-center justify-center h-12 w-12 group">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full transition-transform duration-1000 group-hover:scale-110"
      >
        {/* Outer Circular Path */}
        <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.5" className="text-primary/20" />
        <circle cx="50" cy="50" r="45" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeDasharray="4 8" className="animate-[spin_20s_linear_infinite]" />
        
        {/* Mountain Silhouette - Solid Base */}
        <path
          d="M15 75L35 40L55 65L75 35L90 75H15Z"
          fill="white"
          fillOpacity="0.05"
        />
        
        {/* Mountain Silhouette - Gold Accent */}
        <path
          d="M20 75L40 45L55 60L75 40L85 75H20Z"
          fill="hsl(var(--primary))"
          className="transition-all duration-700"
        />

        {/* NH Initials */}
        <text
          x="50"
          y="62"
          textAnchor="middle"
          fontSize="24"
          fontWeight="900"
          fill="white"
          fontFamily="serif"
          className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
        >
          NH
        </text>

        {/* Soaring Harrier (Eagle) Silhouette */}
        <path
          d="M10 30C25 25 40 35 50 45C60 35 75 25 90 30C80 35 70 45 50 65C30 45 20 35 10 30Z"
          fill="hsl(var(--primary))"
          className="animate-pulse"
        />
        
        {/* Top Arc */}
        <path
          d="M30 15C42.5 10 57.5 10 70 15"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}