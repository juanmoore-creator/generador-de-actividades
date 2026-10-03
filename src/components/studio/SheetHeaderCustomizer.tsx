"use client";

import React from "react";
import { SheetHeaderOptions } from "@/lib/types/activities";
import { GraduationCap, Check } from "lucide-react";

interface Props {
  options: SheetHeaderOptions;
  onChange: (options: SheetHeaderOptions) => void;
}

export const SheetHeaderCustomizer = ({ options, onChange }: Props) => {
  const toggle = (key: keyof Omit<SheetHeaderOptions, "schoolName">) => {
    onChange({
      ...options,
      [key]: !options[key],
    });
  };

  const handleSchoolNameChange = (val: string) => {
    onChange({
      ...options,
      schoolName: val,
    });
  };

  return (
    <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <GraduationCap size={15} className="text-slate-500" />
          Encabezado Escolar en Hoja A4
        </label>
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <button
          type="button"
          onClick={() => toggle("showName")}
          className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all cursor-pointer ${
            options.showName
              ? "bg-white border-blue-500 text-slate-900 shadow-2xs font-semibold"
              : "bg-slate-100/70 border-slate-200 text-slate-500 hover:bg-white"
          }`}
        >
          <div
            className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
              options.showName ? "bg-blue-600 text-white" : "border border-slate-300"
            }`}
          >
            {options.showName && <Check size={10} className="stroke-[3]" />}
          </div>
          <span>Nombre</span>
        </button>

        <button
          type="button"
          onClick={() => toggle("showDate")}
          className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all cursor-pointer ${
            options.showDate
              ? "bg-white border-blue-500 text-slate-900 shadow-2xs font-semibold"
              : "bg-slate-100/70 border-slate-200 text-slate-500 hover:bg-white"
          }`}
        >
          <div
            className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
              options.showDate ? "bg-blue-600 text-white" : "border border-slate-300"
            }`}
          >
            {options.showDate && <Check size={10} className="stroke-[3]" />}
          </div>
          <span>Fecha</span>
        </button>

        <button
          type="button"
          onClick={() => toggle("showGrade")}
          className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all cursor-pointer ${
            options.showGrade
              ? "bg-white border-blue-500 text-slate-900 shadow-2xs font-semibold"
              : "bg-slate-100/70 border-slate-200 text-slate-500 hover:bg-white"
          }`}
        >
          <div
            className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
              options.showGrade ? "bg-blue-600 text-white" : "border border-slate-300"
            }`}
          >
            {options.showGrade && <Check size={10} className="stroke-[3]" />}
          </div>
          <span>Curso / Grado</span>
        </button>

        <button
          type="button"
          onClick={() => toggle("showScore")}
          className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all cursor-pointer ${
            options.showScore
              ? "bg-white border-blue-500 text-slate-900 shadow-2xs font-semibold"
              : "bg-slate-100/70 border-slate-200 text-slate-500 hover:bg-white"
          }`}
        >
          <div
            className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
              options.showScore ? "bg-blue-600 text-white" : "border border-slate-300"
            }`}
          >
            {options.showScore && <Check size={10} className="stroke-[3]" />}
          </div>
          <span>Calificación</span>
        </button>
      </div>

      {/* School Name input */}
      <div>
        <input
          type="text"
          value={options.schoolName || ""}
          onChange={(e) => handleSchoolNameChange(e.target.value)}
          placeholder="Nombre de la Escuela / Institución (Opcional)"
          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
        />
      </div>
    </div>
  );
};
