import { describe, expect, it } from "vitest";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { ActivityDocument } from "@/components/pdf/ActivityDocument";
import { ACTIVITIES } from "../activities/catalog";
import { createSnapshot } from "../activities/snapshot";

describe("PDF", () => {
  for (const meta of ACTIVITIES) {
    it(`renderiza ${meta.id} (alumno + respuestas, 2 versiones, Carta)`, async () => {
      const snap = createSnapshot(meta.id, { seed: 99 });
      snap.sheet = {
        ...snap.sheet,
        copies: 2,
        pageSize: "LETTER",
        header: { ...snap.sheet.header, schoolName: "Escuela Nº 1", showGrade: true, showScore: true },
      };
      const buf = await renderToBuffer(<ActivityDocument jobs={[{ snapshot: snap, mode: "both" }]} title="t" />);
      expect(buf.subarray(0, 4).toString()).toBe("%PDF");
    }, 30_000);
  }

  it("combina varias fichas en un documento", async () => {
    const jobs = (["sudoku", "wordsearch", "maze"] as const).map((t) => ({
      snapshot: createSnapshot(t, { seed: 5 }),
      mode: "student" as const,
    }));
    const buf = await renderToBuffer(<ActivityDocument jobs={jobs} title="pack" />);
    expect(buf.length).toBeGreaterThan(1000);
  }, 30_000);
});
