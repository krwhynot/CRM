/**
 * Cross-Platform Design Token Export Tool
 *
 * Exports design tokens from KitchenPantry CRM to various formats for
 * cross-platform development, design tools, and third-party integrations.
 *
 * Supported Export Formats:
 * - JSON (Web/React Native)
 * - Style Dictionary format
 * - Figma Tokens format
 * - iOS (Swift/Objective-C)
 * - Android (XML/Kotlin)
 * - CSS Custom Properties
 * - SCSS Variables
 * - Tailwind Config
 *
 * Usage:
 *   node scripts/export-design-tokens.js [options]
 *
 * Options:
 *   --format <format>      Export format (json|figma|ios|android|css|scss|tailwind|all)
 *   --output <path>        Output directory (default: ./build/tokens/)
 *   --platform <platform>  Target platform (web|mobile|desktop|all)
 *   --theme <theme>        Theme variant (light|dark|all)
 *   --validate            Validate exports after generation
 *   --watch               Watch for changes and re-export
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// Export configuration
const CONFIG = {
  // Source files containing design tokens
  sourceFiles: [
    'src/index.css',
    'src/styles/accessibility-tokens.css',
    'src/styles/component-tokens.css',
    'src/styles/advanced-colors.css',
    'src/styles/density.css',
  ],

  // TypeScript design tokens file
  designTokensFile: 'src/lib/design-tokens.ts',

  // Output directory
  defaultOutput: 'build/tokens',

  // Supported export formats
  formats: {
    json: 'JSON Web Tokens',
    figma: 'Figma Design Tokens',
    ios: 'iOS Swift/UIKit',
    android: 'Android XML/Compose',
    css: 'CSS Custom Properties',
    scss: 'SCSS Variables',
    tailwind: 'Tailwind Config',
    'style-dictionary': 'Style Dictionary Format',
  },

  // Platform-specific configurations
  platforms: {
    web: ['json', 'css', 'scss', 'tailwind'],
    mobile: ['json', 'ios', 'android'],
    desktop: ['json', 'css'],
    design: ['figma', 'style-dictionary'],
  },
}

// Token extraction and parsing
class TokenExtractor {
  /**
   * Extract all design tokens from source files
   */
  static async extractTokens() {
    const tokens = {
      colors: {},
      spacing: {},
      typography: {},
      shadows: {},
      radii: {},
      zIndex: {},
      opacity: {},
      breakpoints: {},
      animation: {},
      density: {},
      component: {},
    }

    console.log('🔍 Extracting design tokens from source files...')

    // Extract from CSS files
    for (const sourceFile of CONFIG.sourceFiles) {
      const filePath = path.join(rootDir, sourceFile)
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  File not found: ${sourceFile}`)
        continue
      }

      const content = fs.readFileSync(filePath, 'utf8')
      const fileTokens = this.parseTokensFromCSS(content, sourceFile)

      // Categorize and merge tokens
      this.mergeTokens(tokens, fileTokens)
    }

    // Extract from TypeScript file
    const tsTokens = await this.extractFromTypeScript()
    this.mergeTokens(tokens, tsTokens)

    console.log(`✅ Extracted ${this.countTokens(tokens)} design tokens`)
    return tokens
  }

  /**
   * Parse CSS variables from content
   */
  static parseTokensFromCSS(content, fileName) {
    const tokens = {}
    const regex = /--([a-zA-Z0-9-_]+):\s*([^;]+);/g
    let match

    while ((match = regex.exec(content)) !== null) {
      const [, name, value] = match
      const fullName = `--${name}`

      const category = this.categorizeToken(fullName, value)

      if (!tokens[category]) tokens[category] = {}

      tokens[category][name] = {
        name: fullName,
        value: value.trim(),
        category,
        source: fileName,
        // Parse value details
        ...this.parseTokenValue(value.trim()),
      }
    }

    return tokens
  }

  /**
   * Extract tokens from TypeScript design-tokens.ts
   */
  static async extractFromTypeScript() {
    const filePath = path.join(rootDir, CONFIG.designTokensFile)
    if (!fs.existsSync(filePath)) {
      return {}
    }

    // For now, we'll extract from the comments and exports
    // In a full implementation, you might parse the TypeScript AST
    const content = fs.readFileSync(filePath, 'utf8')

    return {
      spacing: this.extractSpacingFromTS(content),
      typography: this.extractTypographyFromTS(content),
      breakpoints: this.extractBreakpointsFromTS(content),
      zIndex: this.extractZIndexFromTS(content),
    }
  }

  /**
   * Categorize token based on name and value
   */
  static categorizeToken(name, value) {
    if (value.includes('oklch') || value.includes('hsl') || value.includes('#') || value.includes('rgb')) {
      return 'colors'
    }
    if (name.includes('space') || name.includes('padding') || name.includes('margin') || name.includes('gap')) {
      return 'spacing'
    }
    if (name.includes('font') || name.includes('text') || name.includes('line-height')) {
      return 'typography'
    }
    if (name.includes('shadow') || name.includes('elevation')) {
      return 'shadows'
    }
    if (name.includes('radius') || name.includes('rounded')) {
      return 'radii'
    }
    if (name.includes('z-index') || name.includes('layer')) {
      return 'zIndex'
    }
    if (name.includes('opacity') || name.includes('alpha')) {
      return 'opacity'
    }
    if (name.includes('duration') || name.includes('timing') || name.includes('ease')) {
      return 'animation'
    }
    if (name.includes('density') || name.includes('compact') || name.includes('comfortable')) {
      return 'density'
    }
    if (name.includes('btn-') || name.includes('card-') || name.includes('input-') || name.includes('nav-')) {
      return 'component'
    }
    return 'other'
  }

  /**
   * Parse token value to extract metadata
   */
  static parseTokenValue(value) {
    const result = {
      type: 'unknown',
      originalValue: value,
    }

    // OKLCH color
    if (value.includes('oklch(')) {
      const match = value.match(/oklch\(([^)]+)\)/)
      if (match) {
        const [lightness, chroma, hue] = match[1].split(/\s+/)
        result.type = 'color'
        result.format = 'oklch'
        result.oklch = { lightness, chroma, hue }
      }
    }
    // HSL color
    else if (value.includes('hsl(') || value.match(/^\d+\s+\d+%\s+\d+%$/)) {
      result.type = 'color'
      result.format = 'hsl'
      if (value.match(/^\d+\s+\d+%\s+\d+%$/)) {
        const [h, s, l] = value.split(/\s+/)
        result.hsl = { h, s, l }
      }
    }
    // Hex color
    else if (value.startsWith('#')) {
      result.type = 'color'
      result.format = 'hex'
      result.hex = value
    }
    // Size/dimension
    else if (value.match(/^[\d.]+(?:px|rem|em|vh|vw|%)$/)) {
      result.type = 'dimension'
      const match = value.match(/^([\d.]+)(px|rem|em|vh|vw|%)$/)
      if (match) {
        result.value = parseFloat(match[1])
        result.unit = match[2]
      }
    }
    // CSS variable reference
    else if (value.includes('var(')) {
      result.type = 'reference'
      const match = value.match(/var\(--([^)]+)\)/)
      if (match) {
        result.reference = `--${match[1]}`
      }
    }
    // Duration
    else if (value.match(/^[\d.]+m?s$/)) {
      result.type = 'duration'
      const match = value.match(/^([\d.]+)(m?s)$/)
      if (match) {
        result.value = parseFloat(match[1])
        result.unit = match[2]
      }
    }

    return result
  }

  /**
   * Extract spacing from TypeScript file
   */
  static extractSpacingFromTS(content) {
    const spacingMatch = content.match(/export const spacing = \{([\s\S]*?)\} as const/)
    if (!spacingMatch) return {}

    const spacingObject = {}
    const regex = /(\w+):\s*'([^']+)'/g
    let match

    while ((match = regex.exec(spacingMatch[1])) !== null) {
      spacingObject[match[1]] = {
        name: match[1],
        value: match[2],
        type: 'dimension',
        category: 'spacing',
      }
    }

    return spacingObject
  }

  /**
   * Extract typography from TypeScript file
   */
  static extractTypographyFromTS(content) {
    // Similar implementation for typography extraction
    return {}
  }

  /**
   * Extract breakpoints from TypeScript file
   */
  static extractBreakpointsFromTS(content) {
    const breakpointsMatch = content.match(/export const breakpoints = \{([\s\S]*?)\} as const/)
    if (!breakpointsMatch) return {}

    const breakpointsObject = {}
    const regex = /(\w+):\s*'([^']+)'/g
    let match

    while ((match = regex.exec(breakpointsMatch[1])) !== null) {
      breakpointsObject[match[1]] = {
        name: match[1],
        value: match[2],
        type: 'dimension',
        category: 'breakpoints',
      }
    }

    return breakpointsObject
  }

  /**
   * Extract z-index values from TypeScript file
   */
  static extractZIndexFromTS(content) {
    // Similar implementation for z-index extraction
    return {}
  }

  /**
   * Merge tokens from different sources
   */
  static mergeTokens(target, source) {
    for (const [category, tokens] of Object.entries(source)) {
      if (!target[category]) target[category] = {}
      Object.assign(target[category], tokens)
    }
  }

  /**
   * Count total tokens across all categories
   */
  static countTokens(tokens) {
    return Object.values(tokens).reduce((total, category) => {
      return total + Object.keys(category).length
    }, 0)
  }
}

// Format-specific exporters
class TokenExporter {
  constructor(tokens, options = {}) {
    this.tokens = tokens
    this.options = {
      theme: 'all',
      platform: 'all',
      validate: false,
      ...options,
    }
  }

  /**
   * Export to JSON format
   */
  async exportJSON() {
    const json = {
      $schema: 'https://schemas.design-tokens.org/design-tokens.json',
      $description: 'KitchenPantry CRM Design Tokens',
      $version: '2.0.0',
      $type: 'design-tokens',
      ...this.tokens,
    }

    // Add metadata
    json.$metadata = {
      generatedAt: new Date().toISOString(),
      platform: this.options.platform,
      theme: this.options.theme,
      tokenCount: TokenExtractor.countTokens(this.tokens),
    }

    return JSON.stringify(json, null, 2)
  }

  /**
   * Export to Figma Tokens format
   */
  async exportFigma() {
    const figmaTokens = {
      global: {},
      light: {},
      dark: {},
    }

    // Convert colors
    if (this.tokens.colors) {
      figmaTokens.global.colors = {}
      for (const [name, token] of Object.entries(this.tokens.colors)) {
        figmaTokens.global.colors[name] = {
          value: this.convertColorForFigma(token),
          type: 'color',
          description: `${token.category} color from ${token.source}`,
        }
      }
    }

    // Convert spacing
    if (this.tokens.spacing) {
      figmaTokens.global.spacing = {}
      for (const [name, token] of Object.entries(this.tokens.spacing)) {
        figmaTokens.global.spacing[name] = {
          value: token.value,
          type: 'spacing',
        }
      }
    }

    // Convert typography
    if (this.tokens.typography) {
      figmaTokens.global.typography = {}
      for (const [name, token] of Object.entries(this.tokens.typography)) {
        figmaTokens.global.typography[name] = {
          value: token.value,
          type: 'typography',
        }
      }
    }

    return JSON.stringify(figmaTokens, null, 2)
  }

  /**
   * Export to iOS Swift format
   */
  async exportiOS() {
    let swift = `//
// KitchenPantry CRM Design Tokens
// Generated on ${new Date().toISOString()}
//

import UIKit

extension UIColor {
    // MARK: - Design System Colors

`

    // Export colors
    if (this.tokens.colors) {
      for (const [name, token] of Object.entries(this.tokens.colors)) {
        const colorValue = this.convertColorForIOS(token)
        if (colorValue) {
          swift += `    static let ${this.toCamelCase(name)} = ${colorValue}\n`
        }
      }
    }

    swift += `}\n\nextension CGFloat {
    // MARK: - Design System Spacing

`

    // Export spacing
    if (this.tokens.spacing) {
      for (const [name, token] of Object.entries(this.tokens.spacing)) {
        const value = this.convertDimensionForIOS(token)
        if (value) {
          swift += `    static let spacing${this.toPascalCase(name)} = CGFloat(${value})\n`
        }
      }
    }

    swift += `}\n`

    return swift
  }

  /**
   * Export to Android XML format
   */
  async exportAndroid() {
    let xml = `<?xml version="1.0" encoding="utf-8"?>
<!-- KitchenPantry CRM Design Tokens -->
<!-- Generated on ${new Date().toISOString()} -->
<resources>

    <!-- Design System Colors -->
`

    // Export colors
    if (this.tokens.colors) {
      for (const [name, token] of Object.entries(this.tokens.colors)) {
        const colorValue = this.convertColorForAndroid(token)
        if (colorValue) {
          xml += `    <color name="${this.toSnakeCase(name)}">${colorValue}</color>\n`
        }
      }
    }

    xml += `
    <!-- Design System Dimensions -->
`

    // Export spacing
    if (this.tokens.spacing) {
      for (const [name, token] of Object.entries(this.tokens.spacing)) {
        const value = this.convertDimensionForAndroid(token)
        if (value) {
          xml += `    <dimen name="spacing_${this.toSnakeCase(name)}">${value}</dimen>\n`
        }
      }
    }

    xml += `
</resources>`

    return xml
  }

  /**
   * Export to CSS Custom Properties
   */
  async exportCSS() {
    let css = `/*
 * KitchenPantry CRM Design Tokens
 * Generated on ${new Date().toISOString()}
 */

:root {
`

    // Export all tokens as CSS variables
    for (const [category, tokens] of Object.entries(this.tokens)) {
      if (Object.keys(tokens).length === 0) continue

      css += `  /* ${category.charAt(0).toUpperCase() + category.slice(1)} */\n`

      for (const [name, token] of Object.entries(tokens)) {
        css += `  --${name}: ${token.value};\n`
      }

      css += '\n'
    }

    css += '}'

    return css
  }

  /**
   * Export to SCSS Variables
   */
  async exportSCSS() {
    let scss = `//
// KitchenPantry CRM Design Tokens
// Generated on ${new Date().toISOString()}
//

`

    for (const [category, tokens] of Object.entries(this.tokens)) {
      if (Object.keys(tokens).length === 0) continue

      scss += `// ${category.charAt(0).toUpperCase() + category.slice(1)}\n`

      for (const [name, token] of Object.entries(tokens)) {
        scss += `$${name.replace(/-/g, '_')}: ${token.value};\n`
      }

      scss += '\n'
    }

    return scss
  }

  /**
   * Export to Tailwind Config format
   */
  async exportTailwind() {
    const config = {
      theme: {
        extend: {},
      },
    }

    // Colors
    if (this.tokens.colors) {
      config.theme.extend.colors = {}
      for (const [name, token] of Object.entries(this.tokens.colors)) {
        // Group colors by base name
        const parts = name.split('-')
        if (parts.length > 1) {
          const [base, ...variants] = parts
          const variant = variants.join('-')

          if (!config.theme.extend.colors[base]) {
            config.theme.extend.colors[base] = {}
          }

          config.theme.extend.colors[base][variant] = `var(--${name})`
        } else {
          config.theme.extend.colors[name] = `var(--${name})`
        }
      }
    }

    // Spacing
    if (this.tokens.spacing) {
      config.theme.extend.spacing = {}
      for (const [name, token] of Object.entries(this.tokens.spacing)) {
        config.theme.extend.spacing[name] = token.value
      }
    }

    return `module.exports = ${JSON.stringify(config, null, 2)}`
  }

  /**
   * Helper methods for format conversion
   */
  convertColorForFigma(token) {
    if (token.format === 'hex') {
      return token.hex
    } else if (token.format === 'oklch' && token.oklch) {
      // Convert OKLCH to hex for Figma compatibility
      return this.oklchToHex(token.oklch)
    } else if (token.format === 'hsl' && token.hsl) {
      return `hsl(${token.hsl.h}, ${token.hsl.s}, ${token.hsl.l})`
    }
    return token.value
  }

  convertColorForIOS(token) {
    if (token.format === 'hex') {
      return this.hexToUIColor(token.hex)
    }
    return null
  }

  convertColorForAndroid(token) {
    if (token.format === 'hex') {
      return token.hex.toUpperCase()
    }
    return null
  }

  convertDimensionForIOS(token) {
    if (token.type === 'dimension' && token.unit === 'rem') {
      return token.value * 16 // Convert rem to points
    } else if (token.type === 'dimension' && token.unit === 'px') {
      return token.value
    }
    return null
  }

  convertDimensionForAndroid(token) {
    if (token.type === 'dimension' && token.unit === 'rem') {
      return `${token.value * 16}dp`
    } else if (token.type === 'dimension' && token.unit === 'px') {
      return `${token.value}dp`
    }
    return null
  }

  // String transformation utilities
  toCamelCase(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
  }

  toPascalCase(str) {
    const camel = this.toCamelCase(str)
    return camel.charAt(0).toUpperCase() + camel.slice(1)
  }

  toSnakeCase(str) {
    return str.replace(/-/g, '_').toLowerCase()
  }

  // Color conversion utilities (simplified)
  hexToUIColor(hex) {
    const r = parseInt(hex.substr(1, 2), 16) / 255
    const g = parseInt(hex.substr(3, 2), 16) / 255
    const b = parseInt(hex.substr(5, 2), 16) / 255
    return `UIColor(red: ${r.toFixed(3)}, green: ${g.toFixed(3)}, blue: ${b.toFixed(3)}, alpha: 1.0)`
  }

  oklchToHex(oklch) {
    // Simplified OKLCH to hex conversion
    // In production, you'd use a proper color conversion library
    return '#8DC63F' // Placeholder for MFB green
  }
}

