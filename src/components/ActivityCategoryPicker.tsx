"use client";

import React, { useState } from "react";
import { ActivityType, ActivityCategory } from "@/lib/types/activities";
import { ACTIVITIES, CATEGORIES } from "@/lib/registry";
import {
  BookOpen,
  Calculator,
  Sparkles,
  Grid3X3,
  AlignLeft,
  Shuffle,
  ArrowRightLeft,
  KeyRound,
  FileText,
  Disc,
  Grid2X2,
  Triangle,
  Milestone,
  Palette,
  LucideIcon,
  Check,
} from "lucide-react";

interface Props {
  selectedType: ActivityType;
  onSelect: (type: ActivityType) => void;
}

const ICONS_MAP: Record<string, LucideIcon> = {
  BookOpen,
  Calculator,
  Sparkles,
  Grid3X3,
  AlignLeft,
  Shuffle,
  ArrowRightLeft,
  KeyRound,
  FileText,
  Disc,
  Grid2X2,
  Triangle,
  Milestone,
  Palette,
};

export const ActivityCategoryPicker = ({ selectedType, onSelect }: Props) => {
  const currentActivity = ACTIVITIES.find((a) => a.id === selectedType);
  const [activeCategory, setActiveCategory] = useState<ActivityCategory>(
    currentActivity?.category || "language"
  );

  const filteredActivities = ACTIVITIES.filter((a) => a.category === activeCategory);

  return (
    <div className="space-y-3">
      {/* Category Segmented Control */}
      <div className="flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/70">
        {CATEGORIES.map((cat) => {
          const IconComp = ICONS_MAP[cat.icon] || Sparkles;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer active:scale-[0.98] ${
                isActive
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/90"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/40"
              }`}
            >
              <IconComp
                size={13}
                className={isActive ? "text-blue-600 stroke-[2.2]" : "text-slate-400"}
              />
              <span className="truncate">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {filteredActivities.map((act) => {
          const IconComp = ICONS_MAP[act.icon] || Sparkles;
          const isSelected = selectedType === act.id;

          return (
            <button
              key={act.id}
              type="button"
              onClick={() => onSelect(act.id)}
              className={`p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between group relative active:scale-[0.98] ${
                isSelected
                  ? "bg-blue-50/50 border-blue-600/90 text-slate-950 ring-1 ring-blue-600/30 shadow-xs"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 text-slate-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-900"
                    }`}
                  >
                    <IconComp size={14} className="stroke-[2.2]" />
                  </div>

                  {isSelected ? (
                    <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Check size={10} className="stroke-[3]" />
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium tracking-tight">
                      A4
                    </span>
                  )}
                </div>

                <h4
                  className={`text-xs font-semibold leading-tight transition-colors ${
                    isSelected ? "text-blue-950 font-bold" : "text-slate-900 group-hover:text-blue-600"
                  }`}
                >
                  {act.title}
                </h4>

                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {act.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
