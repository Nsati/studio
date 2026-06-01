import React from 'react';

export function Logo() {
  return (
    <div className="relative flex items-center justify-center h-12 w-12 group">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full transition-transform duration-700 group-hover:scale-110"
      >
        {/* Outer Circular Path */}
        <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.5" className="text-white/20" />
        <circle cx="50" cy="50" r="45" stroke="hsl(var(--accent))" strokeWidth="1" strokeDasharray="4 4" />
        
        {/* Mountain Silhouette */}
        <path
          d="M15 75L35 40L55 65L75 35L90 75H15Z"
          fill="white"
          fillOpacity="0.1"
        />
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
          className="drop-shadow-lg"
        >
          NH
        </text>

        {/* Soaring Eagle (Northern Harrier) Silhouette */}
        <path
          d="M10 30C25 25 40 35 50 45C60 35 75 25 90 30C80 35 70 45 50 65C30 45 20 35 10 30Z"
          fill="hsl(var(--accent))"
          className="animate-pulse"
        />
        
        {/* Plane path curve from image */}
        <path
          d="M30 80C60 80 85 60 90 20"
          stroke="white"
          strokeWidth="1"
          strokeLinecap="round"
          strokeOpacity="0.3"
        />
      </svg>
    </div>
  );
}
