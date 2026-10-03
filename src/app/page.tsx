"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import {
  Plus,
  Trash2,
  RotateCcw,
  Loader2,
  RefreshCw,
  Printer,
  SlidersHorizontal,
} from "lucide-react";
import { ActivityCategoryPicker } from "@/components/ActivityCategoryPicker";
import { ACTIVITIES } from "@/lib/registry";
import { ActivityType, Difficulty, WordItem } from "@/lib/types/activities";
import { generateWordSearch } from "@/lib/generators/wordSearch";
import { generateCrossword } from "@/lib/generators/crossword";
import { generateWordScramble } from "@/lib/generators/wordScramble";
import { generateMatching } from "@/lib/generators/matching";
import { generateCryptogram } from "@/lib/generators/cryptogram";
import { generateClozeTest } from "@/lib/generators/clozeTest";
import { generateRosco } from "@/lib/generators/rosco";
import { generateSudoku } from "@/lib/generators/sudoku";
import { generateMathPyramids } from "@/lib/generators/mathPyramid";
import { generateCrossMath } from "@/lib/generators/crossMath";
import { generateMaze } from "@/lib/generators/maze";
import {
  generateCoordinatePixelArt,
  PIXEL_TEMPLATES,
} from "@/lib/generators/coordinatePixelArt";

