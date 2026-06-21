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
      lessons: {
        Row: {
          audio_url: string | null
          body_md: string
          created_at: string
          day_number: number
          description_ar: string
          id: string
          image_url: string | null
          is_published: boolean
          title_ar: string
          title_en: string
          updated_at: string
        }
        Insert: {
          audio_url?: string | null
          body_md?: string
          created_at?: string
          day_number: number
          description_ar?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          title_ar: string
          title_en?: string
          updated_at?: string
        }
        Update: {
          audio_url?: string | null
          body_md?: string
          created_at?: string
          day_number?: number
          description_ar?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          title_ar?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: []
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
          id: string
          lesson_id: string
          options: Json
          order_index: number
          question_ar: string
          question_en: string
        }
        Insert: {
          correct_index: number
          created_at?: string
          id?: string
          lesson_id: string
          options: Json
          order_index?: number
          question_ar: string
          question_en?: string
        }
        Update: {
          correct_index?: number
          created_at?: string
          id?: string
          lesson_id?: string
          options?: Json
          order_index?: number
          question_ar?: string
          question_en?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "admin"
      cefr_level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2"
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
      cefr_level: ["A1", "A2", "B1", "B2", "C1", "C2"],
      user_level: ["beginner", "intermediate", "advanced"],
    },
  },
} as const
