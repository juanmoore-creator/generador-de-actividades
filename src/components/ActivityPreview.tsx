"use client";

import React, { useState } from "react";
import { WordSearchResult } from "@/lib/generators/wordSearch";
import { CrosswordResult } from "@/lib/generators/crossword";
import {
  ActivityType,
  WordScrambleResult,
  MatchingResult,
  CryptogramResult,
  ClozeResult,
  RoscoResult,
  SudokuResult,
  MathPyramidResult,
  CrossMathResult,
  MazeResult,
  PixelArtResult,
} from "@/lib/types/activities";
import {
  Printer,
  FileCheck2,
  AlertCircle,
  Loader2,
  CheckCircle2,
  FileText,
} from "lucide-react";

interface Props {
  type: ActivityType;
  title: string;
  wordSearchResult: WordSearchResult | null;
  crosswordResult: CrosswordResult | null;
  scrambleResult: WordScrambleResult | null;
  matchingResult: MatchingResult | null;
  cryptogramResult: CryptogramResult | null;
  clozeResult: ClozeResult | null;
  roscoResult: RoscoResult | null;
  sudokuResult: SudokuResult | null;
  mathPyramidResult: MathPyramidResult | null;
  crossMathResult: CrossMathResult | null;
  mazeResult: MazeResult | null;
  pixelArtResult: PixelArtResult | null;
}

