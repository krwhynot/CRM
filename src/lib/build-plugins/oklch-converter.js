/**
 * OKLCH Converter Vite Plugin
 *
 * Vite plugin for automated OKLCH to HSL conversion during build process.
 * Integrates existing conversion utilities into Vite build pipeline to eliminate
 * manual HSL maintenance and ensure consistency between OKLCH and HSL variables.
 *
 * Features:
 * - Automatic HSL fallback generation from OKLCH primitives
 * - Build-time validation of OKLCH color values
 * - Development mode file watching with hot reload
 * - Caching for performance optimization
 * - Detailed build reporting and error handling
 *
 * Usage:
 *   import { oklchConverterPlugin } from './src/lib/build-plugins/oklch-converter.js'
 *
 *   // In vite.config.ts
 *   plugins: [
 *     oklchConverterPlugin({
 *       inputFile: 'src/styles/tokens/primitives-new.css',
 *       outputFile: 'src/styles/tokens/primitives.css',
 *       watchMode: true
 *     })
 *   ]
 */

import { readFileSync, writeFileSync, existsSync, statSync } from 'fs'
import { resolve, relative } from 'path'
import { createHash } from 'crypto'

/**
 * Cache for processed files to avoid unnecessary regeneration
 */
const processCache = new Map()

/**
 * OKLCH to HSL conversion utilities
 * These mirror the functions in design-token-utils.ts for build-time usage
 */

function oklchToRgb(l, c, h) {
  const [labL, labA, labB] = oklchToOklab(l, c, h)
  const [linearR, linearG, linearB] = oklabToLinearRgb(labL, labA, labB)

  return [
    Math.round(linearToSrgb(linearR) * 255),
    Math.round(linearToSrgb(linearG) * 255),
    Math.round(linearToSrgb(linearB) * 255)
  ]
}

function oklchToOklab(l, c, h) {
  const hueRadians = (h * Math.PI) / 180
  return [l, c * Math.cos(hueRadians), c * Math.sin(hueRadians)]
}

function oklabToLinearRgb(l, a, b) {
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b

  const l_cubed = Math.sign(l_) * Math.pow(Math.abs(l_), 3)
  const m_cubed = Math.sign(m_) * Math.pow(Math.abs(m_), 3)
  const s_cubed = Math.sign(s_) * Math.pow(Math.abs(s_), 3)

  const r = +4.0767416621 * l_cubed - 3.3077115913 * m_cubed + 0.2309699292 * s_cubed
  const g = -1.2684380046 * l_cubed + 2.6097574011 * m_cubed - 0.3413193965 * s_cubed
  const b_linear = -0.0041960863 * l_cubed - 0.7034186147 * m_cubed + 1.7076147010 * s_cubed

  return [r, g, b_linear]
}

function linearToSrgb(linear) {
  const clamped = Math.max(0, Math.min(1, linear))
  if (clamped <= 0.0031308) {
    return 12.92 * clamped
  } else {
    return 1.055 * Math.pow(clamped, 1.0 / 2.4) - 0.055
  }
}

function rgbToHsl(r, g, b) {
  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255

  const max = Math.max(rNorm, gNorm, bNorm)
  const min = Math.min(rNorm, gNorm, bNorm)
  const diff = max - min

  const l = (max + min) / 2
  let s = 0
  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min)
  }

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

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function oklchToHslString(l, c, h) {
  const [r, g, b] = oklchToRgb(l, c, h)
  const [hslH, hslS, hslL] = rgbToHsl(r, g, b)
  return `${hslH} ${hslS}% ${hslL}%`
}

