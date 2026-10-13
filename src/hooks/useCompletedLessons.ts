import { useCallback, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const LEGACY_KEY = "daw-albait-completed-lessons";

/**
 * Lesson completion is stored on the student's account (profiles.completed_lessons)
 * via the mark_lesson_complete RPC, so it persists across devices.
 */
export function useCompletedLessons() {
  const { user, profile, refreshProfile } = useAuth();
  const migrated = useRef(false);

  const completed = useMemo(
    () => new Set<string>(profile?.completed_lessons ?? []),
    [profile?.completed_lessons],
  );

  // One-time upload of completions saved on this device before account sync existed.
  useEffect(() => {
    if (!user || !profile || migrated.current) return;
    migrated.current = true;
    let legacy: string[] = [];
    try {
      legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || "[]");
    } catch {
      legacy = [];
    }
    const missing = legacy.filter((id) => typeof id === "string" && !completed.has(id));
    if (missing.length === 0) {
      localStorage.removeItem(LEGACY_KEY);
      return;
    }
    (async () => {
      for (const id of missing) {
        await supabase.rpc("mark_lesson_complete", { _lesson_id: id });
      }
      localStorage.removeItem(LEGACY_KEY);
      await refreshProfile();
    })();
  }, [user, profile, completed, refreshProfile]);

  const markComplete = useCallback(
    async (id: string) => {
      if (!user) return;
      const { error } = await supabase.rpc("mark_lesson_complete", { _lesson_id: id });
      if (error) console.error("mark_lesson_complete failed", error);
      await refreshProfile();
    },
    [user, refreshProfile],
  );

  return { completed, markComplete };
}
