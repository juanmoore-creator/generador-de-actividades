import type { ActivitySnapshot, ActivityType, Difficulty, PageSize, SheetHeaderOptions } from "../types/activities";

export type DataMode = "local" | "cloud";

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  school: string;
  /** Encabezado que se aplica a las fichas nuevas. */
  defaultHeader: SheetHeaderOptions;
  defaultPageSize: PageSize;
}

export interface SavedActivity {
  id: string;
  title: string;
  type: ActivityType;
  difficulty: Difficulty;
  folder: string;
  notes: string;
  snapshot: ActivitySnapshot;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  isPublished: boolean;
}

export interface CommunityAuthor {
  name: string;
  school: string;
}

export interface CommunityActivity {
  id: string;
  title: string;
  type: ActivityType;
  difficulty: Difficulty;
  subject: string;
  grade: string;
  description: string;
  tags: string[];
  snapshot: ActivitySnapshot;
  author: CommunityAuthor;
  authorId: string | null;
  likes: number;
  downloads: number;
  isLiked: boolean;
  createdAt: string;
  /** Ficha de ejemplo incluida con la app (no publicada por un usuario). */
  isExample?: boolean;
}

export interface PublishDetails {
  subject: string;
  grade: string;
  description: string;
  tags: string[];
}

export interface SaveInput {
  snapshot: ActivitySnapshot;
  folder: string;
  notes: string;
}

export interface DataProvider {
  mode: DataMode;
  getProfile(): Promise<Profile | null>;
  /** Sólo nube: inicia sesión. */
  signIn(email: string, password: string): Promise<void>;
  signUp(name: string, email: string, password: string): Promise<{ needsConfirmation: boolean }>;
  sendMagicLink(email: string): Promise<void>;
  signOut(): Promise<void>;
  updateProfile(patch: Partial<Omit<Profile, "id" | "email">>): Promise<Profile>;
  onAuthChange(cb: () => void): () => void;

  listSaved(): Promise<SavedActivity[]>;
  saveActivity(input: SaveInput): Promise<SavedActivity>;
  updateSaved(id: string, patch: Partial<Pick<SavedActivity, "title" | "folder" | "notes" | "isFavorite" | "snapshot">>): Promise<void>;
  deleteSaved(id: string): Promise<void>;

  listCommunity(): Promise<CommunityActivity[]>;
  publish(snapshot: ActivitySnapshot, details: PublishDetails): Promise<CommunityActivity>;
  unpublish(id: string): Promise<void>;
  toggleLike(id: string): Promise<boolean>;
  recordDownload(id: string): Promise<void>;
}
