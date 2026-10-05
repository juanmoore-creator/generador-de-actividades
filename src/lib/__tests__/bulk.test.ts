import { describe, expect, it } from "vitest";
import { parseBulkText } from "../activities/bulk";

describe("pegar lista", () => {
  it("entiende los formatos habituales", () => {
    expect(
      parseBulkText("sol: estrella\nluna - satélite\nmarte\tplaneta rojo\ntierra = nuestro planeta\njupiter")
    ).toEqual([
      { word: "SOL", clue: "estrella" },
      { word: "LUNA", clue: "satélite" },
      { word: "MARTE", clue: "planeta rojo" },
      { word: "TIERRA", clue: "nuestro planeta" },
      { word: "JUPITER", clue: "" },
    ]);
  });

  it("separa por comas", () => {
    expect(parseBulkText("perro, gato ,  ratón").map((i) => i.word)).toEqual(["PERRO", "GATO", "RATÓN"]);
  });

  it("no corta palabras compuestas con guion sin espacios", () => {
    expect(parseBulkText("medio-ambiente: entorno")[0]).toEqual({ word: "MEDIO-AMBIENTE", clue: "entorno" });
  });

  it("entiende CSV estructurado con cabecera", () => {
    const csv = `# tema: Biología\npalabra,pista\nCELULA,Unidad viva\nTEJIDO,Conjunto de células`;
    expect(parseBulkText(csv)).toEqual([
      { word: "CELULA", clue: "Unidad viva" },
      { word: "TEJIDO", clue: "Conjunto de células" },
    ]);
  });
});
