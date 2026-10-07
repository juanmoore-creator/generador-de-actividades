"use client";

import React, { useEffect, useRef, useState } from "react";
import { ClipboardPaste, Plus, Sparkles, Trash2, Eraser } from "lucide-react";
import type { WordItem } from "@/lib/types/activities";
import { parseBulkText } from "@/lib/activities/bulk";
import { Button, IconButton } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

interface Props {
  items: WordItem[];
  onChange: (items: WordItem[]) => void;
  /** "none" oculta las pistas; "optional"/"required" las muestra. */
  clues: "none" | "optional" | "required";
  minItems?: number;
  onTitleSuggestion?: (title: string) => void;
}

let aiAvailability: Promise<boolean> | null = null;
function checkAi(): Promise<boolean> {
  aiAvailability ??= fetch("/api/ai/words")
    .then((r) => (r.ok ? r.json() : { enabled: false }))
    .then((d: { enabled?: boolean }) => Boolean(d.enabled))
    .catch(() => false);
  return aiAvailability;
}

export function WordListEditor({ items, onChange, clues, minItems = 0, onTitleSuggestion }: Props) {
  const toast = useToast();
  const wordRefs = useRef<(HTMLInputElement | null)[]>([]);
  const pendingFocus = useRef<number | null>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);

  useEffect(() => {
    let alive = true;
    checkAi().then((v) => alive && setAiEnabled(v));
    return () => {
      alive = false;
    };
  }, []);

  // Mueve el foco después de agregar/quitar filas.
  useEffect(() => {
    if (pendingFocus.current !== null) {
      wordRefs.current[pendingFocus.current]?.focus();
      pendingFocus.current = null;
    }
  }, [items.length]);

  const filled = items.filter((i) => i.word.trim()).length;
  const showClues = clues !== "none";

  const update = (index: number, field: keyof WordItem, value: string) =>
    onChange(items.map((it, i) => (i === index ? { ...it, [field]: value } : it)));

  const addRow = (at = items.length) => {
    const next = [...items];
    next.splice(at, 0, { word: "", clue: "" });
    onChange(next);
    pendingFocus.current = at;
  };

  const removeRow = (index: number) => {
    const removed = items[index];
    const next = items.filter((_, i) => i !== index);
    onChange(next.length ? next : [{ word: "", clue: "" }]);
    if (removed.word.trim()) {
      toast.show(`Se quitó "${removed.word}"`, {
        tone: "info",
        action: {
          label: "Deshacer",
          onClick: () => {
            const restored = [...next];
            restored.splice(index, 0, removed);
            onChange(restored);
          },
        },
      });
    }
  };

  const replaceAll = (newItems: WordItem[], message: string) => {
    const previous = items;
    onChange(newItems.length ? newItems : [{ word: "", clue: "" }]);
    toast.show(message, { tone: "info", action: { label: "Deshacer", onClick: () => onChange(previous) } });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number, field: keyof WordItem) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (field === "word" && showClues) {
        (e.currentTarget.parentElement?.parentElement?.querySelector("[data-clue]") as HTMLInputElement | null)?.focus();
        return;
      }
      if (index === items.length - 1) addRow();
      else wordRefs.current[index + 1]?.focus();
    }
    if (e.key === "Backspace" && field === "word" && items[index].word === "" && items.length > 1) {
      e.preventDefault();
      onChange(items.filter((_, i) => i !== index));
      pendingFocus.current = Math.max(0, index - 1);
    }
  };

  const enough = filled >= minItems;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="secondary" onClick={() => setPasteOpen(true)} icon={<ClipboardPaste className="size-4" aria-hidden />}>
          Pegar lista
        </Button>
        {aiEnabled && (
          <Button size="sm" variant="accent" onClick={() => setAiOpen(true)} icon={<Sparkles className="size-4" aria-hidden />}>
            Generar con IA
          </Button>
        )}
        <IconButton
          size="sm"
          variant="ghost"
          className="ml-auto"
          label="Vaciar la lista"
          icon={<Eraser className="size-4" aria-hidden />}
          onClick={() => replaceAll([], "Lista vaciada")}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className={cn("font-medium", enough ? "text-ink-3" : "text-warn-ink")} aria-live="polite">
          {filled} {filled === 1 ? "palabra" : "palabras"}
          {!enough && ` · mínimo ${minItems}`}
        </span>
        {showClues && (
          <span className="text-ink-3">{clues === "required" ? "La definición es obligatoria" : "Pista opcional"}</span>
        )}
      </div>

      <ol className="space-y-2" aria-label="Palabras de la actividad">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 rounded-xl border border-line bg-surface-2/60 p-2">
            <span className="mt-2.5 w-6 shrink-0 text-center font-mono text-sm text-ink-3" aria-hidden>
              {idx + 1}
            </span>
            <div className={cn("grid flex-1 gap-2", showClues && "sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]")}>
              <div>
                <label className="sr-only" htmlFor={`word-${idx}`}>
                  Palabra {idx + 1}
                </label>
                <Input
                  id={`word-${idx}`}
                  ref={(el: HTMLInputElement | null) => {
                    wordRefs.current[idx] = el;
                  }}
                  value={item.word}
                  onChange={(e) => update(idx, "word", e.target.value.toUpperCase())}
                  onKeyDown={(e) => onKeyDown(e, idx, "word")}
                  placeholder="PALABRA"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  className="font-mono font-semibold tracking-wide uppercase"
                />
              </div>
              {showClues && (
                <div>
                  <label className="sr-only" htmlFor={`clue-${idx}`}>
                    {clues === "required" ? "Definición" : "Pista"} de la palabra {idx + 1}
                  </label>
                  <Input
                    id={`clue-${idx}`}
                    data-clue
                    value={item.clue}
                    onChange={(e) => update(idx, "clue", e.target.value)}
                    onKeyDown={(e) => onKeyDown(e, idx, "clue")}
                    placeholder={clues === "required" ? "Definición" : "Pista (opcional)"}
                    autoComplete="off"
                  />
                </div>
              )}
            </div>
            <IconButton
              variant="ghost"
              label={`Quitar la palabra ${idx + 1}`}
              icon={<Trash2 className="size-4" aria-hidden />}
              onClick={() => removeRow(idx)}
            />
          </li>
        ))}
      </ol>

      <Button variant="soft" className="w-full" onClick={() => addRow()} icon={<Plus className="size-4" aria-hidden />}>
        Agregar palabra
      </Button>
      <p className="text-center text-sm text-ink-3">
        Consejo: con <kbd className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs">Enter</kbd> pasas a la siguiente fila.
      </p>

      <PasteDialog
        open={pasteOpen}
        onClose={() => setPasteOpen(false)}
        showClues={showClues}
        onApply={(parsed, mode) => {
          if (mode === "replace") replaceAll(parsed, `${parsed.length} palabras importadas`);
          else {
            const base = items.filter((i) => i.word.trim() || i.clue.trim());
            replaceAll([...base, ...parsed], `${parsed.length} palabras agregadas`);
          }
          setPasteOpen(false);
        }}
      />
      {aiEnabled && (
        <AiDialog
          open={aiOpen}
          onClose={() => setAiOpen(false)}
          withClues={showClues}
          onResult={(newItems, topic) => {
            replaceAll(newItems, `${newItems.length} palabras generadas. Revísalas antes de imprimir.`);
            onTitleSuggestion?.(topic.charAt(0).toUpperCase() + topic.slice(1));
            setAiOpen(false);
          }}
        />
      )}
    </div>
  );
}

