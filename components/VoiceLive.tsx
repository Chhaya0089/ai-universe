
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { MODELS } from '../constants';
import { encode, decode, decodeAudioData } from '../services/audioUtils';
import { generateSpeech } from '../services/geminiService';

const VoiceLive: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isTTSLoading, setIsTTSLoading] = useState(false);
  const [ttsText, setTtsText] = useState('');
  const [transcriptions, setTranscriptions] = useState<{ role: string; text: string }[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  const startLiveSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(err => {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDismissedError') {
          throw new Error("Microphone permission dismissed or denied. Please enable it in browser settings.");
        }
        throw err;
      });

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      const sessionPromise = ai.live.connect({
        model: MODELS.LIVE,
        callbacks: {
          onopen: () => {
            setIsActive(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  media: {
                    data: encode(new Uint8Array(int16.buffer)),
                    mimeType: 'audio/pcm;rate=16000'
                  }
                });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscriptions(prev => [...prev, { role: 'model', text: message.serverContent?.outputTranscription?.text || '' }]);
            }

            const audioBase64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioBase64) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const buffer = await decodeAudioData(decode(audioBase64), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Live session error:", e);
            if (String(e).includes("PERMISSION_DENIED")) {
              window.dispatchEvent(new CustomEvent('gemini-permission-error', { detail: "Live API Permission Denied" }));
            }
            setIsActive(false);
          },
          onclose: () => setIsActive(false)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to start live session.");
    }
  };

  const stopLiveSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
    }
    setIsActive(false);
  };

  const runTTS = async () => {
    if (!ttsText.trim()) return;
    setIsTTSLoading(true);
    try {
      const audioBase64 = await generateSpeech(ttsText);
      const ctx = new AudioContext();
      const buffer = await decodeAudioData(decode(audioBase64), ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
    } catch (err) {
      console.error(err);
    } finally {
      setIsTTSLoading(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col items-center justify-center gap-12 overflow-y-auto">
      <div className="max-w-xl w-full text-center space-y-6">
        <div className="glass p-12 rounded-[3rem] relative overflow-hidden group">
          <div className={`absolute inset-0 bg-indigo-600/10 transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
          <div className="relative z-10 flex flex-col items-center gap-8">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${isActive ? 'bg-indigo-600 scale-110 shadow-indigo-600/50' : 'bg-white/5'}`}>
              <svg className={`w-12 h-12 ${isActive ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-[0.2em]">{isActive ? 'Session Active' : 'Start Conversation'}</h2>
              <p className="text-sm text-gray-500 mt-2 font-medium tracking-wide">Speak naturally with Gemini 2.5 Native Audio</p>
            </div>
            <button
              onClick={isActive ? stopLiveSession : startLiveSession}
              className={`px-8 py-3 rounded-2xl font-bold text-sm tracking-widest transition shadow-lg ${isActive ? 'bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/30' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20'}`}
            >
              {isActive ? 'END SESSION' : 'START TALKING'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-3xl flex flex-col gap-4 border border-white/5">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Live Transcription</h3>
          <div className="flex-1 min-h-[150px] max-h-[150px] overflow-y-auto space-y-3 pr-2 scrollbar-hide">
            {transcriptions.length === 0 && <p className="text-xs text-gray-700 italic">Capturing speech...</p>}
            {transcriptions.map((t, i) => (
              <div key={i} className="text-xs leading-relaxed text-gray-300 bg-white/5 p-2 rounded-lg border border-white/5">
                {t.text}
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-6 rounded-3xl flex flex-col gap-4 border border-white/5">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Speech Synthesis (TTS)</h3>
          <div className="space-y-4">
            <textarea
              value={ttsText}
              onChange={(e) => setTtsText(e.target.value)}
              placeholder="Type something for Gemini to say..."
              className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500/50 min-h-[80px] resize-none"
            />
            <button
              onClick={runTTS}
              disabled={isTTSLoading || !ttsText.trim()}
              className="w-full py-2.5 bg-white/5 text-gray-300 rounded-xl font-bold text-[10px] tracking-widest border border-white/10 hover:bg-white/10 transition disabled:opacity-50"
            >
              {isTTSLoading ? 'PREPARING...' : 'PLAY VOICE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceLive;
