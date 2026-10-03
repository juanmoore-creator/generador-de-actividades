"use client";

import React from "react";
import { Sparkles, FolderHeart, Globe2, UserCheck, User } from "lucide-react";
import { PwaTab, UserProfile } from "@/lib/types/pwa";

interface BottomNavProps {
  activeTab: PwaTab;
  onTabChange: (tab: PwaTab) => void;
  savedCount: number;
  user: UserProfile;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  savedCount,
  user,
}) => {
  const tabs = [
    {
      id: "studio" as PwaTab,
      label: "Estudio",
      icon: Sparkles,
      badge: null,
    },
    {
      id: "saved" as PwaTab,
      label: "Mis Fichas",
      icon: FolderHeart,
      badge: savedCount > 0 ? savedCount : null,
    },
    {
      id: "community" as PwaTab,
      label: "Comunidad",
      icon: Globe2,
      badge: "Nueva",
      isPillBadge: true,
    },
    {
      id: "profile" as PwaTab,
      label: user.isLoggedIn ? "Mi Perfil" : "Acceder",
      icon: user.isLoggedIn ? UserCheck : User,
      badge: null,
    },
  ];

  return (
    <nav
      aria-label="Navegación principal de la aplicación"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-lg md:hidden"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center justify-around px-2 pt-1.5 pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 cursor-pointer active:scale-95 relative ${
                isActive ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {/* Active indicator dot or pill */}
              <div
                className={`p-1 rounded-xl transition-all duration-150 ${
                  isActive ? "bg-blue-50 text-blue-600" : ""
                }`}
              >
                <Icon size={20} className={isActive ? "stroke-[2.5]" : "stroke-[1.8]"} />
              </div>

              <span className="text-[10px] tracking-tight mt-0.5 leading-none">
                {tab.label}
              </span>

              {/* Number Badge */}
              {tab.badge !== null && !tab.isPillBadge && (
                <span className="absolute top-1 right-[22%] bg-slate-900 text-white text-[9px] font-bold font-mono px-1.5 py-0.2 rounded-full min-w-4 text-center leading-tight">
                  {tab.badge}
                </span>
              )}

              {/* Tag Badge */}
              {tab.badge !== null && tab.isPillBadge && !isActive && (
                <span className="absolute top-1 right-[18%] bg-emerald-500 text-white text-[8px] font-bold px-1 py-0.2 rounded-full leading-tight">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
