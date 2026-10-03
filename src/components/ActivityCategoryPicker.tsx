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
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl border border-stone-200/80">
        {CATEGORIES.map((cat) => {
          const IconComp = ICONS_MAP[cat.icon] || Sparkles;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-white text-stone-900 shadow-xs border border-stone-200/70"
                  : "text-stone-500 hover:text-stone-800 hover:bg-stone-200/50"
              }`}
            >
              <IconComp size={14} className={isActive ? "text-orange-500" : "text-stone-400"} />
              <span className="truncate">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {filteredActivities.map((act) => {
          const IconComp = ICONS_MAP[act.icon] || Sparkles;
          const isSelected = selectedType === act.id;

          return (
            <button
              key={act.id}
              type="button"
              onClick={() => onSelect(act.id)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                isSelected
                  ? "bg-orange-50/90 border-orange-400 text-orange-950 ring-2 ring-orange-200 shadow-xs"
                  : "bg-white border-stone-200/80 hover:border-orange-200 hover:bg-stone-50/80 text-stone-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isSelected
                        ? "bg-orange-500 text-white"
                        : "bg-stone-100 text-stone-500 group-hover:bg-orange-100 group-hover:text-orange-600"
                    } transition-colors`}
                  >
                    <IconComp size={15} />
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                      act.badge === "Popular"
                        ? "bg-amber-100 text-amber-800"
                        : act.badge === "Clásico"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {act.badge}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-stone-900 group-hover:text-orange-600 transition-colors">
                  {act.title}
                </h4>
                <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-2 leading-tight">
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
