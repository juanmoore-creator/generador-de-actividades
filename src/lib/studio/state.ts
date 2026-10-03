import type { ActivitySnapshot, ActivityType, SheetHeaderOptions, SheetOptions } from "../types/activities";
import { createSnapshot, normalizeSnapshot, switchActivityType } from "../activities/snapshot";
import { newSeed } from "../random";

export const MAX_VARIANTS = 4;

export interface StudioState {
  snapshot: ActivitySnapshot;
  /** Semillas anteriores (la más reciente primero) para deshacer "Regenerar". */
  previousSeeds: number[];
  /** Id de la ficha guardada que se está editando (si se abrió desde "Mis fichas"). */
  savedId: string | null;
  /** Hay cambios desde la última vez que se guardó/abrió. */
  dirty: boolean;
}

export type StudioAction =
  | { type: "patch"; patch: Partial<ActivitySnapshot> }
  | { type: "patchSheet"; patch: Partial<SheetOptions> }
  | { type: "patchHeader"; patch: Partial<SheetHeaderOptions> }
  | { type: "setActivity"; activity: ActivityType }
  | { type: "regenerate"; seed?: number }
  | { type: "restoreSeed"; seed: number }
  | { type: "load"; snapshot: ActivitySnapshot; savedId?: string | null }
  | { type: "markSaved"; savedId: string };

export function initialStudioState(snapshot?: ActivitySnapshot): StudioState {
  return { snapshot: snapshot ?? createSnapshot("wordsearch"), previousSeeds: [], savedId: null, dirty: false };
}

export function studioReducer(state: StudioState, action: StudioAction): StudioState {
  const s = state.snapshot;
  switch (action.type) {
    case "patch":
      return { ...state, snapshot: { ...s, ...action.patch }, dirty: true };
    case "patchSheet":
      return { ...state, snapshot: { ...s, sheet: { ...s.sheet, ...action.patch } }, dirty: true };
    case "patchHeader":
      return {
        ...state,
        snapshot: { ...s, sheet: { ...s.sheet, header: { ...s.sheet.header, ...action.patch } } },
        dirty: true,
      };
    case "setActivity":
      if (action.activity === s.type) return state;
      return { ...state, snapshot: switchActivityType(s, action.activity), previousSeeds: [], dirty: true };
    case "regenerate":
      return {
        ...state,
        snapshot: { ...s, seed: action.seed ?? newSeed() },
        previousSeeds: [s.seed, ...state.previousSeeds].slice(0, MAX_VARIANTS),
        dirty: true,
      };
    case "restoreSeed": {
      if (action.seed === s.seed) return state;
      const rest = state.previousSeeds.filter((x) => x !== action.seed);
      return {
        ...state,
        snapshot: { ...s, seed: action.seed },
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
      };
    case "markSaved":
      return { ...state, savedId: action.savedId, dirty: false };
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
      return {
        snapshot: normalizeSnapshot(parsed.snapshot),
        previousSeeds: Array.isArray(parsed.previousSeeds) ? parsed.previousSeeds.filter((n) => typeof n === "number") : [],
        savedId: typeof parsed.savedId === "string" ? parsed.savedId : null,
        dirty: Boolean(parsed.dirty),
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
