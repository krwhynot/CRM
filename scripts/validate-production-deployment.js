#!/usr/bin/env node
/**
 * Production Deployment Validation Script
 * Comprehensive validation of deployed KitchenPantry CRM application
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const PRODUCTION_URL = 'https://crm.kjrcloud.com'
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ixitjldcdvbazvjsnkao.supabase.co'
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4aXRqbGRjZHZiYXp2anNua2FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5Mjg0MjEsImV4cCI6MjA3MDUwNDQyMX0.8h5jXRcT96R34m0MU7PVbgzJPpGvf5azgQd2wo5AB2Q'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

class ProductionValidator {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      overall_status: 'unknown',
      checks: {},
      performance_metrics: {},
      errors: [],
      warnings: []
    }
  }

  log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`)
  }

  error(message) {
    console.error(`[ERROR] ${message}`)
    this.results.errors.push(message)
  }

  warn(message) {
    console.warn(`[WARNING] ${message}`)
    this.results.warnings.push(message)
  }

  success(message) {
    console.log(`[SUCCESS] ${message}`)
  }

  async fetchWithTimeout(url, options = {}, timeout = 10000) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  async validateApplicationHealth() {
    this.log('Validating application health...')
    
    try {
      const start = Date.now()
      const response = await this.fetchWithTimeout(PRODUCTION_URL)
      const loadTime = Date.now() - start
      
      this.results.performance_metrics.page_load_time_ms = loadTime
      
      if (response.ok) {
        this.success(`Application responding: HTTP ${response.status}`)
        this.results.checks.application_health = 'healthy'
        
        if (loadTime < 3000) {
          this.success(`Page load time: ${loadTime}ms (< 3s target)`)
        } else {
          this.warn(`Page load time: ${loadTime}ms (exceeds 3s target)`)
        }
      } else {
        this.error(`Application unhealthy: HTTP ${response.status}`)
        this.results.checks.application_health = 'unhealthy'
        return false
      }
    } catch (error) {
      this.error(`Application health check failed: ${error.message}`)
      this.results.checks.application_health = 'error'
      return false
    }
    
    return true
  }

  async validateHealthEndpoint() {
    this.log('Validating health endpoint...')
    
    try {
      const response = await this.fetchWithTimeout(`${PRODUCTION_URL}/health.json`)
      
      if (response.ok) {
        const healthData = await response.json()
        
        if (healthData.status === 'healthy') {
          this.success('Health endpoint reports: healthy')
          this.results.checks.health_endpoint = 'healthy'
          this.results.health_data = healthData
        } else {
          this.warn(`Health endpoint reports: ${healthData.status}`)
          this.results.checks.health_endpoint = 'warning'
        }
      } else {
        this.error(`Health endpoint unavailable: HTTP ${response.status}`)
        this.results.checks.health_endpoint = 'error'
        return false
      }
    } catch (error) {
      this.error(`Health endpoint check failed: ${error.message}`)
      this.results.checks.health_endpoint = 'error'
      return false
    }
    
    return true
  }

  async validateDatabaseConnectivity() {
    this.log('Validating database connectivity...')
    
    try {
      // Test basic Supabase connection
      const { data, error } = await supabase.from('organizations').select('count').limit(1)
      
      if (error) {
        this.error(`Database connectivity failed: ${error.message}`)
        this.results.checks.database_connectivity = 'error'
        return false
      } else {
        this.success('Database connectivity verified')
        this.results.checks.database_connectivity = 'healthy'
      }
    } catch (error) {
      this.error(`Database check failed: ${error.message}`)
      this.results.checks.database_connectivity = 'error'
      return false
    }
    
    return true
  }

  async validateCorePages() {
    this.log('Validating core application pages...')
    
    const pages = [
      { path: '/', name: 'Landing Page' },
      { path: '/#/dashboard', name: 'Dashboard' },
      { path: '/#/organizations', name: 'Organizations' },
      { path: '/#/contacts', name: 'Contacts' },
      { path: '/#/opportunities', name: 'Opportunities' },
      { path: '/#/products', name: 'Products' },
      { path: '/#/interactions', name: 'Interactions' },
      { path: '/#/import-export', name: 'Import/Export' }
    ]
    
    const pageResults = {}
    let failedPages = 0
    
    for (const page of pages) {
      try {
        const response = await this.fetchWithTimeout(`${PRODUCTION_URL}${page.path}`)
        
        if (response.ok) {
          this.success(`${page.name}: HTTP ${response.status}`)
          pageResults[page.path] = 'healthy'
        } else {
          this.error(`${page.name}: HTTP ${response.status}`)
          pageResults[page.path] = 'error'
          failedPages++
        }
      } catch (error) {
        this.error(`${page.name}: ${error.message}`)
        pageResults[page.path] = 'error'
        failedPages++
      }
    }
    
    this.results.checks.core_pages = pageResults
    
    if (failedPages === 0) {
      this.success('All core pages accessible')
      return true
    } else {
      this.error(`${failedPages} core pages failed`)
      return false
    }
  }

  async validateSecurityHeaders() {
    this.log('Validating security headers...')
    
    try {
      const response = await this.fetchWithTimeout(PRODUCTION_URL)
      const headers = response.headers
      
      const requiredHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection',
        'referrer-policy',
        'content-security-policy',
        'strict-transport-security'
      ]
      
      const headerResults = {}
      let missingHeaders = []
      
      for (const header of requiredHeaders) {
        if (headers.get(header)) {
          headerResults[header] = 'present'
        } else {
          headerResults[header] = 'missing'
          missingHeaders.push(header)
        }
      }
      
      this.results.checks.security_headers = headerResults
      
      if (missingHeaders.length === 0) {
        this.success('All security headers present')
        return true
      } else {
        this.warn(`Missing security headers: ${missingHeaders.join(', ')}`)
        return false
      }
    } catch (error) {
      this.error(`Security headers check failed: ${error.message}`)
      this.results.checks.security_headers = 'error'
      return false
    }
  }

  async validateSSLCertificate() {
    this.log('Validating SSL certificate...')
    
    try {
      const response = await this.fetchWithTimeout(PRODUCTION_URL)
      
      if (response.url.startsWith('https://')) {
        this.success('SSL certificate valid and enforced')
        this.results.checks.ssl_certificate = 'valid'
        return true
      } else {
        this.error('SSL not enforced')
        this.results.checks.ssl_certificate = 'invalid'
        return false
      }
    } catch (error) {
      this.error(`SSL certificate check failed: ${error.message}`)
      this.results.checks.ssl_certificate = 'error'
      return false
    }
  }

  async runAllValidations() {
    this.log('=== Starting Production Deployment Validation ===')
    
    const validations = [
      this.validateApplicationHealth(),
      this.validateHealthEndpoint(),
      this.validateDatabaseConnectivity(),
      this.validateCorePages(),
      this.validateSecurityHeaders(),
      this.validateSSLCertificate()
    ]
    
    const results = await Promise.allSettled(validations)
    
    let passedChecks = 0
    let failedChecks = 0
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        passedChecks++
      } else {
        failedChecks++
      }
    })
    
    // Overall status determination
    if (failedChecks === 0) {
      this.results.overall_status = 'healthy'
      this.success('=== All validation checks passed ===')
    } else if (failedChecks <= 2) {
      this.results.overall_status = 'warning'
      this.warn(`=== Validation completed with ${failedChecks} failures ===`)
    } else {
      this.results.overall_status = 'critical'
      this.error(`=== Critical validation failures: ${failedChecks} ===`)
    }
    
    this.results.summary = {
      total_checks: validations.length,
      passed_checks: passedChecks,
      failed_checks: failedChecks,
      success_rate: `${Math.round((passedChecks / validations.length) * 100)}%`
    }
    
    return this.results
  }

  async saveResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `production-validation-${timestamp}.json`
    const filepath = path.join(process.cwd(), 'logs', filename)
    
    // Ensure logs directory exists
    const logsDir = path.dirname(filepath)
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true })
    }
    
    fs.writeFileSync(filepath, JSON.stringify(this.results, null, 2))
    this.log(`Results saved to: ${filepath}`)
    
    return filepath
  }
}

// Main execution
async function main() {
  const validator = new ProductionValidator()
  
  try {
    const results = await validator.runAllValidations()
    await validator.saveResults()
    
    // Exit with appropriate code
    if (results.overall_status === 'healthy') {
      process.exit(0)
    } else if (results.overall_status === 'warning') {
      process.exit(1)
    } else {
      process.exit(2)
    }
  } catch (error) {
    console.error('Fatal error during validation:', error)
    process.exit(3)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { ProductionValidator }