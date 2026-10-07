import type { ActivitySnapshot, ActivityType, SheetHeaderOptions, SheetOptions } from "../types/activities";
import { createSnapshot, normalizeSnapshot, switchActivityType } from "../activities/snapshot";
import { newSeed } from "../random";

export const MAX_VARIANTS = 4;

export interface StudioPackContext {
  title: string;
  activities: {
    type: ActivityType;
    snapshot: ActivitySnapshot;
    savedId?: string | null;
  }[];
  currentIndex: number;
}

export interface StudioState {
  snapshot: ActivitySnapshot;
  /** Semillas anteriores (la más reciente primero) para deshacer "Regenerar". */
  previousSeeds: number[];
  /** Id de la ficha guardada que se está editando (si se abrió desde "Mis fichas"). */
  savedId: string | null;
  /** Hay cambios desde la última vez que se guardó/abrió. */
  dirty: boolean;
  /** Contexto del cuadernillo / pack de actividades abierto, si aplica. */
  pack: StudioPackContext | null;
}

export type StudioAction =
  | { type: "patch"; patch: Partial<ActivitySnapshot> }
  | { type: "patchSheet"; patch: Partial<SheetOptions> }
  | { type: "patchHeader"; patch: Partial<SheetHeaderOptions> }
  | { type: "setActivity"; activity: ActivityType }
  | { type: "regenerate"; seed?: number }
  | { type: "restoreSeed"; seed: number }
  | { type: "load"; snapshot: ActivitySnapshot; savedId?: string | null }
  | { type: "markSaved"; savedId: string }
  | { type: "loadPack"; pack: StudioPackContext }
  | { type: "switchPackActivity"; index: number }
  | { type: "closePack" };

export function initialStudioState(snapshot?: ActivitySnapshot): StudioState {
  return {
    snapshot: snapshot ?? createSnapshot("wordsearch"),
    previousSeeds: [],
    savedId: null,
    dirty: false,
    pack: null,
  };
}

function syncPackSnapshot(pack: StudioPackContext | null, snapshot: ActivitySnapshot): StudioPackContext | null {
  if (!pack) return null;
  const current = pack.activities[pack.currentIndex];
  if (!current) return pack;
  const activities = pack.activities.map((item, idx) =>
    idx === pack.currentIndex ? { ...item, snapshot, type: snapshot.type } : item
  );
  return { ...pack, activities };
}

