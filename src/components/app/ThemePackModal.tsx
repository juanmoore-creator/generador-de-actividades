"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileSpreadsheet,
  FileUp,
  HelpCircle,
  LogIn,
  PenLine,
  Printer,
  RotateCcw,
  Sparkles,
  Upload,
} from "lucide-react";
import type { ActivityType } from "@/lib/types/activities";
import { parseThemeCsv } from "@/lib/csv/themePack";
import { AI_SYSTEM_PROMPT } from "@/lib/csv/themePrompt";
import {
  createThemePack,
  DEFAULT_PACK_ACTIVITIES,
  type ThemePackResult,
} from "@/lib/activities/pack";
import { getActivity } from "@/lib/activities/catalog";
import { dataActions, useDataState } from "@/lib/data/store";
import { useApp } from "./AppContext";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { ActivityIcon } from "./ActivityIcon";
import { cn } from "@/lib/utils";
import type { PdfMode } from "@/components/pdf/ActivityDocument";
import { downloadBlob, pdfFileName, printBlob, renderPdfBlob } from "@/lib/pdf/export";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ThemePackModal({ open, onClose }: Props) {
  const { openInStudio, openAuth } = useApp();
  const { profile, mode } = useDataState();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSaveToCloud = mode === "local" || !!profile;

  const [inputMode, setInputMode] = useState<"paste" | "file">("paste");
  const [csvText, setCsvText] = useState("");
  const [fileName, setFileName] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<ActivityType[]>([
    ...DEFAULT_PACK_ACTIVITIES,
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Pack result state
  const [createdPack, setCreatedPack] = useState<ThemePackResult | null>(null);
  const [isSavedInCloud, setIsSavedInCloud] = useState(false);
  const [pdfMode, setPdfMode] = useState<PdfMode>("student");
  const [isExportingPdf, setIsExportingPdf] = useState<"download" | "print" | null>(null);
  const [isSavingManual, setIsSavingManual] = useState(false);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(AI_SYSTEM_PROMPT);
      setCopiedPrompt(true);
      toast.show("¡Prompt copiado al portapapeles! Pégalo en tu IA favorita.", { tone: "info" });
      setTimeout(() => setCopiedPrompt(false), 2500);
    } catch {
      toast.show("No se pudo copiar el texto. Revisa los permisos del navegador.", { tone: "error" });
    }
  };

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

  const handleClose = () => {
    setCreatedPack(null);
    onClose();
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

      let savedOk = false;
      if (canSaveToCloud) {
        try {
          for (let i = 0; i < pack.activities.length; i++) {
            const item = pack.activities[i];
            await dataActions.save({
              snapshot: item.snapshot,
              folder: finalTitle,
              notes: `Generado con IA a partir de ${pack.items.length} palabras sobre "${finalTitle}".`,
            });
          }
          savedOk = true;
        } catch (e) {
          console.warn("No se pudo guardar automáticamente en la nube:", e);
        }
      }

      setCreatedPack(pack);
      setIsSavedInCloud(savedOk);

      if (savedOk) {
        toast.show(
          `¡Pack "${finalTitle}" generado! (${pack.activities.length} fichas guardadas en Mis fichas)`,
          { tone: "info" }
        );
      } else {
        toast.show(
          `¡Pack "${finalTitle}" generado exitosamente!`,
          { tone: "info" }
        );
      }
    } catch (err) {
      toast.show(`Error al generar el pack: ${(err as Error).message}`, {
        tone: "error",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenStudio = (snapshot = createdPack?.activities[0]?.snapshot) => {
    if (!snapshot) return;
    openInStudio(snapshot);
    handleClose();
  };

  const handleSavePack = async () => {
    if (!createdPack) return;
    if (!canSaveToCloud) {
      openAuth("Inicia sesión para guardar tus packs en Mis fichas.");
      return;
    }
    setIsSavingManual(true);
    try {
      for (const item of createdPack.activities) {
        await dataActions.save({
          snapshot: item.snapshot,
          folder: createdPack.title,
          notes: `Generado con IA a partir de ${createdPack.items.length} palabras sobre "${createdPack.title}".`,
        });
      }
      setIsSavedInCloud(true);
      toast.show("¡Pack guardado en Mis fichas!", { tone: "info" });
    } catch (err) {
      toast.show(`Error al guardar: ${(err as Error).message}`, { tone: "error" });
    } finally {
      setIsSavingManual(false);
    }
  };

  const handleExportPdf = async (action: "download" | "print") => {
    if (!createdPack) return;
    setIsExportingPdf(action);
    try {
      const jobs =
        pdfMode === "both"
          ? [
              ...createdPack.activities.map((a) => ({
                snapshot: a.snapshot,
                mode: "student" as const,
              })),
              ...createdPack.activities.map((a) => ({
                snapshot: a.snapshot,
                mode: "solution" as const,
              })),
            ]
          : createdPack.activities.map((a) => ({
              snapshot: a.snapshot,
              mode: pdfMode,
            }));

      const blob = await renderPdfBlob(jobs, createdPack.title);
      if (action === "print") {
        await printBlob(blob);
      } else {
        downloadBlob(blob, pdfFileName(createdPack.title));
      }
    } catch {
      toast.show("No se pudo generar el PDF.", { tone: "error" });
    } finally {
      setIsExportingPdf(null);
    }
  };

  const hasItems = parsed.items.length > 0;
  const isEnoughItems = parsed.items.length >= 6;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="lg"
      title={createdPack ? "¡Pack de actividades listo!" : "Crear Pack Temático (CSV / IA)"}
      description={
        createdPack
          ? `Se generaron ${createdPack.activities.length} fichas temáticas sobre "${createdPack.title}".`
          : "Importa un archivo CSV o pega el texto generado por ChatGPT, Claude o Gemini para crear varias fichas del mismo tema en un solo clic."
      }
      footer={
        createdPack ? (
          <div className="flex items-center justify-between w-full">
            <Button
              variant="ghost"
              onClick={() => setCreatedPack(null)}
              icon={<RotateCcw className="size-4" aria-hidden />}
            >
              Crear otro
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={handleClose}>
                Cerrar
              </Button>
              <Button
                variant="primary"
                onClick={() => handleOpenStudio()}
                icon={<ArrowRight className="size-4" aria-hidden />}
              >
                Abrir en el Studio
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <Button variant="ghost" onClick={handleClose} disabled={isCreating}>
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
        )
      }
    >
      {createdPack ? (
        /* Pantalla de éxito y descarga tras generar el pack */
        <div className="space-y-5">
          {/* Fichas generadas */}
          <div>
            <p className="text-xs font-semibold text-ink-3 uppercase tracking-wider mb-2">
              Actividades generadas ({createdPack.activities.length})
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {createdPack.activities.map((act) => {
                const meta = getActivity(act.type);
                return (
                  <div
                    key={act.type}
                    className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ActivityIcon type={act.type} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">
                          {meta.title}
                        </p>
                        <p className="text-xs text-ink-3 truncate">
                          {meta.defaultInstructions}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenStudio(act.snapshot)}
                      icon={<PenLine className="size-3.5" aria-hidden />}
                      title={`Editar ${meta.title} en el Studio`}
                    >
                      Editar
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Caja de exportación rápida de PDF */}
          <div className="rounded-2xl border border-line bg-surface-2/60 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-ink">
                  Descargar Cuadernillo del Pack (PDF)
                </p>
                <p className="text-xs text-ink-3">
                  Combina todas las actividades generadas en un solo documento listo para imprimir.
                </p>
              </div>
              <Segmented<PdfMode>
                label="Incluir en PDF"
                hideLabel
                size="sm"
                value={pdfMode}
                onChange={setPdfMode}
                options={[
                  { value: "student", label: "Fichas" },
                  { value: "solution", label: "Respuestas" },
                  { value: "both", label: "Ambas" },
                ]}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                variant="primary"
                loading={isExportingPdf === "download"}
                disabled={isExportingPdf !== null}
                onClick={() => handleExportPdf("download")}
                icon={<Download className="size-4" aria-hidden />}
              >
                Descargar PDF completo
              </Button>
              <Button
                variant="secondary"
                loading={isExportingPdf === "print"}
                disabled={isExportingPdf !== null}
                onClick={() => handleExportPdf("print")}
                icon={<Printer className="size-4" aria-hidden />}
              >
                Imprimir
              </Button>
            </div>
          </div>

          {/* Persistencia en la nube / cuenta */}
          {isSavedInCloud ? (
            <div className="flex items-center gap-2.5 rounded-xl border border-ok-soft bg-ok-soft/30 p-3 text-xs text-ok-ink">
              <CheckCircle2 className="size-4 shrink-0 text-ok" aria-hidden />
              <span>
                Guardado automáticamente en <strong>Mis fichas</strong> bajo la carpeta &ldquo;{createdPack.title}&rdquo;.
              </span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-accent/20 bg-accent-soft/30 p-3 text-xs text-ink">
              <div className="flex items-start gap-2.5 min-w-0">
                <LogIn className="size-4 shrink-0 text-accent-ink mt-0.5" aria-hidden />
                <div>
                  <p className="font-semibold text-ink">
                    ¿Querés conservarlas para editarlas después?
                  </p>
                  <p className="text-ink-3">
                    Inicia sesión para que tus actividades queden guardadas en la nube.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="accent"
                loading={isSavingManual}
                onClick={handleSavePack}
                icon={<LogIn className="size-3.5" aria-hidden />}
              >
                {canSaveToCloud ? "Guardar en Mis fichas" : "Iniciar sesión"}
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Pantalla de configuración e importación CSV */
        <div className="space-y-5">
          {/* Banner de ayuda hacia la documentación y copia rápida del prompt */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-line bg-surface-2 p-3.5 text-sm">
            <div className="flex items-start gap-3 min-w-0">
              <HelpCircle className="size-5 shrink-0 text-accent-ink mt-0.5" aria-hidden />
              <div className="min-w-0">
                <p className="font-semibold text-ink">¿Cómo obtener el CSV con Inteligencia Artificial?</p>
                <p className="text-ink-3 text-xs mt-0.5">
                  Copia nuestro prompt listo y pégalo en ChatGPT, Claude o Gemini con tus apuntes. ¡No requiere que la IA navegue por internet!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent-ink transition-colors hover:bg-accent-soft/80"
                title="Copiar prompt para la IA"
              >
                {copiedPrompt ? (
                  <>
                    <Check className="size-3.5 text-ok" aria-hidden />
                    <span>¡Prompt copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" aria-hidden />
                    <span>Copiar prompt de IA</span>
                  </>
                )}
              </button>
              <a
                href="/instrucciones-ia"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-2.5 py-1.5 text-xs font-medium text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <span>Ver guía</span>
                <span aria-hidden>↗</span>
              </a>
            </div>
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
      )}
    </Modal>
  );
}
