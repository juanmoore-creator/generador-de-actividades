import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen, Bot, FileSpreadsheet, Sparkles, HelpCircle } from "lucide-react";
import { PromptActions, CopyCsvInlineButton } from "./PromptActions";
import { AI_SYSTEM_PROMPT } from "@/lib/csv/themePrompt";

export const metadata: Metadata = {
  title: "Instrucciones para generar actividades con IA | GenAct",
  description:
    "Especificación y guía para que ChatGPT, Claude o Gemini generen un archivo CSV de actividades educativas imprimibles (Sopas de letras, Crucigramas, Anagramas y Relacionar columnas) listo para importar en GenAct.",
};

const SAMPLE_CSV = `# tema: El Sistema Solar
palabra,pista
SOL,Estrella luminosa ubicada en el centro de nuestro sistema planetario
TIERRA,Tercer planeta desde el Sol y el único conocido con vida
LUNA,Satélite natural de la Tierra que refleja la luz del Sol
MARTE,Conocido como el planeta rojo por su óxido de hierro
JUPITER,El planeta gaseoso más grande del sistema solar
SATURNO,Planeta caracterizado por su llamativo sistema de anillos visibles
ORBITA,Trayectoria elíptica que recorre un cuerpo celeste alrededor de otro
ASTEROIDE,Cuerpo rocoso y metálico que orbita alrededor del Sol
COMETA,Cuerpo celeste de hielo y polvo que desarrolla una cola brillante
TELESCOPIO,Instrumento óptico utilizado para observar cuerpos celestes lejanos
ASTRONOMIA,Ciencia que estudia los cuerpos celestes y el universo
GRAVEDAD,Fuerza de atracción mutua entre los cuerpos del cosmos
`;

