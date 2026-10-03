import type {
  ActivitySnapshot,
  ActivityType,
  BingoResult,
  ClozeResult,
  CrossMathResult,
  CryptogramResult,
  MatchingResult,
  MathChainResult,
  MathPyramidResult,
  MazeResult,
  PixelArtResult,
  RoscoResult,
  SudokuResult,
  WordScrambleResult,
} from "../types/activities";
import { deriveSeed, withSeed } from "../random";
import { getActivity } from "./catalog";
import { generateWordSearch, sanitizeSpanishWord, WordSearchResult, WORDSEARCH_MAX_SIZE, autoWordSearchSize } from "../generators/wordSearch";
import { generateCrossword, CrosswordResult } from "../generators/crossword";
import { generateWordScramble } from "../generators/wordScramble";
import { generateMatching } from "../generators/matching";
import { generateCryptogram } from "../generators/cryptogram";
import { generateClozeTest } from "../generators/clozeTest";
import { generateRosco } from "../generators/rosco";
import { generateBingo, bingoCellsNeeded } from "../generators/bingo";
import { generateSudoku } from "../generators/sudoku";
import { generateMathPyramids } from "../generators/mathPyramid";
import { generateCrossMath } from "../generators/crossMath";
import { generateMathChains } from "../generators/mathChain";
import { generateMaze } from "../generators/maze";
import { generateCoordinatePixelArt } from "../generators/coordinatePixelArt";

export interface ResultMap {
  wordsearch: WordSearchResult;
  crossword: CrosswordResult;
  scramble: WordScrambleResult;
  matching: MatchingResult;
  cryptogram: CryptogramResult;
  cloze: ClozeResult;
  rosco: RoscoResult;
  bingo: BingoResult;
  sudoku: SudokuResult;
  mathpyramid: MathPyramidResult;
  crossmath: CrossMathResult;
  mathchain: MathChainResult;
  maze: MazeResult;
  pixelart: PixelArtResult;
}

export type Generated = { [K in ActivityType]: { type: K; result: ResultMap[K] } }[ActivityType];

const filledWords = (s: ActivitySnapshot) => s.items.filter((i) => i.word.trim().length > 0);

const GENERATORS: { [K in ActivityType]: (s: ActivitySnapshot) => ResultMap[K] } = {
  wordsearch: (s) => generateWordSearch(filledWords(s).map((i) => i.word), s.difficulty, s.wordSearchSize),
  crossword: (s) => generateCrossword(filledWords(s)),
  scramble: (s) => generateWordScramble(filledWords(s)),
  matching: (s) => generateMatching(filledWords(s)),
  cryptogram: (s) => generateCryptogram(s.cryptoPhrase, s.cryptoHint, s.difficulty),
  cloze: (s) => generateClozeTest(s.clozeText, s.title),
  rosco: (s) => generateRosco(s.roscoItems.filter((i) => i.word.trim() || i.clue.trim())),
  bingo: (s) => generateBingo(filledWords(s), s.bingoSize, s.bingoFreeCenter),
  sudoku: (s) => generateSudoku(s.sudokuSize, s.difficulty, s.sudokuSymbols),
  mathpyramid: (s) => generateMathPyramids(s.pyramidCount, s.pyramidLevels, s.difficulty),
  crossmath: (s) => generateCrossMath(s.difficulty),
  mathchain: (s) => generateMathChains(s.chainCount, s.chainLength, s.chainOps, s.difficulty),
  maze: (s) => generateMaze(s.mazeSize, s.mazeSize),
  pixelart: (s) => generateCoordinatePixelArt(s.pixelArtKey),
};

/**
 * Genera la actividad de forma determinista: el mismo snapshot (y la misma copia)
 * produce siempre el mismo resultado.
 */
export function generateActivity(snap: ActivitySnapshot, copyIndex = 0): Generated {
  return withSeed(deriveSeed(snap.seed, copyIndex), () => {
    const generator = GENERATORS[snap.type] as (s: ActivitySnapshot) => Generated["result"];
    return { type: snap.type, result: generator(snap) } as Generated;
  });
}

/** Actividades cuyo resultado no depende del azar (todas las versiones son iguales). */
export const DETERMINISTIC_TYPES: ActivityType[] = ["rosco", "pixelart"];

