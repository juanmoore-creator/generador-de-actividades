import { describe, expect, it } from "vitest";
import { withSeed } from "../random";
import { generateSudoku, countSudokuSolutions } from "../generators/sudoku";
import { generateMathPyramids, isPyramidSolvable } from "../generators/mathPyramid";
import { generateCrossMath, isCrossMathSolvable } from "../generators/crossMath";
import { generateMaze } from "../generators/maze";
import { generateWordSearch } from "../generators/wordSearch";
import { generateCrossword } from "../generators/crossword";
import { generateBingo, bingoCellsNeeded } from "../generators/bingo";
import { generateMathChains } from "../generators/mathChain";
import { generateCryptogram } from "../generators/cryptogram";
import { generateCoordinatePixelArt, PIXEL_TEMPLATES } from "../generators/coordinatePixelArt";
import { generateClozeTest } from "../generators/clozeTest";
import type { ChainOperator } from "../types/activities";

const SEEDS = [1, 42, 1234, 99999, 31337];

describe("sudoku", () => {
  for (const size of [4, 6, 9] as const) {
    for (const difficulty of ["easy", "medium", "hard"] as const) {
      it(`${size}x${size} ${difficulty} tiene solución única y consistente`, () => {
        for (const seed of SEEDS.slice(0, size === 9 ? 2 : 5)) {
          const s = withSeed(seed, () => generateSudoku(size, difficulty));
          const puzzle = s.initialGrid.map((row) => row.map((v) => v ?? 0));
          expect(countSudokuSolutions(puzzle, s.subgridWidth, s.subgridHeight, 2)).toBe(1);
          // las pistas coinciden con la solución
          s.initialGrid.forEach((row, r) =>
            row.forEach((v, c) => {
              if (v !== null) expect(v).toBe(s.solutionGrid[r][c]);
            })
          );
          // cada fila es una permutación
          for (const row of s.solutionGrid) expect(new Set(row).size).toBe(size);
        }
      });
    }
  }

  it("figuras sólo en 4x4 y 6x6", () => {
    expect(generateSudoku(9, "easy", "shapes").symbols).toBe("numbers");
    expect(generateSudoku(4, "easy", "shapes").symbols).toBe("shapes");
  });
});

describe("pirámides", () => {
  it("son resolubles y cada ladrillo es la suma de los de abajo", () => {
    for (const seed of SEEDS) {
      for (const levels of [3, 4, 5]) {
        const { pyramids } = withSeed(seed, () => generateMathPyramids(2, levels, "hard"));
        for (const p of pyramids) {
          const revealed = p.grid.map((row) => row.map((c) => c.revealed));
          expect(isPyramidSolvable(p.solutionGrid, revealed)).toBe(true);
          for (let r = 0; r < levels - 1; r++) {
            for (let c = 0; c <= r; c++) {
              expect(p.solutionGrid[r][c]).toBe(p.solutionGrid[r + 1][c] + p.solutionGrid[r + 1][c + 1]);
            }
          }
          expect(revealed.flat().some((v) => !v)).toBe(true);
        }
      }
    }
  });
});

describe("crucigrama numérico", () => {
  it("las ecuaciones se cumplen y los huecos son deducibles", () => {
    for (const seed of SEEDS) {
      for (const difficulty of ["easy", "medium", "hard"] as const) {
        const res = withSeed(seed, () => generateCrossMath(difficulty));
        const n = (r: number, c: number) => {
          const cell = res.grid[r][c];
          if (cell.type !== "number") throw new Error("no es número");
          return cell.value;
        };
        const op = res.grid[0][1].type === "operator" ? res.grid[0][1].value : "+";
        const f = (a: number, b: number) => (op === "-" ? a - b : a + b);
        for (const r of [0, 2, 4]) expect(f(n(r, 0), n(r, 2))).toBe(n(r, 4));
        for (const c of [0, 2, 4]) expect(n(0, c) + n(2, c)).toBe(n(4, c));
        const hidden = new Set<number>();
        res.grid.forEach((row, r) =>
          row.forEach((cell, c) => {
            if (cell.type === "number" && cell.isBlank) hidden.add((r / 2) * 3 + c / 2);
          })
        );
        expect(hidden.size).toBeGreaterThan(0);
        expect(isCrossMathSolvable(hidden)).toBe(true);
        res.grid.flat().forEach((cell) => {
          if (cell.type === "number") expect(cell.value).toBeGreaterThan(0);
        });
      }
    }
  });
});

describe("laberinto", () => {
  it("tiene un camino de la entrada a la salida", () => {
    for (const seed of SEEDS) {
      const m = withSeed(seed, () => generateMaze(11, 11));
      expect(m.solutionPath[0]).toEqual([0, 0]);
      expect(m.solutionPath[m.solutionPath.length - 1]).toEqual([10, 10]);
    }
  });
});

