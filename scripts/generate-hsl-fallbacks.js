#!/usr/bin/env node

/**
 * Generate HSL Fallbacks Build Script
 *
 * Automated build-time HSL fallback generation from OKLCH primitives.
 * Integrates with Vite build pipeline to eliminate manual HSL maintenance.
 *
 * Usage:
 *   node scripts/generate-hsl-fallbacks.js
 *   npm run build:hsl-fallbacks
 *
 * Features:
 * - Processes primitives.css (or primitives-new.css) for OKLCH definitions
 * - Generates corresponding HSL variables automatically
 * - Validates OKLCH format and values before conversion
 * - Provides detailed reporting of conversion results
 * - Supports both standalone execution and Vite plugin integration
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// Import existing utilities from design-token-utils.ts
// Note: In a real Node.js environment, this would need proper module resolution
const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')

// Simplified OKLCH to HSL conversion utilities for Node.js environment
// Based on the existing implementation in design-token-utils.ts

/**
 * Convert OKLCH to RGB using proper color science
 */
function oklchToRgb(l, c, h) {
  // Convert OKLCH to OKLab
  const [labL, labA, labB] = oklchToOklab(l, c, h)

  // Convert OKLab to linear RGB
  const [linearR, linearG, linearB] = oklabToLinearRgb(labL, labA, labB)

  // Convert linear RGB to sRGB (gamma correction)
  return [
    Math.round(linearToSrgb(linearR) * 255),
    Math.round(linearToSrgb(linearG) * 255),
    Math.round(linearToSrgb(linearB) * 255)
  ]
}

/**
 * Convert OKLCH to OKLab color space
 */
function oklchToOklab(l, c, h) {
  const hueRadians = (h * Math.PI) / 180
  return [
    l,
    c * Math.cos(hueRadians),
    c * Math.sin(hueRadians)
  ]
}

/**
 * Convert OKLab to linear RGB using the OKLab color space matrix
 */
function oklabToLinearRgb(l, a, b) {
  // OKLab to LMS conversion
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b

  // Cube the values to get LMS
  const l_cubed = Math.sign(l_) * Math.pow(Math.abs(l_), 3)
  const m_cubed = Math.sign(m_) * Math.pow(Math.abs(m_), 3)
  const s_cubed = Math.sign(s_) * Math.pow(Math.abs(s_), 3)

  // LMS to linear RGB conversion matrix
  const r = +4.0767416621 * l_cubed - 3.3077115913 * m_cubed + 0.2309699292 * s_cubed
  const g = -1.2684380046 * l_cubed + 2.6097574011 * m_cubed - 0.3413193965 * s_cubed
  const b_linear = -0.0041960863 * l_cubed - 0.7034186147 * m_cubed + 1.7076147010 * s_cubed

  return [r, g, b_linear]
}

/**
 * Convert linear RGB to sRGB (apply gamma correction)
 */
function linearToSrgb(linear) {
  const clamped = Math.max(0, Math.min(1, linear))

  if (clamped <= 0.0031308) {
    return 12.92 * clamped
  } else {
    return 1.055 * Math.pow(clamped, 1.0 / 2.4) - 0.055
  }
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r, g, b) {
  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255

  const max = Math.max(rNorm, gNorm, bNorm)
  const min = Math.min(rNorm, gNorm, bNorm)
  const diff = max - min

  // Calculate lightness
  const l = (max + min) / 2

  // Calculate saturation
  let s = 0
  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min)
  }

  // Calculate hue
  let h = 0
  if (diff !== 0) {
    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / diff + (gNorm < bNorm ? 6 : 0)) / 6
        break
      case gNorm:
        h = ((bNorm - rNorm) / diff + 2) / 6
        break
      case bNorm:
        h = ((rNorm - gNorm) / diff + 4) / 6
        break
    }
  }

  return [
    Math.round(h * 360),
    Math.round(s * 100),
    Math.round(l * 100)
  ]
}

/**
 * Convert OKLCH directly to HSL format string
 */
function oklchToHslString(l, c, h) {
  const [r, g, b] = oklchToRgb(l, c, h)
  const [hslH, hslS, hslL] = rgbToHsl(r, g, b)
  return `${hslH} ${hslS}% ${hslL}%`
}

/**
 * Parse OKLCH string and convert to HSL string
 */
