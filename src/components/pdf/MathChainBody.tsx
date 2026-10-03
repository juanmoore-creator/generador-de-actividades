import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { MathChainResult } from "@/lib/types/activities";
import { PDF_COLORS } from "./shared";

const styles = StyleSheet.create({
  list: { gap: 22 },
  chain: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", rowGap: 8 },
  index: { fontSize: 10, color: PDF_COLORS.faint, width: 16, fontFamily: "Helvetica-Bold" },
  box: {
    width: 38,
    height: 30,
    borderWidth: 1.4,
    borderColor: PDF_COLORS.ink,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  startBox: { backgroundColor: "#e2e8f0" },
  boxText: { fontSize: 12, fontFamily: "Helvetica-Bold", color: PDF_COLORS.ink },
  solutionText: { fontSize: 12, fontFamily: "Helvetica-Bold", color: PDF_COLORS.solution },
  link: { width: 30, alignItems: "center" },
  op: { fontSize: 10, fontFamily: "Helvetica-Bold", color: PDF_COLORS.muted },
  arrow: { width: 22, borderBottomWidth: 1, borderBottomColor: PDF_COLORS.muted, marginTop: 2 },
});

interface Props {
  result: MathChainResult;
  showSolution?: boolean;
}

export const MathChainBody = ({ result, showSolution = false }: Props) => (
  <View style={styles.list}>
    {result.chains.map((chain, i) => (
      <View key={i} style={styles.chain} wrap={false}>
        <Text style={styles.index}>{i + 1}.</Text>
        <View style={[styles.box, styles.startBox]}>
          <Text style={styles.boxText}>{chain.start}</Text>
        </View>
        {chain.steps.map((step, j) => (
          <React.Fragment key={j}>
            <View style={styles.link}>
              <Text style={styles.op}>
                {step.op} {step.operand}
              </Text>
              <View style={styles.arrow} />
            </View>
            <View style={[styles.box, showSolution ? { backgroundColor: PDF_COLORS.solutionBg, borderColor: PDF_COLORS.solution } : {}]}>
              {showSolution ? <Text style={styles.solutionText}>{step.result}</Text> : null}
            </View>
          </React.Fragment>
        ))}
      </View>
    ))}
  </View>
);
