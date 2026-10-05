import { describe, expect, it } from "vitest";
import { parseThemeCsv } from "../csv/themePack";

describe("parseThemeCsv", () => {
  it("parses standard CSV with header and metadata comment", () => {
    const csv = `# tema: El Sistema Solar
palabra,pista
SOL,Estrella en el centro de nuestro sistema
TIERRA,Tercer planeta desde el Sol y donde vivimos
MARTE,El planeta rojo
JUPITER,El planeta mas grande
`;

    const result = parseThemeCsv(csv);
    expect(result.title).toBe("El Sistema Solar");
    expect(result.items).toHaveLength(4);
    expect(result.items[0]).toEqual({
      word: "SOL",
      clue: "Estrella en el centro de nuestro sistema",
    });
    expect(result.items[1].word).toBe("TIERRA");
  });

  it("handles semicolon-separated CSV and accents normalization", () => {
    const csv = `# Título: Los Animales
palabra;definición
León;El rey de la selva
Águila;Ave rapaz con gran vista
Delfín;Mamífero acuático muy inteligente
Tiburón;Gran depredador del océano
`;

    const result = parseThemeCsv(csv);
    expect(result.title).toBe("Los Animales");
    expect(result.items).toHaveLength(4);
    expect(result.items[0].word).toBe("LEON");
    expect(result.items[1].word).toBe("AGUILA");
    expect(result.items[2].word).toBe("DELFIN");
    expect(result.items[3].word).toBe("TIBURON");
  });

  it("handles quoted fields containing commas and quotes", () => {
    const csv = `palabra,pista
FOTOSINTESIS,"Proceso biológico en plantas, algas y bacterias"
CELULA,"Unidad básica, estructural y funcional de los seres vivos"
ADN,"Portador del código genético, denominado ""ácido desoxirribonucleico"""
`;

    const result = parseThemeCsv(csv);
    expect(result.items).toHaveLength(3);
    expect(result.items[0].clue).toBe("Proceso biológico en plantas, algas y bacterias");
    expect(result.items[2].clue).toBe('Portador del código genético, denominado "ácido desoxirribonucleico"');
  });

  it("deduplicates identical words and trims whitespace", () => {
    const csv = `
SOL, Estrella principal
LUNA, Satélite
SOL, Segunda definición
`;

    const result = parseThemeCsv(csv);
    expect(result.items).toHaveLength(2);
    expect(result.items[0].word).toBe("SOL");
    expect(result.items[1].word).toBe("LUNA");
    expect(result.warnings.some((w) => w.includes("duplicada"))).toBe(true);
  });

  it("returns warning if too few items", () => {
    const csv = `SOL,Estrella\nLUNA,Satelite`;
    const result = parseThemeCsv(csv);
    expect(result.items).toHaveLength(2);
    expect(result.warnings.some((w) => w.includes("Se recomiendan al menos 10"))).toBe(true);
  });
});