function parseOklchToHsl(oklchString) {
  const oklchMatch = oklchString.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/)
  if (!oklchMatch) {
    return null
  }

  const l = parseFloat(oklchMatch[1])
  const c = parseFloat(oklchMatch[2])
  const h = parseFloat(oklchMatch[3])

  return oklchToHslString(l, c, h)
}

/**
 * Validate OKLCH format and values
 */
function validateOklchFormat(oklchString) {
  const errors = []

  const oklchMatch = oklchString.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/)
  if (!oklchMatch) {
    errors.push('Invalid OKLCH format. Expected: oklch(l c h)')
    return { isValid: false, errors }
  }

  const l = parseFloat(oklchMatch[1])
  const c = parseFloat(oklchMatch[2])
  const h = parseFloat(oklchMatch[3])

  // Validate lightness (0-1)
  if (l < 0 || l > 1) {
    errors.push(`Lightness must be between 0 and 1, got ${l}`)
  }

  // Validate chroma (0-0.4 practical limit)
  if (c < 0 || c > 0.4) {
    errors.push(`Chroma should be between 0 and 0.4 for practical colors, got ${c}`)
  }

  // Validate hue (0-360)
  if (h < 0 || h > 360) {
    errors.push(`Hue must be between 0 and 360 degrees, got ${h}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    parsed: errors.length === 0 ? { l, c, h } : undefined
  }
}

/**
 * Extract OKLCH definitions from CSS content
 */
function extractOklchDefinitions(cssContent) {
  const lines = cssContent.split('\n')
  const definitions = []

  lines.forEach(line => {
    const match = line.match(/^\s*(--[^:]+):\s*(oklch\([^)]+\));(.*)$/)
    if (match) {
      const [, varName, oklchValue, commentPart] = match
      const comment = commentPart.trim().replace(/^\/\*\s*/, '').replace(/\s*\*\/$/, '')

      definitions.push({
        name: varName.trim(),
        oklchValue: oklchValue.trim(),
        fullDefinition: line,
        comment: comment || undefined
      })
    }
  })

  return definitions
}

/**
 * Generate HSL CSS variable definitions from OKLCH definitions
 */
function generateHslDefinitions(oklchDefinitions) {
  const hslDefinitions = []

  oklchDefinitions.forEach(({ name, oklchValue, comment }) => {
    const hslValue = parseOklchToHsl(oklchValue)
    if (hslValue) {
      const hslVarName = `${name}-hsl`
      const hslComment = comment ?
        comment.replace(/OKLCH:/g, 'HSL:').replace(/oklch\([^)]+\)/g, `hsl(${hslValue})`) :
        'HSL fallback'

      hslDefinitions.push(`    ${hslVarName}: ${hslValue};                  /* ${hslComment} */`)
    }
  })

  return hslDefinitions
}

/**
 * Process token file and generate HSL fallbacks
 */
function processTokenFileForHslGeneration(cssContent) {
  const errors = []
  let generatedCount = 0

  // Extract OKLCH definitions
  const oklchDefinitions = extractOklchDefinitions(cssContent)

  // Validate each OKLCH definition
  const validDefinitions = oklchDefinitions.filter(def => {
    const validation = validateOklchFormat(def.oklchValue)
    if (!validation.isValid) {
      errors.push(`Invalid OKLCH in ${def.name}: ${validation.errors.join(', ')}`)
      return false
    }
    return true
  })

  // Generate HSL definitions
  const hslDefinitions = generateHslDefinitions(validDefinitions)
  generatedCount = hslDefinitions.length

  // Find the HSL fallbacks section and replace it
  const hslSectionStart = cssContent.indexOf('/* MFB COLORS - HSL FALLBACKS FOR LEGACY COMPATIBILITY')
  const hslSectionEnd = cssContent.indexOf('/* =======================================================================', hslSectionStart + 1)

  if (hslSectionStart === -1 || hslSectionEnd === -1) {
    // If section doesn't exist, look for alternative patterns or append
    const alternativeStart = cssContent.indexOf('/* HSL FALLBACKS')
    const alternativeEnd = cssContent.indexOf('/* ===', alternativeStart + 1)

    if (alternativeStart !== -1 && alternativeEnd !== -1) {
      // Use alternative section
      const newHslSection = [
        '    /* HSL FALLBACKS FOR LEGACY COMPATIBILITY',
        '     *',
        '     * AUTO-GENERATED HSL fallbacks from OKLCH definitions above.',
        '     * DO NOT EDIT MANUALLY - Use generate-hsl-fallbacks.js to regenerate.',
        '     * Provides browser compatibility for older browsers without OKLCH support.',
        '     * ======================================================================= */',
        '',
        ...hslDefinitions,
        '',
        '    /* ======================================================================='
      ].join('\n')

      const beforeHsl = cssContent.substring(0, alternativeStart)
      const afterHsl = cssContent.substring(alternativeEnd)
      const updatedContent = beforeHsl + newHslSection + afterHsl

      return { updatedContent, generatedCount, errors }
    } else {
      errors.push('Could not find HSL fallbacks section in CSS file. Expected section markers not found.')
      return { updatedContent: cssContent, generatedCount: 0, errors }
    }
  }

  // Construct new HSL section
  const newHslSection = [
    '    /* MFB COLORS - HSL FALLBACKS FOR LEGACY COMPATIBILITY',
    '     *',
    '     * AUTO-GENERATED HSL fallbacks from OKLCH definitions above.',
    '     * DO NOT EDIT MANUALLY - Use generate-hsl-fallbacks.js to regenerate.',
    '     * Provides browser compatibility for older browsers without OKLCH support.',
    '     * ======================================================================= */',
    '',
    ...hslDefinitions,
    '',
    '    /* ======================================================================='
  ].join('\n')

  // Replace the HSL section
  const beforeHsl = cssContent.substring(0, hslSectionStart)
  const afterHsl = cssContent.substring(hslSectionEnd)
  const updatedContent = beforeHsl + newHslSection + afterHsl

  return {
    updatedContent,
    generatedCount,
    errors
  }
}

/**
 * Main script execution
 */
function main() {
  console.log('🎨 Generating HSL fallbacks from OKLCH primitives...\n')

  // Determine input file (prefer primitives-new.css if it exists)
  const primitivesNewPath = resolve(projectRoot, 'src/styles/tokens/primitives-new.css')
  const primitivesPath = resolve(projectRoot, 'src/styles/tokens/primitives.css')

  let inputPath
  if (existsSync(primitivesNewPath)) {
    inputPath = primitivesNewPath
    console.log('📁 Using primitives-new.css as input file')
  } else if (existsSync(primitivesPath)) {
    inputPath = primitivesPath
    console.log('📁 Using primitives.css as input file')
  } else {
    console.error('❌ Error: Could not find primitives.css or primitives-new.css')
    console.error('   Expected locations:')
    console.error(`   - ${primitivesNewPath}`)
    console.error(`   - ${primitivesPath}`)
    process.exit(1)
  }

  try {
    // Read the CSS file
    const cssContent = readFileSync(inputPath, 'utf8')
    console.log(`📖 Read ${cssContent.split('\n').length} lines from ${inputPath}`)

    // Process the file
    const result = processTokenFileForHslGeneration(cssContent)

    // Report results
    if (result.errors.length > 0) {
      console.log('\n⚠️  Validation errors encountered:')
      result.errors.forEach(error => console.log(`   - ${error}`))
    }

    if (result.generatedCount > 0) {
      // Write the updated content back to the file
      writeFileSync(inputPath, result.updatedContent, 'utf8')

      console.log(`\n✅ Successfully generated ${result.generatedCount} HSL fallback variables`)
      console.log(`📝 Updated ${inputPath}`)

      if (result.errors.length === 0) {
        console.log('🎉 All OKLCH definitions were valid and converted successfully!')
      } else {
        console.log(`⚠️  ${result.errors.length} definitions had validation issues and were skipped`)
      }
    } else {
      console.log('\n❌ No HSL fallbacks were generated')
      if (result.errors.length === 0) {
        console.log('   No valid OKLCH definitions found in the input file')
      } else {
        console.log('   All OKLCH definitions had validation errors')
      }
    }

    // Exit with appropriate code
    process.exit(result.errors.length > 0 ? 1 : 0)

  } catch (error) {
    console.error('\n❌ Error processing token file:')
    console.error(error.message)
    if (error.stack) {
      console.error('\nStack trace:')
      console.error(error.stack)
    }
    process.exit(1)
  }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

// Export for use by Vite plugin
export {
  processTokenFileForHslGeneration,
  extractOklchDefinitions,
  generateHslDefinitions,
  validateOklchFormat,
  parseOklchToHsl
}