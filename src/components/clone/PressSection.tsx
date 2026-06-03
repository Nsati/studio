'use client';

import React from 'react';

export default function PressSection() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6 text-center">
        <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 mb-8">
          WHAT THE PRESS SAYS
        </h4>

        <div className="max-w-3xl mx-auto space-y-10">
          <p className="text-2xl md:text-4xl font-black tracking-tight text-[#0A0A0A] leading-tight">
            &quot;PickYourTrail is also carving a niche for itself in this space and intends to become one-stop shop for personalised vacation&quot;
          </p>
          
          <div className="flex flex-col items-center gap-2">
            <span className="text-xl font-black text-gray-800 uppercase tracking-tighter">YourStory</span>
            <span className="text-xs font-bold text-gray-400">Jun 08, 2019</span>
          </div>

          <a href="#" className="inline-block text-xs font-black uppercase tracking-widest text-[#A3E635] hover:text-black transition-colors border-b-2 border-[#A3E635] pb-1">
            Read more on Yourstory
          </a>
        </div>
      </div>
    </section>
  );
}