export function studioReducer(state: StudioState, action: StudioAction): StudioState {
  const s = state.snapshot;
  switch (action.type) {
    case "patch": {
      const nextSnapshot = { ...s, ...action.patch };
      return {
        ...state,
        snapshot: nextSnapshot,
        pack: syncPackSnapshot(state.pack, nextSnapshot),
        dirty: true,
      };
    }
    case "patchSheet": {
      const nextSnapshot = { ...s, sheet: { ...s.sheet, ...action.patch } };
      return {
        ...state,
        snapshot: nextSnapshot,
        pack: syncPackSnapshot(state.pack, nextSnapshot),
        dirty: true,
      };
    }
    case "patchHeader": {
      const nextSnapshot = {
        ...s,
        sheet: { ...s.sheet, header: { ...s.sheet.header, ...action.patch } },
      };
      return {
        ...state,
        snapshot: nextSnapshot,
        pack: syncPackSnapshot(state.pack, nextSnapshot),
        dirty: true,
      };
    }
    case "setActivity": {
      if (action.activity === s.type) return state;
      const nextSnapshot = switchActivityType(s, action.activity);
      return {
        ...state,
        snapshot: nextSnapshot,
        pack: syncPackSnapshot(state.pack, nextSnapshot),
        previousSeeds: [],
        dirty: true,
      };
    }
    case "regenerate": {
      const nextSnapshot = { ...s, seed: action.seed ?? newSeed() };
      return {
        ...state,
        snapshot: nextSnapshot,
        pack: syncPackSnapshot(state.pack, nextSnapshot),
        previousSeeds: [s.seed, ...state.previousSeeds].slice(0, MAX_VARIANTS),
        dirty: true,
      };
    }
    case "restoreSeed": {
      if (action.seed === s.seed) return state;
      const rest = state.previousSeeds.filter((x) => x !== action.seed);
      const nextSnapshot = { ...s, seed: action.seed };
      return {
        ...state,
        snapshot: nextSnapshot,
        pack: syncPackSnapshot(state.pack, nextSnapshot),
        previousSeeds: [s.seed, ...rest].slice(0, MAX_VARIANTS),
        dirty: true,
      };
    }
    case "load":
      return {
        snapshot: normalizeSnapshot(action.snapshot),
        previousSeeds: [],
        savedId: action.savedId ?? null,
        dirty: false,
        pack: null,
      };
    case "markSaved": {
      const currentPack = state.pack;
      const nextPack = currentPack
        ? {
            ...currentPack,
            activities: currentPack.activities.map((item, idx) =>
              idx === currentPack.currentIndex ? { ...item, savedId: action.savedId } : item
            ),
          }
        : null;
      return { ...state, savedId: action.savedId, pack: nextPack, dirty: false };
    }
    case "loadPack": {
      const idx = Math.max(0, Math.min(action.pack.currentIndex ?? 0, action.pack.activities.length - 1));
      const normalizedPack: StudioPackContext = {
        ...action.pack,
        currentIndex: idx,
        activities: action.pack.activities.map((act) => ({
          ...act,
          snapshot: normalizeSnapshot(act.snapshot),
        })),
      };
      const currentAct = normalizedPack.activities[idx];
      return {
        pack: normalizedPack,
        snapshot: currentAct ? normalizeSnapshot(currentAct.snapshot) : normalizeSnapshot(state.snapshot),
        previousSeeds: [],
        savedId: currentAct?.savedId ?? null,
        dirty: false,
      };
    }
    case "switchPackActivity": {
      if (!state.pack) return state;
      const idx = action.index;
      if (idx < 0 || idx >= state.pack.activities.length) return state;
      if (idx === state.pack.currentIndex) return state;

      const activities = state.pack.activities.map((item, i) =>
        i === state.pack!.currentIndex ? { ...item, snapshot: state.snapshot, type: state.snapshot.type } : item
      );
      const target = activities[idx];
      return {
        ...state,
        pack: {
          ...state.pack,
          activities,
          currentIndex: idx,
        },
        snapshot: normalizeSnapshot(target.snapshot),
        previousSeeds: [],
        savedId: target.savedId ?? null,
        dirty: false,
      };
    }
    case "closePack":
      return { ...state, pack: null };
  }
}

// ---------------------------------------------------------------------------
// Borrador persistente
// ---------------------------------------------------------------------------

const DRAFT_KEY = "genact_studio_draft_v3";
const LEGACY_DRAFT_KEY = "genact_studio_draft_v2";

export function loadDraft(): StudioState | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StudioState>;
      let pack: StudioPackContext | null = null;
      if (
        parsed.pack &&
        typeof parsed.pack === "object" &&
        Array.isArray(parsed.pack.activities) &&
        parsed.pack.activities.length > 0
      ) {
        const rawIdx = typeof parsed.pack.currentIndex === "number" ? parsed.pack.currentIndex : 0;
        const safeIdx = Math.max(0, Math.min(rawIdx, parsed.pack.activities.length - 1));
        pack = {
          title: String(parsed.pack.title ?? ""),
          currentIndex: safeIdx,
          activities: parsed.pack.activities.map((a) => ({
            type: a.type,
            snapshot: normalizeSnapshot(a.snapshot),
            savedId: typeof a.savedId === "string" ? a.savedId : null,
          })),
        };
      }
      return {
        snapshot: normalizeSnapshot(parsed.snapshot),
        previousSeeds: Array.isArray(parsed.previousSeeds) ? parsed.previousSeeds.filter((n) => typeof n === "number") : [],
        savedId: typeof parsed.savedId === "string" ? parsed.savedId : null,
        dirty: Boolean(parsed.dirty),
        pack,
      };
    }
    const legacy = localStorage.getItem(LEGACY_DRAFT_KEY);
    if (legacy) return initialStudioState(normalizeSnapshot(JSON.parse(legacy)));
  } catch {
    // borrador corrupto: se ignora
  }
  return null;
}

export function saveDraft(state: StudioState) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
  } catch {
    // sin espacio: el borrador no es crítico
  }
}
