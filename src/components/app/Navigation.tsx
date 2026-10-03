"use client";

import React from "react";
import { FolderOpen, House, LogIn, PenLine, Settings, Users, Cloud, HardDrive } from "lucide-react";
import { useDataState } from "@/lib/data/store";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { AppTab, useApp } from "./AppContext";

const NAV: { id: AppTab; label: string; icon: typeof House }[] = [
  { id: "home", label: "Inicio", icon: House },
  { id: "studio", label: "Estudio", icon: PenLine },
  { id: "saved", label: "Mis fichas", icon: FolderOpen },
  { id: "community", label: "Comunidad", icon: Users },
  { id: "profile", label: "Perfil", icon: Settings },
];

export function TopBar() {
  const { tab, navigate, openAuth } = useApp();
  const { mode, profile, saved } = useDataState();

  return (
    <header className="no-print sticky top-0 z-40 border-b border-line bg-surface/90 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button type="button" onClick={() => navigate("home")} className="flex items-center gap-2.5 rounded-xl cursor-pointer" aria-label="GenAct, ir al inicio">
          <span className="grid size-9 place-items-center rounded-xl bg-primary font-mono text-sm font-bold text-on-primary" aria-hidden>
            GA
          </span>
          <span className="font-heading text-lg font-bold text-ink">GenAct</span>
        </button>

        <nav aria-label="Principal" className="ml-4 hidden flex-1 items-center gap-1 lg:flex">
          {NAV.filter((n) => n.id !== "profile").map((n) => (
            <button
              key={n.id}
              type="button"
              aria-current={tab === n.id ? "page" : undefined}
              onClick={() => navigate(n.id)}
              className={cn(
                "flex h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition-colors cursor-pointer",
                tab === n.id ? "bg-surface-2 text-ink" : "text-ink-3 hover:bg-surface-2 hover:text-ink"
              )}
            >
              <n.icon className="size-4" aria-hidden />
              {n.label}
              {n.id === "saved" && saved.length > 0 && (
                <span className="rounded-full bg-surface-3 px-1.5 text-xs text-ink-2">{saved.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span
            className="hidden items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-ink-3 sm:flex"
            title={mode === "local" ? "Los datos se guardan en este dispositivo" : "Los datos se guardan en tu cuenta"}
          >
            {mode === "local" ? <HardDrive className="size-3.5" aria-hidden /> : <Cloud className="size-3.5" aria-hidden />}
            {mode === "local" ? "En este dispositivo" : "En la nube"}
          </span>
          {mode === "cloud" && !profile ? (
            <Button size="sm" variant="primary" onClick={() => openAuth()} icon={<LogIn className="size-4" aria-hidden />}>
              Ingresar
            </Button>
          ) : (
            <button
              type="button"
              onClick={() => navigate("profile")}
              aria-current={tab === "profile" ? "page" : undefined}
              aria-label="Perfil y preferencias"
              className="hidden size-10 place-items-center rounded-full bg-accent-soft font-semibold text-accent-ink hover:brightness-95 lg:grid cursor-pointer"
            >
              {profile?.name ? profile.name.charAt(0).toUpperCase() : <Settings className="size-4" aria-hidden />}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const { tab, navigate } = useApp();
  return (
    <nav
      aria-label="Principal"
      className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-xl grid-cols-5">
        {NAV.map((n) => {
          const active = tab === n.id;
          return (
            <li key={n.id}>
              <button
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => navigate(n.id)}
                className={cn("flex h-full w-full flex-col items-center justify-center gap-1 text-xs font-medium cursor-pointer", active ? "text-accent-ink" : "text-ink-3")}
              >
                <span className={cn("grid h-7 w-12 place-items-center rounded-full transition-colors", active && "bg-accent-soft")}>
                  <n.icon className="size-5" aria-hidden />
                </span>
                {n.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
