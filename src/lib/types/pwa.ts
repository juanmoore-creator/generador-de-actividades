import { ActivityType, Difficulty, WordItem, SheetHeaderOptions } from "./activities";

export type { SheetHeaderOptions };

export type PwaTab = "studio" | "saved" | "community" | "profile";

export type StudioViewMode = "editor" | "preview";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  school: string;
  avatar: string;
  isLoggedIn: boolean;
  isPro?: boolean;
  joinedDate: string;
  stats: {
    savedCount: number;
    publishedCount: number;
    downloadsReceived: number;
  };
}

export interface ActivitySnapshot {
  type: ActivityType;
  title: string;
  difficulty: Difficulty;
  items: WordItem[];
  cryptoPhrase?: string;
  cryptoHint?: string;
  clozeText?: string;
  sudokuSize?: 4 | 6 | 9;
  sudokuEmojis?: boolean;
  pyramidLevels?: number;
  pyramidCount?: number;
  mazeSize?: number;
  pixelArtKey?: string;
  headerOptions?: SheetHeaderOptions;
}

export interface SavedActivity {
  id: string;
  title: string;
  type: ActivityType;
  difficulty: Difficulty;
  folder: string; // e.g., "Ciencias", "Matemáticas", "Lengua"
  snapshot: ActivitySnapshot;
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
  isPublished?: boolean;
  wordCount?: number;
  notes?: string;
}

export interface CommunityActivity {
  id: string;
  title: string;
  type: ActivityType;
  difficulty: Difficulty;
  subject: string; // "Lengua", "Ciencias", "Matemáticas", "Inglés", "Historia"
  grade: string;   // "1º Primaria", "4º Primaria", "Secundaria"
  description: string;
  author: {
    name: string;
    role: string;
    school: string;
    avatar: string;
    isVerified?: boolean;
  };
  snapshot: ActivitySnapshot;
  likes: number;
  downloads: number;
  isLiked?: boolean;
  featured?: boolean;
  createdAt: string;
  tags: string[];
}
