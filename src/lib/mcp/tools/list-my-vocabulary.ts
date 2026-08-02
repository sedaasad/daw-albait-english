import { defineTool } from "@lovable.dev/mcp-js";
import { fail, ok, requireAuth, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_my_vocabulary",
  title: "List my saved vocabulary",
  description: "List the words the signed-in learner has saved to their personal vocabulary list.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    try {
      const userId = requireAuth(ctx);
      const { data, error } = await supabaseForUser(ctx)
        .from("user_vocabulary")
        .select("saved_at, dictionary_words(word, phonetic, meaning_ar, example_en, example_ar, cefr_level)")
        .eq("user_id", userId)
        .order("saved_at", { ascending: false });
      if (error) return fail(error.message);

      return ok({
        saved_words: (data ?? []).map((row) => ({ saved_at: row.saved_at, ...(row.dictionary_words ?? {}) })),
      });
    } catch (e) {
      return fail(e instanceof Error ? e.message : "Unexpected error");
    }
  },
});
