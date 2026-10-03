import { SudokuResult, Difficulty } from "../types/activities";

function isSafe(
  grid: number[][],
  row: number,
  col: number,
  num: number,
  size: number,
  subW: number,
  subH: number
): boolean {
  for (let x = 0; x < size; x++) {
    if (grid[row][x] === num || grid[x][col] === num) return false;
  }

  const startRow = row - (row % subH);
  const startCol = col - (col % subW);

  for (let r = 0; r < subH; r++) {
    for (let d = 0; d < subW; d++) {
      if (grid[r + startRow][d + startCol] === num) return false;
    }
  }

  return true;
}

function solveSudoku(
  grid: number[][],
  size: number,
  subW: number,
  subH: number
): boolean {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 0) {
        const numbers = Array.from({ length: size }, (_, i) => i + 1).sort(
          () => Math.random() - 0.5
        );
        for (const num of numbers) {
          if (isSafe(grid, r, c, num, size, subW, subH)) {
            grid[r][c] = num;
            if (solveSudoku(grid, size, subW, subH)) return true;
            grid[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

export function generateSudoku(
  size: 4 | 6 | 9 = 9,
  difficulty: Difficulty = "medium",
  useEmojis = false
): SudokuResult {
  const subgridWidth = size === 4 ? 2 : 3;
  const subgridHeight = size === 4 ? 2 : size === 6 ? 2 : 3;

  // Generate complete solution grid
  const solutionGrid: number[][] = Array.from({ length: size }, () =>
    Array(size).fill(0)
  );
  solveSudoku(solutionGrid, size, subgridWidth, subgridHeight);

  // Deep clone to create puzzle
  const initialGrid: (number | null)[][] = solutionGrid.map((row) => [...row]);

  // Determine number of cells to clear
  let cellsToRemove = 40;
  if (size === 4) {
    cellsToRemove = difficulty === "easy" ? 6 : difficulty === "medium" ? 8 : 10;
  } else if (size === 6) {
    cellsToRemove = difficulty === "easy" ? 14 : difficulty === "medium" ? 18 : 22;
  } else {
    cellsToRemove = difficulty === "easy" ? 34 : difficulty === "medium" ? 44 : 52;
  }

  const positions: [number, number][] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      positions.push([r, c]);
    }
  }

  // Shuffle positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  for (let i = 0; i < Math.min(cellsToRemove, positions.length); i++) {
    const [r, c] = positions[i];
    initialGrid[r][c] = null;
  }

  const emojiSets: Record<number, string[]> = {
    4: ["🐶", "🐱", "🐰", "🦊"],
    6: ["🍎", "🍌", "🍇", "🍓", "🍊", "🍉"],
    9: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
  };

  return {
    size,
    subgridWidth,
    subgridHeight,
    initialGrid,
    solutionGrid,
    symbols: useEmojis ? emojiSets[size] : undefined,
  };
}
