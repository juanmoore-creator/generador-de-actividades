import { WordItem, WordScrambleResult, ScrambledWord } from "../types/activities";

function shuffleWord(word: string): string {
  const letters = word.split("");
  if (letters.length <= 1) return word;

  let scrambled = "";
  let attempts = 0;
  // Ensure the scrambled version is not identical to the original if length > 1
  while (attempts < 10) {
    const arr = [...letters];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    scrambled = arr.join("");
    if (scrambled !== word) break;
    attempts++;
  }

  // Fallback: simple swap
  if (scrambled === word && letters.length > 1) {
    const arr = [...letters];
    [arr[0], arr[1]] = [arr[1], arr[0]];
    scrambled = arr.join("");
  }

  return scrambled;
}

export function generateWordScramble(items: WordItem[]): WordScrambleResult {
  const validItems = items.filter((item) => item.word.trim().length > 0);

  const scrambledList: ScrambledWord[] = validItems.map((item) => {
    const cleanWord = item.word.trim().toUpperCase();
    return {
      original: cleanWord,
      scrambled: shuffleWord(cleanWord),
      clue: item.clue.trim(),
    };
  });

  return {
    items: scrambledList,
  };
}