describe("sopa de letras", () => {
  const words = ["ELEFANTE", "JIRAFA", "DELFIN", "LEON", "AGUILA", "PINGÜINO", "RIÑÓN"];

  it("ubica todas las palabras en las celdas indicadas", () => {
    for (const seed of SEEDS) {
      const res = withSeed(seed, () => generateWordSearch(words, "hard"));
      expect(res.unplacedWords).toEqual([]);
      for (const p of res.placedWords) {
        for (let i = 0; i < p.word.length; i++) {
          expect(res.grid[p.y + p.direction[0] * i][p.x + p.direction[1] * i]).toBe(p.word[i]);
        }
      }
      expect(res.placedWords.map((p) => p.word)).toContain("RIÑON");
    }
  });

  it("reporta palabras que no entran en una cuadrícula chica", () => {
    const res = generateWordSearch(["ABCDEFGHIJKLMNOPQRS", "ELEFANTE"], "easy", 10);
    expect(res.unplacedWords).toContain("ABCDEFGHIJKLMNOPQRS");
  });

  it("es determinista con la misma semilla", () => {
    const a = withSeed(7, () => generateWordSearch(words, "medium"));
    const b = withSeed(7, () => generateWordSearch(words, "medium"));
    expect(a.grid).toEqual(b.grid);
  });
});

describe("crucigrama", () => {
  it("las letras de cada palabra coinciden con la cuadrícula", () => {
    for (const seed of SEEDS) {
      const res = withSeed(seed, () =>
        generateCrossword(["SOL", "TIERRA", "MARTE", "LUNA", "SATURNO", "COMETA"].map((word) => ({ word, clue: "" })))
      );
      for (const w of res.words) {
        for (let i = 0; i < w.word.length; i++) {
          const cell = w.direction === "H" ? res.grid[w.y][w.x + i] : res.grid[w.y + i][w.x];
          expect(cell.char).toBe(w.word[i]);
        }
      }
    }
  });

  it("informa palabras que no se pueden cruzar", () => {
    const res = generateCrossword([
      { word: "AAAA", clue: "" },
      { word: "XYZ", clue: "" },
    ]);
    expect(res.disconnectedWords).toEqual(["XYZ"]);
  });
});

describe("bingo", () => {
  it("cartones sin palabras repetidas y casillero libre", () => {
    const items = Array.from({ length: 30 }, (_, i) => ({ word: `PALABRA${i}`, clue: "" }));
    const res = withSeed(3, () => generateBingo(items, 5, true));
    const cells = res.card.flat();
    expect(cells[12]).toBeNull();
    const words = cells.filter(Boolean);
    expect(words.length).toBe(bingoCellsNeeded(5, true));
    expect(new Set(words).size).toBe(words.length);
  });
});

describe("cadenas de operaciones", () => {
  it("todos los pasos dan enteros positivos y encadenan", () => {
    const ops: ChainOperator[] = ["+", "-", "×", "÷"];
    for (const seed of SEEDS) {
      for (const difficulty of ["easy", "medium", "hard"] as const) {
        const { chains } = withSeed(seed, () => generateMathChains(6, 8, ops, difficulty));
        for (const chain of chains) {
          let current = chain.start;
          for (const step of chain.steps) {
            const expected =
              step.op === "+"
                ? current + step.operand
                : step.op === "-"
                  ? current - step.operand
                  : step.op === "×"
                    ? current * step.operand
                    : current / step.operand;
            expect(step.result).toBe(expected);
            expect(Number.isInteger(step.result)).toBe(true);
            expect(step.result).toBeGreaterThan(0);
            current = step.result;
          }
        }
      }
    }
  });
});

describe("criptograma", () => {
  it("conserva la Ñ y asigna códigos distintos", () => {
    const res = generateCryptogram("El niño y la niña", "", "hard");
    expect(res.cipherKey.map((k) => k.letter)).toContain("Ñ");
    const codes = res.cipherKey.map((k) => k.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});

describe("texto con huecos", () => {
  it("usa las palabras entre corchetes", () => {
    const res = generateClozeTest("El [sol] sale por el [este].");
    expect(res.solutions.map((s) => s.word)).toEqual(["sol", "este"]);
    expect([...res.wordBank].sort()).toEqual(["este", "sol"]);
  });
});

describe("pixel art", () => {
  it("todas las plantillas tienen filas parejas y colores definidos", () => {
    for (const t of Object.values(PIXEL_TEMPLATES)) {
      const widths = new Set(t.grid.map((r) => r.length));
      expect(widths.size).toBe(1);
      for (const ch of t.grid.join("").replace(/\./g, "")) {
        expect(t.colorMap[ch]).toBeDefined();
      }
      const res = generateCoordinatePixelArt(t.id);
      expect(res.rows).toBe(t.grid.length);
    }
  });
});
