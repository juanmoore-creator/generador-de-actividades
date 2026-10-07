"use client";

import { createContext, useContext } from "react";
import type { ActivitySnapshot } from "@/lib/types/activities";
import type { StudioPackContext } from "@/lib/studio/state";

export type AppTab = "home" | "studio" | "saved" | "community" | "profile";

export interface AppApi {
  tab: AppTab;
  navigate: (tab: AppTab) => void;
  openAuth: (reason?: string) => void;
  openPublish: (snapshot: ActivitySnapshot) => void;
  openSave: () => void;
  /** Abre un snapshot en el estudio (desde Mis fichas o la comunidad). */
  openInStudio: (snapshot: ActivitySnapshot, savedId?: string | null) => void;
  /** Abre un cuadernillo / pack temático completo en el estudio. */
  openPackInStudio: (pack: StudioPackContext) => void;
  /** Abre el modal para importar un CSV de IA y generar un pack temático. */
  openThemePack: () => void;
}

export const AppContext = createContext<AppApi | null>(null);

export function useApp(): AppApi {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp debe usarse dentro de <AppShell>");
  return ctx;
}
