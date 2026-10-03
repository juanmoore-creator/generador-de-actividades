import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { CommunityActivity, DataProvider, Profile, SavedActivity } from "./types";
import { DEFAULT_HEADER, normalizeSnapshot } from "../activities/snapshot";
import type { PageSize, SheetHeaderOptions } from "../types/activities";
import { EXAMPLE_COMMUNITY } from "./examples";

/**
 * Proveedor en la nube (Supabase). Se activa al definir
 * NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * El esquema está en supabase/migrations.
 */

interface ActivityRow {
  id: string;
  title: string;
  type: string;
  difficulty: string;
  folder: string;
  notes: string;
  is_favorite: boolean;
  is_published: boolean;
  snapshot: unknown;
  created_at: string;
  updated_at: string;
}

interface CommunityRow {
  id: string;
  author_id: string;
  title: string;
  subject: string;
  grade: string;
  description: string;
  tags: string[];
  snapshot: unknown;
  likes_count: number;
  downloads_count: number;
  created_at: string;
  author: { name: string; school: string } | null;
}

interface ProfileRow {
  id: string;
  name: string;
  school: string;
  role: string;
  preferences: { defaultHeader?: SheetHeaderOptions; defaultPageSize?: PageSize } | null;
}

function toSaved(row: ActivityRow): SavedActivity {
  const snapshot = normalizeSnapshot(row.snapshot);
  return {
    id: row.id,
    title: row.title,
    type: snapshot.type,
    difficulty: snapshot.difficulty,
    folder: row.folder,
    notes: row.notes,
    snapshot,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isFavorite: row.is_favorite,
    isPublished: row.is_published,
  };
}

function toCommunity(row: CommunityRow, liked: Set<string>): CommunityActivity {
  const snapshot = normalizeSnapshot(row.snapshot);
  return {
    id: row.id,
    title: row.title,
    type: snapshot.type,
    difficulty: snapshot.difficulty,
    subject: row.subject,
    grade: row.grade,
    description: row.description,
    tags: row.tags ?? [],
    snapshot,
    author: { name: row.author?.name || "Docente", school: row.author?.school || "" },
    authorId: row.author_id,
    likes: row.likes_count,
    downloads: row.downloads_count,
    isLiked: liked.has(row.id),
    createdAt: row.created_at,
  };
}

function fail(error: { message: string } | null): asserts error is null {
  if (error) throw new Error(translateError(error.message));
}

function translateError(message: string): string {
  if (/invalid login credentials/i.test(message)) return "El correo o la contraseña no son correctos.";
  if (/already registered/i.test(message)) return "Ya existe una cuenta con ese correo.";
  if (/email not confirmed/i.test(message)) return "Confirma tu correo antes de ingresar (revisa tu bandeja de entrada).";
  if (/password should be at least/i.test(message)) return "La contraseña debe tener al menos 6 caracteres.";
  if (/rate limit/i.test(message)) return "Demasiados intentos. Espera un momento y vuelve a probar.";
  if (/failed to fetch|network/i.test(message)) return "Sin conexión con el servidor. Revisa tu internet.";
  return message;
}

