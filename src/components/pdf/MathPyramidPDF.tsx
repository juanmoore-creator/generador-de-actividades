import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { MathPyramidResult } from "@/lib/types/activities";

const styles = StyleSheet.create({
  page: { padding: 36, fontFamily: "Helvetica", fontSize: 11 },
  header: { marginBottom: 20, textAlign: "center" },
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
  pyramidsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    alignItems: "center",
  },
  pyramidCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 10,
  },
  pyramidNumber: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#64748b",
    marginBottom: 6,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  brick: {
    width: 48,
    height: 32,
    borderWidth: 1,
    borderColor: "#334155",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brickText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0f172a",
  },
  solutionText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#dc2626",
  },
});

interface Props {
  title: string;
  result: MathPyramidResult;
  showSolution?: boolean;
}

export const MathPyramidPDF = ({ title, result, showSolution = false }: Props) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title || "Pirámides de Sumas y Restas"}</Text>
          <Text style={styles.subtitle}>
            Nombre: _________________________________________   Fecha: ________________
          </Text>
          {showSolution && <Text style={styles.solutionTag}>*** HOJA DE RESPUESTAS (SOLUCIÓN) ***</Text>}
        </View>

        <Text style={styles.instruction}>
          Instrucciones: El valor de cada casilla superior es igual a la suma de las dos casillas directamente debajo de ella. Deduce los números que faltan.
        </Text>

        <View style={styles.pyramidsContainer}>
          {result.pyramids.map((pyramid, pIdx) => (
            <View key={pyramid.id} style={styles.pyramidCard}>
              <Text style={styles.pyramidNumber}>Pirámide #{pIdx + 1}</Text>
              {pyramid.grid.map((row, rIdx) => (
                <View key={rIdx} style={styles.row}>
                  {row.map((cell, cIdx) => {
                    const solValue = pyramid.solutionGrid[rIdx][cIdx];
                    const isMissing = !cell.revealed;
                    const displayValue = showSolution
                      ? solValue
                      : cell.revealed
                      ? cell.value
                      : "";

                    return (
                      <View
                        key={cIdx}
                        style={[
                          styles.brick,
                          {
                            backgroundColor:
                              showSolution && isMissing
                                ? "#fee2e2"
                                : cell.revealed
                                ? "#f1f5f9"
                                : "#ffffff",
                            borderColor: showSolution && isMissing ? "#dc2626" : "#334155",
                          },
                        ]}
                      >
                        <Text
                          style={
                            showSolution && isMissing
                              ? styles.solutionText
                              : styles.brickText
                          }
                        >
                          {displayValue}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};
