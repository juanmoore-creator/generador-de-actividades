"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { getSupabasePublicEnvironment } from "@/lib/supabase/env";

export function createSupabaseBrowserClient(): SupabaseClient<Database> {
  const { url, publishableKey } = getSupabasePublicEnvironment();
  return createBrowserClient<Database>(url, publishableKey);
}