export function createSupabaseProvider(url: string, anonKey: string): DataProvider {
  const sb: SupabaseClient = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });

  const currentUser = async () => (await sb.auth.getSession()).data.session?.user ?? null;

  const requireUser = async () => {
    const user = await currentUser();
    if (!user) throw new Error("Inicia sesión para continuar.");
    return user;
  };

  return {
    mode: "cloud",

    async getProfile() {
      const user = await currentUser();
      if (!user) return null;
      const { data, error } = await sb.from("profiles").select("id,name,school,role,preferences").eq("id", user.id).maybeSingle<ProfileRow>();
      fail(error);
      const prefs = data?.preferences ?? {};
      return {
        id: user.id,
        email: user.email ?? "",
        name: data?.name || (user.user_metadata?.name as string) || "",
        school: data?.school ?? "",
        role: data?.role ?? "Docente",
        defaultHeader: { ...DEFAULT_HEADER, ...(prefs.defaultHeader ?? {}) },
        defaultPageSize: prefs.defaultPageSize ?? "A4",
      } satisfies Profile;
    },

    async signIn(email, password) {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      fail(error);
    },

    async signUp(name, email, password) {
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: { data: { name }, emailRedirectTo: window.location.origin },
      });
      fail(error);
      return { needsConfirmation: !data.session };
    },

    async sendMagicLink(email) {
      const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
      fail(error);
    },

    async signOut() {
      const { error } = await sb.auth.signOut();
      fail(error);
    },

    async updateProfile(patch) {
      const user = await requireUser();
      const current = await this.getProfile();
      const next = { ...(current as Profile), ...patch };
      const { error } = await sb
        .from("profiles")
        .update({
          name: next.name,
          school: next.school,
          role: next.role,
          preferences: { defaultHeader: next.defaultHeader, defaultPageSize: next.defaultPageSize },
        })
        .eq("id", user.id);
      fail(error);
      return next;
    },

    onAuthChange(cb) {
      const { data } = sb.auth.onAuthStateChange(() => cb());
      return () => data.subscription.unsubscribe();
    },

    async listSaved() {
      if (!(await currentUser())) return [];
      const { data, error } = await sb.from("activities").select("*").order("updated_at", { ascending: false });
      fail(error);
      return (data as ActivityRow[]).map(toSaved);
    },

    async saveActivity({ snapshot, folder, notes }) {
      await requireUser();
      const { data, error } = await sb
        .from("activities")
        .insert({
          title: snapshot.title,
          type: snapshot.type,
          difficulty: snapshot.difficulty,
          folder: folder.trim() || "General",
          notes,
          snapshot,
        })
        .select("*")
        .single<ActivityRow>();
      fail(error);
      return toSaved(data!);
    },

    async updateSaved(id, patch) {
      const row: Record<string, unknown> = {};
      if (patch.title !== undefined) row.title = patch.title;
      if (patch.folder !== undefined) row.folder = patch.folder;
      if (patch.notes !== undefined) row.notes = patch.notes;
      if (patch.isFavorite !== undefined) row.is_favorite = patch.isFavorite;
      if (patch.snapshot) {
        row.snapshot = patch.snapshot;
        row.title = patch.snapshot.title;
        row.type = patch.snapshot.type;
        row.difficulty = patch.snapshot.difficulty;
      }
      const { error } = await sb.from("activities").update(row).eq("id", id);
      fail(error);
    },

    async deleteSaved(id) {
      const { error } = await sb.from("activities").delete().eq("id", id);
      fail(error);
    },

    async listCommunity() {
      const user = await currentUser();
      const [feed, likes] = await Promise.all([
        sb
          .from("community_feed")
          .select("*, author:profiles(name, school)")
          .order("created_at", { ascending: false })
          .limit(200),
        user ? sb.from("community_likes").select("community_id") : Promise.resolve({ data: [], error: null }),
      ]);
      fail(feed.error);
      fail(likes.error);
      const liked = new Set(((likes.data ?? []) as { community_id: string }[]).map((l) => l.community_id));
      const rows = (feed.data as CommunityRow[]).map((r) => toCommunity(r, liked));
      // Mientras la comunidad está vacía, mostramos los ejemplos para orientar.
      return rows.length > 0 ? rows : EXAMPLE_COMMUNITY;
    },

    async publish(snapshot, details) {
      await requireUser();
      const { data, error } = await sb
        .from("community_feed")
        .insert({
          title: snapshot.title,
          type: snapshot.type,
          difficulty: snapshot.difficulty,
          subject: details.subject,
          grade: details.grade,
          description: details.description,
          tags: details.tags,
          snapshot,
        })
        .select("*, author:profiles(name, school)")
        .single<CommunityRow>();
      fail(error);
      return toCommunity(data!, new Set());
    },

    async unpublish(id) {
      const { error } = await sb.from("community_feed").delete().eq("id", id);
      fail(error);
    },

    async toggleLike(id) {
      const user = await requireUser();
      const { data, error } = await sb.from("community_likes").select("community_id").eq("community_id", id).maybeSingle();
      fail(error);
      if (data) {
        const res = await sb.from("community_likes").delete().eq("community_id", id).eq("user_id", user.id);
        fail(res.error);
        return false;
      }
      const res = await sb.from("community_likes").insert({ community_id: id });
      fail(res.error);
      return true;
    },

    async recordDownload(id) {
      if (id.startsWith("ex_")) return;
      await sb.rpc("increment_download", { community_id: id });
    },
  };
}
