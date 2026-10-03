"use client";

import React, { useState } from "react";
import {
  Globe2,
  Search,
  Heart,
  Download,
  Play,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { CommunityActivity, ActivitySnapshot } from "@/lib/types/pwa";
import { pwaStorage } from "@/lib/pwaStore";
import { ACTIVITIES } from "@/lib/registry";

interface CommunityLibraryViewProps {
  onLoadIntoStudio: (snapshot: ActivitySnapshot) => void;
  onOpenPublishModal: () => void;
  onDirectDownload: (snapshot: ActivitySnapshot, isSolution: boolean) => void;
}

const SUBJECT_FILTERS = [
  "Todos",
  "Ciencias Naturales",
  "Lengua Castellana",
  "Matemáticas",
  "Inglés",
  "Geografía e Historia",
  "Lógica y Retos",
];

export const CommunityLibraryView: React.FC<CommunityLibraryViewProps> = ({
  onLoadIntoStudio,
  onOpenPublishModal,
  onDirectDownload,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Todos");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [activities, setActivities] = useState<CommunityActivity[]>(() =>
    pwaStorage.getCommunityActivities()
  );

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    pwaStorage.toggleLikeCommunity(id);
    setActivities(pwaStorage.getCommunityActivities());
  };

  const handleUseInStudio = (snapshot: ActivitySnapshot) => {
    onLoadIntoStudio(snapshot);
  };

  const handleDownload = (act: CommunityActivity, e: React.MouseEvent) => {
    e.stopPropagation();
    pwaStorage.incrementCommunityDownload(act.id);
    setActivities(pwaStorage.getCommunityActivities());
    onDirectDownload(act.snapshot, false);
  };

  const filtered = activities.filter((act) => {
    const matchesSearch =
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject =
      selectedSubject === "Todos" ||
      act.subject.toLowerCase().includes(selectedSubject.toLowerCase()) ||
      selectedSubject.toLowerCase().includes(act.subject.toLowerCase());

    const matchesType = selectedType === "all" || act.type === selectedType;

    return matchesSearch && matchesSubject && matchesType;
  });

  const getActivityName = (type: string) => {
    const found = ACTIVITIES.find((a) => a.id === type);
    return found ? found.title : type;
  };

  return (
    <div className="space-y-5 animate-in fade-in-50 duration-200">
      {/* Community Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-200 text-[11px] font-bold">
              <Globe2 size={13} />
              <span>Biblioteca Abierta para Profesores</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-heading tracking-tight">
              Recursos Imprimibles Compartidos
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
              Explora fichas diseñadas y testeadas por docentes en el aula. Puedes usarlas como
              plantilla con un solo toque y personalizarlas para tu clase.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenPublishModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-slate-900 hover:bg-blue-50 rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer active:scale-98 shrink-0"
          >
            <Share2 size={14} className="text-blue-600 stroke-[2.5]" />
            <span>Compartir mi Ficha</span>
          </button>
        </div>

        {/* Decorative circle glow */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por tema, conceptos clave (ej: Sistema Solar, Fracciones) o autor..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none bg-slate-50/50"
          />
        </div>

        {/* Subject Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {SUBJECT_FILTERS.map((subj) => (
            <button
              key={subj}
              type="button"
              onClick={() => setSelectedSubject(subj)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedSubject === subj
                  ? "bg-slate-900 text-white font-bold shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              {subj}
            </button>
          ))}
        </div>

        {/* Format Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-slate-100 pt-2.5 scrollbar-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
            Formato:
          </span>
          <button
            type="button"
            onClick={() => setSelectedType("all")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedType === "all"
                ? "bg-blue-600 text-white font-bold"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
            }`}
          >
            Todos los juegos
          </button>
          {ACTIVITIES.slice(0, 6).map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setSelectedType(a.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedType === a.id
                  ? "bg-blue-600 text-white font-bold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              {a.title}
            </button>
          ))}
        </div>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((act) => (
          <div
            key={act.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group space-y-4"
          >
            <div className="space-y-3">
              {/* Author Row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  {act.author.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={act.author.avatar}
                      alt={act.author.name}
                      className="w-8 h-8 rounded-xl object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      {act.author.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {act.author.name}
                      </p>
                      {act.author.isVerified && (
                        <ShieldCheck size={13} className="text-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{act.author.school}</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  {act.createdAt}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-mono">
                    {getActivityName(act.type)}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {act.subject}
                  </span>
                  <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {act.grade}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight font-heading">
                  {act.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {act.description}
                </p>
              </div>

              {/* Tags */}
              {act.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {act.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions & Social Counters */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Like Button */}
                <button
                  type="button"
                  onClick={(e) => handleLike(act.id, e)}
                  className={`flex items-center gap-1.5 text-xs font-semibold py-1 px-2 rounded-lg transition-colors cursor-pointer active:scale-90 ${
                    act.isLiked
                      ? "text-rose-600 bg-rose-50"
                      : "text-slate-500 hover:text-rose-600 hover:bg-slate-50"
                  }`}
                  title="Me gusta esta ficha"
                >
                  <Heart
                    size={14}
                    className={act.isLiked ? "fill-rose-600 stroke-rose-600" : ""}
                  />
                  <span>{act.likes}</span>
                </button>

                {/* Downloads Count */}
                <span className="flex items-center gap-1 text-xs text-slate-400" title="Descargas">
                  <Download size={13} />
                  <span>{act.downloads}</span>
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Direct PDF Download */}
                <button
                  type="button"
                  onClick={(e) => handleDownload(act, e)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                  title="Descargar PDF directamente"
                >
                  <Download size={14} />
                </button>

                {/* Use in Studio primary button */}
                <button
                  type="button"
                  onClick={() => handleUseInStudio(act.snapshot)}
                  className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98"
                >
                  <Play size={12} className="fill-white" />
                  <span>Usar Plantilla</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
