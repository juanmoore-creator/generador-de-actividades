"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface MenuItem {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  onSelect: () => void;
  disabled?: boolean;
}

interface Props {
  trigger: (props: {
    "aria-haspopup": "menu";
    "aria-expanded": boolean;
    "aria-controls": string;
    onClick: () => void;
  }) => React.ReactNode;
  items: MenuItem[];
  align?: "start" | "end";
  placement?: "bottom" | "top";
}

/** Menú desplegable con navegación por teclado (flechas, Esc, Inicio/Fin). */
export function Menu({ trigger, items, align = "end", placement = "bottom" }: Props) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!open) return;
    itemRefs.current.find((el) => el && !el.disabled)?.focus();
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const enabled = itemRefs.current.filter((el): el is HTMLButtonElement => !!el && !el.disabled);
    const index = enabled.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      (root.current?.querySelector("[aria-haspopup]") as HTMLElement | null)?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      enabled[(index + 1) % enabled.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      enabled[(index - 1 + enabled.length) % enabled.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      enabled[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      enabled[enabled.length - 1]?.focus();
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={root} className="relative" onKeyDown={onKeyDown}>
      {trigger({ "aria-haspopup": "menu", "aria-expanded": open, "aria-controls": id, onClick: () => setOpen((o) => !o) })}
      {open && (
        <div
          id={id}
          role="menu"
          className={cn(
            "absolute z-50 min-w-64 rounded-2xl border border-line bg-surface p-1.5 shadow-xl",
            align === "end" ? "right-0" : "left-0",
            placement === "bottom" ? "top-full mt-2" : "bottom-full mb-2"
          )}
        >
          {items.map((item, i) => (
            <button
              key={item.label}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
              className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-surface-2 focus:bg-surface-2 focus:outline-none disabled:opacity-50 cursor-pointer"
            >
              {item.icon && <span className="mt-0.5 text-ink-3">{item.icon}</span>}
              <span>
                <span className="block text-sm font-semibold text-ink">{item.label}</span>
                {item.description && <span className="block text-sm text-ink-3">{item.description}</span>}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
