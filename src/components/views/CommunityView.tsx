"use client";

import React, { useState } from "react";
import { Download, Heart, Info, PenLine, Search, Trash2, Users } from "lucide-react";
import type { CommunityActivity } from "@/lib/data/types";
import { dataActions, useDataState } from "@/lib/data/store";
import { getActivity } from "@/lib/activities/catalog";
import { Button, IconButton } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Segmented } from "@/components/ui/Segmented";
import { useToast } from "@/components/ui/Toast";
import { ActivityIcon } from "@/components/app/ActivityIcon";
import { useApp } from "@/components/app/AppContext";
import { SUBJECTS } from "@/components/app/PublishDialog";
import { SheetThumbnail } from "@/components/home/SheetThumbnail";
import { downloadBlob, pdfFileName, renderPdfBlob } from "@/lib/pdf/export";
import { useStudio } from "@/components/studio/StudioContext";
import { cn } from "@/lib/utils";

type Sort = "recent" | "popular";

export function CommunityView() {
  const { community, communityLoading, mode, profile } = useDataState();
  const { snapshot } = useStudio();
  const app = useApp();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("all");
  const [sort, setSort] = useState<Sort>("recent");
  const [busyId, setBusyId] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const onlyExamples = community.length > 0 && community.every((c) => c.isExample);
  const list = community
    .filter(
      (c) =>
        (subject === "all" || c.subject === subject) &&
        (!q || `${c.title} ${c.description} ${c.tags.join(" ")} ${getActivity(c.type).title}`.toLowerCase().includes(q))
    )
    .sort((a, b) => (sort === "popular" ? b.likes + b.downloads - (a.likes + a.downloads) : b.createdAt.localeCompare(a.createdAt)));

  const download = async (item: CommunityActivity) => {
    setBusyId(item.id);
    try {
      const blob = await renderPdfBlob([{ snapshot: item.snapshot, mode: "both" }], item.title);
      downloadBlob(blob, pdfFileName(item.title));
      dataActions.recordDownload(item.id).catch(() => {});
    } catch {
      toast.show("No se pudo generar el PDF.", { tone: "error" });
    } finally {
      setBusyId(null);
    }
  };

  const like = async (item: CommunityActivity) => {
    if (mode === "cloud" && !profile) {
      app.openAuth("Inicia sesión para marcar fichas con «Me gusta».");
      return;
    }
    try {
      await dataActions.toggleLike(item.id);
    } catch (e) {
      toast.show((e as Error).message, { tone: "error" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Comunidad</h1>
          <p className="text-ink-3">Fichas compartidas por docentes, listas para usar o adaptar.</p>
        </div>
        {mode === "cloud" && (
          <Button variant="primary" onClick={() => app.openPublish(snapshot)} icon={<Users className="size-4" aria-hidden />}>
            Publicar mi ficha actual
          </Button>
        )}
      </div>

      {(mode === "local" || onlyExamples) && (
        <div className="flex items-start gap-3 rounded-2xl bg-accent-soft p-4 text-sm text-accent-ink">
          <Info className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p>
            {mode === "local"
              ? "Esta instalación funciona sin cuentas, así que la comunidad muestra fichas de ejemplo. Para compartir fichas entre docentes hay que conectar la base de datos (ver README)."
              : "Todavía nadie publicó fichas: te mostramos algunos ejemplos. ¡Sé el primero en compartir!"}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative block flex-1">
          <span className="sr-only">Buscar en la comunidad</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por tema, etiqueta o actividad…"
            className="h-11 w-full rounded-xl border border-line-strong bg-surface pr-3 pl-10 text-base text-ink placeholder:text-ink-3 focus:border-accent focus:ring-3 focus:ring-accent/20 focus:outline-none sm:text-sm"
          />
        </label>
        <label>
          <span className="sr-only">Área</span>
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="h-11 w-full rounded-xl border border-line-strong bg-surface px-3 text-sm text-ink cursor-pointer sm:w-auto">
            <option value="all">Todas las áreas</option>
            {SUBJECTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <Segmented<Sort>
          label="Ordenar"
          hideLabel
          size="sm"
          className="sm:w-56"
          value={sort}
          onChange={setSort}
          options={[
            { value: "recent", label: "Recientes" },
            { value: "popular", label: "Populares" },
          ]}
        />
      </div>

      {communityLoading && community.length === 0 ? (
        <p className="py-12 text-center text-ink-3">Cargando…</p>
      ) : list.length === 0 ? (
        <EmptyState icon={<Users className="size-7" />} title="No encontramos fichas" description="Prueba con otra búsqueda o área." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((item) => {
            const isMine = profile && item.authorId === profile.id;
            return (
              <li key={item.id}>
                <Card className="flex h-full flex-col overflow-hidden">
                  <SheetThumbnail snapshot={item.snapshot} />
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <div className="flex items-start gap-2">
                      <ActivityIcon type={item.type} size="sm" />
                      <div className="min-w-0 flex-1">
                        <h2 className="font-bold text-ink">{item.title}</h2>
                        <p className="text-sm text-ink-3">
                          {item.author.name}
                          {item.author.school ? ` · ${item.author.school}` : ""}
                        </p>
                      </div>
                    </div>
                    <p className="line-clamp-3 text-sm text-ink-2">{item.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.isExample && <Badge tone="accent">Ejemplo</Badge>}
                      <Badge>{item.subject}</Badge>
                      {item.grade && <Badge>{item.grade}</Badge>}
                      {item.tags.slice(0, 3).map((t) => (
                        <Badge key={t}>#{t}</Badge>
                      ))}
                    </div>
                    <div className="mt-auto flex items-center gap-2 pt-3">
                      <Button size="sm" variant="primary" className="flex-1" onClick={() => app.openInStudio(item.snapshot, null)} icon={<PenLine className="size-4" aria-hidden />}>
                        Usar y editar
                      </Button>
                      <IconButton size="sm" variant="secondary" label="Descargar PDF con respuestas" loading={busyId === item.id} icon={<Download className="size-4" aria-hidden />} onClick={() => download(item)} />
                      <button
                        type="button"
                        aria-pressed={item.isLiked}
                        aria-label={item.isLiked ? "Quitar me gusta" : "Me gusta"}
                        onClick={() => like(item)}
                        className={cn(
                          "flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold transition-colors cursor-pointer",
                          item.isLiked ? "bg-danger-soft text-danger-ink" : "text-ink-2 hover:bg-surface-2"
                        )}
                      >
                        <Heart className={cn("size-4", item.isLiked && "fill-current")} aria-hidden />
                        {item.likes}
                      </button>
                      {isMine && (
                        <IconButton
                          size="sm"
                          variant="ghost"
                          label="Retirar de la comunidad"
                          icon={<Trash2 className="size-4" aria-hidden />}
                          onClick={async () => {
                            if (!confirm(`¿Retirar "${item.title}" de la comunidad?`)) return;
                            await dataActions.unpublish(item.id);
                            toast.show("Publicación retirada");
                          }}
                        />
                      )}
                    </div>
                    {item.downloads > 0 && <p className="text-xs text-ink-3">{item.downloads} descargas</p>}
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
