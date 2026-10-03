import React from "react";
import { Document, Page, StyleSheet } from "@react-pdf/renderer";
import type { ActivitySnapshot } from "@/lib/types/activities";
import { generateActivity, Generated } from "@/lib/activities/engine";
import { getActivity } from "@/lib/activities/catalog";
import { PdfFooter, PdfSheetHeader } from "./shared";
import { WordSearchBody } from "./WordSearchBody";
import { CrosswordBody } from "./CrosswordBody";
import { WordScrambleBody } from "./WordScrambleBody";
import { MatchingBody } from "./MatchingBody";
import { CryptogramBody } from "./CryptogramBody";
import { ClozeTestBody } from "./ClozeTestBody";
import { RoscoBody } from "./RoscoBody";
import { BingoBody } from "./BingoBody";
import { SudokuBody } from "./SudokuBody";
import { MathPyramidBody } from "./MathPyramidBody";
import { CrossMathBody } from "./CrossMathBody";
import { MathChainBody } from "./MathChainBody";
import { MazeBody } from "./MazeBody";
import { CoordinatePixelArtBody } from "./CoordinatePixelArtBody";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingHorizontal: 40,
    paddingBottom: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#0f172a",
  },
});

function ActivityBody({ gen, showSolution }: { gen: Generated; showSolution: boolean }) {
  switch (gen.type) {
    case "wordsearch":
      return <WordSearchBody result={gen.result} showSolution={showSolution} />;
    case "crossword":
      return <CrosswordBody result={gen.result} showSolution={showSolution} />;
    case "scramble":
      return <WordScrambleBody result={gen.result} showSolution={showSolution} />;
    case "matching":
      return <MatchingBody result={gen.result} showSolution={showSolution} />;
    case "cryptogram":
      return <CryptogramBody result={gen.result} showSolution={showSolution} />;
    case "cloze":
      return <ClozeTestBody result={gen.result} showSolution={showSolution} />;
    case "rosco":
      return <RoscoBody result={gen.result} showSolution={showSolution} />;
    case "bingo":
      return <BingoBody result={gen.result} showSolution={showSolution} />;
    case "sudoku":
      return <SudokuBody result={gen.result} showSolution={showSolution} />;
    case "mathpyramid":
      return <MathPyramidBody result={gen.result} showSolution={showSolution} />;
    case "crossmath":
      return <CrossMathBody result={gen.result} showSolution={showSolution} />;
    case "mathchain":
      return <MathChainBody result={gen.result} showSolution={showSolution} />;
    case "maze":
      return <MazeBody result={gen.result} showSolution={showSolution} />;
    case "pixelart":
      return <CoordinatePixelArtBody result={gen.result} showSolution={showSolution} />;
  }
}

export type PdfMode = "student" | "solution" | "both";

export interface PdfJob {
  snapshot: ActivitySnapshot;
  mode: PdfMode;
}

export function versionLabel(snap: ActivitySnapshot, copyIndex: number): string | undefined {
  if (snap.sheet.copies <= 1) return undefined;
  if (snap.type === "bingo") return `Cartón ${copyIndex + 1}`;
  return `Versión ${String.fromCharCode(65 + copyIndex)}`;
}

interface PageSpec {
  key: string;
  snap: ActivitySnapshot;
  gen: Generated;
  showSolution: boolean;
  label?: string;
}

function pagesForJob(job: PdfJob, jobIndex: number): PageSpec[] {
  const snap = job.snapshot;
  const copies = Math.max(1, snap.sheet.copies);
  const generated = Array.from({ length: copies }, (_, i) => generateActivity(snap, i));
  const student: PageSpec[] = generated.map((gen, i) => ({
    key: `${jobIndex}-s-${i}`,
    snap,
    gen,
    showSolution: false,
    label: versionLabel(snap, i),
  }));
  // El bingo tiene una sola lista para el docente, sin importar la cantidad de cartones.
  const solutionGens = snap.type === "bingo" ? generated.slice(0, 1) : generated;
  const solution: PageSpec[] = solutionGens.map((gen, i) => ({
    key: `${jobIndex}-r-${i}`,
    snap,
    gen,
    showSolution: true,
    label: snap.type === "bingo" ? undefined : versionLabel(snap, i),
  }));
  if (job.mode === "student") return student;
  if (job.mode === "solution") return solution;
  return [...student, ...solution];
}

/** Documento PDF con una o varias fichas (cada una con sus versiones y respuestas). */
export function ActivityDocument({ jobs, title }: { jobs: PdfJob[]; title: string }) {
  const pages = jobs.flatMap(pagesForJob);
  return (
    <Document title={title} author="GenAct" creator="GenAct" producer="GenAct">
      {pages.map((p) => {
        const meta = getActivity(p.snap.type);
        const instructions = p.snap.sheet.instructions.trim() || meta.defaultInstructions;
        return (
          <Page key={p.key} size={p.snap.sheet.pageSize} style={styles.page}>
            <PdfSheetHeader
              title={p.snap.title || meta.defaultTitle}
              header={p.snap.sheet.header}
              instructions={instructions}
              showSolution={p.showSolution}
              versionLabel={p.label}
            />
            <ActivityBody gen={p.gen} showSolution={p.showSolution} />
            <PdfFooter label={p.snap.sheet.header.schoolName || p.snap.title} />
          </Page>
        );
      })}
    </Document>
  );
}
