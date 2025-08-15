export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      contacts: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          department: string | null
          email: string | null
          first_name: string
          id: string
          is_primary_contact: boolean | null
          last_name: string
          linkedin_url: string | null
          mobile_phone: string | null
          notes: string | null
          organization_id: string
          phone: string | null
          role: Database["public"]["Enums"]["contact_role"] | null
          title: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          department?: string | null
          email?: string | null
          first_name: string
          id?: string
          is_primary_contact?: boolean | null
          last_name: string
          linkedin_url?: string | null
          mobile_phone?: string | null
          notes?: string | null
          organization_id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["contact_role"] | null
          title?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          department?: string | null
          email?: string | null
          first_name?: string
          id?: string
          is_primary_contact?: boolean | null
          last_name?: string
          linkedin_url?: string | null
          mobile_phone?: string | null
          notes?: string | null
          organization_id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["contact_role"] | null
          title?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      interactions: {
        Row: {
          attachments: string[] | null
          contact_id: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          description: string | null
          duration_minutes: number | null
          follow_up_date: string | null
          follow_up_notes: string | null
          follow_up_required: boolean | null
          id: string
          interaction_date: string
          opportunity_id: string | null
          organization_id: string | null
          outcome: string | null
          subject: string
          type: Database["public"]["Enums"]["interaction_type"]
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          attachments?: string[] | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          follow_up_date?: string | null
          follow_up_notes?: string | null
          follow_up_required?: boolean | null
          id?: string
          interaction_date?: string
          opportunity_id?: string | null
          organization_id?: string | null
          outcome?: string | null
          subject: string
          type: Database["public"]["Enums"]["interaction_type"]
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          attachments?: string[] | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          follow_up_date?: string | null
          follow_up_notes?: string | null
          follow_up_required?: boolean | null
          id?: string
          interaction_date?: string
          opportunity_id?: string | null
          organization_id?: string | null
          outcome?: string | null
          subject?: string
          type?: Database["public"]["Enums"]["interaction_type"]
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          actual_close_date: string | null
          competition: string | null
          contact_id: string | null
          created_at: string | null
          created_by: string | null
          decision_criteria: string | null
          deleted_at: string | null
          description: string | null
          distributor_organization_id: string | null
          estimated_close_date: string | null
          estimated_value: number | null
          id: string
          name: string
          next_action: string | null
          next_action_date: string | null
          notes: string | null
          organization_id: string
          principal_organization_id: string | null
          priority: Database["public"]["Enums"]["priority_level"] | null
          probability: number | null
          stage: Database["public"]["Enums"]["opportunity_stage"]
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          actual_close_date?: string | null
          competition?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          decision_criteria?: string | null
          deleted_at?: string | null
          description?: string | null
          distributor_organization_id?: string | null
          estimated_close_date?: string | null
          estimated_value?: number | null
          id?: string
          name: string
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          organization_id: string
          principal_organization_id?: string | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          probability?: number | null
          stage?: Database["public"]["Enums"]["opportunity_stage"]
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          actual_close_date?: string | null
          competition?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          decision_criteria?: string | null
          deleted_at?: string | null
          description?: string | null
          distributor_organization_id?: string | null
          estimated_close_date?: string | null
          estimated_value?: number | null
          id?: string
          name?: string
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          organization_id?: string
          principal_organization_id?: string | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          probability?: number | null
          stage?: Database["public"]["Enums"]["opportunity_stage"]
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_distributor_organization_id_fkey"
            columns: ["distributor_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_principal_organization_id_fkey"
            columns: ["principal_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_products: {
        Row: {
          created_at: string | null
          extended_price: number | null
          id: string
          notes: string | null
          opportunity_id: string
          product_id: string
          quantity: number
          unit_price: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          extended_price?: number | null
          id?: string
          notes?: string | null
          opportunity_id: string
          product_id: string
          quantity?: number
          unit_price?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          extended_price?: number | null
          id?: string
          notes?: string | null
          opportunity_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_products_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address_line_1: string | null
          address_line_2: string | null
          annual_revenue: number | null
          city: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          description: string | null
          email: string | null
          employee_count: number | null
          id: string
          industry: string | null
          is_active: boolean | null
          name: string
          notes: string | null
          parent_organization_id: string | null
          phone: string | null
          postal_code: string | null
          size: Database["public"]["Enums"]["organization_size"] | null
          state_province: string | null
          type: Database["public"]["Enums"]["organization_type"]
          updated_at: string | null
          updated_by: string | null
          website: string | null
        }
        Insert: {
          address_line_1?: string | null
          address_line_2?: string | null
          annual_revenue?: number | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          email?: string | null
          employee_count?: number | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          name: string
          notes?: string | null
          parent_organization_id?: string | null
          phone?: string | null
          postal_code?: string | null
          size?: Database["public"]["Enums"]["organization_size"] | null
          state_province?: string | null
          type: Database["public"]["Enums"]["organization_type"]
          updated_at?: string | null
          updated_by?: string | null
          website?: string | null
        }
        Update: {
          address_line_1?: string | null
          address_line_2?: string | null
          annual_revenue?: number | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          email?: string | null
          employee_count?: number | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          name?: string
          notes?: string | null
          parent_organization_id?: string | null
          phone?: string | null
          postal_code?: string | null
          size?: Database["public"]["Enums"]["organization_size"] | null
          state_province?: string | null
          type?: Database["public"]["Enums"]["organization_type"]
          updated_at?: string | null
          updated_by?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_parent_organization_id_fkey"
            columns: ["parent_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      principal_distributor_relationships: {
        Row: {
          commission_rate: number | null
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string | null
          distributor_id: string
          id: string
          is_active: boolean | null
          principal_id: string
          terms: string | null
          territory: string | null
          updated_at: string | null
        }
        Insert: {
          commission_rate?: number | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          distributor_id: string
          id?: string
          is_active?: boolean | null
          principal_id: string
          terms?: string | null
          territory?: string | null
          updated_at?: string | null
        }
        Update: {
          commission_rate?: number | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          distributor_id?: string
          id?: string
          is_active?: boolean | null
          principal_id?: string
          terms?: string | null
          territory?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "principal_distributor_relationships_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "principal_distributor_relationships_principal_id_fkey"
            columns: ["principal_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: Database["public"]["Enums"]["product_category"]
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          list_price: number | null
          min_order_quantity: number | null
          name: string
          principal_id: string
          season_end: number | null
          season_start: number | null
          shelf_life_days: number | null
          sku: string | null
          specifications: string | null
          storage_requirements: string | null
          unit_cost: number | null
          unit_of_measure: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["product_category"]
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          list_price?: number | null
          min_order_quantity?: number | null
          name: string
          principal_id: string
          season_end?: number | null
          season_start?: number | null
          shelf_life_days?: number | null
          sku?: string | null
          specifications?: string | null
          storage_requirements?: string | null
          unit_cost?: number | null
          unit_of_measure?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["product_category"]
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          list_price?: number | null
          min_order_quantity?: number | null
          name?: string
          principal_id?: string
          season_end?: number | null
          season_start?: number | null
          shelf_life_days?: number | null
          sku?: string | null
          specifications?: string | null
          storage_requirements?: string | null
          unit_cost?: number | null
          unit_of_measure?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_principal_id_fkey"
            columns: ["principal_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      user_has_org_access: {
        Args: { org_id: string }
        Returns: boolean
      }
      user_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      contact_role:
        | "decision_maker"
        | "influencer"
        | "buyer"
        | "end_user"
        | "gatekeeper"
        | "champion"
      interaction_type:
        | "call"
        | "email"
        | "meeting"
        | "demo"
        | "proposal"
        | "follow_up"
        | "trade_show"
        | "site_visit"
        | "contract_review"
      opportunity_priority: "low" | "medium" | "high" | "critical"
      opportunity_stage:
        | "lead"
        | "qualified"
        | "proposal"
        | "negotiation"
        | "closed_won"
        | "closed_lost"
      organization_size: "small" | "medium" | "large" | "enterprise"
      organization_type:
        | "customer"
        | "principal"
        | "distributor"
        | "prospect"
        | "vendor"
      priority_level: "low" | "medium" | "high" | "critical"
      product_category:
        | "beverages"
        | "dairy"
        | "frozen"
        | "fresh_produce"
        | "meat_poultry"
        | "seafood"
        | "dry_goods"
        | "spices_seasonings"
        | "baking_supplies"
        | "cleaning_supplies"
        | "paper_products"
        | "equipment"
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
      contact_role: [
        "decision_maker",
        "influencer",
        "buyer",
        "end_user",
        "gatekeeper",
        "champion",
      ],
      interaction_type: [
        "call",
        "email",
        "meeting",
        "demo",
        "proposal",
        "follow_up",
        "trade_show",
        "site_visit",
        "contract_review",
      ],
      opportunity_priority: ["low", "medium", "high", "critical"],
      opportunity_stage: [
        "lead",
        "qualified",
        "proposal",
        "negotiation",
        "closed_won",
        "closed_lost",
      ],
      organization_size: ["small", "medium", "large", "enterprise"],
      organization_type: [
        "customer",
        "principal",
        "distributor",
        "prospect",
        "vendor",
      ],
      priority_level: ["low", "medium", "high", "critical"],
      product_category: [
        "beverages",
        "dairy",
        "frozen",
        "fresh_produce",
        "meat_poultry",
        "seafood",
        "dry_goods",
        "spices_seasonings",
        "baking_supplies",
        "cleaning_supplies",
        "paper_products",
        "equipment",
      ],
    },
  },
} as const