export const ActivityPreview = ({
  type,
  title,
  wordSearchResult,
  crosswordResult,
  scrambleResult,
  matchingResult,
  cryptogramResult,
  clozeResult,
  roscoResult,
  sudokuResult,
  mathPyramidResult,
  crossMathResult,
  mazeResult,
  pixelArtResult,
}: Props) => {
  const [showSolution, setShowSolution] = useState(false);
  const [downloading, setDownloading] = useState<"activity" | "solution" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDownload = async (isSolution: boolean) => {
    const target = isSolution ? "solution" : "activity";
    setDownloading(target);
    setErrorMsg(null);

    try {
      const { pdf } = await import("@react-pdf/renderer");
      let doc: React.ReactElement | null = null;
      let defaultFileName = "Actividad";

      switch (type) {
        case "wordsearch": {
          if (!wordSearchResult || wordSearchResult.grid.length === 0) {
            throw new Error("No hay palabras suficientes para generar la sopa de letras.");
          }
          const { WordSearchPDF } = await import("./pdf/WordSearchPDF");
          doc = <WordSearchPDF title={title} result={wordSearchResult} showSolution={isSolution} />;
          defaultFileName = "Sopa_de_Letras";
          break;
        }
        case "crossword": {
          if (!crosswordResult || crosswordResult.words.length === 0) {
            throw new Error("No hay palabras válidas para generar el crucigrama.");
          }
          const { CrosswordPDF } = await import("./pdf/CrosswordPDF");
          doc = <CrosswordPDF title={title} result={crosswordResult} showSolution={isSolution} />;
          defaultFileName = "Crucigrama";
          break;
        }
        case "scramble": {
          if (!scrambleResult || scrambleResult.items.length === 0) {
            throw new Error("Agrega al menos una palabra para generar anagramas.");
          }
          const { WordScramblePDF } = await import("./pdf/WordScramblePDF");
          doc = <WordScramblePDF title={title} result={scrambleResult} showSolution={isSolution} />;
          defaultFileName = "Anagramas";
          break;
        }
        case "matching": {
          if (!matchingResult || matchingResult.pairs.length === 0) {
            throw new Error("Agrega palabras y definiciones para relacionar columnas.");
          }
          const { MatchingPDF } = await import("./pdf/MatchingPDF");
          doc = <MatchingPDF title={title} result={matchingResult} showSolution={isSolution} />;
          defaultFileName = "Relacionar_Columnas";
          break;
        }
        case "cryptogram": {
          if (!cryptogramResult || cryptogramResult.words.length === 0) {
            throw new Error("Escribe una frase para generar el criptograma.");
          }
          const { CryptogramPDF } = await import("./pdf/CryptogramPDF");
          doc = <CryptogramPDF title={title} result={cryptogramResult} showSolution={isSolution} />;
          defaultFileName = "Criptograma";
          break;
        }
        case "cloze": {
          if (!clozeResult || clozeResult.textWithBlanks.length === 0) {
            throw new Error("Escribe un texto para generar la actividad de huecos.");
          }
          const { ClozeTestPDF } = await import("./pdf/ClozeTestPDF");
          doc = <ClozeTestPDF title={title} result={clozeResult} showSolution={isSolution} />;
          defaultFileName = "Texto_Con_Huecos";
          break;
        }
        case "rosco": {
          if (!roscoResult || roscoResult.items.length === 0) {
            throw new Error("No hay preguntas para el rosco.");
          }
          const { RoscoPDF } = await import("./pdf/RoscoPDF");
          doc = <RoscoPDF title={title} result={roscoResult} showSolution={isSolution} />;
          defaultFileName = "Rosco_Palabras";
          break;
        }
        case "sudoku": {
          if (!sudokuResult) throw new Error("Error al calcular sudoku.");
          const { SudokuPDF } = await import("./pdf/SudokuPDF");
          doc = <SudokuPDF title={title} result={sudokuResult} showSolution={isSolution} />;
          defaultFileName = `Sudoku_${sudokuResult.size}x${sudokuResult.size}`;
          break;
        }
        case "mathpyramid": {
          if (!mathPyramidResult || mathPyramidResult.pyramids.length === 0) {
            throw new Error("Error al generar pirámides.");
          }
          const { MathPyramidPDF } = await import("./pdf/MathPyramidPDF");
          doc = <MathPyramidPDF title={title} result={mathPyramidResult} showSolution={isSolution} />;
          defaultFileName = "Piramide_Sumas";
          break;
        }
        case "crossmath": {
          if (!crossMathResult) throw new Error("Error al calcular crucigrama numérico.");
          const { CrossMathPDF } = await import("./pdf/CrossMathPDF");
          doc = <CrossMathPDF title={title} result={crossMathResult} showSolution={isSolution} />;
          defaultFileName = "Crucigrama_Numerico";
          break;
        }
        case "maze": {
          if (!mazeResult) throw new Error("Error al generar laberinto.");
          const { MazePDF } = await import("./pdf/MazePDF");
          doc = <MazePDF title={title} result={mazeResult} showSolution={isSolution} />;
          defaultFileName = "Laberinto";
          break;
        }
        case "pixelart": {
          if (!pixelArtResult) throw new Error("Error al generar pixel art.");
          const { CoordinatePixelArtPDF } = await import("./pdf/CoordinatePixelArtPDF");
          doc = <CoordinatePixelArtPDF title={title} result={pixelArtResult} showSolution={isSolution} />;
          defaultFileName = "Pixel_Art_Coordenadas";
          break;
        }
      }

      if (!doc) throw new Error("No se pudo generar el documento.");

      const filename = `${(title || defaultFileName).replace(/\s+/g, "_")}${isSolution ? "_Solucion" : ""}.pdf`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await pdf(doc as any).toBlob();
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

  const hasData = Boolean(
    (type === "wordsearch" && wordSearchResult && wordSearchResult.grid.length > 0) ||
    (type === "crossword" && crosswordResult && crosswordResult.words.length > 0) ||
    (type === "scramble" && scrambleResult && scrambleResult.items.length > 0) ||
    (type === "matching" && matchingResult && matchingResult.pairs.length > 0) ||
    (type === "cryptogram" && cryptogramResult && cryptogramResult.words.length > 0) ||
    (type === "cloze" && clozeResult && clozeResult.textWithBlanks.length > 0) ||
    (type === "rosco" && roscoResult && roscoResult.items.length > 0) ||
    (type === "sudoku" && sudokuResult) ||
    (type === "mathpyramid" && mathPyramidResult && mathPyramidResult.pyramids.length > 0) ||
    (type === "crossmath" && crossMathResult) ||
    (type === "maze" && mazeResult) ||
    (type === "pixelart" && pixelArtResult)
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Studio Canvas Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <FileCheck2 size={16} className="stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Pliego de Impresión A4
              <span className="text-[10px] font-normal text-slate-500 font-mono">
                210 × 297 mm
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Escalado óptico 1:1 para fotocopiado escolar
            </p>
          </div>
        </div>

        {/* Tactile Mode Switcher */}
        <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200/70 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowSolution(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer active:scale-[0.98] ${
              !showSolution
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Ficha Alumno
          </button>
          <button
            type="button"
            onClick={() => setShowSolution(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer active:scale-[0.98] flex items-center gap-1.5 ${
              showSolution
                ? "bg-slate-900 text-white shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Solucionario
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
          <AlertCircle size={15} className="shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Workbench Paper Canvas */}
      <div className="p-4 sm:p-7 rounded-2xl bg-slate-100/70 border border-slate-200/80 canvas-grid flex justify-center">
        {!hasData ? (
          <div className="paper-sheet rounded-xl p-12 w-full max-w-lg min-h-[460px] flex flex-col items-center justify-center text-center text-slate-400 border border-slate-200/60">
            <FileText size={36} className="stroke-[1.3] text-slate-300 mb-3" />
            <h4 className="text-sm font-semibold text-slate-700">Lienzo en espera de datos</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
              Configura las palabras o texto en el panel izquierdo para proyectar la hoja de actividades.
            </p>
          </div>
        ) : (
          /* Simulated Physical A4 Sheet */
          <div className="paper-sheet rounded-xl border border-slate-200/90 w-full max-w-xl p-7 sm:p-9 relative overflow-hidden transition-all duration-200">
            {/* Corner registration marks */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-slate-300 pointer-events-none" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-slate-300 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-3 h-2 border-b border-l border-slate-300 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-3 h-2 border-b border-r border-slate-300 pointer-events-none" />

            {/* Simulated Paper Header */}
            <div className="border-b border-slate-200 pb-4 mb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading tracking-tight leading-tight">
                    {title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-3 text-xs text-slate-500 font-medium">
                    <span>Nombre: __________________________________</span>
                    <span>Fecha: ____________</span>
                  </div>
                </div>

                {showSolution && (
                  <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                    <CheckCircle2 size={11} className="stroke-[2.5]" />
                    Solución
                  </span>
                )}
              </div>
            </div>

            {/* 1. Sopa de Letras */}
            {type === "wordsearch" && wordSearchResult && (
              <div className="flex flex-col items-center gap-5">
                <div
                  className="grid gap-1 p-2 bg-slate-50 rounded-xl border border-slate-200 inline-block shadow-2xs"
                  style={{ gridTemplateColumns: `repeat(${wordSearchResult.size}, minmax(0, 1fr))` }}
                >
                  {wordSearchResult.grid.map((row, r) =>
                    row.map((char, c) => {
                      const isSol =
                        showSolution &&
                        wordSearchResult.placedWords.some((w) =>
                          Array.from({ length: w.word.length }).some((_, i) => {
                            const py = w.y + w.direction[0] * i;
                            const px = w.x + w.direction[1] * i;
                            return py === r && px === c;
                          })
                        );

                      return (
                        <div
                          key={`${r}-${c}`}
                          className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center font-mono text-xs sm:text-sm font-bold rounded transition-colors ${
                            isSol
                              ? "bg-rose-600 text-white shadow-xs font-black"
                              : "bg-white text-slate-800 border border-slate-200/90"
                          }`}
                        >
                          {char}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Palabras a buscar */}
                <div className="w-full pt-4 border-t border-slate-100">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                    Palabras a encontrar:
                  </h4>
                  <div className="flex flex-wrap justify-center gap-2">
                    {wordSearchResult.placedWords.map((w, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-slate-100 text-slate-700 font-mono text-xs font-semibold rounded-md border border-slate-200/80"
                      >
                        {w.word}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Crucigrama */}
            {type === "crossword" && crosswordResult && (
              <div className="space-y-6">
                <div className="flex justify-center overflow-x-auto p-1">
                  <div
                    className="grid gap-0.5 p-2 bg-slate-100/70 rounded-xl border border-slate-200"
                    style={{
                      gridTemplateColumns: `repeat(${crosswordResult.width}, minmax(0, 1fr))`,
                    }}
                  >
                    {crosswordResult.grid.map((row, r) =>
                      row.map((cell, c) => {
                        if (!cell) {
                          return <div key={`${r}-${c}`} className="w-6 h-6 sm:w-7 sm:h-7" />;
                        }
                        return (
                          <div
                            key={`${r}-${c}`}
                            className={`relative w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center font-mono font-bold text-xs border ${
                              showSolution
                                ? "bg-rose-50 text-rose-700 border-rose-300 font-black"
                                : "bg-white text-slate-900 border-slate-300"
                            } rounded-xs shadow-2xs`}
                          >
                            {cell.number && (
                              <span className="absolute top-0.5 left-0.5 text-[8px] font-bold text-slate-400 leading-none">
                                {cell.number}
                              </span>
                            )}
                            {showSolution ? cell.char : ""}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Pistas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-800 pb-1 border-b border-slate-200">
                      Horizontales
                    </h4>
                    <ul className="space-y-1">
                      {crosswordResult.words
                        .filter((w) => w.direction === "H")
                        .map((w) => (
                          <li key={w.number} className="text-slate-600 leading-relaxed">
                            <strong className="text-slate-900">{w.number}.</strong> {w.clue || w.word}
                          </li>
                        ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-800 pb-1 border-b border-slate-200">
                      Verticales
                    </h4>
                    <ul className="space-y-1">
                      {crosswordResult.words
                        .filter((w) => w.direction === "V")
                        .map((w) => (
                          <li key={w.number} className="text-slate-600 leading-relaxed">
                            <strong className="text-slate-900">{w.number}.</strong> {w.clue || w.word}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Anagramas */}
            {type === "scramble" && scrambleResult && (
              <div className="space-y-3">
                {scrambleResult.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-md bg-slate-200/80 text-slate-700 font-mono font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-mono text-sm sm:text-base font-bold tracking-widest text-slate-900">
                          {item.scrambled}
                        </span>
                        {item.clue && (
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.clue}</p>
                        )}
                      </div>
                    </div>

                    <div className="min-w-[120px] text-right">
                      {showSolution ? (
                        <span className="font-mono text-sm font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded border border-rose-200">
                          {item.original}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono tracking-widest text-sm">
                          {"_ ".repeat(item.original.length)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 4. Relacionar Columnas */}
            {type === "matching" && matchingResult && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  {/* Columna A */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-200 pb-1">
                      Columna A
                    </span>
                    {matchingResult.pairs.map((p) => (
                      <div
                        key={p.id}
                        className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-900"
                      >
                        <span className="w-5 h-5 rounded bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                          {p.id}
                        </span>
                        <span className="truncate mx-2">{p.leftText}</span>
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                      </div>
                    ))}
                  </div>

                  {/* Columna B */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-200 pb-1">
                      Columna B
                    </span>
                    {matchingResult.shuffledRight.map((r) => (
                      <div
                        key={r.id}
                        className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs font-medium text-slate-700"
                      >
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        <span className="truncate mx-2">{r.text}</span>
                        <span className="w-5 h-5 rounded bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[10px]">
                          {r.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {showSolution && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
                    <strong className="block mb-1.5 font-bold">Solucionario de pares:</strong>
                    <div className="flex flex-wrap gap-2">
                      {matchingResult.solutions.map((s) => (
                        <span key={s.leftId} className="bg-white px-2 py-0.5 rounded border border-rose-200 font-mono font-semibold">
                          {s.leftId} ➔ {s.rightLabel}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 5. Criptograma */}
            {type === "cryptogram" && cryptogramResult && (
              <div className="space-y-5">
                <div className="flex flex-wrap gap-1 justify-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                  {cryptogramResult.cipherKey.map((k) => (
                    <div key={k.letter} className="flex flex-col items-center bg-white px-1.5 py-1 rounded border border-slate-200 text-xs">
                      <span className="font-bold text-slate-900">{k.letter}</span>
                      <span className="text-[10px] text-slate-400 font-mono border-t border-slate-100 pt-0.5 w-full text-center">
                        {k.code}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 justify-center py-3">
                  {cryptogramResult.words.map((word, wIdx) => (
                    <div key={wIdx} className="flex gap-1">
                      {word.map((char, cIdx) => {
                        if (!char.isLetter) {
                          return (
                            <span key={cIdx} className="self-end text-lg font-bold text-slate-900 pb-1">
                              {char.original}
                            </span>
                          );
                        }
                        const show = showSolution || char.revealed;
                        return (
                          <div key={cIdx} className="flex flex-col items-center">
                            <span
                              className={`w-6 h-6 flex items-center justify-center font-bold text-xs border-b-2 ${
                                show
                                  ? showSolution && !char.revealed
                                    ? "text-rose-700 font-black border-rose-500"
                                    : "text-slate-900 border-slate-900"
                                  : "border-slate-300"
                              }`}
                            >
                              {show ? char.original : ""}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 mt-1">{char.code}</span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Texto con Huecos */}
            {type === "cloze" && clozeResult && (
              <div className="space-y-4">
                {!showSolution && clozeResult.wordBank.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Banco de Palabras:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {clozeResult.wordBank.map((w, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-white rounded border border-slate-200 text-xs font-semibold text-slate-800">
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-sm leading-loose text-slate-800 p-2">
                  {clozeResult.textWithBlanks.map((part, idx) => {
                    if (!part.isBlank) return <span key={idx}>{part.text}</span>;
                    return (
                      <span
                        key={idx}
                        className={`inline-block px-2 mx-1 border-b-2 font-semibold ${
                          showSolution
                            ? "bg-rose-50 text-rose-700 border-rose-500 font-bold"
                            : "bg-slate-50 text-slate-400 border-slate-400"
                        }`}
                      >
                        {showSolution ? part.text : `_____ (${part.blankIndex})`}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 7. Rosco */}
            {type === "rosco" && roscoResult && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-1 justify-center p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {roscoResult.items.map((item) => (
                    <span
                      key={item.letter}
                      className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono font-bold text-[10px] flex items-center justify-center"
                    >
                      {item.letter}
                    </span>
                  ))}
                </div>

                <div className="max-h-[340px] overflow-y-auto space-y-2 pr-1">
                  {roscoResult.items.map((item) => (
                    <div key={item.letter} className="p-2 rounded-lg border border-slate-200 bg-white text-xs">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-blue-700">
                          [{item.letter}] {item.prefixType === "starts" ? "Empieza por" : "Contiene"}
                        </span>
                        {showSolution && (
                          <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            {item.word}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600">{item.clue}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. Sudoku */}
            {type === "sudoku" && sudokuResult && (
              <div className="flex justify-center py-2">
                <div
                  className="grid gap-0 bg-slate-900 p-0.5 rounded-lg shadow-sm border border-slate-900"
                  style={{
                    gridTemplateColumns: `repeat(${sudokuResult.size}, minmax(0, 1fr))`
                  }}
                >
                  {Array.from({ length: sudokuResult.size }, (_, r) =>
                    Array.from({ length: sudokuResult.size }, (_, c) => {
                      const initialVal = sudokuResult.initialGrid[r][c];
                      const solVal = sudokuResult.solutionGrid[r][c];
                      const isInitial = initialVal !== null;

                      const borderRight = (c + 1) % sudokuResult.subgridWidth === 0 && c !== sudokuResult.size - 1;
                      const borderBottom = (r + 1) % sudokuResult.subgridHeight === 0 && r !== sudokuResult.size - 1;

                      return (
                        <div
                          key={`${r}-${c}`}
                          className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-bold text-sm border border-slate-200 ${
                            borderRight ? "border-r-2 border-r-slate-900" : ""
                          } ${borderBottom ? "border-b-2 border-b-slate-900" : ""} ${
                            showSolution && !isInitial
                              ? "bg-rose-50 text-rose-700 font-black"
                              : isInitial
                              ? "bg-slate-100 text-slate-900"
                              : "bg-white text-slate-300"
                          }`}
                        >
                          {showSolution ? solVal : isInitial ? initialVal : ""}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* 9. Pirámides Matemáticas */}
            {type === "mathpyramid" && mathPyramidResult && (
              <div className="space-y-6">
                {mathPyramidResult.pyramids.map((pyramid, pIdx) => (
                  <div key={pyramid.id} className="flex flex-col items-center">
                    <span className="text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                      Pirámide #{pIdx + 1}
                    </span>
                    {pyramid.grid.map((row, rIdx) => (
                      <div key={rIdx} className="flex justify-center">
                        {row.map((cell, cIdx) => {
                          const solVal = pyramid.solutionGrid[rIdx][cIdx];
                          const isMissing = !cell.revealed;
                          const display = showSolution ? solVal : cell.revealed ? cell.value : "";

                          return (
                            <div
                              key={cIdx}
                              className={`w-11 h-8 sm:w-13 sm:h-9 border border-slate-700 flex items-center justify-center font-bold text-xs sm:text-sm ${
                                showSolution && isMissing
                                  ? "bg-rose-50 text-rose-700 font-black border-rose-500"
                                  : cell.revealed
                                  ? "bg-slate-100 text-slate-900"
                                  : "bg-white text-slate-900"
                              }`}
                            >
                              {display}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* 10. Crucigrama Numérico */}
            {type === "crossmath" && crossMathResult && (
              <div className="flex justify-center py-2">
                <div className="grid grid-cols-5 gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  {crossMathResult.grid.map((row, r) =>
                    row.map((cell, c) => {
                      if (cell.type === "empty") {
                        return <div key={`${r}-${c}`} className="w-9 h-9" />;
                      }
                      if (cell.type === "operator") {
                        return (
                          <div
                            key={`${r}-${c}`}
                            className="w-9 h-9 flex items-center justify-center font-bold text-base text-slate-500"
                          >
                            {cell.value}
                          </div>
                        );
                      }
                      const isBlank = cell.isBlank;
                      const showSol = showSolution && isBlank;
                      const val = showSol ? cell.value : !isBlank ? cell.value : "";

                      return (
                        <div
                          key={`${r}-${c}`}
                          className={`w-9 h-9 rounded-lg border flex items-center justify-center font-bold text-sm shadow-2xs ${
                            showSol
                              ? "bg-rose-50 text-rose-700 border-rose-400 font-black"
                              : isBlank
                              ? "bg-white border-blue-400 text-transparent"
                              : "bg-white border-slate-300 text-slate-900"
                          }`}
                        >
                          {val}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* 11. Laberinto */}
            {type === "maze" && mazeResult && (
              <div className="flex flex-col items-center py-2">
                <div className="flex justify-between w-60 text-xs font-bold mb-1">
                  <span className="text-emerald-700">⬇ ENTRADA</span>
                  <span className="text-rose-700">SALIDA ⬇</span>
                </div>
                <div className="inline-block bg-white border border-slate-900 p-0.5 rounded shadow-xs">
                  {mazeResult.grid.map((row, r) => (
                    <div key={r} className="flex">
                      {row.map((cell, c) => {
                        const isSol =
                          showSolution &&
                          mazeResult.solutionPath.some(([pr, pc]) => pr === r && pc === c);

                        return (
                          <div
                            key={`${r}-${c}`}
                            className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center"
                            style={{
                              borderTop: cell.north ? "1.5px solid #0f172a" : "none",
                              borderBottom: cell.south ? "1.5px solid #0f172a" : "none",
                              borderLeft: cell.west ? "1.5px solid #0f172a" : "none",
                              borderRight: cell.east ? "1.5px solid #0f172a" : "none",
                              backgroundColor: isSol ? "#ffe4e6" : "#ffffff",
                            }}
                          >
                            {isSol && <div className="w-1.5 h-1.5 rounded-full bg-rose-600" />}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 12. Pixel Art por Coordenadas */}
            {type === "pixelart" && pixelArtResult && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="inline-block bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="flex pl-5 mb-0.5">
                      {"ABCDEFGHIJKLMN"
                        .slice(0, pixelArtResult.cols)
                        .split("")
                        .map((l) => (
                          <span key={l} className="w-5 text-center text-[10px] font-bold text-slate-400">
                            {l}
                          </span>
                        ))}
                    </div>

                    {pixelArtResult.grid.map((row, r) => (
                      <div key={r} className="flex items-center">
                        <span className="w-5 text-[10px] font-bold text-slate-400 text-center">
                          {r + 1}
                        </span>
                        {row.map((colorCode, c) => {
                          const hex = colorCode ? pixelArtResult.colorMap[colorCode] : "#ffffff";
                          const bg = showSolution && colorCode ? hex : "#ffffff";

                          return (
                            <div
                              key={`${r}-${c}`}
                              className="w-5 h-5 border border-slate-300"
                              style={{ backgroundColor: bg }}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Guía de Colores y Coordenadas:
                  </h4>
                  {pixelArtResult.instructions.map((inst) => (
                    <div key={inst.colorCode} className="text-slate-700 leading-relaxed">
                      <span className="inline-flex items-center gap-1.5 font-bold mr-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-xs border border-slate-400"
                          style={{ backgroundColor: inst.hex }}
                        />
                        {inst.colorName}:
                      </span>
                      <span className="text-slate-500">{inst.coordinates.join(", ")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Footer with High-End Print Buttons */}
      {hasData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleDownload(false)}
            disabled={downloading !== null}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-semibold shadow-xs transition-all duration-150 cursor-pointer disabled:opacity-50"
          >
            {downloading === "activity" ? (
              <Loader2 size={15} className="animate-spin text-white" />
            ) : (
              <Printer size={15} />
            )}
            Descargar Ficha Alumno (PDF A4)
          </button>

          <button
            type="button"
            onClick={() => handleDownload(true)}
            disabled={downloading !== null}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-800 border border-slate-300 text-xs font-semibold shadow-xs transition-all duration-150 cursor-pointer disabled:opacity-50"
          >
            {downloading === "solution" ? (
              <Loader2 size={15} className="animate-spin text-slate-800" />
            ) : (
              <FileCheck2 size={15} className="text-slate-600" />
            )}
            Descargar Solucionario Docente (PDF A4)
          </button>
        </div>
      )}
    </div>
  );
};
