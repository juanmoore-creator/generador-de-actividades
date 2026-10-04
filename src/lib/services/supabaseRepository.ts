import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Tables,
  TablesInsert,
} from "@/lib/supabase/database.types";
import type { Database, Json } from "@/lib/supabase/database.types";
import type { ActivityType, Difficulty } from "@/lib/types/activities";

type Profile = Tables<"profiles">;
type ActivityRow = Tables<"activities">;
type FeedRow = Tables<"community_feed">;
type ActivityInsert = TablesInsert<"activities">;
type FeedInsert = TablesInsert<"community_feed">;

export type ActivityRecord = Omit<ActivityRow, "user_id">;
export type CommunityPost = Omit<FeedRow, "author_id">;
export type ProfilePresentation = Pick<Profile, "id" | "display_name" | "avatar_url" | "created_at" | "updated_at">;

export type CreateActivityInput = Pick<ActivityInsert, "title" | "type" | "snapshot"> & {
  type: ActivityType;
  difficulty?: Difficulty;
  folder?: string;
  notes?: string;
  is_favorite?: boolean;
  is_published?: boolean;
};

export type UpdateActivityInput = Partial<
  Pick<ActivityInsert, "title" | "type" | "difficulty" | "folder" | "notes" | "is_favorite" | "is_published" | "snapshot">
> & { type?: ActivityType; difficulty?: Difficulty };

export type CreateCommunityPostInput = Pick<
  FeedInsert,
  "title" | "type" | "snapshot"
> & {
  type: ActivityType;
  difficulty?: Difficulty;
  source_activity_id?: string | null;
  subject?: string;
  grade?: string;
  description?: string;
  tags?: string[];
};

export type UpdateCommunityPostInput = Partial<
  Pick<FeedInsert, "title" | "type" | "difficulty" | "source_activity_id" | "subject" | "grade" | "description" | "tags" | "snapshot">
> & { type?: ActivityType; difficulty?: Difficulty };

export type PageOptions = Readonly<{ page?: number; pageSize?: number }>;

export class SupabaseRepositoryError extends Error {
  constructor(
    readonly code: string,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "SupabaseRepositoryError";
  }
}

type Client = SupabaseClient<Database>;

const ACTIVITY_COLUMNS =
  "id,title,type,difficulty,folder,notes,is_favorite,is_published,snapshot,created_at,updated_at" as const;
const COMMUNITY_COLUMNS =
  "id,title,type,difficulty,subject,grade,description,tags,snapshot,author_id,likes_count,downloads_count,source_activity_id,created_at,updated_at" as const;
const PAGE_SIZE_DEFAULT = 20;
const PAGE_SIZE_MAX = 50;
const PAGE_MAX = 200;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function throwBackendError(operation: string, error: { code?: string; message: string }): never {
  throw new SupabaseRepositoryError(
    error.code ?? "database_error",
    `${operation} failed: ${error.message}`,
  );
}

async function requireCurrentUser(client: Client): Promise<{ id: string }> {
  const { data, error } = await client.auth.getUser();
  if (error) throwBackendError("Validate current Supabase user", error);
  if (!data.user) {
    throw new SupabaseRepositoryError("unauthenticated", "Sign in before changing private data.");
  }
  return { id: data.user.id };
}

function validateId(id: string): string {
  if (!UUID_PATTERN.test(id)) {
    throw new SupabaseRepositoryError("invalid_id", "The requested record ID is not a valid UUID.");
  }
  return id;
}

function pageRange(options: PageOptions = {}): { from: number; to: number } {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? PAGE_SIZE_DEFAULT;
  if (!Number.isInteger(page) || page < 1 || page > PAGE_MAX) {
    throw new SupabaseRepositoryError("invalid_page", `Page must be between 1 and ${PAGE_MAX}.`);
  }
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > PAGE_SIZE_MAX) {
    throw new SupabaseRepositoryError("invalid_page_size", `Page size must be between 1 and ${PAGE_SIZE_MAX}.`);
  }
  const from = (page - 1) * pageSize;
  return { from, to: from + pageSize - 1 };
}