export function hasContent(gen: Generated): boolean {
  switch (gen.type) {
    case "wordsearch":
      return gen.result.grid.length > 0;
    case "crossword":
      return gen.result.words.length > 0;
    case "scramble":
      return gen.result.items.length > 0;
    case "matching":
      return gen.result.pairs.length > 0;
    case "cryptogram":
      return gen.result.words.length > 0;
    case "cloze":
      return gen.result.textWithBlanks.length > 0;
    case "rosco":
      return gen.result.items.length > 0;
    case "bingo":
      return gen.result.callList.length > 0;
    case "mathchain":
      return gen.result.chains.length > 0;
    default:
      return true;
  }
}

// ---------------------------------------------------------------------------
// Validación
// ---------------------------------------------------------------------------

export type IssueFix =
  | { kind: "setWordSearchSize"; size: number; label: string }
  | { kind: "regenerate"; label: string };

export interface Issue {
  level: "error" | "warning" | "info";
  message: string;
  fix?: IssueFix;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const listWords = (words: string[], max = 4) =>
  words.length <= max ? words.join(", ") : `${words.slice(0, max).join(", ")} y ${words.length - max} más`;

/** Revisa el contenido y el resultado generado y devuelve avisos para mostrar al docente. */
export function validateActivity(snap: ActivitySnapshot, gen: Generated): Issue[] {
  const meta = getActivity(snap.type);
  const issues: Issue[] = [];
  const words = filledWords(snap);

  if (meta.content === "words" || meta.content === "words-clues") {
    const relevant = meta.clues === "required" ? words.filter((w) => w.clue.trim()) : words;
    if (meta.minItems && relevant.length < meta.minItems) {
      issues.push({
        level: "error",
        message:
          meta.clues === "required"
            ? `Agrega al menos ${meta.minItems} palabras con su definición (tienes ${relevant.length}).`
            : `Agrega al menos ${meta.minItems} palabras (tienes ${relevant.length}).`,
      });
    }

    const seen = new Set<string>();
    const dups = new Set<string>();
    for (const w of words) {
      const key = sanitizeSpanishWord(w.word);
      if (seen.has(key)) dups.add(w.word.trim());
      seen.add(key);
    }
    if (dups.size > 0) {
      issues.push({ level: "warning", message: `Palabras repetidas: ${listWords([...dups])}.` });
    }

    if (snap.type === "wordsearch" || snap.type === "crossword") {
      const altered = words
        .map((w) => w.word.trim())
        .filter((w) => /[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(w));
      if (altered.length > 0) {
        issues.push({
          level: "info",
          message: `Se quitarán espacios, números y signos de: ${listWords(altered)}.`,
        });
      }
    }
  }

  switch (gen.type) {
    case "wordsearch": {
      const unplaced = gen.result.unplacedWords;
      if (unplaced.length > 0) {
        const current = gen.result.size;
        const longest = Math.max(...unplaced.map((w) => sanitizeSpanishWord(w).length));
        const canGrow = current < WORDSEARCH_MAX_SIZE;
        issues.push({
          level: "warning",
          message: `${plural(unplaced.length, "palabra no entró", "palabras no entraron")} en la cuadrícula: ${listWords(unplaced)}.${
            longest > WORDSEARCH_MAX_SIZE ? ` Hay palabras de más de ${WORDSEARCH_MAX_SIZE} letras: acórtalas.` : ""
          }`,
          fix: canGrow
            ? {
                kind: "setWordSearchSize",
                size: Math.min(WORDSEARCH_MAX_SIZE, Math.max(current + 2, longest)),
                label: "Agrandar cuadrícula",
              }
            : { kind: "regenerate", label: "Probar otra distribución" },
        });
      } else if (snap.wordSearchSize && snap.wordSearchSize < autoWordSearchSize(words.map((w) => w.word)) - 3) {
        issues.push({ level: "info", message: "La cuadrícula es pequeña para tantas palabras: puede quedar muy apretada." });
      }
      break;
    }
    case "crossword": {
      if (gen.result.disconnectedWords.length > 0) {
        issues.push({
          level: "warning",
          message: `${listWords(gen.result.disconnectedWords)} no ${
            gen.result.disconnectedWords.length === 1 ? "se cruza" : "se cruzan"
          } con ninguna otra palabra y ${gen.result.disconnectedWords.length === 1 ? "quedó suelta" : "quedaron sueltas"}.`,
          fix: { kind: "regenerate", label: "Probar otra distribución" },
        });
      }
      const noClue = words.filter((w) => !w.clue.trim()).length;
      if (noClue > 0) {
        issues.push({
          level: "warning",
          message: `${plural(noClue, "palabra no tiene", "palabras no tienen")} pista: se mostrará "Palabra de N letras".`,
        });
      }
      break;
    }
    case "matching": {
      const noClue = words.filter((w) => !w.clue.trim());
      if (noClue.length > 0) {
        issues.push({
          level: "warning",
          message: `Sin definición (no se incluirán): ${listWords(noClue.map((w) => w.word.trim()))}.`,
        });
      }
      if (gen.result.pairs.length > 12) {
        issues.push({ level: "info", message: "Con más de 12 pares la hoja puede quedar muy cargada." });
      }
      break;
    }
    case "scramble": {
      const short = words.filter((w) => w.word.trim().length < 3).map((w) => w.word.trim());
      if (short.length > 0) {
        issues.push({ level: "info", message: `Palabras muy cortas para desordenar: ${listWords(short)}.` });
      }
      break;
    }
    case "cryptogram": {
      if (!snap.cryptoPhrase.trim()) {
        issues.push({ level: "error", message: "Escribe la frase que tus alumnos van a descifrar." });
      } else if (snap.cryptoPhrase.replace(/\s/g, "").length > 120) {
        issues.push({ level: "warning", message: "La frase es larga: puede no entrar en una hoja." });
      }
      break;
    }
    case "cloze": {
      const text = snap.clozeText;
      if (!text.trim()) {
        issues.push({ level: "error", message: "Escribe el texto de la actividad." });
        break;
      }
      const open = (text.match(/\[/g) || []).length;
      const close = (text.match(/\]/g) || []).length;
      if (open !== close) {
        issues.push({ level: "warning", message: "Hay corchetes sin cerrar: revisa que cada [ tenga su ]." });
      } else if (open === 0) {
        issues.push({
          level: "info",
          message: "No marcaste palabras con [corchetes]: se eligieron algunas al azar.",
          fix: { kind: "regenerate", label: "Elegir otras" },
        });
      }
      break;
    }
    case "rosco": {
      const incomplete = snap.roscoItems.filter((i) => !i.word.trim() || !i.clue.trim()).map((i) => i.letter);
      if (incomplete.length > 0) {
        issues.push({ level: "warning", message: `Letras incompletas: ${listWords(incomplete, 8)}.` });
      }
      const mismatched = snap.roscoItems
        .filter((i) => i.word.trim())
        .filter((i) => {
          const w = i.word.trim().toUpperCase();
          const l = i.letter.toUpperCase();
          return i.prefixType === "starts" ? !w.startsWith(l) : !w.includes(l);
        })
        .map((i) => i.letter);
      if (mismatched.length > 0) {
        issues.push({
          level: "warning",
          message: `La respuesta no coincide con la letra en: ${listWords(mismatched, 8)}.`,
        });
      }
      break;
    }
    case "bingo": {
      const needed = bingoCellsNeeded(snap.bingoSize, snap.bingoFreeCenter);
      const unique = gen.result.callList.length;
      if (unique < needed) {
        issues.push({
          level: "error",
          message: `Un cartón de ${snap.bingoSize}×${snap.bingoSize} necesita ${needed} palabras distintas (tienes ${unique}).`,
        });
      } else if (snap.sheet.copies > 1 && unique === needed) {
        issues.push({
          level: "info",
          message: "Con exactamente las palabras justas, los cartones solo cambian el orden. Agrega más palabras para que sean distintos.",
        });
      }
      break;
    }
    case "mathchain": {
      if (snap.chainOps.length === 0) {
        issues.push({ level: "error", message: "Elige al menos una operación." });
      }
      break;
    }
  }

  if (snap.sheet.copies > 1 && DETERMINISTIC_TYPES.includes(snap.type)) {
    issues.push({
      level: "info",
      message: "Esta actividad es igual en todas las versiones: se imprimirán copias idénticas.",
    });
  }

  return issues;
}
