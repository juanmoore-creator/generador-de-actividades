import { CrossMathResult, CrossMathCell, Difficulty } from "../types/activities";

export function generateCrossMath(difficulty: Difficulty = "medium"): CrossMathResult {
  // We'll generate a 5x5 arithmetic grid:
  // (0,0) (0,1) (0,2) (0,3) (0,4) -> Num op Num = Num
  // (1,0) (1,1) (1,2) (1,3) (1,4) -> op   .  op   .  op
  // (2,0) (2,1) (2,2) (2,3) (2,4) -> Num op Num = Num
  // (3,0) (3,1) (3,2) (3,3) (3,4) ->  =   .   =   .   =
  // (4,0) (4,1) (4,2) (4,3) (4,4) -> Num op Num = Num

  const maxVal = difficulty === "easy" ? 12 : difficulty === "medium" ? 20 : 50;

  // Let's generate numbers that satisfy the constraints:
  // R0: a + b = c
  // R2: d + e = f
  // C0: a + d = g
  // C2: b + e = h
  // C4: c + f = i
  // R4: g + h = i  (Notice (a+d) + (b+e) = (a+b) + (d+e) = c + f = i holds!)

  const a = Math.floor(Math.random() * (maxVal / 2)) + 1;
  const b = Math.floor(Math.random() * (maxVal / 2)) + 1;
  const c = a + b;

  const d = Math.floor(Math.random() * (maxVal / 2)) + 1;
  const e = Math.floor(Math.random() * (maxVal / 2)) + 1;
  const f = d + e;

  const g = a + d;
  const h = b + e;
  const i = c + f;

  // Full solution values for each cell
  const grid: CrossMathCell[][] = [
    [
      { type: "number", value: a, isBlank: false },
      { type: "operator", value: "+" },
      { type: "number", value: b, isBlank: false },
      { type: "operator", value: "=" },
      { type: "number", value: c, isBlank: false },
    ],
    [
      { type: "operator", value: "+" },
      { type: "empty" },
      { type: "operator", value: "+" },
      { type: "empty" },
      { type: "operator", value: "+" },
    ],
    [
      { type: "number", value: d, isBlank: false },
      { type: "operator", value: "+" },
      { type: "number", value: e, isBlank: false },
      { type: "operator", value: "=" },
      { type: "number", value: f, isBlank: false },
    ],
    [
      { type: "operator", value: "=" },
      { type: "empty" },
      { type: "operator", value: "=" },
      { type: "empty" },
      { type: "operator", value: "=" },
    ],
    [
      { type: "number", value: g, isBlank: false },
      { type: "operator", value: "+" },
      { type: "number", value: h, isBlank: false },
      { type: "operator", value: "=" },
      { type: "number", value: i, isBlank: false },
    ],
  ];

  // Number cell coordinates:
  const numCoords: [number, number][] = [
    [0, 0], [0, 2], [0, 4],
    [2, 0], [2, 2], [2, 4],
    [4, 0], [4, 2], [4, 4],
  ];

  // Depending on difficulty, hide 3, 5, or 6 numbers
  const hideCount = difficulty === "easy" ? 4 : difficulty === "medium" ? 5 : 6;
  const shuffledCoords = [...numCoords].sort(() => Math.random() - 0.5);

  const solutions: { r: number; c: number; value: number }[] = [];

  for (let idx = 0; idx < hideCount; idx++) {
    const [r, c] = shuffledCoords[idx];
    const cell = grid[r][c];
    if (cell.type === "number") {
      cell.isBlank = true;
      solutions.push({ r, c, value: cell.value });
    }
  }

  return {
    grid,
    size: 5,
    solutions,
  };
}
