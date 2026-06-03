'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className={`text-2xl font-black tracking-tighter ${isScrolled ? 'text-[#0A0A0A]' : 'text-white'}`}>
            pickyourtrail
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          <div className="group relative cursor-pointer">
            <button className={`flex items-center gap-1 font-bold text-sm transition-colors ${isScrolled ? 'text-gray-700 hover:text-[#A3E635]' : 'text-white/90 hover:text-[#A3E635]'}`}>
              Explore Destinations <ChevronDown size={16} />
            </button>
            <div className="absolute top-full left-0 hidden group-hover:block w-48 bg-white shadow-xl rounded-lg py-2 mt-2 border border-gray-100">
              <Link href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#A3E635]">Europe</Link>
              <Link href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#A3E635]">Asia</Link>
              <Link href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#A3E635]">Maldives</Link>
            </div>
          </div>
          
          <div className="group relative cursor-pointer">
            <button className={`flex items-center gap-1 font-bold text-sm transition-colors ${isScrolled ? 'text-gray-700 hover:text-[#A3E635]' : 'text-white/90 hover:text-[#A3E635]'}`}>
              Holiday Tour Packages <ChevronDown size={16} />
            </button>
          </div>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          <Link 
            href="/login" 
            className={`font-bold text-sm transition-colors ${isScrolled ? 'text-gray-700 hover:text-[#A3E635]' : 'text-white/90 hover:text-[#A3E635]'}`}
          >
            Login
          </Link>
          
          {/* Hamburger Mobile */}
          <button 
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className={isScrolled ? 'text-[#0A0A0A]' : 'text-white'} size={28} />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-white lg:hidden p-8"
          >
            <div className="flex justify-between items-center mb-12">
              <span className="text-2xl font-black text-[#0A0A0A]">pickyourtrail</span>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X size={32} className="text-[#0A0A0A]" />
              </button>
            </div>
            
            <nav className="flex flex-col gap-8">
              <Link href="#" className="text-xl font-bold text-[#0A0A0A] flex justify-between">Explore Destinations <ChevronDown /></Link>
              <Link href="#" className="text-xl font-bold text-[#0A0A0A] flex justify-between">Holiday Packages <ChevronDown /></Link>
              <Link href="/login" className="text-xl font-bold text-[#A3E635]">Login</Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
