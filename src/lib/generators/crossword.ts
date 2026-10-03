import { sanitizeSpanishWord } from "./wordSearch";

export interface CrosswordWord {
  word: string;
  originalWord: string;
  clue: string;
  x: number;
  y: number;
  direction: "H" | "V";
  number: number;
}

export interface CrosswordResult {
  grid: { char: string; number?: number }[][];
  words: CrosswordWord[];
  width: number;
  height: number;
  /** Palabras que no se pudieron cruzar con ninguna otra y quedaron sueltas. */
  disconnectedWords: string[];
}

export function generateCrossword(items: { word: string; clue: string }[]): CrosswordResult {
  const cleanItems = items
    .map((item) => ({
      original: item.word.trim(),
      word: sanitizeSpanishWord(item.word),
      clue: item.clue.trim(),
    }))
    .filter((item) => item.word.length >= 2);

  if (cleanItems.length === 0) {
    return { grid: [], words: [], width: 0, height: 0, disconnectedWords: [] };
  }

  // La palabra más larga va primero; el resto en orden aleatorio (con preferencia
  // por las largas) para que "Regenerar" produzca crucigramas distintos.
  const sortKey = new Map(cleanItems.map((it) => [it, it.word.length + Math.random() * 4]));
  cleanItems.sort((a, b) => b.word.length - a.word.length);
  const [longest, ...rest] = cleanItems;
  rest.sort((a, b) => sortKey.get(b)! - sortKey.get(a)!);
  cleanItems.splice(0, cleanItems.length, longest, ...rest);
  const disconnectedWords: string[] = [];

  const placedWords: CrosswordWord[] = [];
  const gridMap = new Map<string, string>(); // "y,x" -> char

  const getCell = (y: number, x: number) => gridMap.get(`${y},${x}`) || "";
  const setCell = (y: number, x: number, char: string) => gridMap.set(`${y},${x}`, char);

  const isValidPlacement = (word: string, startY: number, startX: number, isHorizontal: boolean) => {
    let intersections = 0;

    const beforeY = isHorizontal ? startY : startY - 1;
    const beforeX = isHorizontal ? startX - 1 : startX;
    if (getCell(beforeY, beforeX) !== "") return false;

    const afterY = isHorizontal ? startY : startY + word.length;
    const afterX = isHorizontal ? startX + word.length : startX;
    if (getCell(afterY, afterX) !== "") return false;

    for (let i = 0; i < word.length; i++) {
      const y = isHorizontal ? startY : startY + i;
      const x = isHorizontal ? startX + i : startX;

      const currentCell = getCell(y, x);
      if (currentCell === word[i]) {
        intersections++;
      } else if (currentCell !== "") {
        return false;
      } else {
        const adj1Y = isHorizontal ? y - 1 : y;
        const adj1X = isHorizontal ? x : x - 1;
        const adj2Y = isHorizontal ? y + 1 : y;
        const adj2X = isHorizontal ? x : x + 1;

        if (getCell(adj1Y, adj1X) !== "" || getCell(adj2Y, adj2X) !== "") {
          return false;
        }
      }
    }
    return intersections > 0 || placedWords.length === 0;
  };

  // Colocar primera palabra en el centro horizontalmente
  const first = cleanItems[0];
  for (let i = 0; i < first.word.length; i++) {
    setCell(0, i, first.word[i]);
  }
  placedWords.push({
    word: first.word,
    originalWord: first.original,
    clue: first.clue,
    x: 0,
    y: 0,
    direction: "H",
    number: 0,
  });

  for (let i = 1; i < cleanItems.length; i++) {
    const item = cleanItems[i];
    let bestPlacement: { y: number; x: number; isH: boolean; score: number } | null = null;

    for (const placed of placedWords) {
      const isH = placed.direction === "V"; // Perpendicular

      for (let pIdx = 0; pIdx < placed.word.length; pIdx++) {
        const charToMatch = placed.word[pIdx];

        for (let cIdx = 0; cIdx < item.word.length; cIdx++) {
          if (item.word[cIdx] === charToMatch) {
            const startY = isH ? placed.y + pIdx : placed.y - cIdx;
            const startX = isH ? placed.x - cIdx : placed.x + pIdx;

            if (isValidPlacement(item.word, startY, startX, isH)) {
              const score = Math.abs(startY) + Math.abs(startX) + Math.random() * 3;
              if (!bestPlacement || score < bestPlacement.score) {
                bestPlacement = { y: startY, x: startX, isH, score };
              }
            }
          }
        }
      }
    }

    if (bestPlacement) {
      const { y, x, isH } = bestPlacement;
      for (let j = 0; j < item.word.length; j++) {
        setCell(isH ? y : y + j, isH ? x + j : x, item.word[j]);
      }
      placedWords.push({
        word: item.word,
        originalWord: item.original,
        clue: item.clue,
        x,
        y,
        direction: isH ? "H" : "V",
        number: 0,
      });
    } else {
      // Fallback: ubicar abajo, sin cruces
      disconnectedWords.push(item.original);
      let maxY = 0;
      for (const p of placedWords) {
        maxY = Math.max(maxY, p.direction === "V" ? p.y + p.word.length : p.y);
      }
      const newY = maxY + 2;
      for (let j = 0; j < item.word.length; j++) {
        setCell(newY, j, item.word[j]);
      }
      placedWords.push({
        word: item.word,
        originalWord: item.original,
        clue: item.clue,
        x: 0,
        y: newY,
        direction: "H",
        number: 0,
      });
    }
  }

  // Bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const key of gridMap.keys()) {
    const [y, x] = key.split(",").map(Number);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  const width = maxX - minX + 1;
  const height = maxY - minY + 1;

  // Numeración
  placedWords.sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y));
  let counter = 1;
  const positions = new Map<string, number>();

  for (const w of placedWords) {
    const key = `${w.y},${w.x}`;
    if (!positions.has(key)) {
      positions.set(key, counter++);
    }
    w.number = positions.get(key)!;
  }

  const finalGrid = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ({ char: "" } as { char: string; number?: number }))
  );

  for (const [key, char] of gridMap.entries()) {
    const [y, x] = key.split(",").map(Number);
    finalGrid[y - minY][x - minX].char = char;
  }

  for (const w of placedWords) {
    w.y -= minY;
    w.x -= minX;
    finalGrid[w.y][w.x].number = w.number;
  }

  return { grid: finalGrid, words: placedWords, width, height, disconnectedWords };
}
