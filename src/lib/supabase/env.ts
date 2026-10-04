export type SupabasePublicEnvironment = Readonly<{
  url: string;
  publishableKey: string;
}>;

export function getSupabasePublicEnvironment(): SupabasePublicEnvironment | null {
  const urlValue = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const keyValue = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )?.trim();

  if (!urlValue || !keyValue) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(urlValue);
  } catch {
    return null;
  }

  const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  const isSupabaseHostedProject = url.hostname.endsWith(".supabase.co");
  if (
    (url.protocol !== "https:" && !(isLocalhost && url.protocol === "http:")) ||
    (!isLocalhost && !isSupabaseHostedProject) ||
    url.username !== "" ||
    url.password !== "" ||
    url.search !== "" ||
    url.hash !== "" ||
    (url.pathname !== "/" && url.pathname !== "")
  ) {
    return null;
  }

  const isPublishable = /^sb_publishable_[A-Za-z0-9_-]{20,}$/.test(keyValue);
  const isJwt = /^eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(keyValue);
  if (!isPublishable && !isJwt) {
    return null;
  }

  return { url: url.origin, publishableKey: keyValue };
}

export function requireSupabasePublicEnvironment(): SupabasePublicEnvironment {
  const env = getSupabasePublicEnvironment();
  if (!env) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).",
    );
  }
  return env;
}
