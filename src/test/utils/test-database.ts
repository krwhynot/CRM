import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

// Test database client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321'
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'test-key'

export const testSupabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

/**
 * Clean up test data by soft deleting all records created during tests
 */
export async function cleanupTestData() {
  const now = new Date().toISOString()
  
  try {
    // Soft delete in reverse dependency order
    await testSupabase.from('interactions').update({ deleted_at: now }).neq('created_at', '1970-01-01T00:00:00.000Z')
    await testSupabase.from('opportunity_products').delete().neq('created_at', '1970-01-01T00:00:00.000Z')
    await testSupabase.from('opportunities').update({ deleted_at: now }).neq('created_at', '1970-01-01T00:00:00.000Z')
    await testSupabase.from('products').update({ deleted_at: now }).neq('created_at', '1970-01-01T00:00:00.000Z')
    await testSupabase.from('contacts').update({ deleted_at: now }).neq('created_at', '1970-01-01T00:00:00.000Z')
    await testSupabase.from('organizations').update({ deleted_at: now }).neq('created_at', '1970-01-01T00:00:00.000Z')
  } catch (error) {
    console.warn('Error during test cleanup:', error)
  }
}

/**
 * Validate database connection and basic table access
 */
export async function validateDatabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await testSupabase
      .from('organizations')
      .select('count')
      .limit(1)
      .single()
    
    return !error || error.code === 'PGRST116' // Empty result is OK
  } catch (error) {
    console.error('Database connection validation failed:', error)
    return false
  }
}

/**
 * Execute raw SQL for testing purposes
 */
export async function executeSQL(sql: string, params: any[] = []) {
  try {
    const { data, error } = await testSupabase.rpc('execute_sql', {
      sql,
      params
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('SQL execution failed:', sql, error)
    throw error
  }
}

/**
 * Check if a table exists and has expected columns
 */
export async function validateTableSchema(tableName: string, expectedColumns: string[]): Promise<{
  exists: boolean
  missingColumns: string[]
  extraColumns: string[]
}> {
  try {
    // Query information_schema to get column information
    const { data, error } = await testSupabase
      .from('INFORMATION_SCHEMA.COLUMNS' as any)
      .select('column_name')
      .eq('table_name', tableName)
      .eq('table_schema', 'public')
    
    if (error) throw error
    
    const actualColumns = data?.map(row => row.column_name) || []
    const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col))
    const extraColumns = actualColumns.filter(col => !expectedColumns.includes(col))
    
    return {
      exists: actualColumns.length > 0,
      missingColumns,
      extraColumns
    }
  } catch (error) {
    console.error('Schema validation failed for table:', tableName, error)
    return {
      exists: false,
      missingColumns: expectedColumns,
      extraColumns: []
    }
  }
}

/**
 * Check if enum values match expected values
 */
export async function validateEnumValues(enumName: string, expectedValues: string[]): Promise<{
  matches: boolean
  missingValues: string[]
  extraValues: string[]
}> {
  try {
    // Query pg_enum to get enum values
    const { data, error } = await testSupabase
      .from('pg_enum' as any)
      .select('enumlabel')
      .eq('enumtypid', `(SELECT oid FROM pg_type WHERE typname = '${enumName}')`)
    
    if (error) throw error
    
    const actualValues = data?.map(row => row.enumlabel) || []
    const missingValues = expectedValues.filter(val => !actualValues.includes(val))
    const extraValues = actualValues.filter(val => !expectedValues.includes(val))
    
    return {
      matches: missingValues.length === 0 && extraValues.length === 0,
      missingValues,
      extraValues
    }
  } catch (error) {
    console.error('Enum validation failed for:', enumName, error)
    return {
      matches: false,
      missingValues: expectedValues,
      extraValues: []
    }
  }
}