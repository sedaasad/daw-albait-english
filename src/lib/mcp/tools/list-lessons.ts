import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, requireAuth, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_lessons",
  title: "List lessons",
  description:
    "List published lessons. Optionally filter by module slug (e.g. a0-m1-alphabet-sounds). Archived legacy lessons are excluded.",
  inputSchema: {
    module_slug: z.string().optional().describe("Slug of the module to list lessons for."),
    limit: z.number().int().optional().describe("Max lessons to return (default 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ module_slug, limit }, ctx) => {
    try {
      requireAuth(ctx);
      const supabase = supabaseForUser(ctx);

      let moduleId: string | undefined;
      if (module_slug) {
        const { data: mod, error: modErr } = await supabase
          .from("modules")
          .select("id")
          .eq("slug", module_slug)
          .maybeSingle();
        if (modErr) return fail(modErr.message);
        if (!mod) return fail(`No module found with slug "${module_slug}".`);
        moduleId = mod.id;
      }

      let query = supabase
        .from("lessons")
        .select("id, slug, title_en, title_ar, description_ar, cefr_level, duration_min, order_index, module_id")
        .eq("is_published", true)
        .is("archived_at", null)
        .order("order_index")
        .limit(Math.min(limit ?? 50, 200));
      if (moduleId) query = query.eq("module_id", moduleId);

      const { data, error } = await query;
      if (error) return fail(error.message);
      return ok({ lessons: data ?? [] });
    } catch (e) {
      return fail(e instanceof Error ? e.message : "Unexpected error");
    }
  },
});
