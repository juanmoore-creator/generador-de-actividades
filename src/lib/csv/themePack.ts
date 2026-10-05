import type { WordItem } from "../types/activities";
import { sanitizeSpanishWord } from "../generators/wordSearch";

export interface ParsedThemePack {
  title: string;
  items: WordItem[];
  warnings: string[];
}

/**
 * Detects the most likely delimiter (, ; or \t) based on sample lines.
 */
function detectDelimiter(text: string): "," | ";" | "\t" {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));

  let commaCount = 0;
  let semiCount = 0;
  let tabCount = 0;

  for (const line of lines.slice(0, 10)) {
    // Count delimiters outside of quotes
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') inQuotes = !inQuotes;
      else if (!inQuotes) {
        if (char === ",") commaCount++;
        else if (char === ";") semiCount++;
        else if (char === "\t") tabCount++;
      }
    }
  }

  if (tabCount > commaCount && tabCount > semiCount) return "\t";
  if (semiCount > commaCount) return ";";
  return ",";
}

/**
 * RFC-4180 compliant CSV tokenizer that handles quotes, escaped quotes (""),
 * newlines within quotes, and arbitrary single-character delimiters.
 */
function parseCsvRows(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (insideQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++; // skip escaped quote
        } else {
          insideQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === delimiter) {
        currentRow.push(currentField);
        currentField = "";
      } else if (char === "\r") {
        if (nextChar === "\n") i++;
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = "";
      } else if (char === "\n") {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = "";
      } else {
        currentField += char;
      }
    }
  }

  // Push remainder
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

/**
 * Checks if a row looks like a header row (e.g. palabra, pista / word, clue / concepto, definición).
 */
function isHeaderRow(col1: string, col2: string): boolean {
  const c1 = col1.toLowerCase().trim();
  const c2 = col2.toLowerCase().trim();

  const wordHeaders = ["palabra", "word", "concepto", "termino", "término", "pregunta", "item", "vocabulario"];
  const clueHeaders = ["pista", "clue", "definicion", "definición", "significado", "respuesta", "descripcion", "descripción"];

  return wordHeaders.includes(c1) || clueHeaders.includes(c2);
}

/**
 * Parses a CSV string or AI-generated output into a structured Theme Pack.
 * Handles metadata comments like `# tema: Sistema Solar`, delimiters (, ; \t),
 * quote escaping, and word sanitization.
 */
export function parseThemeCsv(rawInput: string): ParsedThemePack {
  const warnings: string[] = [];
  let detectedTitle = "";

  // 1. Pre-process lines to extract metadata (# tema: ...)
  const lines = rawInput.split(/\r?\n/);
  const dataLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check for comment metadata: # tema: ..., # topic: ..., # titulo: ...
    const metaMatch = trimmed.match(/^#+\s*(?:tema|topic|t[ií]tulo|title)\s*[:=]\s*(.+)$/i);
    if (metaMatch && !detectedTitle) {
      detectedTitle = metaMatch[1].trim();
      continue;
    }

    // Skip generic comments
    if (trimmed.startsWith("#") || trimmed.startsWith("//")) {
      continue;
    }

    dataLines.push(line);
  }

  const cleanText = dataLines.join("\n").trim();
  if (!cleanText) {
    return {
      title: detectedTitle || "Nuevo Tema",
      items: [],
      warnings: ["El archivo no contiene filas de datos."],
    };
  }

  // 2. Delimiter detection & row parsing
  const delimiter = detectDelimiter(cleanText);
  const rawRows = parseCsvRows(cleanText, delimiter);

  const items: WordItem[] = [];
  const seenWords = new Set<string>();

  for (let rowIndex = 0; rowIndex < rawRows.length; rowIndex++) {
    const row = rawRows[rowIndex];
    if (row.length === 0 || (row.length === 1 && !row[0].trim())) continue;

    // If first row is a single cell without commas/delimiters and no title was found, it might be the title
    if (rowIndex === 0 && row.length === 1 && !detectedTitle && rawRows.length > 1) {
      detectedTitle = row[0].trim();
      continue;
    }

    const rawWord = row[0]?.trim() || "";
    const rawClue = row[1]?.trim() || "";

    // Skip column headers
    if (rowIndex === 0 && isHeaderRow(rawWord, rawClue)) {
      continue;
    }

    // If no word found on this row
    if (!rawWord) {
      continue;
    }

    // Clean word for educational games (uppercase, standard Spanish letter characters)
    const sanitizedWord = sanitizeSpanishWord(rawWord);

    if (sanitizedWord.length < 2) {
      warnings.push(`Se omitió "${rawWord}" en la fila ${rowIndex + 1} porque tiene menos de 2 letras.`);
      continue;
    }

    if (sanitizedWord.length > 20) {
      warnings.push(`La palabra "${sanitizedWord}" supera las 20 letras y podría no encajar bien en algunas cuadrículas.`);
    }

    if (seenWords.has(sanitizedWord)) {
      warnings.push(`La palabra "${sanitizedWord}" está duplicada. Se mantuvo la primera aparición.`);
      continue;
    }

    seenWords.add(sanitizedWord);
    items.push({
      word: sanitizedWord,
      clue: rawClue,
    });
  }

  if (items.length === 0) {
    warnings.push("No se pudieron extraer palabras válidas del texto.");
  } else if (items.length < 6) {
    warnings.push(`Se encontraron solo ${items.length} palabras. Se recomiendan al menos 10 para generar crucigramas y sopas completas.`);
  }

  return {
    title: detectedTitle || "Actividades Temáticas",
    items,
    warnings,
  };
}