function parseOklchToHsl(oklchString) {
  const oklchMatch = oklchString.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/)
  if (!oklchMatch) return null

  const l = parseFloat(oklchMatch[1])
  const c = parseFloat(oklchMatch[2])
  const h = parseFloat(oklchMatch[3])

  return oklchToHslString(l, c, h)
}

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

  if (l < 0 || l > 1) errors.push(`Lightness must be between 0 and 1, got ${l}`)
  if (c < 0 || c > 0.4) errors.push(`Chroma should be between 0 and 0.4, got ${c}`)
  if (h < 0 || h > 360) errors.push(`Hue must be between 0 and 360 degrees, got ${h}`)

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
 * Generate HSL definitions from OKLCH definitions
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
 * Process token file for HSL generation
 */
function processTokenFileForHslGeneration(cssContent) {
  const errors = []
  let generatedCount = 0

  const oklchDefinitions = extractOklchDefinitions(cssContent)

  const validDefinitions = oklchDefinitions.filter(def => {
    const validation = validateOklchFormat(def.oklchValue)
    if (!validation.isValid) {
      errors.push(`Invalid OKLCH in ${def.name}: ${validation.errors.join(', ')}`)
      return false
    }
    return true
  })

  const hslDefinitions = generateHslDefinitions(validDefinitions)
  generatedCount = hslDefinitions.length

  // Find HSL fallbacks section
  let hslSectionStart = cssContent.indexOf('/* MFB COLORS - HSL FALLBACKS FOR LEGACY COMPATIBILITY')
  let hslSectionEnd = cssContent.indexOf('/* =======================================================================', hslSectionStart + 1)

  // Try alternative patterns
  if (hslSectionStart === -1 || hslSectionEnd === -1) {
    hslSectionStart = cssContent.indexOf('/* HSL FALLBACKS')
    hslSectionEnd = cssContent.indexOf('/* ===', hslSectionStart + 1)
  }

  if (hslSectionStart === -1 || hslSectionEnd === -1) {
    errors.push('Could not find HSL fallbacks section in CSS file')
    return { updatedContent: cssContent, generatedCount: 0, errors }
  }

  // Construct new HSL section
  const newHslSection = [
    '    /* HSL FALLBACKS FOR LEGACY COMPATIBILITY',
    '     *',
    '     * AUTO-GENERATED HSL fallbacks from OKLCH definitions above.',
    '     * DO NOT EDIT MANUALLY - Use OKLCH converter plugin to regenerate.',
    '     * Provides browser compatibility for older browsers without OKLCH support.',
    '     * ======================================================================= */',
    '',
    ...hslDefinitions,
    '',
    '    /* ======================================================================='
  ].join('\n')

  const beforeHsl = cssContent.substring(0, hslSectionStart)
  const afterHsl = cssContent.substring(hslSectionEnd)
  const updatedContent = beforeHsl + newHslSection + afterHsl

  return { updatedContent, generatedCount, errors }
}

/**
 * Generate file hash for caching
 */
function generateFileHash(content) {
  return createHash('md5').update(content).digest('hex')
}

/**
 * OKLCH Converter Vite Plugin
 */
