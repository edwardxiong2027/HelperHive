export interface HelpRequest {
  id: string;
  originalText: string;
  polishedText: string;
  category: 'Physical' | 'Social' | 'School' | 'Community' | 'Other';
  status: 'Open' | 'Matched';
  author: string;
  emoji: string;
  createdAt: number;
  imageUrl?: string;
}

export interface KindnessEntry {
  id: string;
  action: string;
  aiResponse: string;
  timestamp: number;
  tags: string[];
  imageUrl?: string;
}

export enum AppTab {
  BOARD = 'BOARD',
  KINDNESS = 'KINDNESS',
  SMILE = 'SMILE',
  LEARN = 'LEARN'
}

export interface AiPolishedResponse {
  polishedText: string;
  category: string; // Will map to HelpRequest['category']
  emoji: string;
}

export interface ReadingAnalysis {
  summary: string;
  vocabulary: Array<{ word: string; definition: string }>;
  questions: string[];
}