function activityInsert(input: CreateActivityInput): ActivityInsert {
  return {
    title: input.title,
    type: input.type,
    snapshot: input.snapshot as Json,
    ...(input.difficulty === undefined ? {} : { difficulty: input.difficulty }),
    ...(input.folder === undefined ? {} : { folder: input.folder }),
    ...(input.notes === undefined ? {} : { notes: input.notes }),
    ...(input.is_favorite === undefined ? {} : { is_favorite: input.is_favorite }),
  };
}

function activityUpdate(input: UpdateActivityInput): Partial<ActivityInsert> {
  const patch: Partial<ActivityInsert> = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.type !== undefined) patch.type = input.type;
  if (input.snapshot !== undefined) patch.snapshot = input.snapshot;
  if (input.difficulty !== undefined) patch.difficulty = input.difficulty;
  if (input.folder !== undefined) patch.folder = input.folder;
  if (input.notes !== undefined) patch.notes = input.notes;
  if (input.is_favorite !== undefined) patch.is_favorite = input.is_favorite;
  if (input.is_published !== undefined) patch.is_published = input.is_published;
  if (Object.keys(patch).length === 0) {
    throw new SupabaseRepositoryError("empty_update", "Provide at least one activity field to update.");
  }
  return patch;
}

function feedInsert(input: CreateCommunityPostInput): FeedInsert {
  return {
    title: input.title,
    type: input.type,
    snapshot: input.snapshot as Json,
    ...(input.difficulty === undefined ? {} : { difficulty: input.difficulty }),
    ...(input.source_activity_id === undefined ? {} : { source_activity_id: input.source_activity_id }),
    ...(input.subject === undefined ? {} : { subject: input.subject }),
    ...(input.grade === undefined ? {} : { grade: input.grade }),
    ...(input.description === undefined ? {} : { description: input.description }),
    ...(input.tags === undefined ? {} : { tags: [...input.tags] }),
  };
}

function feedUpdate(input: UpdateCommunityPostInput): Partial<FeedInsert> {
  const patch: Partial<FeedInsert> = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.type !== undefined) patch.type = input.type;
  if (input.snapshot !== undefined) patch.snapshot = input.snapshot;
  if (input.difficulty !== undefined) patch.difficulty = input.difficulty;
  if (input.source_activity_id !== undefined) patch.source_activity_id = input.source_activity_id;
  if (input.subject !== undefined) patch.subject = input.subject;
  if (input.grade !== undefined) patch.grade = input.grade;
  if (input.description !== undefined) patch.description = input.description;
  if (input.tags !== undefined) patch.tags = [...input.tags];
  if (Object.keys(patch).length === 0) {
    throw new SupabaseRepositoryError("empty_update", "Provide at least one community post field to update.");
  }
  return patch;
}

async function requireMutationResult<T>(
  operation: string,
  result: { data: T | null; error: { code?: string; message: string } | null },
): Promise<T> {
  if (result.error) throwBackendError(operation, result.error);
  if (!result.data) {
    throw new SupabaseRepositoryError("not_found", `${operation} did not change a row; it may not exist or may not be owned by the current user.`);
  }
  return result.data;
}

export async function ensureCurrentProfile(
  client: Client,
  input: Partial<Pick<Profile, "display_name" | "avatar_url">> = {},
): Promise<ProfilePresentation> {
  const user = await requireCurrentUser(client);
  const publicFields = {
    ...(input.display_name === undefined ? {} : { display_name: input.display_name }),
    ...(input.avatar_url === undefined ? {} : { avatar_url: input.avatar_url }),
  };

  if (Object.keys(publicFields).length === 0) {
    const existing = await client.from("profiles").select("id,display_name,avatar_url,created_at,updated_at").eq("id", user.id).maybeSingle();
    if (existing.error) throwBackendError("Read current profile", existing.error);
    if (existing.data) return existing.data;
  }

  const result = await client
    .from("profiles")
    .upsert({ id: user.id, ...publicFields }, { onConflict: "id" })
    .select("id,display_name,avatar_url,created_at,updated_at")
    .single();
  if (result.error) throwBackendError("Create or update current profile", result.error);
  return result.data;
}

