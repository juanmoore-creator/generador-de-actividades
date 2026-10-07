"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookmarkPlus,
  ChevronDown,
  Dices,
  Download,
  Eye,
  FileCheck2,
  Files,
  Printer,
  Repeat,
  Share2,
  SlidersHorizontal,
  Undo2,
  X,
} from "lucide-react";
import { ACTIVITIES, CATEGORIES, getActivity } from "@/lib/activities/catalog";
import type { ActivityType } from "@/lib/types/activities";
import { Button, IconButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Menu } from "@/components/ui/Menu";
import { Segmented } from "@/components/ui/Segmented";
import { ActivityIcon } from "@/components/app/ActivityIcon";
import { useApp } from "@/components/app/AppContext";
import { useToast } from "@/components/ui/Toast";
import { downloadBlob, pdfFileName, renderPdfBlob } from "@/lib/pdf/export";
import { ScaledSheet, Sheet } from "@/components/preview/SheetPreview";
import { versionLabel } from "@/components/pdf/ActivityDocument";
import { useStudio } from "./StudioContext";
import { ContentStep, IssuesList, SettingsStep, SheetStep } from "./StudioSteps";
import { cn } from "@/lib/utils";

type StepId = "content" | "settings" | "sheet";

const STEP_LABELS: Record<StepId, string> = { content: "Contenido", settings: "Ajustes", sheet: "Hoja" };

