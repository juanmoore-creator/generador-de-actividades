export type ActivityType =
  | "wordsearch"
  | "crossword"
  | "scramble"
  | "matching"
  | "cryptogram"
  | "cloze"
  | "rosco"
  | "sudoku"
  | "mathpyramid"
  | "crossmath"
  | "maze"
  | "pixelart";

export type ActivityCategory = "language" | "math" | "visual";

export interface WordItem {
  word: string;
  clue: string;
}

export type Difficulty = "easy" | "medium" | "hard";

export interface SheetHeaderOptions {
  showName: boolean;
  showDate: boolean;
  showGrade: boolean;
  showScore: boolean;
  schoolName?: string;
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
export interface MatchingPair {
  id: number;
  leftText: string;
  rightText: string;
  rightLabel: string; // e.g. "A", "B", "C"
}

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
  wordBank: string[]; // Shuffled missing words
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

// 6. Sudoku
export interface SudokuResult {
  size: 4 | 6 | 9;
  subgridWidth: number;
  subgridHeight: number;
  initialGrid: (number | null)[][];
  solutionGrid: number[][];
  symbols?: string[]; // Emojis or numbers
}

// 7. Math Pyramid
export interface PyramidCell {
  value: number;
  revealed: boolean;
}

export interface MathPyramidItem {
  id: number;
  levels: number; // 3 or 4
  grid: PyramidCell[][];
  solutionGrid: number[][];
}

export interface MathPyramidResult {
  pyramids: MathPyramidItem[];
}

// 8. CrossMath
export type CrossMathCell =
  | { type: "empty" }
  | { type: "operator"; value: "+" | "-" | "×" | "=" }
  | { type: "number"; value: number; isBlank: boolean };

export interface CrossMathResult {
  grid: CrossMathCell[][];
  size: number;
  solutions: { r: number; c: number; value: number }[];
}

// 9. Maze
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
  solutionPath: [number, number][]; // [r, c] path from [0,0] to [h-1, w-1]
}

// 10. Pixel Art
export interface PixelArtResult {
  rows: number;
  cols: number;
  colorMap: Record<string, string>; // e.g. { "R": "#ef4444", "G": "#22c55e", "B": "#3b82f6" }
  colorNames: Record<string, string>; // e.g. { "R": "Rojo", "G": "Verde", "B": "Azul" }
  instructions: { colorCode: string; colorName: string; hex: string; coordinates: string[] }[];
  grid: (string | null)[][]; // Matrix of color codes for solution
}
