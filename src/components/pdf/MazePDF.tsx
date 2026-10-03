import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { MazeResult } from "@/lib/types/activities";

const styles = StyleSheet.create({
  page: { padding: 36, fontFamily: "Helvetica", fontSize: 11 },
  header: { marginBottom: 16, textAlign: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 8, color: "#1e293b" },
  subtitle: { fontSize: 11, color: "#64748b", marginBottom: 8 },
  solutionTag: { fontSize: 11, color: "#dc2626", fontWeight: "bold", marginBottom: 8 },
  instruction: {
    fontSize: 11,
    color: "#475569",
    marginBottom: 20,
    backgroundColor: "#f8fafc",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  mazeWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  labelsRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: 320,
    marginBottom: 4,
  },
  startLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#16a34a",
  },
  endLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#dc2626",
    textAlign: "right",
  },
  row: {
    display: "flex",
    flexDirection: "row",
  },
});

interface Props {
  title: string;
  result: MazeResult;
  showSolution?: boolean;
}

export const MazePDF = ({ title, result, showSolution = false }: Props) => {
  const cellSize = Math.min(22, Math.floor(340 / Math.max(result.width, result.height)));
  const solutionSet = new Set<string>();

  if (showSolution) {
    result.solutionPath.forEach(([r, c]) => {
      solutionSet.add(`${r},${c}`);
    });
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title || "Aventura en el Laberinto"}</Text>
          <Text style={styles.subtitle}>
            Nombre: _________________________________________   Fecha: ________________
          </Text>
          {showSolution && <Text style={styles.solutionTag}>*** HOJA DE RESPUESTAS (SOLUCIÓN) ***</Text>}
        </View>

        <Text style={styles.instruction}>
          Instrucciones: Encuentra el camino correcto desde la Entrada (flecha verde superior) hasta la Salida (flecha roja inferior) sin atravesar las paredes.
        </Text>

        <View style={styles.mazeWrapper}>
          <View style={[styles.labelsRow, { width: cellSize * result.width }]}>
            <Text style={styles.startLabel}>⬇ ENTRADA</Text>
            <Text style={styles.endLabel}>SALIDA ⬇</Text>
          </View>

          {result.grid.map((row, r) => (
            <View key={r} style={styles.row}>
              {row.map((cell, c) => {
                const isPath = showSolution && solutionSet.has(`${r},${c}`);

                return (
                  <View
                    key={`${r}-${c}`}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      borderTopWidth: cell.north ? 1.5 : 0,
                      borderBottomWidth: cell.south ? 1.5 : 0,
                      borderLeftWidth: cell.west ? 1.5 : 0,
                      borderRightWidth: cell.east ? 1.5 : 0,
                      borderColor: "#0f172a",
                      backgroundColor: isPath ? "#fee2e2" : "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isPath && (
                      <View
                        style={{
                          width: cellSize * 0.45,
                          height: cellSize * 0.45,
                          borderRadius: cellSize * 0.22,
                          backgroundColor: "#dc2626",
                        }}
                      />
                    )}
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
