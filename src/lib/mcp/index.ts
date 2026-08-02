import { auth, defineMcp } from "@lovable.dev/mcp-js";

import getLessonTool from "./tools/get-lesson";
import getMyProgressTool from "./tools/get-my-progress";
import listLessonsTool from "./tools/list-lessons";
import listModulesTool from "./tools/list-modules";
import listMyVocabularyTool from "./tools/list-my-vocabulary";
import saveWordTool from "./tools/save-word";
import searchDictionaryTool from "./tools/search-dictionary";

// The OAuth issuer must be the direct Supabase auth host, built from the
// project ref (inlined at build time, so this stays import-safe).
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "daw-albayt-mcp",
  title: "ضوء البيت — English Learning",
  version: "0.1.0",
  instructions:
    "Tools for the ضوء البيت Arabic-first English learning platform. Use `list_modules` and `list_lessons` to browse the CEFR curriculum, `get_lesson` for full lesson content (sections + vocabulary), `search_dictionary` for English-Arabic word lookups, `save_word` to add a word to the learner's vocabulary list, `list_my_vocabulary` to review saved words, and `get_my_progress` for the signed-in learner's level, points, streak and quiz scores. All tools act as the signed-in learner only.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listModulesTool,
    listLessonsTool,
    getLessonTool,
    searchDictionaryTool,
    saveWordTool,
    listMyVocabularyTool,
    getMyProgressTool,
  ],
});
