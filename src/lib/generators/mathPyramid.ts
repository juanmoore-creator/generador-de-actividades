import { MathPyramidResult, MathPyramidItem, Difficulty } from "../types/activities";
import { shuffle, randInt } from "../random";

/**
 * Pirámide de sumas: cada ladrillo es la suma de los dos de abajo.
 * grid[0] es la cúspide (1 celda) y grid[levels-1] la base.
 */

const BASE_MAX: Record<Difficulty, number> = { easy: 9, medium: 20, hard: 40 };
const HIDDEN_RATIO: Record<Difficulty, number> = { easy: 0.4, medium: 0.55, hard: 0.68 };

/** Verifica por propagación que todos los valores ocultos se puedan deducir. */
export function isPyramidSolvable(solution: number[][], revealed: boolean[][]): boolean {
  const levels = solution.length;
  const known = revealed.map((row) => [...row]);
  let changed = true;

  while (changed) {
    changed = false;
    // Relación: parent(r, c) = child(r+1, c) + child(r+1, c+1)
    for (let r = 0; r < levels - 1; r++) {
      for (let c = 0; c <= r; c++) {
        const p = known[r][c];
        const a = known[r + 1][c];
        const b = known[r + 1][c + 1];
        const count = Number(p) + Number(a) + Number(b);
        if (count === 2) {
          if (!p) known[r][c] = true;
          if (!a) known[r + 1][c] = true;
          if (!b) known[r + 1][c + 1] = true;
          changed = true;
        }
      }
    }
  }

  return known.every((row) => row.every(Boolean));
}

function generateSinglePyramid(id: number, levels: number, difficulty: Difficulty): MathPyramidItem {
  const base = Array.from({ length: levels }, () => randInt(1, BASE_MAX[difficulty]));
  const rows: number[][] = [base];
  for (let lvl = 1; lvl < levels; lvl++) {
    const prev = rows[lvl - 1];
    rows.push(prev.slice(0, -1).map((v, i) => v + prev[i + 1]));
  }
  const solutionGrid = rows.reverse();

  const revealed = solutionGrid.map((row) => row.map(() => true));
  const totalCells = (levels * (levels + 1)) / 2;
  const targetHidden = Math.round(totalCells * HIDDEN_RATIO[difficulty]);
  let hidden = 0;

  const coords = shuffle(solutionGrid.flatMap((row, r) => row.map((_, c) => [r, c] as [number, number])));
  for (const [r, c] of coords) {
    if (hidden >= targetHidden) break;
    revealed[r][c] = false;
    if (isPyramidSolvable(solutionGrid, revealed)) {
      hidden++;
    } else {
      revealed[r][c] = true;
    }
  }

  return {
    id,
    levels,
    grid: solutionGrid.map((row, r) => row.map((value, c) => ({ value, revealed: revealed[r][c] }))),
    solutionGrid,
  };
}

export function generateMathPyramids(
  count = 2,
  levels = 4,
  difficulty: Difficulty = "medium"
): MathPyramidResult {
  const safeLevels = Math.min(5, Math.max(3, levels));
  return {
    pyramids: Array.from({ length: Math.max(1, count) }, (_, i) =>
      generateSinglePyramid(i + 1, safeLevels, difficulty)
    ),
  };
}
