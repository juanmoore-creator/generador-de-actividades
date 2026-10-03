"use client";

import React, { useMemo, useState } from "react";
import {
  CheckSquare,
  Copy,
  Download,
  FolderOpen,
  Heart,
  MoreVertical,
  PenLine,
  Plus,
  Printer,
  Search,
  Share2,
  Square,
  Trash2,
  X,
  Files,
} from "lucide-react";
import type { SavedActivity } from "@/lib/data/types";
import { dataActions, useDataState } from "@/lib/data/store";
import { getActivity } from "@/lib/activities/catalog";
import { Button, IconButton } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Card";
import { Menu } from "@/components/ui/Menu";
import { Modal } from "@/components/ui/Modal";
import { Segmented } from "@/components/ui/Segmented";
import { useToast } from "@/components/ui/Toast";
import { ActivityIcon } from "@/components/app/ActivityIcon";
import { useApp } from "@/components/app/AppContext";
import { SheetThumbnail } from "@/components/home/SheetThumbnail";
import type { PdfMode } from "@/components/pdf/ActivityDocument";
import { downloadBlob, pdfFileName, printBlob, renderPdfBlob } from "@/lib/pdf/export";
import { cn } from "@/lib/utils";

const dateFmt = new Intl.DateTimeFormat("es", { day: "numeric", month: "short", year: "numeric" });

