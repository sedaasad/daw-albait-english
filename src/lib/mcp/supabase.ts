import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";

/**
 * Creates a Supabase client that acts as the authenticated MCP caller.
 * The verified OAuth bearer token is forwarded so RLS runs as that user.
 * Never called at module load — only inside tool handlers.
 */
export function supabaseForUser(ctx: ToolContext): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Backend is not configured");

  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function requireAuth(ctx: ToolContext) {
  if (!ctx.isAuthenticated()) {
    throw new Error("Not authenticated. Please connect your account first.");
  }
  return ctx.getUserId();
}

export function ok(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
    structuredContent: data as Record<string, unknown>,
  };
}

export function fail(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true };
}
