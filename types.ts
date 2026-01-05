export interface HelpRequest {
  id: string;
  originalText: string;
  polishedText: string;
  category: 'Physical' | 'Social' | 'School' | 'Community' | 'Other';
  status: 'Open' | 'Matched';
  author: string;
  authorId?: string;
  authorPhotoUrl?: string;
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
  userId?: string;
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

export interface UserProfile {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
}

export interface NewHelpRequestInput {
  originalText: string;
  polishedText: string;
  category: HelpRequest['category'];
  emoji: string;
  author: string;
  authorId?: string;
  authorPhotoUrl?: string | null;
  imageUrl?: string | null;
}

export interface UpdateHelpRequestInput extends NewHelpRequestInput {
  id: string;
}

export interface NewKindnessEntryInput {
  action: string;
  aiResponse: string;
  imageUrl?: string | null;
}
