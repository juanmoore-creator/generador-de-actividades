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

  describe("cuadernillo / packs en el estudio", () => {
    const packMock = {
      title: "Los Dinosaurios",
      currentIndex: 0,
      activities: [
        {
          type: "wordsearch" as const,
          snapshot: createSnapshot("wordsearch", { title: "Sopa de letras: Dinosaurios" }),
          savedId: null,
        },
        {
          type: "crossword" as const,
          snapshot: createSnapshot("crossword", { title: "Crucigrama: Dinosaurios" }),
          savedId: "crossword-123",
        },
      ],
    };

    it("loadPack carga el pack y la actividad inicial", () => {
      let s = initialStudioState();
      s = studioReducer(s, { type: "loadPack", pack: packMock });

      expect(s.pack).not.toBeNull();
      expect(s.pack?.title).toBe("Los Dinosaurios");
      expect(s.pack?.currentIndex).toBe(0);
      expect(s.snapshot.type).toBe("wordsearch");
      expect(s.snapshot.title).toBe("Sopa de letras: Dinosaurios");
      expect(s.savedId).toBeNull();
      expect(s.dirty).toBe(false);
    });

    it("sincroniza modificaciones al snapshot en la actividad actual del pack", () => {
      let s = initialStudioState();
      s = studioReducer(s, { type: "loadPack", pack: packMock });
      s = studioReducer(s, { type: "patch", patch: { title: "Sopa Modificada" } });

      expect(s.snapshot.title).toBe("Sopa Modificada");
      expect(s.pack?.activities[0].snapshot.title).toBe("Sopa Modificada");
      expect(s.dirty).toBe(true);

      s = studioReducer(s, { type: "patchSheet", patch: { instructions: "Nuevas instrucciones" } });
      expect(s.pack?.activities[0].snapshot.sheet.instructions).toBe("Nuevas instrucciones");
    });

    it("switchPackActivity cambia de actividad y conserva los cambios de la anterior al volver", () => {
      let s = initialStudioState();
      s = studioReducer(s, { type: "loadPack", pack: packMock });

      // Modificamos la primera actividad
      s = studioReducer(s, { type: "patch", patch: { title: "Sopa Editada" } });

      // Cambiamos a la segunda actividad (crucigrama)
      s = studioReducer(s, { type: "switchPackActivity", index: 1 });
      expect(s.pack?.currentIndex).toBe(1);
      expect(s.snapshot.type).toBe("crossword");
      expect(s.snapshot.title).toBe("Crucigrama: Dinosaurios");
      expect(s.savedId).toBe("crossword-123");
      expect(s.dirty).toBe(false);

      // Volvemos a la primera actividad
      s = studioReducer(s, { type: "switchPackActivity", index: 0 });
      expect(s.pack?.currentIndex).toBe(0);
      expect(s.snapshot.type).toBe("wordsearch");
      expect(s.snapshot.title).toBe("Sopa Editada");
      expect(s.dirty).toBe(false);
    });

    it("markSaved actualiza savedId en el pack", () => {
      let s = initialStudioState();
      s = studioReducer(s, { type: "loadPack", pack: packMock });
      s = studioReducer(s, { type: "markSaved", savedId: "saved-ws-999" });

      expect(s.savedId).toBe("saved-ws-999");
      expect(s.pack?.activities[0].savedId).toBe("saved-ws-999");
    });

    it("closePack elimina el contexto del pack pero conserva el snapshot actual", () => {
      let s = initialStudioState();
      s = studioReducer(s, { type: "loadPack", pack: packMock });
      expect(s.pack).not.toBeNull();

      s = studioReducer(s, { type: "closePack" });
      expect(s.pack).toBeNull();
      expect(s.snapshot.type).toBe("wordsearch");
    });

    it("load elimina el contexto del pack si se carga una ficha individual", () => {
      let s = initialStudioState();
      s = studioReducer(s, { type: "loadPack", pack: packMock });
      expect(s.pack).not.toBeNull();

      s = studioReducer(s, { type: "load", snapshot: createSnapshot("maze") });
      expect(s.pack).toBeNull();
      expect(s.snapshot.type).toBe("maze");
    });
  });
});