// Main export functionality
class DesignTokenExportTool {
  constructor(options = {}) {
    this.options = {
      output: CONFIG.defaultOutput,
      format: 'all',
      platform: 'all',
      theme: 'all',
      validate: false,
      ...options,
    }
  }

  /**
   * Run export process
   */
  async export() {
    console.log('🎨 Starting design token export...')

    // Extract tokens
    const tokens = await TokenExtractor.extractTokens()

    // Create exporter
    const exporter = new TokenExporter(tokens, this.options)

    // Determine formats to export
    const formats = this.getExportFormats()

    // Create output directory
    const outputDir = path.resolve(rootDir, this.options.output)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Export each format
    const results = []
    for (const format of formats) {
      try {
        const content = await this.exportFormat(exporter, format)
        const filename = this.getOutputFilename(format)
        const filepath = path.join(outputDir, filename)

        fs.writeFileSync(filepath, content, 'utf8')
        results.push({ format, filepath, success: true })

        console.log(`✅ Exported ${format} to ${filename}`)
      } catch (error) {
        console.error(`❌ Failed to export ${format}:`, error.message)
        results.push({ format, error: error.message, success: false })
      }
    }

    // Create master index
    await this.createExportIndex(results, outputDir)

    console.log(`🎯 Export complete! ${results.filter(r => r.success).length}/${results.length} formats exported`)

    return results
  }

