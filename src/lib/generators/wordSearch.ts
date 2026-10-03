import type { Difficulty } from "../types/activities";

export const WORDSEARCH_MIN_SIZE = 8;
export const WORDSEARCH_MAX_SIZE = 22;

type Direction = [number, number]; // [dy, dx]

const DIRS_EASY: Direction[] = [
  [0, 1], // Derecha
  [1, 0], // Abajo
];

const DIRS_MEDIUM: Direction[] = [
  [0, 1], // Derecha
  [1, 0], // Abajo
  [1, 1], // Diagonal abajo-derecha
];

const DIRS_HARD: Direction[] = [
  [0, 1],   // Derecha
  [1, 0],   // Abajo
  [1, 1],   // Diagonal abajo-derecha
  [-1, 1],  // Diagonal arriba-derecha
  [0, -1],  // Izquierda
  [-1, 0],  // Arriba
  [-1, -1], // Diagonal arriba-izquierda
  [1, -1],  // Diagonal abajo-izquierda
];

export interface WordPlacement {
  word: string;
  originalWord: string;
  x: number;
  y: number;
  direction: Direction;
}

export interface WordSearchResult {
  grid: string[][];
  placedWords: WordPlacement[];
  unplacedWords: string[];
  size: number;
}

export function sanitizeSpanishWord(word: string): string {
  return word
    .trim()
    .toUpperCase()
    .replace(/[ÁÀÄÂ]/g, "A")
    .replace(/[ÉÈËÊ]/g, "E")
    .replace(/[ÍÌÏÎ]/g, "I")
    .replace(/[ÓÒÖÔ]/g, "O")
    .replace(/[ÚÙÜÛ]/g, "U")
    .replace(/[^A-ZÑ]/g, "");
}

/** Tamaño automático de la cuadrícula según cantidad y largo de las palabras. */
export function autoWordSearchSize(words: string[]): number {
  const clean = words.map(sanitizeSpanishWord).filter((w) => w.length >= 2);
  if (clean.length === 0) return 10;
  const maxLen = Math.max(...clean.map((w) => w.length));
  const totalChars = clean.reduce((acc, w) => acc + w.length, 0);
  const size = Math.max(10, maxLen + 2, Math.ceil(Math.sqrt(totalChars * 2.2)));
  return Math.min(size, WORDSEARCH_MAX_SIZE);
}

export function generateWordSearch(
  words: string[],
  difficulty: Difficulty = "easy",
  forcedSize: number | null = null
): WordSearchResult {
  const validItems = words
    .map((w) => ({ original: w.trim(), clean: sanitizeSpanishWord(w) }))
    .filter((item) => item.clean.length >= 2);

  if (validItems.length === 0) {
    return { grid: [], placedWords: [], unplacedWords: [], size: 0 };
  }

  let dirs = DIRS_EASY;
  if (difficulty === "medium") dirs = DIRS_MEDIUM;
  if (difficulty === "hard") dirs = DIRS_HARD;

  const size = forcedSize
    ? Math.min(WORDSEARCH_MAX_SIZE, Math.max(WORDSEARCH_MIN_SIZE, Math.round(forcedSize)))
    : autoWordSearchSize(words);

  let bestResult: WordSearchResult = { grid: [], placedWords: [], unplacedWords: [], size };

  // Ejecutamos varios intentos para colocar la mayor cantidad de palabras
  for (let attempt = 0; attempt < 25; attempt++) {
    const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(""));
    const placedWords: WordPlacement[] = [];
    const unplacedWords: string[] = [];

    const canPlace = (word: string, startY: number, startX: number, [dy, dx]: Direction) => {
      if (
        startY + dy * (word.length - 1) < 0 ||
        startY + dy * (word.length - 1) >= size ||
        startX + dx * (word.length - 1) < 0 ||
        startX + dx * (word.length - 1) >= size
      ) {
        return false;
      }
      for (let i = 0; i < word.length; i++) {
        const cell = grid[startY + dy * i][startX + dx * i];
        if (cell !== "" && cell !== word[i]) {
          return false;
        }
      }
      return true;
    };

    const place = (word: string, originalWord: string, startY: number, startX: number, dir: Direction) => {
      for (let i = 0; i < word.length; i++) {
        grid[startY + dir[0] * i][startX + dir[1] * i] = word[i];
      }
      placedWords.push({ word, originalWord, y: startY, x: startX, direction: dir });
    };

    // Ordenar palabras de mayor a menor longitud
    const sorted = [...validItems].sort((a, b) => b.clean.length - a.clean.length);

    for (const item of sorted) {
      let placed = false;
      let tries = 0;
      while (!placed && tries < 300) {
        const dir = dirs[Math.floor(Math.random() * dirs.length)];
        const startY = Math.floor(Math.random() * size);
        const startX = Math.floor(Math.random() * size);

        if (canPlace(item.clean, startY, startX, dir)) {
          place(item.clean, item.original, startY, startX, dir);
          placed = true;
        }
        tries++;
      }
      if (!placed) {
        unplacedWords.push(item.original);
      }
    }

    if (unplacedWords.length === 0) {
      // Éxito total
      bestResult = { grid, placedWords, unplacedWords: [], size };
      break;
    }

    if (bestResult.placedWords.length === 0 || placedWords.length > bestResult.placedWords.length) {
      bestResult = { grid, placedWords, unplacedWords, size };
    }
  }

  // Rellenar espacios vacíos con letras aleatorias
  // La Ñ sólo aparece como relleno si alguna palabra la usa (p. ej. no en una sopa en inglés).
  const letters = validItems.some((w) => w.clean.includes("Ñ")) ? "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let y = 0; y < bestResult.size; y++) {
    for (let x = 0; x < bestResult.size; x++) {
      if (!bestResult.grid[y] || bestResult.grid[y][x] === "") {
        if (!bestResult.grid[y]) bestResult.grid[y] = [];
        bestResult.grid[y][x] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }

  return bestResult;
}
