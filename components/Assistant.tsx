
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { chatWithThinking, chatWithSearch, chatWithMaps, analyzeMedia, chatWithLite } from '../services/geminiService';
import { fileToBase64 } from '../services/audioUtils';

const Assistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'standard' | 'thinking' | 'search' | 'maps' | 'fast'>('standard');
  const [attachment, setAttachment] = useState<{ base64: string; type: string; url: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      const url = URL.createObjectURL(file);
      setAttachment({ base64, type: file.type, url });
    }
  };

  const sendMessage = async () => {
    if (!input.trim() && !attachment) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
      attachmentUrl: attachment?.url,
      attachmentType: attachment?.type.startsWith('image') ? 'image' : 'video'
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let response;
      if (attachment) {
        response = await analyzeMedia(input || "Analyze this media.", attachment.base64, attachment.type);
      } else {
        switch (mode) {
          case 'thinking': response = await chatWithThinking(input); break;
          case 'search': response = await chatWithSearch(input); break;
          case 'fast': response = await chatWithLite(input); break;
          case 'maps': 
            const loc = await new Promise<{lat: number; lng: number} | undefined>((res) => {
              navigator.geolocation.getCurrentPosition(
                (pos) => res({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => res(undefined)
              );
            });
            response = await chatWithMaps(input, loc); 
            break;
          default: response = await chatWithSearch(input);
        }
      }

      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || '',
        timestamp: Date.now(),
        isThinking: mode === 'thinking',
        groundingUrls: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => ({
          title: c.web?.title || c.maps?.title || 'Resource',
          uri: c.web?.uri || c.maps?.uri || '#'
        })).filter((c: any) => c.uri !== '#')
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Sorry, I encountered an error. Please check your connection or API key.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
      setAttachment(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d] overflow-hidden">
      <div className="flex gap-2 p-4 border-b border-white/5 bg-black/20 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {(['standard', 'thinking', 'search', 'maps', 'fast'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest transition uppercase ${mode === m ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
          >
            {m}
          </button>
        ))}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'glass text-gray-100 shadow-xl'}`}>
              {msg.attachmentUrl && (
                <div className="mb-2 rounded-lg overflow-hidden border border-white/10 bg-black/20">
                  {msg.attachmentType === 'image' ? (
                    <img src={msg.attachmentUrl} className="w-full max-h-64 object-contain" alt="Upload" />
                  ) : (
                    <video src={msg.attachmentUrl} controls className="w-full max-h-64" />
                  )}
                </div>
              )}
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
              {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/10">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-gray-500 block mb-2 font-black">Verified Sources</span>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingUrls.map((g, i) => (
                      <a key={i} href={g.uri} target="_blank" rel="noopener" className="text-[10px] px-2.5 py-1 bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-300 rounded-md truncate max-w-[180px] border border-white/5 transition duration-200">
                        {g.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="glass p-4 rounded-2xl flex items-center gap-4 shadow-lg border border-indigo-500/10">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
              </div>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                {mode === 'thinking' ? 'Reasoning...' : 'Processing...'}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-black/40 border-t border-white/5 backdrop-blur-xl">
        {attachment && (
          <div className="mb-4 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-indigo-500 shadow-xl shadow-indigo-600/20">
              {attachment.type.startsWith('image') ? (
                <img src={attachment.url} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <div className="w-full h-full bg-indigo-900 flex items-center justify-center">
                  <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </div>
              )}
              <button 
                onClick={() => setAttachment(null)}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-lg hover:bg-red-600 transition shadow-lg"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex flex-col">
               <span className="text-xs font-bold text-white uppercase tracking-widest">Ready to analyze</span>
               <span className="text-[10px] text-gray-500 truncate max-w-[150px]">{attachment.type}</span>
            </div>
          </div>
        )}
        <div className="flex items-end gap-3 max-w-5xl mx-auto w-full">
          <label className="p-3 rounded-2xl glass cursor-pointer hover:bg-white/10 transition shrink-0 border border-white/10 group">
            <input type="file" className="hidden" onChange={handleFile} accept="image/*,video/*" />
            <svg className="w-6 h-6 text-gray-400 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </label>
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
              placeholder={attachment ? "Ask about this media..." : "Ask Gemini anything..."}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-indigo-500/50 resize-none min-h-[56px] max-h-48 transition-all duration-200"
              rows={1}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={isLoading || (!input.trim() && !attachment)}
            className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition duration-200 disabled:opacity-50 disabled:grayscale shadow-xl shadow-indigo-600/20"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
