"use client";

import React, { useMemo } from "react";
import type { ActivitySnapshot } from "@/lib/types/activities";
import { generateActivity } from "@/lib/activities/engine";
import { ScaledSheet, Sheet } from "@/components/preview/SheetPreview";
import { cn } from "@/lib/utils";

/** Miniatura real de la hoja (parte superior), recortada a una proporción fija. */
export function SheetThumbnail({ snapshot, className }: { snapshot: ActivitySnapshot; className?: string }) {
  const gen = useMemo(() => generateActivity(snapshot), [snapshot]);
  return (
    <div className={cn("pointer-events-none relative aspect-[4/3] overflow-hidden bg-surface-2 select-none", className)} aria-hidden>
      <div className="absolute inset-x-3 top-3">
        <ScaledSheet pageSize={snapshot.sheet.pageSize}>
          <Sheet snap={snapshot} gen={gen} showSolution={false} />
        </ScaledSheet>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-surface-2 to-transparent" />
    </div>
  );
}
