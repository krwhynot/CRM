/**
 * Enhanced CSS Variable Tree-Shaking Optimization Script
 *
 * Advanced tree-shaking algorithm that analyzes CSS variable usage across the entire codebase
 * and eliminates unused design tokens in production builds. This enhanced version includes:
 * - Dependency graph analysis for CSS variable relationships
 * - OKLCH to HSL variable detection and preservation
 * - Smart semantic token preservation
 * - Enhanced performance with caching
 * - Integration with Vite's rollup configuration
 *
 * Features:
 * - Scans TypeScript/JavaScript/CSS files for var() usage
 * - Analyzes CSS variable dependencies and references
 * - Identifies unused CSS variables in design token files
 * - Preserves critical variables, dependencies, and semantic mappings
 * - Generates optimized CSS with only used variables
 * - Reports detailed optimization metrics with performance impact
 * - Caches analysis results for faster subsequent builds
 */

import fs from 'fs';
import path from 'path';

/**
 * Native file globbing implementation to avoid external dependencies
 */
function globFiles(patterns, baseDir = process.cwd()) {
  const results = [];
  
  function walkDirectory(dir, pattern) {
    try {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        const relativePath = path.relative(baseDir, fullPath);
        
        if (stat.isDirectory()) {
          walkDirectory(fullPath, pattern);
        } else {
          // Simple pattern matching for common file extensions
          if (pattern.includes('**/*')) {
            const extensions = pattern.split('{')[1]?.split('}')[0]?.split(',') || [];
            const fileExt = path.extname(file);
            
            if (extensions.some(ext => fileExt === `.${ext.trim()}`)) {
              results.push(relativePath);
            }
          } else if (file.match(new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.')))) {
            results.push(relativePath);
          }
        }
      }
    } catch (error) {
      // Ignore permission errors and continue
    }
  }
  
  // Handle multiple patterns
  const allPatterns = Array.isArray(patterns) ? patterns : [patterns];
  
  for (const pattern of allPatterns) {
    if (pattern.includes('**/*')) {
      // Handle recursive patterns
      const basePattern = pattern.split('**')[0];
      const startDir = path.join(baseDir, basePattern || '');
      
      if (fs.existsSync(startDir)) {
        walkDirectory(startDir, pattern);
      }
    } else {
      // Handle simple patterns
      walkDirectory(baseDir, pattern);
    }
  }
  
  return [...new Set(results)]; // Remove duplicates
}

/**
 * Enhanced configuration for CSS variable analysis
 */
