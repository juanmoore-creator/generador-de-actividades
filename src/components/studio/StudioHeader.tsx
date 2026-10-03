"use client";

import React, { useState, useRef, useEffect } from "react";
import { Edit2, Check, Sparkles, ChevronDown, Download, Printer } from "lucide-react";

interface Props {
  title: string;
  onTitleChange: (newTitle: string) => void;
  presets: Record<string, { title: string; emoji: string }>;
  onSelectPreset: (key: string) => void;
  onDownloadActivity: () => void;
  onDownloadSolution: () => void;
  isDownloading: boolean;
}

export const StudioHeader = ({
  title,
  onTitleChange,
  presets,
  onSelectPreset,
  onDownloadActivity,
  onDownloadSolution,
  isDownloading,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const presetsRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const [prevTitle, setPrevTitle] = useState(title);
  if (prevTitle !== title) {
    setPrevTitle(title);
    setTempTitle(title);
  }

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (presetsRef.current && !presetsRef.current.contains(e.target as Node)) {
        setIsPresetsOpen(false);
      }
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSaveTitle = () => {
    if (tempTitle.trim()) {
      onTitleChange(tempTitle.trim());
    } else {
      setTempTitle(title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSaveTitle();
    if (e.key === "Escape") {
      setTempTitle(title);
      setIsEditing(false);
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Monogram + Inline Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs font-mono shrink-0">
            GA
          </div>

          <div className="flex items-center gap-2 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSaveTitle}
                  className="px-2 py-1 rounded-md border border-blue-500 font-bold text-sm text-slate-900 outline-none w-56 sm:w-72 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={handleSaveTitle}
                  className="p-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                  aria-label="Confirmar título"
                >
                  <Check size={13} className="stroke-[3]" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => setIsEditing(true)}
                className="group flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-100 transition-colors"
                title="Haz clic para editar el título de la ficha"
              >
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 truncate tracking-tight font-heading">
                  {title}
                </h1>
                <Edit2
                  size={12}
                  className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: Presets & Unified Export */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Presets Dropdown */}
          <div ref={presetsRef} className="relative">
            <button
              type="button"
              onClick={() => setIsPresetsOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all cursor-pointer active:scale-[0.98]"
            >
              <Sparkles size={13} className="text-blue-600" />
              <span className="hidden sm:inline">Temas Listos</span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>

            {isPresetsOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 z-40 animate-in fade-in duration-100">
                <span className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Cargar tema educativo:
                </span>
                {Object.entries(presets).map(([key, p]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      onSelectPreset(key);
                      setIsPresetsOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>{p.emoji}</span>
                    <span className="truncate">{p.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Dropdown */}
          <div ref={exportRef} className="relative">
            <button
              type="button"
              onClick={() => setIsExportOpen((prev) => !prev)}
              disabled={isDownloading}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-50"
            >
              <Download size={13} className="stroke-[2.5]" />
              <span>Exportar PDF</span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>

            {isExportOpen && (
              <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-40 animate-in fade-in duration-100">
                <button
                  type="button"
                  onClick={() => {
                    onDownloadActivity();
                    setIsExportOpen(false);
                  }}
                  className="w-full px-3.5 py-2.5 text-left text-xs text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Printer size={15} className="text-blue-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Ficha para Alumnos</span>
                    <span className="text-[10px] text-slate-500">PDF A4 listo para imprimir</span>
                  </div>
                </button>

                <div className="h-px bg-slate-100 my-1" />

                <button
                  type="button"
                  onClick={() => {
                    onDownloadSolution();
                    setIsExportOpen(false);
                  }}
                  className="w-full px-3.5 py-2.5 text-left text-xs text-slate-800 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Check size={15} className="text-rose-600 shrink-0 stroke-[2.5]" />
                  <div>
                    <span className="font-bold block">Solucionario Docente</span>
                    <span className="text-[10px] text-slate-500">Con respuestas en color</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
