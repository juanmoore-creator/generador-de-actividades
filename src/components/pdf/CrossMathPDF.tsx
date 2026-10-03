import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { CrossMathResult } from "@/lib/types/activities";

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
    marginTop: 20,
  },
  row: {
    display: "flex",
    flexDirection: "row",
  },
  cell: {
    width: 44,
    height: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: 3,
  },
  numBox: {
    borderWidth: 1.5,
    borderColor: "#334155",
    borderRadius: 6,
    backgroundColor: "#ffffff",
  },
  blankBox: {
    borderWidth: 2,
    borderColor: "#0284c7",
    borderRadius: 6,
    backgroundColor: "#f0f9ff",
  },
  solutionBox: {
    borderWidth: 2,
    borderColor: "#dc2626",
    borderRadius: 6,
    backgroundColor: "#fee2e2",
  },
  operatorBox: {
    backgroundColor: "transparent",
  },
  numText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
  },
  solutionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#dc2626",
  },
  operatorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#64748b",
  },
});

interface Props {
  title: string;
  result: CrossMathResult;
  showSolution?: boolean;
}

export const CrossMathPDF = ({ title, result, showSolution = false }: Props) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title || "Crucigrama Numérico (Cross-Math)"}</Text>
          <Text style={styles.subtitle}>
            Nombre: _________________________________________   Fecha: ________________
          </Text>
          {showSolution && <Text style={styles.solutionTag}>*** HOJA DE RESPUESTAS (SOLUCIÓN) ***</Text>}
        </View>

        <Text style={styles.instruction}>
          Instrucciones: Rellena las casillas vacías con los números que hacen verdaderas todas las ecuaciones horizontales y verticales al mismo tiempo.
        </Text>

        <View style={styles.gridContainer}>
          {result.grid.map((row, r) => (
            <View key={r} style={styles.row}>
              {row.map((cell, c) => {
                if (cell.type === "empty") {
                  return <View key={`${r}-${c}`} style={styles.cell} />;
                }

                if (cell.type === "operator") {
                  return (
                    <View key={`${r}-${c}`} style={[styles.cell, styles.operatorBox]}>
                      <Text style={styles.operatorText}>{cell.value}</Text>
                    </View>
                  );
                }

                // Number cell
                const isBlank = cell.isBlank;
                const showSol = showSolution && isBlank;
                const displayVal = showSol ? cell.value : !isBlank ? cell.value : "";

                return (
                  <View
                    key={`${r}-${c}`}
                    style={[
                      styles.cell,
                      showSol
                        ? styles.solutionBox
                        : isBlank
                        ? styles.blankBox
                        : styles.numBox,
                    ]}
                  >
                    <Text style={showSol ? styles.solutionText : styles.numText}>
                      {displayVal}
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
