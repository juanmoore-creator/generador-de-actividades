"use client";

import { useState, useMemo, useSyncExternalStore, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  SlidersHorizontal,
  PenTool,
  GraduationCap,
  RefreshCw,
  Printer,
  FileCheck2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Dices,
  Info,
  Eye,
  BookmarkPlus,
  Share2,
} from "lucide-react";
import { ActivityCategoryPicker } from "@/components/ActivityCategoryPicker";
import { WordTableEditor } from "@/components/studio/WordTableEditor";
import { SheetHeaderCustomizer } from "@/components/studio/SheetHeaderCustomizer";
import { ACTIVITIES } from "@/lib/registry";
import {
  ActivityType,
  Difficulty,
  WordItem,
  SheetHeaderOptions,
} from "@/lib/types/activities";
import {
  PwaTab,
  StudioViewMode,
  UserProfile,
  ActivitySnapshot,
} from "@/lib/types/pwa";
import { pwaStorage } from "@/lib/pwaStore";
import { PwaInstallBanner } from "@/components/pwa/PwaInstallBanner";
import { PwaTopHeader } from "@/components/pwa/PwaTopHeader";
import { BottomNav } from "@/components/pwa/BottomNav";
import { SavedActivitiesView } from "@/components/pwa/SavedActivitiesView";
import { CommunityLibraryView } from "@/components/pwa/CommunityLibraryView";
import { UserProfileView } from "@/components/pwa/UserProfileView";
import { AuthModal } from "@/components/pwa/AuthModal";
import { SaveActivityModal } from "@/components/pwa/SaveActivityModal";
import { PublishCommunityModal } from "@/components/pwa/PublishCommunityModal";
import { PwaToast, ToastInfo } from "@/components/pwa/PwaToast";

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
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 flex flex-col items-center justify-center min-h-[520px] text-slate-400">
        <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-slate-800 animate-spin mb-3" />
        <p className="text-xs font-bold text-slate-700 tracking-tight">Cargando mesa de trabajo editorial...</p>
        <p className="text-[11px] text-slate-400 mt-1">Renderizando pliego A4 de alta fidelidad</p>
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

const DEFAULT_HEADER_OPTIONS: SheetHeaderOptions = {
  showName: true,
  showDate: true,
  showGrade: true,
  showScore: false,
  schoolName: "",
};

const emptySubscribe = () => () => {};

