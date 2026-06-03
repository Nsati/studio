'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ITINERARIES = [
  {
    id: 1,
    user: "j joby from Bengaluru",
    time: "2hr ago",
    title: "Family Escape: 4 Nights In Singapore",
    destinations: "Singapore (4N)",
    badge: "FAMILY",
    price: "₹61,098",
    detail: "4 nights / person",
    image: "https://picsum.photos/seed/singapore/400/300"
  },
  {
    id: 2,
    user: "R Raj from Bengaluru",
    time: "33m ago",
    title: "Family Holiday: 6 Nights In Vienna, Prague And Budapest",
    destinations: "Prague (2N) +2 more",
    badge: "FAMILY",
    price: "₹1,01,557",
    detail: "6 nights / person",
    image: "https://picsum.photos/seed/prague/400/300"
  },
  {
    id: 3,
    user: "N Naga from Hyderabad",
    time: "13hr ago",
    title: "Family Getaway: 4 Nights In Singapore",
    destinations: "Singapore (4N)",
    badge: "FAMILY",
    price: "₹39,753",
    detail: "4 nights / person",
    image: "https://picsum.photos/seed/sg2/400/300"
  },
  {
    id: 4,
    user: "S Srikanth from Hyderabad",
    time: "20hr ago",
    title: "Couple Holiday: 7 Nights In Sorrento, Rome And Milan",
    destinations: "Rome (1N) +3 more",
    badge: "COUPLE",
    price: "₹1,11,188",
    detail: "7 nights / person",
    image: "https://picsum.photos/seed/rome/400/300"
  }
];

const FILTERS = ["All Destinations", "Under ₹50K", "₹50K to ₹1.5L", "₹1.5L to ₹2.5L", "Luxury"];

export default function ItineraryGrid() {
  const [activeFilter, setActiveFilter] = useState("All Destinations");

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-[#0A0A0A]">
              Recently booked itineraries
            </h2>
            <span className="inline-flex items-center gap-2 text-sm font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full">
              ❤️ 143+ trips booked last week
            </span>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-3 mb-12">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                activeFilter === filter 
                ? 'bg-[#A3E635] text-black shadow-lg shadow-lime-100' 
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {ITINERARIES.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group cursor-pointer"
            >
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                <div className="relative aspect-[16/11]">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#A3E635] text-black text-[9px] font-black px-3 py-1.5 rounded-lg shadow-lg">
                      {item.badge}
                    </span>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-[10px] font-bold text-gray-400">
                    <span className="text-gray-800">{item.user}</span> • {item.time}
                  </p>
                  <h3 className="text-base font-black leading-tight text-[#0A0A0A] line-clamp-2 h-10">
                    {item.title}
                  </h3>
                  <div className="text-xs font-bold text-gray-500 bg-gray-50 p-2 rounded-lg flex items-center gap-2">
                    🌍 {item.destinations}
                  </div>
                  <div className="pt-4 border-t border-gray-50 flex justify-between items-baseline">
                    <div className="flex flex-col">
                      <span className="text-xl font-black text-[#0A0A0A]">{item.price}</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{item.detail}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
