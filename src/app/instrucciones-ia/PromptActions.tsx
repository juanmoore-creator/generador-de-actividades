"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Copy, Download, ArrowRight } from "lucide-react";

interface PromptActionsProps {
  promptText: string;
  sampleCsv: string;
}

export function PromptActions({ promptText, sampleCsv }: PromptActionsProps) {
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownloadCsv = () => {
    const blob = new Blob([sampleCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "ejemplo-actividades-genact.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handleCopyPrompt}
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary shadow-xs transition-colors hover:bg-primary-hover active:scale-[0.98]"
      >
        {copiedPrompt ? (
          <>
            <Check className="size-4 text-ok" aria-hidden />
            <span>¡Prompt copiado!</span>
          </>
        ) : (
          <>
            <Copy className="size-4" aria-hidden />
            <span>Copiar prompt para la IA</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={handleDownloadCsv}
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink shadow-xs transition-colors hover:bg-surface-2 active:scale-[0.98]"
      >
        <Download className="size-4 text-ink-3" aria-hidden />
        <span>Descargar CSV de ejemplo</span>
      </button>

      <Link
        href="/"
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink-2 shadow-xs transition-colors hover:bg-surface-2 hover:text-ink active:scale-[0.98]"
      >
        <span>Ir a GenAct</span>
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}

export function CopyCsvInlineButton({ csvText }: { csvText: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(csvText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-medium text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
      title="Copiar contenido CSV"
    >
      {copied ? (
        <>
          <Check className="size-3.5 text-ok" aria-hidden />
          <span>Copiado</span>
        </>
      ) : (
        <>
          <Copy className="size-3.5" aria-hidden />
          <span>Copiar CSV</span>
        </>
      )}
    </button>
  );
}
