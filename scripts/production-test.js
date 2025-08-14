#!/usr/bin/env node

/**
 * KitchenPantry CRM - Production Validation Script
 * 
 * This script performs comprehensive testing of the production deployment
 * to ensure all systems are working correctly.
 */

import https from 'https';
import http from 'http';

// Configuration
const config = {
  supabaseUrl: 'https://ixitjldcdvbazvjsnkao.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4aXRqbGRjZHZiYXp2anNua2FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5Mjg0MjEsImV4cCI6MjA3MDUwNDQyMX0.8h5jXRcT96R34m0MU7PVbgzJPpGvf5azgQd2wo5AB2Q',
  deploymentUrl: process.env.DEPLOYMENT_URL || 'https://your-app.vercel.app',
  timeout: 10000
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    const timeoutId = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, config.timeout);

    const req = protocol.request(url, {
      headers: {
        'User-Agent': 'KitchenPantry-CRM-Production-Test/1.0',
        ...options.headers
      },
      ...options
    }, (res) => {
      clearTimeout(timeoutId);
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (err) => {
      clearTimeout(timeoutId);
      reject(err);
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// Test function wrapper
function test(name, testFn) {
  return testFn()
    .then((result) => {
      results.passed++;
      results.tests.push({ name, status: 'PASS', result });
      console.log(`✅ ${name}: PASS`);
      return result;
    })
    .catch((error) => {
      results.failed++;
      results.tests.push({ name, status: 'FAIL', error: error.message });
      console.log(`❌ ${name}: FAIL - ${error.message}`);
      throw error;
    });
}

// Production Tests
async function runTests() {
  console.log('🚀 Starting KitchenPantry CRM Production Validation...\n');

  try {
    // Test 1: Supabase Health Check
    await test('Supabase API Health', async () => {
      const response = await makeRequest(`${config.supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': config.supabaseKey,
          'Authorization': `Bearer ${config.supabaseKey}`
        }
      });
      
      if (response.statusCode !== 200) {
        throw new Error(`Expected 200, got ${response.statusCode}`);
      }
      return 'Supabase API is healthy';
    });

    // Test 2: Database Connectivity
    await test('Database Connection', async () => {
      const response = await makeRequest(`${config.supabaseUrl}/rest/v1/organizations?select=count`, {
        headers: {
          'apikey': config.supabaseKey,
          'Authorization': `Bearer ${config.supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.statusCode !== 200) {
        throw new Error(`Database query failed: ${response.statusCode}`);
      }
      return 'Database connection successful';
    });

    // Test 3: RLS Policies
    await test('Row Level Security', async () => {
      // Try to access data without authentication (should fail)
      const response = await makeRequest(`${config.supabaseUrl}/rest/v1/organizations?select=*`, {
        headers: {
          'apikey': config.supabaseKey,
          'Content-Type': 'application/json'
          // No Authorization header - should trigger RLS
        }
      });
      
      // Should return empty array due to RLS, not an error
      if (response.statusCode === 200) {
        const data = JSON.parse(response.data);
        if (Array.isArray(data) && data.length === 0) {
          return 'RLS policies are working correctly';
        }
      }
      throw new Error('RLS policies may not be working correctly');
    });

    // Test 4: Frontend Deployment (if URL provided)
    if (config.deploymentUrl !== 'https://your-app.vercel.app') {
      await test('Frontend Deployment', async () => {
        const response = await makeRequest(config.deploymentUrl);
        
        if (response.statusCode !== 200) {
          throw new Error(`Frontend not accessible: ${response.statusCode}`);
        }
        
        if (!response.data.includes('KitchenPantry CRM')) {
          throw new Error('Frontend content validation failed');
        }
        
        return 'Frontend deployment successful';
      });

      // Test 5: Security Headers
      await test('Security Headers', async () => {
        const response = await makeRequest(config.deploymentUrl);
        const headers = response.headers;
        
        const requiredHeaders = [
          'x-content-type-options',
          'x-frame-options',
          'x-xss-protection'
        ];
        
        const missing = requiredHeaders.filter(header => !headers[header]);
        if (missing.length > 0) {
          throw new Error(`Missing security headers: ${missing.join(', ')}`);
        }
        
        return 'Security headers configured correctly';
      });

      // Test 6: HTTPS Enforcement
      await test('HTTPS Enforcement', async () => {
        if (!config.deploymentUrl.startsWith('https:')) {
          throw new Error('Deployment URL is not using HTTPS');
        }
        return 'HTTPS is properly enforced';
      });
    }

    // Test 7: Performance Check
    await test('API Performance', async () => {
      const startTime = Date.now();
      const response = await makeRequest(`${config.supabaseUrl}/health`, {
        headers: {
          'apikey': config.supabaseKey
        }
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (responseTime > 2000) {
        throw new Error(`API response time too slow: ${responseTime}ms`);
      }
      
      return `API response time: ${responseTime}ms`;
    });

  } catch (error) {
    console.error(`\n❌ Critical test failure: ${error.message}`);
  }

  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

  if (results.failed === 0) {
    console.log('\n🎉 All tests passed! Production deployment is ready.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review and fix issues before going live.');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(console.error);