export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      closed_cashier: {
        Row: {
          closed_at: string
          created_at: string
          created_by: string
          id: string
          last_transaction_at: string | null
          name: string | null
        }
        Insert: {
          closed_at: string
          created_at: string
          created_by: string
          id?: string
          last_transaction_at?: string | null
          name?: string | null
        }
        Update: {
          closed_at?: string
          created_at?: string
          created_by?: string
          id?: string
          last_transaction_at?: string | null
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "closed_cashier_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      closed_cashier_transactions: {
        Row: {
          chips: number
          closed_register_id: string
          created_at: string
          id: string
          method: string
          payment: number
          player_id: string
          type: string
        }
        Insert: {
          chips: number
          closed_register_id: string
          created_at?: string
          id?: string
          method: string
          payment: number
          player_id: string
          type: string
        }
        Update: {
          chips?: number
          closed_register_id?: string
          created_at?: string
          id?: string
          method?: string
          payment?: number
          player_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "closed_cashier_transactions_closed_cashier_id_fkey"
            columns: ["closed_register_id"]
            isOneToOne: false
            referencedRelation: "closed_cashier"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "closed_transactions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      open_cashier: {
        Row: {
          created_at: string
          created_by: string
          id: string
          last_transaction_at: string | null
          name: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          last_transaction_at?: string | null
          name?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          last_transaction_at?: string | null
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "open_cashier_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          created_at: string
          game_id: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          game_id?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          game_id?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_open_cashier_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "open_cashier"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string
          id: string
          name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          chips: number
          created_at: string
          id: string
          method: string
          payment: number
          player_id: string
          type: string
        }
        Insert: {
          chips: number
          created_at?: string
          id?: string
          method: string
          payment: number
          player_id: string
          type: string
        }
        Update: {
          chips?: number
          created_at?: string
          id?: string
          method?: string
          payment?: number
          player_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_transaction: {
        Args: {
          p_player_id: string
          p_game_id: string
          p_type: string
          p_chips: number
          p_payment: number
          p_method: string
          p_created_at: string
        }
        Returns: Json
      }
      close_game: {
        Args: {
          game_id: string
          closed_at: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