  /**
   * Get formats to export based on options
   */
  getExportFormats() {
    if (this.options.format === 'all') {
      return Object.keys(CONFIG.formats)
    } else if (this.options.platform !== 'all' && CONFIG.platforms[this.options.platform]) {
      return CONFIG.platforms[this.options.platform]
    } else {
      return [this.options.format]
    }
  }

  /**
   * Export specific format
   */
  async exportFormat(exporter, format) {
    switch (format) {
      case 'json':
        return await exporter.exportJSON()
      case 'figma':
        return await exporter.exportFigma()
      case 'ios':
        return await exporter.exportiOS()
      case 'android':
        return await exporter.exportAndroid()
      case 'css':
        return await exporter.exportCSS()
      case 'scss':
        return await exporter.exportSCSS()
      case 'tailwind':
        return await exporter.exportTailwind()
      default:
        throw new Error(`Unsupported format: ${format}`)
    }
  }

  /**
   * Get output filename for format
   */
  getOutputFilename(format) {
    const extensions = {
      json: 'json',
      figma: 'figma.json',
      ios: 'swift',
      android: 'xml',
      css: 'css',
      scss: 'scss',
      tailwind: 'tailwind.js',
    }

    return `design-tokens.${extensions[format] || format}`
  }

  /**
   * Create export index file
   */
  async createExportIndex(results, outputDir) {
    const index = {
      exports: results,
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '2.0.0',
        platform: this.options.platform,
        theme: this.options.theme,
      },
    }

