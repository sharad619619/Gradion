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
      career_paths: {
        Row: {
          analysis_id: string | null
          created_at: string
          id: string
          readiness_score: number
          roadmap_json: Json
          target_role: string
        }
        Insert: {
          analysis_id?: string | null
          created_at?: string
          id?: string
          readiness_score?: number
          roadmap_json?: Json
          target_role: string
        }
        Update: {
          analysis_id?: string | null
          created_at?: string
          id?: string
          readiness_score?: number
          roadmap_json?: Json
          target_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_paths_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "resume_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      pathways: {
        Row: {
          ai_output: Json | null
          created_at: string
          current_skills: string
          education: string
          id: string
          interests: string
          language: string
          location: string
          name: string
          readiness_score: number
          target_career: string
        }
        Insert: {
          ai_output?: Json | null
          created_at?: string
          current_skills: string
          education: string
          id?: string
          interests: string
          language?: string
          location: string
          name: string
          readiness_score?: number
          target_career: string
        }
        Update: {
          ai_output?: Json | null
          created_at?: string
          current_skills?: string
          education?: string
          id?: string
          interests?: string
          language?: string
          location?: string
          name?: string
          readiness_score?: number
          target_career?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          analysis_id: string | null
          category: string
          created_at: string
          id: string
          recommendation_json: Json
        }
        Insert: {
          analysis_id?: string | null
          category: string
          created_at?: string
          id?: string
          recommendation_json?: Json
        }
        Update: {
          analysis_id?: string | null
          category?: string
          created_at?: string
          id?: string
          recommendation_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "resume_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_analyses: {
        Row: {
          analysis_json: Json
          created_at: string
          id: string
          job_description: string
          match_score: number
          matched_skills: Json
          missing_skills: Json
          name: string | null
          partial_skills: Json
          resume_text: string
          target_role: string
        }
        Insert: {
          analysis_json?: Json
          created_at?: string
          id?: string
          job_description: string
          match_score: number
          matched_skills?: Json
          missing_skills?: Json
          name?: string | null
          partial_skills?: Json
          resume_text: string
          target_role: string
        }
        Update: {
          analysis_json?: Json
          created_at?: string
          id?: string
          job_description?: string
          match_score?: number
          matched_skills?: Json
          missing_skills?: Json
          name?: string | null
          partial_skills?: Json
          resume_text?: string
          target_role?: string
        }
        Relationships: []
      }
      roadmap_tasks: {
        Row: {
          career_path_id: string | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          phase: string
          status: string
          title: string
        }
        Insert: {
          career_path_id?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          phase?: string
          status?: string
          title: string
        }
        Update: {
          career_path_id?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          phase?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_tasks_career_path_id_fkey"
            columns: ["career_path_id"]
            isOneToOne: false
            referencedRelation: "career_paths"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
