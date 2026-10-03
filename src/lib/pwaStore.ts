"use client";

import {
  UserProfile,
  SavedActivity,
  CommunityActivity,
  ActivitySnapshot,
} from "./types/pwa";

export const DEFAULT_USER: UserProfile = {
  id: "user_profe_valen",
  name: "Profe Valentina Ruiz",
  email: "valentina.ruiz@colegio-sanignacio.edu",
  role: "Docente de Educación Primaria",
  school: "Colegio San Ignacio · Madrid",
  avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
  isLoggedIn: true,
  isPro: true,
  joinedDate: "Septiembre 2024",
  stats: {
    savedCount: 4,
    publishedCount: 3,
    downloadsReceived: 428,
  },
};

export const GUEST_USER: UserProfile = {
  id: "user_guest",
  name: "Docente Invitado",
  email: "",
  role: "Invitado",
  school: "",
  avatar: "",
  isLoggedIn: false,
  isPro: false,
  joinedDate: "Hoy",
  stats: {
    savedCount: 0,
    publishedCount: 0,
    downloadsReceived: 0,
  },
};

export const SEED_SAVED_ACTIVITIES: SavedActivity[] = [
  {
    id: "act_saved_1",
    title: "Animales Invertebrados y Ecosistemas",
    type: "wordsearch",
    difficulty: "medium",
    folder: "Ciencias Naturales",
    wordCount: 6,
    isFavorite: true,
    isPublished: true,
    createdAt: "2026-09-28",
    updatedAt: "2026-10-01",
    notes: "Ficha lista para el examen de la unidad 2 de 4º Primaria.",
    snapshot: {
      type: "wordsearch",
      title: "Animales Invertebrados y Ecosistemas",
      difficulty: "medium",
      items: [
        { word: "MEDUSA", clue: "Invertebrado marino gelatinoso" },
        { word: "CARACOL", clue: "Molusco terrestre con caparazón en espiral" },
        { word: "LOMBRIZ", clue: "Anélido beneficioso para la tierra" },
        { word: "PULPO", clue: "Molusco cefalópodo con ocho tentáculos" },
        { word: "ARACNIDO", clue: "Artropodo con ocho patas como la araña" },
        { word: "ESPONJA", clue: "Porífero marino sésil y poroso" },
      ],
      headerOptions: {
        showName: true,
        showDate: true,
        showGrade: true,
        showScore: true,
        schoolName: "Colegio San Ignacio",
      },
    },
  },
  {
    id: "act_saved_2",
    title: "Partes de la Oración y Gramática",
    type: "crossword",
    difficulty: "hard",
    folder: "Lengua Castellana",
    wordCount: 5,
    isFavorite: true,
    isPublished: false,
    createdAt: "2026-09-15",
    updatedAt: "2026-09-20",
    notes: "Repaso de sustantivos, verbos y adjetivos.",
    snapshot: {
      type: "crossword",
      title: "Partes de la Oración y Gramática",
      difficulty: "hard",
      items: [
        { word: "VERBO", clue: "Palabra que indica acción, estado o proceso" },
        { word: "SUSTANTIVO", clue: "Nombra personas, animales, cosas o ideas" },
        { word: "ADJETIVO", clue: "Modifica o califica al sustantivo" },
        { word: "SUJETO", clue: "Elemento de la oración que realiza la acción" },
        { word: "PREDICADO", clue: "Lo que se dice o predica del sujeto" },
      ],
      headerOptions: {
        showName: true,
        showDate: true,
        showGrade: true,
        showScore: false,
        schoolName: "Colegio San Ignacio",
      },
    },
  },
  {
    id: "act_saved_3",
    title: "Pirámides de Sumas y Cálculo Rápido",
    type: "mathpyramid",
    difficulty: "easy",
    folder: "Matemáticas",
    wordCount: 0,
    isFavorite: false,
    isPublished: true,
    createdAt: "2026-08-30",
    updatedAt: "2026-09-02",
    notes: "Ejercicios de activación mental al inicio de la clase.",
    snapshot: {
      type: "mathpyramid",
      title: "Pirámides de Sumas y Cálculo Rápido",
      difficulty: "easy",
      pyramidLevels: 4,
      pyramidCount: 2,
      items: [],
      headerOptions: {
        showName: true,
        showDate: true,
        showGrade: true,
        showScore: false,
        schoolName: "Colegio San Ignacio",
      },
    },
  },
  {
    id: "act_saved_4",
    title: "Frase Secreta: El Mensaje de Galileo",
    type: "cryptogram",
    difficulty: "medium",
    folder: "Historia y Ciencias",
    wordCount: 0,
    isFavorite: false,
    isPublished: false,
    createdAt: "2026-08-12",
    updatedAt: "2026-08-12",
    notes: "Actividad interdisciplinar para la semana de la ciencia.",
    snapshot: {
      type: "cryptogram",
      title: "Frase Secreta: El Mensaje de Galileo",
      difficulty: "medium",
      cryptoPhrase: "Y SIN EMBARGO SE MUEVE DIJO GALILEO SOBRE LA TIERRA",
      cryptoHint: "Historia de la astronomía universal",
      items: [],
      headerOptions: {
        showName: true,
        showDate: true,
        showGrade: true,
        showScore: true,
        schoolName: "Colegio San Ignacio",
      },
    },
  },
];

