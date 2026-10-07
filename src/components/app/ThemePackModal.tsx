"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileSpreadsheet,
  FileText,
  FileUp,
  HelpCircle,
  LogIn,
  PenLine,
  Printer,
  RotateCcw,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
import type { ActivityType } from "@/lib/types/activities";
import { parseThemeCsv } from "@/lib/csv/themePack";
import { AI_SYSTEM_PROMPT } from "@/lib/csv/themePrompt";
import {
  createThemePack,
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

const PACK_ACTIVITIES: ActivityType[] = [
  "wordsearch",
  "crossword",
  "scramble",
  "matching",
  "cryptogram",
  "cloze",
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ThemePackModal({ open, onClose }: Props) {
  const { openInStudio, openAuth } = useApp();
  const { profile, mode } = useDataState();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const canSaveToCloud = mode === "local" || !!profile;

  const [inputMode, setInputMode] = useState<"ai" | "paste" | "file">("ai");

  // AI mode state
  const [aiText, setAiText] = useState("");
  const [aiLevel, setAiLevel] = useState<"inicial" | "primaria" | "secundaria">("primaria");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);
  const [pdfFile, setPdfFile] = useState<{
    name: string;
    size: number;
    base64: string;
  } | null>(null);

  // CSV mode state
  const [csvText, setCsvText] = useState("");
  const [fileName, setFileName] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<ActivityType[]>([
    ...PACK_ACTIVITIES,
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Pack result state
  const [createdPack, setCreatedPack] = useState<ThemePackResult | null>(null);
  const [isSavedInCloud, setIsSavedInCloud] = useState(false);
  const [pdfMode, setPdfMode] = useState<PdfMode>("student");
  const [isExportingPdf, setIsExportingPdf] = useState<"download" | "print" | null>(null);
  const [isSavingManual, setIsSavingManual] = useState(false);

  // Check if Gemini is enabled on mount
  useEffect(() => {
    let cancelled = false;
    fetch("/api/ai/generate-from-text")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && typeof data?.enabled === "boolean") {
          setAiEnabled(data.enabled);
        }
      })
      .catch(() => {
        if (!cancelled) setAiEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  // Live parsing for CSV
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

  const handlePdfUpload = (file?: File) => {
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.show("Solo se permiten archivos en formato PDF.", { tone: "error" });
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      toast.show("El archivo PDF no debe superar los 4 MB para procesarse en Vercel.", {
        tone: "error",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setPdfFile({
          name: file.name,
          size: file.size,
          base64,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePdfFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handlePdfUpload(file);
  };

  const handlePdfDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    handlePdfUpload(file);
  };

  const handleClearPdf = () => {
    setPdfFile(null);
    if (pdfInputRef.current) {
      pdfInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (isCreating || aiLoading) return;
    setCreatedPack(null);
    setPdfFile(null);
    if (pdfInputRef.current) {
      pdfInputRef.current.value = "";
    }
    onClose();
  };

  // Generate activities with Gemini
  const handleGenerateAi = async () => {
    const trimmed = aiText.trim();
    if (trimmed.length < 30 && !pdfFile) {
      toast.show("Debes ingresar al menos 30 caracteres de texto o adjuntar un archivo PDF.", {
        tone: "error",
      });
      return;
    }
    if (selectedTypes.length === 0) {
      toast.show("Selecciona al menos una actividad para generar el pack.", { tone: "error" });
      return;
    }

    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/generate-from-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: trimmed,
          pdfBase64: pdfFile?.base64,
          level: aiLevel,
          language: "español",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo generar el pack con Gemini.");
      }

      const pack = createThemePack({
        themeTitle: data.themeTitle,
        items: data.vocabulary,
        activityTypes: selectedTypes,
        clozeText: data.clozeParagraph,
        cryptoPhrase: data.cryptogram?.phrase,
        cryptoHint: data.cryptogram?.hint,
      });

      let savedOk = false;
      if (canSaveToCloud) {
        try {
          for (let i = 0; i < pack.activities.length; i++) {
            const item = pack.activities[i];
            await dataActions.save({
              snapshot: item.snapshot,
              folder: pack.title,
              notes: `Generado con IA (Gemini) sobre "${pack.title}".`,
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
          `¡Pack "${pack.title}" generado! (${pack.activities.length} fichas guardadas en Mis fichas)`,
          { tone: "info" }
        );
      } else {
        toast.show(`¡Pack "${pack.title}" generado exitosamente!`, { tone: "info" });
      }
    } catch (err) {
      toast.show(err instanceof Error ? err.message : "Error al generar actividades con Gemini.", {
        tone: "error",
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Generate activities with CSV
  const handleCreateCsv = async () => {
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
              notes: `Generado a partir de ${pack.items.length} palabras sobre "${finalTitle}".`,
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
      title={createdPack ? "¡Pack de actividades listo!" : "Crear Pack Temático (IA / CSV)"}
      description={
        createdPack
          ? `Se generaron ${createdPack.activities.length} fichas temáticas sobre "${createdPack.title}".`
          : inputMode === "ai"
          ? "Genera automáticamente un pack completo de 6 actividades imprimibles a partir de una lección escolar con Google Gemini."
          : "Importa un archivo CSV o pega el texto generado por ChatGPT, Claude o Gemini para crear varias fichas del mismo tema en un solo clic."
      }
      footer={
        createdPack ? (
          <div className="flex items-center justify-between w-full">
            <Button
              variant="ghost"
              onClick={() => {
                setCreatedPack(null);
                setPdfFile(null);
                if (pdfInputRef.current) pdfInputRef.current.value = "";
              }}
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
            <Button variant="ghost" onClick={handleClose} disabled={isCreating || aiLoading}>
              Cancelar
            </Button>

            {inputMode === "ai" ? (
              <Button
                variant="primary"
                disabled={
                  (aiText.trim().length < 30 && pdfFile === null) ||
                  selectedTypes.length === 0 ||
                  aiLoading ||
                  aiEnabled === false
                }
                onClick={handleGenerateAi}
                loading={aiLoading}
                icon={<Sparkles className="size-4" aria-hidden />}
              >
                {aiLoading
                  ? pdfFile
                    ? "Analizando PDF y generando actividades..."
                    : "Analizando texto con Gemini..."
                  : "Generar actividades con Gemini"}
              </Button>
            ) : (
              <Button
                variant="primary"
                disabled={!hasItems || selectedTypes.length === 0 || isCreating}
                onClick={handleCreateCsv}
                loading={isCreating}
                icon={<Sparkles className="size-4" aria-hidden />}
              >
                {isCreating
                  ? "Generando fichas..."
                  : `Generar ${selectedTypes.length} ${
                      selectedTypes.length === 1 ? "actividad" : "actividades"
                    }`}
              </Button>
            )}
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
        /* Configuración del pack */
        <div className="space-y-5">
          {/* Selector de modo de entrada: IA / Pegar / Archivo */}
          <div className="flex items-center gap-2 border-b border-line pb-3 overflow-x-auto">
            <button
              type="button"
              onClick={() => setInputMode("ai")}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-sm font-semibold transition-colors cursor-pointer shrink-0",
                inputMode === "ai"
                  ? "bg-primary text-on-primary"
                  : "text-ink-3 hover:bg-surface-2 hover:text-ink"
              )}
            >
              <Sparkles className="size-4" aria-hidden />
              <span>Generar con IA (Gemini)</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode("paste")}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-sm font-semibold transition-colors cursor-pointer shrink-0",
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
                "flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-sm font-semibold transition-colors cursor-pointer shrink-0",
                inputMode === "file"
                  ? "bg-primary text-on-primary"
                  : "text-ink-3 hover:bg-surface-2 hover:text-ink"
              )}
            >
              <Upload className="size-4" aria-hidden />
              <span>Subir archivo .csv</span>
            </button>
            {fileName && inputMode !== "ai" && (
              <span className="text-xs text-ink-3 truncate max-w-xs ml-auto">
                {fileName}
              </span>
            )}
          </div>

          {inputMode === "ai" ? (
            /* Modo Generación con IA (Gemini) */
            <div className="space-y-4">
              {/* Banner descriptivo */}
              <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface-2 p-3.5 text-sm">
                <Sparkles className="size-5 shrink-0 text-accent-ink mt-0.5" aria-hidden />
                <div className="min-w-0">
                  <p className="font-semibold text-ink">Generación con Inteligencia Artificial</p>
                  <p className="text-ink-3 text-xs mt-0.5 leading-relaxed">
                    Pega un apunte, resumen o lección escolar, o adjunta un archivo PDF. Gemini analizará el contenido para extraer los conceptos clave y generará automáticamente un pack con 6 actividades imprimibles en un solo paso.
                  </p>
                </div>
              </div>

              {/* Banner cuando la API de Gemini no está configurada */}
              {aiEnabled === false && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-warn-soft bg-warn-soft/40 p-3.5 text-xs text-warn-ink">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <AlertTriangle className="size-4 shrink-0 text-warn mt-0.5" aria-hidden />
                    <div>
                      <p className="font-semibold text-ink">La API de Gemini no está configurada</p>
                      <p className="text-ink-3 mt-0.5">
                        Define <code className="font-mono font-bold">GEMINI_API_KEY</code> en tu archivo <code className="font-mono">.env.local</code> o en las variables de entorno de Vercel para habilitar la generación directa.
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setInputMode("paste")}
                    className="shrink-0 self-start sm:self-center"
                  >
                    Pegar texto CSV
                  </Button>
                </div>
              )}

              {/* Carga de archivo PDF */}
              <div>
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handlePdfFileInput}
                  className="hidden"
                />

                {pdfFile ? (
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary-soft/20 p-3.5 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-on-primary shadow-xs">
                        <FileText className="size-5" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">{pdfFile.name}</p>
                        <p className="text-xs text-ink-3 font-mono">{formatFileSize(pdfFile.size)}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      type="button"
                      onClick={handleClearPdf}
                      icon={<X className="size-4" aria-hidden />}
                      className="text-ink-3 hover:text-ink shrink-0"
                      title="Quitar archivo PDF"
                    >
                      Quitar
                    </Button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handlePdfDrop}
                    onClick={() => pdfInputRef.current?.click()}
                    className="group flex items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-line-strong bg-surface/50 p-3.5 text-left transition-colors hover:border-primary hover:bg-surface cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-ink group-hover:scale-105 transition-transform">
                        <FileUp className="size-5" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">
                          Adjuntar apunte o diapositivas en PDF (máx. 4 MB)
                        </p>
                        <p className="text-xs text-ink-3 truncate">
                          Arrastra o haz clic para subir diapositivas, fotocopias o apuntes escolares
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      type="button"
                      className="shrink-0 pointer-events-none"
                    >
                      Examinar
                    </Button>
                  </div>
                )}
              </div>

              {/* Textarea para el contenido */}
              <div>
                <Field
                  label={
                    pdfFile
                      ? "Instrucciones o notas adicionales (opcional)"
                      : "Texto, apunte o lección escolar"
                  }
                  hint={
                    pdfFile ? (
                      <span>Opcional: agrega notas pedagógicas o aclaraciones para complementar el PDF adjunto.</span>
                    ) : (
                      <span className="flex items-center justify-between w-full">
                        <span>Pega aquí la lectura o apunte escolar.</span>
                        <span
                          className={cn(
                            "font-mono text-xs",
                            aiText.trim().length >= 30 ? "text-ok font-semibold" : "text-ink-3"
                          )}
                        >
                          {aiText.trim().length} / 30 car. mín.
                        </span>
                      </span>
                    )
                  }
                >
                  {(fieldProps) => (
                    <Textarea
                      {...fieldProps}
                      rows={pdfFile ? 3 : 6}
                      value={aiText}
                      onChange={(e) => setAiText(e.target.value)}
                      placeholder={
                        pdfFile
                          ? "Opcional: Por ejemplo, 'Hacer foco en la fase luminosa' o 'Adecuar para alumnos de 5to grado'..."
                          : "Ejemplo: El ciclo del agua describe la presencia y el movimiento del agua en la Tierra y sobre ella. La evaporación ocurre cuando el sol calienta el agua superficial, transformándola en vapor. Luego, la condensación forma nubes y la precipitación regresa el agua a la tierra en forma de lluvia o nieve..."
                      }
                      className="text-xs leading-relaxed"
                    />
                  )}
                </Field>
              </div>

              {/* Selector de nivel */}
              <div>
                <Segmented<"inicial" | "primaria" | "secundaria">
                  label="Nivel educativo"
                  value={aiLevel}
                  onChange={setAiLevel}
                  options={[
                    { value: "inicial", label: "Inicial", hint: "4 a 6 años" },
                    { value: "primaria", label: "Primaria", hint: "6 a 12 años" },
                    { value: "secundaria", label: "Secundaria", hint: "12 a 18 años" },
                  ]}
                />
              </div>

              {/* Selector de actividades a generar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-ink-3 uppercase tracking-wider">
                    Actividades a generar ({selectedTypes.length})
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedTypes([...PACK_ACTIVITIES])}
                    className="text-xs text-primary hover:underline cursor-pointer"
                  >
                    Seleccionar todas (6)
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PACK_ACTIVITIES.map((type) => {
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
          ) : (
            /* Modo CSV (Pegar o Archivo) */
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

              {/* Contenido de entrada CSV */}
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
                      {PACK_ACTIVITIES.map((type) => {
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
        </div>
      )}
    </Modal>
  );
}
