import { SudokuResult, Difficulty, SudokuSymbols } from "../types/activities";
import { shuffle } from "../random";

type Grid = number[][];

export function sudokuBoxes(size: 4 | 6 | 9): { subgridWidth: number; subgridHeight: number } {
  if (size === 4) return { subgridWidth: 2, subgridHeight: 2 };
  if (size === 6) return { subgridWidth: 3, subgridHeight: 2 };
  return { subgridWidth: 3, subgridHeight: 3 };
}

function isSafe(grid: Grid, row: number, col: number, num: number, subW: number, subH: number): boolean {
  const size = grid.length;
  for (let x = 0; x < size; x++) {
    if (grid[row][x] === num || grid[x][col] === num) return false;
  }
  const startRow = row - (row % subH);
  const startCol = col - (col % subW);
  for (let r = 0; r < subH; r++) {
    for (let c = 0; c < subW; c++) {
      if (grid[startRow + r][startCol + c] === num) return false;
    }
  }
  return true;
}

function fillGrid(grid: Grid, subW: number, subH: number): boolean {
  const size = grid.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 0) {
        for (const num of shuffle(Array.from({ length: size }, (_, i) => i + 1))) {
          if (isSafe(grid, r, c, num, subW, subH)) {
            grid[r][c] = num;
            if (fillGrid(grid, subW, subH)) return true;
            grid[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

/** Cuenta soluciones hasta `limit` (para verificar unicidad sin explorar todo). */
export function countSudokuSolutions(grid: Grid, subW: number, subH: number, limit = 2): number {
  const size = grid.length;
  let best: { r: number; c: number; options: number[] } | null = null;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] !== 0) continue;
      const options: number[] = [];
      for (let n = 1; n <= size; n++) if (isSafe(grid, r, c, n, subW, subH)) options.push(n);
      if (options.length === 0) return 0;
      if (!best || options.length < best.options.length) best = { r, c, options };
    }
  }
  if (!best) return 1;

  let count = 0;
  for (const n of best.options) {
    grid[best.r][best.c] = n;
    count += countSudokuSolutions(grid, subW, subH, limit - count);
    grid[best.r][best.c] = 0;
    if (count >= limit) break;
  }
  return count;
}

const CLUES_TO_REMOVE: Record<4 | 6 | 9, Record<Difficulty, number>> = {
  4: { easy: 6, medium: 8, hard: 10 },
  6: { easy: 14, medium: 18, hard: 22 },
  9: { easy: 36, medium: 46, hard: 54 },
};

export function generateSudoku(
  size: 4 | 6 | 9 = 9,
  difficulty: Difficulty = "medium",
  symbols: SudokuSymbols = "numbers"
): SudokuResult {
  const { subgridWidth, subgridHeight } = sudokuBoxes(size);

  const solutionGrid: Grid = Array.from({ length: size }, () => Array(size).fill(0));
  fillGrid(solutionGrid, subgridWidth, subgridHeight);

  // Quitamos pistas una a una, sólo si el tablero sigue teniendo solución única.
  const puzzle: Grid = solutionGrid.map((row) => [...row]);
  const target = CLUES_TO_REMOVE[size][difficulty];
  let removed = 0;
  const positions = shuffle(
    Array.from({ length: size * size }, (_, i) => [Math.floor(i / size), i % size] as [number, number])
  );
  for (const [r, c] of positions) {
    if (removed >= target) break;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;
    if (countSudokuSolutions(puzzle, subgridWidth, subgridHeight, 2) === 1) {
      removed++;
    } else {
      puzzle[r][c] = backup;
    }
  }

  return {
    size,
    subgridWidth,
    subgridHeight,
    initialGrid: puzzle.map((row) => row.map((v) => (v === 0 ? null : v))),
    solutionGrid,
    symbols: symbols === "shapes" && size === 9 ? "numbers" : symbols,
  };
}

export const SUDOKU_LETTERS = "ABCDEFGHI";

/** Texto a mostrar para un valor según el juego de símbolos (las figuras se dibujan aparte). */
export function sudokuSymbolText(value: number, symbols: SudokuSymbols): string {
  if (symbols === "letters") return SUDOKU_LETTERS[value - 1] ?? String(value);
  return String(value);
}
