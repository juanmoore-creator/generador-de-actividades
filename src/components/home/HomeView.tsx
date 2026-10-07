"use client";

import React, { useMemo, useState } from "react";
import { ArrowRight, Search, PenLine, FolderOpen, Sparkles } from "lucide-react";
import type { ActivityCategory, ActivityType, EducationLevel } from "@/lib/types/activities";
import { ACTIVITIES, CATEGORIES, LEVELS, getActivity } from "@/lib/activities/catalog";
import { createSnapshot } from "@/lib/activities/snapshot";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ActivityIcon, CATEGORY_BORDER } from "@/components/app/ActivityIcon";
import { useStudio } from "@/components/studio/StudioContext";
import { useApp } from "@/components/app/AppContext";
import { useDataState } from "@/lib/data/store";
import { SheetThumbnail } from "./SheetThumbnail";
import { cn } from "@/lib/utils";

interface Props {
  onCreate: (type: ActivityType) => void;
  onContinue: () => void;
  onOpenSaved: () => void;
}

type CategoryFilter = ActivityCategory | "all";
type LevelFilter = EducationLevel | "all";

const CATEGORY_CHIP_ACTIVE: Record<ActivityCategory, string> = {
  language: "border-sky-600 bg-sky-600 text-white dark:border-sky-500 dark:bg-sky-500 font-semibold shadow-xs",
  math: "border-amber-600 bg-amber-600 text-white dark:border-amber-500 dark:bg-amber-500 font-semibold shadow-xs",
  visual: "border-violet-600 bg-violet-600 text-white dark:border-violet-500 dark:bg-violet-500 font-semibold shadow-xs",
};

function FilterChip({
  selected,
  onClick,
  activeClassName,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  activeClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "h-10 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors cursor-pointer",
        selected
          ? (activeClassName ?? "border-primary bg-primary text-on-primary font-semibold shadow-xs")
          : "border-line-strong bg-surface text-ink-2 hover:bg-surface-2"
      )}
    >
      {children}
    </button>
  );
}

export function HomeView({ onCreate, onContinue, onOpenSaved }: Props) {
  const { snapshot, state } = useStudio();
  const { saved, profile } = useDataState();
  const { openThemePack } = useApp();
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [level, setLevel] = useState<LevelFilter>("all");
  const [query, setQuery] = useState("");

  // Snapshot de ejemplo (con semilla fija) para la miniatura de cada actividad.
  const thumbs = useMemo(
    () => Object.fromEntries(ACTIVITIES.map((a) => [a.id, createSnapshot(a.id, { seed: 2024 })])),
    []
  );

  const q = query.trim().toLowerCase();
  const filtered = ACTIVITIES.filter(
    (a) =>
      (category === "all" || a.category === category) &&
      (level === "all" || a.levels.includes(level)) &&
      (!q || `${a.title} ${a.description}`.toLowerCase().includes(q))
  );

  const draftMeta = getActivity(snapshot.type);
  const firstName = profile?.name?.split(" ")[0];

  return (
    <div className="space-y-8">
      <section className="pt-2">
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">
          {firstName ? `Hola, ${firstName}. ` : ""}¿Qué quieres crear hoy?
        </h1>
        <p className="mt-1.5 max-w-2xl text-base text-ink-3">
          Elige una actividad, escribe tu contenido y descarga la ficha lista para imprimir, con su hoja de respuestas.
        </p>
      </section>

      {/* Atajos principales */}
      <section className="grid gap-3 sm:grid-cols-3" aria-label="Acciones rápidas">
        <Card className="flex items-center gap-3.5 p-4">
          <ActivityIcon type={snapshot.type} size="md" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-ink-3">{state.dirty || state.savedId ? "Sigue donde lo dejaste" : "Tu borrador"}</p>
            <p className="truncate font-semibold text-ink text-sm sm:text-base">{snapshot.title || draftMeta.defaultTitle}</p>
          </div>
          <Button size="sm" variant="primary" onClick={onContinue} icon={<PenLine className="size-4" aria-hidden />}>
            Continuar
          </Button>
        </Card>

        <Card className="flex items-center gap-3.5 p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <FolderOpen className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-ink-3">Mis fichas</p>
            <p className="font-semibold text-ink text-sm sm:text-base">
              {saved.length === 0 ? "Sin fichas aún" : `${saved.length} ${saved.length === 1 ? "guardada" : "guardadas"}`}
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={onOpenSaved} icon={<ArrowRight className="size-4" aria-hidden />}>
            Ver
          </Button>
        </Card>

        <Card className="flex items-center gap-3.5 p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-ink">
            <Sparkles className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-ink-3">Cuadernillo</p>
            <p className="font-semibold text-ink text-sm sm:text-base">Pack con IA</p>
          </div>
          <Button size="sm" variant="secondary" onClick={openThemePack} icon={<Sparkles className="size-4" aria-hidden />}>
            Crear
          </Button>
        </Card>
      </section>

      {/* Galería */}
      <section aria-labelledby="gallery-title" className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <h2 id="gallery-title" className="text-xl font-bold text-ink">
            Actividades
          </h2>
          <label className="relative block w-full lg:w-72">
            <span className="sr-only">Buscar actividad</span>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar actividad…"
              className="h-11 w-full rounded-xl border border-line-strong bg-surface pr-3 pl-10 text-base text-ink placeholder:text-ink-3 focus:border-accent focus:ring-3 focus:ring-accent/20 focus:outline-none sm:text-sm"
            />
          </label>
        </div>

        <div className="space-y-2">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" role="group" aria-label="Filtrar por área">
            <FilterChip selected={category === "all"} onClick={() => setCategory("all")}>
              Todas las áreas
            </FilterChip>
            {CATEGORIES.map((c) => (
              <FilterChip
                key={c.id}
                selected={category === c.id}
                onClick={() => setCategory(c.id)}
                activeClassName={CATEGORY_CHIP_ACTIVE[c.id]}
              >
                {c.short}
              </FilterChip>
            ))}
          </div>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" role="group" aria-label="Filtrar por nivel">
            <FilterChip selected={level === "all"} onClick={() => setLevel("all")}>
              Todos los niveles
            </FilterChip>
            {LEVELS.map((l) => (
              <FilterChip key={l.id} selected={level === l.id} onClick={() => setLevel(l.id)}>
                {l.label}
              </FilterChip>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line-strong p-8 text-center text-ink-3">
            No hay actividades con esos filtros.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((a) => {
              const cat = CATEGORIES.find((c) => c.id === a.category)!;
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => onCreate(a.id)}
                    className={cn(
                      "group flex h-full w-full flex-col overflow-hidden rounded-2xl border bg-surface text-left shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer motion-reduce:hover:translate-y-0",
                      CATEGORY_BORDER[a.category]
                    )}
                  >
                    <SheetThumbnail snapshot={thumbs[a.id]} />
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <div className="flex items-center gap-2.5">
                        <ActivityIcon type={a.id} size="sm" />
                        <h3 className="font-bold text-ink group-hover:text-primary transition-colors">{a.title}</h3>
                      </div>
                      <p className="text-sm text-ink-3">{a.description}</p>
                      <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                        <Badge tone={a.category}>
                          {cat.short}
                        </Badge>
                        {a.levels.map((l) => (
                          <Badge key={l}>{LEVELS.find((x) => x.id === l)!.label}</Badge>
                        ))}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
