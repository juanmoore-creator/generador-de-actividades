import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  generateActivitiesFromText,
  sanitizeGeneratedActivities,
  activitiesResponseSchema,
  GeminiApiError,
} from "../ai/gemini";

describe("gemini AI generator", () => {
  const originalEnv = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = "test-api-key";
  });

  afterEach(() => {
    process.env.GEMINI_API_KEY = originalEnv;
    vi.restoreAllMocks();
  });

  describe("activitiesResponseSchema", () => {
    it("defines valid schema structure with required fields", () => {
      expect(activitiesResponseSchema.type).toBe("OBJECT");
      expect(activitiesResponseSchema.required).toEqual([
        "themeTitle",
        "summary",
        "vocabulary",
        "clozeParagraph",
        "cryptogram",
      ]);
    });
  });

  describe("sanitizeGeneratedActivities", () => {
    it("sanitizes valid structured output correctly", () => {
      const raw = {
        themeTitle: "  El Sistema Solar  ",
        summary: "Una lección sobre los planetas.",
        vocabulary: [
          { word: "Célula", clue: "Unidad biológica fundamental" },
          { word: "Átomo", clue: "Partícula indivisible elemental" },
          { word: "FOTOSÍNTESIS", clue: "Proceso con luz" },
          { word: "ÁTOMO", clue: "Duplicado que debe filtrarse" },
          { word: "AB", clue: "Demasiado corta" },
          { word: "MUYLARGAESESTAPALABRAPARACABER", clue: "Demasiado larga" },
        ],
        clozeParagraph: "La [fotosíntesis] es vital para la [vida] en la Tierra.",
        cryptogram: {
          phrase: "el sol es la estrella central",
          hint: "Pista sobre el centro",
        },
      };

      const result = sanitizeGeneratedActivities(raw);

      expect(result.themeTitle).toBe("El Sistema Solar");
      expect(result.summary).toBe("Una lección sobre los planetas.");
      expect(result.vocabulary).toHaveLength(3); // CELULA, ATOMO, FOTOSINTESIS
      expect(result.vocabulary[0].word).toBe("CELULA");
      expect(result.vocabulary[1].word).toBe("ATOMO");
      expect(result.vocabulary[2].word).toBe("FOTOSINTESIS");
      expect(result.clozeParagraph).toBe("La [fotosíntesis] es vital para la [vida] en la Tierra.");
      expect(result.cryptogram.phrase).toBe("EL SOL ES LA ESTRELLA CENTRAL");
      expect(result.cryptogram.hint).toBe("Pista sobre el centro");
    });

    it("throws an error when raw payload is not an object", () => {
      expect(() => sanitizeGeneratedActivities(null)).toThrow("Formato de respuesta inválido.");
      expect(() => sanitizeGeneratedActivities("string")).toThrow("Formato de respuesta inválido.");
    });

    it("throws an error when valid vocabulary count is less than 3", () => {
      const raw = {
        themeTitle: "Test",
        summary: "Summary",
        vocabulary: [
          { word: "SOL", clue: "Estrella" },
          { word: "NO", clue: "Muy corta" },
        ],
        clozeParagraph: "Texto",
        cryptogram: { phrase: "Frase", hint: "Pista" },
      };

      expect(() => sanitizeGeneratedActivities(raw)).toThrow(
        "Gemini no generó suficiente vocabulario válido (mínimo 3 palabras)."
      );
    });

    it("creates fallbacks for missing clozeParagraph and cryptogram", () => {
      const raw = {
        themeTitle: "Geometría",
        summary: "Formas",
        vocabulary: [
          { word: "TRIANGULO", clue: "Tres lados" },
          { word: "CUADRADO", clue: "Cuatro lados" },
          { word: "CIRCULO", clue: "Redondo" },
        ],
        clozeParagraph: "",
        cryptogram: null,
      };

      const result = sanitizeGeneratedActivities(raw);

      expect(result.clozeParagraph).toContain("Geometría");
      expect(result.clozeParagraph).toContain("[TRIANGULO]");
      expect(result.cryptogram.phrase).toContain("GEOMETRÍA");
      expect(result.cryptogram.hint).toContain("Geometría");
    });
  });

  describe("generateActivitiesFromText", () => {
    it("validates minimum text length", async () => {
      await expect(
        generateActivitiesFromText({ text: "Texto corto" })
      ).rejects.toThrow("El texto debe tener al menos 30 caracteres.");
    });

    it("throws when GEMINI_API_KEY is not set", async () => {
      delete process.env.GEMINI_API_KEY;

      await expect(
        generateActivitiesFromText({
          text: "Este es un texto suficientemente largo para superar la longitud mínima requerida.",
        })
      ).rejects.toThrow("La API de Gemini no está configurada");
    });

    it("calls Gemini with structured schema and parses response", async () => {
      const mockResultData = {
        themeTitle: "La Célula",
        summary: "Estructura y funcionamiento celular.",
        vocabulary: [
          { word: "NUCLEO", clue: "Centro de control" },
          { word: "MEMBRANA", clue: "Capa protectora externa" },
          { word: "CITOPLASMA", clue: "Medio interno" },
        ],
        clozeParagraph: "El [núcleo] celular contiene el [ADN] del organismo.",
        cryptogram: {
          phrase: "TODOS LOS SERES VIVOS ESTAN COMPUESTOS POR CELULAS",
          hint: "Teoría celular básica",
        },
      };

      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: JSON.stringify(mockResultData) }],
              },
            },
          ],
        }),
      };

      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as unknown as Response);

      const result = await generateActivitiesFromText({
        text: "La célula es la unidad morfológica y funcional de todo ser vivo. De hecho, la célula es el elemento de menor tamaño que puede considerarse vivo.",
        level: "primaria",
        language: "español",
      });

      expect(result.themeTitle).toBe("La Célula");
      expect(result.vocabulary).toHaveLength(3);
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("gemini-2.5-flash:generateContent"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
    });

    it("throws GeminiApiError when API response is not ok", async () => {
      const errorResponse = {
        ok: false,
        status: 400,
        json: async () => ({
          error: { message: "API key not valid." },
        }),
      };

      vi.spyOn(globalThis, "fetch").mockResolvedValue(errorResponse as unknown as Response);

      await expect(
        generateActivitiesFromText({
          text: "Texto lo suficientemente largo para hacer la prueba de fallo de la API.",
        })
      ).rejects.toThrow(GeminiApiError);
    });
  });
});
