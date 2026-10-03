import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { PixelArtResult } from "@/lib/types/activities";
import { COLUMN_LETTERS } from "@/lib/generators/coordinatePixelArt";

const styles = StyleSheet.create({
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
    width: 28,
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
    height: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cell: {
    width: 28,
    height: 28,
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
  result: PixelArtResult;
  showSolution?: boolean;
}

export const CoordinatePixelArtBody = ({ result, showSolution = false }: Props) => {
  const colLetters = COLUMN_LETTERS.split("").slice(0, result.cols);

  return (
    <>
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
          <Text style={styles.instTitle}>Colores y coordenadas</Text>
          {result.instructions.map((inst) => (
            <View key={inst.colorCode} style={styles.colorGroup}>
              <View style={styles.colorHeader}>
                <View style={[styles.colorChip, { backgroundColor: inst.hex }]} />
                <Text style={styles.colorTitle}>
                  {inst.colorName}
                </Text>
              </View>
              <Text style={styles.coordsList}>
                {inst.coordinates.join(", ")}
              </Text>
            </View>
          ))}
        </View>
    </>
  );
};
