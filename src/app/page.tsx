"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import {
  Plus,
  Trash2,
  Sparkles,
  Grid3X3,
  AlignLeft,
  RotateCcw,
  GraduationCap,
  Loader2,
  Lightbulb,
  FileCheck,
} from "lucide-react";
import { generateWordSearch, Difficulty } from "@/lib/generators/wordSearch";
import { generateCrossword } from "@/lib/generators/crossword";

// Importación dinámica con ssr: false para evitar discrepancias de hidratación con Math.random()
const ActivityPreview = dynamic(
  () => import("@/components/ActivityPreview").then((mod) => mod.ActivityPreview),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-3xl border border-stone-200/90 p-12 flex flex-col items-center justify-center min-h-[460px] text-stone-400 shadow-xs">
        <Loader2 className="animate-spin text-orange-500 mb-3" size={36} />
        <p className="text-sm font-semibold text-stone-700">Cargando vista previa interactiva...</p>
        <p className="text-xs text-stone-400 mt-1">Preparando la cuadrícula pedagógica</p>
      </div>
    ),
  }
);

interface WordItem {
  word: string;
  clue: string;
}

const PRESETS: Record<string, { title: string; emoji: string; items: WordItem[] }> = {
  animales: {
    title: "Animales del Mundo",
    emoji: "🦁",
    items: [
      { word: "ELEFANTE", clue: "Mamífero terrestre más grande con trompa larga" },
      { word: "JIRAFA", clue: "Animal de cuello largo que come hojas de acacias" },
      { word: "DELFIN", clue: "Mamífero acuático muy inteligente" },
      { word: "LEON", clue: "Conocido popularmente como el rey de la selva" },
      { word: "AGUILA", clue: "Ave rapaz con vista sumamente aguda" },
      { word: "PANGOLIN", clue: "Mamífero cubierto de duras escamas protectoras" },
    ],
  },
  solar: {
    title: "El Sistema Solar",
    emoji: "🪐",
    items: [
      { word: "SOL", clue: "Estrella en el centro de nuestro sistema planetario" },
      { word: "TIERRA", clue: "Nuestro planeta, el único conocido con vida" },
      { word: "JUPITER", clue: "El planeta más grande del sistema solar" },
      { word: "SATURNO", clue: "Planeta famoso por sus espectaculares anillos" },
      { word: "MARTE", clue: "Conocido como el planeta rojo" },
      { word: "COMETA", clue: "Cuerpo celeste de hielo y roca con brillante cola" },
    ],
  },
  cuerpo: {
    title: "El Cuerpo Humano",
    emoji: "🫀",
    items: [
      { word: "CORAZON", clue: "Órgano muscular que bombea sangre a todo el cuerpo" },
      { word: "CEREBRO", clue: "Centro de control del sistema nervioso central" },
      { word: "PULMON", clue: "Órgano principal del sistema respiratorio" },
      { word: "HUESO", clue: "Estructura rígida que forma el esqueleto" },
      { word: "MUSCULO", clue: "Tejido que permite el movimiento y la fuerza" },
    ],
  },
  plantas: {
    title: "Botánica y Naturaleza",
    emoji: "🌿",
    items: [
      { word: "CLOROFILA", clue: "Pigmento verde esencial para la fotosíntesis" },
      { word: "RAIZ", clue: "Parte de la planta que absorbe agua del suelo" },
      { word: "SEMILLA", clue: "Estructura que da origen a una nueva planta" },
      { word: "POLEM", clue: "Polvo fino producido por las flores" },
      { word: "TALLO", clue: "Sostiene las hojas, flores y frutos" },
    ],
  },
};

const emptySubscribe = () => () => {};

