import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { MatchingResult } from "@/lib/types/activities";

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
  columnsContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  column: {
    width: "46%",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  colHeader: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#334155",
    borderBottomWidth: 1.5,
    borderBottomColor: "#94a3b8",
    paddingBottom: 4,
    marginBottom: 6,
  },
  itemRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    padding: 8,
    minHeight: 38,
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#475569",
  },
  itemText: {
    fontSize: 10.5,
    color: "#0f172a",
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#cbd5e1",
    marginLeft: 6,
  },
  solutionsBox: {
    marginTop: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fff1f2",
    borderRadius: 6,
  },
  solTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 6,
  },
  solRow: {
    fontSize: 10,
    color: "#991b1b",
    marginBottom: 3,
  },
});

interface Props {
  title: string;
  result: MatchingResult;
  showSolution?: boolean;
}

export const MatchingPDF = ({ title, result, showSolution = false }: Props) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title || "Une con Flechas"}</Text>
          <Text style={styles.subtitle}>
            Nombre: _________________________________________   Fecha: ________________
          </Text>
          {showSolution && <Text style={styles.solutionTag}>*** HOJA DE RESPUESTAS (SOLUCIÓN) ***</Text>}
        </View>

        <Text style={styles.instruction}>
          Instrucciones: Une mediante una línea recta cada elemento de la columna izquierda con su correspondiente definición en la columna derecha.
        </Text>

        <View style={styles.columnsContainer}>
          {/* Left Column */}
          <View style={styles.column}>
            <Text style={styles.colHeader}>Columna A</Text>
            {result.pairs.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.id}</Text>
                </View>
                <Text style={styles.itemText}>{item.leftText}</Text>
                <View style={styles.dot} />
              </View>
            ))}
          </View>

          {/* Right Column */}
          <View style={styles.column}>
            <Text style={styles.colHeader}>Columna B</Text>
            {result.shuffledRight.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.dot} />
                <View style={[styles.badge, { marginLeft: 6 }]}>
                  <Text style={styles.badgeText}>{item.label}</Text>
                </View>
                <Text style={styles.itemText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {showSolution && (
          <View style={styles.solutionsBox}>
            <Text style={styles.solTitle}>Respuestas Correctas:</Text>
            {result.solutions.map((sol) => (
              <Text key={sol.leftId} style={styles.solRow}>
                Elemento {sol.leftId} → Opción {sol.rightLabel} ({sol.text})
              </Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};
