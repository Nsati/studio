import React from 'react';

export function Logo() {
  return (
    <div className="relative flex items-center justify-center h-10 w-10">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        {/* Background Circle with slight tilt */}
        <circle cx="50" cy="50" r="45" fill="hsl(var(--primary))" fillOpacity="0.1" />
        
        {/* T Shape Minimalistic */}
        <path
          d="M35 30H65M50 30V70"
          stroke="hsl(var(--primary))"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Orange Paper Plane (representing the 'i' or movement) */}
        <g transform="translate(55, 25) rotate(-15)">
          <path
            d="M0 0L25 10L10 12L12 25L0 0Z"
            fill="hsl(var(--accent))"
          />
          <path
            d="M10 12L25 10"
            stroke="white"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </g>
        
        {/* Journey Path Curve */}
        <path
          d="M20 80C35 70 65 70 80 80"
          stroke="hsl(var(--accent))"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="2 6"
        />
      </svg>
    </div>
  );
}
