import { ApiError } from "@google/genai";
import { generateActivitiesFromText } from "@/lib/ai/gemini";

export const maxDuration = 30;

export function GET() {
  return Response.json({ enabled: Boolean(process.env.GEMINI_API_KEY) });
}

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return Response.json(
      { error: "La API de Gemini no está configurada (GEMINI_API_KEY requerida)." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Cuerpo de la solicitud inválido." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { text, level = "primaria", language = "español" } = body as Record<string, unknown>;

  if (typeof text !== "string" || text.trim().length < 30 || text.trim().length > 30000) {
    return Response.json(
      { error: "El texto debe tener al menos 30 caracteres y un máximo de 30.000." },
      { status: 400 }
    );
  }

  const validLevel = typeof level === "string" && level.trim() ? level.trim() : "primaria";
  const validLanguage = typeof language === "string" && language.trim() ? language.trim() : "español";

  try {
    const result = await generateActivitiesFromText({
      text: text.trim(),
      level: validLevel,
      language: validLanguage,
    });

    return Response.json(result);
  } catch (error) {
    console.error("Error in generate-from-text route:", error);

    if (error instanceof ApiError) {
      if (error.status === 429) {
        return Response.json(
          { error: "Límite de solicitudes alcanzado. Por favor, espera un minuto e intenta de nuevo." },
          { status: 429 }
        );
      }
      if (error.status === 401 || error.status === 403) {
        return Response.json(
          { error: "La clave GEMINI_API_KEY no es válida o carece de permisos." },
          { status: 401 }
        );
      }
      if (error.status === 400) {
        return Response.json(
          { error: "La solicitud a Gemini no fue válida. Por favor, revisa el contenido." },
          { status: 400 }
        );
      }
      return Response.json(
        { error: "El servicio de Gemini no está disponible en este momento." },
        { status: 502 }
      );
    }

    const msg = error instanceof Error ? error.message : "";
    if (
      msg.includes("429") ||
      msg.toLowerCase().includes("quota") ||
      msg.toLowerCase().includes("resource_exhausted")
    ) {
      return Response.json(
        { error: "Límite de solicitudes alcanzado. Por favor, espera un minuto e intenta de nuevo." },
        { status: 429 }
      );
    }
    if (msg.toLowerCase().includes("api key") || msg.toLowerCase().includes("unauthorized")) {
      return Response.json(
        { error: "La clave GEMINI_API_KEY no es válida." },
        { status: 401 }
      );
    }

    return Response.json(
      { error: msg || "Ocurrió un error inesperado al generar las actividades." },
      { status: 500 }
    );
  }
}
