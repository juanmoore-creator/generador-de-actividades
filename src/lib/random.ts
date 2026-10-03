/**
 * Aleatoriedad reproducible.
 *
 * Todas las actividades se generan a partir de una semilla numérica guardada en
 * el snapshot. Así la misma ficha produce siempre la misma hoja (vista previa,
 * PDF, ficha guardada o compartida) y "Regenerar" es simplemente cambiar la
 * semilla, lo que permite deshacer y volver a variantes anteriores.
 */

export type Rng = () => number;

/** mulberry32: PRNG pequeño y rápido, suficiente para puzzles. */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Ejecuta `fn` reemplazando temporalmente Math.random por un PRNG con semilla.
 * Los generadores son síncronos, por lo que el reemplazo no se filtra a otro código.
 */
export function withSeed<T>(seed: number, fn: () => T): T {
  const original = Math.random;
  Math.random = createRng(seed);
  try {
    return fn();
  } finally {
    Math.random = original;
  }
}

export function newSeed(): number {
  return Math.floor(Math.random() * 2 ** 31);
}

/** Deriva una semilla distinta y estable para la copia/versión `index`. */
export function deriveSeed(seed: number, index: number): number {
  if (index === 0) return seed;
  return (Math.imul(seed ^ 0x9e3779b9, index + 1) + index * 7919) >>> 0;
}

export function shuffle<T>(arr: readonly T[], rng: Rng = Math.random): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function randInt(min: number, max: number, rng: Rng = Math.random): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}
