import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { CrosswordResult } from "@/lib/generators/crossword";

const styles = StyleSheet.create({
  page: { padding: 36, fontFamily: "Helvetica", fontSize: 10 },
  header: { marginBottom: 14, textAlign: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 8, color: "#1e293b" },
  subtitle: { fontSize: 11, color: "#64748b", marginBottom: 8 },
  solutionTag: { fontSize: 11, color: "#dc2626", fontWeight: "bold", marginBottom: 8 },
  grid: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 20,
  },
  row: { flexDirection: "row" },
  cluesSection: {
    borderTop: "1px solid #cbd5e1",
    paddingTop: 12,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  clueColumn: { width: "48%" },
  clueTitle: { fontSize: 11, fontWeight: "bold", marginBottom: 6, color: "#0f172a" },
  clueText: { fontSize: 9, marginBottom: 4, lineHeight: 1.3, color: "#334155" },
});

interface Props {
  title: string;
  result: CrosswordResult;
  showSolution?: boolean;
}

export const CrosswordPDF = ({ title, result, showSolution = false }: Props) => {
  const horizontal = result.words
    .filter((w) => w.direction === "H")
    .sort((a, b) => a.number - b.number);
  const vertical = result.words
    .filter((w) => w.direction === "V")
    .sort((a, b) => a.number - b.number);

  const maxDimension = Math.max(result.width, result.height, 1);
  const cellSize = Math.min(24, Math.max(14, Math.floor(460 / maxDimension)));
  const fontSize = Math.max(8, Math.floor(cellSize * 0.52));
  const numFontSize = Math.max(5, Math.floor(cellSize * 0.32));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title || "Crucigrama"}</Text>
          <Text style={styles.subtitle}>
            Nombre: _________________________________________   Fecha: ________________
          </Text>
          {showSolution && <Text style={styles.solutionTag}>*** HOJA DE RESPUESTAS (SOLUCIÓN) ***</Text>}
        </View>

        <View style={styles.grid}>
          {result.grid.map((row, y) => (
            <View key={y} style={styles.row}>
              {row.map((cell, x) => {
                if (!cell.char) {
                  return (
                    <View
                      key={`${y}-${x}`}
                      style={{
                        width: cellSize,
                        height: cellSize,
                        borderWidth: 1,
                        borderColor: "transparent",
                      }}
                    />
                  );
                }

                return (
                  <View
                    key={`${y}-${x}`}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      borderWidth: 1,
                      borderColor: "#0f172a",
                      backgroundColor: showSolution ? "#f8fafc" : "#ffffff",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {cell.number && (
                      <Text
                        style={{
                          position: "absolute",
                          top: 1,
                          left: 1,
                          fontSize: numFontSize,
                          color: "#475569",
                          fontWeight: "bold",
                        }}
                      >
                        {cell.number}
                      </Text>
                    )}
                    <Text
                      style={{
                        fontSize,
                        textAlign: "center",
                        color: showSolution ? "#dc2626" : "transparent",
                        fontWeight: showSolution ? "bold" : "normal",
                      }}
                    >
                      {showSolution ? cell.char : " "}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.cluesSection}>
          <View style={styles.clueColumn}>
            <Text style={styles.clueTitle}>Horizontales ({horizontal.length})</Text>
            {horizontal.length === 0 ? (
              <Text style={styles.clueText}>Ninguna</Text>
            ) : (
              horizontal.map((w) => (
                <Text key={w.number} style={styles.clueText}>
                  {w.number}. {w.clue || `Palabra de ${w.word.length} letras`}
                </Text>
              ))
            )}
          </View>
          <View style={styles.clueColumn}>
            <Text style={styles.clueTitle}>Verticales ({vertical.length})</Text>
            {vertical.length === 0 ? (
              <Text style={styles.clueText}>Ninguna</Text>
            ) : (
              vertical.map((w) => (
                <Text key={w.number} style={styles.clueText}>
                  {w.number}. {w.clue || `Palabra de ${w.word.length} letras`}
                </Text>
              ))
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
};
