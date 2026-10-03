import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { SudokuResult } from "@/lib/types/activities";

const styles = StyleSheet.create({
  page: { padding: 36, fontFamily: "Helvetica", fontSize: 11 },
  header: { marginBottom: 20, textAlign: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 8, color: "#1e293b" },
  subtitle: { fontSize: 11, color: "#64748b", marginBottom: 8 },
  solutionTag: { fontSize: 11, color: "#dc2626", fontWeight: "bold", marginBottom: 8 },
  instruction: {
    fontSize: 11,
    color: "#475569",
    marginBottom: 24,
    backgroundColor: "#f8fafc",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  gridContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  row: {
    display: "flex",
    flexDirection: "row",
  },
});

interface Props {
  title: string;
  result: SudokuResult;
  showSolution?: boolean;
}

export const SudokuPDF = ({ title, result, showSolution = false }: Props) => {
  const cellSize = result.size === 4 ? 44 : result.size === 6 ? 34 : 26;
  const fontSize = result.size === 4 ? 20 : result.size === 6 ? 16 : 13;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title || `Sudoku ${result.size}x${result.size}`}</Text>
          <Text style={styles.subtitle}>
            Nombre: _________________________________________   Fecha: ________________
          </Text>
          {showSolution && <Text style={styles.solutionTag}>*** HOJA DE RESPUESTAS (SOLUCIÓN) ***</Text>}
        </View>

        <Text style={styles.instruction}>
          Instrucciones: Rellena las casillas vacías de modo que cada fila, cada columna y cada región de {result.subgridWidth}x{result.subgridHeight} contenga los números del 1 al {result.size} sin repetir.
        </Text>

        <View style={styles.gridContainer}>
          {Array.from({ length: result.size }, (_, r) => (
            <View key={r} style={styles.row}>
              {Array.from({ length: result.size }, (_, c) => {
                const initialVal = result.initialGrid[r][c];
                const solutionVal = result.solutionGrid[r][c];
                const isInitial = initialVal !== null;

                // Thicker borders for subgrids
                const borderTop = r % result.subgridHeight === 0 ? 2 : 0.5;
                const borderBottom = r === result.size - 1 ? 2 : 0.5;
                const borderLeft = c % result.subgridWidth === 0 ? 2 : 0.5;
                const borderRight = c === result.size - 1 ? 2 : 0.5;

                const valToDisplay = showSolution
                  ? solutionVal
                  : isInitial
                  ? initialVal
                  : "";

                return (
                  <View
                    key={`${r}-${c}`}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      borderTopWidth: borderTop,
                      borderBottomWidth: borderBottom,
                      borderLeftWidth: borderLeft,
                      borderRightWidth: borderRight,
                      borderColor: "#1e293b",
                      backgroundColor:
                        showSolution && !isInitial ? "#fee2e2" : isInitial ? "#f8fafc" : "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize,
                        fontWeight: isInitial ? "bold" : showSolution ? "bold" : "normal",
                        color: showSolution && !isInitial ? "#dc2626" : "#0f172a",
                      }}
                    >
                      {valToDisplay}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};
