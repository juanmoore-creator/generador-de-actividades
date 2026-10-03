import { MathPyramidResult, MathPyramidItem, Difficulty } from "../types/activities";

function generateSinglePyramid(
  id: number,
  levels: number,
  difficulty: Difficulty
): MathPyramidItem {
  // 1. Generate bottom row with appropriate random numbers
  const maxBaseNum = difficulty === "easy" ? 10 : difficulty === "medium" ? 20 : 35;
  const bottomRow: number[] = Array.from(
    { length: levels },
    () => Math.floor(Math.random() * maxBaseNum) + 1
  );

  // 2. Build full solved pyramid from bottom to top
  const solutionRows: number[][] = [bottomRow];
  for (let lvl = 1; lvl < levels; lvl++) {
    const prevRow = solutionRows[lvl - 1];
    const newRow: number[] = [];
    for (let i = 0; i < prevRow.length - 1; i++) {
      newRow.push(prevRow[i] + prevRow[i + 1]);
    }
    solutionRows.push(newRow);
  }

  // 3. Reverse rows so index 0 is the apex (1 cell) and last index is base (levels cells)
  const solutionGrid = [...solutionRows].reverse();

  // 4. Punch holes: decide which cells to reveal
  // Total cells = levels * (levels + 1) / 2
  const totalCells = (levels * (levels + 1)) / 2;
  const toRevealCount =
    difficulty === "easy"
      ? Math.ceil(totalCells * 0.58)
      : difficulty === "medium"
      ? Math.ceil(totalCells * 0.45)
      : Math.ceil(totalCells * 0.35);

  const flatCoords: [number, number][] = [];
  solutionGrid.forEach((row, r) => {
    row.forEach((_, c) => {
      flatCoords.push([r, c]);
    });
  });

  // Always keep at least 1 or 2 in base, and apex can be hidden
  const shuffled = [...flatCoords].sort(() => Math.random() - 0.5);
  const revealedSet = new Set<string>();

  // Ensure minimum solvability
  for (let i = 0; i < Math.min(toRevealCount, shuffled.length); i++) {
    revealedSet.add(`${shuffled[i][0]},${shuffled[i][1]}`);
  }

  const puzzleGrid = solutionGrid.map((row, r) =>
    row.map((val, c) => ({
      value: val,
      revealed: revealedSet.has(`${r},${c}`),
    }))
  );

  return {
    id,
    levels,
    grid: puzzleGrid,
    solutionGrid,
  };
}

export function generateMathPyramids(
  count = 3,
  levels = 4,
  difficulty: Difficulty = "medium"
): MathPyramidResult {
  const pyramids: MathPyramidItem[] = [];
  for (let i = 1; i <= count; i++) {
    pyramids.push(generateSinglePyramid(i, levels, difficulty));
  }

  return {
    pyramids,
  };
}