const CONFIG = {
  // Directories to scan for CSS variable usage
  scanDirs: [
    'src/**/*.{ts,tsx,js,jsx,css,scss}',
    'src/components/**/*.{ts,tsx}',
    'src/features/**/*.{ts,tsx}',
    'src/styles/**/*.css'
  ],

  // Design token files to optimize
  tokenFiles: [
    'src/styles/tokens/primitives.css',
    'src/styles/tokens/semantic.css'
  ],

  // Variables that should never be removed (critical fallbacks and shadcn/ui)
  preserveVariables: [
    // Core shadcn/ui variables
    '--background',
    '--foreground',
    '--card',
    '--card-foreground',
    '--popover',
    '--popover-foreground',
    '--primary',
    '--primary-foreground',
    '--secondary',
    '--secondary-foreground',
    '--muted',
    '--muted-foreground',
    '--accent',
    '--accent-foreground',
    '--destructive',
    '--destructive-foreground',
    '--border',
    '--input',
    '--ring',
    '--radius',
    
    // Enhanced design system variables
    '--warning',
    '--warning-foreground',
    '--info',
    '--info-foreground',
    '--success',
    '--success-foreground',
    
    // Brand system variables (always preserve core brand tokens)
    '--brand-primary',
    '--brand-secondary',
    '--brand-accent',
    
    // Typography and layout fundamentals
    '--font-sans',
    '--font-mono',
    '--text-xs',
    '--text-sm',
    '--text-base',
    '--text-lg',
    '--text-xl',
    '--spacing-xs',
    '--spacing-sm',
    '--spacing-md',
    '--spacing-lg',
    '--spacing-xl'
  ],

  // Patterns for HSL fallback variables that should be preserved
  hslFallbackPatterns: [
    /-hsl$/,
    /-h$/,
    /-s$/,
    /-l$/
  ],

  // Patterns for dependency analysis
  dependencyPatterns: {
    varReferences: /var\(\s*(--[a-zA-Z0-9-_]+)(?:\s*,\s*([^)]+))?\)/g,
    cssProperties: /--([a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g,
    classUtilities: /(?:bg-|text-|border-|ring-|shadow-|from-|to-|via-)([a-zA-Z0-9-_]+)/g
  },

  // Output configuration
  outputDir: 'dist/optimized-tokens',
  cacheFile: '.css-optimization-cache.json',
  
  // Performance settings
  enableCaching: true,
  parallelProcessing: true,
  
  // Debug and logging
  debug: process.env.NODE_ENV === 'development' || process.argv.includes('--debug'),
  verbose: process.argv.includes('--verbose')
};

/**
 * Cache management for performance optimization
 */
class OptimizationCache {
  constructor(cacheFile) {
    this.cacheFile = cacheFile;
    this.cache = this.loadCache();
  }

  loadCache() {
    try {
      if (fs.existsSync(this.cacheFile)) {
        return JSON.parse(fs.readFileSync(this.cacheFile, 'utf8'));
      }
    } catch (error) {
      if (CONFIG.debug) {
        console.warn(`⚠️  Could not load cache: ${error.message}`);
      }
    }
    return { fileHashes: {}, analysisResults: {} };
  }

  saveCache() {
    try {
      fs.writeFileSync(this.cacheFile, JSON.stringify(this.cache, null, 2));
    } catch (error) {
      if (CONFIG.debug) {
        console.warn(`⚠️  Could not save cache: ${error.message}`);
      }
    }
  }

  getFileHash(filePath) {
    try {
      const stats = fs.statSync(filePath);
      return `${stats.mtime.getTime()}-${stats.size}`;
    } catch (error) {
      return null;
    }
  }

  isCached(filePath) {
    const hash = this.getFileHash(filePath);
    return hash && this.cache.fileHashes[filePath] === hash;
  }

  setCacheEntry(filePath, data) {
    const hash = this.getFileHash(filePath);
    if (hash) {
      this.cache.fileHashes[filePath] = hash;
      this.cache.analysisResults[filePath] = data;
    }
  }

  getCacheEntry(filePath) {
    return this.cache.analysisResults[filePath];
  }
}

/**
 * Advanced CSS variable dependency analyzer
 */
class DependencyAnalyzer {
  constructor() {
    this.dependencies = new Map();
    this.reverseDependencies = new Map();
  }

  /**
   * Analyze CSS content to build dependency graph
   */
  analyzeDependencies(cssContent, filename) {
    const dependencies = new Set();
    
    // Find all CSS variable definitions and their dependencies
    const matches = cssContent.matchAll(CONFIG.dependencyPatterns.cssProperties);
    
    for (const match of matches) {
      const varName = `--${match[1]}`;
      const value = match[2];
      
      // Find var() references in the value
      const varRefs = value.matchAll(CONFIG.dependencyPatterns.varReferences);
      const varDeps = new Set();
      
      for (const varRef of varRefs) {
        const referencedVar = varRef[1];
        varDeps.add(referencedVar);
        dependencies.add(referencedVar);
      }
      
      this.dependencies.set(varName, varDeps);
      
      // Build reverse dependency map
      for (const dep of varDeps) {
        if (!this.reverseDependencies.has(dep)) {
          this.reverseDependencies.set(dep, new Set());
        }
        this.reverseDependencies.get(dep).add(varName);
      }
    }
    
    return dependencies;
  }

  /**
   * Get all variables that depend on a given variable (recursively)
   */
  getDependents(varName) {
    const dependents = new Set();
    const visited = new Set();
    
    const traverse = (name) => {
      if (visited.has(name)) return;
      visited.add(name);
      
      if (this.reverseDependencies.has(name)) {
        for (const dependent of this.reverseDependencies.get(name)) {
          dependents.add(dependent);
          traverse(dependent);
        }
      }
    };
    
    traverse(varName);
    return dependents;
  }

  /**
   * Get all variables that a given variable depends on (recursively)
   */
  getDependencies(varName) {
    const dependencies = new Set();
    const visited = new Set();
    
    const traverse = (name) => {
      if (visited.has(name)) return;
      visited.add(name);
      
      if (this.dependencies.has(name)) {
        for (const dependency of this.dependencies.get(name)) {
          dependencies.add(dependency);
          traverse(dependency);
        }
      }
    };
    
    traverse(varName);
    return dependencies;
  }
}

/**
 * Enhanced CSS variable usage extractor with caching
 */
function extractUsedVariables(cache) {
  const usedVariables = new Set();
  const dependencyAnalyzer = new DependencyAnalyzer();
  
  // Add preserved variables
  CONFIG.preserveVariables.forEach(variable => {
    usedVariables.add(variable);
  });

  try {
    const files = globFiles(CONFIG.scanDirs);

    if (CONFIG.debug) {
      console.log(`🔍 Scanning ${files.length} files for CSS variable usage...`);
    }

    const processFile = (file) => {
      // Check cache first
      if (CONFIG.enableCaching && cache.isCached(file)) {
        const cached = cache.getCacheEntry(file);
        if (cached && cached.usedVariables) {
          cached.usedVariables.forEach(variable => usedVariables.add(variable));
          return;
        }
      }

      try {
        const content = fs.readFileSync(file, 'utf8');
        const fileUsedVars = new Set();

        // Match var(--variable-name) patterns with enhanced regex
        const varMatches = content.matchAll(CONFIG.dependencyPatterns.varReferences);
        for (const match of varMatches) {
          const varName = match[1];
          usedVariables.add(varName);
          fileUsedVars.add(varName);
        }

        // Match CSS custom property definitions
        const propMatches = content.matchAll(CONFIG.dependencyPatterns.cssProperties);
        for (const match of propMatches) {
          const varName = `--${match[1]}`;
          usedVariables.add(varName);
          fileUsedVars.add(varName);
        }

        // Enhanced utility class matching for semantic tokens
        const classMatches = content.matchAll(CONFIG.dependencyPatterns.classUtilities);
        for (const match of classMatches) {
          const className = match[1];
          // Convert common utility classes to potential variable names
          const potentialVars = [
            `--${className}`,
            `--${className.replace(/-/g, '-')}`,
            `--color-${className}`,
            `--semantic-${className}`
          ];
          
          potentialVars.forEach(varName => {
            usedVariables.add(varName);
            fileUsedVars.add(varName);
          });
        }

        // Analyze dependencies for CSS files
        if (file.endsWith('.css')) {
          dependencyAnalyzer.analyzeDependencies(content, file);
        }

        // Cache the results
        if (CONFIG.enableCaching) {
          cache.setCacheEntry(file, {
            usedVariables: Array.from(fileUsedVars),
            timestamp: Date.now()
          });
        }

      } catch (error) {
        if (CONFIG.debug) {
          console.warn(`⚠️  Could not read file ${file}: ${error.message}`);
        }
      }
    };

    // Process files
    files.forEach(processFile);

    // Add variables that have dependencies on used variables
    const finalUsedVars = new Set(usedVariables);
    for (const usedVar of usedVariables) {
      const dependencies = dependencyAnalyzer.getDependencies(usedVar);
      dependencies.forEach(dep => finalUsedVars.add(dep));
      
      const dependents = dependencyAnalyzer.getDependents(usedVar);
      dependents.forEach(dep => finalUsedVars.add(dep));
    }

    // Preserve HSL fallback variables for OKLCH variables that are used
    for (const variable of finalUsedVars) {
      CONFIG.hslFallbackPatterns.forEach(pattern => {
        if (!pattern.test(variable)) {
          const hslVar = `${variable}-hsl`;
          if (fs.existsSync('src/styles/tokens/primitives.css')) {
            const content = fs.readFileSync('src/styles/tokens/primitives.css', 'utf8');
            if (content.includes(hslVar)) {
              finalUsedVars.add(hslVar);
            }
          }
        }
      });
    }

    if (CONFIG.debug) {
      console.log(`✅ Found ${finalUsedVars.size} unique CSS variables in use`);
      if (CONFIG.verbose) {
        console.log(`   Dependency analysis added ${finalUsedVars.size - usedVariables.size} dependent variables`);
      }
    }

    return { usedVariables: finalUsedVars, dependencyAnalyzer };

  } catch (error) {
    console.error(`❌ Error extracting used variables: ${error.message}`);
    return { usedVariables, dependencyAnalyzer };
  }
}

/**
 * Enhanced CSS content optimization with dependency preservation
 */
function optimizeCssContent(cssContent, usedVariables, dependencyAnalyzer, filename) {
  const definedVariables = new Map();
  const unusedVariables = [];
  const preservedCount = { used: 0, preserved: 0, removed: 0, dependencies: 0 };

  // Extract all CSS variable definitions
  const matches = cssContent.matchAll(CONFIG.dependencyPatterns.cssProperties);
  for (const match of matches) {
    const varName = `--${match[1]}`;
    const fullDefinition = match[0];
    definedVariables.set(varName, fullDefinition);
  }

  let optimizedContent = cssContent;

  // Analyze each defined variable
  for (const [varName, definition] of definedVariables) {
    const isUsed = usedVariables.has(varName);
    const isPreserved = CONFIG.preserveVariables.includes(varName);
    const isHslFallback = CONFIG.hslFallbackPatterns.some(pattern => pattern.test(varName));
    const hasDependents = dependencyAnalyzer.getDependents(varName).size > 0;

    if (!isUsed && !isPreserved && !isHslFallback && !hasDependents) {
      // Remove the variable definition with improved regex
      const escapedVarName = varName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const regex = new RegExp(`\\s*${escapedVarName}\\s*:\\s*[^;]+;\\s*`, 'g');
      optimizedContent = optimizedContent.replace(regex, '');
      unusedVariables.push(varName);
      preservedCount.removed++;
    } else if (isUsed) {
      preservedCount.used++;
    } else if (hasDependents) {
      preservedCount.dependencies++;
    } else {
      preservedCount.preserved++;
    }
  }

  // Clean up formatting
  optimizedContent = optimizedContent
    // Remove comments for removed variables
    .replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\/\s*(?=\s*\/\*|$)/g, '')
    // Normalize whitespace
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // Clean up excessive spacing around variable definitions
    .replace(/(\s*--[^:]+:\s*[^;]+;)\s+/g, '$1\n  ');

  if (CONFIG.debug) {
    console.log(`📄 ${filename}:`);
    console.log(`   Used: ${preservedCount.used}`);
    console.log(`   Preserved: ${preservedCount.preserved}`);
    console.log(`   Dependencies: ${preservedCount.dependencies}`);
    console.log(`   Removed: ${preservedCount.removed}`);
    
    if (CONFIG.verbose && unusedVariables.length > 0) {
      console.log(`   Unused variables: ${unusedVariables.slice(0, 5).join(', ')}${unusedVariables.length > 5 ? ` ... (+${unusedVariables.length - 5} more)` : ''}`);
    }
  }

  return {
    optimizedContent,
    unusedVariables,
    metrics: preservedCount
  };
}

