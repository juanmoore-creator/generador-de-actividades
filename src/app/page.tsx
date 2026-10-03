"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import {
  Plus,
  Trash2,
  Sparkles,
  RotateCcw,
  GraduationCap,
  Loader2,
  RefreshCw,
  Lightbulb,
  FileCheck,
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

// Importación dinámica con ssr: false para evitar discrepancias de Math.random()
const ActivityPreview = dynamic(
  () => import("@/components/ActivityPreview").then((mod) => mod.ActivityPreview),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-3xl border border-stone-200/90 p-12 flex flex-col items-center justify-center min-h-[420px] text-stone-400">
        <Loader2 className="animate-spin text-orange-500 mb-2" size={32} />
        <p className="text-xs font-semibold text-stone-600">Cargando visor interactivo...</p>
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

  // Selector general
  const [type, setType] = useState<ActivityType>("wordsearch");
  const [title, setTitle] = useState("Animales del Mundo");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [regenerateKey, setRegenerateKey] = useState(0);

  // Estado para actividades basadas en palabras
  const [items, setItems] = useState<WordItem[]>(PRESETS.animales.items);

  // Estado para actividades de texto (Criptograma y Cloze)
  const [cryptoPhrase, setCryptoPhrase] = useState(
    "EL SOL ES LA ESTRELLA MAS CERCANA A NUESTRO PLANETA TIERRA"
  );
  const [cryptoHint, setCryptoHint] = useState("Astronomía básica");
  const [clozeText, setClozeText] = useState(
    "Los [planetas] giran alrededor del [sol] describiendo órbitas elípticas. La [tierra] es el tercer planeta y el único donde se conoce la existencia de [vida]. Su satélite natural es la [luna]."
  );

  // Estado para Sudoku
  const [sudokuSize, setSudokuSize] = useState<4 | 6 | 9>(9);
  const [sudokuEmojis, setSudokuEmojis] = useState(false);

  // Estado para Pirámides Matemáticas
  const [pyramidLevels, setPyramidLevels] = useState<number>(4);
  const [pyramidCount, setPyramidCount] = useState<number>(2);

  // Estado para Laberinto
  const [mazeSize, setMazeSize] = useState<number>(15);

  // Estado para Pixel Art
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

  // Generadores Reactivos (useMemo)
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
                  Edición Suite 12 Actividades
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block font-medium">
                Generador integral de pasatiempos y fichas didácticas en PDF A4
              </p>
            </div>
          </div>

          {/* Selector de Presets Rápidos */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-stone-400 font-semibold hidden md:inline mr-1 text-[11px] uppercase tracking-wider">
              Temas:
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
            {/* Tarjeta 1: Catálogo y Configuración de Actividad */}
            <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3.5">
                <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 font-heading">
                  <div className="p-1.5 rounded-lg bg-orange-100 text-orange-600">
                    <Sparkles size={16} />
                  </div>
                  Formato de Actividad
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRegenerateKey((k) => k + 1)}
                    title="Generar nueva variación aleatoria"
                    className="p-1.5 text-stone-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                  >
                    <RefreshCw size={14} />
                    <span className="hidden sm:inline">Regenerar</span>
                  </button>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 flex items-center gap-1">
                    <FileCheck size={12} className="text-teal-600" />
                    A4
                  </span>
                </div>
              </div>

              {/* Selector de Categorías y Actividades */}
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
                  1. Selecciona el Tipo de Juego
                </label>
                <ActivityCategoryPicker
                  selectedType={type}
                  onSelect={handleSelectActivity}
                />
              </div>

              {/* Título de la Ficha */}
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
                  2. Título de la Ficha Imprimible
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Repaso de Ciencias Naturales"
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none text-sm font-semibold transition-all bg-stone-50/50 hover:bg-white focus:bg-white text-stone-900"
                />
              </div>

              {/* Controles de Dificultad para actividades que la soportan */}
              {["wordsearch", "cryptogram", "sudoku", "mathpyramid", "crossmath"].includes(
                type
              ) && (
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
                    3. Nivel de Dificultad
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "easy", label: "Fácil", badge: "🟢 Inicial" },
                      { id: "medium", label: "Medio", badge: "🟡 Estándar" },
                      { id: "hard", label: "Difícil", badge: "🔴 Reto" },
                    ].map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDifficulty(d.id as Difficulty)}
                        className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                          difficulty === d.id
                            ? "bg-orange-50 border-orange-400 text-orange-900 ring-2 ring-orange-200 shadow-xs"
                            : "bg-white border-stone-200 hover:border-stone-300 text-stone-700"
                        }`}
                      >
                        <span className="text-xs font-bold">{d.label}</span>
                        <span className="text-[9px] font-semibold text-stone-400 mt-0.5">
                          {d.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Controles específicos para Sudoku */}
              {type === "sudoku" && (
                <div className="space-y-3 pt-1 border-t border-stone-100">
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    Tamaño de Cuadrícula
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
                        className={`py-2 px-1 text-center rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          sudokuSize === s.size
                            ? "bg-stone-900 text-white border-stone-900"
                            : "bg-stone-50 text-stone-700 border-stone-200"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={sudokuEmojis}
                      onChange={(e) => setSudokuEmojis(e.target.checked)}
                      className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-stone-300"
                    />
                    Modo infantil con emojis (🐱🐶🐰🦊)
                  </label>
                </div>
              )}

              {/* Controles específicos para Pirámides Matemáticas */}
              {type === "mathpyramid" && (
                <div className="space-y-3 pt-1 border-t border-stone-100">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                      Altura de la Pirámide
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[3, 4].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setPyramidLevels(lvl)}
                          className={`py-2 text-center rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            pyramidLevels === lvl
                              ? "bg-stone-900 text-white border-stone-900"
                              : "bg-stone-50 text-stone-700 border-stone-200"
                          }`}
                        >
                          {lvl} Niveles
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                      Pirámides por Hoja
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setPyramidCount(cnt)}
                          className={`py-2 text-center rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            pyramidCount === cnt
                              ? "bg-stone-900 text-white border-stone-900"
                              : "bg-stone-50 text-stone-700 border-stone-200"
                          }`}
                        >
                          {cnt} {cnt === 1 ? "Pirámide" : "Pirámides"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Controles específicos para Laberinto */}
              {type === "maze" && (
                <div className="space-y-3 pt-1 border-t border-stone-100">
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider">
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
                        className={`py-2 px-1 text-center rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          mazeSize === m.size
                            ? "bg-stone-900 text-white border-stone-900"
                            : "bg-stone-50 text-stone-700 border-stone-200"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Controles específicos para Pixel Art */}
              {type === "pixelart" && (
                <div className="space-y-3 pt-1 border-t border-stone-100">
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    Dibujo / Plantilla
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.values(PIXEL_TEMPLATES).map((tmpl) => (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => setPixelArtKey(tmpl.id)}
                        className={`py-2 px-2 text-center rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          pixelArtKey === tmpl.id
                            ? "bg-orange-50 border-orange-400 text-orange-900 ring-2 ring-orange-200"
                            : "bg-stone-50 text-stone-700 border-stone-200"
                        }`}
                      >
                        {tmpl.name}
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
                  <strong>Ajuste óptico A4:</strong> Cada actividad calcula automáticamente
                  márgenes, tamaños de celda y tipografías para garantizar que la ficha y su
                  solucionario quepan con total nitidez en una página estándar.
                </div>
              </div>
            </div>

            {/* Tarjeta 2: Panel Dinámico de Contenido según Tipo de Entrada */}

            {/* A) Para actividades basadas en palabras (Sopa, Crucigrama, Anagramas, Relacionar) */}
            {["wordsearch", "crossword", "scramble", "matching"].includes(type) && (
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
                        <input
                          type="text"
                          value={item.word}
                          onChange={(e) => updateItem(idx, "word", e.target.value)}
                          placeholder="PALABRA (EJ: PLANETA)"
                          className="w-full bg-white px-3.5 py-2 rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none uppercase font-mono text-xs font-bold tracking-wider text-stone-900 shadow-2xs"
                        />
                        {["crossword", "matching", "scramble"].includes(type) && (
                          <input
                            type="text"
                            value={item.clue}
                            onChange={(e) => updateItem(idx, "clue", e.target.value)}
                            placeholder="Pista o definición..."
                            className="w-full bg-white px-3.5 py-1.5 rounded-xl border border-stone-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-xs text-stone-700 shadow-2xs"
                          />
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
            )}

            {/* B) Para Criptograma */}
            {type === "cryptogram" && (
              <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-7 space-y-4">
                <h3 className="text-base font-bold text-stone-900 font-heading">
                  Frase Secreta a Descifrar
                </h3>
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                    Mensaje Oculto
                  </label>
                  <textarea
                    rows={3}
                    value={cryptoPhrase}
                    onChange={(e) => setCryptoPhrase(e.target.value)}
                    placeholder="Escribe la frase que los alumnos deberán descifrar..."
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-xs uppercase font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                    Pista o Temática (Opcional)
                  </label>
                  <input
                    type="text"
                    value={cryptoHint}
                    onChange={(e) => setCryptoHint(e.target.value)}
                    placeholder="Ej: Curiosidades del espacio"
                    className="w-full px-4 py-2 rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-xs"
                  />
                </div>
              </div>
            )}

            {/* C) Para Texto con Huecos (Cloze) */}
            {type === "cloze" && (
              <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-7 space-y-4">
                <h3 className="text-base font-bold text-stone-900 font-heading">
                  Párrafo del Ejercicio
                </h3>
                <p className="text-xs text-stone-500">
                  Consejo: Coloca entre corchetes <code>[palabra]</code> las palabras que
                  desees ocultar para el banco de opciones, o escribe texto normal para
                  ocultación automática.
                </p>
                <textarea
                  rows={6}
                  value={clozeText}
                  onChange={(e) => setClozeText(e.target.value)}
                  className="w-full p-4 rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-xs leading-relaxed"
                />
              </div>
            )}

            {/* D) Para Rosco Pasapalabra */}
            {type === "rosco" && (
              <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-7 space-y-4">
                <h3 className="text-base font-bold text-stone-900 font-heading">
                  Rueda de Palabras (A - Z)
                </h3>
                <p className="text-xs text-stone-500">
                  El Rosco incluye por defecto las 25 definiciones temáticas del abecedario
                  escolar completo. Puedes regenerar o imprimir directamente la ficha y su
                  solución.
                </p>
              </div>
            )}
          </div>

          {/* Columna Derecha: Vista Previa y Descarga de PDF (7 columnas) */}
          <div className="lg:col-span-7 sticky top-24">
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
