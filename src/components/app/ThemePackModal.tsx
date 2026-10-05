"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  FileUp,
  HelpCircle,
  Sparkles,
  Upload,
} from "lucide-react";
import type { ActivityType } from "@/lib/types/activities";
import { parseThemeCsv } from "@/lib/csv/themePack";
import { createThemePack, DEFAULT_PACK_ACTIVITIES } from "@/lib/activities/pack";
import { getActivity } from "@/lib/activities/catalog";
import { dataActions } from "@/lib/data/store";
import { useApp } from "./AppContext";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { ActivityIcon } from "./ActivityIcon";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ThemePackModal({ open, onClose }: Props) {
  const { openInStudio } = useApp();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inputMode, setInputMode] = useState<"paste" | "file">("paste");
  const [csvText, setCsvText] = useState("");
  const [fileName, setFileName] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<ActivityType[]>([
    ...DEFAULT_PACK_ACTIVITIES,
  ]);
  const [isCreating, setIsCreating] = useState(false);

  // Live parsing
  const parsed = useMemo(() => parseThemeCsv(csvText), [csvText]);

  // Sync custom title with parsed title when detected
  const currentTitle = customTitle.trim() || parsed.title;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCsvText(text);
        setInputMode("paste"); // Switch to preview
      }
    };
    reader.readAsText(file, "utf-8");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCsvText(text);
        setInputMode("paste");
      }
    };
    reader.readAsText(file, "utf-8");
  };

  const toggleType = (type: ActivityType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleCreate = async () => {
    if (parsed.items.length === 0 || selectedTypes.length === 0) return;

    setIsCreating(true);
    try {
      const finalTitle = currentTitle.trim() || "Actividades Temáticas";
      const pack = createThemePack({
        themeTitle: finalTitle,
        items: parsed.items,
        activityTypes: selectedTypes,
      });

      // Save all activities into user's saved items under the theme folder
      let firstSavedSnapshot = pack.activities[0]?.snapshot;
      let firstSavedId: string | null = null;

      for (let i = 0; i < pack.activities.length; i++) {
        const item = pack.activities[i];
        const saved = await dataActions.save({
          snapshot: item.snapshot,
          folder: finalTitle,
          notes: `Generado con IA a partir de ${pack.items.length} palabras sobre "${finalTitle}".`,
        });
        if (i === 0) {
          firstSavedId = saved.id;
          firstSavedSnapshot = item.snapshot;
        }
      }

      toast.show(
        `¡Pack "${finalTitle}" generado! (${pack.activities.length} fichas guardadas en Mis fichas)`,
        { tone: "info" }
      );

      // Open first activity in studio
      if (firstSavedSnapshot) {
        openInStudio(firstSavedSnapshot, firstSavedId);
      }

      onClose();
    } catch (err) {
      toast.show(`Error al generar el pack: ${(err as Error).message}`, {
        tone: "error",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const hasItems = parsed.items.length > 0;
  const isEnoughItems = parsed.items.length >= 6;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Crear Pack Temático (CSV / IA)"
      description="Importa un archivo CSV o pega el texto generado por ChatGPT, Claude o Gemini para crear varias fichas del mismo tema en un solo clic."
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="ghost" onClick={onClose} disabled={isCreating}>
            Cancelar
          </Button>

          <Button
            variant="primary"
            disabled={!hasItems || selectedTypes.length === 0 || isCreating}
            onClick={handleCreate}
            icon={<Sparkles className="size-4" aria-hidden />}
          >
            {isCreating
              ? "Generando fichas..."
              : `Generar ${selectedTypes.length} ${
                  selectedTypes.length === 1 ? "actividad" : "actividades"
                }`}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Banner de ayuda hacia la documentación pública */}
        <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface-2 p-3.5 text-sm">
          <HelpCircle className="size-5 shrink-0 text-accent-ink mt-0.5" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink">¿Cómo obtener el CSV con Inteligencia Artificial?</p>
            <p className="text-ink-3 text-xs mt-0.5">
              Pásale tus apuntes a cualquier chat de IA con nuestras instrucciones preparadas para generar el archivo perfecto.
            </p>
          </div>
          <a
            href="/instrucciones-ia"
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-xl bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent-ink transition-colors hover:bg-accent-soft/80"
          >
            Ver guía y prompt ↗
          </a>
        </div>

        {/* Selector de modo de entrada: Pegar / Archivo */}
        <div className="flex items-center gap-2 border-b border-line pb-3">
          <button
            type="button"
            onClick={() => setInputMode("paste")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-sm font-semibold transition-colors cursor-pointer",
              inputMode === "paste"
                ? "bg-primary text-on-primary"
                : "text-ink-3 hover:bg-surface-2 hover:text-ink"
            )}
          >
            <FileSpreadsheet className="size-4" aria-hidden />
            <span>Pegar texto CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setInputMode("file")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-sm font-semibold transition-colors cursor-pointer",
              inputMode === "file"
                ? "bg-primary text-on-primary"
                : "text-ink-3 hover:bg-surface-2 hover:text-ink"
            )}
          >
            <Upload className="size-4" aria-hidden />
            <span>Subir archivo .csv</span>
          </button>
          {fileName && (
            <span className="text-xs text-ink-3 truncate max-w-xs ml-auto">
              {fileName}
            </span>
          )}
        </div>

        {/* Contenido de entrada */}
        {inputMode === "paste" ? (
          <div>
            <Field
              label="Contenido CSV"
              hint="Pega aquí el código CSV con formato 'palabra,pista' devuelto por la IA."
            >
              {(props) => (
                <Textarea
                  {...props}
                  rows={6}
                  value={csvText}
                  onChange={(e) => {
                    setCsvText(e.target.value);
                    setCustomTitle("");
                  }}
                  placeholder={`# tema: El Sistema Solar\npalabra,pista\nSOL,Estrella en el centro de nuestro sistema planetario\nTIERRA,Tercer planeta desde el Sol y donde vivimos\nMARTE,Conocido como el planeta rojo`}
                  className="font-mono text-xs leading-relaxed"
                />
              )}
            </Field>
          </div>
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line-strong p-8 text-center transition-colors hover:border-accent hover:bg-surface-2/50 cursor-pointer"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv,text/plain"
              onChange={handleFileUpload}
              className="hidden"
            />
            <span className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent-ink mb-3">
              <FileUp className="size-6" aria-hidden />
            </span>
            <p className="text-sm font-semibold text-ink">
              Haz clic para seleccionar o arrastra aquí tu archivo .csv
            </p>
            <p className="text-xs text-ink-3 mt-1">
              Archivos CSV exportados desde Excel o descargados de tu chat de IA.
            </p>
          </div>
        )}

        {/* Previsualización en tiempo real */}
        {csvText.trim().length > 0 && (
          <div className="space-y-4 rounded-2xl border border-line bg-surface-2/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="theme-pack-title"
                  className="block text-xs font-semibold text-ink-3 uppercase tracking-wider mb-1"
                >
                  Título del Tema
                </label>
                <Input
                  id="theme-pack-title"
                  value={currentTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Ej: El Sistema Solar"
                  className="font-bold text-ink"
                />
              </div>

              <div className="flex items-center gap-2 self-end pb-1">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                    isEnoughItems
                      ? "bg-ok-soft text-ok-ink"
                      : "bg-warn-soft text-warn-ink"
                  )}
                >
                  {isEnoughItems ? (
                    <CheckCircle2 className="size-3.5" aria-hidden />
                  ) : (
                    <AlertTriangle className="size-3.5" aria-hidden />
                  )}
                  <span>{parsed.items.length} palabras</span>
                </span>
              </div>
            </div>

            {/* Advertencias del parser */}
            {parsed.warnings.length > 0 && (
              <div className="rounded-xl border border-warn-soft bg-warn-soft/40 p-3 text-xs text-warn-ink space-y-1">
                {parsed.warnings.map((w, idx) => (
                  <p key={idx} className="flex items-start gap-1.5">
                    <span className="font-bold">•</span>
                    <span>{w}</span>
                  </p>
                ))}
              </div>
            )}

            {/* Lista desplegable de palabras parseadas */}
            {hasItems && (
              <div>
                <p className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-2">
                  Vocabulario extraído ({parsed.items.length})
                </p>
                <div className="max-h-36 overflow-y-auto space-y-1 rounded-xl border border-line bg-surface p-2 text-xs">
                  {parsed.items.map((it, idx) => (
                    <div key={idx} className="flex items-start gap-2 py-0.5">
                      <span className="font-mono font-bold text-ink shrink-0">
                        {it.word}
                      </span>
                      {it.clue && (
                        <span className="text-ink-3 truncate">— {it.clue}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selector de actividades a generar */}
            <div>
              <p className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-2">
                Actividades a incluir en el Pack
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEFAULT_PACK_ACTIVITIES.map((type) => {
                  const meta = getActivity(type);
                  const isChecked = selectedTypes.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleType(type)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border p-2.5 text-left transition-colors cursor-pointer",
                        isChecked
                          ? "border-primary bg-surface shadow-xs"
                          : "border-line bg-surface/40 opacity-60 hover:opacity-100"
                      )}
                    >
                      <ActivityIcon type={type} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink truncate">
                          {meta.title}
                        </p>
                        <p className="text-xs text-ink-3 truncate">
                          {meta.description}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        aria-label={`Incluir ${meta.title}`}
                        className="size-4 rounded accent-primary cursor-pointer"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
