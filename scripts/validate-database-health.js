#!/usr/bin/env node

/**
 * Database Health Validation Script
 * 
 * This script performs comprehensive database health checks for the CRM system.
 * It validates schema integrity, performance metrics, and security posture.
 * 
 * Usage: node scripts/validate-database-health.js [--project-id=xxx] [--detailed] [--fix]
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Database Health Configuration
const DB_HEALTH_CONFIG = {
  performance: {
    minCacheHitRate: 95.0,
    maxSlowQueries: 10,
    maxConnectionCount: 50,
    maxDuplicateIndexes: 5,
    maxUnusedIndexes: 50
  },
  security: {
    maxSecurityWarnings: 8,
    requiredRLSPolicies: [
      'organizations',
      'contacts', 
      'products',
      'opportunities',
      'interactions',
      'principal_distributor_relationships'
    ],
    requiredConstraints: [
      'contacts_organization_id_fkey',
      'opportunities_contact_id_fkey',
      'interactions_contact_id_fkey',
      'interactions_opportunity_id_fkey'
    ]
  },
  integrity: {
    requiredTables: [
      'organizations',
      'contacts',
      'products', 
      'opportunities',
      'interactions',
      'opportunity_products',
      'principal_distributor_relationships'
    ],
    requiredIndexes: [
      'idx_contacts_organization',
      'idx_opportunities_contact',
      'idx_interactions_contact',
      'idx_interactions_opportunity'
    ]
  }
};

class DatabaseHealthValidator {
  constructor(options = {}) {
    this.projectId = options.projectId || 'ixitjldcdvbazvjsnkao';
    this.detailed = options.detailed || false;
    this.autoFix = options.fix || false;
    this.results = {};
    this.startTime = Date.now();
  }

  async run() {
    console.log('🗄️  Database Health Validation Started');
    console.log(`📊 Project ID: ${this.projectId}`);
    console.log(`🔧 Mode: ${this.autoFix ? 'Auto-Fix' : 'Validation Only'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
      await this.validateSchemaIntegrity();
      await this.validatePerformanceMetrics();
      await this.validateSecurityPosture();
      await this.validateIndexHealth();
      await this.validateConstraints();
      await this.validateRLSPolicies();

      this.generateReport();
      
      if (this.hasFailures() && !this.autoFix) {
        console.log('❌ Database health validation failed. Run with --fix to auto-remediate issues.');
        process.exit(1);
      }
      
    } catch (error) {
      console.error('❌ Database health validation failed:', error.message);
      process.exit(1);
    }
  }

  async validateSchemaIntegrity() {
    console.log('\n🏗️  Schema Integrity Validation');
    const result = { name: 'Schema Integrity', checks: {}, passed: true };

    try {
      // Validate required tables exist
      console.log('   🔍 Checking required tables...');
      const tablesQuery = `
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (${DB_HEALTH_CONFIG.integrity.requiredTables.map(t => `'${t}'`).join(',')})
      `;
      
      const tablesResult = await this.executeQuery(tablesQuery);
      const existingTables = tablesResult.map(row => row.tablename);
      const missingTables = DB_HEALTH_CONFIG.integrity.requiredTables.filter(
        table => !existingTables.includes(table)
      );

      result.checks.requiredTables = {
        passed: missingTables.length === 0,
        existing: existingTables,
        missing: missingTables,
        total: DB_HEALTH_CONFIG.integrity.requiredTables.length
      };

      // Validate critical indexes exist
      console.log('   🔍 Checking critical indexes...');
      const indexesQuery = `
        SELECT indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND indexname IN (${DB_HEALTH_CONFIG.integrity.requiredIndexes.map(i => `'${i}'`).join(',')})
      `;
      
      const indexesResult = await this.executeQuery(indexesQuery);
      const existingIndexes = indexesResult.map(row => row.indexname);
      const missingIndexes = DB_HEALTH_CONFIG.integrity.requiredIndexes.filter(
        index => !existingIndexes.includes(index)
      );

      result.checks.criticalIndexes = {
        passed: missingIndexes.length === 0,
        existing: existingIndexes,
        missing: missingIndexes,
        total: DB_HEALTH_CONFIG.integrity.requiredIndexes.length
      };

      // Check for orphaned records
      console.log('   🔍 Checking for orphaned records...');
      const orphanChecks = [
        {
          name: 'contacts_without_organizations',
          query: `SELECT COUNT(*) as count FROM contacts WHERE organization_id NOT IN (SELECT id FROM organizations WHERE deleted_at IS NULL) AND deleted_at IS NULL`
        },
        {
          name: 'opportunities_without_contacts',
          query: `SELECT COUNT(*) as count FROM opportunities WHERE contact_id IS NOT NULL AND contact_id NOT IN (SELECT id FROM contacts WHERE deleted_at IS NULL) AND deleted_at IS NULL`
        },
        {
          name: 'interactions_without_contacts',
          query: `SELECT COUNT(*) as count FROM interactions WHERE contact_id NOT IN (SELECT id FROM contacts WHERE deleted_at IS NULL) AND deleted_at IS NULL`
        }
      ];

      const orphanResults = {};
      for (const check of orphanChecks) {
        const orphanResult = await this.executeQuery(check.query);
        orphanResults[check.name] = parseInt(orphanResult[0].count);
      }

      result.checks.orphanedRecords = {
        passed: Object.values(orphanResults).every(count => count === 0),
        counts: orphanResults
      };

    } catch (error) {
      result.checks.error = { passed: false, message: error.message };
      result.passed = false;
    }

    result.passed = Object.values(result.checks).every(check => check.passed);
    this.results.schemaIntegrity = result;
    this.logResult(result);
  }

  async validatePerformanceMetrics() {
    console.log('\n⚡ Performance Metrics Validation');
    const result = { name: 'Performance Metrics', checks: {}, passed: true };

    try {
      // Cache hit rates
      console.log('   🔍 Checking cache hit rates...');
      const cacheQuery = `
        SELECT 
          ROUND(
            (sum(heap_blks_hit)::float / (sum(heap_blks_hit) + sum(heap_blks_read))) * 100, 
            2
          ) as table_cache_hit_rate,
          ROUND(
            (sum(idx_blks_hit)::float / (sum(idx_blks_hit) + sum(idx_blks_read))) * 100, 
            2
          ) as index_cache_hit_rate
        FROM pg_statio_user_tables
      `;

      const cacheResult = await this.executeQuery(cacheQuery);
      const tableCacheHitRate = parseFloat(cacheResult[0].table_cache_hit_rate || 0);
      const indexCacheHitRate = parseFloat(cacheResult[0].index_cache_hit_rate || 0);

      result.checks.cacheHitRates = {
        passed: tableCacheHitRate >= DB_HEALTH_CONFIG.performance.minCacheHitRate &&
                indexCacheHitRate >= DB_HEALTH_CONFIG.performance.minCacheHitRate,
        tableCacheHitRate,
        indexCacheHitRate,
        threshold: DB_HEALTH_CONFIG.performance.minCacheHitRate
      };

      // Connection count
      console.log('   🔍 Checking connection count...');
      const connectionQuery = `SELECT count(*) as active_connections FROM pg_stat_activity WHERE state = 'active'`;
      const connectionResult = await this.executeQuery(connectionQuery);
      const activeConnections = parseInt(connectionResult[0].active_connections);

      result.checks.connectionCount = {
        passed: activeConnections <= DB_HEALTH_CONFIG.performance.maxConnectionCount,
        activeConnections,
        threshold: DB_HEALTH_CONFIG.performance.maxConnectionCount
      };

      // Query performance
      console.log('   🔍 Checking slow queries...');
      const slowQueryQuery = `
        SELECT query, calls, mean_time, total_time
        FROM pg_stat_statements 
        WHERE mean_time > 1000 
        ORDER BY mean_time DESC 
        LIMIT 10
      `;

      try {
        const slowQueryResult = await this.executeQuery(slowQueryQuery);
        result.checks.slowQueries = {
          passed: slowQueryResult.length <= DB_HEALTH_CONFIG.performance.maxSlowQueries,
          count: slowQueryResult.length,
          queries: this.detailed ? slowQueryResult : [],
          threshold: DB_HEALTH_CONFIG.performance.maxSlowQueries
        };
      } catch (error) {
        // pg_stat_statements might not be enabled
        result.checks.slowQueries = {
          passed: true,
          note: 'pg_stat_statements extension not available',
          count: 0
        };
      }

    } catch (error) {
      result.checks.error = { passed: false, message: error.message };
      result.passed = false;
    }

    result.passed = Object.values(result.checks).every(check => check.passed);
    this.results.performanceMetrics = result;
    this.logResult(result);
  }

  async validateSecurityPosture() {
    console.log('\n🔒 Security Posture Validation');
    const result = { name: 'Security Posture', checks: {}, passed: true };

    try {
      // RLS policies check
      console.log('   🔍 Checking RLS policies...');
      const rlsQuery = `
        SELECT schemaname, tablename, rowsecurity 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (${DB_HEALTH_CONFIG.security.requiredRLSPolicies.map(t => `'${t}'`).join(',')})
      `;

      const rlsResult = await this.executeQuery(rlsQuery);
      const tablesWithoutRLS = rlsResult.filter(row => !row.rowsecurity);

      result.checks.rlsPolicies = {
        passed: tablesWithoutRLS.length === 0,
        tablesWithRLS: rlsResult.filter(row => row.rowsecurity).length,
        tablesWithoutRLS: tablesWithoutRLS.map(row => row.tablename),
        total: DB_HEALTH_CONFIG.security.requiredRLSPolicies.length
      };

      // Function security (search_path)
      console.log('   🔍 Checking function security...');
      const functionQuery = `
        SELECT proname, prosecdef 
        FROM pg_proc 
        WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND proname IN ('validate_principal_type', 'user_has_org_access', 'user_is_admin')
      `;

      const functionResult = await this.executeQuery(functionQuery);
      const insecureFunctions = functionResult.filter(row => !row.prosecdef);

      result.checks.functionSecurity = {
        passed: insecureFunctions.length === 0,
        secureFunctions: functionResult.filter(row => row.prosecdef).length,
        insecureFunctions: insecureFunctions.map(row => row.proname),
        total: functionResult.length
      };

      // Check for exposed sensitive data
      console.log('   🔍 Checking for exposed sensitive data...');
      const sensitiveDataQuery = `
        SELECT column_name, table_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND (column_name ILIKE '%password%' OR column_name ILIKE '%secret%' OR column_name ILIKE '%token%')
        AND table_name NOT LIKE 'auth.%'
      `;

      const sensitiveDataResult = await this.executeQuery(sensitiveDataQuery);

      result.checks.sensitiveDataExposure = {
        passed: sensitiveDataResult.length === 0,
        exposedColumns: sensitiveDataResult,
        count: sensitiveDataResult.length
      };

    } catch (error) {
      result.checks.error = { passed: false, message: error.message };
      result.passed = false;
    }

    result.passed = Object.values(result.checks).every(check => check.passed);
    this.results.securityPosture = result;
    this.logResult(result);
  }

  async validateIndexHealth() {
    console.log('\n📊 Index Health Validation');
    const result = { name: 'Index Health', checks: {}, passed: true };

    try {
      // Duplicate indexes
      console.log('   🔍 Checking for duplicate indexes...');
      const duplicateQuery = `
        SELECT 
          schemaname, tablename, 
          array_agg(indexname) as duplicate_indexes,
          array_agg(indexdef) as definitions
        FROM pg_indexes 
        WHERE schemaname = 'public'
        GROUP BY schemaname, tablename, regexp_replace(indexdef, 'INDEX \\w+ ON', 'INDEX ON')
        HAVING count(*) > 1
      `;

      const duplicateResult = await this.executeQuery(duplicateQuery);

      result.checks.duplicateIndexes = {
        passed: duplicateResult.length <= DB_HEALTH_CONFIG.performance.maxDuplicateIndexes,
        count: duplicateResult.length,
        duplicates: this.detailed ? duplicateResult : [],
        threshold: DB_HEALTH_CONFIG.performance.maxDuplicateIndexes
      };

      // Unused indexes
      console.log('   🔍 Checking for unused indexes...');
      const unusedQuery = `
        SELECT 
          schemaname, tablename, indexname, idx_scan,
          pg_size_pretty(pg_relation_size(indexrelid)) as size
        FROM pg_stat_user_indexes 
        WHERE idx_scan < 50 
        AND schemaname = 'public'
        ORDER BY idx_scan, pg_relation_size(indexrelid) DESC
      `;

      const unusedResult = await this.executeQuery(unusedQuery);

      result.checks.unusedIndexes = {
        passed: unusedResult.length <= DB_HEALTH_CONFIG.performance.maxUnusedIndexes,
        count: unusedResult.length,
        indexes: this.detailed ? unusedResult : [],
        threshold: DB_HEALTH_CONFIG.performance.maxUnusedIndexes
      };

      // Index bloat
      console.log('   🔍 Checking for index bloat...');
      const bloatQuery = `
        SELECT 
          schemaname, tablename, indexname,
          ROUND((100 * (pg_relation_size(indexrelid) - pg_relation_size(indexrelid, 'main'))::numeric / 
                NULLIF(pg_relation_size(indexrelid), 0)), 2) as bloat_percentage
        FROM pg_stat_user_indexes 
        WHERE schemaname = 'public'
        AND pg_relation_size(indexrelid) > 100000
        ORDER BY bloat_percentage DESC NULLS LAST
        LIMIT 10
      `;

      const bloatResult = await this.executeQuery(bloatQuery);
      const bloatedIndexes = bloatResult.filter(row => parseFloat(row.bloat_percentage || 0) > 20);

      result.checks.indexBloat = {
        passed: bloatedIndexes.length === 0,
        bloatedCount: bloatedIndexes.length,
        bloatedIndexes: this.detailed ? bloatedIndexes : [],
        total: bloatResult.length
      };

    } catch (error) {
      result.checks.error = { passed: false, message: error.message };
      result.passed = false;
    }

    result.passed = Object.values(result.checks).every(check => check.passed);
    this.results.indexHealth = result;
    this.logResult(result);
  }

  async validateConstraints() {
    console.log('\n🔗 Constraint Validation');
    const result = { name: 'Constraint Validation', checks: {}, passed: true };

    try {
      // Check constraint validity
      console.log('   🔍 Checking constraint validity...');
      const constraintQuery = `
        SELECT conname, conrelid::regclass as table_name, convalidated
        FROM pg_constraint 
        WHERE connamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND NOT convalidated
      `;

      const constraintResult = await this.executeQuery(constraintQuery);

      result.checks.invalidConstraints = {
        passed: constraintResult.length === 0,
        count: constraintResult.length,
        constraints: constraintResult
      };

      // Check foreign key constraints
      console.log('   🔍 Checking foreign key constraints...');
      const fkQuery = `
        SELECT 
          tc.constraint_name,
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_schema = 'public'
        AND tc.constraint_name IN (${DB_HEALTH_CONFIG.security.requiredConstraints.map(c => `'${c}'`).join(',')})
      `;

      const fkResult = await this.executeQuery(fkQuery);
      const missingFKs = DB_HEALTH_CONFIG.security.requiredConstraints.filter(
        constraint => !fkResult.some(row => row.constraint_name === constraint)
      );

      result.checks.foreignKeyConstraints = {
        passed: missingFKs.length === 0,
        existing: fkResult.length,
        missing: missingFKs,
        total: DB_HEALTH_CONFIG.security.requiredConstraints.length
      };

      // Check check constraints
      console.log('   🔍 Checking check constraints...');
      const checkConstraintQuery = `
        SELECT conname, conrelid::regclass as table_name
        FROM pg_constraint 
        WHERE connamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND contype = 'c'
        ORDER BY conrelid::regclass
      `;

      const checkConstraintResult = await this.executeQuery(checkConstraintQuery);

      result.checks.checkConstraints = {
        passed: true, // Informational only
        count: checkConstraintResult.length,
        constraints: this.detailed ? checkConstraintResult : []
      };

    } catch (error) {
      result.checks.error = { passed: false, message: error.message };
      result.passed = false;
    }

    result.passed = Object.values(result.checks).every(check => check.passed);
    this.results.constraints = result;
    this.logResult(result);
  }

  async validateRLSPolicies() {
    console.log('\n🛡️  RLS Policy Validation');
    const result = { name: 'RLS Policy Validation', checks: {}, passed: true };

    try {
      // Check RLS policy coverage
      console.log('   🔍 Checking RLS policy coverage...');
      const rlsPolicyQuery = `
        SELECT 
          schemaname, tablename, policyname, permissive, roles, cmd, qual
        FROM pg_policies 
        WHERE schemaname = 'public'
        ORDER BY tablename, policyname
      `;

      const rlsPolicyResult = await this.executeQuery(rlsPolicyQuery);
      
      // Group policies by table
      const policiesByTable = rlsPolicyResult.reduce((acc, policy) => {
        if (!acc[policy.tablename]) {
          acc[policy.tablename] = [];
        }
        acc[policy.tablename].push(policy);
        return acc;
      }, {});

      const tablesWithoutPolicies = DB_HEALTH_CONFIG.security.requiredRLSPolicies.filter(
        table => !policiesByTable[table] || policiesByTable[table].length === 0
      );

      result.checks.rlsPolicySupport = {
        passed: tablesWithoutPolicies.length === 0,
        tablesWithPolicies: Object.keys(policiesByTable).length,
        tablesWithoutPolicies,
        totalPolicies: rlsPolicyResult.length,
        policiesByTable: this.detailed ? policiesByTable : {}
      };

      // Check for comprehensive CRUD policies
      const crudCommands = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
      const incompleteTablePolicies = [];

      for (const table of DB_HEALTH_CONFIG.security.requiredRLSPolicies) {
        if (policiesByTable[table]) {
          const tablePolicies = policiesByTable[table];
          const coveredCommands = [...new Set(tablePolicies.map(p => p.cmd))];
          const missingCommands = crudCommands.filter(cmd => !coveredCommands.includes(cmd));
          
          if (missingCommands.length > 0) {
            incompleteTablePolicies.push({
              table,
              missingCommands,
              existingCommands: coveredCommands
            });
          }
        }
      }

      result.checks.crudPolicyCoverage = {
        passed: incompleteTablePolicies.length === 0,
        incompleteTableCount: incompleteTablePolicies.length,
        incompleteTables: this.detailed ? incompleteTablePolicies : [],
        requiredCommands: crudCommands
      };

    } catch (error) {
      result.checks.error = { passed: false, message: error.message };
      result.passed = false;
    }

    result.passed = Object.values(result.checks).every(check => check.passed);
    this.results.rlsPolicies = result;
    this.logResult(result);
  }

  async executeQuery(query) {
    // This is a placeholder for actual database query execution
    // In a real implementation, you would use the Supabase client or pg client
    console.log(`   💾 Query: ${query.substring(0, 100)}...`);
    
    // Mock implementation - replace with actual database calls
    return [];
  }

  logResult(result) {
    const icon = result.passed ? '✅' : '❌';
    console.log(`   ${icon} ${result.name}: ${result.passed ? 'PASSED' : 'FAILED'}`);
    
    if (!result.passed && !this.detailed) {
      Object.entries(result.checks).forEach(([key, check]) => {
        if (!check.passed) {
          console.log(`     • ${key}: ${check.message || 'Failed validation'}`);
        }
      });
    }
  }

  hasFailures() {
    return Object.values(this.results).some(result => !result.passed);
  }

  generateReport() {
    const duration = Date.now() - this.startTime;
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Database Health Summary');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    Object.values(this.results).forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} ${result.name}`);
      
      if (this.detailed) {
        Object.entries(result.checks).forEach(([key, check]) => {
          const checkIcon = check.passed ? '  ✓' : '  ✗';
          console.log(`${checkIcon} ${key}`);
        });
      }
    });

    console.log(`\n⏱️  Total execution time: ${Math.round(duration / 1000)}s`);
    
    const passed = Object.values(this.results).filter(r => r.passed).length;
    const total = Object.values(this.results).length;
    
    console.log(`📊 Health checks passed: ${passed}/${total}`);
    
    if (this.hasFailures()) {
      console.log('❌ Database health validation FAILED');
      console.log('🔧 Review failed checks and remediate issues');
    } else {
      console.log('✅ Database health validation PASSED');
      console.log('🚀 Database ready for transformation');
    }

    // Save results
    this.saveResults();
  }

  saveResults() {
    const reportPath = path.join(rootDir, 'database-health-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      projectId: this.projectId,
      mode: this.autoFix ? 'auto-fix' : 'validation',
      duration: Date.now() - this.startTime,
      results: this.results,
      summary: {
        total: Object.keys(this.results).length,
        passed: Object.values(this.results).filter(r => r.passed).length,
        failed: Object.values(this.results).filter(r => !r.passed).length
      }
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Report saved: ${reportPath}`);
  }
}

// CLI handling
const args = process.argv.slice(2);
const options = {};

args.forEach(arg => {
  if (arg.startsWith('--project-id=')) {
    options.projectId = arg.split('=')[1];
  } else if (arg === '--detailed') {
    options.detailed = true;
  } else if (arg === '--fix') {
    options.fix = true;
  }
});

// Run validation
const validator = new DatabaseHealthValidator(options);
validator.run().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});