import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { RoscoResult } from "@/lib/types/activities";

const styles = StyleSheet.create({
  alphabetStrip: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 16,
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  letterBubble: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  letterBubbleText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "bold",
  },
  columns: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    width: "48%",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  clueCard: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 4,
    display: "flex",
    flexDirection: "column",
  },
  cardHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  letterBadge: {
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  letterBadgeText: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#0f172a",
  },
  prefixType: {
    fontSize: 8,
    color: "#64748b",
    textTransform: "uppercase",
  },
  clueText: {
    fontSize: 8.5,
    color: "#334155",
    lineHeight: 1.3,
  },
  answerLine: {
    borderBottomWidth: 0.8,
    borderBottomColor: "#94a3b8",
    height: 12,
    width: "70%",
    marginTop: 2,
  },
  solutionWord: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#dc2626",
    marginTop: 2,
  },
});

interface Props {
  result: RoscoResult;
  showSolution?: boolean;
}

export const RoscoBody = ({ result, showSolution = false }: Props) => {
  const mid = Math.ceil(result.items.length / 2);
  const leftCol = result.items.slice(0, mid);
  const rightCol = result.items.slice(mid);

  return (
    <>
        {/* Circular Alphabet Strip */}
        <View style={styles.alphabetStrip} wrap={false}>
          {result.items.map((item) => (
            <View key={item.letter} style={styles.letterBubble}>
              <Text style={styles.letterBubbleText}>{item.letter}</Text>
            </View>
          ))}
        </View>

        {/* 2-Column Clues */}
        <View style={styles.columns}>
          <View style={styles.column}>
            {leftCol.map((item) => (
              <View key={item.letter} style={styles.clueCard} wrap={false}>
                <View style={styles.cardHeader}>
                  <View style={styles.letterBadge}>
                    <Text style={styles.letterBadgeText}>{item.letter}</Text>
                  </View>
                  <Text style={styles.prefixType}>
                    {item.prefixType === "starts" ? "Empieza por" : "Contiene"}
                  </Text>
                </View>
                <Text style={styles.clueText}>{item.clue}</Text>
                {showSolution ? (
                  <Text style={styles.solutionWord}>{item.word}</Text>
                ) : (
                  <View style={styles.answerLine} />
                )}
              </View>
            ))}
          </View>

          <View style={styles.column}>
            {rightCol.map((item) => (
              <View key={item.letter} style={styles.clueCard} wrap={false}>
                <View style={styles.cardHeader}>
                  <View style={styles.letterBadge}>
                    <Text style={styles.letterBadgeText}>{item.letter}</Text>
                  </View>
                  <Text style={styles.prefixType}>
                    {item.prefixType === "starts" ? "Empieza por" : "Contiene"}
                  </Text>
                </View>
                <Text style={styles.clueText}>{item.clue}</Text>
                {showSolution ? (
                  <Text style={styles.solutionWord}>{item.word}</Text>
                ) : (
                  <View style={styles.answerLine} />
                )}
              </View>
            ))}
          </View>
        </View>
    </>
  );
};
