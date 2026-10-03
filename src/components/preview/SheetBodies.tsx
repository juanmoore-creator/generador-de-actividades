import React from "react";
import type { Generated } from "@/lib/activities/engine";
import type {
  BingoResult,
  ClozeResult,
  CrossMathResult,
  CryptogramResult,
  MatchingResult,
  MathChainResult,
  MathPyramidResult,
  MazeResult,
  PixelArtResult,
  RoscoResult,
  SudokuResult,
  WordScrambleResult,
} from "@/lib/types/activities";
import type { WordSearchResult } from "@/lib/generators/wordSearch";
import type { CrosswordResult } from "@/lib/generators/crossword";
import { sudokuSymbolText } from "@/lib/generators/sudoku";
import { COLUMN_LETTERS } from "@/lib/generators/coordinatePixelArt";
import { shapeFor } from "@/lib/shapes";

/*
 * Cuerpos HTML de la hoja. Están diseñados para una hoja de 794 px de ancho
 * (A4 a 96 ppp) y replican las proporciones del PDF: lo que se ve es lo que se imprime.
 * Los colores son fijos porque la hoja es siempre papel blanco.
 */

const SOL = "#dc2626";
const SOL_BG = "#fee2e2";

interface BodyProps<T> {
  result: T;
  showSolution: boolean;
}

