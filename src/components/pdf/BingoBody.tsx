import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { BingoResult } from "@/lib/types/activities";
import { PDF_COLORS } from "./shared";

const styles = StyleSheet.create({
  cardWrap: { alignItems: "center", marginTop: 8 },
  bingoTitle: { flexDirection: "row", marginBottom: 6 },
  bingoLetter: { fontSize: 22, fontFamily: "Helvetica-Bold", color: PDF_COLORS.ink, textAlign: "center" },
  row: { flexDirection: "row" },
  cell: {
    borderWidth: 1.2,
    borderColor: PDF_COLORS.ink,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  cellText: { fontFamily: "Helvetica-Bold", color: PDF_COLORS.ink, textAlign: "center" },
  free: { fontSize: 11, fontFamily: "Helvetica-Bold", color: PDF_COLORS.muted },
  listTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 8, color: PDF_COLORS.ink },
  listRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderBottomWidth: 0.5,
    borderBottomColor: PDF_COLORS.line,
    paddingVertical: 5,
  },
  check: { width: 10, height: 10, borderWidth: 1, borderColor: PDF_COLORS.muted, marginRight: 8, marginTop: 1 },
  word: { fontSize: 10, fontFamily: "Helvetica-Bold", width: 130, color: PDF_COLORS.ink },
  clue: { fontSize: 9.5, color: PDF_COLORS.muted, flex: 1 },
});

interface Props {
  result: BingoResult;
  showSolution?: boolean;
}

/** Alumno: cartón. Solución: lista para que el docente "cante" las palabras. */
export const BingoBody = ({ result, showSolution = false }: Props) => {
  if (showSolution) {
    return (
      <View>
        <Text style={styles.listTitle}>Lista para cantar ({result.callList.length} palabras)</Text>
        {result.callList.map((item, i) => (
          <View key={i} style={styles.listRow} wrap={false}>
            <View style={styles.check} />
            <Text style={styles.word}>{item.word}</Text>
            <Text style={styles.clue}>{item.clue}</Text>
          </View>
        ))}
      </View>
    );
  }

  const cellSize = Math.min(110, Math.floor(440 / result.size));
  const longest = Math.max(1, ...result.card.flat().map((w) => (w ? w.length : 0)));
  const fontSize = Math.max(8, Math.min(18, Math.floor((cellSize * 1.5) / longest), cellSize / 4));

  return (
    <View style={styles.cardWrap} wrap={false}>
      {result.size === 5 && (
        <View style={styles.bingoTitle}>
          {"BINGO".split("").map((l) => (
            <Text key={l} style={[styles.bingoLetter, { width: cellSize }]}>
              {l}
            </Text>
          ))}
        </View>
      )}
      {result.card.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((word, c) => (
            <View key={c} style={[styles.cell, { width: cellSize, height: cellSize }]}>
              {word === null ? (
                <Text style={styles.free}>LIBRE</Text>
              ) : (
                <Text style={[styles.cellText, { fontSize }]}>{word}</Text>
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};
