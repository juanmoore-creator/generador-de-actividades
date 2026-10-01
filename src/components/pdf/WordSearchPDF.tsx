import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { WordSearchResult } from "@/lib/generators/wordSearch";

const styles = StyleSheet.create({
  page: { padding: 36, fontFamily: "Helvetica", fontSize: 11 },
  header: { marginBottom: 16, textAlign: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 8, color: "#1e293b" },
  subtitle: { fontSize: 11, color: "#64748b", marginBottom: 8 },
  solutionTag: { fontSize: 11, color: "#dc2626", fontWeight: "bold", marginBottom: 8 },
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
  title: string;
  result: WordSearchResult;
  showSolution?: boolean;
}

export const WordSearchPDF = ({ title, result, showSolution = false }: Props) => {
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
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title || "Sopa de Letras"}</Text>
          <Text style={styles.subtitle}>
            Nombre: _________________________________________   Fecha: ________________
          </Text>
          {showSolution && <Text style={styles.solutionTag}>*** HOJA DE RESPUESTAS (SOLUCIÓN) ***</Text>}
        </View>

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
      </Page>
    </Document>
  );
};