export default function Home() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [type, setType] = useState<"wordsearch" | "crossword">("wordsearch");
  const [title, setTitle] = useState("Animales del Mundo");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [items, setItems] = useState<WordItem[]>(PRESETS.animales.items);

  const addItem = () => {
    setItems((prev) => [...prev, { word: "", clue: "" }]);
  };

  const updateItem = (index: number, field: "word" | "clue", value: string) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const clearItems = () => {
    setItems([{ word: "", clue: "" }]);
  };

  const loadPreset = (key: keyof typeof PRESETS) => {
    const preset = PRESETS[key];
    setTitle(preset.title);
    setItems(preset.items);
  };

  // Solo calculamos en el cliente cuando está montado para evitar discrepancias de SSR
  const wordSearchResult = useMemo(() => {
    if (!isMounted || type !== "wordsearch") return null;
    const words = items.map((i) => i.word).filter((w) => w.trim().length > 0);
    return generateWordSearch(words, difficulty);
  }, [isMounted, type, items, difficulty]);

  const crosswordResult = useMemo(() => {
    if (!isMounted || type !== "crossword") return null;
    const validItems = items.filter((i) => i.word.trim().length > 0);
    return generateCrossword(validItems);
  }, [isMounted, type, items]);

  const validWordsCount = items.filter((i) => i.word.trim().length > 0).length;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-800 pb-20 selection:bg-orange-200 selection:text-orange-900">
      {/* Barra superior con identidad EduLúdica */}
      <header className="bg-white/95 backdrop-blur-md border-b border-stone-200/90 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-amber-400 text-white flex items-center justify-center shadow-md shadow-orange-500/20 ring-4 ring-orange-100">
              <GraduationCap size={24} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-stone-900 font-heading">
                  GenAct
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-orange-100 text-orange-800 border border-orange-200/60">
                  Edición Docente
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block font-medium">
                Generador de pasatiempos y fichas educativas listas para imprimir en A4
              </p>
            </div>
          </div>

          {/* Selector de Presets Rápidos */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-stone-400 font-semibold hidden md:inline mr-1 text-[11px] uppercase tracking-wider">
              Temas listos:
            </span>
            {Object.entries(PRESETS).map(([key, p]) => (
              <button
                key={key}
                type="button"
                onClick={() => loadPreset(key as keyof typeof PRESETS)}
                className={`px-3 py-1.5 rounded-xl border font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  title === p.title
                    ? "bg-orange-50 text-orange-800 border-orange-300 shadow-xs"
                    : "border-stone-200 bg-white hover:bg-stone-50 text-stone-700 hover:border-stone-300"
                }`}
              >
                <span>{p.emoji}</span>
                <span className="hidden sm:inline">{p.title.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Contenedor principal de 2 columnas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Columna Izquierda: Configuración y Datos (5 columnas) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Tarjeta 1: Configuración de la Actividad */}
            <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3.5">
                <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 font-heading">
                  <div className="p-1.5 rounded-lg bg-orange-100 text-orange-600">
                    <Sparkles size={16} />
                  </div>
                  Configuración de la Hoja
                </h2>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 flex items-center gap-1">
                  <FileCheck size={13} className="text-teal-600" />
                  PDF A4
                </span>
              </div>

              {/* Selector de Tipo (Pills grandes y táctiles) */}
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
                  1. Formato de Juego
                </label>
                <div className="grid grid-cols-2 gap-2.5 p-1.5 bg-stone-100/90 rounded-2xl border border-stone-200/70">
                  <button
                    type="button"
                    onClick={() => setType("wordsearch")}
                    className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      type === "wordsearch"
                        ? "bg-white text-orange-600 shadow-sm border border-stone-200/80 scale-[1.01]"
                        : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50"
                    }`}
                  >
                    <Grid3X3 size={17} className={type === "wordsearch" ? "text-orange-500" : "text-stone-400"} />
                    Sopa de Letras
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("crossword")}
                    className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      type === "crossword"
                        ? "bg-white text-teal-700 shadow-sm border border-stone-200/80 scale-[1.01]"
                        : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50"
                    }`}
                  >
                    <AlignLeft size={17} className={type === "crossword" ? "text-teal-600" : "text-stone-400"} />
                    Crucigrama
                  </button>
                </div>
              </div>

              {/* Título de la actividad */}
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
                  2. Título de la Ficha Escolar
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: Repaso de Ciencias Naturales"
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none text-sm font-semibold transition-all bg-stone-50/50 hover:bg-white focus:bg-white text-stone-900"
                  />
                </div>
                <p className="text-[11px] text-stone-400 mt-1.5 ml-1">
                  Este encabezado se imprimirá destacado en la parte superior del PDF.
                </p>
              </div>

              {/* Selector de Dificultad (solo para Sopa de Letras) */}
              {type === "wordsearch" && (
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
                    3. Nivel de Dificultad
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        id: "easy",
                        label: "Fácil",
                        desc: "Derecha y Abajo",
                        badge: "🟢 Primaria",
                      },
                      {
                        id: "medium",
                        label: "Medio",
                        desc: "Con Diagonales",
                        badge: "🟡 Estándar",
                      },
                      {
                        id: "hard",
                        label: "Difícil",
                        desc: "Invertidas y cruzadas",
                        badge: "🔴 Reto",
                      },
                    ].map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDifficulty(d.id as Difficulty)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          difficulty === d.id
                            ? "bg-orange-50/80 border-orange-400 text-orange-900 ring-2 ring-orange-200 shadow-xs"
                            : "bg-white border-stone-200 hover:border-stone-300 text-stone-700"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold">{d.label}</span>
                          </div>
                          <p className="text-[10px] text-stone-500 mt-1 leading-tight">{d.desc}</p>
                        </div>
                        <span className="text-[9px] font-bold mt-2 opacity-80">{d.badge}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Callout pedagógico */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
                <div className="p-1 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                  <Lightbulb size={15} />
                </div>
                <div className="leading-relaxed text-[11.5px]">
                  <strong>Cálculo proporcional A4:</strong> La cuadrícula ajusta su tamaño
                  automáticamente para garantizar casilleros amplios y legibles tanto en pantalla como al fotocopiar.
                </div>
              </div>
            </div>

            {/* Tarjeta 2: Palabras y Pistas */}
            <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-base font-bold text-stone-900 font-heading">
                    Palabras del Ejercicio
                  </h2>
                  <span className="bg-orange-100 text-orange-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                    {validWordsCount} {validWordsCount === 1 ? "palabra" : "palabras"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={clearItems}
                    title="Vaciar lista"
                    className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <RotateCcw size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    <Plus size={15} />
                    Añadir Fila
                  </button>
                </div>
              </div>

              {/* Lista dinámica de palabras con estilo de tarjetas */}
              <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-stone-50/70 rounded-2xl border border-stone-200/80 hover:border-orange-200 hover:bg-white transition-all flex items-start gap-3 group"
                  >
                    <span className="w-6 h-6 rounded-lg bg-stone-200/80 group-hover:bg-orange-100 group-hover:text-orange-700 flex items-center justify-center text-[11px] font-bold text-stone-600 shrink-0 mt-1 font-mono">
                      {(idx + 1).toString().padStart(2, "0")}
                    </span>

                    <div className="flex-1 space-y-2">
                      <div>
                        <input
                          type="text"
                          value={item.word}
                          onChange={(e) => updateItem(idx, "word", e.target.value)}
                          placeholder="PALABRA (EJ: PLANETA)"
                          className="w-full bg-white px-3.5 py-2 rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none uppercase font-mono text-xs font-bold tracking-wider text-stone-900 shadow-2xs"
                        />
                      </div>
                      {type === "crossword" && (
                        <div>
                          <input
                            type="text"
                            value={item.clue}
                            onChange={(e) => updateItem(idx, "clue", e.target.value)}
                            placeholder="Pista o definición para el crucigrama..."
                            className="w-full bg-white px-3.5 py-1.5 rounded-xl border border-stone-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-xs text-stone-700 shadow-2xs"
                          />
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      disabled={items.length === 1}
                      title="Eliminar palabra"
                      className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-20 disabled:hover:text-stone-400 disabled:hover:bg-transparent rounded-xl transition-colors cursor-pointer mt-0.5"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addItem}
                className="w-full py-3 border-2 border-dashed border-stone-300 hover:border-orange-400 hover:bg-orange-50/50 text-stone-500 hover:text-orange-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus size={16} />
                Agregar otra palabra a la lista
              </button>
            </div>
          </div>

          {/* Columna Derecha: Vista Previa y Descarga de PDF (7 columnas) */}
          <div className="lg:col-span-7 sticky top-24">
            <ActivityPreview
              type={type}
              title={title}
              wordSearchResult={wordSearchResult}
              crosswordResult={crosswordResult}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
