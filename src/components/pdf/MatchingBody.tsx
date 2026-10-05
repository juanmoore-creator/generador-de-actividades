import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { MatchingResult } from "@/lib/types/activities";

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    marginBottom: 16,
  },
  headerRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  colHeader: {
    width: "47%",
    fontSize: 11,
    fontWeight: "bold",
    color: "#334155",
    borderBottomWidth: 1.5,
    borderBottomColor: "#94a3b8",
    paddingBottom: 3,
  },
  pairRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
  },
  card: {
    width: "47%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
  },
  badge: {
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontWeight: "bold",
    color: "#475569",
  },
  itemText: {
    color: "#0f172a",
    flex: 1,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#cbd5e1",
  },
  solutionsBox: {
    marginTop: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fff1f2",
    borderRadius: 6,
  },
  solTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 5,
  },
  solRow: {
    fontSize: 9,
    color: "#991b1b",
    marginBottom: 2.5,
  },
});

interface Props {
  result: MatchingResult;
  showSolution?: boolean;
}

export const MatchingBody = ({ result, showSolution = false }: Props) => {
  const count = result.pairs.length;
  // Adaptive density: scale down padding and fonts when many items exist
  const isCompact = count > 8;
  const isDense = count > 12;

  const cardPadding = isDense ? 4 : isCompact ? 5 : 7;
  const rowMarginBottom = isDense ? 5 : isCompact ? 7 : 10;
  const fontSize = isDense ? 8.5 : isCompact ? 9.5 : 10.5;
  const badgeSize = isDense ? 16 : isCompact ? 18 : 20;
  const badgeFontSize = isDense ? 7.5 : isCompact ? 8.5 : 9;
  const minHeight = isDense ? 26 : isCompact ? 30 : 36;

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow} wrap={false}>
        <Text style={styles.colHeader}>Columna A</Text>
        <Text style={styles.colHeader}>Columna B</Text>
      </View>

      {/* Synchronized Pair Rows - wrap={false} prevents any box from being sliced */}
      {result.pairs.map((leftItem, index) => {
        const rightItem = result.shuffledRight[index];
        return (
          <View
            key={leftItem.id}
            style={[styles.pairRow, { marginBottom: rowMarginBottom }]}
            wrap={false}
          >
            {/* Left Column Card */}
            <View
              style={[
                styles.card,
                {
                  padding: cardPadding,
                  minHeight,
                },
              ]}
            >
              <View
                style={[
                  styles.badge,
                  {
                    width: badgeSize,
                    height: badgeSize,
                    marginRight: isCompact ? 5 : 8,
                  },
                ]}
              >
                <Text style={[styles.badgeText, { fontSize: badgeFontSize }]}>
                  {leftItem.id}
                </Text>
              </View>
              <Text style={[styles.itemText, { fontSize }]}>
                {leftItem.leftText}
              </Text>
              <View style={[styles.dot, { marginLeft: 5 }]} />
            </View>

            {/* Right Column Card */}
            <View
              style={[
                styles.card,
                {
                  padding: cardPadding,
                  minHeight,
                },
              ]}
            >
              <View style={[styles.dot, { marginRight: 5 }]} />
              <View
                style={[
                  styles.badge,
                  {
                    width: badgeSize,
                    height: badgeSize,
                    marginRight: isCompact ? 5 : 8,
                  },
                ]}
              >
                <Text style={[styles.badgeText, { fontSize: badgeFontSize }]}>
                  {rightItem ? rightItem.label : ""}
                </Text>
              </View>
              <Text style={[styles.itemText, { fontSize }]}>
                {rightItem ? rightItem.text : ""}
              </Text>
            </View>
          </View>
        );
      })}

      {showSolution && (
        <View style={styles.solutionsBox} wrap={false}>
          <Text style={styles.solTitle}>Respuestas Correctas:</Text>
          {result.solutions.map((sol) => (
            <Text key={sol.leftId} style={styles.solRow}>
              {sol.leftId} - {sol.rightLabel}: {sol.text}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};
