"use client";

import React, { useState } from "react";
import { WordSearchResult } from "@/lib/generators/wordSearch";
import { CrosswordResult } from "@/lib/generators/crossword";
import { Download, Eye, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface Props {
  type: "wordsearch" | "crossword";
  title: string;
  wordSearchResult: WordSearchResult | null;
  crosswordResult: CrosswordResult | null;
}

export const ActivityPreview = ({
  type,
  title,
  wordSearchResult,
  crosswordResult,
}: Props) => {
  const [showSolution, setShowSolution] = useState(false);
  const [downloading, setDownloading] = useState<"activity" | "solution" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDownload = async (isSolution: boolean) => {
    const target = isSolution ? "solution" : "activity";
    setDownloading(target);
    setErrorMsg(null);

    try {
      // Dynamic import to avoid SSR and React 19 reconciliation issues
      const { pdf } = await import("@react-pdf/renderer");

      let doc;
      let filename = "";

      if (type === "wordsearch") {
        if (!wordSearchResult || wordSearchResult.grid.length === 0) {
          throw new Error("No hay palabras suficientes para generar la sopa de letras.");
        }
        const { WordSearchPDF } = await import("./pdf/WordSearchPDF");
        doc = (
          <WordSearchPDF
            title={title}
            result={wordSearchResult}
            showSolution={isSolution}
          />
        );
        filename = `${(title || "Sopa_de_Letras").replace(/\s+/g, "_")}${isSolution ? "_Solucion" : ""}.pdf`;
      } else {
        if (!crosswordResult || crosswordResult.words.length === 0) {
          throw new Error("No hay palabras válidas para generar el crucigrama.");
        }
        const { CrosswordPDF } = await import("./pdf/CrosswordPDF");
        doc = (
          <CrosswordPDF
            title={title}
            result={crosswordResult}
            showSolution={isSolution}
          />
        );
        filename = `${(title || "Crucigrama").replace(/\s+/g, "_")}${isSolution ? "_Solucion" : ""}.pdf`;
      }

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      console.error("Error generating PDF:", err);
      const message = err instanceof Error ? err.message : "Error inesperado al generar el PDF";
      setErrorMsg(message);
    } finally {
      setDownloading(null);
    }
  };

  // Pre-calculate solution cells for word search
  const wordSearchSolutionCells = new Set<string>();
  if (type === "wordsearch" && wordSearchResult) {
    for (const w of wordSearchResult.placedWords) {
      for (let i = 0; i < w.word.length; i++) {
        const y = w.y + w.direction[0] * i;
        const x = w.x + w.direction[1] * i;
        wordSearchSolutionCells.add(`${y},${x}`);
      }
    }
  }

  const hasData =
    type === "wordsearch"
      ? wordSearchResult && wordSearchResult.grid.length > 0
      : crosswordResult && crosswordResult.words.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Eye className="text-blue-600" size={22} />
            Vista Previa de la Actividad
          </h2>
          <p className="text-xs text-slate-500">
            Comprobá en tiempo real cómo queda la cuadrícula antes de imprimir
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">
            <input
              type="checkbox"
              checked={showSolution}
              onChange={(e) => setShowSolution(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            Mostrar Solución
          </label>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {!hasData ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <FileText size={48} className="mb-3 opacity-40" />
          <p className="font-medium text-slate-600">Aún no hay suficiente contenido</p>
          <p className="text-xs text-slate-400 mt-1">
            Ingresá al menos 2 palabras válidas para armar la cuadrícula automáticamente
          </p>
        </div>
      ) : (
        <>
          {/* Grilla interactiva */}
          <div className="flex justify-center overflow-x-auto p-4 bg-slate-50/70 rounded-xl border border-slate-100 max-h-[460px] overflow-y-auto">
            {type === "wordsearch" && wordSearchResult && (
              <div
                className="inline-grid gap-[1px] bg-slate-200 p-[1px] rounded shadow-sm border border-slate-300"
                style={{
                  gridTemplateColumns: `repeat(${wordSearchResult.size}, minmax(0, 1fr))`,
                }}
              >
                {wordSearchResult.grid.map((row, y) =>
                  row.map((char, x) => {
                    const isSol = showSolution && wordSearchSolutionCells.has(`${y},${x}`);
                    return (
                      <div
                        key={`${y}-${x}`}
                        className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-semibold transition-colors ${
                          isSol
                            ? "bg-red-500 text-white font-bold"
                            : "bg-white text-slate-800"
                        }`}
                      >
                        {char}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {type === "crossword" && crosswordResult && (
              <div
                className="inline-grid gap-[1px] bg-slate-200 p-[1px] rounded shadow-sm border border-slate-300"
                style={{
                  gridTemplateColumns: `repeat(${crosswordResult.width}, minmax(0, 1fr))`,
                }}
              >
                {crosswordResult.grid.map((row, y) =>
                  row.map((cell, x) => {
                    if (!cell.char) {
                      return (
                        <div
                          key={`${y}-${x}`}
                          className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-100/60"
                        />
                      );
                    }
                    return (
                      <div
                        key={`${y}-${x}`}
                        className="w-7 h-7 sm:w-8 sm:h-8 relative flex items-center justify-center text-xs sm:text-sm font-bold bg-white text-slate-900 border border-slate-800"
                      >
                        {cell.number && (
                          <span className="absolute top-0.5 left-0.5 text-[9px] font-bold text-slate-500 leading-none">
                            {cell.number}
                          </span>
                        )}
                        <span className={showSolution ? "text-red-600" : "opacity-0"}>
                          {cell.char}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Estadísticas / resumen de palabras */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 bg-slate-50 px-4 py-2.5 rounded-lg border">
            {type === "wordsearch" && wordSearchResult && (
              <>
                <span>
                  Tamaño de cuadrícula: <strong>{wordSearchResult.size}x{wordSearchResult.size}</strong>
                </span>
                <span>
                  Palabras ubicadas:{" "}
                  <strong>{wordSearchResult.placedWords.length}</strong>
                </span>
                {wordSearchResult.unplacedWords.length > 0 && (
                  <span className="text-amber-600">
                    No entraron: {wordSearchResult.unplacedWords.join(", ")}
                  </span>
                )}
              </>
            )}

            {type === "crossword" && crosswordResult && (
              <>
                <span>
                  Dimensiones:{" "}
                  <strong>
                    {crosswordResult.width} x {crosswordResult.height}
                  </strong>
                </span>
                <span>
                  Palabras cruzadas: <strong>{crosswordResult.words.length}</strong>
                </span>
              </>
            )}
          </div>

          {/* Botones de Descarga */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => handleDownload(false)}
              disabled={downloading !== null}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-5 rounded-xl shadow-sm transition-all text-sm active:scale-[0.99] cursor-pointer"
            >
              {downloading === "activity" ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Generando PDF...</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span>Descargar PDF (Para Imprimir)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleDownload(true)}
              disabled={downloading !== null}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white font-semibold py-3 px-5 rounded-xl shadow-sm transition-all text-sm active:scale-[0.99] cursor-pointer"
            >
              {downloading === "solution" ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Generando Solución...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <span>Descargar Solución (PDF Docente)</span>
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
