import type {
  ActivitySnapshot,
  ActivityType,
  ChainOperator,
  Difficulty,
  PageSize,
  RoscoLetterItem,
  SheetHeaderOptions,
  SheetOptions,
  SudokuSymbols,
  WordItem,
} from "../types/activities";
import { ACTIVITY_BY_ID, getActivity } from "./catalog";
import { THEME_PRESETS } from "./presets";
import { DEFAULT_ROSCO_ITEMS } from "../generators/rosco";
import { PIXEL_TEMPLATES } from "../generators/coordinatePixelArt";
import { newSeed } from "../random";

export const SNAPSHOT_VERSION = 3 as const;

export const DEFAULT_HEADER: SheetHeaderOptions = {
  showName: true,
  showDate: true,
  showGrade: false,
  showScore: false,
  schoolName: "",
};

export const DEFAULT_SHEET: SheetOptions = {
  header: DEFAULT_HEADER,
  pageSize: "A4",
  copies: 1,
  instructions: "",
};

export const MAX_COPIES = 6;

export const DEFAULT_CRYPTO_PHRASE = "EL SOL ES LA ESTRELLA MAS CERCANA A LA TIERRA";
export const DEFAULT_CLOZE_TEXT =
  "Los [planetas] giran alrededor del [Sol] describiendo órbitas. La [Tierra] es el tercer planeta y el único donde se conoce la existencia de [vida]. Su satélite natural es la [Luna].";

/** Snapshot nuevo, con contenido de ejemplo, para el tipo de actividad indicado. */
export function createSnapshot(type: ActivityType, overrides: Partial<ActivitySnapshot> = {}): ActivitySnapshot {
  const meta = getActivity(type);
  return {
    schemaVersion: SNAPSHOT_VERSION,
    type,
    title: meta.defaultTitle,
    difficulty: "medium",
    seed: newSeed(),
    items: THEME_PRESETS[0].items.map((i) => ({ ...i })),
    cryptoPhrase: DEFAULT_CRYPTO_PHRASE,
    cryptoHint: "Astronomía",
    clozeText: DEFAULT_CLOZE_TEXT,
    roscoItems: DEFAULT_ROSCO_ITEMS.map((i) => ({ ...i })),
    wordSearchSize: null,
    sudokuSize: 6,
    sudokuSymbols: "numbers",
    pyramidLevels: 4,
    pyramidCount: 2,
    mazeSize: 15,
    pixelArtKey: "corazon",
    bingoSize: 3,
    bingoFreeCenter: true,
    chainLength: 5,
    chainCount: 6,
    chainOps: ["+", "-"],
    sheet: { ...DEFAULT_SHEET, header: { ...DEFAULT_HEADER } },
    ...overrides,
  };
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
const str = (v: unknown, fallback: string) => (typeof v === "string" ? v : fallback);
const num = (v: unknown, fallback: number, min = -Infinity, max = Infinity) =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);
const oneOf = <T extends string | number>(v: unknown, options: readonly T[], fallback: T): T =>
  options.includes(v as T) ? (v as T) : fallback;

function normalizeWordItems(v: unknown, fallback: WordItem[]): WordItem[] {
  if (!Array.isArray(v)) return fallback;
  return v
    .filter(isObj)
    .map((i) => ({ word: str(i.word, ""), clue: str(i.clue, "") }));
}

function normalizeRosco(v: unknown, fallback: RoscoLetterItem[]): RoscoLetterItem[] {
  if (!Array.isArray(v) || v.length === 0) return fallback;
  return v.filter(isObj).map((i) => ({
    letter: str(i.letter, "?").slice(0, 2).toUpperCase(),
    word: str(i.word, ""),
    clue: str(i.clue, ""),
    prefixType: oneOf(i.prefixType, ["starts", "contains"] as const, "starts"),
  }));
}

function normalizeHeader(v: unknown): SheetHeaderOptions {
  if (!isObj(v)) return { ...DEFAULT_HEADER };
  return {
    showName: bool(v.showName, DEFAULT_HEADER.showName),
    showDate: bool(v.showDate, DEFAULT_HEADER.showDate),
    showGrade: bool(v.showGrade, DEFAULT_HEADER.showGrade),
    showScore: bool(v.showScore, DEFAULT_HEADER.showScore),
    schoolName: str(v.schoolName, ""),
  };
}