function PasteDialog({
  open,
  onClose,
  onApply,
  showClues,
}: {
  open: boolean;
  onClose: () => void;
  onApply: (items: WordItem[], mode: "replace" | "append") => void;
  showClues: boolean;
}) {
  const [text, setText] = useState("");
  const parsed = parseBulkText(text);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Pegar una lista"
      description={
        showClues
          ? "Una palabra por línea. Para agregar la pista usa dos puntos: «SOL: estrella central». También puedes pegar dos columnas desde una planilla."
          : "Una palabra por línea o separadas por comas."
      }
      footer={
        <>
          <Button variant="secondary" disabled={!parsed.length} onClick={() => onApply(parsed, "append")}>
            Agregar al final
          </Button>
          <Button variant="primary" disabled={!parsed.length} onClick={() => onApply(parsed, "replace")}>
            Reemplazar lista ({parsed.length})
          </Button>
        </>
      }
    >
      <Field label="Texto a importar" hideLabel>
        {(p) => (
          <Textarea
            {...p}
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={showClues ? "SOL: estrella del sistema solar\nLUNA: satélite de la Tierra\nMARTE: el planeta rojo" : "SOL, LUNA, MARTE, TIERRA"}
            className="font-mono"
          />
        )}
      </Field>
      {parsed.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-ink">Vista previa ({parsed.length})</p>
          <ul className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-line p-2 text-sm">
            {parsed.map((i, k) => (
              <li key={k} className="flex gap-2">
                <span className="font-mono font-semibold text-ink">{i.word}</span>
                {i.clue && <span className="truncate text-ink-3">— {i.clue}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  );
}

function AiDialog({
  open,
  onClose,
  onResult,
  withClues,
}: {
  open: boolean;
  onClose: () => void;
  onResult: (items: WordItem[], topic: string) => void;
  withClues: boolean;
}) {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("primaria");
  const [count, setCount] = useState(10);
  const [language, setLanguage] = useState("español");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, level, count, language, withClues }),
      });
      const data = (await res.json()) as { items?: WordItem[]; error?: string };
      if (!res.ok || !data.items) throw new Error(data.error || "No se pudo generar la lista.");
      onResult(data.items, topic.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar la lista.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Generar palabras con IA" description="Describe el tema y revisa el resultado antes de imprimir.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Tema" hint="Ejemplo: «los planetas del sistema solar» o «verbos irregulares en inglés».">
          {(p) => <Input {...p} value={topic} onChange={(e) => setTopic(e.target.value)} required minLength={2} maxLength={200} autoFocus />}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nivel">
            {(p) => (
              <Select {...p} value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="nivel inicial (4 a 5 años)">Inicial</option>
                <option value="primaria, primer ciclo (6 a 8 años)">Primaria (1.º a 3.º)</option>
                <option value="primaria, segundo ciclo (9 a 12 años)">Primaria (4.º a 6.º)</option>
                <option value="secundaria (13 a 17 años)">Secundaria</option>
              </Select>
            )}
          </Field>
          <Field label="Idioma">
            {(p) => (
              <Select {...p} value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="español">Español</option>
                <option value="inglés">Inglés</option>
                <option value="portugués">Portugués</option>
                <option value="francés">Francés</option>
              </Select>
            )}
          </Field>
        </div>
        <Segmented
          label="Cantidad de palabras"
          value={count}
          onChange={setCount}
          options={[6, 10, 15, 20].map((n) => ({ value: n, label: String(n) }))}
        />
        {error && (
          <p role="alert" className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger-ink">
            {error}
          </p>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={loading} icon={<Sparkles className="size-4" aria-hidden />}>
            {loading ? "Generando…" : "Generar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
