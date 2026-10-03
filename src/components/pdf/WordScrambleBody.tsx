import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { WordScrambleResult } from "@/lib/types/activities";

const styles = StyleSheet.create({
  list: { display: "flex", flexDirection: "column", gap: 14 },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 10,
  },
  indexBadge: {
    width: 22,
    fontSize: 10,
    fontWeight: "bold",
    color: "#94a3b8",
  },
  scrambledBox: {
    flex: 1,
    flexDirection: "column",
  },
  scrambledLetters: {
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 4,
    color: "#0f172a",
    marginBottom: 2,
  },
  clueText: {
    fontSize: 9,
    color: "#64748b",
    fontStyle: "italic",
  },
  answerSection: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  blankLine: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#334155",
    width: 140,
    height: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  solutionText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#dc2626",
    letterSpacing: 2,
  },
});

interface Props {
  result: WordScrambleResult;
  showSolution?: boolean;
}

export const WordScrambleBody = ({ result, showSolution = false }: Props) => {
  return (
    <>
        <View style={styles.list}>
          {result.items.map((item, idx) => (
            <View key={idx} style={styles.row}>
              <Text style={styles.indexBadge}>{(idx + 1).toString().padStart(2, "0")}.</Text>
              <View style={styles.scrambledBox}>
                <Text style={styles.scrambledLetters}>{item.scrambled}</Text>
                {item.clue ? <Text style={styles.clueText}>{item.clue}</Text> : null}
              </View>
              <View style={styles.answerSection}>
                <View style={styles.blankLine}>
                  {showSolution && <Text style={styles.solutionText}>{item.original}</Text>}
                </View>
              </View>
            </View>
          ))}
        </View>
    </>
  );
};
