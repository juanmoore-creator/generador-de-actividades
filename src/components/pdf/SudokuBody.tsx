import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { SudokuResult } from "@/lib/types/activities";
import { sudokuSymbolText } from "@/lib/generators/sudoku";
import { PDF_COLORS, PdfShape } from "./shared";

const styles = StyleSheet.create({
  gridContainer: { alignItems: "center", marginTop: 10 },
  row: { flexDirection: "row" },
  legend: { flexDirection: "row", justifyContent: "center", gap: 14, marginTop: 18 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendText: { fontSize: 9, color: PDF_COLORS.muted },
});

interface Props {
  result: SudokuResult;
  showSolution?: boolean;
}

export const SudokuBody = ({ result, showSolution = false }: Props) => {
  const cellSize = result.size === 4 ? 64 : result.size === 6 ? 50 : 38;
  const fontSize = result.size === 4 ? 26 : result.size === 6 ? 20 : 16;
  const isShapes = result.symbols === "shapes";

  return (
    <>
      <View style={styles.gridContainer}>
        {Array.from({ length: result.size }, (_, r) => (
          <View key={r} style={styles.row}>
            {Array.from({ length: result.size }, (_, c) => {
              const initialVal = result.initialGrid[r][c];
              const solutionVal = result.solutionGrid[r][c];
              const isInitial = initialVal !== null;
              const showValue = isInitial || showSolution;
              const isAnswer = showSolution && !isInitial;

              return (
                <View
                  key={`${r}-${c}`}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    borderTopWidth: r % result.subgridHeight === 0 ? 2 : 0.5,
                    borderBottomWidth: r === result.size - 1 ? 2 : 0,
                    borderLeftWidth: c % result.subgridWidth === 0 ? 2 : 0.5,
                    borderRightWidth: c === result.size - 1 ? 2 : 0,
                    borderColor: PDF_COLORS.ink,
                    backgroundColor: isAnswer ? PDF_COLORS.solutionBg : "#ffffff",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {showValue &&
                    (isShapes ? (
                      <PdfShape value={solutionVal} size={cellSize * 0.62} variant={isAnswer ? "solution" : "given"} />
                    ) : (
                      <Text
                        style={{
                          fontSize,
                          fontFamily: "Helvetica-Bold",
                          color: isAnswer ? PDF_COLORS.solution : PDF_COLORS.ink,
                        }}
                      >
                        {sudokuSymbolText(solutionVal, result.symbols)}
                      </Text>
                    ))}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {isShapes && (
        <View style={styles.legend}>
          {Array.from({ length: result.size }, (_, i) => (
            <View key={i} style={styles.legendItem}>
              <PdfShape value={i + 1} size={16} variant="given" />
            </View>
          ))}
        </View>
      )}
    </>
  );
};
