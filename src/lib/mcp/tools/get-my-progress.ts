import { defineTool } from "@lovable.dev/mcp-js";
import { fail, ok, requireAuth, supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_my_progress",
  title: "Get my learning progress",
  description:
    "Get the signed-in learner's own progress: CEFR level, points, streak, placement results and recent quiz scores.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    try {
      const userId = requireAuth(ctx);
      const supabase = supabaseForUser(ctx);

      const [profile, scores] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            "display_name, cefr_level, current_level, total_points, streak_days, completed_lessons, placement_completed, placement_score, placement_strengths, placement_weaknesses",
          )
          .eq("id", userId)
          .maybeSingle(),
        supabase
          .from("quiz_scores")
          .select("lesson_id, score, total, completed_at")
          .eq("user_id", userId)
          .order("completed_at", { ascending: false })
          .limit(20),
      ]);

      if (profile.error) return fail(profile.error.message);
      if (scores.error) return fail(scores.error.message);

      return ok({ profile: profile.data, recent_quiz_scores: scores.data ?? [] });
    } catch (e) {
      return fail(e instanceof Error ? e.message : "Unexpected error");
    }
  },
});
