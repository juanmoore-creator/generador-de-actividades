import { PixelArtResult } from "../types/activities";

export interface PixelArtTemplate {
  id: string;
  name: string;
  rows: number;
  cols: number;
  colorMap: Record<string, string>;
  colorNames: Record<string, string>;
  grid: string[]; // Array of strings, each string length = cols
}

export const PIXEL_TEMPLATES: Record<string, PixelArtTemplate> = {
  corazon: {
    id: "corazon",
    name: "Corazón Brillante",
    rows: 10,
    cols: 10,
    colorMap: {
      R: "#ef4444", // Red
      P: "#f472b6", // Pink
      W: "#ffffff", // White
      Y: "#f59e0b", // Yellow
    },
    colorNames: {
      R: "Rojo",
      P: "Rosa",
      W: "Blanco",
      Y: "Amarillo",
    },
    grid: [
      "..........",
      "..RR..RR..",
      ".RPPRRPPR.",
      ".RPPRRPPR.",
      ".RRRRRRRR.",
      "..RRRRRR..",
      "...RRRR...",
      "....RR....",
      ".....Y....",
      "..........",
    ],
  },
  estrella: {
    id: "estrella",
    name: "Estrella Mágica",
    rows: 10,
    cols: 10,
    colorMap: {
      Y: "#eab308", // Yellow
      O: "#f97316", // Orange
      B: "#3b82f6", // Blue
    },
    colorNames: {
      Y: "Amarillo",
      O: "Naranja",
      B: "Azul Cielo",
    },
    grid: [
      "....YY....",
      "....YY....",
      "..YYYYYY..",
      ".YYYYYYYY.",
      "..YYYYYY..",
      "..YYOOYY..",
      ".YY....YY.",
      "YY......YY",
      "..........",
      "....BB....",
    ],
  },
  arbol: {
    id: "arbol",
    name: "Árbol y Manzanas",
    rows: 10,
    cols: 10,
    colorMap: {
      G: "#22c55e", // Green
      R: "#ef4444", // Red
      M: "#78350f", // Brown
      S: "#38bdf8", // Sky
    },
    colorNames: {
      G: "Verde Hoja",
      R: "Rojo Manzana",
      M: "Marrón Tronco",
      S: "Celeste",
    },
    grid: [
      "...GGGG...",
      "..GGRGG...",
      ".GGGGGRGG.",
      ".GRGGGGGG.",
      "..GGGGGG..",
      "...GGRG...",
      "....MM....",
      "....MM....",
      "....MM....",
      ".GGGGGGGG.",
    ],
  },
};

export function generateCoordinatePixelArt(templateKey = "corazon"): PixelArtResult {
  const template = PIXEL_TEMPLATES[templateKey] || PIXEL_TEMPLATES.corazon;
  const colLetters = "ABCDEFGHIJKLMN";

  const colorCoords: Record<string, string[]> = {};
  const matrix: (string | null)[][] = [];

  for (let r = 0; r < template.rows; r++) {
    const rowStr = template.grid[r] || ".".repeat(template.cols);
    const rowArr: (string | null)[] = [];

    for (let c = 0; c < template.cols; c++) {
      const char = rowStr[c];
      if (char && char !== ".") {
        rowArr.push(char);
        const coord = `${colLetters[c]}${r + 1}`;
        if (!colorCoords[char]) {
          colorCoords[char] = [];
        }
        colorCoords[char].push(coord);
      } else {
        rowArr.push(null);
      }
    }
    matrix.push(rowArr);
  }

  const instructions = Object.entries(colorCoords).map(([code, coords]) => ({
    colorCode: code,
    colorName: template.colorNames[code] || code,
    hex: template.colorMap[code] || "#000000",
    coordinates: coords,
  }));

  return {
    rows: template.rows,
    cols: template.cols,
    colorMap: template.colorMap,
    colorNames: template.colorNames,
    instructions,
    grid: matrix,
  };
}
