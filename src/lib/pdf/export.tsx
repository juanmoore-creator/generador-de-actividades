"use client";

import React from "react";
import type { PdfJob } from "@/components/pdf/ActivityDocument";

/** Genera el PDF en el navegador (react-pdf se carga sólo cuando hace falta). */
export async function renderPdfBlob(jobs: PdfJob[], title: string): Promise<Blob> {
  const [{ pdf }, { ActivityDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/components/pdf/ActivityDocument"),
  ]);
  return pdf(<ActivityDocument jobs={jobs} title={title} />).toBlob();
}

export function pdfFileName(title: string, suffix = ""): string {
  const base =
    title
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "_")
      .slice(0, 60) || "Ficha";
  return `${base}${suffix ? `_${suffix}` : ""}.pdf`;
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

const isIOS = () =>
  typeof navigator !== "undefined" &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

/**
 * Abre el diálogo de impresión con el PDF. En iOS (donde imprimir desde un iframe
 * no funciona) abre el PDF en una pestaña nueva para usar "Compartir → Imprimir".
 */
export function printBlob(blob: Blob): Promise<void> {
  const url = URL.createObjectURL(blob);
  if (isIOS()) {
    window.open(url, "_blank", "noopener");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
    iframe.src = url;
    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        window.open(url, "_blank", "noopener");
      }
      resolve();
      setTimeout(() => {
        iframe.remove();
        URL.revokeObjectURL(url);
      }, 60_000);
    };
    document.body.appendChild(iframe);
  });
}

export function canShareFiles(): boolean {
  if (typeof navigator === "undefined" || !navigator.canShare) return false;
  try {
    const probe = new File([new Blob(["x"], { type: "application/pdf" })], "x.pdf", { type: "application/pdf" });
    return navigator.canShare({ files: [probe] });
  } catch {
    return false;
  }
}

/** Comparte el PDF con las apps del teléfono (WhatsApp, Drive, correo…). */
export async function shareBlob(blob: Blob, fileName: string, title: string): Promise<"shared" | "cancelled"> {
  const file = new File([blob], fileName, { type: "application/pdf" });
  try {
    await navigator.share({ files: [file], title });
    return "shared";
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
    throw err;
  }
}
