"use client";

import React, { useState } from "react";
import { X, Globe2, Sparkles } from "lucide-react";
import { ActivitySnapshot, UserProfile } from "@/lib/types/pwa";
import { pwaStorage } from "@/lib/pwaStore";

interface PublishCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshot: ActivitySnapshot;
  user: UserProfile;
  onPublishedSuccess: () => void;
}

const SUBJECTS = [
  "Lengua Castellana",
  "Ciencias Naturales",
  "Matemáticas",
  "Inglés",
  "Geografía e Historia",
  "Arte y Música",
  "Lógica y Retos",
];

const GRADES = [
  "1º y 2º Primaria",
  "3º y 4º Primaria",
  "5º y 6º Primaria",
  "Educación Secundaria (ESO)",
  "Todas las edades",
];

export const PublishCommunityModal: React.FC<PublishCommunityModalProps> = ({
  isOpen,
  onClose,
  snapshot,
  user,
  onPublishedSuccess,
}) => {
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [grade, setGrade] = useState(GRADES[1]);
  const [description, setDescription] = useState(
    `Actividad de ${snapshot.title} lista para proyectar o imprimir en A4.`
  );
  const [tagInput, setTagInput] = useState("Primaria, Repaso, Vocabulario");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setTimeout(() => {
      pwaStorage.publishToCommunity(snapshot, {
        subject,
        grade,
        description: description.trim(),
        tags,
      });

      setIsSubmitting(false);
      onPublishedSuccess();
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 text-slate-900 shadow-2xl relative space-y-4 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Globe2 size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight font-heading flex items-center gap-1.5">
              <span>Compartir en la Biblioteca Pública</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Abierto
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Miles de docentes podrán descargar tu ficha o usarla como plantilla didáctica.
            </p>
          </div>
        </div>

        <form onSubmit={handlePublish} className="space-y-3.5">
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-xl object-cover border border-slate-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-slate-900">{user.name}</p>
                <p className="text-[10px] text-slate-500">{user.school || "Docente Colaborador"}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-mono">
              Autor
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Asignatura / Área
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-600 outline-none bg-white font-medium text-slate-800"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Nivel / Grado
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-600 outline-none bg-white font-medium text-slate-800"
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Descripción Didáctica
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explica brevemente los objetivos didácticos..."
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Etiquetas (separadas por comas)
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Ej: Primaria, Animales, Vocabulario"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none text-slate-800"
            />
          </div>

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
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <Sparkles size={14} className="stroke-[2.5]" />
              <span>{isSubmitting ? "Publicando..." : "Publicar Actividad Ahora"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
