
import { GoogleGenAI, GenerateContentResponse, Type, Modality } from "@google/genai";
import { MODELS } from "../constants";

// Helper to get fresh client with current key
const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const handleApiError = (error: any) => {
  const message = error?.message || String(error);
  console.error("Gemini API Error:", error);
  
  if (message.includes("PERMISSION_DENIED") || message.includes("Requested entity was not found")) {
    // Dispatch custom event to trigger key re-selection in App.tsx
    window.dispatchEvent(new CustomEvent('gemini-permission-error', { detail: message }));
    throw new Error("API Permission Error: Please check your API key and billing status.");
  }
  throw error;
};

export const chatWithThinking = async (prompt: string): Promise<GenerateContentResponse> => {
  try {
    const ai = getClient();
    return await ai.models.generateContent({
      model: MODELS.CHAT,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });
  } catch (e) { return handleApiError(e); }
};

export const chatWithLite = async (prompt: string): Promise<GenerateContentResponse> => {
  try {
    const ai = getClient();
    return await ai.models.generateContent({
      model: MODELS.FAST,
      contents: prompt,
    });
  } catch (e) { return handleApiError(e); }
};

export const chatWithSearch = async (prompt: string): Promise<GenerateContentResponse> => {
  try {
    const ai = getClient();
    return await ai.models.generateContent({
      model: MODELS.SEARCH,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
  } catch (e) { return handleApiError(e); }
};

export const chatWithMaps = async (prompt: string, location?: { lat: number; lng: number }): Promise<GenerateContentResponse> => {
  try {
    const ai = getClient();
    return await ai.models.generateContent({
      model: MODELS.MAPS,
      contents: prompt,
      config: {
        tools: [{ googleMaps: {}, googleSearch: {} }],
        toolConfig: location ? {
          retrievalConfig: {
            latLng: {
              latitude: location.lat,
              longitude: location.lng
            }
          }
        } : undefined
      },
    });
  } catch (e) { return handleApiError(e); }
};

export const analyzeMedia = async (prompt: string, fileBase64: string, mimeType: string): Promise<GenerateContentResponse> => {
  try {
    const ai = getClient();
    return await ai.models.generateContent({
      model: MODELS.CHAT,
      contents: {
        parts: [
          { inlineData: { data: fileBase64, mimeType } },
          { text: prompt }
        ]
      }
    });
  } catch (e) { return handleApiError(e); }
};

export const generateImage = async (prompt: string, options: { aspectRatio: string; imageSize: '1K' | '2K' | '4K' }): Promise<string> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: MODELS.IMAGE_GEN,
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: options.aspectRatio as any,
          imageSize: options.imageSize
        }
      }
    });

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (part?.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No image generated");
  } catch (e) { return handleApiError(e); }
};

export const editImage = async (prompt: string, originalImageBase64: string, mimeType: string): Promise<string> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: MODELS.IMAGE_EDIT,
      contents: {
        parts: [
          { inlineData: { data: originalImageBase64, mimeType } },
          { text: prompt }
        ]
      }
    });

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (part?.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No edited image generated");
  } catch (e) { return handleApiError(e); }
};

export const generateVideo = async (prompt: string, options: { aspectRatio: '16:9' | '9:16'; imageBase64?: string; mimeType?: string }): Promise<string> => {
  try {
    const ai = getClient();
    
    let operation = await ai.models.generateVideos({
      model: MODELS.VIDEO_GEN,
      prompt,
      image: options.imageBase64 ? {
        imageBytes: options.imageBase64,
        mimeType: options.mimeType || 'image/png'
      } : undefined,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: options.aspectRatio
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed");
    
    return `${downloadLink}&key=${process.env.API_KEY}`;
  } catch (e) { return handleApiError(e); }
};

export const generateSpeech = async (text: string): Promise<string> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: MODELS.TTS,
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) throw new Error("TTS generation failed");
    return audioData;
  } catch (e) { return handleApiError(e); }
};
