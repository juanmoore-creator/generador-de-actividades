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
  Eye,
  FileText,
  AlertCircle,
  Loader2,
  Printer,
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

  // Check if current activity has valid data
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
    <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-7 flex flex-col gap-6">
      {/* Encabezado del visor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-stone-900 font-heading flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-orange-100 text-orange-600">
                <Eye size={18} />
              </span>
              Vista Previa Interactiva
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Verifica la distribución y alterna entre la ficha del alumno y el solucionario
          </p>
        </div>

        {/* Selector de modo Alumno / Solución */}
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
            ✏️ Ficha Alumno
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
            🎯 Solucionario
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Área interactiva */}
      {!hasData ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-stone-200 rounded-2xl text-stone-400">
          <FileText size={40} className="stroke-[1.5] mb-2 text-stone-300" />
          <p className="text-sm font-semibold text-stone-600">Sin datos suficientes</p>
          <p className="text-xs text-stone-400 mt-1 max-w-xs">
            Ingresa palabras, pistas o texto en el panel izquierdo para previsualizar y descargar la ficha.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header de la ficha simulada */}
          <div className="text-center border-b border-stone-100 pb-3">
            <h3 className="text-xl font-black text-stone-900 font-heading tracking-tight">{title}</h3>
            <p className="text-xs text-stone-400 mt-1">Nombre: _________________________  Fecha: _________</p>
            {showSolution && (
              <span className="inline-block mt-2 px-2.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded-md tracking-wider">
                *** Modo Solución Activado ***
              </span>
            )}
          </div>

          {/* Renderizado específico por tipo de actividad */}

          {/* 1. Sopa de Letras */}
          {type === "wordsearch" && wordSearchResult && (
            <div className="flex flex-col items-center">
              <div
                className="grid gap-1 p-3 bg-stone-50 rounded-2xl border border-stone-200"
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
                        className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-mono text-xs sm:text-sm font-bold rounded-md transition-colors ${
                          isSol
                            ? "bg-red-500 text-white shadow-xs"
                            : "bg-white text-stone-800 border border-stone-200/80"
                        }`}
                      >
                        {char}
                      </div>
                    );
                  })
                )}
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-md">
                {wordSearchResult.placedWords.map((w, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-stone-100 text-stone-700 font-mono text-xs font-bold rounded-lg border border-stone-200"
                  >
                    {w.word}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 2. Crucigrama */}
          {type === "crossword" && crosswordResult && (
            <div className="space-y-6">
              <div className="flex justify-center overflow-x-auto p-2">
                <div
                  className="grid gap-0.5 p-3 bg-stone-100/60 rounded-2xl border border-stone-200"
                  style={{
                    gridTemplateColumns: `repeat(${crosswordResult.width}, minmax(0, 1fr))`,
                  }}
                >
                  {crosswordResult.grid.map((row, r) =>
                    row.map((cell, c) => {
                      if (!cell) {
                        return <div key={`${r}-${c}`} className="w-7 h-7 sm:w-8 sm:h-8" />;
                      }
                      return (
                        <div
                          key={`${r}-${c}`}
                          className={`relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-mono font-bold text-xs sm:text-sm border ${
                            showSolution
                              ? "bg-red-50 text-red-600 border-red-300 font-black"
                              : "bg-white text-stone-900 border-stone-300"
                          } rounded-xs shadow-2xs`}
                        >
                          {cell.number && (
                            <span className="absolute top-0.5 left-0.5 text-[8px] font-bold text-stone-500 leading-none">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h4 className="font-bold text-stone-800 mb-2 border-b border-stone-200 pb-1">
                    ➡️ Horizontales
                  </h4>
                  <ul className="space-y-1">
                    {crosswordResult.words
                      .filter((w) => w.direction === "H")
                      .map((w) => (
                        <li key={w.number} className="text-stone-600">
                          <strong>{w.number}.</strong> {w.clue || w.word}
                        </li>
                      ))}
                  </ul>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h4 className="font-bold text-stone-800 mb-2 border-b border-stone-200 pb-1">
                    ⬇️ Verticales
                  </h4>
                  <ul className="space-y-1">
                    {crosswordResult.words
                      .filter((w) => w.direction === "V")
                      .map((w) => (
                        <li key={w.number} className="text-stone-600">
                          <strong>{w.number}.</strong> {w.clue || w.word}
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
                  className="flex items-center justify-between p-3 bg-stone-50 rounded-2xl border border-stone-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-mono text-base font-extrabold tracking-widest text-stone-800">
                        {item.scrambled}
                      </span>
                      {item.clue && <p className="text-xs text-stone-500 mt-0.5">{item.clue}</p>}
                    </div>
                  </div>

                  <div className="min-w-[120px] text-right">
                    {showSolution ? (
                      <span className="font-mono text-sm font-extrabold text-red-600 bg-red-100 px-3 py-1 rounded-lg">
                        {item.original}
                      </span>
                    ) : (
                      <span className="text-stone-400 font-mono tracking-widest text-sm">
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
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Columna A */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Columna A
                  </h4>
                  {matchingResult.pairs.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs font-bold text-stone-800"
                    >
                      <span className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center text-[10px]">
                        {p.id}
                      </span>
                      <span className="truncate mx-2">{p.leftText}</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-stone-400" />
                    </div>
                  ))}
                </div>

                {/* Columna B */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Columna B
                  </h4>
                  {matchingResult.shuffledRight.map((r) => (
                    <div
                      key={r.id}
                      className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs font-medium text-stone-700"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-stone-400" />
                      <span className="truncate mx-2">{r.text}</span>
                      <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-[10px]">
                        {r.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {showSolution && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
                  <strong className="block mb-1">🎯 Respuestas:</strong>
                  <div className="flex flex-wrap gap-2">
                    {matchingResult.solutions.map((s) => (
                      <span key={s.leftId} className="bg-white px-2 py-1 rounded border border-red-200 font-mono">
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
              {/* Tabla de códigos */}
              <div className="flex flex-wrap gap-1.5 justify-center p-3 bg-stone-50 rounded-xl border border-stone-200">
                {cryptogramResult.cipherKey.map((k) => (
                  <div key={k.letter} className="flex flex-col items-center bg-white px-2 py-1 rounded border border-stone-200 text-xs">
                    <span className="font-bold text-stone-800">{k.letter}</span>
                    <span className="text-[10px] text-stone-400 font-mono border-t border-stone-100 pt-0.5 w-full text-center">
                      {k.code}
                    </span>
                  </div>
                ))}
              </div>

              {/* Mensaje */}
              <div className="flex flex-wrap gap-3 justify-center py-2">
                {cryptogramResult.words.map((word, wIdx) => (
                  <div key={wIdx} className="flex gap-1">
                    {word.map((char, cIdx) => {
                      if (!char.isLetter) {
                        return (
                          <span key={cIdx} className="self-end text-lg font-bold text-stone-800 pb-1">
                            {char.original}
                          </span>
                        );
                      }
                      const show = showSolution || char.revealed;
                      return (
                        <div key={cIdx} className="flex flex-col items-center">
                          <span
                            className={`w-6 h-6 flex items-center justify-center font-bold text-xs border-b-2 ${
                              show ? (showSolution && !char.revealed ? "text-red-600 font-black border-red-500" : "text-stone-800 border-stone-800") : "border-stone-400"
                            }`}
                          >
                            {show ? char.original : ""}
                          </span>
                          <span className="text-[10px] font-mono text-stone-500 mt-1">{char.code}</span>
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
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
                  <h4 className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-2">
                    Banco de Palabras:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {clozeResult.wordBank.map((w, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-white rounded-lg border border-amber-200 font-semibold text-xs text-stone-800">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-sm leading-loose text-stone-800">
                {clozeResult.textWithBlanks.map((part, idx) => {
                  if (!part.isBlank) return <span key={idx}>{part.text}</span>;
                  return (
                    <span
                      key={idx}
                      className={`inline-block px-2 py-0.5 mx-1 rounded border-b-2 font-semibold ${
                        showSolution
                          ? "bg-red-50 text-red-600 border-red-500"
                          : "bg-white text-stone-400 border-stone-400"
                      }`}
                    >
                      {showSolution ? part.text : `____ (${part.blankIndex})`}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* 7. Rosco */}
          {type === "rosco" && roscoResult && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5 justify-center p-2 bg-blue-50/60 rounded-2xl border border-blue-200/70">
                {roscoResult.items.map((item) => (
                  <span
                    key={item.letter}
                    className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center"
                  >
                    {item.letter}
                  </span>
                ))}
              </div>

              <div className="max-h-[360px] overflow-y-auto space-y-2 pr-1">
                {roscoResult.items.map((item) => (
                  <div key={item.letter} className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-blue-700">
                        [{item.letter}] {item.prefixType === "starts" ? "Empieza por" : "Contiene"}
                      </span>
                      {showSolution && (
                        <span className="font-mono font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">
                          {item.word}
                        </span>
                      )}
                    </div>
                    <p className="text-stone-600">{item.clue}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. Sudoku */}
          {type === "sudoku" && sudokuResult && (
            <div className="flex justify-center">
              <div
                className="grid gap-0 bg-stone-800 p-1 rounded-xl shadow-md"
                style={{
                  gridTemplateColumns: `repeat(${sudokuResult.size}, minmax(0, 1fr))`,
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
                        className={`w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center font-bold text-sm sm:text-base border border-stone-200 ${
                          borderRight ? "border-r-3 border-r-stone-900" : ""
                        } ${borderBottom ? "border-b-3 border-b-stone-900" : ""} ${
                          showSolution && !isInitial
                            ? "bg-red-50 text-red-600 font-extrabold"
                            : isInitial
                            ? "bg-stone-100 text-stone-900"
                            : "bg-white text-stone-400"
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
                  <span className="text-xs font-bold text-stone-400 mb-2">Pirámide #{pIdx + 1}</span>
                  {pyramid.grid.map((row, rIdx) => (
                    <div key={rIdx} className="flex justify-center">
                      {row.map((cell, cIdx) => {
                        const solVal = pyramid.solutionGrid[rIdx][cIdx];
                        const isMissing = !cell.revealed;
                        const display = showSolution ? solVal : cell.revealed ? cell.value : "";

                        return (
                          <div
                            key={cIdx}
                            className={`w-12 h-9 sm:w-14 sm:h-10 border border-stone-700 flex items-center justify-center font-bold text-xs sm:text-sm ${
                              showSolution && isMissing
                                ? "bg-red-50 text-red-600 font-black border-red-500"
                                : cell.revealed
                                ? "bg-stone-100 text-stone-800"
                                : "bg-white text-stone-900"
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
            <div className="flex justify-center">
              <div className="grid grid-cols-5 gap-2 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                {crossMathResult.grid.map((row, r) =>
                  row.map((cell, c) => {
                    if (cell.type === "empty") {
                      return <div key={`${r}-${c}`} className="w-10 h-10" />;
                    }
                    if (cell.type === "operator") {
                      return (
                        <div
                          key={`${r}-${c}`}
                          className="w-10 h-10 flex items-center justify-center font-bold text-lg text-stone-500"
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
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm shadow-xs ${
                          showSol
                            ? "bg-red-50 text-red-600 border-red-400 font-black"
                            : isBlank
                            ? "bg-sky-50 border-sky-300 text-transparent"
                            : "bg-white border-stone-300 text-stone-900"
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
            <div className="flex flex-col items-center">
              <div className="flex justify-between w-64 text-xs font-bold mb-1">
                <span className="text-emerald-600">⬇ ENTRADA</span>
                <span className="text-red-600">SALIDA ⬇</span>
              </div>
              <div className="inline-block bg-white border-2 border-stone-900 p-1 rounded-lg shadow-sm">
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
                            borderTop: cell.north ? "1.5px solid #1c1917" : "none",
                            borderBottom: cell.south ? "1.5px solid #1c1917" : "none",
                            borderLeft: cell.west ? "1.5px solid #1c1917" : "none",
                            borderRight: cell.east ? "1.5px solid #1c1917" : "none",
                            backgroundColor: isSol ? "#fee2e2" : "#ffffff",
                          }}
                        >
                          {isSol && <div className="w-1.5 h-1.5 rounded-full bg-red-600" />}
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
                <div className="inline-block bg-stone-50 p-3 rounded-2xl border border-stone-200">
                  {/* Header de columnas A, B, C... */}
                  <div className="flex pl-6 mb-1">
                    {"ABCDEFGHIJKLMN"
                      .slice(0, pixelArtResult.cols)
                      .split("")
                      .map((l) => (
                        <span key={l} className="w-6 text-center text-[10px] font-bold text-stone-500">
                          {l}
                        </span>
                      ))}
                  </div>

                  {pixelArtResult.grid.map((row, r) => (
                    <div key={r} className="flex items-center">
                      <span className="w-6 text-[10px] font-bold text-stone-500 text-center">
                        {r + 1}
                      </span>
                      {row.map((colorCode, c) => {
                        const hex = colorCode ? pixelArtResult.colorMap[colorCode] : "#ffffff";
                        const bg = showSolution && colorCode ? hex : "#ffffff";

                        return (
                          <div
                            key={`${r}-${c}`}
                            className="w-6 h-6 border border-stone-300 transition-colors"
                            style={{ backgroundColor: bg }}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Guía de instrucciones */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
                <h4 className="font-bold text-stone-700 uppercase tracking-wider text-[11px]">
                  Guía de Colores y Coordenadas:
                </h4>
                {pixelArtResult.instructions.map((inst) => (
                  <div key={inst.colorCode} className="text-stone-700">
                    <span className="inline-flex items-center gap-1.5 font-bold mr-2">
                      <span
                        className="w-3 h-3 rounded-xs border border-stone-400"
                        style={{ backgroundColor: inst.hex }}
                      />
                      {inst.colorName}:
                    </span>
                    <span className="text-stone-500">{inst.coordinates.join(", ")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botones de Descarga en PDF A4 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleDownload(false)}
              disabled={downloading !== null}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {downloading === "activity" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Printer size={16} />
              )}
              Descargar Ficha Alumno (PDF A4)
            </button>

            <button
              type="button"
              onClick={() => handleDownload(true)}
              disabled={downloading !== null}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-100 hover:bg-amber-200 active:scale-[0.98] text-amber-900 border border-amber-300 text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {downloading === "solution" ? (
                <Loader2 size={16} className="animate-spin text-amber-900" />
              ) : (
                <FileText size={16} />
              )}
              Descargar Solucionario (PDF A4)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
