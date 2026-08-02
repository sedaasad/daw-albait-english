export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      dictionary_words: {
        Row: {
          cefr_level: Database["public"]["Enums"]["cefr_level"] | null
          created_at: string
          example_ar: string | null
          example_en: string | null
          id: string
          meaning_ar: string
          phonetic: string | null
          word: string
        }
        Insert: {
          cefr_level?: Database["public"]["Enums"]["cefr_level"] | null
          created_at?: string
          example_ar?: string | null
          example_en?: string | null
          id?: string
          meaning_ar: string
          phonetic?: string | null
          word: string
        }
        Update: {
          cefr_level?: Database["public"]["Enums"]["cefr_level"] | null
          created_at?: string
          example_ar?: string | null
          example_en?: string | null
          id?: string
          meaning_ar?: string
          phonetic?: string | null
          word?: string
        }
        Relationships: []
      }
      lesson_sections: {
        Row: {
          content: Json
          created_at: string
          id: string
          lesson_id: string
          order_index: number
          section_type: string
          title_ar: string | null
          title_en: string | null
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          lesson_id: string
          order_index?: number
          section_type: string
          title_ar?: string | null
          title_en?: string | null
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          lesson_id?: string
          order_index?: number
          section_type?: string
          title_ar?: string | null
          title_en?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_sections_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_vocabulary: {
        Row: {
          lesson_id: string
          order_index: number
          vocabulary_id: string
        }
        Insert: {
          lesson_id: string
          order_index?: number
          vocabulary_id: string
        }
        Update: {
          lesson_id?: string
          order_index?: number
          vocabulary_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_vocabulary_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_vocabulary_vocabulary_id_fkey"
            columns: ["vocabulary_id"]
            isOneToOne: false
            referencedRelation: "vocabulary_items"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          ai_tips_ar: string | null
          archived_at: string | null
          audio_url: string | null
          body_md: string
          cefr_level: Database["public"]["Enums"]["cefr_level"] | null
          created_at: string
          day_number: number | null
          description_ar: string
          duration_min: number | null
          id: string
          image_url: string | null
          intro_ar: string | null
          intro_en: string | null
          is_published: boolean
          learning_outcomes_ar: string[] | null
          module_id: string | null
          order_index: number | null
          slug: string | null
          title_ar: string
          title_en: string
          updated_at: string
        }
        Insert: {
          ai_tips_ar?: string | null
          archived_at?: string | null
          audio_url?: string | null
          body_md?: string
          cefr_level?: Database["public"]["Enums"]["cefr_level"] | null
          created_at?: string
          day_number?: number | null
          description_ar?: string
          duration_min?: number | null
          id?: string
          image_url?: string | null
          intro_ar?: string | null
          intro_en?: string | null
          is_published?: boolean
          learning_outcomes_ar?: string[] | null
          module_id?: string | null
          order_index?: number | null
          slug?: string | null
          title_ar: string
          title_en?: string
          updated_at?: string
        }
        Update: {
          ai_tips_ar?: string | null
          archived_at?: string | null
          audio_url?: string | null
          body_md?: string
          cefr_level?: Database["public"]["Enums"]["cefr_level"] | null
          created_at?: string
          day_number?: number | null
          description_ar?: string
          duration_min?: number | null
          id?: string
          image_url?: string | null
          intro_ar?: string | null
          intro_en?: string | null
          is_published?: boolean
          learning_outcomes_ar?: string[] | null
          module_id?: string | null
          order_index?: number | null
          slug?: string | null
          title_ar?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      levels: {
        Row: {
          code: string
          created_at: string
          description_ar: string | null
          name_ar: string
          name_en: string
          order_index: number
        }
        Insert: {
          code: string
          created_at?: string
          description_ar?: string | null
          name_ar: string
          name_en: string
          order_index?: number
        }
        Update: {
          code?: string
          created_at?: string
          description_ar?: string | null
          name_ar?: string
          name_en?: string
          order_index?: number
        }
        Relationships: []
      }
      listening_tasks: {
        Row: {
          audio_text: string
          comprehension_question_ar: string | null
          correct_index: number | null
          created_at: string
          id: string
          lesson_id: string
          options: Json | null
          order_index: number
          prompt_ar: string
        }
        Insert: {
          audio_text: string
          comprehension_question_ar?: string | null
          correct_index?: number | null
          created_at?: string
          id?: string
          lesson_id: string
          options?: Json | null
          order_index?: number
          prompt_ar: string
        }
        Update: {
          audio_text?: string
          comprehension_question_ar?: string | null
          correct_index?: number | null
          created_at?: string
          id?: string
          lesson_id?: string
          options?: Json | null
          order_index?: number
          prompt_ar?: string
        }
        Relationships: [
          {
            foreignKeyName: "listening_tasks_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          bg_gradient: string | null
          created_at: string
          description_ar: string | null
          est_hours: number | null
          icon: string | null
          id: string
          is_published: boolean
          level_code: string
          order_index: number
          slug: string
          title_ar: string
          title_en: string
          updated_at: string
        }
        Insert: {
          bg_gradient?: string | null
          created_at?: string
          description_ar?: string | null
          est_hours?: number | null
          icon?: string | null
          id?: string
          is_published?: boolean
          level_code: string
          order_index?: number
          slug: string
          title_ar: string
          title_en: string
          updated_at?: string
        }
        Update: {
          bg_gradient?: string | null
          created_at?: string
          description_ar?: string | null
          est_hours?: number | null
          icon?: string | null
          id?: string
          is_published?: boolean
          level_code?: string
          order_index?: number
          slug?: string
          title_ar?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_level_code_fkey"
            columns: ["level_code"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["code"]
          },
        ]
      }
      profiles: {
        Row: {
          cefr_level: Database["public"]["Enums"]["cefr_level"] | null
          completed_lessons: string[]
          created_at: string
          current_level: Database["public"]["Enums"]["user_level"]
          display_name: string | null
          email: string | null
          id: string
          is_approved: boolean
          last_login_date: string | null
          placement_completed: boolean
          placement_completed_at: string | null
          placement_score: number | null
          placement_strengths: string[]
          placement_weaknesses: string[]
          profile_image: string | null
          streak_days: number
          total_points: number
          updated_at: string
        }
        Insert: {
          cefr_level?: Database["public"]["Enums"]["cefr_level"] | null
          completed_lessons?: string[]
          created_at?: string
          current_level?: Database["public"]["Enums"]["user_level"]
          display_name?: string | null
          email?: string | null
          id: string
          is_approved?: boolean
          last_login_date?: string | null
          placement_completed?: boolean
          placement_completed_at?: string | null
          placement_score?: number | null
          placement_strengths?: string[]
          placement_weaknesses?: string[]
          profile_image?: string | null
          streak_days?: number
          total_points?: number
          updated_at?: string
        }
        Update: {
          cefr_level?: Database["public"]["Enums"]["cefr_level"] | null
          completed_lessons?: string[]
          created_at?: string
          current_level?: Database["public"]["Enums"]["user_level"]
          display_name?: string | null
          email?: string | null
          id?: string
          is_approved?: boolean
          last_login_date?: string | null
          placement_completed?: boolean
          placement_completed_at?: string | null
          placement_score?: number | null
          placement_strengths?: string[]
          placement_weaknesses?: string[]
          profile_image?: string | null
          streak_days?: number
          total_points?: number
          updated_at?: string
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          correct_index: number
          created_at: string
          explanation_ar: string | null
          id: string
          lesson_id: string
          options: Json
          order_index: number
          question_ar: string
          question_en: string
          quiz_id: string | null
        }
        Insert: {
          correct_index: number
          created_at?: string
          explanation_ar?: string | null
          id?: string
          lesson_id: string
          options: Json
          order_index?: number
          question_ar: string
          question_en?: string
          quiz_id?: string | null
        }
        Update: {
          correct_index?: number
          created_at?: string
          explanation_ar?: string | null
          id?: string
          lesson_id?: string
          options?: Json
          order_index?: number
          question_ar?: string
          question_en?: string
          quiz_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_scores: {
        Row: {
          completed_at: string
          id: string
          lesson_id: string
          score: number
          total: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          lesson_id: string
          score: number
          total: number
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          lesson_id?: string
          score?: number
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_scores_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          id: string
          lesson_id: string
          order_index: number
          pass_score_percent: number
          title_ar: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id: string
          order_index?: number
          pass_score_percent?: number
          title_ar: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string
          order_index?: number
          pass_score_percent?: number
          title_ar?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      recordings: {
        Row: {
          audio_path: string
          created_at: string
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          audio_path: string
          created_at?: string
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          audio_path?: string
          created_at?: string
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recordings_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      speaking_tasks: {
        Row: {
          created_at: string
          id: string
          lesson_id: string
          order_index: number
          phonetic: string | null
          prompt_ar: string
          target_text: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id: string
          order_index?: number
          phonetic?: string | null
          prompt_ar: string
          target_text: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string
          order_index?: number
          phonetic?: string | null
          prompt_ar?: string
          target_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "speaking_tasks_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      speech_attempts: {
        Row: {
          accuracy_percentage: number | null
          audio_path: string | null
          created_at: string
          id: string
          lesson_id: string | null
          recording_id: string | null
          target_text: string | null
          transcript: string
          user_id: string
        }
        Insert: {
          accuracy_percentage?: number | null
          audio_path?: string | null
          created_at?: string
          id?: string
          lesson_id?: string | null
          recording_id?: string | null
          target_text?: string | null
          transcript?: string
          user_id: string
        }
        Update: {
          accuracy_percentage?: number | null
          audio_path?: string | null
          created_at?: string
          id?: string
          lesson_id?: string | null
          recording_id?: string | null
          target_text?: string | null
          transcript?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "speech_attempts_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "speech_attempts_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_vocabulary: {
        Row: {
          saved_at: string
          user_id: string
          word_id: string
        }
        Insert: {
          saved_at?: string
          user_id: string
          word_id: string
        }
        Update: {
          saved_at?: string
          user_id?: string
          word_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_vocabulary_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "dictionary_words"
            referencedColumns: ["id"]
          },
        ]
      }
      vocabulary_items: {
        Row: {
          audio_url: string | null
          category: string | null
          cefr_level: Database["public"]["Enums"]["cefr_level"] | null
          created_at: string
          example_ar: string | null
          example_en: string | null
          id: string
          meaning_ar: string
          phonetic: string | null
          word_en: string
        }
        Insert: {
          audio_url?: string | null
          category?: string | null
          cefr_level?: Database["public"]["Enums"]["cefr_level"] | null
          created_at?: string
          example_ar?: string | null
          example_en?: string | null
          id?: string
          meaning_ar: string
          phonetic?: string | null
          word_en: string
        }
        Update: {
          audio_url?: string | null
          category?: string | null
          cefr_level?: Database["public"]["Enums"]["cefr_level"] | null
          created_at?: string
          example_ar?: string | null
          example_en?: string | null
          id?: string
          meaning_ar?: string
          phonetic?: string | null
          word_en?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_quiz_answer: {
        Args: { _question_id: string; _selected: number }
        Returns: {
          correct: boolean
          explanation_ar: string
        }[]
      }
      get_lesson_quiz: {
        Args: { _lesson_id: string }
        Returns: {
          id: string
          options: Json
          order_index: number
          question_ar: string
          question_en: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      save_placement_result: {
        Args: {
          _cefr: Database["public"]["Enums"]["cefr_level"]
          _score: number
          _strengths: string[]
          _weaknesses: string[]
        }
        Returns: undefined
      }
      submit_quiz_attempt: {
        Args: { _answers: Json; _lesson_id: string }
        Returns: {
          points: number
          score: number
          total: number
        }[]
      }
    }
    Enums: {
      app_role: "student" | "admin"
      cefr_level: "A0" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
      user_level: "beginner" | "intermediate" | "advanced"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["student", "admin"],
      cefr_level: ["A0", "A1", "A2", "B1", "B2", "C1", "C2"],
      user_level: ["beginner", "intermediate", "advanced"],
    },
  },
} as const
