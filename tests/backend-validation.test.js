// Validation test for backend testing infrastructure
import { describe, it, expect } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ixitjldcdvbazvjsnkao.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4aXRqbGRjZHZiYXp2anNua2FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5Mjg0MjEsImV4cCI6MjA3MDUwNDQyMX0.8h5jXRcT96R34m0MU7PVbgzJPpGvf5azgQd2wo5AB2Q'

describe('Backend Test Infrastructure Validation', () => {
  const supabase = createClient(supabaseUrl, supabaseKey)

  it('should connect to Supabase database', async () => {
    const { data, error } = await supabase
      .from('organizations')
      .select('count')
      .limit(1)
    
    expect(error).toBeNull()
    expect(data).toBeDefined()
  })

  it('should have TypeScript types available', () => {
    expect(typeof supabase).toBe('object')
    expect(supabase.from).toBeDefined()
    expect(supabase.auth).toBeDefined()
  })

  it('should validate test framework is working', () => {
    const testData = { name: 'Test Organization', type: 'customer' }
    expect(testData.name).toBe('Test Organization')
    expect(testData.type).toBe('customer')
  })

  it('should measure query performance', async () => {
    const startTime = Date.now()
    
    const { data, error } = await supabase
      .from('organizations')
      .select('id, name')
      .limit(5)
    
    const queryTime = Date.now() - startTime
    
    console.log(`📊 Query took ${queryTime}ms`)
    expect(queryTime).toBeLessThan(5000) // Should be under 5 seconds
  })
})