function PackHeaderBar() {
  const { state, dispatch } = useStudio();
  const toast = useToast();
  const [downloading, setDownloading] = useState(false);
  const pack = state.pack;
  if (!pack) return null;

  const handleDownloadPack = async () => {
    setDownloading(true);
    try {
      const jobs = pack.activities.map((a) => ({
        snapshot: a.snapshot,
        mode: "student" as const,
      }));
      const blob = await renderPdfBlob(jobs, pack.title);
      downloadBlob(blob, pdfFileName(pack.title, "Cuadernillo"));
      toast.show(`Cuadernillo "${pack.title}" descargado`, { tone: "info" });
    } catch (e) {
      console.error(e);
      toast.show("No se pudo generar el PDF del cuadernillo", { tone: "error" });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <aside
      aria-label="Cuadernillo de actividades"
      className="mb-4 rounded-2xl border border-primary/25 bg-primary-soft/30 p-3 sm:p-4 shadow-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-on-primary text-base shadow-xs" aria-hidden>
            📚
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Cuadernillo
              </span>
              <span className="inline-flex items-center rounded-full bg-surface border border-line px-2 py-0.5 text-xs font-medium text-ink-2">
                Ficha {pack.currentIndex + 1} de {pack.activities.length}
              </span>
            </div>
            <h2 className="truncate text-base font-bold text-ink">
              {pack.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            loading={downloading}
            disabled={downloading}
            onClick={handleDownloadPack}
            icon={<Download className="size-4" aria-hidden />}
          >
            Descargar Cuadernillo ({pack.activities.length})
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => dispatch({ type: "closePack" })}
            icon={<X className="size-4" aria-hidden />}
            title="Cerrar cuadernillo"
          >
            Cerrar cuadernillo
          </Button>
        </div>
      </div>

      {/* Tira horizontal interactiva de actividades del cuadernillo */}
      <div
        role="tablist"
        aria-label="Actividades del cuadernillo"
        className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin"
      >
        {pack.activities.map((act, i) => {
          const actMeta = getActivity(act.type);
          const isActive = i === pack.currentIndex;
          return (
            <button
              key={`${act.type}-${i}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => dispatch({ type: "switchPackActivity", index: i })}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 border",
                isActive
                  ? "bg-primary text-on-primary border-primary shadow-xs ring-2 ring-primary/20"
                  : "bg-surface text-ink-2 border-line hover:bg-surface-2 hover:text-ink hover:border-line-strong"
              )}
            >
              <ActivityIcon
                type={act.type}
                size="sm"
                className={cn("size-6 rounded-md", isActive && "ring-1 ring-on-primary/30")}
              />
              <span className="truncate max-w-44">
                {i + 1}. {act.snapshot.title || actMeta.title}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export function StudioView() {
  const { meta, snapshot, issues, state } = useStudio();
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [stepState, setStep] = useState<StepId>("content");
  const [pickerOpen, setPickerOpen] = useState(false);

  // Los pasos dependen de la actividad: sin contenido o sin ajustes, ese paso no aparece.
  const steps = useMemo<StepId[]>(
    () => [...(meta.content ? (["content"] as const) : []), ...(meta.settings.length ? (["settings"] as const) : []), "sheet"],
    [meta]
  );
  const step = steps.includes(stepState) ? stepState : steps[0];
  const index = steps.indexOf(step);
  const errorCount = issues.filter((i) => i.level === "error").length;

  return (
    <div className="pb-36 lg:pb-0">
      {state.pack && <PackHeaderBar />}

      {/* Cabecera del estudio */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <ActivityIcon type={snapshot.type} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-ink-3">{meta.title}</p>
          <h1 className="truncate text-xl font-bold text-ink">{snapshot.title || meta.defaultTitle}</h1>
        </div>
        <span className="hidden text-sm text-ink-3 sm:block" aria-live="polite">
          {state.savedId ? (state.dirty ? "Cambios sin guardar" : "Guardada en Mis fichas") : "Borrador en este dispositivo"}
        </span>
        <Button variant="secondary" size="sm" onClick={() => setPickerOpen(true)} icon={<Repeat className="size-4" aria-hidden />}>
          Cambiar actividad
        </Button>
      </div>

      {/* Móvil: alternar entre editar y ver la hoja */}
      <div className="sticky top-16 z-20 -mx-4 mb-4 bg-bg/95 px-4 py-2 backdrop-blur lg:hidden">
        <Segmented
          label="Vista"
          hideLabel
          value={mobileView}
          onChange={setMobileView}
          options={[
            {
              value: "edit",
              label: errorCount ? `Editar (${errorCount})` : "Editar",
              icon: <SlidersHorizontal className="size-4" aria-hidden />,
            },
            { value: "preview", label: "Ver hoja", icon: <Eye className="size-4" aria-hidden /> },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Columna de edición */}
        <section aria-label="Editor" className={cn("space-y-4 lg:col-span-5", mobileView === "preview" && "hidden lg:block")}>
          <div role="tablist" aria-label="Pasos" className="grid gap-1 rounded-2xl border border-line bg-surface p-1" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0,1fr))` }}>
            {steps.map((id, i) => (
              <button
                key={id}
                id={`tab-${id}`}
                role="tab"
                type="button"
                aria-selected={step === id}
                aria-controls={`panel-${id}`}
                onClick={() => setStep(id)}
                className={cn(
                  "flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer",
                  step === id ? "bg-primary text-on-primary shadow-xs" : "text-ink-2 hover:bg-surface-2"
                )}
              >
                <span className={cn("grid size-5 place-items-center rounded-full font-mono text-xs", step === id ? "bg-on-primary/25" : "bg-surface-3")}>
                  {i + 1}
                </span>
                {STEP_LABELS[id]}
              </button>
            ))}
          </div>

          <IssuesList issues={issues} />

          <Card id={`panel-${step}`} role="tabpanel" aria-labelledby={`tab-${step}`} className="p-4 sm:p-5">
            {step === "content" && <ContentStep />}
            {step === "settings" && <SettingsStep />}
            {step === "sheet" && <SheetStep />}
          </Card>

          <div className="flex gap-2">
            {index > 0 && (
              <Button variant="secondary" onClick={() => setStep(steps[index - 1])} icon={<ArrowLeft className="size-4" aria-hidden />}>
                {STEP_LABELS[steps[index - 1]]}
              </Button>
            )}
            {index < steps.length - 1 ? (
              <Button variant="primary" className="flex-1" onClick={() => setStep(steps[index + 1])}>
                Siguiente: {STEP_LABELS[steps[index + 1]]}
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            ) : (
              <Button variant="secondary" className="flex-1 lg:hidden" onClick={() => setMobileView("preview")} icon={<Eye className="size-4" aria-hidden />}>
                Ver la hoja
              </Button>
            )}
          </div>
        </section>

        {/* Columna de vista previa */}
        <section aria-label="Vista previa de la hoja" className={cn("lg:sticky lg:top-20 lg:col-span-7", mobileView === "edit" && "hidden lg:block")}>
          <PreviewPane />
        </section>
      </div>

      <MobileActionBar />
      {pickerOpen && <ActivityPickerDialog onClose={() => setPickerOpen(false)} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Vista previa
// ---------------------------------------------------------------------------

function PreviewPane() {
  const { snapshot, generated, state, dispatch, regenerate, canExport } = useStudio();
  const [showSolution, setShowSolution] = useState(false);
  const [version, setVersion] = useState(0);
  const copies = snapshot.sheet.copies;
  const current = Math.min(version, copies - 1);
  const gen = generated(current);

  return (
    <div className="space-y-3">
      <DesktopActionBar />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Segmented
          label="Mostrar"
          hideLabel
          size="sm"
          className="w-56"
          value={showSolution ? "solution" : "student"}
          onChange={(v) => setShowSolution(v === "solution")}
          options={[
            { value: "student", label: "Alumno" },
            { value: "solution", label: "Respuestas" },
          ]}
        />
        {copies > 1 && (
          <label className="flex items-center gap-2 text-sm text-ink-2">
            <span className="sr-only sm:not-sr-only">Versión</span>
            <select
              value={current}
              onChange={(e) => setVersion(Number(e.target.value))}
              className="h-9 rounded-lg border border-line-strong bg-surface px-2 text-sm text-ink cursor-pointer"
            >
              {Array.from({ length: copies }, (_, i) => (
                <option key={i} value={i}>
                  {versionLabel(snapshot, i)}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="canvas-grid rounded-2xl border border-line bg-surface-2 p-3 sm:p-5">
        {canExport ? (
          <ScaledSheet pageSize={snapshot.sheet.pageSize} className="lg:max-h-[calc(100dvh-16rem)] lg:overflow-y-auto">
            <Sheet snap={snapshot} gen={gen} showSolution={showSolution} versionLabel={versionLabel(snapshot, current)} />
          </ScaledSheet>
        ) : (
          <div className="grid min-h-80 place-items-center rounded-xl bg-surface p-8 text-center text-ink-3">
            Agrega contenido en el paso «Contenido» para ver la hoja.
          </div>
        )}
      </div>

      {/* Variantes: regenerar y deshacer */}
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={regenerate} icon={<Dices className="size-4" aria-hidden />}>
          Otra variante
        </Button>
        {state.previousSeeds.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => dispatch({ type: "restoreSeed", seed: state.previousSeeds[0] })}
            icon={<Undo2 className="size-4" aria-hidden />}
          >
            Deshacer
          </Button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Acciones (una sola barra: arriba de la hoja en escritorio, fija abajo en móvil)
// ---------------------------------------------------------------------------

function useExportMenuItems() {
  const { exportPdf, snapshot, canShare } = useStudio();
  const multi = snapshot.sheet.copies > 1;
  const items = [
    {
      label: "Ficha del alumno",
      description: multi ? `${snapshot.sheet.copies} versiones` : "Lista para imprimir",
      icon: <FileCheck2 className="size-4" aria-hidden />,
      onSelect: () => exportPdf("student", "download"),
    },
    {
      label: "Hoja de respuestas",
      description: "Para el docente",
      icon: <Download className="size-4" aria-hidden />,
      onSelect: () => exportPdf("solution", "download"),
    },
    {
      label: "Todo en un PDF",
      description: "Fichas y respuestas al final",
      icon: <Files className="size-4" aria-hidden />,
      onSelect: () => exportPdf("both", "download"),
    },
  ];

  if (canShare) {
    items.push({
      label: "Compartir",
      description: "WhatsApp, correo, Drive…",
      icon: <Share2 className="size-4" aria-hidden />,
      onSelect: () => exportPdf("student", "share"),
    });
  }

  return items;
}

function DesktopActionBar() {
  const { exportPdf, exporting, canExport } = useStudio();
  const app = useApp();
  const items = useExportMenuItems();
  return (
    <div className="hidden flex-wrap items-center gap-2 lg:flex">
      <Button variant="primary" loading={exporting === "print"} disabled={!canExport || exporting !== null} onClick={() => exportPdf("student", "print")} icon={<Printer className="size-4" aria-hidden />}>
        Imprimir
      </Button>
      <Menu
        align="start"
        items={items}
        trigger={(p) => (
          <Button {...p} variant="secondary" loading={exporting === "download" || exporting === "share"} disabled={!canExport || exporting !== null} icon={<Download className="size-4" aria-hidden />}>
            Descargar PDF
            <ChevronDown className="size-4" aria-hidden />
          </Button>
        )}
      />
      <Button variant="secondary" className="ml-auto" onClick={app.openSave} icon={<BookmarkPlus className="size-4" aria-hidden />}>
        Guardar
      </Button>
    </div>
  );
}

function MobileActionBar() {
  const { exportPdf, exporting, canExport, canShare } = useStudio();
  const app = useApp();
  const items = useExportMenuItems();
  const all = canShare
    ? [...items, { label: "Compartir", description: "WhatsApp, correo, Drive…", icon: <Share2 className="size-4" aria-hidden />, onSelect: () => exportPdf("student", "share") }]
    : items;
  return (
    <div className="no-print fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t border-line bg-surface/95 px-4 py-2.5 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-xl items-center gap-2">
        <IconButton variant="accent" label="Guardar en Mis fichas" icon={<BookmarkPlus className="size-5" aria-hidden />} onClick={app.openSave} />
        <Menu
          align="start"
          placement="top"
          items={all}
          trigger={(p) => (
            <IconButton {...p} variant="secondary" label="Descargar o compartir" loading={exporting === "download" || exporting === "share"} disabled={!canExport || exporting !== null} icon={<Download className="size-5" aria-hidden />} />
          )}
        />
        <Button variant="primary" className="flex-1" loading={exporting === "print"} disabled={!canExport || exporting !== null} onClick={() => exportPdf("student", "print")} icon={<Printer className="size-4" aria-hidden />}>
          Imprimir
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cambiar de actividad conservando el contenido
// ---------------------------------------------------------------------------

function ActivityPickerDialog({ onClose }: { onClose: () => void }) {
  const { snapshot, dispatch } = useStudio();
  const pick = (type: ActivityType) => {
    dispatch({ type: "setActivity", activity: type });
    onClose();
  };
  return (
    <Modal open onClose={onClose} size="lg" title="Cambiar actividad" description="Tus palabras, el título y el encabezado se conservan.">
      <div className="space-y-5">
        {CATEGORIES.map((cat) => (
          <section key={cat.id}>
            <h3 className="mb-2 text-sm font-semibold text-ink-3">{cat.label}</h3>
            <ul className="grid gap-2 sm:grid-cols-2">
              {ACTIVITIES.filter((a) => a.category === cat.id).map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    aria-current={a.id === snapshot.type}
                    onClick={() => pick(a.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors cursor-pointer",
                      a.id === snapshot.type ? "border-accent bg-accent-soft" : "border-line hover:bg-surface-2"
                    )}
                  >
                    <ActivityIcon type={a.id} size="sm" />
                    <span className="min-w-0">
                      <span className="block font-semibold text-ink">{a.title}</span>
                      <span className="block truncate text-sm text-ink-3">{a.description}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Modal>
  );
}
