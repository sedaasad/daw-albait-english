import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, requireAuth, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_modules",
  title: "List curriculum modules",
  description:
    "List the published curriculum modules of the English learning platform, with CEFR level, Arabic/English titles and estimated hours.",
  inputSchema: {
    level_code: z
      .string()
      .optional()
      .describe("Optional CEFR level filter, e.g. A0, A1, B1."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ level_code }, ctx) => {
    try {
      requireAuth(ctx);
      let query = supabaseForUser(ctx)
        .from("modules")
        .select("id, slug, level_code, title_en, title_ar, description_ar, est_hours, order_index")
        .eq("is_published", true)
        .order("order_index");
      if (level_code) query = query.eq("level_code", level_code.toUpperCase());
      const { data, error } = await query;
      if (error) return fail(error.message);
      return ok({ modules: data ?? [] });
    } catch (e) {
      return fail(e instanceof Error ? e.message : "Unexpected error");
    }
  },
});
