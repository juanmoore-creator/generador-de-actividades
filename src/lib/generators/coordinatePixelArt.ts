import { PixelArtResult } from "../types/activities";

export interface PixelArtTemplate {
  id: string;
  name: string;
  emoji: string;
  colorMap: Record<string, string>;
  colorNames: Record<string, string>;
  /** Una cadena por fila; "." = casillero sin pintar. Todas las filas tienen el mismo largo. */
  grid: string[];
}

export const COLUMN_LETTERS = "ABCDEFGHIJKLMNOP";

export const PIXEL_TEMPLATES: Record<string, PixelArtTemplate> = {
  corazon: {
    id: "corazon",
    name: "Corazón",
    emoji: "❤️",
    colorMap: { R: "#ef4444", P: "#f9a8d4" },
    colorNames: { R: "Rojo", P: "Rosa" },
    grid: [
      "..........",
      ".RR....RR.",
      "RPRR..RRRR",
      "RPRRRRRRRR",
      "RRRRRRRRRR",
      ".RRRRRRRR.",
      "..RRRRRR..",
      "...RRRR...",
      "....RR....",
      "..........",
    ],
  },
  estrella: {
    id: "estrella",
    name: "Estrella",
    emoji: "⭐",
    colorMap: { Y: "#facc15", O: "#f97316" },
    colorNames: { Y: "Amarillo", O: "Naranja" },
    grid: [
      "....YY....",
      "....YY....",
      "...YOOY...",
      "YYYYOOYYYY",
      ".YYYYYYYY.",
      "..YYYYYY..",
      "..YYYYYY..",
      ".YYY..YYY.",
      ".YY....YY.",
      "Y........Y",
    ],
  },
  arbol: {
    id: "arbol",
    name: "Árbol",
    emoji: "🌳",
    colorMap: { G: "#22c55e", R: "#dc2626", M: "#92400e" },
    colorNames: { G: "Verde", R: "Rojo", M: "Marrón" },
    grid: [
      "...GGGG...",
      "..GGRGGG..",
      ".GGGGGGRG.",
      ".GRGGGGGG.",
      ".GGGGRGGG.",
      "..GGGGGG..",
      "...GGGG...",
      "....MM....",
      "....MM....",
      "....MM....",
      "...MMMM...",
      "GGGGGGGGGG",
    ],
  },
  casa: {
    id: "casa",
    name: "Casa",
    emoji: "🏠",
    colorMap: { R: "#dc2626", Y: "#fde047", B: "#38bdf8", M: "#92400e" },
    colorNames: { R: "Rojo", Y: "Amarillo", B: "Celeste", M: "Marrón" },
    grid: [
      "....RR....",
      "...RRRR...",
      "..RRRRRR..",
      ".RRRRRRRR.",
      "RRRRRRRRRR",
      ".YYYYYYYY.",
      ".YBBYYBBY.",
      ".YBBYYBBY.",
      ".YYYMMYYY.",
      ".YYYMMYYY.",
    ],
  },
  pez: {
    id: "pez",
    name: "Pez",
    emoji: "🐟",
    colorMap: { O: "#fb923c", B: "#2563eb", K: "#111827" },
    colorNames: { O: "Naranja", B: "Azul", K: "Negro" },
    grid: [
      "............",
      "....OOOO....",
      "..OOOOOOO..B",
      ".OKOOOOOOOBB",
      ".OOOOOOOOOBB",
      "..OOOOOOO..B",
      "....OOOO....",
      "............",
    ],
  },
  gato: {
    id: "gato",
    name: "Gato",
    emoji: "🐱",
    colorMap: { G: "#9ca3af", K: "#111827", P: "#f472b6" },
    colorNames: { G: "Gris", K: "Negro", P: "Rosa" },
    grid: [
      ".G......G.",
      ".GG....GG.",
      ".GGGGGGGG.",
      ".GKGGGGKG.",
      ".GGGGGGGG.",
      ".GGGPPGGG.",
      "..GGGGGG..",
      "..GGGGGG..",
      ".GGGGGGGG.",
      ".GG.GG.GG.",
    ],
  },
};

export function generateCoordinatePixelArt(templateKey = "corazon"): PixelArtResult {
  const template = PIXEL_TEMPLATES[templateKey] || PIXEL_TEMPLATES.corazon;
  const rows = template.grid.length;
  const cols = Math.max(...template.grid.map((r) => r.length));

  const colorCoords: Record<string, string[]> = {};
  const grid: (string | null)[][] = template.grid.map((rowStr, r) =>
    Array.from({ length: cols }, (_, c) => {
      const char = rowStr[c];
      if (!char || char === ".") return null;
      (colorCoords[char] ??= []).push(`${COLUMN_LETTERS[c]}${r + 1}`);
      return char;
    })
  );

  const instructions = Object.entries(colorCoords).map(([code, coordinates]) => ({
    colorCode: code,
    colorName: template.colorNames[code] || code,
    hex: template.colorMap[code] || "#000000",
    coordinates,
  }));

  return {
    rows,
    cols,
    colorMap: template.colorMap,
    colorNames: template.colorNames,
    instructions,
    grid,
  };
}
