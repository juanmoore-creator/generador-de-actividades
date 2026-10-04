export type SupabasePublicEnvironment = Readonly<{
  url: string;
  publishableKey: string;
}>;

export function getSupabasePublicEnvironment(): SupabasePublicEnvironment {
  const urlValue = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const keyValue = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!urlValue || !keyValue) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  let url: URL;
  try {
    url = new URL(urlValue);
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid absolute URL.");
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
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL must be an HTTPS project origin (HTTP is allowed only for localhost).",
    );
  }

  if (!/^sb_publishable_[A-Za-z0-9_-]{20,}$/.test(keyValue)) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must use a Supabase sb_publishable_ key.",
    );
  }

  return { url: url.origin, publishableKey: keyValue };
}
