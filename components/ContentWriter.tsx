
import React, { useState } from 'react';
import { chatWithThinking } from '../services/geminiService';

const ContentWriter: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [format, setFormat] = useState('Blog Post');

  const generate = async () => {
    if (!topic) return;
    setIsLoading(true);
    try {
      const prompt = `Act as an expert copywriter. Generate a high-converting ${format} about: ${topic}. Include sections for headlines, body text, and a call to action. Optimize for SEO.`;
      const res = await chatWithThinking(prompt);
      setResult(res.text || '');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col gap-8 bg-[#0a0a0a] overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase tracking-widest">Content Engine</h2>
          <div className="flex gap-2">
            {['Blog Post', 'Social Ad', 'Product Email'].map(f => (
              <button 
                key={f} 
                onClick={() => setFormat(f)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${format === f ? 'bg-indigo-600 text-white' : 'glass text-gray-400 hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="glass p-8 rounded-[2rem] space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Target Topic / Keywords</label>
            <textarea 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Sustainable fashion trends for 2025..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-indigo-500/50 min-h-[100px]"
            />
          </div>
          <button 
            onClick={generate}
            disabled={isLoading || !topic}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {isLoading ? 'Thinking Deeply...' : `Generate ${format}`}
          </button>
        </div>

        {result && (
          <div className="glass p-10 rounded-[2.5rem] animate-in slide-in-from-bottom-4 duration-500 relative group">
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition">
              <button 
                onClick={() => navigator.clipboard.writeText(result)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                Copy Content
              </button>
            </div>
            <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentWriter;
