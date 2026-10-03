import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ClozeResult } from "@/lib/types/activities";

const styles = StyleSheet.create({
  page: { padding: 36, fontFamily: "Helvetica", fontSize: 11 },
  header: { marginBottom: 20, textAlign: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 8, color: "#1e293b" },
  subtitle: { fontSize: 11, color: "#64748b", marginBottom: 8 },
  solutionTag: { fontSize: 11, color: "#dc2626", fontWeight: "bold", marginBottom: 8 },
  instruction: {
    fontSize: 11,
    color: "#475569",
    marginBottom: 16,
    backgroundColor: "#f8fafc",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  wordBankCard: {
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    backgroundColor: "#ffffff",
  },
  wordBankTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#64748b",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  wordBankTags: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  wordTag: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  wordTagText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0f172a",
  },
  paragraphBox: {
    lineHeight: 2.2,
    fontSize: 12,
    color: "#1e293b",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  normalText: {
    fontSize: 12,
    color: "#1e293b",
  },
  blankUnderline: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#334155",
    paddingHorizontal: 4,
    marginHorizontal: 3,
  },
  blankStudent: {
    fontSize: 11,
    color: "#64748b",
  },
  blankSolution: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#dc2626",
  },
  solutionsSummary: {
    marginTop: 28,
    padding: 10,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fff1f2",
    borderRadius: 6,
  },
  solTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 4,
  },
  solItems: {
    fontSize: 10,
    color: "#991b1b",
    lineHeight: 1.5,
  },
});

interface Props {
  title: string;
  result: ClozeResult;
  showSolution?: boolean;
}

export const ClozeTestPDF = ({ title, result, showSolution = false }: Props) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title || "Completa el Texto"}</Text>
          <Text style={styles.subtitle}>
            Nombre: _________________________________________   Fecha: ________________
          </Text>
          {showSolution && <Text style={styles.solutionTag}>*** HOJA DE RESPUESTAS (SOLUCIÓN) ***</Text>}
        </View>

        <Text style={styles.instruction}>
          Instrucciones: Lee el texto con atención y completa cada uno de los espacios numerados utilizando las palabras del cuadro de opciones.
        </Text>

        {/* Word Bank Box */}
        {!showSolution && result.wordBank.length > 0 && (
          <View style={styles.wordBankCard}>
            <Text style={styles.wordBankTitle}>Banco de Palabras:</Text>
            <View style={styles.wordBankTags}>
              {result.wordBank.map((w, idx) => (
                <View key={idx} style={styles.wordTag}>
                  <Text style={styles.wordTagText}>{w}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Text with blanks */}
        <View style={styles.paragraphBox}>
          {result.textWithBlanks.map((part, idx) => {
            if (!part.isBlank) {
              return (
                <Text key={idx} style={styles.normalText}>
                  {part.text}
                </Text>
              );
            }

            return (
              <View key={idx} style={styles.blankUnderline}>
                {showSolution ? (
                  <Text style={styles.blankSolution}>
                    {part.text} ({part.blankIndex})
                  </Text>
                ) : (
                  <Text style={styles.blankStudent}>
                    _________________ ({part.blankIndex})
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {showSolution && (
          <View style={styles.solutionsSummary}>
            <Text style={styles.solTitle}>Solucionario de Respuestas:</Text>
            <Text style={styles.solItems}>
              {result.solutions
                .map((s) => `(${s.index}) ${s.word}`)
                .join("  •  ")}
            </Text>
          </View>
        )}
      </Page>
    </Document>
  );
};