// Dynamic import with ssr: false to prevent hydration divergence
const ActivityPreview = dynamic(
  () => import("@/components/ActivityPreview").then((mod) => mod.ActivityPreview),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 flex flex-col items-center justify-center min-h-[460px] text-slate-400">
        <Loader2 className="animate-spin text-slate-700 mb-2" size={28} />
        <p className="text-xs font-semibold text-slate-600">Cargando mesa de trabajo...</p>
      </div>
    ),
  }
);

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

  const [type, setType] = useState<ActivityType>("wordsearch");
  const [title, setTitle] = useState("Animales del Mundo");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [regenerateKey, setRegenerateKey] = useState(0);

  // Word-based activities
  const [items, setItems] = useState<WordItem[]>(PRESETS.animales.items);

  // Text-based activities
  const [cryptoPhrase, setCryptoPhrase] = useState(
    "EL SOL ES LA ESTRELLA MAS CERCANA A NUESTRO PLANETA TIERRA"
  );
  const [cryptoHint, setCryptoHint] = useState("Astronomía básica");
  const [clozeText, setClozeText] = useState(
    "Los [planetas] giran alrededor del [sol] describiendo órbitas elípticas. La [tierra] es el tercer planeta y el único donde se conoce la existencia de [vida]. Su satélite natural es la [luna]."
  );

  // Sudoku state
  const [sudokuSize, setSudokuSize] = useState<4 | 6 | 9>(9);
  const [sudokuEmojis, setSudokuEmojis] = useState(false);

  // Pyramid state
  const [pyramidLevels, setPyramidLevels] = useState<number>(4);
  const [pyramidCount, setPyramidCount] = useState<number>(2);

  // Maze state
  const [mazeSize, setMazeSize] = useState<number>(15);

  // Pixel Art state
  const [pixelArtKey, setPixelArtKey] = useState<string>("corazon");

  const handleSelectActivity = (newType: ActivityType) => {
    setType(newType);
    const meta = ACTIVITIES.find((a) => a.id === newType);
    if (meta) {
      setTitle(meta.defaultTitle);
    }
  };

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

  // Reactive generator computations
  const wordSearchResult = useMemo(() => {
    void regenerateKey;
    if (!isMounted || type !== "wordsearch") return null;
    const words = items.map((i) => i.word).filter((w) => w.trim().length > 0);
    return generateWordSearch(words, difficulty);
  }, [isMounted, type, items, difficulty, regenerateKey]);

  const crosswordResult = useMemo(() => {
    void regenerateKey;
    if (!isMounted || type !== "crossword") return null;
    const validItems = items.filter((i) => i.word.trim().length > 0);
    return generateCrossword(validItems);
  }, [isMounted, type, items, regenerateKey]);

  const scrambleResult = useMemo(() => {
    void regenerateKey;
    if (!isMounted || type !== "scramble") return null;
    return generateWordScramble(items);
  }, [isMounted, type, items, regenerateKey]);

  const matchingResult = useMemo(() => {
    void regenerateKey;
    if (!isMounted || type !== "matching") return null;
    return generateMatching(items);
  }, [isMounted, type, items, regenerateKey]);

  const cryptogramResult = useMemo(() => {
    void regenerateKey;
    if (!isMounted || type !== "cryptogram") return null;
    return generateCryptogram(cryptoPhrase, cryptoHint, difficulty);
  }, [isMounted, type, cryptoPhrase, cryptoHint, difficulty, regenerateKey]);

  const clozeResult = useMemo(() => {
    void regenerateKey;
    if (!isMounted || type !== "cloze") return null;
    return generateClozeTest(clozeText, title);
  }, [isMounted, type, clozeText, title, regenerateKey]);

  const roscoResult = useMemo(() => {
    void regenerateKey;
    if (!isMounted || type !== "rosco") return null;
    return generateRosco();
  }, [isMounted, type, regenerateKey]);

  const sudokuResult = useMemo(() => {
    void regenerateKey;
    if (!isMounted || type !== "sudoku") return null;
    return generateSudoku(sudokuSize, difficulty, sudokuEmojis);
  }, [isMounted, type, sudokuSize, difficulty, sudokuEmojis, regenerateKey]);

  const mathPyramidResult = useMemo(() => {
    void regenerateKey;
    if (!isMounted || type !== "mathpyramid") return null;
    return generateMathPyramids(pyramidCount, pyramidLevels, difficulty);
  }, [isMounted, type, pyramidCount, pyramidLevels, difficulty, regenerateKey]);

  const crossMathResult = useMemo(() => {
    void regenerateKey;
    if (!isMounted || type !== "crossmath") return null;
    return generateCrossMath(difficulty);
  }, [isMounted, type, difficulty, regenerateKey]);

  const mazeResult = useMemo(() => {
    void regenerateKey;
    if (!isMounted || type !== "maze") return null;
    return generateMaze(mazeSize, mazeSize);
  }, [isMounted, type, mazeSize, regenerateKey]);

  const pixelArtResult = useMemo(() => {
    void regenerateKey;
    if (!isMounted || type !== "pixelart") return null;
    return generateCoordinatePixelArt(pixelArtKey);
  }, [isMounted, type, pixelArtKey, regenerateKey]);

  const validWordsCount = items.filter((i) => i.word.trim().length > 0).length;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-24">
      {/* Studio Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Monogram */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs font-mono">
              GA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-slate-950 font-heading">
                  GenAct
                </span>
                <span className="text-[10px] font-semibold text-slate-500 font-mono border-l border-slate-200 pl-2">
                  Atelier Editorial A4
                </span>
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium hidden md:inline mr-1 text-[11px]">
              Temas listos:
            </span>
            {Object.entries(PRESETS).map(([key, p]) => (
              <button
                key={key}
                type="button"
                onClick={() => loadPreset(key as keyof typeof PRESETS)}
                className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all duration-150 cursor-pointer flex items-center gap-1.5 active:scale-[0.98] ${
                  title === p.title
                    ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                }`}
              >
                <span>{p.emoji}</span>
                <span className="hidden sm:inline">{p.title.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Two-Column Studio Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* Left Column: Configuration & Content (5 columns) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Card 1: Activity Format & General Options */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2 tracking-tight uppercase">
                  <SlidersHorizontal size={14} className="text-slate-500" />
                  Formato de Actividad
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRegenerateKey((k) => k + 1)}
                    title="Generar nueva variación aleatoria"
                    className="px-2 py-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium active:scale-[0.97]"
                  >
                    <RefreshCw size={12} className="stroke-[2.2]" />
                    <span>Regenerar</span>
                  </button>
                </div>
              </div>

              {/* Categorized Activity Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Tipo de Juego
                </label>
                <ActivityCategoryPicker
                  selectedType={type}
                  onSelect={handleSelectActivity}
                />
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Título de la Ficha
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Repaso de Ciencias Naturales"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10 outline-none text-xs font-semibold transition-all bg-white text-slate-900 shadow-2xs"
                />
              </div>

              {/* Difficulty Controls */}
              {["wordsearch", "cryptogram", "sudoku", "mathpyramid", "crossmath"].includes(
                type
              ) && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nivel de Dificultad
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "easy", label: "Fácil", badge: "Inicial" },
                      { id: "medium", label: "Medio", badge: "Estándar" },
                      { id: "hard", label: "Difícil", badge: "Reto" },
                    ].map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDifficulty(d.id as Difficulty)}
                        className={`py-2 px-1 rounded-xl border text-center transition-all duration-150 cursor-pointer flex flex-col items-center justify-center active:scale-[0.98] ${
                          difficulty === d.id
                            ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                            : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <span className="text-xs font-bold">{d.label}</span>
                        <span className="text-[10px] opacity-70 mt-0.5 font-medium">
                          {d.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sudoku Controls */}
              {type === "sudoku" && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-700">
                    Tamaño del Tablero
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { size: 4, label: "4x4 (Infantil)" },
                      { size: 6, label: "6x6 (Junior)" },
                      { size: 9, label: "9x9 (Clásico)" },
                    ].map((s) => (
                      <button
                        key={s.size}
                        type="button"
                        onClick={() => setSudokuSize(s.size as 4 | 6 | 9)}
                        className={`py-2 text-center rounded-xl border text-xs font-semibold transition-all cursor-pointer active:scale-[0.98] ${
                          sudokuSize === s.size
                            ? "bg-slate-900 text-white border-slate-900 font-bold"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={sudokuEmojis}
                      onChange={(e) => setSudokuEmojis(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                    />
                    Modo infantil con iconos animales (🐱🐶🐰🦊)
                  </label>
                </div>
              )}

              {/* Math Pyramid Controls */}
              {type === "mathpyramid" && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Pisos de la Pirámide
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[3, 4].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setPyramidLevels(lvl)}
                          className={`py-2 text-center rounded-xl border text-xs font-semibold transition-all cursor-pointer active:scale-[0.98] ${
                            pyramidLevels === lvl
                              ? "bg-slate-900 text-white border-slate-900 font-bold"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {lvl} Niveles
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Cantidad de Ejercicios por Hoja
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setPyramidCount(cnt)}
                          className={`py-2 text-center rounded-xl border text-xs font-semibold transition-all cursor-pointer active:scale-[0.98] ${
                            pyramidCount === cnt
                              ? "bg-slate-900 text-white border-slate-900 font-bold"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {cnt} {cnt === 1 ? "Pirámide" : "Pirámides"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Maze Controls */}
              {type === "maze" && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-700">
                    Complejidad del Laberinto
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { size: 11, label: "Pequeño (11x11)" },
                      { size: 15, label: "Mediano (15x15)" },
                      { size: 21, label: "Grande (21x21)" },
                    ].map((m) => (
                      <button
                        key={m.size}
                        type="button"
                        onClick={() => setMazeSize(m.size)}
                        className={`py-2 text-center rounded-xl border text-xs font-semibold transition-all cursor-pointer active:scale-[0.98] ${
                          mazeSize === m.size
                            ? "bg-slate-900 text-white border-slate-900 font-bold"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pixel Art Controls */}
              {type === "pixelart" && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-700">
                    Dibujo / Mosaico
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.values(PIXEL_TEMPLATES).map((tmpl) => (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => setPixelArtKey(tmpl.id)}
                        className={`py-2 px-1 text-center rounded-xl border text-xs font-semibold transition-all cursor-pointer active:scale-[0.98] ${
                          pixelArtKey === tmpl.id
                            ? "bg-slate-900 text-white border-slate-900 font-bold"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {tmpl.name.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Print Specs Callout */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <Printer size={13} className="text-slate-400" />
                  Salida vectorial optimizada para fotocopias en A4
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-semibold">
                  300 DPI
                </span>
              </div>
            </div>

            {/* Card 2: Dynamic Content Editor */}

            {/* A) Word-based (WordSearch, Crossword, Scramble, Matching) */}
            {["wordsearch", "crossword", "scramble", "matching"].includes(type) && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
                      Lista de Palabras
                    </h3>
                    <span className="text-[11px] font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {validWordsCount}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={clearItems}
                      title="Reiniciar lista"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <RotateCcw size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={addItem}
                      className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-2xs cursor-pointer"
                    >
                      <Plus size={13} />
                      Añadir
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50/70 rounded-xl border border-slate-200/90 hover:border-slate-300 hover:bg-white transition-all flex items-start gap-2.5 group"
                    >
                      <span className="w-5 h-5 rounded bg-slate-200/80 text-slate-600 flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-1.5">
                        {(idx + 1).toString().padStart(2, "0")}
                      </span>

                      <div className="flex-1 space-y-1.5">
                        <input
                          type="text"
                          value={item.word}
                          onChange={(e) => updateItem(idx, "word", e.target.value)}
                          placeholder="PALABRA"
                          className="w-full bg-white px-3 py-1.5 rounded-lg border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none uppercase font-mono text-xs font-bold tracking-wide text-slate-900 shadow-2xs"
                        />
                        {["crossword", "matching", "scramble"].includes(type) && (
                          <input
                            type="text"
                            value={item.clue}
                            onChange={(e) => updateItem(idx, "clue", e.target.value)}
                            placeholder="Pista o definición..."
                            className="w-full bg-white px-3 py-1.5 rounded-lg border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none text-xs text-slate-700 shadow-2xs"
                          />
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        disabled={items.length === 1}
                        title="Eliminar palabra"
                        className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-20 disabled:hover:text-slate-300 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer mt-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  className="w-full py-2.5 border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <Plus size={14} />
                  Añadir otra palabra
                </button>
              </div>
            )}

            {/* B) Cryptogram Editor */}
            {type === "cryptogram" && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-3.5">
                <h3 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
                  Frase Secreta a Cifrar
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Texto Oculto
                  </label>
                  <textarea
                    rows={3}
                    value={cryptoPhrase}
                    onChange={(e) => setCryptoPhrase(e.target.value)}
                    placeholder="Escribe la frase que los alumnos deberán descifrar..."
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none text-xs uppercase font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pista o Temática (Opcional)
                  </label>
                  <input
                    type="text"
                    value={cryptoHint}
                    onChange={(e) => setCryptoHint(e.target.value)}
                    placeholder="Ej: Curiosidades del espacio"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none text-xs text-slate-800"
                  />
                </div>
              </div>
            )}

            {/* C) Cloze Test Editor */}
            {type === "cloze" && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-3.5">
                <h3 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
                  Texto del Ejercicio
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Coloca entre corchetes <code>[palabra]</code> los términos que quieras ocultar
                  para el banco de opciones, o escribe normalmente para selección automática.
                </p>
                <textarea
                  rows={6}
                  value={clozeText}
                  onChange={(e) => setClozeText(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none text-xs leading-relaxed text-slate-800 font-sans"
                />
              </div>
            )}

            {/* D) Rosco Editor */}
            {type === "rosco" && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-3">
                <h3 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
                  Rueda de Palabras (A - Z)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Incluye las 25 definiciones escolares calibradas de la A a la Z. Puedes
                  descargar directamente el pliego de preguntas y su solucionario.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Physical Paper Canvas & PDF Export (7 columns) */}
          <div className="lg:col-span-7 sticky top-20">
            <ActivityPreview
              type={type}
              title={title}
              wordSearchResult={wordSearchResult}
              crosswordResult={crosswordResult}
              scrambleResult={scrambleResult}
              matchingResult={matchingResult}
              cryptogramResult={cryptogramResult}
              clozeResult={clozeResult}
              roscoResult={roscoResult}
              sudokuResult={sudokuResult}
              mathPyramidResult={mathPyramidResult}
              crossMathResult={crossMathResult}
              mazeResult={mazeResult}
              pixelArtResult={pixelArtResult}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
