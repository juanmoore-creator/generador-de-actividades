"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  ChevronDown,
  Download,
  Printer,
  Check,
  Edit2,
  FolderHeart,
  Globe2,
  BookmarkPlus,
  CloudCheck,
  LogIn,
} from "lucide-react";
import { PwaTab, UserProfile } from "@/lib/types/pwa";

interface PwaTopHeaderProps {
  activeTab: PwaTab;
  onTabChange: (tab: PwaTab) => void;
  title: string;
  onTitleChange: (newTitle: string) => void;
  presets: Record<string, { title: string; emoji: string }>;
  onSelectPreset: (key: string) => void;
  onDownloadActivity: () => void;
  onDownloadSolution: () => void;
  onSaveCurrent: () => void;
  onOpenAuth: () => void;
  isDownloading: boolean;
  user: UserProfile;
  savedCount: number;
}

export const PwaTopHeader: React.FC<PwaTopHeaderProps> = ({
  activeTab,
  onTabChange,
  title,
  onTitleChange,
  presets,
  onSelectPreset,
  onDownloadActivity,
  onDownloadSolution,
  onSaveCurrent,
  onOpenAuth,
  isDownloading,
  user,
  savedCount,
}) => {
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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-15 sm:h-16 flex items-center justify-between gap-3">
        {/* Left Section: Logo & Tab Switcher (Desktop) / Mobile Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            onClick={() => onTabChange("studio")}
            className="flex items-center gap-2.5 cursor-pointer shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs font-mono">
              GA
            </div>
            <div className="hidden lg:block leading-tight">
              <span className="font-black text-sm text-slate-900 tracking-tight font-heading">
                GenAct
              </span>
              <span className="block text-[9px] font-bold text-blue-600 uppercase tracking-widest">
                Studio PWA
              </span>
            </div>
          </div>

          {/* Desktop Tab Switcher */}
          <nav aria-label="Secciones de la aplicación" className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl ml-2">
            <button
              type="button"
              onClick={() => onTabChange("studio")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "studio"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Estudio
            </button>
            <button
              type="button"
              onClick={() => onTabChange("saved")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "saved"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FolderHeart size={13} className={activeTab === "saved" ? "text-blue-600" : "text-slate-400"} />
              <span>Mis Fichas</span>
              {savedCount > 0 && (
                <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                  {savedCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => onTabChange("community")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "community"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Globe2 size={13} className={activeTab === "community" ? "text-blue-600" : "text-slate-400"} />
              <span>Comunidad</span>
              <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                Pública
              </span>
            </button>
          </nav>

          {/* Active Screen Title / Studio Title */}
          {activeTab === "studio" ? (
            <div className="flex items-center gap-2 min-w-0 ml-1">
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSaveTitle}
                    className="px-2 py-1 rounded-lg border border-blue-500 font-bold text-xs sm:text-sm text-slate-900 outline-none w-40 sm:w-60 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={handleSaveTitle}
                    className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                    aria-label="Confirmar título"
                  >
                    <Check size={13} className="stroke-[3]" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditing(true)}
                  className="group flex items-center gap-1.5 cursor-pointer py-1 px-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Haz clic para editar el título"
                >
                  <h1 className="text-xs sm:text-base font-extrabold text-slate-900 truncate tracking-tight font-heading max-w-[130px] sm:max-w-xs md:max-w-sm">
                    {title}
                  </h1>
                  <Edit2
                    size={12}
                    className="text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity shrink-0 hidden sm:block"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="ml-1">
              <h1 className="text-xs sm:text-base font-extrabold text-slate-900 tracking-tight font-heading">
                {activeTab === "saved" && "Mis Actividades Guardadas"}
                {activeTab === "community" && "Biblioteca Pública Docente"}
                {activeTab === "profile" && "Mi Cuenta Docente"}
              </h1>
            </div>
          )}
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Studio Specific Quick Actions */}
          {activeTab === "studio" && (
            <>
              {/* Quick Save Current Activity Button */}
              <button
                type="button"
                onClick={onSaveCurrent}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all cursor-pointer active:scale-95 border border-slate-200/60"
                title="Guardar en Mis Fichas"
              >
                <BookmarkPlus size={14} className="text-blue-600" />
                <span className="hidden sm:inline">Guardar</span>
              </button>

              {/* Presets Dropdown */}
              <div ref={presetsRef} className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setIsPresetsOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all cursor-pointer active:scale-95"
                >
                  <Sparkles size={13} className="text-blue-600" />
                  <span>Temas</span>
                  <ChevronDown size={13} className="text-slate-400" />
                </button>

                {isPresetsOpen && (
                  <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-40 animate-in fade-in duration-100">
                    <span className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Cargar tema curricular:
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
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                >
                  <Download size={13} className="stroke-[2.5]" />
                  <span className="hidden xs:inline">PDF</span>
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
            </>
          )}

          {/* User Profile / Auth Button */}
          {user.isLoggedIn ? (
            <button
              type="button"
              onClick={() => onTabChange("profile")}
              className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              title="Ver mi perfil docente"
            >
              <div className="relative">
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl object-cover border border-slate-200 shadow-2xs"
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div className="text-left hidden lg:block leading-tight">
                <span className="text-xs font-bold text-slate-800 block truncate max-w-[110px]">
                  {user.name.split(" ")[0]}
                </span>
                <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                  <CloudCheck size={10} className="text-emerald-600" /> Sincronizado
                </span>
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
            >
              <LogIn size={13} />
              <span>Acceder</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