export function SavedView() {
  const { saved, savedLoading, mode, profile } = useDataState();
  const app = useApp();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState<string>("all");
  const [favOnly, setFavOnly] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [packOpen, setPackOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const folders = useMemo(() => [...new Set(saved.map((s) => s.folder))].sort(), [saved]);
  const q = query.trim().toLowerCase();
  const list = saved.filter(
    (s) =>
      (folder === "all" || s.folder === folder) &&
      (!favOnly || s.isFavorite) &&
      (!q || `${s.title} ${s.notes} ${getActivity(s.type).title}`.toLowerCase().includes(q))
  );

  if (mode === "cloud" && !profile) {
    return (
      <EmptyState
        icon={<FolderOpen className="size-7" />}
        title="Inicia sesión para ver tus fichas"
        description="Tus fichas guardadas quedan en tu cuenta y las puedes abrir desde cualquier dispositivo."
        action={
          <Button variant="primary" onClick={() => app.openAuth()}>
            Iniciar sesión
          </Button>
        }
      />
    );
  }

  const exportOne = async (item: SavedActivity, pdfMode: PdfMode, action: "download" | "print") => {
    setBusyId(item.id);
    try {
      const blob = await renderPdfBlob([{ snapshot: item.snapshot, mode: pdfMode }], item.title);
      if (action === "print") await printBlob(blob);
      else downloadBlob(blob, pdfFileName(item.title, pdfMode === "solution" ? "Respuestas" : ""));
    } catch {
      toast.show("No se pudo generar el PDF.", { tone: "error" });
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (item: SavedActivity) => {
    try {
      await dataActions.deleteSaved(item.id);
      toast.show(`Se eliminó "${item.title}"`, {
        tone: "info",
        action: { label: "Deshacer", onClick: () => dataActions.restoreSaved(item) },
      });
    } catch (e) {
      toast.show((e as Error).message, { tone: "error" });
    }
  };

  const duplicate = async (item: SavedActivity) => {
    await dataActions.save({ snapshot: { ...item.snapshot, title: `${item.title} (copia)` }, folder: item.folder, notes: item.notes });
    toast.show("Ficha duplicada");
  };

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="space-y-6 pb-24 lg:pb-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Mis fichas</h1>
          <p className="text-ink-3">
            {mode === "local" ? "Guardadas en este dispositivo." : "Guardadas en tu cuenta."} {saved.length} en total.
          </p>
        </div>
        <div className="flex gap-2">
          {saved.length > 1 && (
            <Button
              variant={selecting ? "soft" : "secondary"}
              onClick={() => {
                setSelecting((v) => !v);
                setSelected([]);
              }}
              icon={selecting ? <X className="size-4" aria-hidden /> : <CheckSquare className="size-4" aria-hidden />}
            >
              {selecting ? "Cancelar" : "Combinar en un PDF"}
            </Button>
          )}
          <Button variant="primary" onClick={() => app.navigate("home")} icon={<Plus className="size-4" aria-hidden />}>
            Nueva ficha
          </Button>
        </div>
      </div>

      {saved.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block flex-1">
            <span className="sr-only">Buscar en mis fichas</span>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título, notas o actividad…"
              className="h-11 w-full rounded-xl border border-line-strong bg-surface pr-3 pl-10 text-base text-ink placeholder:text-ink-3 focus:border-accent focus:ring-3 focus:ring-accent/20 focus:outline-none sm:text-sm"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="sr-only">Carpeta</span>
            <select
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              className="h-11 rounded-xl border border-line-strong bg-surface px-3 text-sm text-ink cursor-pointer"
            >
              <option value="all">Todas las carpetas</option>
              {folders.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>
          <Button variant={favOnly ? "accent" : "secondary"} aria-pressed={favOnly} onClick={() => setFavOnly((v) => !v)} icon={<Heart className={cn("size-4", favOnly && "fill-current")} aria-hidden />}>
            Favoritas
          </Button>
        </div>
      )}

      {savedLoading && saved.length === 0 ? (
        <p className="py-12 text-center text-ink-3">Cargando…</p>
      ) : saved.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="size-7" />}
          title="Todavía no guardaste fichas"
          description="Cuando crees una ficha, toca «Guardar» para tenerla siempre a mano, editarla o volver a imprimirla."
          action={
            <Button variant="primary" onClick={() => app.navigate("home")}>
              Crear mi primera ficha
            </Button>
          }
        />
      ) : list.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-strong p-8 text-center text-ink-3">No hay fichas con esos filtros.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((item) => {
            const meta = getActivity(item.type);
            const isSelected = selected.includes(item.id);
            return (
              <li key={item.id}>
                <Card className={cn("flex h-full flex-col overflow-hidden", isSelected && "ring-2 ring-accent")}>
                  <button
                    type="button"
                    onClick={() => (selecting ? toggle(item.id) : app.openInStudio(item.snapshot, item.id))}
                    aria-pressed={selecting ? isSelected : undefined}
                    aria-label={selecting ? `Seleccionar ${item.title}` : `Abrir ${item.title} en el estudio`}
                    className="relative block text-left cursor-pointer"
                  >
                    <SheetThumbnail snapshot={item.snapshot} />
                    {selecting && (
                      <span className="absolute top-3 right-3 grid size-9 place-items-center rounded-lg bg-surface shadow">
                        {isSelected ? <CheckSquare className="size-5 text-accent" aria-hidden /> : <Square className="size-5 text-ink-3" aria-hidden />}
                      </span>
                    )}
                  </button>
                  <div className="flex flex-1 flex-col gap-1 p-4">
                    <div className="flex items-start gap-2">
                      <ActivityIcon type={item.type} size="sm" />
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate font-bold text-ink">{item.title}</h2>
                        <p className="text-sm text-ink-3">
                          {meta.title} · {item.folder}
                        </p>
                      </div>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        label={item.isFavorite ? "Quitar de favoritas" : "Marcar como favorita"}
                        aria-pressed={item.isFavorite}
                        icon={<Heart className={cn("size-4", item.isFavorite && "fill-current text-danger")} aria-hidden />}
                        onClick={() => dataActions.updateSaved(item.id, { isFavorite: !item.isFavorite })}
                      />
                    </div>
                    {item.notes && <p className="line-clamp-2 text-sm text-ink-2">{item.notes}</p>}
                    <p className="text-xs text-ink-3">Actualizada el {dateFmt.format(new Date(item.updatedAt))}</p>
                    {!selecting && (
                      <div className="mt-auto flex gap-2 pt-3">
                        <Button size="sm" variant="primary" className="flex-1" onClick={() => app.openInStudio(item.snapshot, item.id)} icon={<PenLine className="size-4" aria-hidden />}>
                          Abrir
                        </Button>
                        <IconButton size="sm" variant="secondary" label="Imprimir" loading={busyId === item.id} icon={<Printer className="size-4" aria-hidden />} onClick={() => exportOne(item, "student", "print")} />
                        <Menu
                          items={[
                            { label: "Descargar ficha", icon: <Download className="size-4" aria-hidden />, onSelect: () => exportOne(item, "student", "download") },
                            { label: "Descargar respuestas", icon: <Download className="size-4" aria-hidden />, onSelect: () => exportOne(item, "solution", "download") },
                            { label: "Duplicar", icon: <Copy className="size-4" aria-hidden />, onSelect: () => duplicate(item) },
                            ...(mode === "cloud"
                              ? [{ label: "Publicar en la comunidad", icon: <Share2 className="size-4" aria-hidden />, onSelect: () => app.openPublish(item.snapshot) }]
                              : []),
                            { label: "Eliminar", icon: <Trash2 className="size-4" aria-hidden />, onSelect: () => remove(item) },
                          ]}
                          trigger={(p) => <IconButton {...p} size="sm" variant="secondary" label={`Más acciones para ${item.title}`} icon={<MoreVertical className="size-4" aria-hidden />} />}
                        />
                      </div>
                    )}
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {selecting && (
        <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur lg:bottom-0">
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <span className="flex-1 text-sm font-medium text-ink" aria-live="polite">
              {selected.length === 0 ? "Elige las fichas a combinar" : `${selected.length} seleccionadas`}
            </span>
            <Button variant="primary" disabled={selected.length === 0} onClick={() => setPackOpen(true)} icon={<Files className="size-4" aria-hidden />}>
              Crear PDF
            </Button>
          </div>
        </div>
      )}

      {packOpen && (
        <PackDialog
          items={selected.map((id) => saved.find((s) => s.id === id)!).filter(Boolean)}
          onClose={() => setPackOpen(false)}
          onDone={() => {
            setPackOpen(false);
            setSelecting(false);
            setSelected([]);
          }}
        />
      )}
    </div>
  );
}

function PackDialog({ items, onClose, onDone }: { items: SavedActivity[]; onClose: () => void; onDone: () => void }) {
  const toast = useToast();
  const [order, setOrder] = useState(items);
  const [mode, setMode] = useState<PdfMode>("both");
  const [busy, setBusy] = useState(false);

  const move = (i: number, dir: -1 | 1) =>
    setOrder((o) => {
      const next = [...o];
      [next[i], next[i + dir]] = [next[i + dir], next[i]];
      return next;
    });

  const build = async (action: "download" | "print") => {
    setBusy(true);
    try {
      const title = "Cuadernillo de actividades";
      // Con "both": primero todas las fichas y al final todas las respuestas.
      const jobs =
        mode === "both"
          ? [...order.map((i) => ({ snapshot: i.snapshot, mode: "student" as const })), ...order.map((i) => ({ snapshot: i.snapshot, mode: "solution" as const }))]
          : order.map((i) => ({ snapshot: i.snapshot, mode }));
      const blob = await renderPdfBlob(jobs, title);
      if (action === "print") await printBlob(blob);
      else downloadBlob(blob, pdfFileName(title));
      onDone();
    } catch {
      toast.show("No se pudo generar el PDF.", { tone: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Combinar fichas en un PDF"
      description="Ordena las fichas como quieres que salgan en el cuadernillo."
      footer={
        <>
          <Button variant="secondary" disabled={busy} onClick={() => build("print")} icon={<Printer className="size-4" aria-hidden />}>
            Imprimir
          </Button>
          <Button variant="primary" loading={busy} onClick={() => build("download")} icon={<Download className="size-4" aria-hidden />}>
            Descargar PDF
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <ol className="space-y-2">
          {order.map((item, i) => (
            <li key={item.id} className="flex items-center gap-3 rounded-xl border border-line p-2.5">
              <span className="w-6 text-center font-mono text-sm text-ink-3">{i + 1}</span>
              <ActivityIcon type={item.type} size="sm" />
              <span className="min-w-0 flex-1 truncate font-medium text-ink">{item.title}</span>
              <IconButton size="sm" variant="ghost" label={`Subir ${item.title}`} disabled={i === 0} icon={<span aria-hidden>↑</span>} onClick={() => move(i, -1)} />
              <IconButton size="sm" variant="ghost" label={`Bajar ${item.title}`} disabled={i === order.length - 1} icon={<span aria-hidden>↓</span>} onClick={() => move(i, 1)} />
            </li>
          ))}
        </ol>
        <Segmented<PdfMode>
          label="Incluir"
          value={mode}
          onChange={setMode}
          options={[
            { value: "student", label: "Fichas" },
            { value: "solution", label: "Respuestas" },
            { value: "both", label: "Ambas" },
          ]}
        />
      </div>
    </Modal>
  );
}
