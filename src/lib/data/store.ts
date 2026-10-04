"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { CommunityActivity, DataProvider, Profile, SavedActivity } from "./types";
import { createLocalProvider } from "./local";

/**
 * Store global de datos: elige el proveedor (local o Supabase), mantiene en
 * memoria perfil, fichas guardadas y comunidad, y notifica a los componentes.
 */

interface DataState {
  ready: boolean;
  mode: DataProvider["mode"];
  profile: Profile | null;
  saved: SavedActivity[];
  savedLoading: boolean;
  community: CommunityActivity[];
  communityLoading: boolean;
  error: string | null;
}

let provider: DataProvider | null = null;
let state: DataState = {
  ready: false,
  mode: "local",
  profile: null,
  saved: [],
  savedLoading: true,
  community: [],
  communityLoading: true,
  error: null,
};
const listeners = new Set<() => void>();

function setState(patch: Partial<DataState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const SUPABASE_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && supabaseKey
);

async function getProvider(): Promise<DataProvider> {
  if (provider) return provider;
  if (SUPABASE_CONFIGURED) {
    const { createSupabaseProvider } = await import("./supabase");
    provider = createSupabaseProvider(process.env.NEXT_PUBLIC_SUPABASE_URL!, supabaseKey!);
  } else {
    provider = createLocalProvider();
  }
  return provider;
}

async function refreshProfile() {
  const p = await getProvider();
  const profile = await p.getProfile();
  setState({ profile, ready: true, mode: p.mode });
}

async function refreshSaved() {
  const p = await getProvider();
  setState({ savedLoading: true });
  try {
    setState({ saved: await p.listSaved(), savedLoading: false });
  } catch (e) {
    setState({ savedLoading: false, error: (e as Error).message });
  }
}

async function refreshCommunity() {
  const p = await getProvider();
  setState({ communityLoading: true });
  try {
    setState({ community: await p.listCommunity(), communityLoading: false });
  } catch (e) {
    setState({ communityLoading: false, error: (e as Error).message });
  }
}

let initialized = false;
function init() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  getProvider().then((p) => {
    setState({ mode: p.mode });
    p.onAuthChange(() => {
      refreshProfile();
      refreshSaved();
      refreshCommunity();
    });
    refreshProfile().catch((e) => setState({ ready: true, error: (e as Error).message }));
    refreshSaved();
    refreshCommunity();
  });
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

const SERVER_STATE = state;

export function useDataState(): DataState {
  useEffect(init, []);
  return useSyncExternalStore(subscribe, () => state, () => SERVER_STATE);
}

/** Acciones: cada una actualiza el store de forma optimista o vuelve a cargar. */
export const dataActions = {
  async signIn(email: string, password: string) {
    await (await getProvider()).signIn(email, password);
    await Promise.all([refreshProfile(), refreshSaved(), refreshCommunity()]);
  },
  async signUp(name: string, email: string, password: string) {
    const res = await (await getProvider()).signUp(name, email, password);
    await Promise.all([refreshProfile(), refreshSaved(), refreshCommunity()]);
    return res;
  },
  async sendMagicLink(email: string) {
    await (await getProvider()).sendMagicLink(email);
  },
  async signOut() {
    await (await getProvider()).signOut();
    setState({ profile: null, saved: [] });
    await refreshCommunity();
  },
  async updateProfile(patch: Partial<Omit<Profile, "id" | "email">>) {
    const profile = await (await getProvider()).updateProfile(patch);
    setState({ profile });
    return profile;
  },
  async save(input: Parameters<DataProvider["saveActivity"]>[0]) {
    const item = await (await getProvider()).saveActivity(input);
    setState({ saved: [item, ...state.saved] });
    return item;
  },
  async updateSaved(id: string, patch: Parameters<DataProvider["updateSaved"]>[1]) {
    await (await getProvider()).updateSaved(id, patch);
    setState({
      saved: state.saved.map((s) =>
        s.id === id ? { ...s, ...patch, title: patch.snapshot?.title ?? patch.title ?? s.title, updatedAt: new Date().toISOString() } : s
      ),
    });
  },
  async deleteSaved(id: string) {
    const prev = state.saved;
    setState({ saved: prev.filter((s) => s.id !== id) });
    try {
      await (await getProvider()).deleteSaved(id);
    } catch (e) {
      setState({ saved: prev });
      throw e;
    }
  },
  async restoreSaved(item: SavedActivity) {
    const restored = await (await getProvider()).saveActivity({ snapshot: item.snapshot, folder: item.folder, notes: item.notes });
    if (item.isFavorite) await (await getProvider()).updateSaved(restored.id, { isFavorite: true });
    setState({ saved: [{ ...restored, isFavorite: item.isFavorite }, ...state.saved] });
  },
  async publish(snapshot: Parameters<DataProvider["publish"]>[0], details: Parameters<DataProvider["publish"]>[1]) {
    const item = await (await getProvider()).publish(snapshot, details);
    setState({ community: [item, ...state.community.filter((c) => !c.isExample)] });
    return item;
  },
  async unpublish(id: string) {
    await (await getProvider()).unpublish(id);
    setState({ community: state.community.filter((c) => c.id !== id) });
  },
  async toggleLike(id: string) {
    const liked = await (await getProvider()).toggleLike(id);
    setState({
      community: state.community.map((c) =>
        c.id === id ? { ...c, isLiked: liked, likes: Math.max(0, c.likes + (liked ? 1 : -1)) } : c
      ),
    });
  },
  async recordDownload(id: string) {
    await (await getProvider()).recordDownload(id);
    setState({ community: state.community.map((c) => (c.id === id ? { ...c, downloads: c.downloads + 1 } : c)) });
  },
  refreshCommunity,
  refreshSaved,
};