export const SEED_COMMUNITY_ACTIVITIES: CommunityActivity[] = [
  {
    id: "comm_1",
    title: "Vocabulario de Inglés: Food & Daily Meals",
    type: "wordsearch",
    difficulty: "easy",
    subject: "Inglés",
    grade: "3º y 4º Primaria",
    description: "Sopa de letras temática con alimentos básicos saludables en inglés para practicar pronunciación y ortografía.",
    author: {
      name: "Mr. David Miller",
      role: "EFL Bilingual Teacher",
      school: "British Academy · Valencia",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      isVerified: true,
    },
    snapshot: {
      type: "wordsearch",
      title: "Vocabulario de Inglés: Food & Daily Meals",
      difficulty: "easy",
      items: [
        { word: "APPLE", clue: "A round red or green fruit" },
        { word: "BREAD", clue: "Baked food made of flour and water" },
        { word: "CHEESE", clue: "Food made from pressed milk curds" },
        { word: "BANANA", clue: "Long curved yellow fruit" },
        { word: "CARROT", clue: "Orange root vegetable" },
        { word: "MILK", clue: "White nutritious liquid from cows" },
      ],
      headerOptions: {
        showName: true,
        showDate: true,
        showGrade: true,
        showScore: true,
        schoolName: "English Department",
      },
    },
    likes: 184,
    downloads: 942,
    isLiked: false,
    featured: true,
    createdAt: "Hace 2 días",
    tags: ["English", "Vocabulary", "Food", "Primaria"],
  },
  {
    id: "comm_2",
    title: "Los Ríos y Relieve de la Península",
    type: "crossword",
    difficulty: "medium",
    subject: "Geografía e Historia",
    grade: "5º y 6º Primaria",
    description: "Crucigrama completo con pistas clave sobre las cuencas hidrográficas y sistemas montañosos principales.",
    author: {
      name: "Profe Carmen Morales",
      role: "Docente de Ciencias Sociales",
      school: "CEIP San Isidro · Sevilla",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      isVerified: true,
    },
    snapshot: {
      type: "crossword",
      title: "Los Ríos y Relieve de la Península",
      difficulty: "medium",
      items: [
        { word: "TAJO", clue: "El río más largo de la península ibérica" },
        { word: "EBRO", clue: "Río más caudaloso de la vertiente mediterránea" },
        { word: "PIRINEOS", clue: "Cordillera montañosa que separa España y Francia" },
        { word: "DUERO", clue: "Gran río que desemboca en la ciudad de Oporto" },
        { word: "GUADALQUIVIR", clue: "Río navegable de Andalucía" },
      ],
      headerOptions: {
        showName: true,
        showDate: true,
        showGrade: true,
        showScore: false,
        schoolName: "CEIP San Isidro",
      },
    },
    likes: 245,
    downloads: 1320,
    isLiked: true,
    featured: true,
    createdAt: "Hace 5 días",
    tags: ["Geografía", "Ríos", "Relieve", "España"],
  },
  {
    id: "comm_3",
    title: "Laberinto Geométrico del Minotauro",
    type: "maze",
    difficulty: "medium",
    subject: "Matemáticas y Lógica",
    grade: "Todas las edades",
    description: "Desafío de orientación espacial para trabajar motricidad fina, concentración y paciencia en el aula.",
    author: {
      name: "Prof. Marcos Estrada",
      role: "Coordinador Pedagógico",
      school: "Colegio Montserrat · Barcelona",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      isVerified: false,
    },
    snapshot: {
      type: "maze",
      title: "Laberinto Geométrico del Minotauro",
      difficulty: "medium",
      mazeSize: 15,
      items: [],
      headerOptions: {
        showName: true,
        showDate: true,
        showGrade: true,
        showScore: false,
        schoolName: "Colegio Montserrat",
      },
    },
    likes: 89,
    downloads: 512,
    isLiked: false,
    featured: false,
    createdAt: "Hace 1 semana",
    tags: ["Lógica", "Orientación", "Atención"],
  },
  {
    id: "comm_4",
    title: "Texto Cloze: El Ciclo del Agua y la Lluvia",
    type: "cloze",
    difficulty: "easy",
    subject: "Ciencias Naturales",
    grade: "3º y 4º Primaria",
    description: "Texto con huecos para completar conceptos clave: evaporación, condensación, precipitación y ríos.",
    author: {
      name: "Profe Valentina Ruiz",
      role: "Docente de Educación Primaria",
      school: "Colegio San Ignacio · Madrid",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      isVerified: true,
    },
    snapshot: {
      type: "cloze",
      title: "Texto Cloze: El Ciclo del Agua y la Lluvia",
      difficulty: "easy",
      clozeText: "El calor del sol provoca la [evaporación] del agua de los mares. Al ascender, el vapor se enfría y forma las [nubes] mediante la condensación. Luego el agua cae en forma de [lluvia] o nieve y regresa a los [ríos] cerrando el ciclo.",
      items: [],
      headerOptions: {
        showName: true,
        showDate: true,
        showGrade: true,
        showScore: true,
        schoolName: "Colegio San Ignacio",
      },
    },
    likes: 312,
    downloads: 1850,
    isLiked: true,
    featured: true,
    createdAt: "Hace 2 semanas",
    tags: ["Agua", "Naturaleza", "Primaria", "Lectura"],
  },
  {
    id: "comm_5",
    title: "Sudoku Junior 6x6 con Frutas y Números",
    type: "sudoku",
    difficulty: "easy",
    subject: "Matemáticas y Razonamiento",
    grade: "1º a 3º Primaria",
    description: "Iniciación al razonamiento deductivo para niños sin frustración, excelente para días de lluvia.",
    author: {
      name: "Maestra Elena Pons",
      role: "Especialista en Innovación Infantil",
      school: "Escola Pia · Girona",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      isVerified: false,
    },
    snapshot: {
      type: "sudoku",
      title: "Sudoku Junior 6x6 con Números",
      difficulty: "easy",
      sudokuSize: 6,
      sudokuEmojis: false,
      items: [],
      headerOptions: {
        showName: true,
        showDate: true,
        showGrade: true,
        showScore: false,
        schoolName: "Escola Pia",
      },
    },
    likes: 120,
    downloads: 680,
    isLiked: false,
    featured: false,
    createdAt: "Hace 3 semanas",
    tags: ["Sudoku", "Razonamiento", "Matemáticas"],
  },
];

