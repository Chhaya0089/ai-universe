
import React, { useState, useEffect } from 'react';
import { AppView } from './types';
import { Icons } from './constants';
import Assistant from './components/Assistant';
import CreativeStudio from './components/CreativeStudio';
import VoiceLive from './components/VoiceLive';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import ContentWriter from './components/ContentWriter';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.LANDING);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      try {
        if (typeof (window as any).aistudio?.hasSelectedApiKey === 'function') {
          const hasKey = await (window as any).aistudio.hasSelectedApiKey();
          setHasApiKey(hasKey);
        } else {
          setHasApiKey(!!process.env.API_KEY);
        }
      } catch (e) {
        setHasApiKey(false);
      }
    };
    checkKey();

    const handlePermissionError = (event: any) => {
      setPermissionError(event.detail);
      setHasApiKey(false);
    };

    window.addEventListener('gemini-permission-error', handlePermissionError);
    return () => window.removeEventListener('gemini-permission-error', handlePermissionError);
  }, []);

  const handleOpenKeySelector = async () => {
    try {
      if (typeof (window as any).aistudio?.openSelectKey === 'function') {
        await (window as any).aistudio.openSelectKey();
        setHasApiKey(true);
        setPermissionError(null);
        setActiveView(AppView.DASHBOARD);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStart = () => {
    if (hasApiKey) {
      setActiveView(AppView.DASHBOARD);
    } else {
      handleOpenKeySelector();
    }
  };

  if (activeView === AppView.LANDING) {
    return <LandingPage onStart={handleStart} />;
  }

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <div className="max-w-md w-full glass p-10 rounded-[3rem] text-center space-y-8 shadow-3xl border border-white/10 animate-in fade-in zoom-in duration-300">
          <div className="w-24 h-24 bg-indigo-600/20 rounded-[2rem] mx-auto flex items-center justify-center border border-indigo-500/20">
            <div className={`w-10 h-10 border-4 ${permissionError ? 'border-red-500' : 'border-indigo-500'} rounded-lg animate-pulse`}></div>
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black tracking-tighter uppercase">Nexus Access</h1>
            {permissionError ? (
              <p className="text-red-400 text-xs font-bold tracking-widest uppercase">Billing Error: Permission Denied</p>
            ) : (
              <p className="text-gray-500 text-sm font-medium">To unlock Gemini 3.0 & Veo cinematic capabilities, link your billing-enabled API key.</p>
            )}
          </div>
          <button onClick={handleOpenKeySelector} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black tracking-[0.2em] uppercase hover:bg-indigo-700 transition shadow-2xl shadow-indigo-600/30">
            {permissionError ? 'RETRY HANDSHAKE' : 'CONNECT API KEY'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <nav className="w-20 md:w-72 border-r border-white/5 flex flex-col shrink-0 bg-[#080808] z-50">
        <div className="p-8">
          <button onClick={() => setActiveView(AppView.DASHBOARD)} className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/30 group-hover:rotate-12 transition duration-500">
              <div className="w-5 h-5 bg-white/30 rounded-sm"></div>
            </div>
            <span className="text-2xl font-black tracking-tighter hidden md:block">Nexus Kayya</span>
          </button>
        </div>

        <div className="flex-1 px-4 space-y-1.5 py-4 overflow-y-auto scrollbar-hide">
          <NavItem active={activeView === AppView.DASHBOARD} onClick={() => setActiveView(AppView.DASHBOARD)} icon={<Icons.Insights />} label="Global Hub" />
          <div className="h-px bg-white/5 mx-4 my-4"></div>
          
          <p className="hidden md:block px-5 text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-2">Core Engines</p>
          <NavItem active={activeView === AppView.ASSISTANT} onClick={() => setActiveView(AppView.ASSISTANT)} icon={<Icons.Chat />} label="Assistant" />
          <NavItem active={activeView === AppView.STUDIO} onClick={() => setActiveView(AppView.STUDIO)} icon={<Icons.Creative />} label="Creative Studio" />
          <NavItem active={activeView === AppView.VOICE} onClick={() => setActiveView(AppView.VOICE)} icon={<Icons.Voice />} label="Vocal Live" />
          
          <div className="h-px bg-white/5 mx-4 my-4"></div>
          
          <p className="hidden md:block px-5 text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-2">Business Suite</p>
          <NavItem active={activeView === AppView.WRITER} onClick={() => setActiveView(AppView.WRITER)} icon={<Icons.Chat />} label="Content Engine" />
          <NavItem active={activeView === AppView.SOCIAL} onClick={() => setActiveView(AppView.WRITER)} icon={<Icons.Creative />} label="Social Planner" />
          <NavItem active={activeView === AppView.ECOMMERCE} onClick={() => setActiveView(AppView.WRITER)} icon={<Icons.Insights />} label="E-commerce Tool" />
        </div>

        <div className="p-6 border-t border-white/5">
           <NavItem active={false} onClick={handleOpenKeySelector} icon={<Icons.Settings />} label="Security Settings" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#0a0a0a]">
        {activeView !== AppView.DASHBOARD && (
          <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-black/40 backdrop-blur-xl z-40">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">
              {activeView.replace('_', ' ')} Terminal
            </h2>
            <div className="flex items-center gap-6">
               <div className="hidden lg:flex flex-col items-end">
                 <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Pipeline Status</span>
                 <span className="text-xs text-green-400 font-bold">Encrypted Connection</span>
               </div>
               <button onClick={handleOpenKeySelector} className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center hover:bg-indigo-500/20 transition">
                  <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></div>
               </button>
            </div>
          </header>
        )}

        <div className="flex-1 overflow-hidden relative">
          {activeView === AppView.DASHBOARD && <Dashboard onNavigate={setActiveView} />}
          {activeView === AppView.ASSISTANT && <Assistant />}
          {activeView === AppView.STUDIO && <CreativeStudio />}
          {activeView === AppView.VOICE && <VoiceLive />}
          {activeView === AppView.WRITER && <ContentWriter />}
          {(activeView === AppView.SOCIAL || activeView === AppView.ECOMMERCE || activeView === AppView.MARKETING) && <ContentWriter />}
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition duration-500 group ${active ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/40 translate-x-1' : 'text-gray-500 hover:bg-white/5 hover:text-gray-200'}`}
  >
    <div className={`shrink-0 transition-all duration-500 ${active ? 'scale-110' : 'group-hover:scale-110 group-hover:text-indigo-400'}`}>
      {icon}
    </div>
    <span className="text-xs font-black uppercase tracking-widest hidden md:block whitespace-nowrap">{label}</span>
  </button>
);

export default App;
