import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { MathPyramidResult } from "@/lib/types/activities";

const styles = StyleSheet.create({
  pyramidsContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    rowGap: 28,
  },
  pyramidCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
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
    width: 44,
    height: 30,
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
  result: MathPyramidResult;
  showSolution?: boolean;
}

export const MathPyramidBody = ({ result, showSolution = false }: Props) => {
  // Con una sola pirámide se aprovecha la hoja con ladrillos más grandes.
  const scale = result.pyramids.length === 1 ? 1.5 : 1;
  return (
    <>
        <View style={styles.pyramidsContainer}>
          {result.pyramids.map((pyramid, pIdx) => (
            <View key={pyramid.id} style={styles.pyramidCard}>
              {result.pyramids.length > 1 && <Text style={styles.pyramidNumber}>{pIdx + 1}</Text>}
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
                            width: 44 * scale,
                            height: 30 * scale,
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
    </>
  );
};
