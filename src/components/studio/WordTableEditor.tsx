"use client";

import React, { useRef, useState } from "react";
import { WordItem } from "@/lib/types/activities";
import { Plus, Trash2, RotateCcw, FileUp, Sparkles } from "lucide-react";
import { BulkImportModal } from "./BulkImportModal";

interface Props {
  items: WordItem[];
  onAddItem: () => void;
  onUpdateItem: (index: number, field: "word" | "clue", value: string) => void;
  onRemoveItem: (index: number) => void;
  onClearItems: () => void;
  onBulkImport: (items: WordItem[], mode: "replace" | "append") => void;
  showClueField?: boolean;
  minWordsNeeded?: number;
}

export const WordTableEditor = ({
  items,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onClearItems,
  onBulkImport,
  showClueField = true,
  minWordsNeeded = 3,
}: Props) => {
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const wordInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const validCount = items.filter((i) => i.word.trim().length > 0).length;

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    field: "word" | "clue"
  ) => {
    // If Enter is pressed, auto-advance or create new row
    if (e.key === "Enter") {
      e.preventDefault();
      if (index === items.length - 1) {
        onAddItem();
        setTimeout(() => {
          wordInputRefs.current[index + 1]?.focus();
        }, 30);
      } else {
        wordInputRefs.current[index + 1]?.focus();
      }
    }

    // If Backspace on an empty word input, delete row and focus previous
    if (e.key === "Backspace" && field === "word" && items[index].word === "" && items.length > 1) {
      e.preventDefault();
      onRemoveItem(index);
      setTimeout(() => {
        const prevIndex = Math.max(0, index - 1);
        wordInputRefs.current[prevIndex]?.focus();
      }, 30);
    }
  };

  return (
    <div className="space-y-3">
      {/* Editor Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-900 tracking-tight">
            Palabras del Ejercicio
          </label>
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
              validCount >= minWordsNeeded
                ? "bg-slate-100 text-slate-700"
                : "bg-amber-50 text-amber-800 border border-amber-200"
            }`}
          >
            {validCount} {validCount === 1 ? "palabra" : "palabras"}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsBulkOpen(true)}
            title="Importar lista de palabras desde texto"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50/80 hover:bg-blue-100 border border-blue-200/80 rounded-lg transition-all cursor-pointer active:scale-[0.98]"
          >
            <FileUp size={13} className="stroke-[2.2]" />
            <span>Pegar Lista</span>
          </button>

          <button
            type="button"
            onClick={onClearItems}
            title="Vaciar lista"
            aria-label="Vaciar todas las palabras"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw size={14} />
          </button>

          <button
            type="button"
            onClick={onAddItem}
            title="Añadir una palabra más"
            aria-label="Añadir palabra"
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer active:scale-[0.98]"
          >
            <Plus size={13} className="stroke-[2.5]" />
            <span>Añadir</span>
          </button>
        </div>
      </div>

      {/* Rows Container */}
      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="p-2.5 bg-slate-50/70 rounded-xl border border-slate-200/90 hover:border-slate-300 hover:bg-white transition-all duration-150 flex items-start gap-2.5 group"
          >
            {/* Number Index */}
            <span className="w-5 h-5 rounded bg-slate-200/80 text-slate-600 flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-1">
              {(idx + 1).toString().padStart(2, "0")}
            </span>

            {/* Inputs */}
            <div className="flex-1 space-y-1.5">
              <input
                ref={(el) => {
                  wordInputRefs.current[idx] = el;
                }}
                type="text"
                value={item.word}
                onChange={(e) => onUpdateItem(idx, "word", e.target.value.toUpperCase())}
                onKeyDown={(e) => handleKeyDown(e, idx, "word")}
                placeholder="PALABRA (EJ: PLANETA)"
                className="w-full bg-white px-3 py-1.5 rounded-lg border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none uppercase font-mono text-xs font-bold tracking-wide text-slate-900 shadow-2xs"
                autoComplete="off"
                spellCheck={false}
              />

              {showClueField && (
                <input
                  type="text"
                  value={item.clue}
                  onChange={(e) => onUpdateItem(idx, "clue", e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, idx, "clue")}
                  placeholder="Pista o definición para el ejercicio…"
                  className="w-full bg-white px-3 py-1.5 rounded-lg border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none text-xs text-slate-700 shadow-2xs"
                  autoComplete="off"
                />
              )}
            </div>

            {/* Delete button */}
            <button
              type="button"
              onClick={() => onRemoveItem(idx)}
              disabled={items.length === 1}
              aria-label={`Eliminar palabra ${idx + 1}`}
              className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-20 disabled:hover:text-slate-300 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer mt-0.5"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Keyboard hint */}
      <p className="text-[11px] text-slate-400 font-medium text-center pt-1">
        Tip: Presiona <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono text-[10px]">Enter</kbd> para agregar la siguiente palabra rápidamente.
      </p>

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        onImport={onBulkImport}
      />
    </div>
  );
};
