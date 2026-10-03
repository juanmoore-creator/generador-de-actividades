"use client";

import React, { useState, useMemo, useEffect } from "react";
import { WordItem } from "@/lib/types/activities";
import { X, FileUp, Sparkles, Check, AlertCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: WordItem[], mode: "replace" | "append") => void;
}

export function parseBulkText(text: string): WordItem[] {
  if (!text.trim()) return [];

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const results: WordItem[] = [];

  for (const line of lines) {
    // If the line contains comma-separated words with no clues (e.g. "PERRO, GATO, ELEFANTE")
    if (line.includes(",") && !line.includes(":") && !line.includes("-") && !line.includes("\t")) {
      const parts = line.split(",").map((p) => p.trim()).filter(Boolean);
      for (const p of parts) {
        results.push({ word: p.toUpperCase(), clue: "" });
      }
      continue;
    }

    // Check for common separators: ":", "-", "=", or Tab (\t)
    let separatorIndex = -1;
    let separatorLength = 1;

    if (line.includes("\t")) {
      separatorIndex = line.indexOf("\t");
    } else if (line.includes(":")) {
      separatorIndex = line.indexOf(":");
    } else if (line.includes(" - ")) {
      separatorIndex = line.indexOf(" - ");
      separatorLength = 3;
    } else if (line.includes(" = ")) {
      separatorIndex = line.indexOf(" = ");
      separatorLength = 3;
    }

    if (separatorIndex !== -1) {
      const wordPart = line.substring(0, separatorIndex).trim().toUpperCase();
      const cluePart = line.substring(separatorIndex + separatorLength).trim();
      if (wordPart) {
        results.push({ word: wordPart, clue: cluePart });
      }
    } else {
      // Single word on the line
      results.push({ word: line.toUpperCase(), clue: "" });
    }
  }

  return results;
}

export const BulkImportModal = ({ isOpen, onClose, onImport }: Props) => {
  const [rawText, setRawText] = useState("");

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const parsedItems = useMemo(() => parseBulkText(rawText), [rawText]);

  if (!isOpen) return null;

  const handleApply = (mode: "replace" | "append") => {
    if (parsedItems.length === 0) return;
    onImport(parsedItems, mode);
    setRawText("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bulk-import-title"
    >
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileUp size={17} className="stroke-[2.2]" />
            </div>
            <div>
              <h3 id="bulk-import-title" className="text-sm font-bold text-slate-900">
                Pegado Rápido de Palabras
              </h3>
              <p className="text-xs text-slate-500">
                Importa listas desde ChatGPT, Word o Excel en segundos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana de importación"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <label
              htmlFor="bulk-textarea"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Pega tu texto o lista aquí:
            </label>
            <textarea
              id="bulk-textarea"
              rows={7}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`Ejemplo:\nSOL: Estrella central del sistema planetario\nTIERRA: Nuestro planeta con vida\nMARTE: El planeta rojo\nO lista simple:\nPERRO, GATO, ELEFANTE, JIRAFA`}
              className="w-full p-3.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10 outline-none font-mono text-xs text-slate-900 leading-relaxed bg-slate-50/50 hover:bg-white focus:bg-white transition-all"
              autoFocus
            />
          </div>

          {/* Live Parsing Preview */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Sparkles size={14} className="text-blue-600" />
                Vista previa del desglose
              </span>
              <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {parsedItems.length} {parsedItems.length === 1 ? "palabra" : "palabras"}
              </span>
            </div>

            {parsedItems.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                Escribe o pega texto arriba para ver la detección automática.
              </p>
            ) : (
              <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                {parsedItems.slice(0, 5).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60 last:border-0"
                  >
                    <span className="font-mono font-bold text-slate-900 truncate mr-2">
                      {item.word}
                    </span>
                    <span className="text-slate-500 truncate max-w-[240px] text-right">
                      {item.clue || <span className="text-slate-300 italic">Sin pista</span>}
                    </span>
                  </div>
                ))}
                {parsedItems.length > 5 && (
                  <p className="text-[11px] text-slate-400 text-center pt-1 font-medium">
                    + {parsedItems.length - 5} palabras más…
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => handleApply("append")}
            disabled={parsedItems.length === 0}
            className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
          >
            Añadir a la lista
          </button>

          <button
            type="button"
            onClick={() => handleApply("replace")}
            disabled={parsedItems.length === 0}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
          >
            Reemplazar lista ({parsedItems.length})
          </button>
        </div>
      </div>
    </div>
  );
};
