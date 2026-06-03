import React from 'react';
import Navbar from '@/components/clone/Navbar';
import Hero from '@/components/clone/Hero';
import ItineraryGrid from '@/components/clone/ItineraryGrid';
import TrustSection from '@/components/clone/TrustSection';
import PressSection from '@/components/clone/PressSection';
import Footer from '@/components/clone/Footer';

export const metadata = {
  title: 'Custom International Holiday Packages | Pickyourtrail Clone',
  description: 'Plan your next international holiday with our custom itinerary builder. Trusted by 50,000+ travelers.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#A3E635] selection:text-black">
      <Navbar />
      
      <main>
        <Hero />
        
        {/* Statistics Strip */}
        <section className="bg-[#0A0A0A] py-10 overflow-hidden">
          <div className="container mx-auto px-6 flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:opacity-100 transition-opacity">
            <span className="font-black text-xl text-white uppercase tracking-tighter italic">Forbes</span>
            <span className="font-black text-xl text-white uppercase tracking-tighter italic">TechCrunch</span>
            <span className="font-black text-xl text-white uppercase tracking-tighter italic">CNBC</span>
            <span className="font-black text-xl text-white uppercase tracking-tighter italic">CNN Travel</span>
          </div>
        </section>

        <ItineraryGrid />
        
        <TrustSection />
        
        <PressSection />
        
        {/* Bottom CTA */}
        <section className="py-24 bg-[#A3E635] text-black text-center relative overflow-hidden">
          <div className="container relative z-10 px-6 space-y-8">
            <h2 className="text-4xl md:text-7xl font-black tracking-tight leading-none">
              Your sooper hit <br/> holiday starts here.
            </h2>
            <p className="text-xl font-bold max-w-lg mx-auto opacity-80">
              Build your custom itinerary in just 10 minutes and get expert help 24/7.
            </p>
            <button className="h-20 px-16 rounded-full bg-black text-white text-2xl font-black shadow-2xl active:scale-95 transition-all hover:bg-gray-900">
              Plan My Trip
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
