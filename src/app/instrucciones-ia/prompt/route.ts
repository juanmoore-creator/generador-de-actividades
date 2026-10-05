export const dynamic = "force-static";

import { AI_SYSTEM_PROMPT } from "@/lib/csv/themePrompt";

export { AI_SYSTEM_PROMPT };

export function GET() {
  return new Response(AI_SYSTEM_PROMPT, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
