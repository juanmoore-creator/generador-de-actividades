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
  Maximize2,
  Printer,
  Repeat,
  Share2,
  SlidersHorizontal,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { ACTIVITIES, CATEGORIES } from "@/lib/activities/catalog";
import { generateActivity } from "@/lib/activities/engine";
import type { ActivityType } from "@/lib/types/activities";
import { Button, IconButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Menu } from "@/components/ui/Menu";
import { Segmented } from "@/components/ui/Segmented";
import { ActivityIcon } from "@/components/app/ActivityIcon";
import { useApp } from "@/components/app/AppContext";
import { ScaledSheet, Sheet } from "@/components/preview/SheetPreview";
import { versionLabel } from "@/components/pdf/ActivityDocument";
import { useStudio } from "./StudioContext";
import { ContentStep, IssuesList, SettingsStep, SheetStep } from "./StudioSteps";
import { cn } from "@/lib/utils";

type StepId = "content" | "settings" | "sheet";

const STEP_LABELS: Record<StepId, string> = { content: "Contenido", settings: "Ajustes", sheet: "Hoja" };

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
                  step === id ? "bg-primary text-on-primary" : "text-ink-2 hover:bg-surface-2"
                )}
              >
                <span className={cn("grid size-5 place-items-center rounded-full font-mono text-xs", step === id ? "bg-on-primary/20" : "bg-surface-3")}>
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
  const [zoom, setZoom] = useState(1);
  const copies = snapshot.sheet.copies;
  const current = Math.min(version, copies - 1);
  const gen = generated(current);

  return (
    <div className="space-y-3">
      <DesktopActionBar />

      <div className="flex flex-wrap items-center gap-2">
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
        <div className="ml-auto flex items-center gap-1">
          <IconButton size="sm" variant="ghost" label="Alejar" icon={<ZoomOut className="size-4" aria-hidden />} disabled={zoom <= 0.6} onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.2).toFixed(1)))} />
          <span className="w-12 text-center font-mono text-sm text-ink-2" aria-live="polite">
            {Math.round(zoom * 100)}%
          </span>
          <IconButton size="sm" variant="ghost" label="Acercar" icon={<ZoomIn className="size-4" aria-hidden />} disabled={zoom >= 2} onClick={() => setZoom((z) => Math.min(2, +(z + 0.2).toFixed(1)))} />
          <IconButton size="sm" variant="ghost" label="Ajustar al ancho" icon={<Maximize2 className="size-4" aria-hidden />} onClick={() => setZoom(1)} />
        </div>
      </div>

      <div className="canvas-grid rounded-2xl border border-line bg-surface-2 p-3 sm:p-5">
        {canExport ? (
          <ScaledSheet pageSize={snapshot.sheet.pageSize} zoom={zoom} className="lg:max-h-[calc(100dvh-16rem)] lg:overflow-y-auto">
            <Sheet snap={snapshot} gen={gen} showSolution={showSolution} versionLabel={versionLabel(snapshot, current)} />
          </ScaledSheet>
        ) : (
          <div className="grid min-h-80 place-items-center rounded-xl bg-surface p-8 text-center text-ink-3">
            Agrega contenido en el paso «Contenido» para ver la hoja.
          </div>
        )}
      </div>

      {/* Variantes: regenerar, deshacer y volver a una anterior */}
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="secondary" onClick={regenerate} icon={<Dices className="size-4" aria-hidden />}>
          Otra variante
        </Button>
        {state.previousSeeds.length > 0 && (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => dispatch({ type: "restoreSeed", seed: state.previousSeeds[0] })}
              icon={<Undo2 className="size-4" aria-hidden />}
            >
              Deshacer
            </Button>
            <span className="ml-auto text-sm text-ink-3">Anteriores:</span>
            <ul className="flex gap-2" aria-label="Variantes anteriores">
              {state.previousSeeds.slice(0, 3).map((seed, i) => (
                <li key={seed}>
                  <VariantThumb seed={seed} index={i} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function VariantThumb({ seed, index }: { seed: number; index: number }) {
  const { snapshot, dispatch } = useStudio();
  const snap = useMemo(() => ({ ...snapshot, seed }), [snapshot, seed]);
  const gen = useMemo(() => generateActivity(snap), [snap]);
  return (
    <button
      type="button"
      onClick={() => dispatch({ type: "restoreSeed", seed })}
      aria-label={`Volver a la variante anterior ${index + 1}`}
      className="block h-16 w-12 overflow-hidden rounded-md border border-line-strong bg-white hover:ring-2 hover:ring-accent cursor-pointer"
    >
      <span className="pointer-events-none block" aria-hidden>
        <ScaledSheet pageSize={snap.sheet.pageSize}>
          <Sheet snap={snap} gen={gen} showSolution={false} />
        </ScaledSheet>
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Acciones (una sola barra: arriba de la hoja en escritorio, fija abajo en móvil)
// ---------------------------------------------------------------------------

function useExportMenuItems() {
  const { exportPdf, snapshot } = useStudio();
  const multi = snapshot.sheet.copies > 1;
  return [
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
}

function DesktopActionBar() {
  const { exportPdf, exporting, canExport, canShare } = useStudio();
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
          <Button {...p} variant="secondary" loading={exporting === "download"} disabled={!canExport || exporting !== null} icon={<Download className="size-4" aria-hidden />}>
            Descargar PDF
            <ChevronDown className="size-4" aria-hidden />
          </Button>
        )}
      />
      {canShare && (
        <Button variant="secondary" loading={exporting === "share"} disabled={!canExport || exporting !== null} onClick={() => exportPdf("student", "share")} icon={<Share2 className="size-4" aria-hidden />}>
          Compartir
        </Button>
      )}
      <Button variant="accent" className="ml-auto" onClick={app.openSave} icon={<BookmarkPlus className="size-4" aria-hidden />}>
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
