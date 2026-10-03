import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { RoscoResult } from "@/lib/types/activities";

const styles = StyleSheet.create({
  page: { padding: 32, fontFamily: "Helvetica", fontSize: 10 },
  header: { marginBottom: 12, textAlign: "center" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 6, color: "#1e293b" },
  subtitle: { fontSize: 10, color: "#64748b", marginBottom: 6 },
  solutionTag: { fontSize: 11, color: "#dc2626", fontWeight: "bold", marginBottom: 6 },
  alphabetStrip: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 16,
    padding: 6,
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  letterBubble: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: "#2563eb",
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
    backgroundColor: "#dbeafe",
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  letterBadgeText: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#1d4ed8",
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
  solutionWord: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#dc2626",
    marginTop: 2,
  },
});

interface Props {
  title: string;
  result: RoscoResult;
  showSolution?: boolean;
}

export const RoscoPDF = ({ title, result, showSolution = false }: Props) => {
  const mid = Math.ceil(result.items.length / 2);
  const leftCol = result.items.slice(0, mid);
  const rightCol = result.items.slice(mid);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title || "El Gran Rosco de Palabras"}</Text>
          <Text style={styles.subtitle}>
            Nombre: _________________________________________   Fecha: ________________
          </Text>
          {showSolution && <Text style={styles.solutionTag}>*** HOJA DE RESPUESTAS (SOLUCIÓN) ***</Text>}
        </View>

        {/* Circular Alphabet Strip */}
        <View style={styles.alphabetStrip}>
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
              <View key={item.letter} style={styles.clueCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.letterBadge}>
                    <Text style={styles.letterBadgeText}>{item.letter}</Text>
                  </View>
                  <Text style={styles.prefixType}>
                    {item.prefixType === "starts" ? "Empieza por" : "Contiene"}
                  </Text>
                </View>
                <Text style={styles.clueText}>{item.clue}</Text>
                {showSolution && <Text style={styles.solutionWord}>R: {item.word}</Text>}
              </View>
            ))}
          </View>

          <View style={styles.column}>
            {rightCol.map((item) => (
              <View key={item.letter} style={styles.clueCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.letterBadge}>
                    <Text style={styles.letterBadgeText}>{item.letter}</Text>
                  </View>
                  <Text style={styles.prefixType}>
                    {item.prefixType === "starts" ? "Empieza por" : "Contiene"}
                  </Text>
                </View>
                <Text style={styles.clueText}>{item.clue}</Text>
                {showSolution && <Text style={styles.solutionWord}>R: {item.word}</Text>}
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};
