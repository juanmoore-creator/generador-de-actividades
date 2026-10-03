import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { PixelArtResult } from "@/lib/types/activities";

const styles = StyleSheet.create({
  page: { padding: 32, fontFamily: "Helvetica", fontSize: 10 },
  header: { marginBottom: 12, textAlign: "center" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 6, color: "#1e293b" },
  subtitle: { fontSize: 10, color: "#64748b", marginBottom: 6 },
  solutionTag: { fontSize: 11, color: "#dc2626", fontWeight: "bold", marginBottom: 6 },
  instruction: {
    fontSize: 10,
    color: "#475569",
    marginBottom: 16,
    backgroundColor: "#f8fafc",
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  gridWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 16,
  },
  row: {
    display: "flex",
    flexDirection: "row",
  },
  headerCell: {
    width: 22,
    height: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#64748b",
  },
  sideHeaderCell: {
    width: 20,
    height: 22,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cell: {
    width: 22,
    height: 22,
    borderWidth: 0.5,
    borderColor: "#94a3b8",
  },
  instructionsCard: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    padding: 10,
    backgroundColor: "#ffffff",
  },
  instTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  colorGroup: {
    marginBottom: 6,
  },
  colorHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  colorChip: {
    width: 10,
    height: 10,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: "#64748b",
  },
  colorTitle: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#0f172a",
  },
  coordsList: {
    fontSize: 8.5,
    color: "#475569",
    lineHeight: 1.4,
    paddingLeft: 16,
  },
});

interface Props {
  title: string;
  result: PixelArtResult;
  showSolution?: boolean;
}

export const CoordinatePixelArtPDF = ({ title, result, showSolution = false }: Props) => {
  const colLetters = "ABCDEFGHIJKLMN".split("").slice(0, result.cols);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title || "Pinta por Coordenadas"}</Text>
          <Text style={styles.subtitle}>
            Nombre: _________________________________________   Fecha: ________________
          </Text>
          {showSolution && <Text style={styles.solutionTag}>*** HOJA DE RESPUESTAS (SOLUCIÓN) ***</Text>}
        </View>

        <Text style={styles.instruction}>
          Instrucciones: Colorea cada casilla de la cuadrícula según las coordenadas indicadas en cada color para descubrir el dibujo sorpresa.
        </Text>

        <View style={styles.gridWrapper}>
          {/* Top Column Labels (A, B, C...) */}
          <View style={styles.row}>
            <View style={styles.sideHeaderCell} />
            {colLetters.map((l) => (
              <View key={l} style={styles.headerCell}>
                <Text style={styles.headerText}>{l}</Text>
              </View>
            ))}
          </View>

          {/* Grid Rows */}
          {result.grid.map((row, r) => (
            <View key={r} style={styles.row}>
              {/* Row number label */}
              <View style={styles.sideHeaderCell}>
                <Text style={styles.headerText}>{r + 1}</Text>
              </View>

              {row.map((colorCode, c) => {
                const hex = colorCode ? result.colorMap[colorCode] : "#ffffff";
                const bg = showSolution && colorCode ? hex : "#ffffff";

                return (
                  <View
                    key={`${r}-${c}`}
                    style={[styles.cell, { backgroundColor: bg }]}
                  />
                );
              })}
            </View>
          ))}
        </View>

        {/* Color Instructions List */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instTitle}>Guía de Colores y Coordenadas:</Text>
          {result.instructions.map((inst) => (
            <View key={inst.colorCode} style={styles.colorGroup}>
              <View style={styles.colorHeader}>
                <View style={[styles.colorChip, { backgroundColor: inst.hex }]} />
                <Text style={styles.colorTitle}>
                  {inst.colorName} ({inst.colorCode}):
                </Text>
              </View>
              <Text style={styles.coordsList}>
                {inst.coordinates.join(", ")}
              </Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};
