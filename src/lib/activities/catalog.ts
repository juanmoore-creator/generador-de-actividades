import type { ActivityCategory, ActivityType, EducationLevel } from "../types/activities";

/** Tipo de editor de contenido que necesita la actividad (null = se genera sola). */
export type ContentKind = "words" | "words-clues" | "cryptogram" | "cloze" | "rosco" | null;

/** Controles de ajustes que muestra el paso "Ajustes". */
export type SettingKey =
  | "difficulty"
  | "wordSearchSize"
  | "sudoku"
  | "pyramid"
  | "maze"
  | "pixelArt"
  | "bingo"
  | "chain";

export interface ActivityMeta {
  id: ActivityType;
  title: string;
  category: ActivityCategory;
  description: string;
  levels: EducationLevel[];
  /** Nombre del ícono de lucide-react. */
  icon: string;
  defaultTitle: string;
  defaultInstructions: string;
  content: ContentKind;
  settings: SettingKey[];
  /** Mínimo de palabras con contenido para que la ficha tenga sentido. */
  minItems?: number;
  /** Las pistas son obligatorias (relacionar columnas) u opcionales. */
  clues?: "required" | "optional";
  fileName: string;
}

export const ACTIVITIES: ActivityMeta[] = [
  {
    id: "wordsearch",
    title: "Sopa de letras",
    category: "language",
    description: "Palabras escondidas en una cuadrícula, en varias direcciones.",
    levels: ["primaria", "secundaria"],
    icon: "Grid3X3",
    defaultTitle: "Sopa de letras",
    defaultInstructions: "Encuentra y rodea las palabras de la lista.",
    content: "words",
    settings: ["difficulty", "wordSearchSize"],
    minItems: 3,
    fileName: "Sopa_de_letras",
  },
  {
    id: "crossword",
    title: "Crucigrama",
    category: "language",
    description: "Palabras cruzadas con pistas horizontales y verticales.",
    levels: ["primaria", "secundaria"],
    icon: "AlignLeft",
    defaultTitle: "Crucigrama",
    defaultInstructions: "Lee cada pista y escribe la palabra en los casilleros con el mismo número.",
    content: "words-clues",
    settings: [],
    minItems: 3,
    clues: "optional",
    fileName: "Crucigrama",
  },
  {
    id: "scramble",
    title: "Anagramas",
    category: "language",
    description: "Letras desordenadas para formar la palabra correcta.",
    levels: ["primaria"],
    icon: "Shuffle",
    defaultTitle: "Ordena las letras",
    defaultInstructions: "Ordena las letras para descubrir cada palabra.",
    content: "words-clues",
    settings: [],
    minItems: 2,
    clues: "optional",
    fileName: "Anagramas",
  },
  {
    id: "matching",
    title: "Relacionar columnas",
    category: "language",
    description: "Une cada concepto con su definición.",
    levels: ["primaria", "secundaria"],
    icon: "ArrowRightLeft",
    defaultTitle: "Une con flechas",
    defaultInstructions: "Une cada palabra de la columna A con su definición en la columna B.",
    content: "words-clues",
    settings: [],
    minItems: 3,
    clues: "required",
    fileName: "Relacionar_columnas",
  },
  {
    id: "cryptogram",
    title: "Criptograma",
    category: "language",
    description: "Un mensaje secreto cifrado con números.",
    levels: ["primaria", "secundaria"],
    icon: "KeyRound",
    defaultTitle: "Descifra el mensaje secreto",
    defaultInstructions: "Usa la clave para reemplazar cada número por su letra y descubrir el mensaje.",
    content: "cryptogram",
    settings: ["difficulty"],
    fileName: "Criptograma",
  },
  {
    id: "cloze",
    title: "Texto con huecos",
    category: "language",
    description: "Completa el texto con las palabras del banco.",
    levels: ["primaria", "secundaria"],
    icon: "FileText",
    defaultTitle: "Completa el texto",
    defaultInstructions: "Completa cada hueco con una palabra del recuadro.",
    content: "cloze",
    settings: [],
    fileName: "Texto_con_huecos",
  },
  {
    id: "rosco",
    title: "Rosco de palabras",
    category: "language",
    description: "Una definición por cada letra del abecedario.",
    levels: ["primaria", "secundaria"],
    icon: "Disc",
    defaultTitle: "El rosco de palabras",
    defaultInstructions: "Lee cada definición y escribe la palabra que empieza (o contiene) esa letra.",
    content: "rosco",
    settings: [],
    fileName: "Rosco",
  },
  {
    id: "bingo",
    title: "Bingo de palabras",
    category: "language",
    description: "Cartones distintos para jugar en clase, con lista para el docente.",
    levels: ["inicial", "primaria"],
    icon: "LayoutGrid",
    defaultTitle: "Bingo de palabras",
    defaultInstructions: "Marca la palabra cuando la escuches. ¡Gana quien complete una línea!",
    content: "words",
    settings: ["bingo"],
    minItems: 9,
    fileName: "Bingo",
  },
  {
    id: "sudoku",
    title: "Sudoku",
    category: "math",
    description: "Tableros de 4×4, 6×6 o 9×9 con números, letras o figuras.",
    levels: ["inicial", "primaria", "secundaria"],
    icon: "Grid2X2",
    defaultTitle: "Sudoku",
    defaultInstructions: "Completa el tablero: cada fila, columna y recuadro tiene todos los símbolos sin repetir.",
    content: null,
    settings: ["difficulty", "sudoku"],
    fileName: "Sudoku",
  },
  {
    id: "mathpyramid",
    title: "Pirámides de sumas",
    category: "math",
    description: "Cada ladrillo es la suma de los dos de abajo.",
    levels: ["primaria"],
    icon: "Triangle",
    defaultTitle: "Pirámides de sumas",
    defaultInstructions: "Cada ladrillo es la suma de los dos que tiene debajo. Completa los que faltan.",
    content: null,
    settings: ["difficulty", "pyramid"],
    fileName: "Piramides",
  },
  {
    id: "crossmath",
    title: "Crucigrama numérico",
    category: "math",
    description: "Operaciones cruzadas en filas y columnas.",
    levels: ["primaria", "secundaria"],
    icon: "Calculator",
    defaultTitle: "Crucigrama numérico",
    defaultInstructions: "Completa los casilleros para que se cumplan todas las operaciones, en filas y columnas.",
    content: null,
    settings: ["difficulty"],
    fileName: "Crucigrama_numerico",
  },
  {
    id: "mathchain",
    title: "Cadenas de operaciones",
    category: "math",
    description: "El resultado de cada paso es el inicio del siguiente.",
    levels: ["primaria", "secundaria"],
    icon: "Link2",
    defaultTitle: "Cadenas de operaciones",
    defaultInstructions: "Resuelve cada operación y usa el resultado para la siguiente.",
    content: null,
    settings: ["difficulty", "chain"],
    fileName: "Cadenas",
  },
  {
    id: "maze",
    title: "Laberinto",
    category: "visual",
    description: "Encuentra el camino de la entrada a la salida.",
    levels: ["inicial", "primaria"],
    icon: "Milestone",
    defaultTitle: "El laberinto",
    defaultInstructions: "Traza el camino desde la entrada hasta la salida sin cruzar las paredes.",
    content: null,
    settings: ["maze"],
    fileName: "Laberinto",
  },
  {
    id: "pixelart",
    title: "Pixel art por coordenadas",
    category: "visual",
    description: "Pinta los casilleros indicados y descubre el dibujo.",
    levels: ["inicial", "primaria"],
    icon: "Palette",
    defaultTitle: "Pinta por coordenadas",
    defaultInstructions: "Pinta cada casillero con el color indicado para descubrir el dibujo secreto.",
    content: null,
    settings: ["pixelArt"],
    fileName: "Pixel_art",
  },
];

export const ACTIVITY_BY_ID = Object.fromEntries(ACTIVITIES.map((a) => [a.id, a])) as Record<
  ActivityType,
  ActivityMeta
>;

export function getActivity(type: ActivityType): ActivityMeta {
  return ACTIVITY_BY_ID[type] ?? ACTIVITIES[0];
}

export const CATEGORIES: { id: ActivityCategory; label: string; short: string; icon: string }[] = [
  { id: "language", label: "Lengua y vocabulario", short: "Lengua", icon: "BookOpen" },
  { id: "math", label: "Matemática y lógica", short: "Matemática", icon: "Calculator" },
  { id: "visual", label: "Visual y motricidad", short: "Visual", icon: "Sparkles" },
];

export const LEVELS: { id: EducationLevel; label: string }[] = [
  { id: "inicial", label: "Inicial" },
  { id: "primaria", label: "Primaria" },
  { id: "secundaria", label: "Secundaria" },
];

export const DIFFICULTY_LABELS = {
  easy: "Fácil",
  medium: "Medio",
  hard: "Difícil",
} as const;
