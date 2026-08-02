import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, requireAuth, supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_lesson",
  title: "Get lesson content",
  description:
    "Fetch a lesson's full content by slug: intro, learning outcomes, AI tips, ordered content sections and linked vocabulary items.",
  inputSchema: {
    slug: z.string().describe("Lesson slug, e.g. a0-m1-l1."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }, ctx) => {
    try {
      requireAuth(ctx);
      const supabase = supabaseForUser(ctx);

      const { data: lesson, error } = await supabase
        .from("lessons")
        .select(
          "id, slug, title_en, title_ar, description_ar, intro_en, intro_ar, learning_outcomes_ar, ai_tips_ar, cefr_level, duration_min",
        )
        .eq("slug", slug)
        .maybeSingle();
      if (error) return fail(error.message);
      if (!lesson) return fail(`No lesson found with slug "${slug}".`);

      const [sections, vocab] = await Promise.all([
        supabase
          .from("lesson_sections")
          .select("section_type, title_en, title_ar, content, order_index")
          .eq("lesson_id", lesson.id)
          .order("order_index"),
        supabase
          .from("lesson_vocabulary")
          .select("order_index, vocabulary_items(word_en, phonetic, meaning_ar, example_en, example_ar)")
          .eq("lesson_id", lesson.id)
          .order("order_index"),
      ]);

      if (sections.error) return fail(sections.error.message);
      if (vocab.error) return fail(vocab.error.message);

      return ok({
        lesson,
        sections: sections.data ?? [],
        vocabulary: (vocab.data ?? []).map((v) => v.vocabulary_items),
      });
    } catch (e) {
      return fail(e instanceof Error ? e.message : "Unexpected error");
    }
  },
});
