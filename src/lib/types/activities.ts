export type ActivityType =
  | "wordsearch"
  | "crossword"
  | "scramble"
  | "matching"
  | "cryptogram"
  | "cloze"
  | "rosco"
  | "bingo"
  | "sudoku"
  | "mathpyramid"
  | "crossmath"
  | "mathchain"
  | "maze"
  | "pixelart";

export type ActivityCategory = "language" | "math" | "visual";

export type EducationLevel = "inicial" | "primaria" | "secundaria";

export interface WordItem {
  word: string;
  clue: string;
}

export type Difficulty = "easy" | "medium" | "hard";

export type PageSize = "A4" | "LETTER";

export type SudokuSymbols = "numbers" | "shapes" | "letters";

export type ChainOperator = "+" | "-" | "×" | "÷";

export interface SheetHeaderOptions {
  showName: boolean;
  showDate: boolean;
  showGrade: boolean;
  showScore: boolean;
  schoolName?: string;
}

export interface SheetOptions {
  header: SheetHeaderOptions;
  pageSize: PageSize;
  /** Cantidad de versiones distintas de la ficha (cada una con su propia semilla). */
  copies: number;
  /** Consigna que aparece debajo del título. Vacío = consigna por defecto de la actividad. */
  instructions: string;
}

/**
 * Estado completo y serializable de una ficha. Es lo que se guarda en borradores,
 * en "Mis fichas" y en la comunidad. Con el mismo snapshot se obtiene siempre la misma hoja.
 */
export interface ActivitySnapshot {
  schemaVersion: 3;
  type: ActivityType;
  title: string;
  difficulty: Difficulty;
  seed: number;

  // Contenido
  items: WordItem[];
  cryptoPhrase: string;
  cryptoHint: string;
  clozeText: string;
  roscoItems: RoscoLetterItem[];

  // Ajustes por actividad
  wordSearchSize: number | null; // null = automático
  sudokuSize: 4 | 6 | 9;
  sudokuSymbols: SudokuSymbols;
  pyramidLevels: number;
  pyramidCount: number;
  mazeSize: number;
  pixelArtKey: string;
  bingoSize: 3 | 4 | 5;
  bingoFreeCenter: boolean;
  chainLength: number;
  chainCount: number;
  chainOps: ChainOperator[];

  sheet: SheetOptions;
}

// 1. Scramble
export interface ScrambledWord {
  original: string;
  scrambled: string;
  clue: string;
}

export interface WordScrambleResult {
  items: ScrambledWord[];
}

// 2. Matching
export interface MatchingResult {
  pairs: { id: number; leftText: string }[];
  shuffledRight: { id: number; label: string; text: string }[];
  solutions: { leftId: number; rightLabel: string; text: string }[];
}

// 3. Cryptogram
export interface CryptogramChar {
  original: string;
  code: number | string;
  isLetter: boolean;
  revealed: boolean;
}

export interface CryptogramResult {
  words: CryptogramChar[][];
  cipherKey: { letter: string; code: number | string }[];
  originalPhrase: string;
  hint?: string;
}

// 4. Cloze
export interface ClozeResult {
  title: string;
  originalText: string;
  textWithBlanks: { text: string; blankIndex?: number; isBlank: boolean }[];
  wordBank: string[];
  solutions: { index: number; word: string }[];
}

// 5. Rosco
export interface RoscoLetterItem {
  letter: string;
  word: string;
  clue: string;
  prefixType: "starts" | "contains";
}

export interface RoscoResult {
  items: RoscoLetterItem[];
}

// 6. Bingo
export interface BingoResult {
  size: 3 | 4 | 5;
  /** Celdas de la tarjeta; null = casillero libre. */
  card: (string | null)[][];
  /** Lista completa para el docente (palabra + pista para "cantar"). */
  callList: WordItem[];
}

// 7. Sudoku
export interface SudokuResult {
  size: 4 | 6 | 9;
  subgridWidth: number;
  subgridHeight: number;
  initialGrid: (number | null)[][];
  solutionGrid: number[][];
  symbols: SudokuSymbols;
}

// 8. Math Pyramid
export interface PyramidCell {
  value: number;
  revealed: boolean;
}

export interface MathPyramidItem {
  id: number;
  levels: number;
  grid: PyramidCell[][];
  solutionGrid: number[][];
}

export interface MathPyramidResult {
  pyramids: MathPyramidItem[];
}

// 9. CrossMath
export type CrossMathCell =
  | { type: "empty" }
  | { type: "operator"; value: "+" | "-" | "×" | "=" }
  | { type: "number"; value: number; isBlank: boolean };

export interface CrossMathResult {
  grid: CrossMathCell[][];
  size: number;
  solutions: { r: number; c: number; value: number }[];
}

// 10. Math chain
export interface MathChainStep {
  op: ChainOperator;
  operand: number;
  result: number;
}

export interface MathChain {
  start: number;
  steps: MathChainStep[];
}

export interface MathChainResult {
  chains: MathChain[];
}

// 11. Maze
export interface MazeCell {
  r: number;
  c: number;
  north: boolean;
  south: boolean;
  east: boolean;
  west: boolean;
}

export interface MazeResult {
  width: number;
  height: number;
  grid: MazeCell[][];
  solutionPath: [number, number][];
}

// 12. Pixel Art
export interface PixelArtResult {
  rows: number;
  cols: number;
  colorMap: Record<string, string>;
  colorNames: Record<string, string>;
  instructions: { colorCode: string; colorName: string; hex: string; coordinates: string[] }[];
  grid: (string | null)[][];
}