    const indexPath = path.join(outputDir, 'index.json')
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8')
  }
}

// CLI Interface
function parseArgs() {
  const args = process.argv.slice(2)
  const options = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    switch (arg) {
      case '--format':
        options.format = args[++i]
        break
      case '--output':
        options.output = args[++i]
        break
      case '--platform':
        options.platform = args[++i]
        break
      case '--theme':
        options.theme = args[++i]
        break
      case '--validate':
        options.validate = true
        break
      case '--watch':
        options.watch = true
        break
      case '--help':
        showHelp()
        process.exit(0)
        break
    }
  }

  return options
}

function showHelp() {
  console.log(`
🎨 Cross-Platform Design Token Export Tool

Usage: node scripts/export-design-tokens.js [options]

Options:
  --format <format>      Export format: ${Object.keys(CONFIG.formats).join('|')} (default: all)
  --output <path>        Output directory (default: ${CONFIG.defaultOutput})
  --platform <platform>  Target platform: web|mobile|desktop|design|all (default: all)
  --theme <theme>        Theme variant: light|dark|all (default: all)
  --validate            Validate exports after generation
  --watch               Watch for changes and re-export
  --help                Show this help message

Examples:
  node scripts/export-design-tokens.js --format figma
  node scripts/export-design-tokens.js --platform mobile --output build/mobile-tokens
  node scripts/export-design-tokens.js --format all --validate
`)
}

// Main execution
async function main() {
  const options = parseArgs()

  try {
    const tool = new DesignTokenExportTool(options)
    await tool.export()

  } catch (error) {
    console.error('❌ Export failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { DesignTokenExportTool, TokenExtractor, TokenExporter }