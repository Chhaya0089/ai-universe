
export enum AppView {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  ASSISTANT = 'ASSISTANT',
  STUDIO = 'STUDIO',
  VOICE = 'VOICE',
  WRITER = 'WRITER',
  SOCIAL = 'SOCIAL',
  ECOMMERCE = 'ECOMMERCE',
  MARKETING = 'MARKETING'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isThinking?: boolean;
  groundingUrls?: { title: string; uri: string }[];
  attachmentUrl?: string;
  attachmentType?: 'image' | 'video';
}

export interface GroundingChunk {
  web?: { title: string; uri: string };
  maps?: { title: string; uri: string };
}