export default function InstruccionesIaPage() {
  return (
    <div className="min-h-dvh bg-bg text-ink">
      {/* Barra superior */}
      <header className="border-b border-line bg-surface/90 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink-3 transition-colors hover:text-ink cursor-pointer"
          >
            <ArrowLeft className="size-4" aria-hidden />
            <span>Volver a GenAct</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-primary font-mono text-xs font-bold text-on-primary">
              GA
            </span>
            <span className="font-heading font-bold text-ink">GenAct IA Docs</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 space-y-10">
        {/* Cabecera del documento */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-ink">
            <Sparkles className="size-3.5" aria-hidden />
            <span>Generación asistida con IA</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-ink font-heading">
            Crea un Pack Temático de Actividades con Inteligencia Artificial
          </h1>
          <p className="text-base sm:text-lg text-ink-2 max-w-3xl leading-relaxed">
            Copia nuestro prompt de instrucciones y pégalo en cualquier chat de IA (<strong>ChatGPT, Claude, Gemini</strong>) junto con tus textos,
            resúmenes o apuntes. La IA te devolverá directamente el código CSV para generar
            automáticamente <strong>Sopas de letras, Crucigramas, Anagramas y Relacionar columnas</strong> en segundos,{" "}
            <strong>sin necesidad de que la IA tenga navegación web ni conexión a internet</strong>.
          </p>

          <div className="pt-2">
            <PromptActions promptText={AI_SYSTEM_PROMPT} sampleCsv={SAMPLE_CSV} />
          </div>
        </section>

        {/* Guía en 3 pasos para docentes y usuarios */}
        <section aria-labelledby="pasos-title" className="space-y-4">
          <h2 id="pasos-title" className="text-xl font-bold text-ink flex items-center gap-2">
            <BookOpen className="size-5 text-accent-ink" aria-hidden />
            <span>¿Cómo funciona el flujo?</span>
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-line bg-surface p-5 space-y-2">
              <span className="grid size-8 place-items-center rounded-xl bg-surface-2 font-mono text-sm font-bold text-ink">
                1
              </span>
              <h3 className="font-bold text-ink">Copia y pega el prompt</h3>
              <p className="text-sm text-ink-3">
                Toca el botón <strong>«Copiar prompt para la IA»</strong> y pégalo en tu chat (ChatGPT, Claude o Gemini).
                Debajo, añade el texto o apunte del tema que quieras trabajar.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-5 space-y-2">
              <span className="grid size-8 place-items-center rounded-xl bg-surface-2 font-mono text-sm font-bold text-ink">
                2
              </span>
              <h3 className="font-bold text-ink">Copia el CSV generado</h3>
              <p className="text-sm text-ink-3">
                La IA extraerá entre 12 y 20 conceptos y sus pistas didácticas, entregándote un bloque de texto en formato
                CSV listo para copiar.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-5 space-y-2">
              <span className="grid size-8 place-items-center rounded-xl bg-surface-2 font-mono text-sm font-bold text-ink">
                3
              </span>
              <h3 className="font-bold text-ink">Pégalo en GenAct</h3>
              <p className="text-sm text-ink-3">
                Vuelve a GenAct y pega el texto del CSV en <strong>«Crear Pack Temático»</strong>. El sistema construirá
                todas las fichas del tema listas para imprimir en PDF.
              </p>
            </div>
          </div>
        </section>

        {/* Especificación técnica para el modelo de IA */}
        <section aria-labelledby="ai-spec-title" className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 id="ai-spec-title" className="text-xl font-bold text-ink flex items-center gap-2">
              <Bot className="size-5 text-accent-ink" aria-hidden />
              <span>Instrucciones directas para el Modelo de IA (System Prompt)</span>
            </h2>
            <a
              href="/instrucciones-ia/prompt"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-mono text-accent-ink hover:underline"
            >
              Ver en texto plano (prompt.txt) ↗
            </a>
          </div>

          <p className="text-sm text-ink-3">
            El siguiente bloque contiene el prompt completo listo para copiar. Pégalo en ChatGPT, Claude o Gemini junto con tus textos o apuntes para obtener tu CSV al instante:
          </p>

          <div className="relative rounded-2xl border border-line-strong bg-surface-2/60 p-4 sm:p-6 font-mono text-xs sm:text-sm text-ink leading-relaxed overflow-x-auto whitespace-pre-wrap">
            {AI_SYSTEM_PROMPT}
          </div>
        </section>

        {/* Ejemplo del archivo CSV */}
        <section aria-labelledby="example-csv-title" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="example-csv-title" className="text-xl font-bold text-ink flex items-center gap-2">
              <FileSpreadsheet className="size-5 text-accent-ink" aria-hidden />
              <span>Ejemplo de CSV válido generado</span>
            </h2>
            <CopyCsvInlineButton csvText={SAMPLE_CSV} />
          </div>

          <div className="rounded-2xl border border-line bg-surface p-4 sm:p-6 space-y-4">
            <p className="text-sm text-ink-3">
              Un archivo CSV válido debe contener la línea del tema precedida de <code># tema:</code>, seguida de las columnas{" "}
              <code>palabra,pista</code>:
            </p>
            <pre className="rounded-xl bg-surface-2 p-4 font-mono text-xs sm:text-sm text-ink-2 overflow-x-auto">
              <code>{SAMPLE_CSV}</code>
            </pre>
          </div>
        </section>

        {/* Preguntas frecuentes / Consejos */}
        <section aria-labelledby="faq-title" className="space-y-4">
          <h2 id="faq-title" className="text-xl font-bold text-ink flex items-center gap-2">
            <HelpCircle className="size-5 text-accent-ink" aria-hidden />
            <span>Recomendaciones y Preguntas Frecuentes</span>
          </h2>

          <div className="space-y-3">
            <details className="group rounded-xl border border-line bg-surface p-4 text-sm [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-ink">
                <span>¿Cuántas palabras conviene que tenga el archivo?</span>
                <span className="transition-transform group-open:rotate-180">▾</span>
              </summary>
              <p className="mt-2 text-ink-3 leading-relaxed">
                Recomendamos entre <strong>12 y 20 palabras</strong>. Esto garantiza que haya suficiente vocabulario para
                armar una sopa de letras densa, un crucigrama bien entrecruzado y actividades de emparejamiento con variedad.
              </p>
            </details>

            <details className="group rounded-xl border border-line bg-surface p-4 text-sm [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-ink">
                <span>¿Qué pasa si una palabra tiene espacios o caracteres especiales?</span>
                <span className="transition-transform group-open:rotate-180">▾</span>
              </summary>
              <p className="mt-2 text-ink-3 leading-relaxed">
                El sistema de GenAct sanitiza automáticamente las palabras removiendo espacios y tildes para que encajen en
                las cuadrículas (por ejemplo, <em>&quot;CÉLULA ANIMAL&quot;</em> se normaliza a <em>&quot;CELULAANIMAL&quot;</em>). No obstante, es
                preferible que la IA entregue términos simples de una sola palabra.
              </p>
            </details>

            <details className="group rounded-xl border border-line bg-surface p-4 text-sm [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-ink">
                <span>¿Admite comas dentro de las pistas o definiciones?</span>
                <span className="transition-transform group-open:rotate-180">▾</span>
              </summary>
              <p className="mt-2 text-ink-3 leading-relaxed">
                ¡Sí! Si la pista contiene comas, la IA la envolverá entre comillas dobles (formato estándar RFC-4180). Nuestro
                lector las procesa sin problemas. También se admiten archivos delimitados por punto y coma (<code>;</code>)
                exportados desde Excel en español.
              </p>
            </details>
          </div>
        </section>
      </main>

      <footer className="mt-16 border-t border-line py-8 text-center text-xs text-ink-3">
        <p>GenAct · Generador de Actividades Educativas Imprimibles</p>
      </footer>
    </div>
  );
}
