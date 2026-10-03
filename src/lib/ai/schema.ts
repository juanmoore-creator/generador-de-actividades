import * as z from "zod/v4";

/** Pedido del cliente para generar palabras con IA. */
export const WordsRequestSchema = z.object({
  topic: z.string().trim().min(2).max(200),
  level: z.string().trim().max(60).default("primaria"),
  language: z.string().trim().max(40).default("español"),
  count: z.number().int().min(3).max(30).default(10),
  /** Las pistas son definiciones (crucigrama, relacionar) o no hacen falta (sopa, bingo). */
  withClues: z.boolean().default(true),
});

export type WordsRequest = z.infer<typeof WordsRequestSchema>;

/** Respuesta estructurada que devuelve el modelo. */
export const WordsResponseSchema = z.object({
  items: z.array(
    z.object({
      word: z.string(),
      clue: z.string(),
    })
  ),
});
