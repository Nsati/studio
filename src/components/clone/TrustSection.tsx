'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function TrustSection() {
  return (
    <section className="py-24 bg-[#F8FAFC]">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-[#0A0A0A] text-center mb-20">
          Why travellers trust Pickyourtrail
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
          {[
            { 
              title: "Customisation", 
              desc: "Personalise every element of your holiday to make it yours.",
              icon: "🎨" 
            },
            { 
              title: "Expertise", 
              desc: "1000+ travel experts who craft itineraries based on real data.",
              icon: "🛡️" 
            },
            { 
              title: "Service", 
              desc: "On-trip 24/7 concierge support to handle all your needs.",
              icon: "⚡" 
            }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-center space-y-6"
            >
              <div className="h-20 w-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto text-4xl">
                {item.icon}
              </div>
              <h3 className="text-xl font-black text-[#0A0A0A]">{item.title}</h3>
              <p className="text-gray-500 font-medium leading-relaxed max-w-xs mx-auto">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Testimonial */}
        <div className="max-w-4xl mx-auto bg-white p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 h-2 w-full bg-[#A3E635]" />
          <p className="text-xl md:text-2xl font-bold italic text-gray-700 leading-relaxed mb-8">
            &quot;...he ensured that we visited all the important places and had a smooth experience overall. The customisation was perfect!&quot;
          </p>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-[#A3E635] flex items-center justify-center font-black">GD</div>
            <div>
              <p className="font-black text-[#0A0A0A]">Giridhar Dorai Anirwin Prem</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Vietnam Trip • Oct 2024</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
