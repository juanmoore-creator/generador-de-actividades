import { WordItem, MatchingResult } from "../types/activities";

export function generateMatching(items: WordItem[]): MatchingResult {
  const validItems = items.filter(
    (item) => item.word.trim().length > 0 && item.clue.trim().length > 0
  );

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const pairs = validItems.map((item, index) => ({
    id: index + 1,
    leftText: item.word.trim(),
    rightText: item.clue.trim(),
  }));

  // Shuffle right items
  const rightWithId = pairs.map((p) => ({ id: p.id, text: p.rightText }));
  for (let i = rightWithId.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rightWithId[i], rightWithId[j]] = [rightWithId[j], rightWithId[i]];
  }

  const shuffledRight = rightWithId.map((item, index) => ({
    id: item.id,
    label: alphabet[index] || `R${index + 1}`,
    text: item.text,
  }));

  const solutions = pairs.map((pair) => {
    const matched = shuffledRight.find((r) => r.id === pair.id);
    return {
      leftId: pair.id,
      rightLabel: matched?.label || "?",
      text: pair.rightText,
    };
  });

  return {
    pairs: pairs.map((p) => ({ id: p.id, leftText: p.leftText })),
    shuffledRight,
    solutions,
  };
}
