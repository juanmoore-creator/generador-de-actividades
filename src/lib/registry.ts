import { ActivityType, ActivityCategory } from "./types/activities";

export interface ActivityMetadata {
  id: ActivityType;
  title: string;
  category: ActivityCategory;
  description: string;
  badge: string;
  icon: string; // Lucide icon identifier
  inputKind: "words" | "text" | "sudoku" | "mathpyramid" | "crossmath" | "maze" | "pixelart" | "rosco";
  defaultTitle: string;
}

export const ACTIVITIES: ActivityMetadata[] = [
  // 🔤 Lengua y Vocabulario
  {
    id: "wordsearch",
    title: "Sopa de Letras",
    category: "language",
    description: "Cuadrícula con palabras escondidas en varias direcciones.",
    badge: "Clásico",
    icon: "Grid3X3",
    inputKind: "words",
    defaultTitle: "Sopa de Letras",
  },
  {
    id: "crossword",
    title: "Crucigrama",
    category: "language",
    description: "Palabras cruzadas con pistas horizontales y verticales.",
    badge: "Popular",
    icon: "AlignLeft",
    inputKind: "words",
    defaultTitle: "Crucigrama Temático",
  },
  {
    id: "scramble",
    title: "Anagramas",
    category: "language",
    description: "Letras desordenadas para recomponer palabras.",
    badge: "Nuevo",
    icon: "Shuffle",
    inputKind: "words",
    defaultTitle: "Descifra las Palabras",
  },
  {
    id: "matching",
    title: "Relacionar Columnas",
    category: "language",
    description: "Une conceptos con sus definiciones mediante flechas.",
    badge: "Nuevo",
    icon: "ArrowRightLeft",
    inputKind: "words",
    defaultTitle: "Une con Flechas",
  },
  {
    id: "cryptogram",
    title: "Criptograma",
    category: "language",
    description: "Mensaje secreto cifrado con números o símbolos.",
    badge: "Nuevo",
    icon: "KeyRound",
    inputKind: "text",
    defaultTitle: "Descifra el Mensaje Secreto",
  },
  {
    id: "cloze",
    title: "Texto con Huecos",
    category: "language",
    description: "Completa los espacios en blanco con la palabra adecuada.",
    badge: "Nuevo",
    icon: "FileText",
    inputKind: "text",
    defaultTitle: "Completa el Texto",
  },
  {
    id: "rosco",
    title: "Rueda de Palabras",
    category: "language",
    description: "El clásico rosco del abecedario de la A a la Z.",
    badge: "Nuevo",
    icon: "Disc",
    inputKind: "rosco",
    defaultTitle: "El Gran Rosco de Palabras",
  },

  // 🧩 Lógica y Matemáticas
  {
    id: "sudoku",
    title: "Sudoku Adaptativo",
    category: "math",
    description: "Tableros de 4x4 infantil, 6x6 y 9x9 estándar.",
    badge: "Nuevo",
    icon: "Grid2X2",
    inputKind: "sudoku",
    defaultTitle: "Sudoku Escolar",
  },
  {
    id: "mathpyramid",
    title: "Pirámides Matemáticas",
    category: "math",
    description: "Pirámides de sumas y restas para cálculo mental.",
    badge: "Nuevo",
    icon: "Triangle",
    inputKind: "mathpyramid",
    defaultTitle: "Pirámides de Sumas",
  },
  {
    id: "crossmath",
    title: "Crucigrama Numérico",
    category: "math",
    description: "Ecuaciones cruzadas en horizontal y vertical.",
    badge: "Nuevo",
    icon: "Calculator",
    inputKind: "crossmath",
    defaultTitle: "Reto Cross-Math",
  },

  // 🎨 Visual y Motricidad
  {
    id: "maze",
    title: "Laberinto Generativo",
    category: "visual",
    description: "Laberinto con entrada, salida y camino de solución.",
    badge: "Nuevo",
    icon: "Milestone",
    inputKind: "maze",
    defaultTitle: "Aventura en el Laberinto",
  },
  {
    id: "pixelart",
    title: "Pixel Art por Coordenadas",
    category: "visual",
    description: "Colorea según las coordenadas para descubrir la figura.",
    badge: "Nuevo",
    icon: "Palette",
    inputKind: "pixelart",
    defaultTitle: "Pinta por Coordenadas",
  },
];

export const CATEGORIES: { id: ActivityCategory; label: string; icon: string }[] = [
  { id: "language", label: "Lengua y Vocabulario", icon: "BookOpen" },
  { id: "math", label: "Lógica y Matemáticas", icon: "Calculator" },
  { id: "visual", label: "Visual y Motricidad", icon: "Sparkles" },
];
