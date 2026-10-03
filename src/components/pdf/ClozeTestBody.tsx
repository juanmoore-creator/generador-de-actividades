import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { ClozeResult } from "@/lib/types/activities";

const styles = StyleSheet.create({
  wordBankCard: {
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    backgroundColor: "#ffffff",
  },
  wordBankTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#64748b",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  wordBankTags: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  wordTag: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  wordTagText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0f172a",
  },
  paragraph: {
    fontSize: 12,
    lineHeight: 2.1,
    color: "#1e293b",
  },
  blankStudent: {
    color: "#64748b",
  },
  blankSolution: {
    fontFamily: "Helvetica-Bold",
    color: "#dc2626",
  },
  solutionsSummary: {
    marginTop: 28,
    padding: 10,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fff1f2",
    borderRadius: 6,
  },
  solTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 4,
  },
  solItems: {
    fontSize: 10,
    color: "#991b1b",
    lineHeight: 1.5,
  },
});

interface Props {
  result: ClozeResult;
  showSolution?: boolean;
}

export const ClozeTestBody = ({ result, showSolution = false }: Props) => {
  return (
    <>
        {/* Word Bank Box */}
        {!showSolution && result.wordBank.length > 0 && (
          <View style={styles.wordBankCard}>
            <Text style={styles.wordBankTitle}>Banco de palabras</Text>
            <View style={styles.wordBankTags}>
              {result.wordBank.map((w, idx) => (
                <View key={idx} style={styles.wordTag}>
                  <Text style={styles.wordTagText}>{w}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Texto con huecos: un único párrafo con fragmentos anidados para que fluya bien. */}
        <Text style={styles.paragraph}>
          {result.textWithBlanks.map((part, idx) =>
            !part.isBlank ? (
              <Text key={idx}>{part.text}</Text>
            ) : showSolution ? (
              <Text key={idx} style={styles.blankSolution}>
                {` ${part.text} (${part.blankIndex}) `}
              </Text>
            ) : (
              <Text key={idx} style={styles.blankStudent}>
                {` ______________ (${part.blankIndex}) `}
              </Text>
            )
          )}
        </Text>

        {showSolution && (
          <View style={styles.solutionsSummary}>
            <Text style={styles.solTitle}>Respuestas</Text>
            <Text style={styles.solItems}>
              {result.solutions
                .map((s) => `(${s.index}) ${s.word}`)
                .join("  •  ")}
            </Text>
          </View>
        )}
    </>
  );
};
