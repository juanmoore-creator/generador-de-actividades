import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { WordsRequestSchema, WordsResponseSchema } from "@/lib/ai/schema";

/**
 * Genera palabras y pistas para una actividad a partir de un tema.
 * Requiere ANTHROPIC_API_KEY en el servidor; si no está, la función se
 * desactiva y el editor oculta el botón (GET devuelve { enabled: false }).
 */

const MODEL = "claude-opus-5-5";

const SYSTEM = `Eres un asistente para docentes que preparan fichas imprimibles.
Generas listas de palabras con pistas breves, adecuadas a la edad indicada.
Reglas:
- Cada "word" es UNA sola palabra (sin espacios, sin números ni signos), en mayúsculas, en el idioma pedido.
- Palabras de 3 a 12 letras, sin repetir, variadas en largo.
- Cada "clue" es una definición breve (máximo 12 palabras) que no contiene la palabra ni su raíz.
- Si no se piden pistas, deja "clue" como cadena vacía.
- Contenido apropiado para el aula y correcto científicamente.`;

export function GET() {
  return Response.json({ enabled: Boolean(process.env.ANTHROPIC_API_KEY) });
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "La generación con IA no está configurada." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Pedido inválido." }, { status: 400 });
  }
  const parsed = WordsRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Revisa el tema (entre 2 y 200 caracteres) y la cantidad (3 a 30)." }, { status: 400 });
  }
  const { topic, level, language, count, withClues } = parsed.data;

  const client = new Anthropic();
  try {
    const response = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM,
      output_config: { effort: "low", format: betaZodOutputFormat(WordsResponseSchema) },
      messages: [
        {
          role: "user",
          content: `Tema: ${topic}\nNivel educativo: ${level}\nIdioma: ${language}\nCantidad de palabras: ${count}\nIncluir pistas: ${withClues ? "sí" : "no"}`,
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      return Response.json({ error: "No se pudo generar contenido para ese tema. Prueba con otro." }, { status: 422 });
    }
    const items = response.parsed_output?.items;
    if (!items || items.length === 0) {
      return Response.json({ error: "La IA no devolvió palabras. Intenta de nuevo." }, { status: 502 });
    }

    const seen = new Set<string>();
    const clean = items
      .map((i) => ({ word: i.word.trim().toUpperCase().replace(/\s+/g, ""), clue: withClues ? i.clue.trim() : "" }))
      .filter((i) => i.word.length >= 2 && !seen.has(i.word) && seen.add(i.word))
      .slice(0, count);

    return Response.json({ items: clean });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json({ error: "Hay muchos pedidos en este momento. Espera un minuto." }, { status: 429 });
    }
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("ANTHROPIC_API_KEY inválida");
      return Response.json({ error: "La generación con IA no está disponible." }, { status: 503 });
    }
    if (error instanceof Anthropic.APIError) {
      console.error("Error de la API de Claude", error.status, error.message);
      return Response.json({ error: "El servicio de IA falló. Intenta de nuevo." }, { status: 502 });
    }
    console.error(error);
    return Response.json({ error: "No se pudo conectar con el servicio de IA." }, { status: 502 });
  }
}
