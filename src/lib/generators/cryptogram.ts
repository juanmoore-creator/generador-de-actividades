import { CryptogramResult, CryptogramChar, Difficulty } from "../types/activities";

function normalizeChar(c: string): string {
  return c
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

export function generateCryptogram(
  phrase: string,
  hint?: string,
  difficulty: Difficulty = "medium"
): CryptogramResult {
  const cleanPhrase = phrase.trim();
  if (!cleanPhrase) {
    return {
      words: [],
      cipherKey: [],
      originalPhrase: "",
      hint,
    };
  }

  // Extract all unique letters
  const uniqueLetters = new Set<string>();
  for (const rawChar of cleanPhrase) {
    const c = normalizeChar(rawChar);
    if (/[A-Z]/.test(c)) {
      uniqueLetters.add(c);
    }
  }

  const lettersArr = Array.from(uniqueLetters);
  
  // Create randomized numbers 1..26
  const numbers: number[] = Array.from({ length: 26 }, (_, i) => i + 1);
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  const letterToCode: Record<string, number> = {};
  lettersArr.forEach((char, idx) => {
    letterToCode[char] = numbers[idx];
  });

  // Determine pre-revealed letters based on difficulty
  const revealCount =
    difficulty === "easy"
      ? Math.max(2, Math.floor(lettersArr.length * 0.35))
      : difficulty === "medium"
      ? Math.max(1, Math.floor(lettersArr.length * 0.15))
      : 0;

  const shuffledLetters = [...lettersArr].sort(() => Math.random() - 0.5);
  const preRevealed = new Set<string>(shuffledLetters.slice(0, revealCount));

  // Split phrase into words
  const rawWords = cleanPhrase.split(/\s+/);
  const words: CryptogramChar[][] = rawWords.map((word) => {
    return word.split("").map((rawChar) => {
      const c = normalizeChar(rawChar);
      const isLetter = /[A-Z]/.test(c);
      const code = isLetter ? letterToCode[c] ?? 0 : rawChar;
      const isRevealed = isLetter ? preRevealed.has(c) : true;

      return {
        original: c,
        code,
        isLetter,
        revealed: isRevealed,
      };
    });
  });

  // Cipher key table (sorted alphabetically)
  const cipherKey = lettersArr
    .sort()
    .map((letter) => ({
      letter,
      code: letterToCode[letter],
    }));

  return {
    words,
    cipherKey,
    originalPhrase: cleanPhrase,
    hint,
  };
}
