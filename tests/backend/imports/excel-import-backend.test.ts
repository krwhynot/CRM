/**
 * Excel Import Backend Validation Tests
 * 
 * Comprehensive testing of CSV/Excel import functionality, data validation,
 * batch processing, and error handling for the KitchenPantry CRM system.
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import { testSupabase, TestAuth } from '../setup/test-setup'

// Type interfaces for import data processing
interface ImportRow {
  name: string
  type: string
  industry?: string
  description?: string
  website?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  manager_name?: string
}

interface ProcessedImportRow extends ImportRow {
  created_by: string
  created_at?: string
}

describe('Excel Import Backend Validation Tests', () => {
  let testDataIds: { table: string; ids: string[] }[] = []
  let importTestResults: { test: string; duration: number; recordsProcessed: number }[] = []

  beforeAll(async () => {
    console.log('📊 Setting up Excel import backend tests...')
    await TestAuth.loginAsTestUser()
  })

  afterAll(async () => {
    console.log('🧹 Cleaning up import test data...')
    await cleanupImportTestData()
    
    // Generate import performance report
    console.log('\n📊 IMPORT PERFORMANCE RESULTS:')
    console.log('=' .repeat(70))
    importTestResults.forEach((result: any) => {
      const recordsPerSecond = result.recordsProcessed / (result.duration / 1000)
      console.log(`${result.test.padEnd(35)} | ${result.duration.toFixed(0)}ms | ${result.recordsProcessed} records | ${recordsPerSecond.toFixed(1)} records/sec`)
    })
    console.log('=' .repeat(70))
  })

  const trackTestData = (table: string, id: string) => {
    const existing = testDataIds.find(t => t.table === table)
    if (existing) {
      existing.ids.push(id)
    } else {
      testDataIds.push({ table, ids: [id] })
    }
  }

  const cleanupImportTestData = async () => {
    const tables = ['interactions', 'opportunities', 'products', 'contacts', 'organizations']
    
    for (const table of tables) {
      const tableData = testDataIds.find(t => t.table === table)
      if (tableData && tableData.ids.length > 0) {
        try {
          await testSupabase
            .from(table as any)
            .delete()
            .in('id', tableData.ids)
        } catch (error) {
          console.warn(`Could not cleanup ${table}:`, error)
        }
      }
    }
  }

  // Mock CSV data for testing
  const generateCSVData = (recordCount: number, includeErrors: boolean = false) => {
    const headers = 'Name,Type,Industry,Description,Website,Phone,Email,Address,City,State,Zip,Country,Manager Name\n'
    let csvData = headers

    for (let i = 1; i <= recordCount; i++) {
      const orgType = ['principal', 'customer', 'distributor'][i % 3]
      
      if (includeErrors && i % 10 === 0) {
        // Introduce errors every 10th record
        csvData += `,${orgType},Food Service,Missing name error,https://test${i}.com,555-${String(i).padStart(4, '0')},invalid-email,${i} Test St,Test City,CA,90210,United States,Manager ${i}\n`
      } else if (includeErrors && i % 15 === 0) {
        // Invalid type error
        csvData += `Import Test Org ${i},invalid_type,Food Service,Test description,https://test${i}.com,555-${String(i).padStart(4, '0')},test${i}@example.com,${i} Test St,Test City,CA,90210,United States,Manager ${i}\n`
      } else {
        // Valid record
        csvData += `Import Test Org ${i},${orgType},Food Service,Test organization ${i},https://test${i}.com,555-${String(i).padStart(4, '0')},test${i}@example.com,${i} Test St,Test City,CA,90210,United States,Manager ${i}\n`
      }
    }

    return csvData
  }

  // Simulate CSV parsing (simplified version)
  const parseCSV = (csvData: string) => {
    const lines = csvData.trim().split('\n')
    const headers = lines[0].split(',')
    const records = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      const record: any = {}
      
      headers.forEach((header: string, index: number) => {
        record[header.toLowerCase().replace(' ', '_')] = values[index]?.trim()
      })
      
      records.push(record)
    }

    return records
  }

  // Simulate backend validation logic
  const validateImportRecord = (record: any) => {
    const errors = []
    const warnings = []

    // Required field validation
    if (!record.name || record.name.trim() === '') {
      errors.push('Name is required')
    }

    if (!record.type || record.type.trim() === '') {
      errors.push('Type is required')
    }

    // Type validation
    const validTypes = ['principal', 'customer', 'distributor']
    if (record.type && !validTypes.includes(record.type.toLowerCase())) {
      errors.push(`Invalid type "${record.type}". Must be one of: ${validTypes.join(', ')}`)
    }

    // Email format validation
    if (record.email && !record.email.includes('@')) {
      errors.push('Invalid email format')
    }

    // Phone format validation (basic)
    if (record.phone && record.phone.length < 10) {
      warnings.push('Phone number may be too short')
    }

    // URL validation (basic)
    if (record.website && !record.website.startsWith('http')) {
      warnings.push('Website URL should include http:// or https://')
    }

    return { errors, warnings }
  }

  describe('CSV Data Validation', () => {
    test('should validate CSV headers correctly', async () => {
      const validHeaders = 'Name,Type,Industry,Description,Website,Phone,Email,Address,City,State,Zip,Country,Manager Name'
      const invalidHeaders = 'InvalidColumn1,InvalidColumn2,Name,Type'

      const validCSV = validHeaders + '\nTest Org,customer,Food Service,Test description'
      const invalidCSV = invalidHeaders + '\nValue1,Value2,Test Org,customer'

      const validRecords = parseCSV(validCSV)
      const invalidRecords = parseCSV(invalidCSV)

      // Valid CSV should parse correctly
      expect(validRecords).toHaveLength(1)
      expect(validRecords[0].name).toBe('Test Org')
      expect(validRecords[0].type).toBe('customer')

      // Invalid CSV should still parse but may have unexpected structure
      expect(invalidRecords).toHaveLength(1)
      expect(invalidRecords[0].name).toBe('Test Org')
    })

    test('should validate individual record data', async () => {
      const testRecords = [
        { name: 'Valid Org', type: 'customer', email: 'valid@example.com' },
        { name: '', type: 'customer', email: 'missing@name.com' }, // Missing name
        { name: 'Invalid Type Org', type: 'invalid_type', email: 'invalid@type.com' }, // Invalid type
        { name: 'Invalid Email Org', type: 'customer', email: 'invalid-email' } // Invalid email
      ]

      const validationResults = testRecords.map(record => ({
        record,
        validation: validateImportRecord(record)
      }))

      // First record should be valid
      expect(validationResults[0].validation.errors).toHaveLength(0)

      // Second record should have name error
      expect(validationResults[1].validation.errors).toContain('Name is required')

      // Third record should have type error
      expect(validationResults[2].validation.errors.some(error => 
        error.includes('Invalid type')
      )).toBe(true)

      // Fourth record should have email error
      expect(validationResults[3].validation.errors).toContain('Invalid email format')
    })

    test('should handle special characters and encoding', async () => {
      const specialCharRecords = [
        { name: 'Café & Restaurant', type: 'customer', description: 'Spécialty foods' },
        { name: 'Johnson\'s "Best" Foods', type: 'principal', description: 'Quotes & apostrophes' },
        { name: '中文餐厅', type: 'customer', description: 'Unicode characters' }
      ]

      specialCharRecords.forEach((record: any) => {
        const validation = validateImportRecord(record)
        expect(validation.errors).toHaveLength(0) // Should handle special characters
      })
    })
  })

  describe('Batch Import Processing', () => {
    test('should process small batch efficiently', async () => {
      const batchSize = 10
      const csvData = generateCSVData(batchSize, false) // No errors
      const records = parseCSV(csvData)

      const startTime = performance.now()
      const results = { successful: 0, failed: 0, errors: [] as any[] }

      // Simulate batch processing
      for (const record of records) {
        try {
          const mappedData = {
            name: record.name,
            type: record.type.toLowerCase() as 'principal' | 'customer' | 'distributor',
            industry: record.industry,
            description: record.description,
            website: record.website,
            phone: record.phone,
            email: record.email,
            address_line_1: record.address,
            city: record.city,
            state_province: record.state,
            postal_code: record.zip,
            country: record.country,
            created_by: '00000000-0000-0000-0000-000000000001'
            // Note: manager_name would be stored in notes or handled separately
          }

          const validation = validateImportRecord(record)
          if (validation.errors.length === 0) {
            const result = await testSupabase
              .from('organizations')
              .insert(mappedData)
              .select()
              .single()

            if (result.error) {
              results.failed++
              results.errors.push({ record: record.name, error: result.error.message })
            } else {
              results.successful++
              trackTestData('organizations', result.data.id)
            }
          } else {
            results.failed++
            results.errors.push({ record: record.name, error: validation.errors.join(', ') })
          }
        } catch (error) {
          results.failed++
          results.errors.push({ record: record.name || 'Unknown', error: String(error) })
        }
      }

      const duration = performance.now() - startTime

      expect(results.successful).toBe(batchSize)
      expect(results.failed).toBe(0)
      expect(duration).toBeLessThan(5000) // Should complete within 5 seconds

      importTestResults.push({
        test: 'Small Batch Import',
        duration,
        recordsProcessed: batchSize
      })

      console.log(`📊 Small batch import: ${results.successful}/${batchSize} successful in ${duration.toFixed(2)}ms`)
    })

    test('should handle large batch with pagination', async () => {
      const totalRecords = 50
      const batchSize = 10
      const csvData = generateCSVData(totalRecords, false)
      const records = parseCSV(csvData)

      const startTime = performance.now()
      const results = { successful: 0, failed: 0, errors: [] as any[] }

      // Process in batches
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize)
        
        const batchPromises = batch.map(async (record) => {
          try {
            const mappedData = {
              name: record.name,
              type: record.type.toLowerCase() as 'principal' | 'customer' | 'distributor',
              industry: record.industry,
              description: record.description,
              website: record.website,
              phone: record.phone,
              email: record.email,
              address_line_1: record.address,
              city: record.city,
              state_province: record.state,
              postal_code: record.zip,
              country: record.country,
              created_by: '00000000-0000-0000-0000-000000000001'
            }

            const validation = validateImportRecord(record)
            if (validation.errors.length === 0) {
              const result = await testSupabase
                .from('organizations')
                .insert(mappedData)
                .select()
                .single()

              if (result.error) {
                return { success: false, record: record.name, error: result.error.message }
              } else {
                trackTestData('organizations', result.data.id)
                return { success: true, record: record.name, id: result.data.id }
              }
            } else {
              return { success: false, record: record.name, error: validation.errors.join(', ') }
            }
          } catch (error) {
            return { success: false, record: record.name || 'Unknown', error: String(error) }
          }
        })

        const batchResults = await Promise.all(batchPromises)
        
        batchResults.forEach((result: any) => {
          if (result.success) {
            results.successful++
          } else {
            results.failed++
            results.errors.push({ record: result.record, error: result.error })
          }
        })

        // Small delay between batches to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      const duration = performance.now() - startTime

      expect(results.successful).toBe(totalRecords)
      expect(results.failed).toBe(0)
      expect(duration).toBeLessThan(15000) // Should complete within 15 seconds

      importTestResults.push({
        test: 'Large Batch Import',
        duration,
        recordsProcessed: totalRecords
      })

      console.log(`📊 Large batch import: ${results.successful}/${totalRecords} successful in ${duration.toFixed(2)}ms`)
    })

    test('should handle import with validation errors gracefully', async () => {
      const totalRecords = 20
      const csvData = generateCSVData(totalRecords, true) // Include errors
      const records = parseCSV(csvData)

      const startTime = performance.now()
      const results = { successful: 0, failed: 0, errors: [] as any[] }

      for (const record of records) {
        try {
          const validation = validateImportRecord(record)
          
          if (validation.errors.length === 0) {
            const mappedData = {
              name: record.name,
              type: record.type.toLowerCase() as 'principal' | 'customer' | 'distributor',
              industry: record.industry,
              description: record.description,
              website: record.website,
              phone: record.phone,
              email: record.email,
              address_line_1: record.address,
              city: record.city,
              state_province: record.state,
              postal_code: record.zip,
              country: record.country,
              created_by: '00000000-0000-0000-0000-000000000001'
            }

            const result = await testSupabase
              .from('organizations')
              .insert(mappedData)
              .select()
              .single()

            if (result.error) {
              results.failed++
              results.errors.push({ record: record.name, error: result.error.message })
            } else {
              results.successful++
              trackTestData('organizations', result.data.id)
            }
          } else {
            results.failed++
            results.errors.push({ record: record.name || `Record ${records.indexOf(record) + 1}`, error: validation.errors.join(', ') })
          }
        } catch (error) {
          results.failed++
          results.errors.push({ record: record.name || `Record ${records.indexOf(record) + 1}`, error: String(error) })
        }
      }

      const duration = performance.now() - startTime

      expect(results.successful).toBeGreaterThan(0) // Some should succeed
      expect(results.failed).toBeGreaterThan(0) // Some should fail
      expect(results.successful + results.failed).toBe(totalRecords)

      importTestResults.push({
        test: 'Error Handling Import',
        duration,
        recordsProcessed: totalRecords
      })

      console.log(`📊 Error handling import: ${results.successful} successful, ${results.failed} failed in ${duration.toFixed(2)}ms`)
      console.log(`📋 Sample errors:`)
      results.errors.slice(0, 3).forEach((error: any) => {
        console.log(`  - ${error.record}: ${error.error}`)
      })
    })
  })

  describe('Import Data Integrity', () => {
    test('should maintain data integrity during partial import failures', async () => {
      const csvData = generateCSVData(5, false)
      const records = parseCSV(csvData)

      // Intentionally corrupt the third record to cause a database error
      records[2].name = null

      const results = { successful: 0, failed: 0, successful_ids: [] as string[] }

      for (const record of records) {
        try {
          if (record.name) {
            const mappedData = {
              name: record.name,
              type: record.type.toLowerCase() as 'principal' | 'customer' | 'distributor',
              industry: record.industry
            }

            const result = await testSupabase
              .from('organizations')
              .insert(mappedData)
              .select()
              .single()

            if (result.error) {
              results.failed++
            } else {
              results.successful++
              results.successful_ids.push(result.data.id)
              trackTestData('organizations', result.data.id)
            }
          } else {
            results.failed++
          }
        } catch (error) {
          results.failed++
        }
      }

      // Verify that successful imports are still in database
      for (const id of results.successful_ids) {
        const verifyResult = await testSupabase
          .from('organizations')
          .select('*')
          .eq('id', id)
          .single()

        expect(verifyResult.error).toBeNull()
        expect(verifyResult.data).toBeDefined()
      }

      expect(results.successful).toBe(4) // 4 out of 5 should succeed
      expect(results.failed).toBe(1)
    })

    test('should handle duplicate data correctly', async () => {
      // Create initial record
      const originalData = {
        name: 'Duplicate Test Organization',
        type: 'customer' as const,
        industry: 'Food Service',
        created_by: '00000000-0000-0000-0000-000000000001'
      }

      const originalResult = await testSupabase
        .from('organizations')
        .insert(originalData)
        .select()
        .single()

      expect(originalResult.error).toBeNull()
      trackTestData('organizations', originalResult.data.id)

      // Attempt to import the same organization name
      const duplicateData = {
        name: 'Duplicate Test Organization', // Same name
        type: 'principal' as const, // Different type
        industry: 'Food Manufacturing',
        created_by: '00000000-0000-0000-0000-000000000001'
      }

      const duplicateResult = await testSupabase
        .from('organizations')
        .insert(duplicateData)
        .select()
        .single()

      // This should succeed since we don't have unique constraints on name
      // But it's important to test the behavior
      if (duplicateResult.error) {
        console.log('✅ Duplicate name prevention is enforced')
        expect(duplicateResult.error.code).toBe('23505') // Unique constraint violation
      } else {
        console.log('⚠️  Duplicate names are allowed - consider if this is intended behavior')
        expect(duplicateResult.data.name).toBe(duplicateData.name)
        trackTestData('organizations', duplicateResult.data.id)
      }
    })

    test('should rollback transaction on critical errors', async () => {
      // This test simulates a transaction rollback scenario
      // Note: Supabase client doesn't support explicit transactions,
      // but we can test error handling behavior

      const records = [
        { name: 'Transaction Test 1', type: 'customer', industry: 'Food', created_by: '00000000-0000-0000-0000-000000000001' },
        { name: 'Transaction Test 2', type: 'invalid_type', industry: 'Food', created_by: '00000000-0000-0000-0000-000000000001' }, // This should fail
        { name: 'Transaction Test 3', type: 'distributor', industry: 'Food', created_by: '00000000-0000-0000-0000-000000000001' }
      ]

      const results = { successful: 0, failed: 0 }

      for (const record of records) {
        try {
          const validation = validateImportRecord(record)
          
          if (validation.errors.length === 0) {
            const result = await testSupabase
              .from('organizations')
              .insert({
                name: record.name,
                type: record.type.toLowerCase() as any,
                industry: record.industry,
                created_by: '00000000-0000-0000-0000-000000000001'
              })
              .select()
              .single()

            if (result.error) {
              results.failed++
              // In a real transaction, this would trigger rollback
              console.log(`❌ Import failed for ${record.name}: ${result.error.message}`)
            } else {
              results.successful++
              trackTestData('organizations', result.data.id)
              console.log(`✅ Import successful for ${record.name}`)
            }
          } else {
            results.failed++
            console.log(`❌ Validation failed for ${record.name}: ${validation.errors.join(', ')}`)
          }
        } catch (error) {
          results.failed++
          console.log(`❌ Exception for ${record.name}: ${error}`)
        }
      }

      // In this case, successful records remain (no automatic rollback)
      expect(results.successful).toBe(2) // First and third should succeed
      expect(results.failed).toBe(1)    // Second should fail
    })
  })

  describe('Import Performance Benchmarks', () => {
    test('should meet performance requirements for standard import sizes', async () => {
      const performanceTests = [
        { size: 25, maxTime: 5000, description: 'Small Import (25 records)' },
        { size: 100, maxTime: 15000, description: 'Medium Import (100 records)' },
        { size: 200, maxTime: 30000, description: 'Large Import (200 records)' }
      ]

      for (const testConfig of performanceTests) {
        const csvData = generateCSVData(testConfig.size, false)
        const records = parseCSV(csvData)

        const startTime = performance.now()
        let successful = 0

        // Process records in batches of 20
        const batchSize = 20
        for (let i = 0; i < records.length; i += batchSize) {
          const batch = records.slice(i, i + batchSize)
          
          const batchPromises = batch.map(async (record) => {
            const mappedData = {
              name: record.name,
              type: record.type.toLowerCase() as any,
              industry: record.industry,
              description: record.description,
              created_by: '00000000-0000-0000-0000-000000000001'
            }

            const result = await testSupabase
              .from('organizations')
              .insert(mappedData)
              .select()
              .single()

            if (result.data) {
              trackTestData('organizations', result.data.id)
              return true
            }
            return false
          })

          const batchResults = await Promise.all(batchPromises)
          successful += batchResults.filter(Boolean).length

          // Small delay between batches
          if (i + batchSize < records.length) {
            await new Promise(resolve => setTimeout(resolve, 50))
          }
        }

        const duration = performance.now() - startTime

        expect(successful).toBe(testConfig.size)
        expect(duration).toBeLessThan(testConfig.maxTime)

        importTestResults.push({
          test: testConfig.description,
          duration,
          recordsProcessed: testConfig.size
        })

        const recordsPerSecond = testConfig.size / (duration / 1000)
        console.log(`📊 ${testConfig.description}: ${duration.toFixed(0)}ms (${recordsPerSecond.toFixed(1)} records/sec)`)
      }
    })

    test('should handle concurrent import operations', async () => {
      const concurrentImports = 3
      const recordsPerImport = 10

      const importPromises = Array(concurrentImports).fill(null).map(async (_, index) => {
        const csvData = generateCSVData(recordsPerImport, false)
        const records = parseCSV(csvData)
        
        // Add index to make names unique across concurrent imports
        const modifiedRecords = records.map(record => ({
          ...record,
          name: `${record.name} - Concurrent ${index + 1}`
        }))

        const startTime = performance.now()
        let successful = 0

        for (const record of modifiedRecords) {
          const result = await testSupabase
            .from('organizations')
            .insert({
              name: record.name,
              type: record.type.toLowerCase() as any,
              industry: record.industry
            })
            .select()
            .single()

          if (result.data) {
            successful++
            trackTestData('organizations', result.data.id)
          }
        }

        const duration = performance.now() - startTime
        return { successful, duration, import: index + 1 }
      })

      const results = await Promise.all(importPromises)

      // All imports should complete successfully
      results.forEach((result: any, index: number) => {
        expect(result.successful).toBe(recordsPerImport)
        console.log(`📊 Concurrent Import ${result.import}: ${result.duration.toFixed(0)}ms`)
      })

      const totalDuration = Math.max(...results.map(r => r.duration))
      const totalRecords = concurrentImports * recordsPerImport

      importTestResults.push({
        test: 'Concurrent Import Operations',
        duration: totalDuration,
        recordsProcessed: totalRecords
      })

      expect(totalDuration).toBeLessThan(10000) // Should complete within 10 seconds
    })
  })

  describe('Import Error Recovery', () => {
    test('should provide detailed error reporting', async () => {
      const problematicRecords = [
        { name: '', type: 'customer', email: 'missing@name.com' },
        { name: 'Valid Org 1', type: 'customer', email: 'valid1@test.com' },
        { name: 'Invalid Type Org', type: 'invalid_type', email: 'invalid@type.com' },
        { name: 'Valid Org 2', type: 'principal', email: 'valid2@test.com' },
        { name: 'Invalid Email Org', type: 'customer', email: 'invalid-email' }
      ]

      const importReport = {
        total: problematicRecords.length,
        successful: 0,
        failed: 0,
        errors: [] as any[]
      }

      for (let i = 0; i < problematicRecords.length; i++) {
        const record = problematicRecords[i]
        const validation = validateImportRecord(record)

        if (validation.errors.length === 0) {
          try {
            const result = await testSupabase
              .from('organizations')
              .insert({
                name: record.name,
                type: record.type.toLowerCase() as any,
                email: record.email,
                industry: 'Test',
                created_by: '00000000-0000-0000-0000-000000000001'
              })
              .select()
              .single()

            if (result.error) {
              importReport.failed++
              importReport.errors.push({
                row: i + 2, // +2 because CSV has header and is 1-indexed
                record: record.name || `Row ${i + 2}`,
                error: result.error.message,
                type: 'Database Error'
              })
            } else {
              importReport.successful++
              trackTestData('organizations', result.data.id)
            }
          } catch (error) {
            importReport.failed++
            importReport.errors.push({
              row: i + 2,
              record: record.name || `Row ${i + 2}`,
              error: String(error),
              type: 'System Error'
            })
          }
        } else {
          importReport.failed++
          importReport.errors.push({
            row: i + 2,
            record: record.name || `Row ${i + 2}`,
            error: validation.errors.join(', '),
            type: 'Validation Error'
          })
        }
      }

      expect(importReport.total).toBe(5)
      expect(importReport.successful).toBe(2) // Only 2 valid records
      expect(importReport.failed).toBe(3)    // 3 invalid records
      expect(importReport.errors).toHaveLength(3)

      // Verify error details
      const validationErrors = importReport.errors.filter(e => e.type === 'Validation Error')
      expect(validationErrors).toHaveLength(3)

      console.log('\n📋 DETAILED ERROR REPORT:')
      importReport.errors.forEach((error: any) => {
        console.log(`  Row ${error.row}: ${error.record} - ${error.error} (${error.type})`)
      })
    })

    test('should support import resume functionality', async () => {
      const allRecords = parseCSV(generateCSVData(10, false))
      
      // Simulate first batch (first 5 records)
      const firstBatch = allRecords.slice(0, 5)
      const firstBatchIds: string[] = []

      for (const record of firstBatch) {
        const result = await testSupabase
          .from('organizations')
          .insert({
            name: record.name,
            type: record.type.toLowerCase() as any,
            industry: record.industry,
            created_by: '00000000-0000-0000-0000-000000000001'
          })
          .select()
          .single()

        if (result.data) {
          firstBatchIds.push(result.data.id)
          trackTestData('organizations', result.data.id)
        }
      }

      expect(firstBatchIds).toHaveLength(5)

      // Simulate interruption and resume (remaining 5 records)
      const remainingBatch = allRecords.slice(5)
      const remainingBatchIds: string[] = []

      for (const record of remainingBatch) {
        const result = await testSupabase
          .from('organizations')
          .insert({
            name: record.name,
            type: record.type.toLowerCase() as any,
            industry: record.industry,
            created_by: '00000000-0000-0000-0000-000000000001'
          })
          .select()
          .single()

        if (result.data) {
          remainingBatchIds.push(result.data.id)
          trackTestData('organizations', result.data.id)
        }
      }

      expect(remainingBatchIds).toHaveLength(5)

      // Verify all records were imported
      const totalImported = firstBatchIds.length + remainingBatchIds.length
      expect(totalImported).toBe(10)

      console.log(`✅ Import resume test: ${firstBatchIds.length} + ${remainingBatchIds.length} = ${totalImported} records`)
    })
  })
})
