import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { CrossMathResult } from "@/lib/types/activities";

const styles = StyleSheet.create({
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
  result: CrossMathResult;
  showSolution?: boolean;
}

export const CrossMathBody = ({ result, showSolution = false }: Props) => {
  return (
    <>
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
    </>
  );
};
