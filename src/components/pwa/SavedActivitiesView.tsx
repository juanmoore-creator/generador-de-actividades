"use client";

import React, { useState } from "react";
import {
  FolderHeart,
  Search,
  BookmarkPlus,
  Play,
  Printer,
  Share2,
  Trash2,
  Copy,
  Calendar,
  FileText,
  FileQuestion,
} from "lucide-react";
import { SavedActivity, ActivitySnapshot } from "@/lib/types/pwa";
import { pwaStorage } from "@/lib/pwaStore";
import { ACTIVITIES } from "@/lib/registry";

interface SavedActivitiesViewProps {
  onLoadIntoStudio: (snapshot: ActivitySnapshot) => void;
  onSaveCurrentToLibrary: () => void;
  onOpenPublishModal: (snapshot: ActivitySnapshot) => void;
  onDirectDownload: (snapshot: ActivitySnapshot, isSolution: boolean) => void;
  currentStudioTitle: string;
}

export const SavedActivitiesView: React.FC<SavedActivitiesViewProps> = ({
  onLoadIntoStudio,
  onSaveCurrentToLibrary,
  onOpenPublishModal,
  onDirectDownload,
  currentStudioTitle,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [activities, setActivities] = useState<SavedActivity[]>(() => pwaStorage.getSavedActivities());

  const refreshList = () => {
    setActivities(pwaStorage.getSavedActivities());
  };

  const handleDelete = (id: string) => {
    if (window.confirm("¿Seguro que deseas eliminar esta ficha guardada?")) {
      pwaStorage.deleteSavedActivity(id);
      refreshList();
    }
  };

  const handleDuplicate = (id: string) => {
    pwaStorage.duplicateSavedActivity(id);
    refreshList();
  };

  // Collect unique folders
  const folders = Array.from(new Set(activities.map((a) => a.folder))).filter(Boolean);

  const filtered = activities.filter((act) => {
    const matchesSearch =
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (act.notes && act.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFolder = selectedFolder === "all" || act.folder === selectedFolder;

    return matchesSearch && matchesFolder;
  });

  const getActivityMeta = (type: string) => {
    const found = ACTIVITIES.find((a) => a.id === type);
    return found ? { title: found.title, badge: found.badge } : {
      title: type,
      badge: "Actividad",
    };
  };

  return (
    <div className="space-y-5 animate-in fade-in-50 duration-200">
      {/* Top Banner / Hero */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
              <FolderHeart size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 font-heading tracking-tight">
                  Mi Banco de Fichas
                </h2>
                <span className="text-[11px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  {activities.length} guardadas
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Almacenamiento PWA local y sincronizado. Listas para imprimir en cualquier momento.
              </p>
            </div>
          </div>

          {/* Quick Action to save currently active studio draft */}
          <button
            type="button"
            onClick={onSaveCurrentToLibrary}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <BookmarkPlus size={15} />
            <span>Guardar &quot;{currentStudioTitle}&quot; en Mis Fichas</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título, materia o notas..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedFolder("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedFolder === "all"
                  ? "bg-slate-900 text-white font-bold shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              Todas
            </button>
            {folders.map((folder) => (
              <button
                key={folder}
                type="button"
                onClick={() => setSelectedFolder(folder)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedFolder === folder
                    ? "bg-slate-900 text-white font-bold shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                {folder}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Saved Activity Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-400 space-y-3">
          <FileQuestion size={40} className="stroke-[1.2] text-slate-300 mx-auto" />
          <h3 className="font-bold text-sm text-slate-700">No se encontraron fichas</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? "Prueba con otra palabra clave o revisa los filtros seleccionados."
              : "Aún no has guardado ninguna ficha. Diseña una en el Estudio y pulsa Guardar."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((act) => {
            const meta = getActivityMeta(act.type);
            return (
              <div
                key={act.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-2.5">
                  {/* Card Header badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-mono">
                        {meta.title}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {act.folder}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                      <Calendar size={11} />
                      <span>{act.createdAt}</span>
                    </div>
                  </div>

                  {/* Title & Notes */}
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight font-heading">
                      {act.title}
                    </h3>
                    {act.notes && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 italic">
                        &quot;{act.notes}&quot;
                      </p>
                    )}
                  </div>

                  {/* Summary of content */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <FileText size={13} className="text-slate-400" />
                      <span>
                        {act.wordCount && act.wordCount > 0
                          ? `${act.wordCount} conceptos configurados`
                          : "Generación algorítmica"}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 capitalize">
                      Dificultad: {act.difficulty}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Load into Studio Button */}
                  <button
                    type="button"
                    onClick={() => onLoadIntoStudio(act.snapshot)}
                    className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98 shadow-xs"
                    title="Cargar esta ficha en el editor del estudio"
                  >
                    <Play size={13} className="fill-white" />
                    <span>Editar en Estudio</span>
                  </button>

                  {/* Download PDF directly */}
                  <button
                    type="button"
                    onClick={() => onDirectDownload(act.snapshot, false)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                    title="Descargar PDF Alumno"
                  >
                    <Printer size={15} />
                  </button>

                  {/* Share to community */}
                  <button
                    type="button"
                    onClick={() => onOpenPublishModal(act.snapshot)}
                    className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-all cursor-pointer"
                    title="Compartir en la Biblioteca Pública"
                  >
                    <Share2 size={15} />
                  </button>

                  {/* Duplicate */}
                  <button
                    type="button"
                    onClick={() => handleDuplicate(act.id)}
                    className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition-all cursor-pointer"
                    title="Duplicar"
                  >
                    <Copy size={15} />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDelete(act.id)}
                    className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all cursor-pointer"
                    title="Eliminar"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
