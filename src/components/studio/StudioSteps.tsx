"use client";

import React from "react";
import { AlertTriangle, CircleAlert, Info, Wand2 } from "lucide-react";
import type { ChainOperator, Difficulty, PageSize, RoscoLetterItem, SudokuSymbols } from "@/lib/types/activities";
import { DIFFICULTY_LABELS } from "@/lib/activities/catalog";
import { MAX_COPIES } from "@/lib/activities/snapshot";
import { PIXEL_TEMPLATES } from "@/lib/generators/coordinatePixelArt";
import { autoWordSearchSize, WORDSEARCH_MAX_SIZE, WORDSEARCH_MIN_SIZE } from "@/lib/generators/wordSearch";
import { bingoCellsNeeded } from "@/lib/generators/bingo";
import type { Issue } from "@/lib/activities/engine";
import { Segmented } from "@/components/ui/Segmented";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { ShapeSvg } from "@/components/preview/SheetBodies";
import { useStudio } from "./StudioContext";
import { WordListEditor } from "./WordListEditor";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Avisos
// ---------------------------------------------------------------------------

export function IssuesList({ issues, compact }: { issues: Issue[]; compact?: boolean }) {
  const { dispatch, regenerate } = useStudio();
  if (issues.length === 0) return null;
  const styles = {
    error: { box: "bg-danger-soft text-danger-ink", Icon: CircleAlert },
    warning: { box: "bg-warn-soft text-warn-ink", Icon: AlertTriangle },
    info: { box: "bg-accent-soft text-accent-ink", Icon: Info },
  } as const;
  return (
    <ul className="space-y-2" aria-label="Avisos sobre la ficha">
      {issues.map((issue, i) => {
        const { box, Icon } = styles[issue.level];
        return (
          <li key={i} className={cn("flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-sm", box)}>
            <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span className="flex-1">{issue.message}</span>
            {issue.fix && !compact && (
              <button
                type="button"
                onClick={() => {
                  const fix = issue.fix!;
                  if (fix.kind === "setWordSearchSize") dispatch({ type: "patch", patch: { wordSearchSize: fix.size } });
                  else regenerate();
                }}
                className="-my-1 shrink-0 rounded-lg px-2 py-1 font-semibold underline underline-offset-2 hover:no-underline cursor-pointer"
              >
                {issue.fix.label}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Paso: Contenido
// ---------------------------------------------------------------------------

export function ContentStep() {
  const { snapshot: s, meta, dispatch } = useStudio();
  const patch = (p: Partial<typeof s>) => dispatch({ type: "patch", patch: p });
  const suggestTitle = (title: string) => {
    if (s.title === meta.defaultTitle || !s.title.trim()) patch({ title });
  };

  switch (meta.content) {
    case "words":
      return (
        <WordListEditor
          items={s.items}
          onChange={(items) => patch({ items })}
          clues={s.type === "bingo" ? "optional" : "none"}
          minItems={s.type === "bingo" ? bingoCellsNeeded(s.bingoSize, s.bingoFreeCenter) : meta.minItems}
          onTitleSuggestion={suggestTitle}
        />
      );
    case "words-clues":
      return (
        <WordListEditor
          items={s.items}
          onChange={(items) => patch({ items })}
          clues={meta.clues ?? "optional"}
          minItems={meta.minItems}
          onTitleSuggestion={suggestTitle}
        />
      );
    case "cryptogram":
      return (
        <div className="space-y-4">
          <Field label="Mensaje secreto" hint="Las tildes se quitan automáticamente; la Ñ se conserva.">
            {(p) => (
              <Textarea
                {...p}
                rows={4}
                value={s.cryptoPhrase}
                onChange={(e) => patch({ cryptoPhrase: e.target.value })}
                placeholder="Escribe la frase que tus alumnos van a descifrar"
                className="font-mono uppercase"
              />
            )}
          </Field>
          <Field label="Pista" optional>
            {(p) => <Input {...p} value={s.cryptoHint} onChange={(e) => patch({ cryptoHint: e.target.value })} placeholder="Ej.: Curiosidades del espacio" />}
          </Field>
        </div>
      );
    case "cloze":
      return <ClozeEditor />;
    case "rosco":
      return <RoscoEditor />;
    default:
      return null;
  }
}

function ClozeEditor() {
  const { snapshot: s, dispatch } = useStudio();
  const ref = React.useRef<HTMLTextAreaElement>(null);

  // Envuelve la selección actual entre corchetes.
  const markSelection = () => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b, value } = el;
    if (a === b) return;
    const next = `${value.slice(0, a)}[${value.slice(a, b).trim()}]${value.slice(b)}`;
    dispatch({ type: "patch", patch: { clozeText: next } });
    requestAnimationFrame(() => el.focus());
  };

  const blanks = (s.clozeText.match(/\[[^\]]+\]/g) || []).length;

  return (
    <div className="space-y-3">
      <p className="rounded-xl bg-accent-soft px-3.5 py-3 text-sm text-accent-ink">
        Escribe o pega el texto y pon entre corchetes las palabras que quieres ocultar: <code className="font-mono">[palabra]</code>.
        También puedes seleccionar una palabra y tocar «Ocultar selección».
      </p>
      <Field label="Texto" hint={`${blanks} ${blanks === 1 ? "hueco marcado" : "huecos marcados"}`}>
        {(p) => (
          <Textarea {...p} ref={ref} rows={9} value={s.clozeText} onChange={(e) => dispatch({ type: "patch", patch: { clozeText: e.target.value } })} />
        )}
      </Field>
      <Button size="sm" variant="secondary" onMouseDown={(e) => e.preventDefault()} onClick={markSelection} icon={<Wand2 className="size-4" aria-hidden />}>
        Ocultar selección
      </Button>
    </div>
  );
}

function RoscoEditor() {
  const { snapshot: s, dispatch } = useStudio();
  const update = (index: number, patch: Partial<RoscoLetterItem>) =>
    dispatch({
      type: "patch",
      patch: { roscoItems: s.roscoItems.map((it, i) => (i === index ? { ...it, ...patch } : it)) },
    });

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-3">Una definición por letra. Deja vacías las letras que no quieras incluir.</p>
      <ol className="space-y-2">
        {s.roscoItems.map((item, i) => (
          <li key={`${item.letter}-${i}`} className="rounded-xl border border-line bg-surface-2/60 p-2.5">
            <div className="mb-2 flex items-center gap-2">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary font-bold text-on-primary">{item.letter}</span>
              <Segmented
                label={`Tipo de pista para la ${item.letter}`}
                hideLabel
                size="sm"
                className="flex-1"
                value={item.prefixType}
                onChange={(v) => update(i, { prefixType: v })}
                options={[
                  { value: "starts", label: "Empieza por" },
                  { value: "contains", label: "Contiene" },
                ]}
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
              <label className="sr-only" htmlFor={`rosco-w-${i}`}>
                Respuesta para la {item.letter}
              </label>
              <Input
                id={`rosco-w-${i}`}
                value={item.word}
                onChange={(e) => update(i, { word: e.target.value.toUpperCase() })}
                placeholder="RESPUESTA"
                className="font-mono font-semibold uppercase"
              />
              <label className="sr-only" htmlFor={`rosco-c-${i}`}>
                Definición para la {item.letter}
              </label>
              <Input id={`rosco-c-${i}`} value={item.clue} onChange={(e) => update(i, { clue: e.target.value })} placeholder="Definición" />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Paso: Ajustes
// ---------------------------------------------------------------------------

const DIFFICULTY_HINTS: Record<string, Record<Difficulty, string>> = {
  wordsearch: { easy: "→ y ↓", medium: "+ diagonal", hard: "8 direcciones" },
  cryptogram: { easy: "Más letras de ayuda", medium: "Algunas letras", hard: "Sin ayudas" },
  sudoku: { easy: "Más pistas", medium: "Estándar", hard: "Menos pistas" },
  mathpyramid: { easy: "Hasta 9", medium: "Hasta 20", hard: "Hasta 40" },
  crossmath: { easy: "Sumas hasta 10", medium: "Sumas hasta 20", hard: "Con restas" },
  mathchain: { easy: "Números chicos", medium: "Hasta 200", hard: "Hasta 1000" },
};

export function SettingsStep() {
  const { snapshot: s, meta, dispatch } = useStudio();
  const patch = (p: Partial<typeof s>) => dispatch({ type: "patch", patch: p });
  const words = s.items.filter((i) => i.word.trim()).map((i) => i.word);

  return (
    <div className="space-y-6">
      {meta.settings.includes("difficulty") && (
        <Segmented<Difficulty>
          label="Dificultad"
          value={s.difficulty}
          onChange={(difficulty) => patch({ difficulty })}
          options={(["easy", "medium", "hard"] as const).map((d) => ({
            value: d,
            label: DIFFICULTY_LABELS[d],
            hint: DIFFICULTY_HINTS[s.type]?.[d],
          }))}
        />
      )}

      {meta.settings.includes("wordSearchSize") && (
        <div className="space-y-3">
          <Switch
            label="Tamaño automático de la cuadrícula"
            description={`Se ajusta a tus palabras (${autoWordSearchSize(words)}×${autoWordSearchSize(words)})`}
            checked={s.wordSearchSize === null}
            onChange={(auto) => patch({ wordSearchSize: auto ? null : autoWordSearchSize(words) })}
          />
          {s.wordSearchSize !== null && (
            <Field label={`Tamaño: ${s.wordSearchSize}×${s.wordSearchSize}`}>
              {(p) => (
                <input
                  {...p}
                  type="range"
                  min={WORDSEARCH_MIN_SIZE}
                  max={WORDSEARCH_MAX_SIZE}
                  value={s.wordSearchSize ?? 12}
                  onChange={(e) => patch({ wordSearchSize: Number(e.target.value) })}
                  className="w-full accent-[var(--c-accent)]"
                />
              )}
            </Field>
          )}
        </div>
      )}

      {meta.settings.includes("sudoku") && (
        <>
          <Segmented
            label="Tamaño del tablero"
            value={s.sudokuSize}
            onChange={(sudokuSize) => patch({ sudokuSize, sudokuSymbols: sudokuSize === 9 && s.sudokuSymbols === "shapes" ? "numbers" : s.sudokuSymbols })}
            options={[
              { value: 4, label: "4×4", hint: "Inicial" },
              { value: 6, label: "6×6", hint: "Primaria" },
              { value: 9, label: "9×9", hint: "Clásico" },
            ]}
          />
          <Segmented<SudokuSymbols>
            label="Símbolos"
            value={s.sudokuSymbols}
            onChange={(sudokuSymbols) => patch({ sudokuSymbols })}
            options={[
              { value: "numbers", label: "Números" },
              { value: "letters", label: "Letras" },
              {
                value: "shapes",
                label: "Figuras",
                disabled: s.sudokuSize === 9,
                icon: <ShapeSvg value={4} size={16} variant="color" />,
              },
            ]}
          />
        </>
      )}

      {meta.settings.includes("pyramid") && (
        <>
          <Segmented label="Pisos" value={s.pyramidLevels} onChange={(pyramidLevels) => patch({ pyramidLevels })} options={[3, 4, 5].map((n) => ({ value: n, label: `${n} pisos` }))} />
          <Segmented label="Pirámides por hoja" value={s.pyramidCount} onChange={(pyramidCount) => patch({ pyramidCount })} options={[1, 2, 3, 4].map((n) => ({ value: n, label: String(n) }))} />
        </>
      )}

      {meta.settings.includes("maze") && (
        <Segmented
          label="Tamaño del laberinto"
          value={s.mazeSize}
          onChange={(mazeSize) => patch({ mazeSize })}
          columns={2}
          options={[
            { value: 8, label: "Muy fácil", hint: "8×8" },
            { value: 11, label: "Fácil", hint: "11×11" },
            { value: 15, label: "Medio", hint: "15×15" },
            { value: 21, label: "Difícil", hint: "21×21" },
          ]}
        />
      )}

      {meta.settings.includes("pixelArt") && (
        <Segmented
          label="Dibujo secreto"
          value={s.pixelArtKey}
          onChange={(pixelArtKey) => patch({ pixelArtKey })}
          columns={3}
          options={Object.values(PIXEL_TEMPLATES).map((t) => ({ value: t.id, label: t.name, icon: <span aria-hidden>{t.emoji}</span> }))}
        />
      )}

      {meta.settings.includes("bingo") && (
        <>
          <Segmented
            label="Tamaño del cartón"
            value={s.bingoSize}
            onChange={(bingoSize) => patch({ bingoSize })}
            options={[
              { value: 3, label: "3×3", hint: "Inicial" },
              { value: 4, label: "4×4" },
              { value: 5, label: "5×5", hint: "BINGO" },
            ]}
          />
          <Switch
            label="Casillero libre en el centro"
            description="Sólo en cartones de 3×3 y 5×5"
            checked={s.bingoFreeCenter}
            disabled={s.bingoSize === 4}
            onChange={(bingoFreeCenter) => patch({ bingoFreeCenter })}
          />
          <p className="text-sm text-ink-3">Para imprimir cartones distintos, elige la cantidad en el paso «Hoja».</p>
        </>
      )}

      {meta.settings.includes("chain") && (
        <>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-ink">Operaciones</legend>
            <div className="grid grid-cols-4 gap-2">
              {(["+", "-", "×", "÷"] as ChainOperator[]).map((op) => {
                const on = s.chainOps.includes(op);
                return (
                  <button
                    key={op}
                    type="button"
                    aria-pressed={on}
                    onClick={() => patch({ chainOps: on ? s.chainOps.filter((o) => o !== op) : [...s.chainOps, op] })}
                    className={cn(
                      "h-11 rounded-xl border text-lg font-bold transition-colors cursor-pointer",
                      on ? "border-primary bg-primary text-on-primary" : "border-line-strong bg-surface text-ink-2 hover:bg-surface-2"
                    )}
                  >
                    <span className="sr-only">{{ "+": "Suma", "-": "Resta", "×": "Multiplicación", "÷": "División" }[op]}</span>
                    <span aria-hidden>{op}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
          <Segmented label="Pasos por cadena" value={s.chainLength} onChange={(chainLength) => patch({ chainLength })} options={[3, 4, 5, 6, 8].map((n) => ({ value: n, label: String(n) }))} />
          <Segmented label="Cadenas por hoja" value={s.chainCount} onChange={(chainCount) => patch({ chainCount })} options={[4, 6, 8, 10].map((n) => ({ value: n, label: String(n) }))} />
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Paso: Hoja
// ---------------------------------------------------------------------------

export function SheetStep() {
  const { snapshot: s, meta, dispatch } = useStudio();
  const header = s.sheet.header;
  const setHeader = (p: Partial<typeof header>) => dispatch({ type: "patchHeader", patch: p });

  return (
    <div className="space-y-6">
      <Field label="Título de la ficha">
        {(p) => (
          <Input {...p} value={s.title} maxLength={120} onChange={(e) => dispatch({ type: "patch", patch: { title: e.target.value } })} placeholder={meta.defaultTitle} />
        )}
      </Field>
      <Field label="Consigna" hint="Déjala vacía para usar la consigna sugerida.">
        {(p) => (
          <Textarea
            {...p}
            rows={2}
            value={s.sheet.instructions}
            placeholder={meta.defaultInstructions}
            onChange={(e) => dispatch({ type: "patchSheet", patch: { instructions: e.target.value } })}
          />
        )}
      </Field>

      <fieldset className="space-y-1">
        <legend className="mb-1 text-sm font-semibold text-ink">Encabezado para el alumno</legend>
        <Switch label="Nombre" checked={header.showName} onChange={(v) => setHeader({ showName: v })} />
        <Switch label="Fecha" checked={header.showDate} onChange={(v) => setHeader({ showDate: v })} />
        <Switch label="Curso / grado" checked={header.showGrade} onChange={(v) => setHeader({ showGrade: v })} />
        <Switch label="Nota" checked={header.showScore} onChange={(v) => setHeader({ showScore: v })} />
      </fieldset>
      <Field label="Escuela o institución" optional>
        {(p) => <Input {...p} value={header.schoolName ?? ""} onChange={(e) => setHeader({ schoolName: e.target.value })} placeholder="Aparece arriba del título" />}
      </Field>

      <Segmented<PageSize>
        label="Tamaño de papel"
        value={s.sheet.pageSize}
        onChange={(pageSize) => dispatch({ type: "patchSheet", patch: { pageSize } })}
        options={[
          { value: "A4", label: "A4", hint: "21 × 29,7 cm" },
          { value: "LETTER", label: "Carta", hint: "21,6 × 27,9 cm" },
        ]}
      />

      <div className="space-y-3">
        <Switch
          label={s.type === "bingo" ? "Varios cartones distintos" : "Versiones distintas (anti-copia)"}
          description={
            s.type === "bingo"
              ? "Imprime cartones con palabras en diferente orden para cada alumno."
              : "Crea versiones (A, B, C…) con distinta distribución para que no se copien."
          }
          checked={s.sheet.copies > 1}
          onChange={(multi) => dispatch({ type: "patchSheet", patch: { copies: multi ? 2 : 1 } })}
        />
        {s.sheet.copies > 1 && (
          <div className="rounded-xl border border-line bg-surface-2/60 p-3">
            <Segmented
              label={s.type === "bingo" ? "Cantidad de cartones" : "Cantidad de versiones"}
              value={s.sheet.copies}
              onChange={(copies) => dispatch({ type: "patchSheet", patch: { copies } })}
              options={Array.from({ length: MAX_COPIES - 1 }, (_, i) => ({ value: i + 2, label: `${i + 2}` }))}
            />
          </div>
        )}
      </div>
    </div>
  );
}
