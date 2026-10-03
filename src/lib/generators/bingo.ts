import { BingoResult, WordItem } from "../types/activities";
import { shuffle } from "../random";

/** Cantidad de palabras distintas que necesita una tarjeta. */
export function bingoCellsNeeded(size: 3 | 4 | 5, freeCenter: boolean): number {
  return size * size - (freeCenter && size % 2 === 1 ? 1 : 0);
}

export function generateBingo(items: WordItem[], size: 3 | 4 | 5 = 4, freeCenter = true): BingoResult {
  const seen = new Set<string>();
  const callList = items
    .map((i) => ({ word: i.word.trim().toUpperCase(), clue: i.clue.trim() }))
    .filter((i) => {
      if (!i.word || seen.has(i.word)) return false;
      seen.add(i.word);
      return true;
    });

  const hasFree = freeCenter && size % 2 === 1;
  const center = Math.floor(size / 2);
  const picked = shuffle(callList).slice(0, bingoCellsNeeded(size, freeCenter));

  let k = 0;
  const card = Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) => {
      if (hasFree && r === center && c === center) return null;
      return picked[k++]?.word ?? "";
    })
  );

  return { size, card, callList };
}
