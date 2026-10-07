import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/ai/generate-from-text/route";
import * as geminiModule from "@/lib/ai/gemini";
import { GeminiApiError } from "@/lib/ai/gemini";

vi.mock("@/lib/ai/gemini", async (importOriginal) => {
  const actual = await importOriginal<typeof geminiModule>();
  return {
    ...actual,
    generateActivitiesFromText: vi.fn(),
  };
});

describe("generate-from-text API route", () => {
  const originalEnv = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GEMINI_API_KEY = "test-api-key";
  });

  afterEach(() => {
    process.env.GEMINI_API_KEY = originalEnv;
  });

  describe("GET", () => {
    it("returns enabled: true when GEMINI_API_KEY is present", async () => {
      process.env.GEMINI_API_KEY = "dummy-key";
      const res = GET();
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data).toEqual({ enabled: true });
    });

    it("returns enabled: false when GEMINI_API_KEY is missing", async () => {
      delete process.env.GEMINI_API_KEY;
      const res = GET();
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data).toEqual({ enabled: false });
    });
  });

  describe("POST", () => {
    it("returns 503 if GEMINI_API_KEY is missing", async () => {
      delete process.env.GEMINI_API_KEY;
      const req = new Request("http://localhost/api/ai/generate-from-text", {
        method: "POST",
        body: JSON.stringify({ text: "Texto con mas de 30 caracteres para probar validacion." }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(503);
      expect(data.error).toContain("La API de Gemini no está configurada");
    });

    it("returns 400 if neither valid text (>= 30 chars) nor valid pdfBase64 (> 50 chars) is provided", async () => {
      const req = new Request("http://localhost/api/ai/generate-from-text", {
        method: "POST",
        body: JSON.stringify({ text: "Texto corto" }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain("Debes ingresar al menos 30 caracteres de texto o adjuntar un archivo PDF.");
    });

    it("returns 400 if pdfBase64 exceeds 6MB", async () => {
      const largePdf = "A".repeat(6 * 1024 * 1024 + 10);
      const req = new Request("http://localhost/api/ai/generate-from-text", {
        method: "POST",
        body: JSON.stringify({ pdfBase64: largePdf }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain("El archivo PDF supera el tamaño máximo permitido (4 MB).");
    });

    it("returns 400 if request body is invalid JSON", async () => {
      const req = new Request("http://localhost/api/ai/generate-from-text", {
        method: "POST",
        body: "{ invalid json",
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain("Cuerpo de la solicitud inválido");
    });

    it("returns 200 with generated activities when successful", async () => {
      const mockResult = {
        themeTitle: "El Ecosistema",
        summary: "Interacción entre seres vivos y su entorno.",
        vocabulary: [{ word: "HABITAT", clue: "Lugar donde vive una especie" }],
        clozeParagraph: "Los seres vivos interactúan en su [ecosistema].",
        cryptogram: {
          phrase: "CUIDAR EL MEDIO AMBIENTE ES NUESTRA RESPONSABILIDAD",
          hint: "Ecología",
        },
      };

      vi.mocked(geminiModule.generateActivitiesFromText).mockResolvedValue(mockResult);

      const req = new Request("http://localhost/api/ai/generate-from-text", {
        method: "POST",
        body: JSON.stringify({
          text: "Un ecosistema es un sistema biológico constituido por una comunidad de organismos vivos y el medio físico donde se relacionan.",
          level: "primaria",
        }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual(mockResult);
      expect(geminiModule.generateActivitiesFromText).toHaveBeenCalledWith(
        expect.objectContaining({
          text: "Un ecosistema es un sistema biológico constituido por una comunidad de organismos vivos y el medio físico donde se relacionan.",
          pdfBase64: undefined,
          level: "primaria",
        })
      );
    });

    it("returns 200 with generated activities when pdfBase64 is provided", async () => {
      const mockResult = {
        themeTitle: "Biología Celular",
        summary: "Estructura celular.",
        vocabulary: [{ word: "MEMBRANA", clue: "Envoltura celular" }],
        clozeParagraph: "La [célula] es la unidad básica.",
        cryptogram: {
          phrase: "LAS CELULAS SON LA UNIDAD BASICA DE LA VIDA",
          hint: "Biología",
        },
      };

      vi.mocked(geminiModule.generateActivitiesFromText).mockResolvedValue(mockResult);

      const fakePdf = "JVBERi0xLjQKJ" + "A".repeat(100);
      const req = new Request("http://localhost/api/ai/generate-from-text", {
        method: "POST",
        body: JSON.stringify({
          pdfBase64: fakePdf,
          level: "secundaria",
          text: "Notas adicionales",
        }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual(mockResult);
      expect(geminiModule.generateActivitiesFromText).toHaveBeenCalledWith(
        expect.objectContaining({
          pdfBase64: fakePdf,
          level: "secundaria",
          text: "Notas adicionales",
        })
      );
    });

    it("handles rate limit GeminiApiError (429)", async () => {
      const rateLimitError = new GeminiApiError("RESOURCE_EXHAUSTED", 429);

      vi.mocked(geminiModule.generateActivitiesFromText).mockRejectedValue(rateLimitError);

      const req = new Request("http://localhost/api/ai/generate-from-text", {
        method: "POST",
        body: JSON.stringify({
          text: "Un ecosistema es un sistema biológico constituido por una comunidad de organismos vivos y el medio físico donde se relacionan.",
        }),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(429);
      expect(data.error).toContain("Límite de cuota alcanzado");
    });
  });
});
