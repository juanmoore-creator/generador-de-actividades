"use client";

import React, { useRef } from "react";
import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string | number> {
  value: T;
  label: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface Props<T extends string | number> {
  label: string;
  /** Oculta la etiqueta visualmente (sigue disponible para lectores de pantalla). */
  hideLabel?: boolean;
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  columns?: number;
  size?: "sm" | "md";
  className?: string;
}

/** Grupo de opciones excluyentes (radiogroup) navegable con flechas. */
export function Segmented<T extends string | number>({
  label,
  hideLabel,
  value,
  options,
  onChange,
  columns,
  size = "md",
  className,
}: Props<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const enabled = options.filter((o) => !o.disabled);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
    const current = enabled.findIndex((o) => o.value === options[index].value);
    const next = enabled[(current + dir + enabled.length) % enabled.length];
    onChange(next.value);
    refs.current[options.indexOf(next)]?.focus();
  };

  const groupId = `seg-${label.replace(/\W+/g, "-").toLowerCase()}`;

  return (
    <div className={className}>
      <div id={groupId} className={cn("mb-2 text-sm font-semibold text-ink", hideLabel && "sr-only")}>
        {label}
      </div>
      <div
        role="radiogroup"
        aria-labelledby={groupId}
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columns ?? options.length}, minmax(0, 1fr))` }}
      >
        {options.map((opt, i) => {
          const selected = opt.value === value;
          return (
            <button
              key={String(opt.value)}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              disabled={opt.disabled}
              onClick={() => onChange(opt.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border text-center transition-colors cursor-pointer",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                size === "sm" ? "min-h-9 px-2 py-1.5 text-sm" : "min-h-11 px-2 py-2 text-sm",
                selected
                  ? "border-primary bg-primary text-on-primary font-semibold"
                  : "border-line-strong bg-surface text-ink-2 hover:bg-surface-2 hover:text-ink"
              )}
            >
              <span className="flex items-center gap-1.5">
                {opt.icon}
                {opt.label}
              </span>
              {opt.hint && (
                <span className={cn("mt-0.5 text-xs", selected ? "opacity-80" : "text-ink-3")}>{opt.hint}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
