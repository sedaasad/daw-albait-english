import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, requireAuth, supabaseForUser } from "../supabase";

export default defineTool({
  name: "save_word",
  title: "Save a word to my vocabulary",
  description:
    "Save a dictionary word to the signed-in learner's personal vocabulary list. The word must already exist in the app dictionary.",
  inputSchema: {
    word: z.string().describe("The exact English word to save, e.g. 'library'."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ word }, ctx) => {
    try {
      const userId = requireAuth(ctx);
      const supabase = supabaseForUser(ctx);
      const term = word.trim();
      if (!term) return fail("Word cannot be empty.");

      const { data: entry, error: lookupError } = await supabase
        .from("dictionary_words")
        .select("id, word")
        .ilike("word", term)
        .maybeSingle();
      if (lookupError) return fail(lookupError.message);
      if (!entry) return fail(`"${term}" is not in the dictionary yet.`);

      const { error } = await supabase
        .from("user_vocabulary")
        .upsert({ user_id: userId, word_id: entry.id }, { onConflict: "user_id,word_id" });
      if (error) return fail(error.message);

      return ok({ saved: true, word: entry.word });
    } catch (e) {
      return fail(e instanceof Error ? e.message : "Unexpected error");
    }
  },
});
