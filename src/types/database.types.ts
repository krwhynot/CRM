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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      contact_preferred_principals: {
        Row: {
          advocacy_notes: string | null
          advocacy_strength: number | null
          contact_id: string
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          id: string
          principal_organization_id: string
          relationship_type: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          advocacy_notes?: string | null
          advocacy_strength?: number | null
          contact_id: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          principal_organization_id: string
          relationship_type?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          advocacy_notes?: string | null
          advocacy_strength?: number | null
          contact_id?: string
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          principal_organization_id?: string
          relationship_type?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_preferred_principals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contact_influence_profile"
            referencedColumns: ["contact_id"]
          },
          {
            foreignKeyName: "contact_preferred_principals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_preferred_principals_principal_id_fkey"
            columns: ["principal_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_preferred_principals_principal_id_fkey"
            columns: ["principal_organization_id"]
            isOneToOne: false
            referencedRelation: "principal_advocacy_dashboard"
            referencedColumns: ["principal_id"]
          },
          {
            foreignKeyName: "contact_preferred_principals_principal_id_fkey"
            columns: ["principal_organization_id"]
            isOneToOne: false
            referencedRelation: "v_org_roles"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string | null
          created_by: string
          decision_authority: string
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
          purchase_influence: string
          role: Database["public"]["Enums"]["contact_role"] | null
          search_tsv: unknown | null
          title: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          decision_authority?: string
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
          purchase_influence?: string
          role?: Database["public"]["Enums"]["contact_role"] | null
          search_tsv?: unknown | null
          title?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          decision_authority?: string
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
          purchase_influence?: string
          role?: Database["public"]["Enums"]["contact_role"] | null
          search_tsv?: unknown | null
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
          {
            foreignKeyName: "contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "principal_advocacy_dashboard"
            referencedColumns: ["principal_id"]
          },
          {
            foreignKeyName: "contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_org_roles"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      interactions: {
        Row: {
          attachments: string[] | null
          contact_id: string | null
          created_at: string | null
          created_by: string
          deleted_at: string | null
          description: string | null
          duration_minutes: number | null
          follow_up_date: string | null
          follow_up_notes: string | null
          follow_up_required: boolean | null
          id: string
          interaction_date: string
          opportunity_id: string
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
          created_by: string
          deleted_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          follow_up_date?: string | null
          follow_up_notes?: string | null
          follow_up_required?: boolean | null
          id?: string
          interaction_date?: string
          opportunity_id: string
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
          created_by?: string
          deleted_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          follow_up_date?: string | null
          follow_up_notes?: string | null
          follow_up_required?: boolean | null
          id?: string
          interaction_date?: string
          opportunity_id?: string
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
            referencedRelation: "contact_influence_profile"
            referencedColumns: ["contact_id"]
          },
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
            foreignKeyName: "interactions_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities_legacy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "principal_advocacy_dashboard"
            referencedColumns: ["principal_id"]
          },
          {
            foreignKeyName: "interactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_org_roles"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      opportunities: {
        Row: {
          actual_close_date: string | null
          auto_generated_name: boolean | null
          competition: string | null
          contact_id: string | null
          created_at: string | null
          created_by: string
          decision_criteria: string | null
          deleted_at: string | null
          description: string | null
          distributor_organization_id: string | null
          estimated_close_date: string | null
          estimated_value: number | null
          founding_interaction_id: string | null
          id: string
          last_sync_date: string | null
          name: string
          next_action: string | null
          next_action_date: string | null
          notes: string | null
          opportunity_context: string | null
          organization_id: string
          principal_organization_id: string | null
          priority: Database["public"]["Enums"]["priority_level"] | null
          probability: number | null
          search_tsv: unknown | null
          stage: Database["public"]["Enums"]["opportunity_stage"]
          stage_manual: boolean
          status: Database["public"]["Enums"]["opportunity_status"]
          status_manual: boolean
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          actual_close_date?: string | null
          auto_generated_name?: boolean | null
          competition?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by: string
          decision_criteria?: string | null
          deleted_at?: string | null
          description?: string | null
          distributor_organization_id?: string | null
          estimated_close_date?: string | null
          estimated_value?: number | null
          founding_interaction_id?: string | null
          id?: string
          last_sync_date?: string | null
          name: string
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          opportunity_context?: string | null
          organization_id: string
          principal_organization_id?: string | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          probability?: number | null
          search_tsv?: unknown | null
          stage?: Database["public"]["Enums"]["opportunity_stage"]
          stage_manual?: boolean
          status?: Database["public"]["Enums"]["opportunity_status"]
          status_manual?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          actual_close_date?: string | null
          auto_generated_name?: boolean | null
          competition?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string
          decision_criteria?: string | null
          deleted_at?: string | null
          description?: string | null
          distributor_organization_id?: string | null
          estimated_close_date?: string | null
          estimated_value?: number | null
          founding_interaction_id?: string | null
          id?: string
          last_sync_date?: string | null
          name?: string
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          opportunity_context?: string | null
          organization_id?: string
          principal_organization_id?: string | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          probability?: number | null
          search_tsv?: unknown | null
          stage?: Database["public"]["Enums"]["opportunity_stage"]
          stage_manual?: boolean
          status?: Database["public"]["Enums"]["opportunity_status"]
          status_manual?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contact_influence_profile"
            referencedColumns: ["contact_id"]
          },
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
            foreignKeyName: "opportunities_distributor_organization_id_fkey"
            columns: ["distributor_organization_id"]
            isOneToOne: false
            referencedRelation: "principal_advocacy_dashboard"
            referencedColumns: ["principal_id"]
          },
          {
            foreignKeyName: "opportunities_distributor_organization_id_fkey"
            columns: ["distributor_organization_id"]
            isOneToOne: false
            referencedRelation: "v_org_roles"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "opportunities_founding_interaction_id_fkey"
            columns: ["founding_interaction_id"]
            isOneToOne: false
            referencedRelation: "interactions"
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
            foreignKeyName: "opportunities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "principal_advocacy_dashboard"
            referencedColumns: ["principal_id"]
          },
          {
            foreignKeyName: "opportunities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_org_roles"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "opportunities_principal_organization_id_fkey"
            columns: ["principal_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_principal_organization_id_fkey"
            columns: ["principal_organization_id"]
            isOneToOne: false
            referencedRelation: "principal_advocacy_dashboard"
            referencedColumns: ["principal_id"]
          },
          {
            foreignKeyName: "opportunities_principal_organization_id_fkey"
            columns: ["principal_organization_id"]
            isOneToOne: false
            referencedRelation: "v_org_roles"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      opportunity_participants: {
        Row: {
          commission_rate: number | null
          created_at: string | null
          created_by: string | null
          id: string
          is_primary: boolean | null
          notes: string | null
          opportunity_id: string
          organization_id: string
          role: string
          territory: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          opportunity_id: string
          organization_id: string
          role: string
          territory?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          commission_rate?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          opportunity_id?: string
          organization_id?: string
          role?: string
          territory?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_participants_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_participants_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities_legacy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_participants_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_participants_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "principal_advocacy_dashboard"
            referencedColumns: ["principal_id"]
          },
          {
            foreignKeyName: "opportunity_participants_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_org_roles"
            referencedColumns: ["organization_id"]
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
            foreignKeyName: "opportunity_products_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities_legacy"
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
      organization_roles: {
        Row: {
          created_at: string
          organization_id: string
          role: string
        }
        Insert: {
          created_at?: string
          organization_id: string
          role: string
        }
        Update: {
          created_at?: string
          organization_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "principal_advocacy_dashboard"
            referencedColumns: ["principal_id"]
          },
          {
            foreignKeyName: "organization_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "v_org_roles"
            referencedColumns: ["organization_id"]
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
          created_by: string
          deleted_at: string | null
          description: string | null
          email: string | null
          employee_count: number | null
          id: string
          import_notes: string | null
          industry: string | null
          is_active: boolean | null
          is_distributor: boolean | null
          is_principal: boolean | null
          name: string
          notes: string | null
          parent_organization_id: string | null
          phone: string | null
          postal_code: string | null
          primary_manager_name: string | null
          priority: string
          search_tsv: unknown | null
          secondary_manager_name: string | null
          segment: string
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
          created_by: string
          deleted_at?: string | null
          description?: string | null
          email?: string | null
          employee_count?: number | null
          id?: string
          import_notes?: string | null
          industry?: string | null
          is_active?: boolean | null
          is_distributor?: boolean | null
          is_principal?: boolean | null
          name: string
          notes?: string | null
          parent_organization_id?: string | null
          phone?: string | null
          postal_code?: string | null
          primary_manager_name?: string | null
          priority?: string
          search_tsv?: unknown | null
          secondary_manager_name?: string | null
          segment?: string
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
          created_by?: string
          deleted_at?: string | null
          description?: string | null
          email?: string | null
          employee_count?: number | null
          id?: string
          import_notes?: string | null
          industry?: string | null
          is_active?: boolean | null
          is_distributor?: boolean | null
          is_principal?: boolean | null
          name?: string
          notes?: string | null
          parent_organization_id?: string | null
          phone?: string | null
          postal_code?: string | null
          primary_manager_name?: string | null
          priority?: string
          search_tsv?: unknown | null
          secondary_manager_name?: string | null
          segment?: string
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
          {
            foreignKeyName: "organizations_parent_organization_id_fkey"
            columns: ["parent_organization_id"]
            isOneToOne: false
            referencedRelation: "principal_advocacy_dashboard"
            referencedColumns: ["principal_id"]
          },
          {
            foreignKeyName: "organizations_parent_organization_id_fkey"
            columns: ["parent_organization_id"]
            isOneToOne: false
            referencedRelation: "v_org_roles"
            referencedColumns: ["organization_id"]
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
            foreignKeyName: "principal_distributor_relationships_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "principal_advocacy_dashboard"
            referencedColumns: ["principal_id"]
          },
          {
            foreignKeyName: "principal_distributor_relationships_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "v_org_roles"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "principal_distributor_relationships_principal_id_fkey"
            columns: ["principal_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "principal_distributor_relationships_principal_id_fkey"
            columns: ["principal_id"]
            isOneToOne: false
            referencedRelation: "principal_advocacy_dashboard"
            referencedColumns: ["principal_id"]
          },
          {
            foreignKeyName: "principal_distributor_relationships_principal_id_fkey"
            columns: ["principal_id"]
            isOneToOne: false
            referencedRelation: "v_org_roles"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      products: {
        Row: {
          category: Database["public"]["Enums"]["product_category"]
          created_at: string | null
          created_by: string
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
          created_by: string
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
          created_by?: string
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
          {
            foreignKeyName: "products_principal_id_fkey"
            columns: ["principal_id"]
            isOneToOne: false
            referencedRelation: "principal_advocacy_dashboard"
            referencedColumns: ["principal_id"]
          },
          {
            foreignKeyName: "products_principal_id_fkey"
            columns: ["principal_id"]
            isOneToOne: false
            referencedRelation: "v_org_roles"
            referencedColumns: ["organization_id"]
          },
        ]
      }
    }
    Views: {
      contact_influence_profile: {
        Row: {
          avg_advocacy_strength: number | null
          contact_id: string | null
          decision_authority: string | null
          first_name: string | null
          last_name: string | null
          organization_name: string | null
          organization_type:
            | Database["public"]["Enums"]["organization_type"]
            | null
          overall_influence_score: number | null
          preferred_principals_count: number | null
          purchase_influence: string | null
          role: Database["public"]["Enums"]["contact_role"] | null
          strong_advocacy_count: number | null
          title: string | null
        }
        Relationships: []
      }
      principal_advocacy_dashboard: {
        Row: {
          advanced_opportunities: number | null
          advocate_organizations: number | null
          avg_advocacy_strength: number | null
          avg_decision_authority: number | null
          avg_purchase_influence: number | null
          principal_id: string | null
          principal_name: string | null
          principal_priority: string | null
          principal_segment: string | null
          strong_advocates: number | null
          total_advocates: number | null
          total_opportunities: number | null
          total_pipeline_value: number | null
        }
        Relationships: []
      }
      v_org_roles: {
        Row: {
          created_at: string | null
          derived_role: string | null
          has_opportunities: boolean | null
          has_products: boolean | null
          in_distribution_network: boolean | null
          is_distributor: boolean | null
          is_principal: boolean | null
          name: string | null
          organization_id: string | null
          type: Database["public"]["Enums"]["organization_type"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          derived_role?: never
          has_opportunities?: never
          has_products?: never
          in_distribution_network?: never
          is_distributor?: boolean | null
          is_principal?: boolean | null
          name?: string | null
          organization_id?: string | null
          type?: Database["public"]["Enums"]["organization_type"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          derived_role?: never
          has_opportunities?: never
          has_products?: never
          in_distribution_network?: never
          is_distributor?: boolean | null
          is_principal?: boolean | null
          name?: string | null
          organization_id?: string | null
          type?: Database["public"]["Enums"]["organization_type"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      user_has_org_access: {
        Args: { org_id: string } | { org_id: string; user_id: string }
        Returns: boolean
      }
      user_is_admin: {
        Args: Record<PropertyKey, never> | { user_id: string }
        Returns: boolean
      }
      validate_founding_interaction_timing: {
        Args: {
          p_founding_interaction_id: string
          p_opportunity_created_at: string
        }
        Returns: boolean
      }
      validate_principal_type: {
        Args: { org_type: Database["public"]["Enums"]["organization_type"] }
        Returns: boolean
      }
      validate_priority_value_alignment: {
        Args: {
          estimated_value: number
          priority: Database["public"]["Enums"]["priority_level"]
        }
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
        | "New Lead"
        | "Initial Outreach"
        | "Sample/Visit Offered"
        | "Awaiting Response"
        | "Feedback Logged"
        | "Demo Scheduled"
        | "Closed - Won"
        | "Closed - Lost"
        | "lead"
        | "qualified"
        | "proposal"
        | "negotiation"
        | "closed_won"
        | "closed_lost"
      opportunity_status:
        | "Active"
        | "On Hold"
        | "Closed - Won"
        | "Closed - Lost"
        | "Nurturing"
        | "Qualified"
        | "active"
        | "on_hold"
        | "nurturing"
        | "qualified"
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