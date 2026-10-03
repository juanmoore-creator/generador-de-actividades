import { describe, expect, it } from "vitest";
import { ACTIVITIES } from "../activities/catalog";
import { createSnapshot, normalizeSnapshot, switchActivityType } from "../activities/snapshot";
import { generateActivity, hasContent, validateActivity } from "../activities/engine";

describe("motor de actividades", () => {
  it("genera todas las actividades con contenido por defecto y sin errores", () => {
    for (const meta of ACTIVITIES) {
      const snap = createSnapshot(meta.id, { seed: 123 });
      const gen = generateActivity(snap);
      expect(gen.type).toBe(meta.id);
      expect(hasContent(gen)).toBe(true);
      const errors = validateActivity(snap, gen).filter((i) => i.level === "error");
      expect(errors, meta.id).toEqual([]);
    }
  });

  it("es determinista y las copias son distintas", () => {
    const snap = createSnapshot("sudoku", { seed: 555 });
    expect(generateActivity(snap)).toEqual(generateActivity(snap));
    expect(generateActivity(snap, 1)).not.toEqual(generateActivity(snap, 0));
  });

  it("no altera Math.random global", () => {
    const before = Math.random;
    generateActivity(createSnapshot("maze"));
    expect(Math.random).toBe(before);
  });

  it("avisa cuando faltan palabras", () => {
    const snap = createSnapshot("crossword", { items: [{ word: "SOL", clue: "" }] });
    const issues = validateActivity(snap, generateActivity(snap));
    expect(issues.some((i) => i.level === "error")).toBe(true);
  });

  it("propone agrandar la sopa cuando no entran palabras", () => {
    const snap = createSnapshot("wordsearch", {
      wordSearchSize: 8,
      items: ["ELEFANTES", "MARIPOSA", "LEON", "JIRAFA"].map((word) => ({ word, clue: "" })),
    });
    const issues = validateActivity(snap, generateActivity(snap));
    const fix = issues.find((i) => i.fix?.kind === "setWordSearchSize");
    expect(fix).toBeDefined();
  });
});

describe("snapshots", () => {
  it("migra borradores v2", () => {
    const v2 = {
      type: "sudoku",
      title: "Mi sudoku",
      difficulty: "hard",
      items: [{ word: "SOL", clue: "Estrella" }],
      sudokuSize: 4,
      sudokuEmojis: true,
      headerOptions: { showName: true, showDate: false, showGrade: true, showScore: true, schoolName: "Escuela 1" },
    };
    const snap = normalizeSnapshot(v2);
    expect(snap.schemaVersion).toBe(3);
    expect(snap.sudokuSymbols).toBe("shapes");
    expect(snap.sheet.header.schoolName).toBe("Escuela 1");
    expect(snap.sheet.header.showDate).toBe(false);
    expect(snap.difficulty).toBe("hard");
  });

  it("tolera basura", () => {
    expect(normalizeSnapshot(null).type).toBe("wordsearch");
    expect(normalizeSnapshot({ type: "otra", sheet: { copies: 99 } }).sheet.copies).toBe(6);
  });

  it("al cambiar de actividad conserva un título propio", () => {
    const snap = createSnapshot("wordsearch", { title: "Animales" });
    expect(switchActivityType(snap, "crossword").title).toBe("Animales");
    const generic = createSnapshot("wordsearch");
    expect(switchActivityType(generic, "crossword").title).toBe("Crucigrama");
  });
});
