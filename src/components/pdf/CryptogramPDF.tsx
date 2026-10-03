import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { CryptogramResult } from "@/lib/types/activities";

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
  keyTable: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    padding: 6,
    backgroundColor: "#ffffff",
  },
  keyCell: {
    width: 28,
    height: 38,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
  },
  keyLetter: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
  },
  keyCode: {
    fontSize: 9,
    color: "#64748b",
    borderTopWidth: 0.5,
    borderTopColor: "#cbd5e1",
    width: "100%",
    textAlign: "center",
    paddingTop: 2,
  },
  messageContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    justifyContent: "center",
    marginTop: 10,
  },
  wordContainer: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 14,
  },
  charBox: {
    width: 22,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginHorizontal: 1.5,
  },
  letterSpace: {
    width: 20,
    height: 20,
    borderBottomWidth: 1.5,
    borderBottomColor: "#1e293b",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 3,
  },
  letterText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0f172a",
  },
  solutionLetterText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#dc2626",
  },
  codeLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#64748b",
  },
  punctuationBox: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 6,
    marginHorizontal: 2,
    color: "#1e293b",
  },
});

interface Props {
  title: string;
  result: CryptogramResult;
  showSolution?: boolean;
}

export const CryptogramPDF = ({ title, result, showSolution = false }: Props) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title || "Descifra el Mensaje Secreto"}</Text>
          <Text style={styles.subtitle}>
            Nombre: _________________________________________   Fecha: ________________
          </Text>
          {showSolution && <Text style={styles.solutionTag}>*** HOJA DE RESPUESTAS (SOLUCIÓN) ***</Text>}
        </View>

        <Text style={styles.instruction}>
          Instrucciones: Cada número corresponde a una letra del abecedario. Utiliza la clave de descifrado para revelar el mensaje oculto.
          {result.hint ? ` Pista: "${result.hint}"` : ""}
        </Text>

        {/* Decoder Key Table */}
        <View style={styles.keyTable}>
          {result.cipherKey.map((k) => (
            <View key={k.letter} style={styles.keyCell}>
              <Text style={styles.keyLetter}>{k.letter}</Text>
              <Text style={styles.keyCode}>{k.code}</Text>
            </View>
          ))}
        </View>

        {/* Coded Message */}
        <View style={styles.messageContainer}>
          {result.words.map((word, wIdx) => (
            <View key={wIdx} style={styles.wordContainer}>
              {word.map((char, cIdx) => {
                if (!char.isLetter) {
                  return (
                    <Text key={cIdx} style={styles.punctuationBox}>
                      {char.original}
                    </Text>
                  );
                }

                const showLetter = showSolution || char.revealed;

                return (
                  <View key={cIdx} style={styles.charBox}>
                    <View style={styles.letterSpace}>
                      {showLetter && (
                        <Text
                          style={
                            showSolution && !char.revealed
                              ? styles.solutionLetterText
                              : styles.letterText
                          }
                        >
                          {char.original}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.codeLabel}>{char.code}</Text>
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
