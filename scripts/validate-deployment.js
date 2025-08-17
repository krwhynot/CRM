#!/usr/bin/env node

/**
 * Deployment Validation Script
 * Validates the CRM application deployment
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DeploymentValidator {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.results = [];
  }

  async validateEndpoint(endpoint, expectedStatus = 200) {
    return new Promise((resolve) => {
      const url = `${this.baseUrl}${endpoint}`;
      console.log(`🔍 Validating: ${url}`);
      
      const startTime = Date.now();
      const req = https.get(url, (res) => {
        const duration = Date.now() - startTime;
        const success = res.statusCode === expectedStatus;
        
        this.results.push({
          endpoint,
          status: res.statusCode,
          duration,
          success,
          headers: res.headers
        });

        console.log(`${success ? '✅' : '❌'} ${endpoint}: ${res.statusCode} (${duration}ms)`);
        resolve({ success, status: res.statusCode, duration });
      });

      req.on('error', (error) => {
        console.log(`❌ ${endpoint}: Error - ${error.message}`);
        this.results.push({
          endpoint,
          status: 'ERROR',
          duration: 0,
          success: false,
          error: error.message
        });
        resolve({ success: false, error: error.message });
      });

      req.setTimeout(10000, () => {
        req.destroy();
        console.log(`❌ ${endpoint}: Timeout`);
        resolve({ success: false, error: 'Timeout' });
      });
    });
  }

  validateSecurityHeaders(headers) {
    const requiredHeaders = [
      'x-content-type-options',
      'x-frame-options', 
      'x-xss-protection',
      'referrer-policy'
    ];

    const security = {
      score: 0,
      total: requiredHeaders.length,
      missing: []
    };

    requiredHeaders.forEach(header => {
      if (headers[header]) {
        security.score++;
      } else {
        security.missing.push(header);
      }
    });

    return security;
  }

  async validateBuild() {
    console.log('\n📦 Validating Build Assets...');
    
    const distPath = path.join(path.dirname(__dirname), 'dist');
    if (!fs.existsSync(distPath)) {
      console.log('❌ Build directory not found');
      return false;
    }

    const indexPath = path.join(distPath, 'index.html');
    if (!fs.existsSync(indexPath)) {
      console.log('❌ index.html not found in build');
      return false;
    }

    const assetsPath = path.join(distPath, 'assets');
    if (!fs.existsSync(assetsPath)) {
      console.log('❌ Assets directory not found');
      return false;
    }

    const assets = fs.readdirSync(assetsPath);
    const jsFiles = assets.filter(f => f.endsWith('.js'));
    const cssFiles = assets.filter(f => f.endsWith('.css'));

    console.log(`✅ Build validation complete:`);
    console.log(`   - JavaScript files: ${jsFiles.length}`);
    console.log(`   - CSS files: ${cssFiles.length}`);
    console.log(`   - Total assets: ${assets.length}`);

    return true;
  }

  async validateEnvironment() {
    console.log('\n🔧 Validating Environment...');
    
    const requiredEnvVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];

    let envValid = true;
    
    requiredEnvVars.forEach(varName => {
      if (process.env[varName]) {
        console.log(`✅ ${varName}: configured`);
      } else {
        console.log(`❌ ${varName}: missing`);
        envValid = false;
      }
    });

    return envValid;
  }

  async run() {
    console.log('🚀 Starting Deployment Validation...\n');
    
    // Validate build
    const buildValid = await this.validateBuild();
    
    // Validate environment (if running locally)
    const envValid = await this.validateEnvironment();
    
    if (!this.baseUrl) {
      console.log('\n⚠️  No base URL provided. Skipping live endpoint validation.');
      console.log('Usage: node validate-deployment.js https://your-app.vercel.app');
      return;
    }

    // Validate endpoints
    console.log(`\n🌐 Validating Live Endpoints for: ${this.baseUrl}`);
    
    const endpoints = [
      '/',
      '/health.json',
      '/auth/login',
      '/dashboard',
      '/organizations',
      '/contacts'
    ];

    for (const endpoint of endpoints) {
      await this.validateEndpoint(endpoint);
    }

    // Analyze results
    console.log('\n📊 Validation Summary:');
    const successful = this.results.filter(r => r.success).length;
    const total = this.results.length;
    const avgDuration = this.results
      .filter(r => r.duration > 0)
      .reduce((sum, r) => sum + r.duration, 0) / total;

    console.log(`   - Success Rate: ${successful}/${total} (${Math.round(successful/total*100)}%)`);
    console.log(`   - Average Response Time: ${Math.round(avgDuration)}ms`);

    // Security headers check
    const mainPageResult = this.results.find(r => r.endpoint === '/');
    if (mainPageResult && mainPageResult.headers) {
      const security = this.validateSecurityHeaders(mainPageResult.headers);
      console.log(`   - Security Headers: ${security.score}/${security.total}`);
      if (security.missing.length > 0) {
        console.log(`     Missing: ${security.missing.join(', ')}`);
      }
    }

    const allPassed = buildValid && envValid && successful === total;
    console.log(`\n${allPassed ? '🎉' : '⚠️'} Deployment Validation ${allPassed ? 'PASSED' : 'NEEDS ATTENTION'}`);
    
    return allPassed;
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const baseUrl = process.argv[2];
  const validator = new DeploymentValidator(baseUrl);
  validator.run().catch(console.error);
}

export default DeploymentValidator;