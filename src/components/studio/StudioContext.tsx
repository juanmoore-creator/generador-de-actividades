"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import type { ActivitySnapshot } from "@/lib/types/activities";
import { generateActivity, Generated, hasContent, Issue, validateActivity } from "@/lib/activities/engine";
import { ActivityMeta, getActivity } from "@/lib/activities/catalog";
import { initialStudioState, loadDraft, saveDraft, StudioAction, studioReducer, StudioState } from "@/lib/studio/state";
import type { PdfMode } from "@/components/pdf/ActivityDocument";
import { canShareFiles, downloadBlob, pdfFileName, printBlob, renderPdfBlob, shareBlob } from "@/lib/pdf/export";
import { useToast } from "@/components/ui/Toast";

export type ExportAction = "download" | "print" | "share";

interface StudioContextValue {
  state: StudioState;
  snapshot: ActivitySnapshot;
  meta: ActivityMeta;
  dispatch: React.Dispatch<StudioAction>;
  /** Resultado generado de la versión indicada (0 = A). */
  generated: (copyIndex?: number) => Generated;
  issues: Issue[];
  canExport: boolean;
  exporting: ExportAction | null;
  exportPdf: (mode: PdfMode, action: ExportAction) => Promise<void>;
  canShare: boolean;
  regenerate: () => void;
}

const StudioContext = createContext<StudioContextValue | null>(null);

function memoizedGenerator(snapshot: ActivitySnapshot) {
  const cache = new Map<number, Generated>();
  return (copyIndex = 0) => {
    let g = cache.get(copyIndex);
    if (!g) {
      g = generateActivity(snapshot, copyIndex);
      cache.set(copyIndex, g);
    }
    return g;
  };
}

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error("useStudio debe usarse dentro de <StudioProvider>");
  return ctx;
}

export function StudioProvider({ children }: { children: React.ReactNode }) {
  // La app se renderiza sólo en el cliente, así que el borrador se lee al iniciar.
  const [state, dispatch] = useReducer(studioReducer, undefined, () => loadDraft() ?? initialStudioState());
  const [exporting, setExporting] = useState<ExportAction | null>(null);
  const [canShare] = useState(canShareFiles);
  const toast = useToast();

  // Guarda el borrador (con un pequeño retardo para no escribir en cada tecla).
  useEffect(() => {
    const t = setTimeout(() => saveDraft(state), 300);
    return () => clearTimeout(t);
  }, [state]);

  const snapshot = state.snapshot;
  const meta = getActivity(snapshot.type);

  // Resultados por versión, calculados bajo demanda y descartados al cambiar el snapshot.
  const generated = useMemo(() => memoizedGenerator(snapshot), [snapshot]);

  const issues = useMemo(() => validateActivity(snapshot, generated(0)), [snapshot, generated]);
  const canExport = hasContent(generated(0));

  const regenerate = useCallback(() => {
    const previous = snapshot.seed;
    dispatch({ type: "regenerate" });
    toast.show("Nueva variante generada", {
      tone: "info",
      action: { label: "Deshacer", onClick: () => dispatch({ type: "restoreSeed", seed: previous }) },
    });
  }, [snapshot.seed, toast]);

  const exportPdf = useCallback(
    async (mode: PdfMode, action: ExportAction) => {
      if (!canExport) {
        toast.show("Agrega contenido antes de exportar la ficha.", { tone: "error" });
        return;
      }
      setExporting(action);
      try {
        const suffix = mode === "solution" ? "Respuestas" : mode === "both" ? "Completo" : "";
        const title = snapshot.title || meta.defaultTitle;
        const blob = await renderPdfBlob([{ snapshot, mode }], title);
        const name = pdfFileName(title, suffix);
        if (action === "print") {
          await printBlob(blob);
        } else if (action === "share") {
          await shareBlob(blob, name, title);
        } else {
          downloadBlob(blob, name);
          toast.show(`Descargado: ${name}`);
        }
      } catch (e) {
        console.error(e);
        toast.show("No se pudo generar el PDF. Intenta de nuevo.", { tone: "error" });
      } finally {
        setExporting(null);
      }
    },
    [canExport, snapshot, meta.defaultTitle, toast]
  );

  const value: StudioContextValue = {
    state,
    snapshot,
    meta,
    dispatch,
    generated,
    issues,
    canExport,
    exporting,
    exportPdf,
    canShare,
    regenerate,
  };

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}
