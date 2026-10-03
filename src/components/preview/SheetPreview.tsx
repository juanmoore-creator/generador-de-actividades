"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import type { ActivitySnapshot, PageSize } from "@/lib/types/activities";
import type { Generated } from "@/lib/activities/engine";
import { getActivity } from "@/lib/activities/catalog";
import { SheetBody } from "./SheetBodies";

export const PAGE_PX: Record<PageSize, { width: number; height: number }> = {
  A4: { width: 794, height: 1123 },
  LETTER: { width: 816, height: 1056 },
};

function HeaderField({ label, width }: { label: string; width: number }) {
  return (
    <span className="flex items-end gap-1.5">
      <span className="text-slate-600">{label}</span>
      <span className="inline-block border-b border-slate-400" style={{ width }} />
    </span>
  );
}

interface SheetProps {
  snap: ActivitySnapshot;
  gen: Generated;
  showSolution: boolean;
  versionLabel?: string;
}

/** Hoja de papel a tamaño real (px a 96 ppp), idéntica en estructura al PDF. */
export function Sheet({ snap, gen, showSolution, versionLabel }: SheetProps) {
  const meta = getActivity(snap.type);
  const page = PAGE_PX[snap.sheet.pageSize];
  const header = snap.sheet.header;
  const instructions = snap.sheet.instructions.trim() || meta.defaultInstructions;
  const hasFields = header.showName || header.showDate || header.showGrade || header.showScore;

  return (
    <div
      className="paper-sheet relative font-sans"
      style={{ width: page.width, minHeight: page.height, padding: "48px 53px 64px" }}
    >
      {header.schoolName && (
        <p className="mb-2 text-center text-[11px] tracking-[0.12em] text-slate-600 uppercase">{header.schoolName}</p>
      )}
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-[27px] leading-tight font-bold text-slate-900">{snap.title || meta.defaultTitle}</h2>
        <div className="flex shrink-0 gap-2 pt-1">
          {versionLabel && (
            <span className="rounded bg-slate-200 px-2 py-1 text-[11px] font-bold text-slate-900">{versionLabel}</span>
          )}
          {showSolution && (
            <span className="rounded bg-red-100 px-2 py-1 text-[11px] font-bold text-red-600">RESPUESTAS</span>
          )}
        </div>
      </div>
      {hasFields && !showSolution && (
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5 text-[13px]">
          {header.showName && <HeaderField label="Nombre:" width={280} />}
          {header.showDate && <HeaderField label="Fecha:" width={107} />}
          {header.showGrade && <HeaderField label="Curso:" width={80} />}
          {header.showScore && <HeaderField label="Nota:" width={67} />}
        </div>
      )}
      {!showSolution && instructions && <p className="mt-4 text-[14px] leading-snug text-slate-900">{instructions}</p>}
      <div className="mt-4 mb-6 border-b border-slate-300" />
      <SheetBody gen={gen} showSolution={showSolution} />
    </div>
  );
}

interface ScaledProps {
  pageSize: PageSize;
  /** Multiplicador sobre el ajuste al ancho (1 = ocupar el ancho disponible). */
  zoom?: number;
  maxScale?: number;
  children: React.ReactNode;
  className?: string;
}

/** Escala la hoja para que entre en el contenedor, manteniendo nitidez y proporción. */
export function ScaledSheet({ pageSize, zoom = 1, maxScale = 1, children, className }: ScaledProps) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 0, height: PAGE_PX[pageSize].height });

  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const update = () => setBox({ width: o.clientWidth, height: i.offsetHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, []);

  const pageWidth = PAGE_PX[pageSize].width;
  const fit = box.width > 0 ? Math.min(maxScale, box.width / pageWidth) : 0;
  const scale = fit * zoom;

  return (
    <div ref={outer} className={className} style={{ overflowX: zoom > 1 ? "auto" : "hidden" }}>
      <div style={{ width: pageWidth * scale, height: box.height * scale, margin: "0 auto", visibility: scale ? "visible" : "hidden" }}>
        <div ref={inner} style={{ width: pageWidth, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
