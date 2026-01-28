import React from 'react';

export function Logo() {
  return (
    <div className="flex items-center justify-center bg-primary h-8 w-8 rounded-lg text-primary-foreground">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m8 3 4 8 5-5 5 15H2Z" />
        </svg>
    </div>
  );
}
