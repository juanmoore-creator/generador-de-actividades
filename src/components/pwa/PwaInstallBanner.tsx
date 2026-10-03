"use client";

import React, { useState } from "react";
import { Download, X, Share, PlusSquare, Sparkles } from "lucide-react";
import { usePwaInstall } from "./usePwaInstall";

export const PwaInstallBanner = () => {
  const { isInstallable, isInstalled, isIos, isDismissed, promptInstall, dismiss } = usePwaInstall();
  const [showIosGuide, setShowIosGuide] = useState(false);

  // If already installed or explicitly dismissed, don't show
  if (isInstalled || isDismissed) {
    return null;
  }

  // Show if installable OR if on iOS Safari (where beforeinstallprompt doesn't fire)
  if (!isInstallable && !isIos) {
    return null;
  }

  return (
    <>
      <aside aria-label="Instalación de la aplicación" className="bg-slate-900 text-white px-4 py-2.5 sm:py-3 shadow-md border-b border-slate-800 animate-in slide-in-from-top duration-200 relative z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-xs font-mono font-bold text-xs">
              GA
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold truncate">Instala GenAct como App</p>
                <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-semibold bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-full">
                  <Sparkles size={10} /> PWA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate hidden xs:block">
                Crea fichas sin conexión, carga instantánea y pantalla completa.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isInstallable && (
              <button
                type="button"
                onClick={promptInstall}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Download size={13} className="stroke-[2.5]" />
                <span>Instalar</span>
              </button>
            )}

            {isIos && !isInstallable && (
              <button
                type="button"
                onClick={() => setShowIosGuide(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Download size={13} className="stroke-[2.5]" />
                <span>¿Cómo instalar?</span>
              </button>
            )}

            <button
              type="button"
              onClick={dismiss}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Cerrar aviso"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* iOS Safari Instruction Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-slate-900 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  GA
                </div>
                <h3 className="font-bold text-sm text-slate-900">Instalar en tu iPhone o iPad</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div>
                  <p className="font-bold text-slate-800">Toca el botón Compartir</p>
                  <p className="text-slate-500 mt-0.5 flex items-center gap-1">
                    En la barra inferior de Safari busca el icono <Share size={12} className="inline text-blue-600" />
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div>
                  <p className="font-bold text-slate-800">Añadir a la pantalla de inicio</p>
                  <p className="text-slate-500 mt-0.5 flex items-center gap-1">
                    Desplaza el menú y pulsa <PlusSquare size={12} className="inline text-blue-600" /> &quot;Añadir a inicio&quot;.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800">
                <span className="text-base shrink-0">✨</span>
                <p className="text-[11px] leading-relaxed">
                  ¡Listo! Podrás abrir GenAct a pantalla completa como una app nativa, incluso sin conexión a internet.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