/**
 * Enhanced optimization report with performance metrics
 */
function generateReport(results, outputPath, processingTime) {
  const totalMetrics = {
    files: results.length,
    originalSize: 0,
    optimizedSize: 0,
    totalVariables: 0,
    usedVariables: 0,
    removedVariables: 0,
    preservedVariables: 0,
    dependencyVariables: 0,
    processingTimeMs: processingTime
  };

  const report = {
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    summary: totalMetrics,
    performance: {
      processingTimeMs: processingTime,
      filesPerSecond: Math.round((results.length / processingTime) * 1000),
      bytesProcessedPerSecond: 0,
      optimizationRatio: 0
    },
    files: results.map(result => ({
      filename: result.filename,
      originalSize: result.originalSize,
      optimizedSize: result.optimizedSize,
      savings: result.originalSize - result.optimizedSize,
      savingsPercent: Math.round(((result.originalSize - result.optimizedSize) / result.originalSize) * 100),
      metrics: result.metrics,
      unusedVariables: result.unusedVariables.slice(0, 10),
      optimization: {
        effectiveReduction: result.originalSize > 0 ? ((result.originalSize - result.optimizedSize) / result.originalSize) : 0,
        variableReduction: (result.metrics.removed / (result.metrics.used + result.metrics.removed + result.metrics.preserved)) || 0
      }
    }))
  };

  // Calculate totals and performance metrics
  results.forEach(result => {
    totalMetrics.originalSize += result.originalSize;
    totalMetrics.optimizedSize += result.optimizedSize;
    totalMetrics.usedVariables += result.metrics.used;
    totalMetrics.removedVariables += result.metrics.removed;
    totalMetrics.preservedVariables += result.metrics.preserved;
    totalMetrics.dependencyVariables += result.metrics.dependencies || 0;
    totalMetrics.totalVariables += result.metrics.used + result.metrics.removed + result.metrics.preserved + (result.metrics.dependencies || 0);
  });

  report.performance.bytesProcessedPerSecond = Math.round((totalMetrics.originalSize / processingTime) * 1000);
  report.performance.optimizationRatio = totalMetrics.originalSize > 0 ? (totalMetrics.optimizedSize / totalMetrics.originalSize) : 1;

  const reportPath = path.join(outputPath, 'optimization-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Generate summary report for CI/CD
  const summaryPath = path.join(outputPath, 'optimization-summary.txt');
  const summary = `CSS Variable Tree-Shaking Results
=====================================
Files Processed: ${totalMetrics.files}
Variables Analyzed: ${totalMetrics.totalVariables}
Variables Preserved: ${totalMetrics.usedVariables + totalMetrics.preservedVariables + totalMetrics.dependencyVariables}
Variables Removed: ${totalMetrics.removedVariables}
Size Reduction: ${totalMetrics.originalSize - totalMetrics.optimizedSize} bytes (${Math.round(((totalMetrics.originalSize - totalMetrics.optimizedSize) / totalMetrics.originalSize) * 100)}%)
Processing Time: ${processingTime}ms
Performance: ${report.performance.filesPerSecond} files/sec, ${Math.round(report.performance.bytesProcessedPerSecond / 1024)}KB/sec`;

  fs.writeFileSync(summaryPath, summary);

  return report;
}

/**
 * Main enhanced optimization function
 */
async function optimizeCssVariables(options = {}) {
  const startTime = Date.now();
  const config = { ...CONFIG, ...options };
  const cache = CONFIG.enableCaching ? new OptimizationCache(config.cacheFile) : null;

  try {
    console.log('🚀 Starting enhanced CSS variable tree-shaking analysis...');

    // Extract used variables with dependency analysis
    const { usedVariables, dependencyAnalyzer } = extractUsedVariables(cache);

    // Ensure output directory exists
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }

    const results = [];

    // Process each token file
    for (const tokenFile of config.tokenFiles) {
      if (!fs.existsSync(tokenFile)) {
        if (config.debug) {
          console.warn(`⚠️  Token file not found: ${tokenFile}`);
        }
        continue;
      }

      const originalContent = fs.readFileSync(tokenFile, 'utf8');
      const filename = path.basename(tokenFile);

      const optimization = optimizeCssContent(
        originalContent, 
        usedVariables, 
        dependencyAnalyzer, 
        filename
      );

      // Write optimized file
      const outputPath = path.join(config.outputDir, filename);
      fs.writeFileSync(outputPath, optimization.optimizedContent);

      results.push({
        filename,
        originalSize: originalContent.length,
        optimizedSize: optimization.optimizedContent.length,
        unusedVariables: optimization.unusedVariables,
        metrics: optimization.metrics
      });
    }

    const processingTime = Date.now() - startTime;

    // Save cache
    if (cache) {
      cache.saveCache();
    }

    // Generate enhanced report
    const report = generateReport(results, config.outputDir, processingTime);

    if (config.debug) {
      console.log('\n📊 Enhanced Optimization Summary:');
      console.log(`   Files processed: ${report.summary.files}`);
      console.log(`   Total variables: ${report.summary.totalVariables}`);
      console.log(`   Used variables: ${report.summary.usedVariables}`);
      console.log(`   Dependency variables: ${report.summary.dependencyVariables}`);
      console.log(`   Removed variables: ${report.summary.removedVariables}`);
      console.log(`   Size reduction: ${report.summary.originalSize - report.summary.optimizedSize} bytes`);
      console.log(`   Processing time: ${processingTime}ms`);
      console.log(`   Performance: ${report.performance.filesPerSecond} files/sec`);
      console.log(`   Optimized files saved to: ${config.outputDir}`);
    }

    return {
      success: true,
      report,
      optimizedFiles: results.map(r => path.join(config.outputDir, r.filename)),
      metrics: report.summary,
      processingTime
    };

  } catch (error) {
    console.error('❌ Enhanced CSS optimization failed:', error.message);
    if (CONFIG.debug) {
      console.error(error.stack);
    }
    return {
      success: false,
      error: error.message,
      processingTime: Date.now() - startTime
    };
  }
}