export function oklchConverterPlugin(options = {}) {
  const {
    inputFile = 'src/styles/tokens/primitives-new.css',
    outputFile = 'src/styles/tokens/primitives.css',
    watchMode = true,
    enableCaching = true,
    logLevel = 'info'
  } = options

  let root = ''
  let isDev = false

  return {
    name: 'oklch-converter',
    configResolved(config) {
      root = config.root
      isDev = config.command === 'serve'
    },

    buildStart() {
      this.processOklchFile()
    },

    configureServer(server) {
      if (watchMode && isDev) {
        const inputPath = resolve(root, inputFile)
        server.watcher.add(inputPath)

        server.watcher.on('change', (filePath) => {
          if (filePath === inputPath) {
            if (logLevel === 'info') {
              console.log('\n🎨 OKLCH file changed, regenerating HSL fallbacks...')
            }
            this.processOklchFile()
            server.ws.send({
              type: 'full-reload'
            })
          }
        })
      }
    },

    processOklchFile() {
      try {
        const inputPath = resolve(root, inputFile)
        const outputPath = resolve(root, outputFile)

        // Check if input file exists
        if (!existsSync(inputPath)) {
          if (logLevel === 'info') {
            console.warn(`⚠️  OKLCH input file not found: ${relative(root, inputPath)}`)
          }
          return
        }

        // Read and hash content for caching
        const cssContent = readFileSync(inputPath, 'utf8')
        const contentHash = generateFileHash(cssContent)

        // Check cache
        if (enableCaching && processCache.has(inputPath)) {
          const cached = processCache.get(inputPath)
          if (cached.hash === contentHash) {
            if (logLevel === 'debug') {
              console.log('📋 Using cached HSL conversion result')
            }
            return
          }
        }

        // Process the file
        const result = processTokenFileForHslGeneration(cssContent)

        // Report results
        if (result.errors.length > 0) {
          console.warn('\n⚠️  OKLCH conversion warnings:')
          result.errors.forEach(error => console.warn(`   - ${error}`))
        }

        if (result.generatedCount > 0) {
          // Write output file
          writeFileSync(outputPath, result.updatedContent, 'utf8')

          // Update cache
          if (enableCaching) {
            processCache.set(inputPath, {
              hash: contentHash,
              generatedCount: result.generatedCount,
              timestamp: Date.now()
            })
          }

          if (logLevel === 'info') {
            console.log(`✅ Generated ${result.generatedCount} HSL fallbacks from OKLCH primitives`)
            console.log(`   Input:  ${relative(root, inputPath)}`)
            console.log(`   Output: ${relative(root, outputPath)}`)
          }
        } else {
          if (logLevel === 'info') {
            console.warn('⚠️  No HSL fallbacks generated from OKLCH file')
          }
        }

      } catch (error) {
        console.error('\n❌ Error in OKLCH converter plugin:')
        console.error(error.message)
        // Don't fail the build for conversion errors
      }
    }
  }
}

/**
 * Alternative plugin for processing existing primitives.css files
 */
export function oklchFallbackPlugin(options = {}) {
  const {
    primitiveFiles = ['src/styles/tokens/primitives.css', 'src/styles/tokens/primitives-new.css'],
    enableCaching = true,
    logLevel = 'info'
  } = options

  let root = ''

  return {
    name: 'oklch-fallback-generator',
    configResolved(config) {
      root = config.root
    },

    buildStart() {
      this.generateFallbacks()
    },

    generateFallbacks() {
      let totalGenerated = 0
      let processedFiles = 0

      for (const file of primitiveFiles) {
        try {
          const filePath = resolve(root, file)

          if (!existsSync(filePath)) {
            continue
          }

          const cssContent = readFileSync(filePath, 'utf8')
          const contentHash = generateFileHash(cssContent)

          // Check cache
          if (enableCaching && processCache.has(filePath)) {
            const cached = processCache.get(filePath)
            if (cached.hash === contentHash) {
              continue
            }
          }

          const result = processTokenFileForHslGeneration(cssContent)

          if (result.generatedCount > 0) {
            writeFileSync(filePath, result.updatedContent, 'utf8')
            totalGenerated += result.generatedCount
            processedFiles++

            // Update cache
            if (enableCaching) {
              processCache.set(filePath, {
                hash: contentHash,
                generatedCount: result.generatedCount,
                timestamp: Date.now()
              })
            }
          }

          if (result.errors.length > 0 && logLevel === 'info') {
            console.warn(`⚠️  Warnings in ${relative(root, filePath)}:`)
            result.errors.forEach(error => console.warn(`   - ${error}`))
          }

        } catch (error) {
          if (logLevel === 'info') {
            console.error(`❌ Error processing ${file}: ${error.message}`)
          }
        }
      }

      if (totalGenerated > 0 && logLevel === 'info') {
        console.log(`✅ Generated ${totalGenerated} HSL fallbacks across ${processedFiles} files`)
      }
    }
  }
}

export default oklchConverterPlugin