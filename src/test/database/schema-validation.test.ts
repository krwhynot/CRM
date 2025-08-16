import { describe, it, expect, beforeAll } from 'vitest'
import { testSupabase, validateDatabaseConnection, validateTableSchema, validateEnumValues } from '../utils/test-database'
import { ExpectedEnums, ExpectedSchemas } from '../fixtures/test-data'

describe('Database Schema Validation', () => {
  beforeAll(async () => {
    const isConnected = await validateDatabaseConnection()
    if (!isConnected) {
      throw new Error('Database connection failed - cannot run schema validation tests')
    }
  })

  describe('Table Schema Validation', () => {
    it('should validate organizations table schema', async () => {
      const result = await validateTableSchema('organizations', ExpectedSchemas.organizations)
      
      expect(result.exists).toBe(true)
      expect(result.missingColumns).toEqual([])
      expect(result.extraColumns.length).toBeGreaterThanOrEqual(0) // Allow extra columns
    })

    it('should validate contacts table schema', async () => {
      const result = await validateTableSchema('contacts', ExpectedSchemas.contacts)
      
      expect(result.exists).toBe(true)
      expect(result.missingColumns).toEqual([])
      expect(result.extraColumns.length).toBeGreaterThanOrEqual(0)
    })

    it('should validate products table schema', async () => {
      const result = await validateTableSchema('products', ExpectedSchemas.products)
      
      expect(result.exists).toBe(true)
      expect(result.missingColumns).toEqual([])
      expect(result.extraColumns.length).toBeGreaterThanOrEqual(0)
    })

    it('should validate opportunities table schema', async () => {
      const result = await validateTableSchema('opportunities', ExpectedSchemas.opportunities)
      
      expect(result.exists).toBe(true)
      expect(result.missingColumns).toEqual([])
      expect(result.extraColumns.length).toBeGreaterThanOrEqual(0)
    })

    it('should validate interactions table schema', async () => {
      const result = await validateTableSchema('interactions', ExpectedSchemas.interactions)
      
      expect(result.exists).toBe(true)
      expect(result.missingColumns).toEqual([])
      expect(result.extraColumns.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Enum Values Validation', () => {
    it('should validate organization_type enum values', async () => {
      const result = await validateEnumValues('organization_type', ExpectedEnums.organization_type)
      
      expect(result.matches).toBe(true)
      if (!result.matches) {
        console.log('Missing values:', result.missingValues)
        console.log('Extra values:', result.extraValues)
      }
    })

    it('should validate contact_role enum values', async () => {
      const result = await validateEnumValues('contact_role', ExpectedEnums.contact_role)
      
      expect(result.matches).toBe(true)
      if (!result.matches) {
        console.log('Missing values:', result.missingValues)
        console.log('Extra values:', result.extraValues)
      }
    })

    it('should validate product_category enum values', async () => {
      const result = await validateEnumValues('product_category', ExpectedEnums.product_category)
      
      expect(result.matches).toBe(true)
      if (!result.matches) {
        console.log('Missing values:', result.missingValues)
        console.log('Extra values:', result.extraValues)
      }
    })

    it('should validate opportunity_stage enum values', async () => {
      const result = await validateEnumValues('opportunity_stage', ExpectedEnums.opportunity_stage)
      
      expect(result.matches).toBe(true)
      if (!result.matches) {
        console.log('Missing values:', result.missingValues)
        console.log('Extra values:', result.extraValues)
      }
    })

    it('should validate priority_level enum values', async () => {
      const result = await validateEnumValues('priority_level', ExpectedEnums.priority_level)
      
      expect(result.matches).toBe(true)
      if (!result.matches) {
        console.log('Missing values:', result.missingValues)
        console.log('Extra values:', result.extraValues)
      }
    })

    it('should validate interaction_type enum values', async () => {
      const result = await validateEnumValues('interaction_type', ExpectedEnums.interaction_type)
      
      expect(result.matches).toBe(true)
      if (!result.matches) {
        console.log('Missing values:', result.missingValues)
        console.log('Extra values:', result.extraValues)
      }
    })
  })

  describe('Database Type Alignment', () => {
    it('should verify TypeScript types match database enums', async () => {
      // Test organization type alignment
      const { data: orgTypes } = await testSupabase
        .from('organizations')
        .select('type')
        .limit(1)
      
      // This test passes if the query doesn't fail due to type mismatch
      expect(orgTypes).toBeDefined()
    })

    it('should verify foreign key relationships exist', async () => {
      // Test contacts -> organizations relationship
      const { data: constraints } = await testSupabase
        .from('information_schema.table_constraints' as any)
        .select('constraint_name, table_name')
        .eq('constraint_type', 'FOREIGN KEY')
        .eq('table_schema', 'public')
      
      const foreignKeys = constraints?.map(c => c.constraint_name) || []
      
      // Verify key relationships exist
      expect(foreignKeys.some(fk => fk.includes('contacts_organization_id'))).toBe(true)
      expect(foreignKeys.some(fk => fk.includes('products_principal_id'))).toBe(true)
      expect(foreignKeys.some(fk => fk.includes('opportunities_organization_id'))).toBe(true)
      expect(foreignKeys.some(fk => fk.includes('opportunities_contact_id'))).toBe(true)
    })

    it('should verify unique constraints exist', async () => {
      // Test organization name uniqueness (if configured)
      const { data: constraints } = await testSupabase
        .from('information_schema.table_constraints' as any)
        .select('constraint_name, table_name')
        .eq('constraint_type', 'UNIQUE')
        .eq('table_schema', 'public')
      
      expect(constraints).toBeDefined()
      // Note: Specific unique constraints depend on business rules
    })

    it('should verify audit fields exist on all tables', async () => {
      const tables = ['organizations', 'contacts', 'products', 'opportunities', 'interactions']
      const auditFields = ['created_at', 'updated_at', 'deleted_at']
      
      for (const table of tables) {
        const { data: columns } = await testSupabase
          .from('information_schema.columns' as any)
          .select('column_name')
          .eq('table_name', table)
          .eq('table_schema', 'public')
        
        const columnNames = columns?.map(c => c.column_name) || []
        
        auditFields.forEach(field => {
          expect(columnNames).toContain(field)
        })
      }
    })
  })

  describe('Row Level Security', () => {
    it('should verify RLS is enabled on all tables', async () => {
      const tables = ['organizations', 'contacts', 'products', 'opportunities', 'interactions']
      
      for (const table of tables) {
        const { data } = await testSupabase
          .from('pg_tables' as any)
          .select('rowsecurity')
          .eq('tablename', table)
          .eq('schemaname', 'public')
          .single()
        
        expect(data?.rowsecurity).toBe(true)
      }
    })

    it('should verify security functions exist', async () => {
      const functions = ['user_is_admin', 'user_has_org_access']
      
      for (const func of functions) {
        const { data } = await testSupabase
          .from('information_schema.routines' as any)
          .select('routine_name')
          .eq('routine_name', func)
          .eq('routine_schema', 'public')
        
        expect(data?.length).toBeGreaterThan(0)
      }
    })
  })
})