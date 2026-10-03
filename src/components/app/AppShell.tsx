"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { ActivitySnapshot, ActivityType } from "@/lib/types/activities";
import { switchActivityType } from "@/lib/activities/snapshot";
import { newSeed } from "@/lib/random";
import { useDataState } from "@/lib/data/store";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { StudioProvider, useStudio } from "@/components/studio/StudioContext";
import { StudioView } from "@/components/studio/StudioView";
import { HomeView } from "@/components/home/HomeView";
import { SavedView } from "@/components/views/SavedView";
import { CommunityView } from "@/components/views/CommunityView";
import { ProfileView } from "@/components/views/ProfileView";
import { AppContext, AppApi, AppTab } from "./AppContext";
import { BottomNav, TopBar } from "./Navigation";
import { SaveDialog } from "./SaveDialog";
import { PublishDialog } from "./PublishDialog";
import { AuthDialog } from "./AuthDialog";
import { InstallBanner, useServiceWorker } from "./PwaPrompts";

const TABS: AppTab[] = ["home", "studio", "saved", "community", "profile"];
const TITLES: Record<AppTab, string> = {
  home: "Inicio",
  studio: "Estudio",
  saved: "Mis fichas",
  community: "Comunidad",
  profile: "Perfil",
};

function tabFromUrl(): AppTab {
  const t = new URLSearchParams(window.location.search).get("tab");
  return TABS.includes(t as AppTab) ? (t as AppTab) : "home";
}

export function AppShell() {
  return (
    <ToastProvider>
      <StudioProvider>
        <Shell />
      </StudioProvider>
    </ToastProvider>
  );
}

function Shell() {
  const [tab, setTab] = useState<AppTab>(tabFromUrl);
  const [saveOpen, setSaveOpen] = useState(false);
  const [publishing, setPublishing] = useState<ActivitySnapshot | null>(null);
  const [auth, setAuth] = useState<{ reason?: string } | null>(null);
  const { snapshot, dispatch, state } = useStudio();
  const { profile } = useDataState();
  const toast = useToast();
  useServiceWorker();

  // Navegación con historial: el botón "Atrás" del teléfono vuelve a la pestaña anterior.
  const navigate = useCallback((next: AppTab) => {
    setTab(next);
    const url = next === "home" ? window.location.pathname : `?tab=${next}`;
    window.history.pushState({ tab: next }, "", url);
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    const onPop = () => setTab(tabFromUrl());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    document.title = `${TITLES[tab]} · GenAct`;
  }, [tab]);

  // Avisa antes de cerrar si hay cambios sin guardar en una ficha guardada.
  useEffect(() => {
    if (!state.savedId || !state.dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [state.savedId, state.dirty]);

  const openInStudio = useCallback(
    (snap: ActivitySnapshot, savedId: string | null = null) => {
      dispatch({ type: "load", snapshot: snap, savedId });
      navigate("studio");
      toast.show(`"${snap.title}" abierta en el estudio`, { tone: "info" });
    },
    [dispatch, navigate, toast]
  );

  const createActivity = useCallback(
    (type: ActivityType) => {
      // Nueva ficha: conserva las palabras y el encabezado del borrador, con las preferencias del perfil.
      const base = switchActivityType(snapshot, type);
      const header = profile?.defaultHeader
        ? { ...profile.defaultHeader, schoolName: profile.defaultHeader.schoolName || profile.school }
        : base.sheet.header;
      dispatch({
        type: "load",
        snapshot: {
          ...base,
          seed: newSeed(),
          sheet: { ...base.sheet, header, pageSize: profile?.defaultPageSize ?? base.sheet.pageSize, copies: 1 },
        },
        savedId: null,
      });
      navigate("studio");
    },
    [snapshot, profile, dispatch, navigate]
  );

  const api: AppApi = useMemo(
    () => ({
      tab,
      navigate,
      openAuth: (reason?: string) => setAuth({ reason }),
      openPublish: (snap: ActivitySnapshot) => setPublishing(snap),
      openSave: () => setSaveOpen(true),
      openInStudio,
    }),
    [tab, navigate, openInStudio]
  );

  return (
    <AppContext.Provider value={api}>
      <a href="#main" className="sr-only z-50 rounded-lg bg-primary px-4 py-2 text-on-primary focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        Saltar al contenido
      </a>
      <TopBar />
      <InstallBanner />
      <main id="main" className="mx-auto max-w-7xl px-4 pt-5 pb-28 sm:px-6 lg:px-8 lg:pb-12">
        {tab === "home" && <HomeView onCreate={createActivity} onContinue={() => navigate("studio")} onOpenSaved={() => navigate("saved")} />}
        {tab === "studio" && <StudioView />}
        {tab === "saved" && <SavedView />}
        {tab === "community" && <CommunityView />}
        {tab === "profile" && <ProfileView />}
      </main>
      <BottomNav />

      {saveOpen && <SaveDialog open onClose={() => setSaveOpen(false)} />}
      {publishing && <PublishDialog snapshot={publishing} onClose={() => setPublishing(null)} />}
      {auth && <AuthDialog open reason={auth.reason} onClose={() => setAuth(null)} />}
    </AppContext.Provider>
  );
}
