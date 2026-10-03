import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { MazeResult } from "@/lib/types/activities";

const styles = StyleSheet.create({
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
  result: MazeResult;
  showSolution?: boolean;
}

export const MazeBody = ({ result, showSolution = false }: Props) => {
  const cellSize = Math.min(32, Math.floor(440 / Math.max(result.width, result.height)));
  const solutionSet = new Set<string>();

  if (showSolution) {
    result.solutionPath.forEach(([r, c]) => {
      solutionSet.add(`${r},${c}`);
    });
  }

  return (
    <>
        <View style={styles.mazeWrapper}>
          <View style={[styles.labelsRow, { width: cellSize * result.width }]}>
            <Text style={styles.startLabel}>ENTRADA</Text>
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
          <View style={[styles.labelsRow, { width: cellSize * result.width, justifyContent: "flex-end", marginTop: 4 }]}>
            <Text style={styles.endLabel}>SALIDA</Text>
          </View>
        </View>
    </>
  );
};
