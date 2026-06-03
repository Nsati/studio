'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Star } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative h-[85vh] w-full flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <video 
        autoPlay 
        muted 
        loop 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="https://player.vimeo.com/external/434045526.sd.mp4?s=c27dc3699705027c11f581056489814560950d11&profile_id=164&oauth2_token_id=57447761" type="video/mp4" />
      </video>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent z-10" />

      {/* Content */}
      <div className="container relative z-20 px-6 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <span className="inline-block text-[10px] md:text-xs font-black uppercase tracking-[0.3em] bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full">
            Custom International Holiday Packages
          </span>
          
          <div className="flex items-center justify-center gap-2 text-sm font-bold text-gray-200">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
            </div>
            <span>4.6 From 8250+ reviews</span>
          </div>

          <h1 className="text-4xl md:text-7xl font-black leading-tight tracking-tight">
            Create your <br className="hidden md:block" /> sooper hit holiday
          </h1>

          {/* Search Hub */}
          <div className="max-w-3xl mx-auto mt-12 bg-white rounded-full p-2 flex items-center shadow-2xl overflow-hidden">
            <div className="flex items-center gap-4 px-6 flex-1">
              <Search className="text-gray-400" size={24} />
              <input 
                type="text" 
                placeholder="Search countries, cities..." 
                className="w-full h-12 bg-transparent text-gray-800 font-bold focus:outline-none placeholder:text-gray-300"
              />
            </div>
            <button className="bg-[#A3E635] hover:bg-[#8fd12c] text-black font-black px-10 h-14 rounded-full transition-all active:scale-95 shadow-lg">
              Let&apos;s Go
            </button>
          </div>

          <p className="mt-8 text-white/70 text-sm font-bold uppercase tracking-widest">
            Trusted by 50,000+ Happy Travelers
          </p>
        </motion.div>
      </div>
    </section>
  );
}
