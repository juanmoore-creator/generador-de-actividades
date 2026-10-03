import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { WordScrambleResult } from "@/lib/types/activities";

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
  title: string;
  result: WordScrambleResult;
  showSolution?: boolean;
}

export const WordScramblePDF = ({ title, result, showSolution = false }: Props) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title || "Descifra las Palabras"}</Text>
          <Text style={styles.subtitle}>
            Nombre: _________________________________________   Fecha: ________________
          </Text>
          {showSolution && <Text style={styles.solutionTag}>*** HOJA DE RESPUESTAS (SOLUCIÓN) ***</Text>}
        </View>

        <Text style={styles.instruction}>
          Instrucciones: Ordena las letras de cada fila para formar la palabra correcta ayudándote con la pista.
        </Text>

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
      </Page>
    </Document>
  );
};
