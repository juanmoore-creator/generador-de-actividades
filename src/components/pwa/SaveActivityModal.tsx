"use client";

import React, { useState } from "react";
import { X, BookmarkPlus, Check, Sparkles } from "lucide-react";
import { ActivitySnapshot } from "@/lib/types/pwa";
import { pwaStorage } from "@/lib/pwaStore";

interface SaveActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSnapshot: ActivitySnapshot;
  onSavedSuccess: (title: string) => void;
  onOpenPublishModal?: () => void;
}

const FOLDERS = [
  "Ciencias Naturales",
  "Lengua Castellana",
  "Matemáticas",
  "Inglés / Idiomas",
  "Historia y Geografía",
  "Tutoría / Dinámicas",
];

export const SaveActivityModal: React.FC<SaveActivityModalProps> = ({
  isOpen,
  onClose,
  currentSnapshot,
  onSavedSuccess,
  onOpenPublishModal,
}) => {
  const [title, setTitle] = useState(currentSnapshot.title || "");
  const [folder, setFolder] = useState(FOLDERS[0]);
  const [notes, setNotes] = useState("");
  const [alsoPublish, setAlsoPublish] = useState(false);

  const [prevTitle, setPrevTitle] = useState(currentSnapshot.title);
  if (prevTitle !== currentSnapshot.title) {
    setPrevTitle(currentSnapshot.title);
    setTitle(currentSnapshot.title || "");
  }

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = title.trim() || currentSnapshot.title || "Actividad";
    pwaStorage.saveCurrentActivity(
      {
        ...currentSnapshot,
        title: finalTitle,
      },
      folder,
      notes
    );

    onSavedSuccess(finalTitle);
    onClose();

    if (alsoPublish && onOpenPublishModal) {
      setTimeout(() => {
        onOpenPublishModal();
      }, 300);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 text-slate-900 shadow-2xl relative space-y-4 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <BookmarkPlus size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight font-heading">
              Guardar en Mis Fichas
            </h3>
            <p className="text-[11px] text-slate-500">
              Guarda esta actividad para imprimirla o editarla más tarde.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Título de la Actividad
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Crucigrama de los Vertebrados"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              Carpeta / Asignatura
            </label>
            <div className="flex flex-wrap gap-1.5">
              {FOLDERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFolder(f)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                    folder === f
                      ? "bg-slate-900 text-white font-bold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Notas o Indicaciones Didácticas (Opcional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Ficha de evaluación rápida para el viernes en grupos de dos."
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none text-slate-800"
            />
          </div>

          <label className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 cursor-pointer">
            <input
              type="checkbox"
              checked={alsoPublish}
              onChange={(e) => setAlsoPublish(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
            />
            <span className="flex items-center gap-1 font-medium">
              <Sparkles size={13} className="text-blue-600 shrink-0" />
              Compartir también en la Biblioteca Pública Docente
            </span>
          </label>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98"
            >
              <Check size={14} className="stroke-[3]" />
              <span>Guardar en Mi Dispositivo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
