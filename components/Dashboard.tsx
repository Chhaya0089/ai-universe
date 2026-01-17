
import React, { useState } from 'react';
import { AppView } from '../types';
import { Icons } from '../constants';

interface DashboardProps {
  onNavigate: (view: AppView) => void;
}

type Category = 'All' | 'Creative' | 'Productivity' | 'Business';

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [activeFilter, setActiveFilter] = useState<Category>('All');

  const tools = [
    {
      id: AppView.ASSISTANT,
      title: "Assistant",
      description: "Deep reasoning engine with Google Search grounding and Map intelligence for pinpoint accuracy.",
      icon: <Icons.Chat />,
      color: "from-blue-600 to-indigo-600",
      tag: "Gemini 3 Pro",
      categories: ['Productivity']
    },
    {
      id: AppView.STUDIO,
      title: "Creative Studio",
      description: "Generate 4K images and cinematic videos via Veo 3.1. Includes intelligent object removal and filters.",
      icon: <Icons.Creative />,
      color: "from-purple-600 to-pink-600",
      tag: "Vision Engine",
      categories: ['Creative']
    },
    {
      id: AppView.VOICE,
      title: "Vocal Live",
      description: "Real-time, ultra-low latency audio conversation. Zero-lag human-like vocal interaction.",
      icon: <Icons.Voice />,
      color: "from-emerald-500 to-teal-600",
      tag: "Native Audio",
      categories: ['Business']
    },
    {
      id: AppView.WRITER,
      title: "Content Engine",
      description: "High-converting SEO blogs, email copy, and headlines powered by fast-response flash models.",
      icon: <Icons.Chat />,
      color: "from-orange-500 to-amber-600",
      tag: "Fast Copy",
      categories: ['Productivity', 'Business']
    },
    {
      id: AppView.SOCIAL,
      title: "Social Planner",
      description: "Generate viral hooks, reel scripts, and post captions optimized for modern social algorithms.",
      icon: <Icons.Creative />,
      color: "from-sky-500 to-blue-600",
      tag: "Viral AI",
      categories: ['Business', 'Creative']
    },
    {
      id: AppView.ECOMMERCE,
      title: "E-commerce Hub",
      description: "Automated product descriptions, titles, and simulated product photography adjustments.",
      icon: <Icons.Insights />,
      color: "from-rose-500 to-red-600",
      tag: "Seller Tools",
      categories: ['Business']
    }
  ];

  const filteredTools = activeFilter === 'All' 
    ? tools 
    : tools.filter(tool => tool.categories.includes(activeFilter as any));

  const filterButtons: Category[] = ['All', 'Creative', 'Productivity', 'Business'];

  return (
    <div className="p-10 md:p-16 lg:p-24 h-full overflow-y-auto bg-[#0a0a0a] selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
        
        {/* Header */}
        <div className="space-y-6">
          <div className="inline-block px-5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-[0.4em]">
            Central Command
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight">
            The <span className="gradient-text">Unified</span> Hub.
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl font-medium leading-relaxed">
            Access every advanced Gemini model from one glass terminal. Zero context switching, maximum creation.
          </p>
        </div>

        {/* Filter UI */}
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest mr-2">Filter By:</span>
          {filterButtons.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
                activeFilter === cat 
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-xl shadow-indigo-600/30 translate-y-[-2px]' 
                  : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tool Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onNavigate(tool.id)}
              className="group relative glass p-10 rounded-[3rem] text-left border border-white/5 hover:border-indigo-500/30 transition-all duration-700 hover:-translate-y-4 shadow-xl animate-in fade-in zoom-in duration-500"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-700 rounded-[3rem]`}></div>
              
              <div className="flex justify-between items-start mb-10">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  {tool.icon}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">{tool.tag}</span>
                </div>
              </div>

              <h3 className="text-2xl font-black text-white mb-4 tracking-tight group-hover:text-indigo-400 transition-colors">{tool.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed font-medium mb-12 h-12 overflow-hidden line-clamp-2">{tool.description}</p>

              <div className="flex items-center gap-3 text-white text-[10px] font-black uppercase tracking-widest group-hover:gap-6 transition-all duration-500">
                <span>Access Terminal</span>
                <div className="w-10 h-[1px] bg-white/20 group-hover:bg-indigo-500 group-hover:w-16 transition-all duration-500"></div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer Stats */}
        <div className="pt-20 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-10">
           {[
             { label: 'Intelligence Pipeline', value: 'Gemini v3.0 Ultra' },
             { label: 'Response Latency', value: '< 240ms Global' },
             { label: 'Infrastructure', value: 'Edge-First SaaS' }
           ].map(stat => (
             <div key={stat.label} className="space-y-1">
               <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.3em]">{stat.label}</span>
               <p className="text-sm font-bold text-gray-400">{stat.value}</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