export default function Home() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // PWA Navigation & Shell State
  const [activeTab, setActiveTab] = useState<PwaTab>(() => {
    if (typeof window === "undefined") return "studio";
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") as PwaTab | null;
      if (tabParam && ["studio", "saved", "community", "profile"].includes(tabParam)) {
        return tabParam;
      }
    } catch {}
    return "studio";
  });
  const [studioViewMode, setStudioViewMode] = useState<StudioViewMode>("editor");

  // User & Vault State
  const [user, setUser] = useState<UserProfile>(() => pwaStorage.getUser());
  const [savedCount, setSavedCount] = useState<number>(() => pwaStorage.getSavedActivities().length);

  // Modals & Feedback
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishTargetSnapshot, setPublishTargetSnapshot] = useState<ActivitySnapshot | null>(null);
  const [toast, setToast] = useState<ToastInfo | null>(null);

  // Active step in 3-step creation flow: 1 (Format), 2 (Content), 3 (Sheet Options)
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // Activity Configuration
  const [type, setType] = useState<ActivityType>("wordsearch");
  const [title, setTitle] = useState("Animales del Mundo");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [regenerateKey, setRegenerateKey] = useState(0);

  // Sheet Header Options
  const [headerOptions, setHeaderOptions] = useState<SheetHeaderOptions>(DEFAULT_HEADER_OPTIONS);

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

  // PDF Export integration
  const downloadHandlerRef = useRef<((isSolution: boolean) => Promise<void>) | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // 1. Initial hydration and store listeners
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem("genact_studio_draft_v2");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.type) setType(parsed.type);
          if (parsed.title) setTitle(parsed.title);
          if (parsed.difficulty) setDifficulty(parsed.difficulty);
          if (parsed.items && Array.isArray(parsed.items) && parsed.items.length > 0) {
            setItems(parsed.items);
          }
          if (parsed.cryptoPhrase) setCryptoPhrase(parsed.cryptoPhrase);
          if (parsed.cryptoHint !== undefined) setCryptoHint(parsed.cryptoHint);
          if (parsed.clozeText) setClozeText(parsed.clozeText);
          if (parsed.sudokuSize) setSudokuSize(parsed.sudokuSize);
          if (parsed.sudokuEmojis !== undefined) setSudokuEmojis(parsed.sudokuEmojis);
          if (parsed.pyramidLevels) setPyramidLevels(parsed.pyramidLevels);
          if (parsed.pyramidCount) setPyramidCount(parsed.pyramidCount);
          if (parsed.mazeSize) setMazeSize(parsed.mazeSize);
          if (parsed.pixelArtKey) setPixelArtKey(parsed.pixelArtKey);
          if (parsed.headerOptions) setHeaderOptions(parsed.headerOptions);
        }
      } catch (e) {
        console.warn("Could not load initial draft from storage", e);
      }
    }, 0);

    const handleUserUpdate = () => {
      setUser(pwaStorage.getUser());
    };
    const handleSavedUpdate = () => {
      setSavedCount(pwaStorage.getSavedActivities().length);
    };

    window.addEventListener("genact_pwa_user_updated", handleUserUpdate);
    window.addEventListener("genact_pwa_saved_updated", handleSavedUpdate);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("genact_pwa_user_updated", handleUserUpdate);
      window.removeEventListener("genact_pwa_saved_updated", handleSavedUpdate);
    };
  }, []);

  // 2. Persist to localStorage automatically on state change
  useEffect(() => {
    if (!isMounted) return;
    const draft = {
      type,
      title,
      difficulty,
      items,
      cryptoPhrase,
      cryptoHint,
      clozeText,
      sudokuSize,
      sudokuEmojis,
      pyramidLevels,
      pyramidCount,
      mazeSize,
      pixelArtKey,
      headerOptions,
    };
    try {
      localStorage.setItem("genact_studio_draft_v2", JSON.stringify(draft));
    } catch (e) {
      console.warn("Failed saving draft to localStorage", e);
    }
  }, [
    isMounted,
    type,
    title,
    difficulty,
    items,
    cryptoPhrase,
    cryptoHint,
    clozeText,
    sudokuSize,
    sudokuEmojis,
    pyramidLevels,
    pyramidCount,
    mazeSize,
    pixelArtKey,
    headerOptions,
  ]);

  // Current full snapshot of studio
  const currentSnapshot: ActivitySnapshot = useMemo(() => {
    return {
      type,
      title,
      difficulty,
      items,
      cryptoPhrase,
      cryptoHint,
      clozeText,
      sudokuSize,
      sudokuEmojis,
      pyramidLevels,
      pyramidCount,
      mazeSize,
      pixelArtKey,
      headerOptions,
    };
  }, [
    type,
    title,
    difficulty,
    items,
    cryptoPhrase,
    cryptoHint,
    clozeText,
    sudokuSize,
    sudokuEmojis,
    pyramidLevels,
    pyramidCount,
    mazeSize,
    pixelArtKey,
    headerOptions,
  ]);

  const loadSnapshotIntoStudio = useCallback(
    (snap: ActivitySnapshot, customMessage?: string) => {
      if (snap.type) setType(snap.type);
      if (snap.title) setTitle(snap.title);
      if (snap.difficulty) setDifficulty(snap.difficulty);
      if (snap.items) setItems(snap.items);
      if (snap.cryptoPhrase !== undefined) setCryptoPhrase(snap.cryptoPhrase);
      if (snap.cryptoHint !== undefined) setCryptoHint(snap.cryptoHint);
      if (snap.clozeText !== undefined) setClozeText(snap.clozeText);
      if (snap.sudokuSize) setSudokuSize(snap.sudokuSize);
      if (snap.sudokuEmojis !== undefined) setSudokuEmojis(snap.sudokuEmojis);
      if (snap.pyramidLevels) setPyramidLevels(snap.pyramidLevels);
      if (snap.pyramidCount) setPyramidCount(snap.pyramidCount);
      if (snap.mazeSize) setMazeSize(snap.mazeSize);
      if (snap.pixelArtKey) setPixelArtKey(snap.pixelArtKey);
      if (snap.headerOptions) setHeaderOptions(snap.headerOptions);

      setActiveTab("studio");
      setStudioViewMode("editor");
      setRegenerateKey((k) => k + 1);
      setToast({
        id: `toast_${Date.now()}`,
        message: customMessage || `Ficha "${snap.title}" cargada en el Estudio`,
      });
    },
    []
  );

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

  const handleBulkImport = (newItems: WordItem[], mode: "replace" | "append") => {
    if (mode === "replace") {
      setItems(newItems);
    } else {
      setItems((prev) => [...prev, ...newItems]);
    }
  };

  const loadPreset = (key: string) => {
    const preset = PRESETS[key];
    if (preset) {
      setTitle(preset.title);
      setItems(preset.items);
      setToast({
        id: `toast_${Date.now()}`,
        message: `Tema curricular "${preset.title}" cargado`,
      });
    }
  };

  const handleRegisterDownload = useCallback(
    (handler: (isSolution: boolean) => Promise<void>) => {
      downloadHandlerRef.current = handler;
    },
    []
  );

  const handleDownloadActivity = async () => {
    if (downloadHandlerRef.current) {
      setIsExporting(true);
      try {
        await downloadHandlerRef.current(false);
      } finally {
        setIsExporting(false);
      }
    }
  };

  const handleDownloadSolution = async () => {
    if (downloadHandlerRef.current) {
      setIsExporting(true);
      try {
        await downloadHandlerRef.current(true);
      } finally {
        setIsExporting(false);
      }
    }
  };

  const handleDirectDownloadFromVault = (snap: ActivitySnapshot, isSolution: boolean) => {
    loadSnapshotIntoStudio(snap, `Cargando "${snap.title}" para descarga...`);
    setTimeout(() => {
      if (isSolution) {
        handleDownloadSolution();
      } else {
        handleDownloadActivity();
      }
    }, 400);
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

  const isWordBased = ["wordsearch", "crossword", "scramble", "matching"].includes(type);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-28 md:pb-16">
      {/* PWA Install Notification Prompt */}
      <PwaInstallBanner />

      {/* Responsive PWA Top Navigation Header */}
      <PwaTopHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        title={title}
        onTitleChange={setTitle}
        presets={PRESETS}
        onSelectPreset={loadPreset}
        onDownloadActivity={handleDownloadActivity}
        onDownloadSolution={handleDownloadSolution}
        onSaveCurrent={() => setIsSaveModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        isDownloading={isExporting}
        user={user}
        savedCount={savedCount}
      />

      {/* Main App Surfaces */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* TAB 1: ESTUDIO (Workbench Generator) */}
        {activeTab === "studio" && (
          <div>
            {/* Mobile View Mode Switcher: Editor vs Ver Hoja A4 */}
            <div className="lg:hidden bg-white p-1 rounded-2xl border border-slate-200/90 shadow-2xs mb-4 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setStudioViewMode("editor")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  studioViewMode === "editor"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <SlidersHorizontal size={14} />
                <span>1. Configurar y Editar</span>
              </button>
              <button
                type="button"
                onClick={() => setStudioViewMode("preview")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  studioViewMode === "preview"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Eye size={14} />
                <span>2. Ver Pliego A4</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
              {/* Left Column: 3-Step Creation Sidebar (5 cols) */}
              <div
                className={`lg:col-span-5 space-y-4 ${
                  studioViewMode === "editor" ? "block" : "hidden lg:block"
                }`}
              >
                {/* Step Progress Navigation Bar */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-1.5 flex items-center gap-1">
                  {[
                    { step: 1, label: "Formato", icon: SlidersHorizontal },
                    { step: 2, label: "Contenido", icon: PenTool },
                    { step: 3, label: "Hoja A4", icon: GraduationCap },
                  ].map((s) => {
                    const Icon = s.icon;
                    const isActive = activeStep === s.step;
                    return (
                      <button
                        key={s.step}
                        type="button"
                        onClick={() => setActiveStep(s.step as 1 | 2 | 3)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer active:scale-[0.98] ${
                          isActive
                            ? "bg-slate-900 text-white shadow-2xs"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        <Icon size={14} className={isActive ? "text-white" : "text-slate-400"} />
                        <span>{s.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* STEP 1: Formato de Actividad */}
                {activeStep === 1 && (
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4 animate-in fade-in-50 duration-150">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 font-mono font-bold text-xs flex items-center justify-center">
                          1
                        </span>
                        <h2 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
                          Tipo de Actividad y Parámetros
                        </h2>
                      </div>

                      <button
                        type="button"
                        onClick={() => setRegenerateKey((k) => k + 1)}
                        title="Generar nueva variación aleatoria"
                        className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold active:scale-[0.97]"
                      >
                        <RefreshCw size={12} className="stroke-[2.2]" />
                        <span>Regenerar</span>
                      </button>
                    </div>

                    {/* Activity Category Picker */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">
                        Selecciona el Formato Editorial
                      </label>
                      <ActivityCategoryPicker
                        selectedType={type}
                        onSelect={handleSelectActivity}
                      />
                    </div>

                    {/* Difficulty Controls */}
                    {["wordsearch", "cryptogram", "sudoku", "mathpyramid", "crossmath"].includes(
                      type
                    ) && (
                      <div className="pt-2 border-t border-slate-100">
                        <label className="block text-xs font-semibold text-slate-700 mb-2">
                          Nivel de Dificultad
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: "easy", label: "Fácil", badge: "Primaria Inicial" },
                            { id: "medium", label: "Medio", badge: "Estándar" },
                            { id: "hard", label: "Difícil", badge: "Reto / Avanzado" },
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
                      <div className="space-y-3 pt-3 border-t border-slate-100">
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
                          Modo infantil con emoticonos (🐱🐶🐰🦊)
                        </label>
                      </div>
                    )}

                    {/* Math Pyramid Controls */}
                    {type === "mathpyramid" && (
                      <div className="space-y-3 pt-3 border-t border-slate-100">
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
                                {lvl} Pisos
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
                      <div className="space-y-3 pt-3 border-t border-slate-100">
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
                      <div className="space-y-3 pt-3 border-t border-slate-100">
                        <label className="block text-xs font-semibold text-slate-700">
                          Plantilla de Mosaico
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

                    {/* Navigation forward to Step 2 & Mobile Preview shortcut */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveStep(2)}
                        className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
                      >
                        <span>Continuar al Contenido</span>
                        <ArrowRight size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setStudioViewMode("preview")}
                        className="lg:hidden py-2.5 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        title="Ver hoja A4 en móvil"
                      >
                        <Eye size={14} />
                        <span>Ver Hoja</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Contenido Inteligente */}
                {activeStep === 2 && (
                  <div className="space-y-4 animate-in fade-in-50 duration-150">
                    {/* A) Word-Based Activities (WordSearch, Crossword, Scramble, Matching) */}
                    {isWordBased && (
                      <WordTableEditor
                        items={items}
                        onAddItem={addItem}
                        onUpdateItem={updateItem}
                        onRemoveItem={removeItem}
                        onClearItems={clearItems}
                        onBulkImport={handleBulkImport}
                        showClueField={["crossword", "matching", "scramble"].includes(type)}
                        minWordsNeeded={type === "crossword" ? 3 : 2}
                      />
                    )}

                    {/* B) Cryptogram Editor */}
                    {type === "cryptogram" && (
                      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                          <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 font-mono font-bold text-xs flex items-center justify-center">
                            2
                          </span>
                          <h3 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
                            Frase Secreta a Cifrar
                          </h3>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Mensaje Oculto
                          </label>
                          <textarea
                            rows={3}
                            value={cryptoPhrase}
                            onChange={(e) => setCryptoPhrase(e.target.value)}
                            placeholder="Escribe la frase que los alumnos descifrarán..."
                            className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none text-xs uppercase font-mono font-bold text-slate-900 leading-relaxed shadow-2xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Pista o Contexto Curricular (Opcional)
                          </label>
                          <input
                            type="text"
                            value={cryptoHint}
                            onChange={(e) => setCryptoHint(e.target.value)}
                            placeholder="Ej: Curiosidades del espacio"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none text-xs text-slate-800 shadow-2xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* C) Cloze Test Editor */}
                    {type === "cloze" && (
                      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                          <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 font-mono font-bold text-xs flex items-center justify-center">
                            2
                          </span>
                          <h3 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
                            Texto del Ejercicio
                          </h3>
                        </div>

                        <div className="p-3 bg-blue-50/60 border border-blue-200/60 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                          <Info size={15} className="text-blue-600 shrink-0 mt-0.5" />
                          <p className="leading-relaxed">
                            Coloca entre corchetes <code>[palabra]</code> los conceptos clave que se
                            ocultarán en el banco de respuestas.
                          </p>
                        </div>

                        <textarea
                          rows={6}
                          value={clozeText}
                          onChange={(e) => setClozeText(e.target.value)}
                          className="w-full p-3.5 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 outline-none text-xs leading-relaxed text-slate-800 font-sans shadow-2xs"
                        />
                      </div>
                    )}

                    {/* D) Rosco Editor */}
                    {type === "rosco" && (
                      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-3">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                          <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 font-mono font-bold text-xs flex items-center justify-center">
                            2
                          </span>
                          <h3 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
                            Rueda de Palabras (A - Z)
                          </h3>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          El rosco incluye 25 definiciones escolares calibradas curricularmente. Se
                          imprime en pliego de preguntas y respuestas listo para proyectar o resolver
                          en clase.
                        </p>
                      </div>
                    )}

                    {/* E) Procedural Math & Visual Activities Callout */}
                    {["sudoku", "mathpyramid", "crossmath", "maze", "pixelart"].includes(type) && (
                      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                          <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 font-mono font-bold text-xs flex items-center justify-center">
                            2
                          </span>
                          <h3 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
                            Generación Procedural
                          </h3>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          Esta actividad se genera con algoritmos matemáticos en tiempo real. Puedes
                          ajustar parámetros en el <strong>Paso 1</strong> o crear variaciones nuevas
                          con el botón de regenerar.
                        </p>

                        <button
                          type="button"
                          onClick={() => setRegenerateKey((k) => k + 1)}
                          className="w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
                        >
                          <Dices size={15} className="text-blue-600" />
                          <span>Generar Nueva Variación Aleatoria</span>
                        </button>
                      </div>
                    )}

                    {/* Navigation forward/backward */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setActiveStep(1)}
                        className="py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <ArrowLeft size={14} />
                        <span>Atrás</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveStep(3)}
                        className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
                      >
                        <span>Configurar Hoja A4</span>
                        <ArrowRight size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setStudioViewMode("preview")}
                        className="lg:hidden py-2.5 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        title="Ver hoja A4 en móvil"
                      >
                        <Eye size={14} />
                        <span>Ver Hoja</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Opciones de Pliego e Impresión */}
                {activeStep === 3 && (
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-5 animate-in fade-in-50 duration-150">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 font-mono font-bold text-xs flex items-center justify-center">
                        3
                      </span>
                      <h2 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
                        Encabezado Escolar y Exportación
                      </h2>
                    </div>

                    {/* Sheet Header Customizer Component */}
                    <SheetHeaderCustomizer
                      options={headerOptions}
                      onChange={setHeaderOptions}
                    />

                    {/* Print Quality Specs */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1.5">
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span className="flex items-center gap-1.5">
                          <Printer size={13} className="text-slate-500" />
                          Especificación de Taller Editorial
                        </span>
                        <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold">
                          A4 300 DPI
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Trazo vectorial de alto contraste y márgenes de 18 mm calibrados para fotocopiadoras y guillotinas escolares.
                      </p>
                    </div>

                    {/* Direct Action Download Buttons */}
                    <div className="space-y-2 pt-1">
                      <button
                        type="button"
                        onClick={handleDownloadActivity}
                        disabled={isExporting}
                        className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
                      >
                        <FileCheck2 size={16} />
                        <span>Descargar Ficha para Alumnos (PDF)</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadSolution}
                        disabled={isExporting}
                        className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
                      >
                        <CheckCircle2 size={15} className="text-rose-600" />
                        <span>Descargar Hoja de Respuestas (Solución)</span>
                      </button>
                    </div>

                    {/* Save to Vault & Publish Shortcuts */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsSaveModalOpen(true)}
                        className="flex-1 py-2 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <BookmarkPlus size={14} />
                        <span>Guardar en Mis Fichas</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPublishTargetSnapshot(currentSnapshot);
                          setIsPublishModalOpen(true);
                        }}
                        className="py-2 px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        title="Compartir en biblioteca comunitaria"
                      >
                        <Share2 size={14} />
                        <span>Comunidad</span>
                      </button>
                    </div>

                    {/* Navigation back to Step 2 */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setActiveStep(2)}
                        className="w-full py-2 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <ArrowLeft size={13} />
                        <span>Volver a Editar Contenido</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Local persistence subtle indicator */}
                <div className="flex items-center justify-between px-2 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Borrador guardado localmente
                  </span>
                  <span className="font-mono text-[10px]">GenAct PWA 2.0</span>
                </div>
              </div>

              {/* Right Column: Physical Paper Canvas & PDF Export (7 cols) */}
              <div
                className={`lg:col-span-7 sticky top-20 ${
                  studioViewMode === "preview" ? "block" : "hidden lg:block"
                }`}
              >
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
                  headerOptions={headerOptions}
                  onTriggerDownload={handleRegisterDownload}
                />

                {/* Mobile Floating Action Controls under sheet */}
                <div className="lg:hidden mt-4 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStudioViewMode("editor")}
                    className="py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <SlidersHorizontal size={14} />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadActivity}
                    disabled={isExporting}
                    className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Printer size={14} />
                    <span>Descargar PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsSaveModalOpen(true)}
                    className="p-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl transition-all cursor-pointer active:scale-95"
                    title="Guardar en Mis Fichas"
                  >
                    <BookmarkPlus size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MIS FICHAS GUARDADAS */}
        {activeTab === "saved" && (
          <SavedActivitiesView
            onLoadIntoStudio={(snap) => loadSnapshotIntoStudio(snap)}
            onSaveCurrentToLibrary={() => setIsSaveModalOpen(true)}
            onOpenPublishModal={(snap) => {
              setPublishTargetSnapshot(snap);
              setIsPublishModalOpen(true);
            }}
            onDirectDownload={handleDirectDownloadFromVault}
            currentStudioTitle={title}
          />
        )}

        {/* TAB 3: BIBLIOTECA PÚBLICA COMUNITARIA */}
        {activeTab === "community" && (
          <CommunityLibraryView
            onLoadIntoStudio={(snap) => {
              loadSnapshotIntoStudio(snap, `Plantilla "${snap.title}" cargada en el Estudio`);
            }}
            onOpenPublishModal={() => {
              setPublishTargetSnapshot(currentSnapshot);
              setIsPublishModalOpen(true);
            }}
            onDirectDownload={handleDirectDownloadFromVault}
          />
        )}

        {/* TAB 4: MI PERFIL Y AJUSTES */}
        {activeTab === "profile" && (
          <UserProfileView
            user={user}
            onUserChange={setUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            defaultHeaderOptions={headerOptions}
            onUpdateDefaultHeaderOptions={(opts) => setHeaderOptions(opts)}
          />
        )}
      </main>

      {/* Ergonomic Mobile Dock Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === "studio") {
            setStudioViewMode("editor");
          }
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        savedCount={savedCount}
        user={user}
      />

      {/* Floating Feedback Toast */}
      <PwaToast toast={toast} onClose={() => setToast(null)} />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onUserChange={(newUser) => {
          setUser(newUser);
          setToast({
            id: `toast_${Date.now()}`,
            message: `Sesión iniciada como ${newUser.name}`,
          });
        }}
      />

      {/* Save Activity Modal */}
      <SaveActivityModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        currentSnapshot={currentSnapshot}
        onSavedSuccess={(savedTitle) => {
          setSavedCount(pwaStorage.getSavedActivities().length);
          setToast({
            id: `toast_${Date.now()}`,
            message: `"${savedTitle}" se guardó en Mis Fichas`,
          });
        }}
        onOpenPublishModal={() => {
          setPublishTargetSnapshot(currentSnapshot);
          setIsPublishModalOpen(true);
        }}
      />

      {/* Publish Community Modal */}
      <PublishCommunityModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        snapshot={publishTargetSnapshot || currentSnapshot}
        user={user}
        onPublishedSuccess={() => {
          setToast({
            id: `toast_${Date.now()}`,
            message: "¡Actividad compartida en la Biblioteca Pública con éxito!",
          });
          setActiveTab("community");
        }}
      />
    </div>
  );
}
