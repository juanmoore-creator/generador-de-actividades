import { ClozeResult } from "../types/activities";

const SPANISH_STOPWORDS = new Set([
  "de", "la", "el", "en", "y", "a", "los", "del", "se", "las", "por", "un", "para",
  "con", "no", "una", "su", "al", "lo", "como", "mas", "más", "pero", "sus", "le",
  "ya", "o", "este", "sí", "porque", "esta", "son", "entre", "cuando", "muy", "sin",
  "sobre", "también", "me", "hasta", "hay", "donde", "quien", "desde", "todo", "nos",
  "durante", "todos", "uno", "les", "ni", "contra", "otros", "ese", "eso", "ante",
  "ellos", "e", "esto", "mí", "antes", "algunos", "qué", "unos", "yo", "otro", "otras"
]);

export function generateClozeTest(rawText: string, title = "Completa el Texto"): ClozeResult {
  const text = rawText.trim();
  if (!text) {
    return {
      title,
      originalText: "",
      textWithBlanks: [],
      wordBank: [],
      solutions: [],
    };
  }

  const solutions: { index: number; word: string }[] = [];
  const textWithBlanks: { text: string; blankIndex?: number; isBlank: boolean }[] = [];

  // Check if text has explicit brackets: [palabra]
  const bracketRegex = /\[(.*?)\]/g;
  const hasBrackets = bracketRegex.test(text);

  if (hasBrackets) {
    let lastIndex = 0;
    let blankCounter = 1;
    const re = /\[(.*?)\]/g;
    let match;

    while ((match = re.exec(text)) !== null) {
      const preceding = text.substring(lastIndex, match.index);
      if (preceding) {
        textWithBlanks.push({ text: preceding, isBlank: false });
      }
      const missingWord = match[1].trim();
      textWithBlanks.push({
        text: missingWord,
        blankIndex: blankCounter,
        isBlank: true,
      });
      solutions.push({ index: blankCounter, word: missingWord });
      blankCounter++;
      lastIndex = re.lastIndex;
    }

    const trailing = text.substring(lastIndex);
    if (trailing) {
      textWithBlanks.push({ text: trailing, isBlank: false });
    }
  } else {
    // Automatic word selection: pick significant words (length >= 4 and not stop words)
    const words = text.split(/(\s+|[.,;:¡!¿?()]+)/);
    let blankCounter = 1;
    const maxBlanks = 10;

    for (const part of words) {
      const clean = part.toLowerCase().replace(/[^a-záéíóúüñ]/gi, "");
      const isCandidate =
        clean.length >= 4 &&
        !SPANISH_STOPWORDS.has(clean) &&
        blankCounter <= maxBlanks &&
        Math.random() < 0.35;

      if (isCandidate) {
        textWithBlanks.push({
          text: part,
          blankIndex: blankCounter,
          isBlank: true,
        });
        solutions.push({ index: blankCounter, word: part });
        blankCounter++;
      } else {
        textWithBlanks.push({ text: part, isBlank: false });
      }
    }
  }

  // Shuffle word bank
  const wordBank = solutions.map((s) => s.word);
  for (let i = wordBank.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [wordBank[i], wordBank[j]] = [wordBank[j], wordBank[i]];
  }

  return {
    title,
    originalText: text,
    textWithBlanks,
    wordBank,
    solutions,
  };
}
