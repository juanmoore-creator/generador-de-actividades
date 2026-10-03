import { ChainOperator, Difficulty, MathChain, MathChainResult } from "../types/activities";
import { randInt, shuffle } from "../random";

const LIMITS: Record<Difficulty, { start: number; operand: number; factor: number; max: number }> = {
  easy: { start: 20, operand: 10, factor: 3, max: 60 },
  medium: { start: 50, operand: 25, factor: 6, max: 200 },
  hard: { start: 100, operand: 60, factor: 12, max: 1000 },
};

function divisorsOf(n: number, maxDivisor: number): number[] {
  const out: number[] = [];
  for (let d = 2; d <= Math.min(maxDivisor, n); d++) if (n % d === 0 && n / d >= 1) out.push(d);
  return out;
}

function nextStep(current: number, ops: ChainOperator[], difficulty: Difficulty) {
  const lim = LIMITS[difficulty];
  // Probamos operaciones al azar hasta encontrar una que dé un entero positivo dentro del rango.
  const candidates = shuffle(ops);
  for (const op of candidates) {
    if (op === "+") {
      const operand = randInt(1, lim.operand);
      if (current + operand <= lim.max) return { op, operand, result: current + operand };
    } else if (op === "-") {
      if (current > 1) {
        const operand = randInt(1, Math.min(lim.operand, current - 1));
        return { op, operand, result: current - operand };
      }
    } else if (op === "×") {
      const maxFactor = Math.min(lim.factor, Math.floor(lim.max / Math.max(current, 1)));
      if (maxFactor >= 2) {
        const operand = randInt(2, maxFactor);
        return { op, operand, result: current * operand };
      }
    } else if (op === "÷") {
      const divs = divisorsOf(current, Math.max(lim.factor, 10));
      if (divs.length > 0) {
        const operand = divs[randInt(0, divs.length - 1)];
        return { op, operand, result: current / operand };
      }
    }
  }
  // Siempre es posible sumar algo pequeño o restar si nos pasamos del máximo.
  if (current < lim.max) return { op: "+" as const, operand: 1, result: current + 1 };
  return { op: "-" as const, operand: 1, result: current - 1 };
}

export function generateMathChains(
  count = 5,
  length = 5,
  ops: ChainOperator[] = ["+", "-"],
  difficulty: Difficulty = "medium"
): MathChainResult {
  const safeOps = ops.length > 0 ? ops : (["+"] as ChainOperator[]);
  const chains: MathChain[] = Array.from({ length: Math.max(1, count) }, () => {
    const start = randInt(2, LIMITS[difficulty].start);
    let current = start;
    const steps = Array.from({ length: Math.max(2, length) }, () => {
      const step = nextStep(current, safeOps, difficulty);
      current = step.result;
      return step;
    });
    return { start, steps };
  });
  return { chains };
}
