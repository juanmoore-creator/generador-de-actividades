"use client";

import React, { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { getThemePreference, setThemePreference, subscribeTheme, ThemePreference } from "@/lib/theme";
import { Segmented } from "./Segmented";

export function useThemePreference(): ThemePreference {
  return useSyncExternalStore(subscribeTheme, getThemePreference, () => "system");
}

export function ThemeSelector() {
  const pref = useThemePreference();
  return (
    <Segmented<ThemePreference>
      label="Tema de la aplicación"
      value={pref}
      onChange={setThemePreference}
      options={[
        { value: "system", label: "Sistema", icon: <Monitor className="size-4" aria-hidden /> },
        { value: "light", label: "Claro", icon: <Sun className="size-4" aria-hidden /> },
        { value: "dark", label: "Oscuro", icon: <Moon className="size-4" aria-hidden /> },
      ]}
    />
  );
}
