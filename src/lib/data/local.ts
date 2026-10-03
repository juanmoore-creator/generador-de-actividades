import type { CommunityActivity, DataProvider, Profile, SavedActivity } from "./types";
import { normalizeSnapshot, DEFAULT_HEADER } from "../activities/snapshot";
import { EXAMPLE_COMMUNITY } from "./examples";

/**
 * Proveedor local (sin cuenta): todo se guarda en este navegador.
 * No simula una comunidad: muestra sólo fichas de ejemplo y no permite publicar.
 */

const KEYS = {
  profile: "genact_profile_v2",
  saved: "genact_saved_v2",
  likes: "genact_example_likes_v1",
  // Versiones anteriores (para migrar)
  legacySaved: "genact_pwa_saved_v1",
  legacyUser: "genact_pwa_user_v1",
};

const EVENT = "genact_local_auth";

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("No se pudo guardar en el dispositivo", e);
    throw new Error("No hay espacio disponible en este dispositivo para guardar.");
  }
}

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;

const now = () => new Date().toISOString();

function defaultProfile(): Profile {
  return {
    id: "local",
    name: "",
    email: "",
    role: "Docente",
    school: "",
    defaultHeader: { ...DEFAULT_HEADER },
    defaultPageSize: "A4",
  };
}

function loadProfile(): Profile {
  const stored = read<Partial<Profile>>(KEYS.profile);
  if (stored) return { ...defaultProfile(), ...stored, id: "local" };
  // Migración del perfil demo anterior: sólo conservamos datos que puso el usuario.
  const legacy = read<{ name?: string; school?: string; role?: string; id?: string }>(KEYS.legacyUser);
  if (legacy && legacy.id !== "user_profe_valen" && legacy.id !== "user_guest") {
    return { ...defaultProfile(), name: legacy.name ?? "", school: legacy.school ?? "", role: legacy.role ?? "Docente" };
  }
  return defaultProfile();
}

function loadSaved(): SavedActivity[] {
  const stored = read<SavedActivity[]>(KEYS.saved);
  if (stored) return stored.map((s) => ({ ...s, snapshot: normalizeSnapshot(s.snapshot) }));
  // Migración: fichas guardadas por el usuario en la versión anterior (sin las de demostración).
  const legacy = read<Array<Record<string, unknown>>>(KEYS.legacySaved);
  if (!legacy) return [];
  const migrated = legacy
    .filter((s) => typeof s.id === "string" && !/^act_saved_\d$/.test(s.id as string))
    .map((s): SavedActivity => {
      const snapshot = normalizeSnapshot(s.snapshot);
      return {
        id: uid(),
        title: snapshot.title,
        type: snapshot.type,
        difficulty: snapshot.difficulty,
        folder: typeof s.folder === "string" ? s.folder : "General",
        notes: typeof s.notes === "string" ? s.notes : "",
        snapshot,
        createdAt: now(),
        updatedAt: now(),
        isFavorite: s.isFavorite === true,
        isPublished: false,
      };
    });
  write(KEYS.saved, migrated);
  return migrated;
}

export function createLocalProvider(): DataProvider {
  return {
    mode: "local",

    async getProfile() {
      return loadProfile();
    },
    async signIn() {
      throw new Error("Las cuentas no están disponibles en este modo.");
    },
    async signUp() {
      throw new Error("Las cuentas no están disponibles en este modo.");
    },
    async sendMagicLink() {
      throw new Error("Las cuentas no están disponibles en este modo.");
    },
    async signOut() {},
    async updateProfile(patch) {
      const next = { ...loadProfile(), ...patch, id: "local" };
      write(KEYS.profile, next);
      window.dispatchEvent(new Event(EVENT));
      return next;
    },
    onAuthChange(cb) {
      window.addEventListener(EVENT, cb);
      return () => window.removeEventListener(EVENT, cb);
    },

    async listSaved() {
      return loadSaved();
    },
    async saveActivity({ snapshot, folder, notes }) {
      const item: SavedActivity = {
        id: uid(),
        title: snapshot.title,
        type: snapshot.type,
        difficulty: snapshot.difficulty,
        folder: folder.trim() || "General",
        notes,
        snapshot,
        createdAt: now(),
        updatedAt: now(),
        isFavorite: false,
        isPublished: false,
      };
      write(KEYS.saved, [item, ...loadSaved()]);
      return item;
    },
    async updateSaved(id, patch) {
      write(
        KEYS.saved,
        loadSaved().map((s) =>
          s.id === id
            ? {
                ...s,
                ...patch,
                title: patch.snapshot?.title ?? patch.title ?? s.title,
                type: patch.snapshot?.type ?? s.type,
                difficulty: patch.snapshot?.difficulty ?? s.difficulty,
                updatedAt: now(),
              }
            : s
        )
      );
    },
    async deleteSaved(id) {
      write(KEYS.saved, loadSaved().filter((s) => s.id !== id));
    },

    async listCommunity() {
      const likes = new Set(read<string[]>(KEYS.likes) ?? []);
      return EXAMPLE_COMMUNITY.map((c): CommunityActivity => ({ ...c, isLiked: likes.has(c.id), likes: likes.has(c.id) ? 1 : 0 }));
    },
    async publish() {
      throw new Error("Para publicar en la comunidad hace falta una cuenta en la nube.");
    },
    async unpublish() {
      throw new Error("Para publicar en la comunidad hace falta una cuenta en la nube.");
    },
    async toggleLike(id) {
      const likes = new Set(read<string[]>(KEYS.likes) ?? []);
      const liked = !likes.has(id);
      if (liked) likes.add(id);
      else likes.delete(id);
      write(KEYS.likes, [...likes]);
      return liked;
    },
    async recordDownload() {},
  };
}
