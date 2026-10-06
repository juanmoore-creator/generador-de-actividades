import React from "react";
import { cn } from "@/lib/utils";

export type Tone = "neutral" | "accent" | "ok" | "warn" | "danger" | "language" | "math" | "visual";

const TONES: Record<Tone, string> = {
  neutral: "bg-surface-2 text-ink-2",
  accent: "bg-accent-soft text-accent-ink",
  ok: "bg-ok-soft text-ok-ink",
  warn: "bg-warn-soft text-warn-ink",
  danger: "bg-danger-soft text-danger-ink",
  language: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  math: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  visual: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
};

export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", TONES[tone], className)}>
      {children}
    </span>
  );
}