/**
 * Enhanced Vite plugin integration with performance optimizations
 */
function createCssTreeShakingPlugin(options = {}) {
  let cachedResults = null;
  let isOptimizing = false;

  return {
    name: 'enhanced-css-variable-tree-shaking',

    async buildStart() {
      if (options.mode === 'production' && !isOptimizing) {
        isOptimizing = true;
        console.log('🚀 Starting enhanced CSS variable tree-shaking analysis...');
        
        const startTime = Date.now();
        cachedResults = await optimizeCssVariables(options);
        
        if (cachedResults.success) {
          const duration = Date.now() - startTime;
          console.log(`✅ Enhanced CSS optimization complete in ${duration}ms`);
          console.log(`   📊 Removed ${cachedResults.metrics.removedVariables} unused variables`);
          console.log(`   💾 Saved ${cachedResults.metrics.originalSize - cachedResults.metrics.optimizedSize} bytes`);
          console.log(`   📁 Optimized files saved to ${options.outputDir || CONFIG.outputDir}`);
        } else {
          console.error('❌ Enhanced CSS optimization failed:', cachedResults.error);
        }
        
        isOptimizing = false;
      }
    },

    generateBundle(options, bundle) {
      if (options.mode === 'production' && cachedResults?.success) {
        let appliedOptimizations = 0;
        
        // Replace original CSS files with optimized versions in the bundle
        Object.keys(bundle).forEach(fileName => {
          const chunk = bundle[fileName];
          if (chunk.type === 'asset' && fileName.endsWith('.css')) {
            // Try to find corresponding optimized file
            const optimizedFile = cachedResults.optimizedFiles.find(f =>
              path.basename(f) === path.basename(fileName)
            );

            if (optimizedFile && fs.existsSync(optimizedFile)) {
              const originalSize = chunk.source.length;
              chunk.source = fs.readFileSync(optimizedFile, 'utf8');
              const newSize = chunk.source.length;
              
              console.log(`🎯 Applied tree-shaking to ${fileName} (${originalSize} → ${newSize} bytes, -${Math.round(((originalSize - newSize) / originalSize) * 100)}%)`);
              appliedOptimizations++;
            }
          }
        });
        
        if (appliedOptimizations > 0) {
          console.log(`✨ Applied optimizations to ${appliedOptimizations} CSS bundle(s)`);
        }
      }
    }
  };
}

// CLI usage with enhanced argument parsing
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const debug = args.includes('--debug');
  const verbose = args.includes('--verbose');
  const outputDir = args.find(arg => arg.startsWith('--output='))?.split('=')[1] || CONFIG.outputDir;
  const enableCaching = !args.includes('--no-cache');

  optimizeCssVariables({ 
    debug, 
    verbose, 
    outputDir, 
    enableCaching 
  })
    .then(result => {
      if (result.success) {
        console.log('✅ Enhanced CSS variable optimization completed successfully');
        console.log(`📊 Processed ${result.metrics.files} files in ${result.processingTime}ms`);
        process.exit(0);
      } else {
        console.error('❌ Enhanced CSS variable optimization failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Unexpected error:', error.message);
      process.exit(1);
    });
}

export {
  optimizeCssVariables,
  createCssTreeShakingPlugin,
  extractUsedVariables,
  optimizeCssContent,
  DependencyAnalyzer,
  OptimizationCache
};