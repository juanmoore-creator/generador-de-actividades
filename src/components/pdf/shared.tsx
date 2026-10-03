import React from "react";
import { Path, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import type { SheetHeaderOptions } from "@/lib/types/activities";
import { shapeFor } from "@/lib/shapes";

export const PDF_COLORS = {
  ink: "#0f172a",
  muted: "#475569",
  faint: "#94a3b8",
  line: "#cbd5e1",
  solution: "#dc2626",
  solutionBg: "#fee2e2",
};

const styles = StyleSheet.create({
  school: {
    fontSize: 8.5,
    color: PDF_COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: { fontSize: 20, fontFamily: "Helvetica-Bold", color: PDF_COLORS.ink, flexGrow: 1, flexShrink: 1 },
  badges: { flexDirection: "row", gap: 6, marginLeft: 8 },
  badge: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 3,
  },
  fields: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    columnGap: 16,
    rowGap: 8,
  },
  field: { flexDirection: "row", alignItems: "flex-end" },
  fieldLabel: { fontSize: 10, color: PDF_COLORS.muted, marginRight: 4 },
  fieldLine: { borderBottomWidth: 0.8, borderBottomColor: PDF_COLORS.faint, height: 12 },
  instructions: {
    fontSize: 10.5,
    color: PDF_COLORS.ink,
    marginTop: 12,
    lineHeight: 1.4,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: PDF_COLORS.line, marginTop: 12, marginBottom: 18 },
  footer: {
    position: "absolute",
    bottom: 18,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: PDF_COLORS.faint,
  },
});

function Field({ label, width }: { label: string; width: number }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.fieldLine, { width }]} />
    </View>
  );
}

export interface PdfHeaderProps {
  title: string;
  header: SheetHeaderOptions;
  instructions: string;
  showSolution: boolean;
  versionLabel?: string;
}

/** Encabezado escolar de la hoja: el mismo que se ve en la vista previa. */
export function PdfSheetHeader({ title, header, instructions, showSolution, versionLabel }: PdfHeaderProps) {
  const hasFields = header.showName || header.showDate || header.showGrade || header.showScore;
  return (
    <View>
      {header.schoolName ? <Text style={styles.school}>{header.schoolName}</Text> : null}
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.badges}>
          {versionLabel ? (
            <Text style={[styles.badge, { backgroundColor: "#e2e8f0", color: PDF_COLORS.ink }]}>{versionLabel}</Text>
          ) : null}
          {showSolution ? (
            <Text style={[styles.badge, { backgroundColor: PDF_COLORS.solutionBg, color: PDF_COLORS.solution }]}>
              RESPUESTAS
            </Text>
          ) : null}
        </View>
      </View>
      {hasFields && !showSolution ? (
        <View style={styles.fields}>
          {header.showName ? <Field label="Nombre:" width={210} /> : null}
          {header.showDate ? <Field label="Fecha:" width={80} /> : null}
          {header.showGrade ? <Field label="Curso:" width={60} /> : null}
          {header.showScore ? <Field label="Nota:" width={50} /> : null}
        </View>
      ) : null}
      {instructions && !showSolution ? <Text style={styles.instructions}>{instructions}</Text> : null}
      <View style={styles.divider} />
    </View>
  );
}

export function PdfFooter({ label }: { label: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text>{label}</Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

/** Figura de sudoku infantil: las pistas en gris y las respuestas en rojo. */
export function PdfShape({ value, size, variant }: { value: number; size: number; variant: "given" | "solution" }) {
  const shape = shapeFor(value);
  const isSolution = variant === "solution";
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d={shape.path}
        stroke={isSolution ? PDF_COLORS.solution : PDF_COLORS.ink}
        strokeWidth={1.6}
        fill={isSolution ? PDF_COLORS.solutionBg : "#e2e8f0"}
      />
    </Svg>
  );
}
