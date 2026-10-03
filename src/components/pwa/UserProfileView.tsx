"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  School,
  ShieldCheck,
  Settings,
  HardDrive,
  LogOut,
  LogIn,
  RotateCcw,
  Smartphone,
  Check,
} from "lucide-react";
import { UserProfile, SheetHeaderOptions } from "@/lib/types/pwa";
import { pwaStorage, GUEST_USER, SEED_SAVED_ACTIVITIES, SEED_COMMUNITY_ACTIVITIES } from "@/lib/pwaStore";
import { usePwaInstall } from "./usePwaInstall";

interface UserProfileViewProps {
  user: UserProfile;
  onUserChange: (user: UserProfile) => void;
  onOpenAuth: () => void;
  defaultHeaderOptions: SheetHeaderOptions;
  onUpdateDefaultHeaderOptions: (options: SheetHeaderOptions) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  user,
  onUserChange,
  onOpenAuth,
  defaultHeaderOptions,
  onUpdateDefaultHeaderOptions,
}) => {
  const { isInstallable, isInstalled, promptInstall } = usePwaInstall();
  const [schoolName, setSchoolName] = useState(user.school || defaultHeaderOptions.schoolName || "");
  const [isSavedSchool, setIsSavedSchool] = useState(false);

  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = { ...user, school: schoolName.trim() };
    pwaStorage.setUser(updatedUser);
    onUserChange(updatedUser);
    onUpdateDefaultHeaderOptions({
      ...defaultHeaderOptions,
      schoolName: schoolName.trim(),
    });
    setIsSavedSchool(true);
    setTimeout(() => setIsSavedSchool(false), 2000);
  };

  const handleLogout = () => {
    pwaStorage.setUser(GUEST_USER);
    onUserChange(GUEST_USER);
  };

  const handleResetData = () => {
    if (window.confirm("¿Deseas restaurar los datos de ejemplo del banco de fichas y la comunidad?")) {
      pwaStorage.setSavedActivities(SEED_SAVED_ACTIVITIES);
      pwaStorage.setCommunityActivities(SEED_COMMUNITY_ACTIVITIES);
      window.location.reload();
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in-50 duration-200 max-w-3xl mx-auto">
      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-xs">
                  {user.name.charAt(0) || "D"}
                </div>
              )}
              {user.isLoggedIn && (
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                  ✓
                </span>
              )}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-black text-slate-900 font-heading tracking-tight truncate">
                  {user.name}
                </h2>
                {user.isPro && (
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/70 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                    <ShieldCheck size={11} />
                    PRO DOCENTE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 flex items-center gap-1.5">
                <GraduationCap size={13} className="text-slate-400 shrink-0" />
                <span className="truncate">{user.role || "Docente"}</span>
              </p>
              {user.school && (
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <School size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{user.school}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            {user.isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="py-2 px-3.5 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-xs font-bold text-slate-600 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <LogOut size={13} />
                <span>Cerrar Sesión</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-98"
              >
                <LogIn size={13} />
                <span>Iniciar Sesión</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span className="block text-lg sm:text-2xl font-black text-slate-900 font-heading">
              {user.stats.savedCount}
            </span>
            <span className="text-[10px] sm:text-xs font-medium text-slate-500 mt-0.5 block">
              Fichas Guardadas
            </span>
          </div>
          <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span className="block text-lg sm:text-2xl font-black text-slate-900 font-heading">
              {user.stats.publishedCount}
            </span>
            <span className="text-[10px] sm:text-xs font-medium text-slate-500 mt-0.5 block">
              Compartidas
            </span>
          </div>
          <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span className="block text-lg sm:text-2xl font-black text-slate-900 font-heading">
              {user.stats.downloadsReceived}
            </span>
            <span className="text-[10px] sm:text-xs font-medium text-slate-500 mt-0.5 block">
              Descargas Docentes
            </span>
          </div>
        </div>
      </div>

      {/* Classroom Settings */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Settings size={16} className="text-slate-500" />
          <h3 className="font-extrabold text-sm text-slate-900 tracking-tight font-heading">
            Preferencias de Encabezado Escolar
          </h3>
        </div>

        <form onSubmit={handleSaveSchool} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nombre predeterminado del Colegio o Instituto
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Aparecerá centrado automáticamente en la cabecera de todas las hojas A4 que imprimas.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Ej: Colegio San Ignacio · 4º Primaria"
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none font-medium"
              />
              <button
                type="submit"
                className="py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
              >
                {isSavedSchool ? (
                  <span className="flex items-center gap-1 text-emerald-300">
                    <Check size={13} className="stroke-[3]" /> Guardado
                  </span>
                ) : (
                  "Guardar"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* PWA & Offline Storage Controls */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Smartphone size={16} className="text-slate-500" />
          <h3 className="font-extrabold text-sm text-slate-900 tracking-tight font-heading">
            Aplicación Web Progresiva (PWA) y Sin Conexión
          </h3>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-900 flex items-start gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0 animate-pulse" />
            <div>
              <p className="font-bold text-emerald-950">Modo Offline Activo y Funcional</p>
              <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                Tus fichas, los algoritmos generadores matemáticos y el motor de exportación a PDF funcionan 100% de forma local en tu navegador sin requerir conexión continua.
              </p>
            </div>
          </div>

          {isInstallable && !isInstalled && (
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-blue-950">Instalar en la pantalla de inicio</p>
                <p className="text-[11px] text-blue-800">
                  Abre GenAct a pantalla completa como una app nativa en tu móvil o tablet.
                </p>
              </div>
              <button
                type="button"
                onClick={promptInstall}
                className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs active:scale-95 shrink-0"
              >
                Instalar App
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-slate-500 text-[11px]">
              <HardDrive size={14} />
              <span>Memoria local utilizada: ~45 KB</span>
            </div>

            <button
              type="button"
              onClick={handleResetData}
              className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw size={11} />
              <span>Restablecer fichas de muestra</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
