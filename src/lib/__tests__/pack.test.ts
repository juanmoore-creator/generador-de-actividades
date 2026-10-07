import { describe, expect, it } from "vitest";
import { createThemePack } from "../activities/pack";
import { generateActivity } from "../activities/engine";

describe("createThemePack", () => {
  const sampleItems = [
    { word: "SOL", clue: "Estrella en el centro de nuestro sistema" },
    { word: "TIERRA", clue: "Nuestro planeta habitado" },
    { word: "MARTE", clue: "El planeta rojo" },
    { word: "JUPITER", clue: "El planeta más grande" },
    { word: "SATURNO", clue: "Planeta con anillos vistosos" },
    { word: "LUNA", clue: "Satélite natural de la Tierra" },
  ];

  it("generates snapshots for wordsearch, crossword, scramble and matching", () => {
    const pack = createThemePack({
      themeTitle: "El Universo",
      items: sampleItems,
    });

    expect(pack.title).toBe("El Universo");
    expect(pack.activities).toHaveLength(4);

    const types = pack.activities.map((a) => a.type);
    expect(types).toEqual(["wordsearch", "crossword", "scramble", "matching"]);

    // Ensure generateActivity runs successfully for each snapshot in the pack
    for (const item of pack.activities) {
      expect(item.snapshot.title).toContain("El Universo");
      expect(item.snapshot.items.length).toBeGreaterThanOrEqual(sampleItems.length);

      const generated = generateActivity(item.snapshot);
      expect(generated.type).toBe(item.type);
      expect(generated.result).toBeDefined();
    }
  });

  it("normalizes and sanitizes words in pack items", () => {
    const pack = createThemePack({
      themeTitle: "Química",
      items: [
        { word: "Átomo", clue: "Unidad mínima" },
        { word: "Electrón", clue: "Carga negativa" },
      ],
    });

    expect(pack.items[0].word).toBe("ATOMO");
    expect(pack.items[1].word).toBe("ELECTRON");
  });

  it("supports cloze and cryptogram with custom clozeText, cryptoPhrase, and cryptoHint", () => {
    const pack = createThemePack({
      themeTitle: "El Sistema Solar",
      items: sampleItems,
      activityTypes: ["cryptogram", "cloze"],
      clozeText: "El [Sol] es el centro de nuestro sistema. La [Tierra] gira a su alrededor.",
      cryptoPhrase: "EL SOL ES UNA ESTRELLA BRILLANTE",
      cryptoHint: "Pista sobre el centro de nuestro sistema",
    });

    expect(pack.activities).toHaveLength(2);

    const cryptoAct = pack.activities.find((a) => a.type === "cryptogram");
    expect(cryptoAct).toBeDefined();
    expect(cryptoAct?.snapshot.cryptoPhrase).toBe("EL SOL ES UNA ESTRELLA BRILLANTE");
    expect(cryptoAct?.snapshot.cryptoHint).toBe("Pista sobre el centro de nuestro sistema");

    const clozeAct = pack.activities.find((a) => a.type === "cloze");
    expect(clozeAct).toBeDefined();
    expect(clozeAct?.snapshot.clozeText).toBe(
      "El [Sol] es el centro de nuestro sistema. La [Tierra] gira a su alrededor."
    );

    // Verify engines can execute both generated snapshots
    const genCrypto = generateActivity(cryptoAct!.snapshot);
    expect(genCrypto.type).toBe("cryptogram");
    expect(genCrypto.result).toBeDefined();

    const genCloze = generateActivity(clozeAct!.snapshot);
    expect(genCloze.type).toBe("cloze");
    expect(genCloze.result).toBeDefined();
  });
});
