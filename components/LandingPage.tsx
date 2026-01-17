
import React from 'react';
import { AppView } from '../types';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center selection:bg-indigo-500/30 font-sans">
      {/* Navigation Header */}
      <nav className="w-full h-24 px-12 flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#6366f1] rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <div className="w-4 h-4 bg-white/40 rounded-sm"></div>
          </div>
          <span className="text-xl font-black tracking-tighter text-white">Kayya21</span>
        </div>
        
        <div className="hidden md:flex items-center gap-12">
          {['FEATURES', 'INTELLIGENCE', 'SAAS HUB', 'PRICING'].map(item => (
            <a key={item} href="#" className="text-[11px] font-bold text-gray-400 hover:text-white transition-colors tracking-[0.15em]">{item}</a>
          ))}
        </div>

        <button 
          onClick={onStart} 
          className="px-8 py-2.5 bg-white text-black rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-gray-200 transition-all duration-300 shadow-xl"
        >
          GET ACCESS
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1400px] px-12 py-6 flex flex-col items-center justify-center relative">
        {/* Cinematic Preview Card */}
        <div className="w-full aspect-[21/10] relative rounded-[3rem] overflow-hidden group shadow-[0_0_100px_rgba(99,102,241,0.05)] border border-white/10">
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] via-[#4c1d95] to-[#0ea5e9] opacity-90 transition-transform duration-1000 group-hover:scale-105">
            {/* Wavy shape overlays */}
            <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,#f59e0b,transparent_50%)]"></div>
            </div>
            
            {/* Wavy Content Overlay - SVG or Canvas would be better, but we can use CSS gradients for high-fidelity waves */}
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.4)_100%)]"></div>
            
            {/* The Wavy Pattern (Approximate representation of screenshot) */}
            <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 1000 1000" preserveAspectRatio="none">
               <path d="M0,500 C200,300 400,700 600,500 C800,300 1000,700 1000,500 L1000,1000 L0,1000 Z" fill="#6366f1" opacity="0.3"></path>
               <path d="M0,600 C150,450 350,750 500,600 C650,450 850,750 1000,600 L1000,1000 L0,1000 Z" fill="#8b5cf6" opacity="0.4"></path>
               <path d="M0,700 C250,600 450,850 650,700 C850,550 1000,800 1000,700 L1000,1000 L0,1000 Z" fill="#0ea5e9" opacity="0.2"></path>
            </svg>
          </div>

          {/* Central Play Badge */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="glass px-12 py-8 rounded-[2rem] flex flex-col items-center gap-4 border border-white/20 shadow-2xl backdrop-blur-md">
              <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center border border-white/20 transition-transform duration-500 group-hover:scale-110">
                <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.3em] text-center">CINEMATIC VEO ENGINE PREVIEW</span>
            </div>
          </div>

          {/* Subtle Outer Glow */}
          <div className="absolute inset-0 rounded-[3rem] border border-white/10 pointer-events-none group-hover:border-white/20 transition-colors shadow-[inset_0_0_40px_rgba(255,255,255,0.05)]"></div>
        </div>

        {/* Bottom Decorative Element */}
        <div className="mt-16 w-1 h-1 bg-[#8b5cf6] rounded-full shadow-[0_0_10px_#8b5cf6]"></div>
      </main>

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-purple-600/5 blur-[150px] rounded-full"></div>
      </div>
    </div>
  );
};

export default LandingPage;
