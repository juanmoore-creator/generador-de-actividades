"use client";

import {
  SavedActivity,
  CommunityActivity,
  ActivitySnapshot,
  UserProfile,
} from "@/lib/types/pwa";
import { pwaStorage } from "@/lib/pwaStore";

/**
 * API Bridge & Sync Service
 * 
 * Capa de abstracción que gestiona la persistencia local de la PWA (offline-first)
 * y proporciona los puntos de conexión preparados para cuando se configure
 * una base de datos remota (Supabase / PostgreSQL / REST API).
 */
export const apiBridge = {
  // --- AUTENTICACIÓN ---
  getCurrentUser: (): UserProfile => {
    return pwaStorage.getUser();
  },

  setCurrentUser: (user: UserProfile): void => {
    pwaStorage.setUser(user);
  },

  // --- BANCO DE FICHAS GUARDADAS ---
  fetchSavedActivities: async (): Promise<SavedActivity[]> => {
    // Si en el futuro hay backend: try { return await fetch('/api/activities') } catch { return local }
    return pwaStorage.getSavedActivities();
  },

  saveActivity: async (
    snapshot: ActivitySnapshot,
    folder = "General",
    notes = ""
  ): Promise<SavedActivity> => {
    return pwaStorage.saveCurrentActivity(snapshot, folder, notes);
  },

  deleteSavedActivity: async (id: string): Promise<void> => {
    pwaStorage.deleteSavedActivity(id);
  },

  duplicateSavedActivity: async (id: string): Promise<void> => {
    pwaStorage.duplicateSavedActivity(id);
  },

  // --- BIBLIOTECA PÚBLICA COMUNITARIA ---
  fetchCommunityFeed: async (): Promise<CommunityActivity[]> => {
    return pwaStorage.getCommunityActivities();
  },

  publishActivity: async (
    snapshot: ActivitySnapshot,
    details: { subject: string; grade: string; description: string; tags: string[] }
  ): Promise<CommunityActivity> => {
    return pwaStorage.publishToCommunity(snapshot, details);
  },

  toggleLike: async (communityId: string): Promise<boolean> => {
    return pwaStorage.toggleLikeCommunity(communityId);
  },

  recordDownload: async (communityId: string): Promise<void> => {
    pwaStorage.incrementCommunityDownload(communityId);
  },
};
