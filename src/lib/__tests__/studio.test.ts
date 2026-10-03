import { describe, expect, it } from "vitest";
import { initialStudioState, studioReducer } from "../studio/state";
import { createSnapshot } from "../activities/snapshot";

describe("estado del estudio", () => {
  it("regenerar guarda la semilla anterior y se puede volver", () => {
    let s = initialStudioState(createSnapshot("sudoku", { seed: 1 }));
    s = studioReducer(s, { type: "regenerate", seed: 2 });
    s = studioReducer(s, { type: "regenerate", seed: 3 });
    expect(s.snapshot.seed).toBe(3);
    expect(s.previousSeeds).toEqual([2, 1]);
    s = studioReducer(s, { type: "restoreSeed", seed: 2 });
    expect(s.snapshot.seed).toBe(2);
    expect(s.previousSeeds).toEqual([3, 1]);
  });

  it("limita el historial de variantes", () => {
    let s = initialStudioState(createSnapshot("maze", { seed: 0 }));
    for (let i = 1; i <= 10; i++) s = studioReducer(s, { type: "regenerate", seed: i });
    expect(s.previousSeeds.length).toBe(4);
  });

  it("marca cambios y los limpia al guardar", () => {
    let s = initialStudioState();
    s = studioReducer(s, { type: "patch", patch: { title: "Nuevo" } });
    expect(s.dirty).toBe(true);
    s = studioReducer(s, { type: "markSaved", savedId: "abc" });
    expect(s.dirty).toBe(false);
    expect(s.savedId).toBe("abc");
  });
});
