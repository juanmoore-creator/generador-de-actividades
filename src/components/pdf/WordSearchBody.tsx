import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { WordSearchResult } from "@/lib/generators/wordSearch";

const styles = StyleSheet.create({
  grid: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 24,
  },
  row: { flexDirection: "row" },
  wordsSection: {
    borderTop: "1px solid #cbd5e1",
    paddingTop: 14,
  },
  sectionTitle: { fontSize: 12, fontWeight: "bold", marginBottom: 8, color: "#0f172a" },
  wordsContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  wordItem: {
    width: "33.33%",
    marginBottom: 5,
    fontSize: 10,
    color: "#334155",
  },
});

interface Props {
  result: WordSearchResult;
  showSolution?: boolean;
}

export const WordSearchBody = ({ result, showSolution = false }: Props) => {
  const solutionCells = new Set<string>();
  if (showSolution) {
    for (const w of result.placedWords) {
      for (let i = 0; i < w.word.length; i++) {
        const y = w.y + w.direction[0] * i;
        const x = w.x + w.direction[1] * i;
        solutionCells.add(`${y},${x}`);
      }
    }
  }

  const cellSize = Math.min(24, Math.max(14, Math.floor(460 / Math.max(result.size, 1))));
  const fontSize = Math.max(8, Math.floor(cellSize * 0.52));

  return (
    <>
        <View style={styles.grid}>
          {result.grid.map((row, y) => (
            <View key={y} style={styles.row}>
              {row.map((char, x) => {
                const isSol = showSolution && solutionCells.has(`${y},${x}`);
                return (
                  <View
                    key={`${y}-${x}`}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      borderWidth: 1,
                      borderColor: isSol ? "#dc2626" : "#cbd5e1",
                      backgroundColor: isSol ? "#fee2e2" : "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize,
                        textAlign: "center",
                        color: isSol ? "#dc2626" : "#0f172a",
                        fontWeight: isSol ? "bold" : "normal",
                      }}
                    >
                      {char}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.wordsSection}>
          <Text style={styles.sectionTitle}>
            Palabras a encontrar ({result.placedWords.length}):
          </Text>
          <View style={styles.wordsContainer}>
            {result.placedWords.map((w, i) => (
              <Text key={i} style={styles.wordItem}>
                • {w.originalWord || w.word}
              </Text>
            ))}
          </View>
        </View>
    </>
  );
};
