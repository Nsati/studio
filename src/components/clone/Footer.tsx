import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-white pt-24 pb-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-20">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-8">
            <span className="text-3xl font-black tracking-tighter">pickyourtrail</span>
            <p className="text-gray-400 font-medium leading-relaxed max-w-sm">
              We help people discover, plan and book their next vacation. Whether it is a honeymoon, family trip or a soul-searching solo trip, we have you covered.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-8">
            <h5 className="text-sm font-black uppercase tracking-widest text-white">Plan Your Holiday</h5>
            <ul className="space-y-4 text-gray-400 text-sm font-bold">
              <li><Link href="#" className="hover:text-[#A3E635] transition-colors">International Packages</Link></li>
              <li><Link href="#" className="hover:text-[#A3E635] transition-colors">Destinations</Link></li>
              <li><Link href="#" className="hover:text-[#A3E635] transition-colors">Guides</Link></li>
            </ul>
          </div>

          <div className="space-y-8">
            <h5 className="text-sm font-black uppercase tracking-widest text-white">Support</h5>
            <ul className="space-y-4 text-gray-400 text-sm font-bold">
              <li><Link href="#" className="hover:text-[#A3E635] transition-colors">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-[#A3E635] transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-[#A3E635] transition-colors">Refund Status</Link></li>
            </ul>
          </div>

          <div className="space-y-8">
            <h5 className="text-sm font-black uppercase tracking-widest text-white">Policies</h5>
            <ul className="space-y-4 text-gray-400 text-sm font-bold">
              <li><Link href="#" className="hover:text-[#A3E635] transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-[#A3E635] transition-colors">Terms of Use</Link></li>
              <li><Link href="#" className="hover:text-[#A3E635] transition-colors">Cancellation Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            © 2026 Pickyourtrail clone. All rights reserved.
          </p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
            <span className="hover:text-[#A3E635] cursor-pointer transition-colors">Instagram</span>
            <span className="hover:text-[#A3E635] cursor-pointer transition-colors">YouTube</span>
            <span className="hover:text-[#A3E635] cursor-pointer transition-colors">Twitter</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
