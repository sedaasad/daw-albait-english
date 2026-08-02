import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, requireAuth, supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_dictionary",
  title: "Search the English-Arabic dictionary",
  description:
    "Search the app's English-Arabic learning dictionary for a word and return phonetics, Arabic meaning and example sentences.",
  inputSchema: {
    query: z.string().describe("English word or partial word to look up."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query }, ctx) => {
    try {
      requireAuth(ctx);
      const term = query.trim();
      if (!term) return fail("Query cannot be empty.");

      const { data, error } = await supabaseForUser(ctx)
        .from("dictionary_words")
        .select("id, word, phonetic, meaning_ar, example_en, example_ar, cefr_level")
        .ilike("word", `%${term}%`)
        .order("word")
        .limit(20);
      if (error) return fail(error.message);

      return ok({ results: data ?? [] });
    } catch (e) {
      return fail(e instanceof Error ? e.message : "Unexpected error");
    }
  },
});
