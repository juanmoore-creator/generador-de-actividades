import type { ActivitySnapshot, ActivityType, WordItem } from "../types/activities";
import { createSnapshot } from "./snapshot";
import { getActivity } from "./catalog";
import { newSeed } from "../random";
import { sanitizeSpanishWord } from "../generators/wordSearch";

export const DEFAULT_PACK_ACTIVITIES: ActivityType[] = [
  "wordsearch",
  "crossword",
  "scramble",
  "matching",
];

export const ALL_PACK_ACTIVITIES: ActivityType[] = [
  "wordsearch",
  "crossword",
  "scramble",
  "matching",
  "cryptogram",
  "cloze",
  "bingo",
];

export interface ThemePackOptions {
  themeTitle: string;
  items: WordItem[];
  activityTypes?: ActivityType[];
  clozeText?: string;
  cryptoPhrase?: string;
  cryptoHint?: string;
}

export interface GeneratedPackItem {
  type: ActivityType;
  title: string;
  snapshot: ActivitySnapshot;
}

export interface ThemePackResult {
  title: string;
  items: WordItem[];
  activities: GeneratedPackItem[];
}

/**
 * Creates a cohesive set of activity snapshots for a given theme and list of words/clues.
 */
export function createThemePack({
  themeTitle,
  items,
  activityTypes = DEFAULT_PACK_ACTIVITIES,
  clozeText,
  cryptoPhrase,
  cryptoHint,
}: ThemePackOptions): ThemePackResult {
  const cleanTitle = themeTitle.trim() || "Actividades Temáticas";

  // Filter valid items
  const cleanItems: WordItem[] = items.map((it) => ({
    word: sanitizeSpanishWord(it.word),
    clue: it.clue.trim(),
  })).filter((it) => it.word.length >= 2);

  const activities: GeneratedPackItem[] = [];

  for (const type of activityTypes) {
    const meta = getActivity(type);
    const activityTitle = `${meta.defaultTitle}: ${cleanTitle}`;

    // Activity specific adjustments
    let snapshotOverrides: Partial<ActivitySnapshot> = {
      title: activityTitle,
      seed: newSeed(),
      items: cleanItems.map((i) => ({ ...i })),
      sheet: {
        header: {
          showName: true,
          showDate: true,
          showGrade: false,
          showScore: false,
          schoolName: "",
        },
        pageSize: "A4",
        copies: 1,
        instructions: meta.defaultInstructions,
      },
    };

    if (type === "cryptogram") {
      if (cryptoPhrase) {
        snapshotOverrides = {
          ...snapshotOverrides,
          cryptoPhrase: cryptoPhrase.trim(),
          cryptoHint: cryptoHint ? cryptoHint.trim() : `Pista del tema ${cleanTitle}`,
        };
      } else {
        // Pick first clue or a synthesized phrase based on theme
        const phraseItem = cleanItems.find((i) => i.word.length >= 4) || cleanItems[0];
        const phrase = phraseItem ? `${phraseItem.word}` : cleanTitle.toUpperCase();
        snapshotOverrides = {
          ...snapshotOverrides,
          cryptoPhrase: phrase,
          cryptoHint: `Pista del tema ${cleanTitle}: ${phraseItem?.clue || cleanTitle}`,
        };
      }
    } else if (type === "cloze") {
      if (clozeText) {
        snapshotOverrides.clozeText = clozeText.trim();
      }
    } else if (type === "matching") {
      // For matching, items with clues are required; cap at 10 for clean single-page printing
      const withClues = cleanItems.filter((i) => i.clue.length > 0);
      const candidates = withClues.length >= 3 ? withClues : cleanItems;
      snapshotOverrides.items = candidates.slice(0, 10);
    } else if (type === "scramble") {
      // Cap at 12 items for clean single-page printing
      snapshotOverrides.items = cleanItems.slice(0, 12);
    } else if (type === "bingo") {
      snapshotOverrides.bingoSize = cleanItems.length >= 16 ? 4 : 3;
    }

    const snapshot = createSnapshot(type, snapshotOverrides);
    activities.push({
      type,
      title: activityTitle,
      snapshot,
    });
  }

  return {
    title: cleanTitle,
    items: cleanItems,
    activities,
  };
}