function WordSearch({ result, showSolution }: BodyProps<WordSearchResult>) {
  const solution = new Set<string>();
  if (showSolution) {
    for (const w of result.placedWords) {
      for (let i = 0; i < w.word.length; i++) solution.add(`${w.y + w.direction[0] * i},${w.x + w.direction[1] * i}`);
    }
  }
  const cell = Math.round(Math.min(24, Math.max(14, Math.floor(460 / Math.max(result.size, 1)))) * 1.333);
  return (
    <div>
      <div className="mx-auto mb-8 w-fit" role="img" aria-label={`Sopa de letras de ${result.size} por ${result.size}`}>
        {result.grid.map((row, y) => (
          <div key={y} className="flex">
            {row.map((ch, x) => {
              const isSol = solution.has(`${y},${x}`);
              return (
                <div
                  key={x}
                  className="flex items-center justify-center border font-medium"
                  style={{
                    width: cell,
                    height: cell,
                    fontSize: cell * 0.52,
                    marginLeft: x ? -1 : 0,
                    marginTop: y ? -1 : 0,
                    borderColor: isSol ? SOL : "#cbd5e1",
                    background: isSol ? SOL_BG : "#fff",
                    color: isSol ? SOL : "#0f172a",
                    fontWeight: isSol ? 700 : 500,
                    position: isSol ? "relative" : undefined,
                  }}
                >
                  {ch}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="border-t border-slate-300 pt-5">
        <p className="mb-3 text-[16px] font-bold">Palabras a encontrar ({result.placedWords.length}):</p>
        <ul className="grid grid-cols-3 gap-x-4 gap-y-1.5 text-[14px] text-slate-700">
          {result.placedWords.map((w, i) => (
            <li key={i}>• {w.originalWord || w.word}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Crossword({ result, showSolution }: BodyProps<CrosswordResult>) {
  const maxDim = Math.max(result.width, result.height, 1);
  const cell = Math.round(Math.min(24, Math.max(14, Math.floor(460 / maxDim))) * 1.333);
  const h = result.words.filter((w) => w.direction === "H").sort((a, b) => a.number - b.number);
  const v = result.words.filter((w) => w.direction === "V").sort((a, b) => a.number - b.number);
  return (
    <div>
      <div className="mx-auto mb-7 w-fit">
        {result.grid.map((row, y) => (
          <div key={y} className="flex">
            {row.map((c, x) => (
              <div
                key={x}
                className="relative flex items-center justify-center"
                style={{
                  width: cell,
                  height: cell,
                  border: c.char ? "1.3px solid #0f172a" : "1.3px solid transparent",
                  marginLeft: x ? -1.3 : 0,
                  marginTop: y ? -1.3 : 0,
                  background: c.char ? "#fff" : "transparent",
                }}
              >
                {c.number && (
                  <span className="absolute top-0 left-0.5 font-bold text-slate-600" style={{ fontSize: cell * 0.32 }}>
                    {c.number}
                  </span>
                )}
                {showSolution && c.char && (
                  <span className="font-bold" style={{ color: SOL, fontSize: cell * 0.52 }}>
                    {c.char}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6 border-t border-slate-300 pt-4 text-[13px]">
        {[
          { title: "Horizontales", list: h },
          { title: "Verticales", list: v },
        ].map((col) => (
          <div key={col.title}>
            <p className="mb-2 text-[15px] font-bold">
              {col.title} ({col.list.length})
            </p>
            <ol className="space-y-1.5 text-slate-700">
              {col.list.length === 0 && <li>Ninguna</li>}
              {col.list.map((w) => (
                <li key={`${w.direction}${w.number}`}>
                  {w.number}. {w.clue || `Palabra de ${w.word.length} letras`}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}

function Scramble({ result, showSolution }: BodyProps<WordScrambleResult>) {
  return (
    <ol className="space-y-5">
      {result.items.map((item, i) => (
        <li key={i} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <span className="w-8 text-[13px] font-bold text-slate-400">{String(i + 1).padStart(2, "0")}.</span>
          <div className="flex-1">
            <p className="text-[20px] font-bold tracking-[0.3em]">{item.scrambled}</p>
            {item.clue && <p className="text-[12px] text-slate-500 italic">{item.clue}</p>}
          </div>
          <div className="flex h-7 w-48 items-end justify-center border-b-2 border-slate-700">
            {showSolution && <span className="text-[17px] font-bold tracking-widest" style={{ color: SOL }}>{item.original}</span>}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Matching({ result, showSolution }: BodyProps<MatchingResult>) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-[8%]">
        <div className="space-y-4">
          <p className="border-b-2 border-slate-400 pb-1 text-[16px] font-bold text-slate-700">Columna A</p>
          {result.pairs.map((p) => (
            <div key={p.id} className="flex min-h-[50px] items-center rounded-lg border border-slate-200 px-3 py-2 text-[14px]">
              <span className="mr-3 grid size-7 shrink-0 place-items-center rounded-full bg-slate-100 text-[12px] font-bold text-slate-600">
                {p.id}
              </span>
              <span className="flex-1">{p.leftText}</span>
              <span className="ml-2 size-2.5 rounded-full bg-slate-300" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <p className="border-b-2 border-slate-400 pb-1 text-[16px] font-bold text-slate-700">Columna B</p>
          {result.shuffledRight.map((r) => (
            <div key={r.id} className="flex min-h-[50px] items-center rounded-lg border border-slate-200 px-3 py-2 text-[14px]">
              <span className="mr-2 size-2.5 rounded-full bg-slate-300" />
              <span className="mr-3 grid size-7 shrink-0 place-items-center rounded-full bg-slate-100 text-[12px] font-bold text-slate-600">
                {r.label}
              </span>
              <span className="flex-1">{r.text}</span>
            </div>
          ))}
        </div>
      </div>
      {showSolution && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-[13px] text-red-900">
          <p className="mb-2 font-bold" style={{ color: SOL }}>
            Respuestas correctas
          </p>
          {result.solutions.map((s) => (
            <p key={s.leftId}>
              {s.leftId} - {s.rightLabel}: {s.text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function Cryptogram({ result, showSolution }: BodyProps<CryptogramResult>) {
  return (
    <div>
      {result.hint && (
        <p className="mb-5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[14px] text-slate-600">Pista: {result.hint}</p>
      )}
      <div className="mb-8 flex flex-wrap justify-center rounded-lg border border-slate-300 p-2">
        {result.cipherKey.map((k) => (
          <div key={k.letter} className="flex h-[50px] w-[37px] flex-col items-center justify-center border border-slate-200">
            <span className="text-[13px] font-bold">{k.letter}</span>
            <span className="w-full border-t border-slate-300 text-center text-[12px] text-slate-500">{k.code}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-5">
        {result.words.map((word, wi) => (
          <div key={wi} className="flex">
            {word.map((ch, ci) =>
              !ch.isLetter ? (
                <span key={ci} className="mx-0.5 mt-2 text-[19px] font-bold">
                  {ch.original}
                </span>
              ) : (
                <div key={ci} className="mx-[2px] flex w-[29px] flex-col items-center">
                  <span
                    className="flex h-[27px] w-[27px] items-end justify-center border-b-2 border-slate-800 text-[16px] font-bold"
                    style={{ color: showSolution && !ch.revealed ? SOL : "#0f172a" }}
                  >
                    {showSolution || ch.revealed ? ch.original : ""}
                  </span>
                  <span className="mt-1 text-[12px] font-bold text-slate-500">{ch.code}</span>
                </div>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Cloze({ result, showSolution }: BodyProps<ClozeResult>) {
  return (
    <div>
      {!showSolution && result.wordBank.length > 0 && (
        <div className="mb-8 rounded-lg border-2 border-dashed border-slate-300 p-4">
          <p className="mb-2 text-[13px] font-bold tracking-widest text-slate-500 uppercase">Banco de palabras</p>
          <div className="flex flex-wrap gap-2.5">
            {result.wordBank.map((w, i) => (
              <span key={i} className="rounded border border-slate-200 bg-slate-100 px-2.5 py-1 text-[15px] font-bold">
                {w}
              </span>
            ))}
          </div>
        </div>
      )}
      <p className="text-[16px] leading-[2.1] text-slate-800">
        {result.textWithBlanks.map((part, i) =>
          !part.isBlank ? (
            <span key={i}>{part.text}</span>
          ) : showSolution ? (
            <strong key={i} style={{ color: SOL }}>
              {` ${part.text} (${part.blankIndex}) `}
            </strong>
          ) : (
            <span key={i} className="text-slate-500">{` ______________ (${part.blankIndex}) `}</span>
          )
        )}
      </p>
      {showSolution && (
        <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-3 text-[13px] text-red-900">
          <p className="mb-1 font-bold" style={{ color: SOL }}>
            Respuestas
          </p>
          {result.solutions.map((s) => `(${s.index}) ${s.word}`).join("  •  ")}
        </div>
      )}
    </div>
  );
}

function Rosco({ result, showSolution }: BodyProps<RoscoResult>) {
  const mid = Math.ceil(result.items.length / 2);
  const cols = [result.items.slice(0, mid), result.items.slice(mid)];
  return (
    <div>
      <div className="mb-5 flex flex-wrap justify-center gap-1.5 rounded-lg border border-slate-300 p-2">
        {result.items.map((item, i) => (
          <span key={`${item.letter}${i}`} className="grid size-[23px] place-items-center rounded-full bg-slate-900 text-[12px] font-bold text-white">
            {item.letter}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-[4%]">
        {cols.map((col, ci) => (
          <div key={ci} className="space-y-2">
            {col.map((item, i) => (
              <div key={`${item.letter}${i}`} className="border-b border-slate-200 pb-1.5">
                <div className="mb-0.5 flex items-center gap-1.5">
                  <span className="rounded bg-slate-200 px-1.5 text-[11px] font-bold">{item.letter}</span>
                  <span className="text-[10.5px] text-slate-500 uppercase">
                    {item.prefixType === "starts" ? "Empieza por" : "Contiene"}
                  </span>
                </div>
                <p className="text-[11.5px] leading-snug text-slate-700">{item.clue}</p>
                {showSolution ? (
                  <p className="mt-0.5 text-[12px] font-bold" style={{ color: SOL }}>
                    {item.word}
                  </p>
                ) : (
                  <div className="mt-0.5 h-4 w-[70%] border-b border-slate-400" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Bingo({ result, showSolution }: BodyProps<BingoResult>) {
  if (showSolution) {
    return (
      <div>
        <p className="mb-3 text-[15px] font-bold">Lista para cantar ({result.callList.length} palabras)</p>
        {result.callList.map((item, i) => (
          <div key={i} className="flex items-start gap-3 border-b border-slate-200 py-2 text-[13px]">
            <span className="mt-0.5 size-3.5 shrink-0 border border-slate-500" />
            <span className="w-44 font-bold">{item.word}</span>
            <span className="flex-1 text-slate-600">{item.clue}</span>
          </div>
        ))}
      </div>
    );
  }
  const cell = Math.round(Math.min(110, Math.floor(440 / result.size)) * 1.333);
  const longest = Math.max(1, ...result.card.flat().map((w) => (w ? w.length : 0)));
  const fontSize = Math.max(8, Math.min(18, Math.floor((cell / 1.333) * 1.5 / longest), cell / 1.333 / 4)) * 1.333;
  return (
    <div className="mx-auto w-fit">
      {result.size === 5 && (
        <div className="mb-2 flex">
          {"BINGO".split("").map((l) => (
            <span key={l} className="text-center text-[29px] font-bold" style={{ width: cell }}>
              {l}
            </span>
          ))}
        </div>
      )}
      {result.card.map((row, r) => (
        <div key={r} className="flex">
          {row.map((w, c) => (
            <div
              key={c}
              className="flex items-center justify-center p-1.5 text-center font-bold break-words"
              style={{ width: cell, height: cell, border: "1.6px solid #0f172a", marginLeft: c ? -1.6 : 0, marginTop: r ? -1.6 : 0, fontSize }}
            >
              {w === null ? <span className="text-[15px] text-slate-500">LIBRE</span> : w}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ShapeSvg({ value, size, variant }: { value: number; size: number; variant: "given" | "solution" | "color" }) {
  const shape = shapeFor(value);
  const stroke = variant === "solution" ? SOL : variant === "color" ? shape.color : "#0f172a";
  const fill = variant === "solution" ? SOL_BG : variant === "color" ? `${shape.color}33` : "#e2e8f0";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={shape.name}>
      <path d={shape.path} stroke={stroke} strokeWidth={1.6} fill={fill} />
    </svg>
  );
}

function Sudoku({ result, showSolution }: BodyProps<SudokuResult>) {
  const cell = Math.round((result.size === 4 ? 64 : result.size === 6 ? 50 : 38) * 1.333);
  const fontSize = (result.size === 4 ? 26 : result.size === 6 ? 20 : 16) * 1.333;
  const isShapes = result.symbols === "shapes";
  return (
    <div className="flex flex-col items-center pt-3">
      <div>
        {result.solutionGrid.map((row, r) => (
          <div key={r} className="flex">
            {row.map((sol, c) => {
              const given = result.initialGrid[r][c] !== null;
              const isAnswer = showSolution && !given;
              return (
                <div
                  key={c}
                  className="flex items-center justify-center"
                  style={{
                    width: cell,
                    height: cell,
                    borderTop: `${r % result.subgridHeight === 0 ? 2.7 : 0.7}px solid #0f172a`,
                    borderLeft: `${c % result.subgridWidth === 0 ? 2.7 : 0.7}px solid #0f172a`,
                    borderBottom: r === result.size - 1 ? "2.7px solid #0f172a" : undefined,
                    borderRight: c === result.size - 1 ? "2.7px solid #0f172a" : undefined,
                    background: isAnswer ? SOL_BG : "#fff",
                  }}
                >
                  {(given || showSolution) &&
                    (isShapes ? (
                      <ShapeSvg value={sol} size={cell * 0.62} variant={isAnswer ? "solution" : "given"} />
                    ) : (
                      <span className="font-bold" style={{ fontSize, color: isAnswer ? SOL : "#0f172a" }}>
                        {sudokuSymbolText(sol, result.symbols)}
                      </span>
                    ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {isShapes && (
        <div className="mt-6 flex gap-5">
          {Array.from({ length: result.size }, (_, i) => (
            <ShapeSvg key={i} value={i + 1} size={21} variant="given" />
          ))}
        </div>
      )}
    </div>
  );
}

function MathPyramid({ result, showSolution }: BodyProps<MathPyramidResult>) {
  const scale = result.pyramids.length === 1 ? 1.5 : 1;
  const w = 44 * 1.333 * scale;
  const h = 30 * 1.333 * scale;
  return (
    <div className="flex flex-wrap justify-around gap-y-9">
      {result.pyramids.map((p, pi) => (
        <div key={p.id} className="flex flex-col items-center">
          {result.pyramids.length > 1 && <span className="mb-2 text-[13px] font-bold text-slate-500">{pi + 1}</span>}
          {p.grid.map((row, r) => (
            <div key={r} className="flex justify-center">
              {row.map((cellData, c) => {
                const missing = !cellData.revealed;
                const show = showSolution || cellData.revealed;
                return (
                  <div
                    key={c}
                    className="flex items-center justify-center font-bold"
                    style={{
                      width: w,
                      height: h,
                      border: `1.3px solid ${showSolution && missing ? SOL : "#334155"}`,
                      marginLeft: c ? -1.3 : 0,
                      marginTop: r ? -1.3 : 0,
                      background: showSolution && missing ? SOL_BG : cellData.revealed ? "#f1f5f9" : "#fff",
                      color: showSolution && missing ? SOL : "#0f172a",
                      fontSize: 15 * scale,
                    }}
                  >
                    {show ? p.solutionGrid[r][c] : ""}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function CrossMath({ result, showSolution }: BodyProps<CrossMathResult>) {
  const size = 44 * 1.333;
  return (
    <div className="flex justify-center pt-6">
      <div>
        {result.grid.map((row, r) => (
          <div key={r} className="flex">
            {row.map((c, ci) => {
              const base = { width: size, height: size, margin: 4 };
              if (c.type === "empty") return <div key={ci} style={base} />;
              if (c.type === "operator")
                return (
                  <div key={ci} style={base} className="flex items-center justify-center text-[24px] font-bold text-slate-500">
                    {c.value}
                  </div>
                );
              const isSol = showSolution && c.isBlank;
              return (
                <div
                  key={ci}
                  style={{
                    ...base,
                    border: `${c.isBlank ? 2.6 : 2}px solid ${isSol ? SOL : c.isBlank ? "#0284c7" : "#334155"}`,
                    background: isSol ? SOL_BG : c.isBlank ? "#f0f9ff" : "#fff",
                    color: isSol ? SOL : "#0f172a",
                  }}
                  className="flex items-center justify-center rounded-lg text-[21px] font-bold"
                >
                  {!c.isBlank || showSolution ? c.value : ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function MathChain({ result, showSolution }: BodyProps<MathChainResult>) {
  return (
    <div className="space-y-7">
      {result.chains.map((chain, i) => (
        <div key={i} className="flex flex-wrap items-center gap-y-2">
          <span className="w-5 text-[13px] font-bold text-slate-400">{i + 1}.</span>
          <span className="grid h-10 w-[51px] place-items-center rounded-md border-2 border-slate-900 bg-slate-200 text-[16px] font-bold">
            {chain.start}
          </span>
          {chain.steps.map((s, j) => (
            <React.Fragment key={j}>
              <span className="flex w-10 flex-col items-center">
                <span className="text-[13px] font-bold text-slate-600">
                  {s.op} {s.operand}
                </span>
                <span className="mt-0.5 w-7 border-b border-slate-500" />
              </span>
              <span
                className="grid h-10 w-[51px] place-items-center rounded-md border-2 text-[16px] font-bold"
                style={{
                  borderColor: showSolution ? SOL : "#0f172a",
                  background: showSolution ? SOL_BG : "#fff",
                  color: SOL,
                }}
              >
                {showSolution ? s.result : ""}
              </span>
            </React.Fragment>
          ))}
        </div>
      ))}
    </div>
  );
}

function Maze({ result, showSolution }: BodyProps<MazeResult>) {
  const cell = Math.min(32, Math.floor(440 / Math.max(result.width, result.height))) * 1.333;
  const path = new Set(showSolution ? result.solutionPath.map(([r, c]) => `${r},${c}`) : []);
  const wall = "2px solid #0f172a";
  return (
    <div className="flex flex-col items-center">
      <div style={{ width: cell * result.width }} className="mb-1 text-[13px] font-bold text-green-600">
        ENTRADA
      </div>
      <div>
        {result.grid.map((row, r) => (
          <div key={r} className="flex">
            {row.map((c, ci) => (
              <div
                key={ci}
                className="flex items-center justify-center"
                style={{
                  width: cell,
                  height: cell,
                  borderTop: c.north ? wall : "2px solid transparent",
                  borderBottom: c.south ? wall : "2px solid transparent",
                  borderLeft: c.west ? wall : "2px solid transparent",
                  borderRight: c.east ? wall : "2px solid transparent",
                  marginLeft: ci ? -2 : 0,
                  marginTop: r ? -2 : 0,
                  background: path.has(`${r},${ci}`) ? SOL_BG : undefined,
                }}
              >
                {path.has(`${r},${ci}`) && <span className="rounded-full" style={{ width: cell * 0.4, height: cell * 0.4, background: SOL }} />}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ width: cell * result.width }} className="mt-1 text-right text-[13px] font-bold" >
        <span style={{ color: SOL }}>SALIDA</span>
      </div>
    </div>
  );
}

function PixelArt({ result, showSolution }: BodyProps<PixelArtResult>) {
  const cell = 28 * 1.333;
  return (
    <div>
      <div className="mx-auto mb-6 w-fit">
        <div className="flex">
          <span style={{ width: 27 }} />
          {COLUMN_LETTERS.slice(0, result.cols)
            .split("")
            .map((l) => (
              <span key={l} className="text-center text-[12px] font-bold text-slate-500" style={{ width: cell }}>
                {l}
              </span>
            ))}
        </div>
        {result.grid.map((row, r) => (
          <div key={r} className="flex items-center">
            <span className="text-center text-[12px] font-bold text-slate-500" style={{ width: 27 }}>
              {r + 1}
            </span>
            {row.map((code, c) => (
              <span
                key={c}
                style={{
                  width: cell,
                  height: cell,
                  border: "0.7px solid #94a3b8",
                  marginLeft: c ? -0.7 : 0,
                  marginTop: r ? -0.7 : 0,
                  background: showSolution && code ? result.colorMap[code] : "#fff",
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-slate-300 p-3">
        <p className="mb-2 text-[13px] font-bold text-slate-700 uppercase">Colores y coordenadas</p>
        {result.instructions.map((inst) => (
          <div key={inst.colorCode} className="mb-2">
            <p className="flex items-center gap-2 text-[13px] font-bold">
              <span className="size-3.5 rounded-sm border border-slate-500" style={{ background: inst.hex }} />
              {inst.colorName}
            </p>
            <p className="pl-5 text-[12px] leading-relaxed text-slate-600">{inst.coordinates.join(", ")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SheetBody({ gen, showSolution }: { gen: Generated; showSolution: boolean }) {
  switch (gen.type) {
    case "wordsearch":
      return <WordSearch result={gen.result} showSolution={showSolution} />;
    case "crossword":
      return <Crossword result={gen.result} showSolution={showSolution} />;
    case "scramble":
      return <Scramble result={gen.result} showSolution={showSolution} />;
    case "matching":
      return <Matching result={gen.result} showSolution={showSolution} />;
    case "cryptogram":
      return <Cryptogram result={gen.result} showSolution={showSolution} />;
    case "cloze":
      return <Cloze result={gen.result} showSolution={showSolution} />;
    case "rosco":
      return <Rosco result={gen.result} showSolution={showSolution} />;
    case "bingo":
      return <Bingo result={gen.result} showSolution={showSolution} />;
    case "sudoku":
      return <Sudoku result={gen.result} showSolution={showSolution} />;
    case "mathpyramid":
      return <MathPyramid result={gen.result} showSolution={showSolution} />;
    case "crossmath":
      return <CrossMath result={gen.result} showSolution={showSolution} />;
    case "mathchain":
      return <MathChain result={gen.result} showSolution={showSolution} />;
    case "maze":
      return <Maze result={gen.result} showSolution={showSolution} />;
    case "pixelart":
      return <PixelArt result={gen.result} showSolution={showSolution} />;
  }
}

export { ShapeSvg };
