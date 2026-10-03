import type { WordItem } from "../types/activities";

/**
 * Convierte texto pegado en una lista de palabras con pistas.
 * Acepta una palabra por línea, "palabra: pista", "palabra - pista", "palabra = pista",
 * columnas separadas por tabulador (copiadas de una planilla) o "a, b, c".
 */
export function parseBulkText(text: string): WordItem[] {
  const results: WordItem[] = [];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    if (line.includes(",") && !/[:\t=]| - /.test(line)) {
      for (const part of line.split(",").map((p) => p.trim()).filter(Boolean)) {
        results.push({ word: part.toUpperCase(), clue: "" });
      }
      continue;
    }
    const match = line.match(/^(.*?)(?:\t|:| - | = | – )(.*)$/);
    if (match && match[1].trim()) {
      results.push({ word: match[1].trim().toUpperCase(), clue: match[2].trim() });
    } else {
      results.push({ word: line.toUpperCase(), clue: "" });
    }
  }
  return results;
}