// Helper to interact with LocalStorage safely
const STORAGE_KEYS = {
  USER: "genact_pwa_user_v1",
  SAVED: "genact_pwa_saved_v1",
  COMMUNITY: "genact_pwa_community_v1",
  INSTALL_DISMISSED: "genact_pwa_install_dismissed",
};

export const pwaStorage = {
  getUser: (): UserProfile => {
    if (typeof window === "undefined") return DEFAULT_USER;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  },

  setUser: (user: UserProfile) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      window.dispatchEvent(new Event("genact_pwa_user_updated"));
    } catch (e) {
      console.error(e);
    }
  },

  getSavedActivities: (): SavedActivity[] => {
    if (typeof window === "undefined") return SEED_SAVED_ACTIVITIES;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED);
      if (data) {
        return JSON.parse(data);
      }
      localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(SEED_SAVED_ACTIVITIES));
      return SEED_SAVED_ACTIVITIES;
    } catch {
      return SEED_SAVED_ACTIVITIES;
    }
  },

  setSavedActivities: (list: SavedActivity[]) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(list));
      window.dispatchEvent(new Event("genact_pwa_saved_updated"));
    } catch (e) {
      console.error(e);
    }
  },

  saveCurrentActivity: (snapshot: ActivitySnapshot, folder = "Mis Fichas", notes = ""): SavedActivity => {
    const list = pwaStorage.getSavedActivities();
    const newActivity: SavedActivity = {
      id: `act_${Date.now()}`,
      title: snapshot.title || "Actividad sin título",
      type: snapshot.type,
      difficulty: snapshot.difficulty,
      folder,
      notes,
      snapshot,
      wordCount: snapshot.items?.length || 0,
      isFavorite: false,
      isPublished: false,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };
    const updated = [newActivity, ...list];
    pwaStorage.setSavedActivities(updated);

    // update user count
    const user = pwaStorage.getUser();
    user.stats.savedCount = updated.length;
    pwaStorage.setUser(user);

    return newActivity;
  },

  deleteSavedActivity: (id: string) => {
    const list = pwaStorage.getSavedActivities().filter((a) => a.id !== id);
    pwaStorage.setSavedActivities(list);
    const user = pwaStorage.getUser();
    user.stats.savedCount = list.length;
    pwaStorage.setUser(user);
  },

  duplicateSavedActivity: (id: string) => {
    const list = pwaStorage.getSavedActivities();
    const target = list.find((a) => a.id === id);
    if (!target) return;
    const duplicated: SavedActivity = {
      ...target,
      id: `act_${Date.now()}`,
      title: `${target.title} (Copia)`,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      isPublished: false,
    };
    pwaStorage.setSavedActivities([duplicated, ...list]);
  },

  getCommunityActivities: (): CommunityActivity[] => {
    if (typeof window === "undefined") return SEED_COMMUNITY_ACTIVITIES;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMMUNITY);
      if (data) {
        return JSON.parse(data);
      }
      localStorage.setItem(STORAGE_KEYS.COMMUNITY, JSON.stringify(SEED_COMMUNITY_ACTIVITIES));
      return SEED_COMMUNITY_ACTIVITIES;
    } catch {
      return SEED_COMMUNITY_ACTIVITIES;
    }
  },

  setCommunityActivities: (list: CommunityActivity[]) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.COMMUNITY, JSON.stringify(list));
      window.dispatchEvent(new Event("genact_pwa_community_updated"));
    } catch (e) {
      console.error(e);
    }
  },

  toggleLikeCommunity: (id: string): boolean => {
    const list = pwaStorage.getCommunityActivities();
    let isNowLiked = false;
    const updated = list.map((item) => {
      if (item.id === id) {
        const liked = !item.isLiked;
        isNowLiked = liked;
        return {
          ...item,
          isLiked: liked,
          likes: liked ? item.likes + 1 : Math.max(0, item.likes - 1),
        };
      }
      return item;
    });
    pwaStorage.setCommunityActivities(updated);
    return isNowLiked;
  },

  incrementCommunityDownload: (id: string) => {
    const list = pwaStorage.getCommunityActivities();
    const updated = list.map((item) => {
      if (item.id === id) {
        return { ...item, downloads: item.downloads + 1 };
      }
      return item;
    });
    pwaStorage.setCommunityActivities(updated);
  },

  publishToCommunity: (
    snapshot: ActivitySnapshot,
    details: { subject: string; grade: string; description: string; tags: string[] }
  ): CommunityActivity => {
    const user = pwaStorage.getUser();
    const list = pwaStorage.getCommunityActivities();

    const newPublic: CommunityActivity = {
      id: `comm_${Date.now()}`,
      title: snapshot.title,
      type: snapshot.type,
      difficulty: snapshot.difficulty,
      subject: details.subject || "General",
      grade: details.grade || "Primaria",
      description: details.description || "Actividad imprimible compartida por la comunidad docente.",
      author: {
        name: user.name,
        role: user.role,
        school: user.school || "Docente Colaborador",
        avatar: user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        isVerified: user.isPro,
      },
      snapshot,
      likes: 1,
      downloads: 0,
      isLiked: true,
      featured: false,
      createdAt: "Recién publicado",
      tags: details.tags.length > 0 ? details.tags : ["Educación", snapshot.type],
    };

    const updated = [newPublic, ...list];
    pwaStorage.setCommunityActivities(updated);

    // mark in saved activities if matching title
    const savedList = pwaStorage.getSavedActivities().map((s) => {
      if (s.title === snapshot.title) {
        return { ...s, isPublished: true };
      }
      return s;
    });
    pwaStorage.setSavedActivities(savedList);

    // update user stats
    user.stats.publishedCount += 1;
    pwaStorage.setUser(user);

    return newPublic;
  },
};
