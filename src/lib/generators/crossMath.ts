import { CrossMathResult, CrossMathCell, Difficulty } from "../types/activities";
import { shuffle, randInt } from "../random";

/**
 * Cuadrícula 5x5 con 9 números (posiciones pares) y 6 ecuaciones:
 *   fila 0:  a ± b = c      columna 0: a + d = g
 *   fila 2:  d ± e = f      columna 2: b + e = h   (o b - e cuando hay resta)
 *   fila 4:  g ± h = i      columna 4: c + f = i
 */

type Op = "+" | "-";

const NUM_COORDS: [number, number][] = [
  [0, 0], [0, 2], [0, 4],
  [2, 0], [2, 2], [2, 4],
  [4, 0], [4, 2], [4, 4],
];

// Índices (en NUM_COORDS) de cada ecuación [x, y, resultado]
const EQUATIONS: [number, number, number][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // filas
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columnas
];

const HIDE_COUNT: Record<Difficulty, number> = { easy: 3, medium: 5, hard: 6 };

export function isCrossMathSolvable(hidden: Set<number>): boolean {
  const known = new Set(Array.from({ length: 9 }, (_, i) => i).filter((i) => !hidden.has(i)));
  let changed = true;
  while (changed) {
    changed = false;
    for (const eq of EQUATIONS) {
      const missing = eq.filter((i) => !known.has(i));
      if (missing.length === 1) {
        known.add(missing[0]);
        changed = true;
      }
    }
  }
  return known.size === 9;
}

export function generateCrossMath(difficulty: Difficulty = "medium"): CrossMathResult {
  const maxVal = difficulty === "easy" ? 10 : difficulty === "medium" ? 20 : 50;
  const useMinus = difficulty === "hard";

  // Filas con resta en nivel difícil: a - b = c, d - e = f  ⇒  g - h = i se mantiene
  // porque (a+d) - (b+e) = (a-b) + (d-e) = c + f.
  const rowOp: Op = useMinus ? "-" : "+";

  let a: number, b: number, d: number, e: number;
  if (useMinus) {
    b = randInt(1, maxVal / 2);
    a = b + randInt(1, maxVal / 2);
    e = randInt(1, maxVal / 2);
    d = e + randInt(1, maxVal / 2);
  } else {
    a = randInt(1, maxVal / 2);
    b = randInt(1, maxVal / 2);
    d = randInt(1, maxVal / 2);
    e = randInt(1, maxVal / 2);
  }
  const apply = (x: number, y: number) => (rowOp === "+" ? x + y : x - y);
  const c = apply(a, b);
  const f = apply(d, e);
  const g = a + d;
  const h = b + e;
  const i = apply(g, h);

  const values = [a, b, c, d, e, f, g, h, i];

  // Elegimos qué casilleros ocultar asegurando que se pueda resolver.
  const hidden = new Set<number>();
  for (const idx of shuffle(Array.from({ length: 9 }, (_, k) => k))) {
    if (hidden.size >= HIDE_COUNT[difficulty]) break;
    hidden.add(idx);
    if (!isCrossMathSolvable(hidden)) hidden.delete(idx);
  }

  const num = (idx: number): CrossMathCell => ({ type: "number", value: values[idx], isBlank: hidden.has(idx) });
  const op = (value: "+" | "-" | "×" | "="): CrossMathCell => ({ type: "operator", value });
  const empty: CrossMathCell = { type: "empty" };

  const grid: CrossMathCell[][] = [
    [num(0), op(rowOp), num(1), op("="), num(2)],
    [op("+"), empty, op("+"), empty, op("+")],
    [num(3), op(rowOp), num(4), op("="), num(5)],
    [op("="), empty, op("="), empty, op("=")],
    [num(6), op(rowOp), num(7), op("="), num(8)],
  ];

  const solutions = Array.from(hidden)
    .sort((x, y) => x - y)
    .map((idx) => ({ r: NUM_COORDS[idx][0], c: NUM_COORDS[idx][1], value: values[idx] }));

  return { grid, size: 5, solutions };
}