export async function listOwnActivities(client: Client, options: PageOptions = {}): Promise<ActivityRecord[]> {
  const user = await requireCurrentUser(client);
  const { from, to } = pageRange(options);
  const result = await client
    .from("activities")
    .select(ACTIVITY_COLUMNS)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, to);
  if (result.error) throwBackendError("List current user's activities", result.error);
  return result.data;
}

export async function createOwnActivity(client: Client, input: CreateActivityInput): Promise<ActivityRecord> {
  const user = await requireCurrentUser(client);
  const result = await client
    .from("activities")
    .insert({ ...activityInsert(input), user_id: user.id })
    .select(ACTIVITY_COLUMNS)
    .single();
  if (result.error) throwBackendError("Create activity", result.error);
  return result.data;
}

export async function updateOwnActivity(
  client: Client,
  id: string,
  input: UpdateActivityInput,
): Promise<ActivityRecord> {
  const user = await requireCurrentUser(client);
  const result = await client
    .from("activities")
    .update(activityUpdate(input))
    .eq("id", validateId(id))
    .eq("user_id", user.id)
    .select(ACTIVITY_COLUMNS)
    .maybeSingle();
  return requireMutationResult("Update activity", result);
}

export async function deleteOwnActivity(client: Client, id: string): Promise<void> {
  const user = await requireCurrentUser(client);
  const result = await client
    .from("activities")
    .delete()
    .eq("id", validateId(id))
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();
  await requireMutationResult("Delete activity", result);
}

export async function listCommunityFeed(client: Client, options: PageOptions = {}): Promise<CommunityPost[]> {
  const { from, to } = pageRange(options);
  const result = await client
    .from("community_feed")
    .select(COMMUNITY_COLUMNS)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, to);
  if (result.error) throwBackendError("List published community activities", result.error);
  return result.data;
}

export async function publishCommunityPost(
  client: Client,
  input: CreateCommunityPostInput,
): Promise<CommunityPost> {
  const user = await requireCurrentUser(client);
  const result = await client
    .from("community_feed")
    .insert({ ...feedInsert(input), author_id: user.id })
    .select(COMMUNITY_COLUMNS)
    .single();
  if (result.error) throwBackendError("Publish community activity", result.error);
  return result.data;
}

export async function updateOwnCommunityPost(
  client: Client,
  id: string,
  input: UpdateCommunityPostInput,
): Promise<CommunityPost> {
  const user = await requireCurrentUser(client);
  const result = await client
    .from("community_feed")
    .update(feedUpdate(input))
    .eq("id", validateId(id))
    .eq("author_id", user.id)
    .select(COMMUNITY_COLUMNS)
    .maybeSingle();
  return requireMutationResult("Update community post", result);
}

export async function deleteOwnCommunityPost(client: Client, id: string): Promise<void> {
  const user = await requireCurrentUser(client);
  const result = await client
    .from("community_feed")
    .delete()
    .eq("id", validateId(id))
    .eq("author_id", user.id)
    .select("id")
    .maybeSingle();
  await requireMutationResult("Delete community post", result);
}

export async function hasLikedCommunityPost(client: Client, communityId: string): Promise<boolean> {
  const user = await requireCurrentUser(client);
  const result = await client
    .from("community_likes")
    .select("community_id")
    .eq("community_id", validateId(communityId))
    .eq("user_id", user.id)
    .maybeSingle();
  if (result.error) throwBackendError("Read current user's community like", result.error);
  return result.data !== null;
}

export async function likeCommunityPost(client: Client, communityId: string): Promise<void> {
  const user = await requireCurrentUser(client);
  const { error } = await client
    .from("community_likes")
    .insert({ community_id: validateId(communityId), user_id: user.id });
  if (error) throwBackendError("Like community post", error);
}

export async function unlikeCommunityPost(client: Client, communityId: string): Promise<void> {
  const user = await requireCurrentUser(client);
  const result = await client
    .from("community_likes")
    .delete()
    .eq("community_id", validateId(communityId))
    .eq("user_id", user.id)
    .select("community_id")
    .maybeSingle();
  await requireMutationResult("Remove community like", result);
}
