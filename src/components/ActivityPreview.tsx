"use client";

import React, { useState } from "react";
import { WordSearchResult } from "@/lib/generators/wordSearch";
import { CrosswordResult } from "@/lib/generators/crossword";
import {
  Eye,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
  Printer,
} from "lucide-react";

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

  // Separate crossword clues
  const acrossWords = crosswordResult?.words.filter((w) => w.direction === "H") || [];
  const downWords = crosswordResult?.words.filter((w) => w.direction === "V") || [];

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-7 flex flex-col gap-6">
      {/* Encabezado del visor interactivo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-stone-900 font-heading flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-orange-100 text-orange-600">
                <Eye size={18} />
              </span>
              Vista Previa de la Ficha
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Comprobá en tiempo real la disposición exacta antes de imprimir
          </p>
        </div>

        {/* Selector de modo Alumno / Docente */}
        <div className="flex items-center p-1 bg-stone-100 rounded-2xl border border-stone-200/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowSolution(false)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !showSolution
                ? "bg-white text-stone-800 shadow-xs border border-stone-200/60"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            ✏️ Modo Alumno
          </button>
          <button
            type="button"
            onClick={() => setShowSolution(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              showSolution
                ? "bg-amber-100 text-amber-900 shadow-xs border border-amber-300 font-bold"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            💡 Solucionario
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2.5 p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs">
          <AlertCircle size={18} className="shrink-0 text-red-500" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {!hasData ? (
        <div className="flex flex-col items-center justify-center p-14 text-stone-400 bg-stone-50/70 rounded-2xl border-2 border-dashed border-stone-200 min-h-[380px]">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
            <FileText size={32} className="opacity-60" />
          </div>
          <p className="font-bold text-stone-700 text-sm">Esperando palabras...</p>
          <p className="text-xs text-stone-400 mt-1 max-w-xs text-center">
            Ingresá al menos 2 palabras válidas en el panel izquierdo para generar automáticamente la ficha.
          </p>
        </div>
      ) : (
        <>
          {/* Simulación de Hoja de Papel A4 Escolar */}
          <div className="bg-[#FCFBF9] rounded-2xl border border-stone-200 shadow-inner p-5 sm:p-7 relative overflow-hidden">
            {/* Encabezado escolar simulado */}
            <div className="border-b-2 border-dashed border-stone-200 pb-4 mb-5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/60">
                  {type === "wordsearch" ? "Sopa de Letras" : "Crucigrama Temático"}
                </span>
                {showSolution && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                    ★ Guía con Respuestas (Docente)
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-black text-stone-900 mt-1.5 font-heading">
                {title || "Actividad Escolar"}
              </h3>

              {/* Renglones para el alumno */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-[11px] text-stone-400 font-medium">
                <div className="border-b border-stone-200 pb-0.5 flex">
                  <span className="text-stone-500 font-semibold mr-1">Alumno/a:</span>
                  <span className="text-stone-300">________________________</span>
                </div>
                <div className="flex justify-between border-b border-stone-200 pb-0.5">
                  <div>
                    <span className="text-stone-500 font-semibold mr-1">Fecha:</span>
                    <span className="text-stone-300">__________</span>
                  </div>
                  <div>
                    <span className="text-stone-500 font-semibold mr-1">Curso:</span>
                    <span className="text-stone-300">______</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grilla interactiva centrada */}
            <div className="flex justify-center overflow-x-auto py-2 max-h-[460px] overflow-y-auto">
              {type === "wordsearch" && wordSearchResult && (
                <div
                  className="inline-grid gap-1 bg-stone-200/70 p-2 rounded-xl shadow-xs border border-stone-300/80"
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
                          className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-bold rounded-lg font-grid-letter transition-all ${
                            isSol
                              ? "bg-amber-400 text-stone-950 font-black shadow-xs ring-1 ring-amber-500 scale-[1.03]"
                              : "bg-white text-stone-800 shadow-2xs border border-stone-100"
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
                  className="inline-grid gap-[1px] bg-stone-300 p-[1px] rounded-lg shadow-xs border border-stone-400"
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
                            className="w-7 h-7 sm:w-8 sm:h-8 bg-stone-100/70"
                          />
                        );
                      }
                      return (
                        <div
                          key={`${y}-${x}`}
                          className="w-7 h-7 sm:w-8 sm:h-8 relative flex items-center justify-center text-xs sm:text-sm font-bold bg-white text-stone-900 border border-stone-800 font-grid-letter"
                        >
                          {cell.number && (
                            <span className="absolute top-0.5 left-0.5 text-[8.5px] font-black text-stone-500 leading-none">
                              {cell.number}
                            </span>
                          )}
                          <span
                            className={
                              showSolution
                                ? "text-teal-700 font-black"
                                : "opacity-0"
                            }
                          >
                            {cell.char}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Banco de palabras o pistas debajo de la cuadrícula */}
            <div className="mt-6 pt-4 border-t border-stone-200">
              {type === "wordsearch" && wordSearchResult && (
                <div>
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen size={14} className="text-orange-500" />
                    Palabras para encontrar ({wordSearchResult.placedWords.length}):
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {wordSearchResult.placedWords.map((item, idx) => (
                      <span
                        key={idx}
                        className={`text-xs px-2.5 py-1 rounded-lg font-mono font-bold tracking-wide transition-all ${
                          showSolution
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-white text-stone-700 border border-stone-200 shadow-2xs"
                        }`}
                      >
                        {item.word}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {type === "crossword" && crosswordResult && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {acrossWords.length > 0 && (
                    <div>
                      <h4 className="font-bold text-stone-800 uppercase tracking-wider mb-1.5 text-[11px] text-teal-700">
                        Horizontales (➡️)
                      </h4>
                      <div className="space-y-1 text-stone-600">
                        {acrossWords.map((w) => (
                          <div key={w.number} className="text-[11px] leading-tight">
                            <span className="font-bold text-stone-900">{w.number}.</span>{" "}
                            {w.clue || w.word}
                            {showSolution && (
                              <span className="ml-1 text-teal-700 font-bold font-mono">
                                ({w.word})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {downWords.length > 0 && (
                    <div>
                      <h4 className="font-bold text-stone-800 uppercase tracking-wider mb-1.5 text-[11px] text-teal-700">
                        Verticales (⬇️)
                      </h4>
                      <div className="space-y-1 text-stone-600">
                        {downWords.map((w) => (
                          <div key={w.number} className="text-[11px] leading-tight">
                            <span className="font-bold text-stone-900">{w.number}.</span>{" "}
                            {w.clue || w.word}
                            {showSolution && (
                              <span className="ml-1 text-teal-700 font-bold font-mono">
                                ({w.word})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Estadísticas de distribución */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600 bg-stone-50 px-4 py-2.5 rounded-2xl border border-stone-200/80">
            {type === "wordsearch" && wordSearchResult && (
              <>
                <span className="flex items-center gap-1 font-medium">
                  📐 Cuadrícula: <strong className="text-stone-900">{wordSearchResult.size}x{wordSearchResult.size}</strong>
                </span>
                <span className="flex items-center gap-1 font-medium">
                  🎯 Ubicadas:{" "}
                  <strong className="text-orange-700">
                    {wordSearchResult.placedWords.length}
                  </strong>
                </span>
                {wordSearchResult.unplacedWords.length > 0 && (
                  <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    ⚠️ No cupieron: {wordSearchResult.unplacedWords.join(", ")}
                  </span>
                )}
              </>
            )}

            {type === "crossword" && crosswordResult && (
              <>
                <span className="flex items-center gap-1 font-medium">
                  📐 Dimensiones:{" "}
                  <strong className="text-stone-900">
                    {crosswordResult.width} x {crosswordResult.height}
                  </strong>
                </span>
                <span className="flex items-center gap-1 font-medium">
                  🎯 Palabras cruzadas:{" "}
                  <strong className="text-teal-700">{crosswordResult.words.length}</strong>
                </span>
              </>
            )}
          </div>

          {/* Botones de Descarga de alta conversión con estilo EduLúdico */}
          <div className="pt-1 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => handleDownload(false)}
              disabled={downloading !== null}
              className="flex-1 flex items-center justify-center gap-2.5 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-50 text-white font-bold py-3.5 px-5 rounded-2xl shadow-sm hover:shadow transition-all text-xs sm:text-sm active:scale-[0.99] cursor-pointer"
            >
              {downloading === "activity" ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Preparando PDF de Alumno...</span>
                </>
              ) : (
                <>
                  <Printer size={18} />
                  <span>Descargar Ficha para Alumnos (PDF)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleDownload(true)}
              disabled={downloading !== null}
              className="flex-1 flex items-center justify-center gap-2.5 bg-stone-800 hover:bg-stone-900 disabled:opacity-50 text-white font-bold py-3.5 px-5 rounded-2xl shadow-sm hover:shadow transition-all text-xs sm:text-sm active:scale-[0.99] cursor-pointer"
            >
              {downloading === "solution" ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Preparando Solucionario...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <span>Descargar Solucionario (PDF Docente)</span>
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
