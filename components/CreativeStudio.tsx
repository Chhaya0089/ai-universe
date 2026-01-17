
import React, { useState } from 'react';
import { generateImage, editImage, generateVideo } from '../services/geminiService';
import { fileToBase64 } from '../services/audioUtils';
import { ASPECT_RATIOS, IMAGE_SIZES } from '../constants';

const CreativeStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [attachment, setAttachment] = useState<{ base64: string; url: string; type: string } | null>(null);

  // Configs
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [videoAspect, setVideoAspect] = useState<'16:9' | '9:16'>('16:9');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      const url = URL.createObjectURL(file);
      setAttachment({ base64, url, type: file.type });
    }
  };

  const processRequest = async () => {
    if (!prompt.trim() && !attachment) return;
    setIsLoading(true);
    setResult(null);

    try {
      if (activeTab === 'image') {
        if (attachment) {
          const url = await editImage(prompt, attachment.base64, attachment.type);
          setResult({ url, type: 'image' });
        } else {
          const url = await generateImage(prompt, { aspectRatio, imageSize });
          setResult({ url, type: 'image' });
        }
      } else {
        const url = await generateVideo(prompt, { 
          aspectRatio: videoAspect, 
          imageBase64: attachment?.base64, 
          mimeType: attachment?.type 
        });
        setResult({ url, type: 'video' });
      }
    } catch (error) {
      console.error(error);
      alert("Generation failed. High quality generation requires a billing-enabled API key.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto bg-[#0a0a0a]">
      <div className="flex flex-col xl:flex-row gap-8 max-w-[1600px] mx-auto w-full">
        {/* Sidebar Controls */}
        <div className="w-full xl:w-[400px] shrink-0 space-y-6">
          <div className="glass p-1.5 rounded-2xl flex gap-1 shadow-2xl">
            <button 
              onClick={() => setActiveTab('image')} 
              className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition duration-300 ${activeTab === 'image' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5'}`}
            >
              Image Engine
            </button>
            <button 
              onClick={() => setActiveTab('video')} 
              className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition duration-300 ${activeTab === 'video' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5'}`}
            >
              Veo Video
            </button>
          </div>

          <div className="glass rounded-[2rem] p-6 space-y-6 border border-white/5 shadow-2xl">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">Creative Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={activeTab === 'image' ? "Describe the scene, style, lighting, and composition..." : "Describe the motion, camera movement, and evolution of the scene..."}
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-indigo-500/50 min-h-[140px] resize-none transition-all"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">
                {activeTab === 'image' ? 'Reference Image' : 'Start Frame'}
              </label>
              <div className="relative group">
                <input type="file" onChange={handleFileUpload} className="hidden" id="studio-upload" accept="image/*" />
                <label htmlFor="studio-upload" className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all duration-300 ${attachment ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/10 bg-white/5 hover:border-indigo-500/30'}`}>
                  {attachment ? (
                    <div className="relative w-full aspect-square max-h-40">
                      <img src={attachment.url} className="w-full h-full object-contain rounded-lg" alt="Preview" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-lg">
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Change Image</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                      </div>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Upload Content</span>
                    </>
                  )}
                </label>
              </div>
              {attachment && activeTab === 'image' && (
                <p className="mt-2 text-[10px] text-indigo-400 font-medium tracking-wide">Image detected. Gemini will perform an <strong>EDIT</strong> generation.</p>
              )}
            </div>

            {activeTab === 'image' ? (
              <div className="space-y-6 pt-4 border-t border-white/5">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-3 font-black uppercase tracking-widest">Aspect Ratio</label>
                  <div className="grid grid-cols-4 gap-2">
                    {ASPECT_RATIOS.map(r => (
                      <button 
                        key={r} 
                        onClick={() => setAspectRatio(r)} 
                        className={`py-2 text-[10px] font-bold rounded-lg border transition-all duration-200 ${aspectRatio === r ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-lg shadow-indigo-600/10' : 'border-white/5 text-gray-500 hover:bg-white/5'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-3 font-black uppercase tracking-widest">Image Fidelity</label>
                  <div className="grid grid-cols-3 gap-2">
                    {IMAGE_SIZES.map(s => (
                      <button 
                        key={s} 
                        onClick={() => setImageSize(s as any)} 
                        className={`py-2 text-[10px] font-bold rounded-lg border transition-all duration-200 ${imageSize === s ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-lg shadow-indigo-600/10' : 'border-white/5 text-gray-500 hover:bg-white/5'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 pt-4 border-t border-white/5">
                <label className="block text-[10px] text-gray-500 mb-3 font-black uppercase tracking-widest">Video Dimension</label>
                <div className="flex gap-2">
                  <button onClick={() => setVideoAspect('16:9')} className={`flex-1 py-3 text-[10px] font-bold rounded-lg border transition-all ${videoAspect === '16:9' ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-lg shadow-indigo-600/10' : 'border-white/5 text-gray-500 hover:bg-white/5'}`}>LANDSCAPE (16:9)</button>
                  <button onClick={() => setVideoAspect('9:16')} className={`flex-1 py-3 text-[10px] font-bold rounded-lg border transition-all ${videoAspect === '9:16' ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-lg shadow-indigo-600/10' : 'border-white/5 text-gray-500 hover:bg-white/5'}`}>PORTRAIT (9:16)</button>
                </div>
              </div>
            )}

            <button
              onClick={processRequest}
              disabled={isLoading || (!prompt && !attachment)}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs tracking-[0.2em] uppercase shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:grayscale"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </div>
              ) : (
                `Create ${activeTab === 'image' ? (attachment ? 'Edit' : 'Art') : 'Video'}`
              )}
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="glass rounded-[3rem] overflow-hidden min-h-[600px] flex items-center justify-center relative bg-black/60 border border-white/5 shadow-inner">
            {result ? (
              result.type === 'image' ? (
                <div className="w-full h-full p-8 flex items-center justify-center">
                  <img src={result.url} className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain animate-in fade-in zoom-in duration-500" alt="Generated" />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center p-8">
                  <video src={result.url} controls autoPlay loop className="max-w-full max-h-full rounded-2xl shadow-2xl animate-in fade-in duration-500" />
                </div>
              )
            ) : (
              <div className="flex flex-col items-center gap-6 text-center p-12 max-w-sm">
                <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center transform -rotate-12 border border-white/10">
                  <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight uppercase">Awaiting Inspiration</h3>
                  <p className="text-sm text-gray-500 mt-3 leading-relaxed font-medium">Your creations will appear here in high fidelity. Try describing a vibrant scene or uploading a base image for intelligent modification.</p>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="absolute inset-0 bg-[#0a0a0a]/80 backdrop-blur-3xl flex flex-col items-center justify-center gap-8 p-12 text-center z-20 animate-in fade-in duration-300">
                <div className="relative">
                  <div className="w-32 h-32 border-[6px] border-indigo-600/10 border-t-indigo-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-full animate-pulse blur-xl"></div>
                    <div className="w-8 h-8 bg-indigo-500/20 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-2xl font-black text-white uppercase tracking-[0.3em]">Processing</h4>
                  <p className="text-sm text-gray-400 max-w-sm mx-auto font-medium">
                    {activeTab === 'video' 
                      ? "Veo is synthesizing temporal consistency and motion vectors. This can take up to 2 minutes..."
                      : "Gemini 3 Pro is refining pixels and textures for high-fidelity output..."}
                  </p>
                  <div className="flex gap-1 justify-center">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="glass rounded-[1.5rem] p-5 flex flex-col md:flex-row items-center justify-between border border-white/5 gap-4">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em]">Active Engine</span>
                  <span className="text-xs text-white font-bold">{activeTab === 'image' ? (attachment ? 'Gemini 2.5 Image (Edit)' : 'Gemini 3 Pro Image') : 'Veo 3.1 Fast'}</span>
                </div>
             </div>
             {result && (
               <a 
                 href={result.url} 
                 download={`kayya21-${Date.now()}`} 
                 className="px-6 py-2.5 bg-white text-black text-[10px] font-black rounded-xl hover:bg-indigo-500 hover:text-white transition-all uppercase tracking-widest shadow-xl"
               >
                 Download Asset
               </a>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreativeStudio;
