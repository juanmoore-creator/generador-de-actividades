"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Plus,
  Trash2,
  Sparkles,
  BookOpen,
  Grid3X3,
  AlignLeft,
  RotateCcw,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { generateWordSearch, Difficulty } from "@/lib/generators/wordSearch";
import { generateCrossword } from "@/lib/generators/crossword";

// Importación dinámica con ssr: false para EVITAR errores de hidratación por Math.random()
const ActivityPreview = dynamic(
  () => import("@/components/ActivityPreview").then((mod) => mod.ActivityPreview),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col items-center justify-center min-h-[380px] text-slate-400">
        <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
        <p className="text-sm font-medium text-slate-600">Cargando vista previa interactiva...</p>
      </div>
    ),
  }
);

interface WordItem {
  word: string;
  clue: string;
}

const PRESETS: Record<string, { title: string; items: WordItem[] }> = {
  animales: {
    title: "Animales del Mundo",
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
    items: [
      { word: "CORAZON", clue: "Órgano muscular que bombea sangre a todo el cuerpo" },
      { word: "CEREBRO", clue: "Centro de control del sistema nervioso central" },
      { word: "PULMON", clue: "Órgano principal del sistema respiratorio" },
      { word: "HUESO", clue: "Estructura rígida que forma el esqueleto" },
      { word: "MUSCULO", clue: "Tejido que permite el movimiento y la fuerza" },
    ],
  },
};

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [type, setType] = useState<"wordsearch" | "crossword">("wordsearch");
  const [title, setTitle] = useState("Animales del Mundo");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [items, setItems] = useState<WordItem[]>(PRESETS.animales.items);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-900 pb-16">
      {/* Barra superior / Navbar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-xl shadow-xs">
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
                Generador de Actividades
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Herramienta para docentes: sopas de letras y crucigramas imprimibles
              </p>
            </div>
          </div>

          {/* Selector de Presets Rápidos */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium hidden md:inline mr-1">
              Ejemplos rápidos:
            </span>
            <button
              type="button"
              onClick={() => loadPreset("animales")}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 font-medium text-slate-700 transition-colors cursor-pointer"
            >
              Animales
            </button>
            <button
              type="button"
              onClick={() => loadPreset("solar")}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 font-medium text-slate-700 transition-colors cursor-pointer"
            >
              Sistema Solar
            </button>
            <button
              type="button"
              onClick={() => loadPreset("cuerpo")}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 font-medium text-slate-700 transition-colors cursor-pointer"
            >
              Cuerpo Humano
            </button>
          </div>
        </div>
      </header>

      {/* Contenedor principal de 2 columnas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Columna Izquierda: Configuración y Datos (5 columnas) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Tarjeta de Configuración */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sparkles size={18} className="text-blue-600" />
                Configuración de la Actividad
              </h2>

              {/* Título de la actividad */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Título para el encabezado del PDF
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Repaso de Ciencias Naturales"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all bg-white"
                />
              </div>

              {/* Selector de Tipo */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tipo de Actividad
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setType("wordsearch")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      type === "wordsearch"
                        ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Grid3X3 size={16} />
                    Sopa de Letras
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("crossword")}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      type === "crossword"
                        ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <AlignLeft size={16} />
                    Crucigrama
                  </button>
                </div>
              </div>

              {/* Selector de Dificultad (solo para Sopa de Letras) */}
              {type === "wordsearch" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nivel de Dificultad
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "easy", label: "Fácil", desc: "Derecha y Abajo" },
                      { id: "medium", label: "Medio", desc: "Con Diagonales" },
                      { id: "hard", label: "Difícil", desc: "Todas dir. e invertidas" },
                    ].map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDifficulty(d.id as Difficulty)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          difficulty === d.id
                            ? "bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-100"
                            : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <div className="text-xs font-bold">{d.label}</div>
                        <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                          {d.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Información automática de tamaño */}
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                <BookOpen size={16} className="shrink-0 mt-0.5 text-blue-600" />
                <span>
                  <strong>Cálculo inteligente:</strong> El tamaño de la cuadrícula y las celdas se calculan automáticamente según el largo y cantidad de palabras para que quepa de forma óptima en una hoja A4.
                </span>
              </div>
            </div>

            {/* Tarjeta de Palabras y Definiciones */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-800">
                    Palabras y Definiciones
                  </h2>
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold">
                    {items.filter((i) => i.word.trim()).length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={clearItems}
                    title="Vaciar lista"
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                  >
                    <RotateCcw size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer"
                  >
                    <Plus size={15} />
                    Agregar Fila
                  </button>
                </div>
              </div>

              {/* Lista dinámica de palabras */}
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all flex items-start gap-2.5"
                  >
                    <span className="text-xs font-mono font-bold text-slate-400 mt-2.5 w-4 text-center">
                      {idx + 1}
                    </span>

                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={item.word}
                        onChange={(e) => updateItem(idx, "word", e.target.value)}
                        placeholder="Palabra (ej: FOTOSINTESIS)"
                        className="w-full bg-white px-3 py-1.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-100 outline-none uppercase font-mono text-xs font-semibold tracking-wider"
                      />
                      {type === "crossword" && (
                        <input
                          type="text"
                          value={item.clue}
                          onChange={(e) => updateItem(idx, "clue", e.target.value)}
                          placeholder="Pista / Definición para el alumno..."
                          className="w-full bg-white px-3 py-1.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-100 outline-none text-xs text-slate-700"
                        />
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      disabled={items.length === 1}
                      title="Eliminar fila"
                      className="p-2 text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-slate-400 rounded-lg transition-colors cursor-pointer mt-0.5"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addItem}
                className="w-full py-2.5 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 text-slate-500 hover:text-blue-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus size={16} />
                Agregar otra palabra
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
