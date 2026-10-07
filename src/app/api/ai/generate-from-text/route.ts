import { generateActivitiesFromText, GeminiApiError } from "@/lib/ai/gemini";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { enabled: Boolean(process.env.GEMINI_API_KEY) },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
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

  const {
    text,
    pdfBase64,
    level = "primaria",
    language = "español",
  } = body as Record<string, unknown>;

  const hasValidText = typeof text === "string" && text.trim().length >= 30;
  const hasValidPdf = typeof pdfBase64 === "string" && pdfBase64.trim().length > 50;

  if (!hasValidText && !hasValidPdf) {
    return Response.json(
      { error: "Debes ingresar al menos 30 caracteres de texto o adjuntar un archivo PDF." },
      { status: 400 }
    );
  }

  if (typeof text === "string" && text.trim().length > 30000) {
    return Response.json(
      { error: "El texto no puede superar los 30.000 caracteres." },
      { status: 400 }
    );
  }

  if (typeof pdfBase64 === "string" && pdfBase64.length > 6 * 1024 * 1024) {
    return Response.json(
      { error: "El archivo PDF supera el tamaño máximo permitido (4 MB)." },
      { status: 400 }
    );
  }

  const validLevel = typeof level === "string" && level.trim() ? level.trim() : "primaria";
  const validLanguage = typeof language === "string" && language.trim() ? language.trim() : "español";

  try {
    const result = await generateActivitiesFromText({
      text: typeof text === "string" ? text.trim() : undefined,
      pdfBase64: typeof pdfBase64 === "string" ? pdfBase64 : undefined,
      level: validLevel,
      language: validLanguage,
    });

    return Response.json(result);
  } catch (error) {
    console.error("Error in generate-from-text route:", error);

    if (error instanceof GeminiApiError) {
      if (error.status === 429) {
        return Response.json(
          { error: `Límite de cuota alcanzado en Gemini: ${error.message}` },
          { status: 429 }
        );
      }
      if (error.status === 400 || error.status === 401 || error.status === 403) {
        return Response.json(
          { error: `Error de autenticación o solicitud en Gemini: ${error.message}` },
          { status: 401 }
        );
      }
      return Response.json(
        { error: `Error de Gemini (${error.status}): ${error.message}` },
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
        { error: "Límite de solicitudes alcanzado en Gemini. Espera un minuto e intenta de nuevo." },
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
