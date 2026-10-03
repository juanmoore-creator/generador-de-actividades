import type { CommunityActivity } from "./types";
import { createSnapshot } from "../activities/snapshot";
import { THEME_PRESETS } from "../activities/presets";

const example = (
  id: string,
  partial: Omit<CommunityActivity, "id" | "authorId" | "isLiked" | "isExample" | "createdAt" | "type" | "difficulty" | "title">
): CommunityActivity => ({
  id,
  title: partial.snapshot.title,
  type: partial.snapshot.type,
  difficulty: partial.snapshot.difficulty,
  authorId: null,
  isLiked: false,
  isExample: true,
  createdAt: "2026-09-01T12:00:00.000Z",
  ...partial,
});

/** Fichas de ejemplo que acompañan a la app (se muestran como "Ejemplos"). */
export const EXAMPLE_COMMUNITY: CommunityActivity[] = [
  example("ex_ingles", {
    subject: "Inglés",
    grade: "3.º y 4.º primaria",
    description: "Sopa de letras con los colores en inglés.",
    tags: ["vocabulario", "colores"],
    author: { name: "Equipo GenAct", school: "Ejemplo" },
    likes: 0,
    downloads: 0,
    snapshot: createSnapshot("wordsearch", {
      seed: 1001,
      title: "Colors in English",
      difficulty: "easy",
      items: THEME_PRESETS.find((p) => p.id === "ingles")!.items,
    }),
  }),
  example("ex_cuerpo", {
    subject: "Ciencias naturales",
    grade: "5.º y 6.º primaria",
    description: "Crucigrama con los órganos principales del cuerpo humano.",
    tags: ["cuerpo humano", "órganos"],
    author: { name: "Equipo GenAct", school: "Ejemplo" },
    likes: 0,
    downloads: 0,
    snapshot: createSnapshot("crossword", {
      seed: 1002,
      title: "El cuerpo humano",
      items: THEME_PRESETS.find((p) => p.id === "cuerpo")!.items,
    }),
  }),
  example("ex_agua", {
    subject: "Ciencias naturales",
    grade: "4.º primaria",
    description: "Relacionar cada etapa del ciclo del agua con su definición.",
    tags: ["ciclo del agua"],
    author: { name: "Equipo GenAct", school: "Ejemplo" },
    likes: 0,
    downloads: 0,
    snapshot: createSnapshot("matching", {
      seed: 1003,
      title: "El ciclo del agua",
      items: THEME_PRESETS.find((p) => p.id === "agua")!.items.slice(0, 7),
    }),
  }),
  example("ex_sudoku", {
    subject: "Matemática",
    grade: "Nivel inicial",
    description: "Sudoku de 4×4 con figuras para los más chicos.",
    tags: ["lógica", "figuras"],
    author: { name: "Equipo GenAct", school: "Ejemplo" },
    likes: 0,
    downloads: 0,
    snapshot: createSnapshot("sudoku", {
      seed: 1004,
      title: "Sudoku de figuras",
      difficulty: "easy",
      sudokuSize: 4,
      sudokuSymbols: "shapes",
    }),
  }),
  example("ex_cadenas", {
    subject: "Matemática",
    grade: "4.º a 6.º primaria",
    description: "Cálculo mental encadenado con las cuatro operaciones.",
    tags: ["cálculo mental"],
    author: { name: "Equipo GenAct", school: "Ejemplo" },
    likes: 0,
    downloads: 0,
    snapshot: createSnapshot("mathchain", {
      seed: 1005,
      title: "Cadenas de cálculo",
      chainOps: ["+", "-", "×", "÷"],
    }),
  }),
  example("ex_pixel", {
    subject: "Plástica",
    grade: "1.º y 2.º primaria",
    description: "Pinta por coordenadas y descubre la casa.",
    tags: ["coordenadas", "motricidad"],
    author: { name: "Equipo GenAct", school: "Ejemplo" },
    likes: 0,
    downloads: 0,
    snapshot: createSnapshot("pixelart", { seed: 1006, title: "La casa secreta", pixelArtKey: "casa" }),
  }),
];