/**
 * Convierte cualquier dato guardado (borradores v2, fichas de la comunidad, JSON
 * importado) a un snapshot v3 válido. Nunca lanza: lo desconocido toma el valor por defecto.
 */
export function normalizeSnapshot(raw: unknown): ActivitySnapshot {
  const r = isObj(raw) ? raw : {};
  const type = (typeof r.type === "string" && r.type in ACTIVITY_BY_ID ? r.type : "wordsearch") as ActivityType;
  const base = createSnapshot(type);

  const sheetRaw = isObj(r.sheet) ? r.sheet : {};
  // v2 guardaba headerOptions en la raíz del snapshot
  const header = normalizeHeader(isObj(sheetRaw.header) ? sheetRaw.header : r.headerOptions);

  const legacySymbols: SudokuSymbols | undefined = r.sudokuEmojis === true ? "shapes" : undefined;

  return {
    schemaVersion: SNAPSHOT_VERSION,
    type,
    title: str(r.title, base.title).slice(0, 120) || base.title,
    difficulty: oneOf<Difficulty>(r.difficulty, ["easy", "medium", "hard"], base.difficulty),
    seed: num(r.seed, newSeed(), 0, 2 ** 32 - 1),
    items: normalizeWordItems(r.items, base.items),
    cryptoPhrase: str(r.cryptoPhrase, base.cryptoPhrase),
    cryptoHint: str(r.cryptoHint, base.cryptoHint),
    clozeText: str(r.clozeText, base.clozeText),
    roscoItems: normalizeRosco(r.roscoItems, base.roscoItems),
    wordSearchSize: r.wordSearchSize == null ? null : num(r.wordSearchSize, 12, 8, 22),
    sudokuSize: oneOf(r.sudokuSize, [4, 6, 9] as const, base.sudokuSize),
    sudokuSymbols: oneOf<SudokuSymbols>(
      r.sudokuSymbols ?? legacySymbols,
      ["numbers", "shapes", "letters"],
      base.sudokuSymbols
    ),
    pyramidLevels: num(r.pyramidLevels, base.pyramidLevels, 3, 5),
    pyramidCount: num(r.pyramidCount, base.pyramidCount, 1, 4),
    mazeSize: oneOf(r.mazeSize, [8, 11, 15, 21] as const, 15),
    pixelArtKey: typeof r.pixelArtKey === "string" && r.pixelArtKey in PIXEL_TEMPLATES ? r.pixelArtKey : "corazon",
    bingoSize: oneOf(r.bingoSize, [3, 4, 5] as const, base.bingoSize),
    bingoFreeCenter: bool(r.bingoFreeCenter, base.bingoFreeCenter),
    chainLength: num(r.chainLength, base.chainLength, 3, 8),
    chainCount: num(r.chainCount, base.chainCount, 1, 10),
    chainOps: Array.isArray(r.chainOps)
      ? (r.chainOps.filter((o) => ["+", "-", "×", "÷"].includes(o as string)) as ChainOperator[])
      : base.chainOps,
    sheet: {
      header,
      pageSize: oneOf<PageSize>(sheetRaw.pageSize, ["A4", "LETTER"], "A4"),
      copies: num(sheetRaw.copies, 1, 1, MAX_COPIES),
      instructions: str(sheetRaw.instructions, ""),
    },
  };
}

/** Cambia de actividad conservando el contenido compartible (palabras, encabezado, etc.). */
export function switchActivityType(snap: ActivitySnapshot, type: ActivityType): ActivitySnapshot {
  const prevMeta = getActivity(snap.type);
  const keepTitle = snap.title.trim() !== "" && snap.title !== prevMeta.defaultTitle;
  return {
    ...snap,
    type,
    title: keepTitle ? snap.title : getActivity(type).defaultTitle,
    sheet: { ...snap.sheet, instructions: "" },
  };
}

/** Cantidad de palabras con contenido (para listados). */
export function countWords(snap: ActivitySnapshot): number {
  return snap.items.filter((i) => i.word.trim()).length;
}
