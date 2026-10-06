import React from "react";
import {
  AlignLeft,
  ArrowRightLeft,
  BookOpen,
  Calculator,
  Disc,
  FileText,
  Grid2X2,
  Grid3X3,
  KeyRound,
  LayoutGrid,
  Link2,
  LucideIcon,
  Milestone,
  Palette,
  Shuffle,
  Sparkles,
  Triangle,
} from "lucide-react";
import type { ActivityCategory, ActivityType } from "@/lib/types/activities";
import { getActivity } from "@/lib/activities/catalog";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  AlignLeft,
  ArrowRightLeft,
  BookOpen,
  Calculator,
  Disc,
  FileText,
  Grid2X2,
  Grid3X3,
  KeyRound,
  LayoutGrid,
  Link2,
  Milestone,
  Palette,
  Shuffle,
  Sparkles,
  Triangle,
};

export const CATEGORY_TONE: Record<ActivityCategory, string> = {
  language: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  math: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  visual: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
};

export const CATEGORY_BORDER: Record<ActivityCategory, string> = {
  language: "border-sky-200 dark:border-sky-900/50 hover:border-sky-400 dark:hover:border-sky-500",
  math: "border-amber-200 dark:border-amber-900/50 hover:border-amber-400 dark:hover:border-amber-500",
  visual: "border-violet-200 dark:border-violet-900/50 hover:border-violet-400 dark:hover:border-violet-500",
};

export function IconByName({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon className={className} aria-hidden />;
}

export function ActivityIcon({ type, size = "md", className }: { type: ActivityType; size?: "sm" | "md" | "lg"; className?: string }) {
  const meta = getActivity(type);
  const box = size === "sm" ? "size-8 rounded-lg" : size === "lg" ? "size-12 rounded-2xl" : "size-10 rounded-xl";
  const icon = size === "sm" ? "size-4" : size === "lg" ? "size-6" : "size-5";
  return (
    <span className={cn("grid shrink-0 place-items-center", box, CATEGORY_TONE[meta.category], className)}>
      <IconByName name={meta.icon} className={icon} />
    </span>
  );
}
