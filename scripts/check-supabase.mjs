import { readFileSync } from "node:fs";
import process from "node:process";

try {
  const envFile = readFileSync(".env.local", "utf8");
  for (const [index, line] of envFile.split(/\r?\n/).entries()) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!match) throw new Error(`Invalid .env.local syntax on line ${index + 1}.`);
    const [, name, value] = match;
    if (process.env[name] === undefined) process.env[name] = value;
  }
} catch {
  console.error("Supabase smoke check requires a readable .env.local with KEY=value lines.");
  process.exit(1);
}

const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

if (!projectUrl || !publishableKey || !/^sb_publishable_[A-Za-z0-9_-]{20,}$/.test(publishableKey)) {
  console.error("Set a valid Supabase URL and sb_publishable_ key in .env.local.");
  process.exit(1);
}

let baseUrl;
try {
  baseUrl = new URL(projectUrl);
} catch {
  console.error("NEXT_PUBLIC_SUPABASE_URL must be a valid absolute URL.");
  process.exit(1);
}

if (
  baseUrl.protocol !== "https:" ||
  baseUrl.origin !== "https://fveahyatcdvaiyfiuwtf.supabase.co"
) {
  console.error("The smoke check is restricted to the authorized genact Supabase project URL.");
  process.exit(1);
}

const headers = {
  apikey: publishableKey,
  authorization: `Bearer ${publishableKey}`,
  accept: "application/json",
};

const feedResponse = await fetch(
  new URL("/rest/v1/community_feed?select=id&limit=1", baseUrl),
  { headers, cache: "no-store" },
);
if (!feedResponse.ok) {
  console.error(`Public community feed request failed with HTTP ${feedResponse.status}.`);
  process.exit(1);
}
const feedData = await feedResponse.json();
if (!Array.isArray(feedData)) {
  console.error("Public community feed response was not a JSON array.");
  process.exit(1);
}
console.log(`Public community feed: HTTP ${feedResponse.status}; ${feedData.length} row(s) returned.`);

const privateResponse = await fetch(
  new URL("/rest/v1/activities?select=id&limit=1", baseUrl),
  { headers, cache: "no-store" },
);
if (privateResponse.status !== 401 && privateResponse.status !== 403) {
  console.error(`Unauthenticated private activities request was not denied (HTTP ${privateResponse.status}).`);
  process.exit(1);
}
console.log(`Unauthenticated private activities: denied with HTTP ${privateResponse.status}.`);
