/**
 * Design Tokens - Consolidated Export
 *
 * Central access point for all design tokens used throughout the CRM application.
 * Import specific token categories or use the consolidated exports as needed.
 */

// Token category exports
export * from './spacing'
export * from './typography'
export * from './colors'
export * from './shadows'
export * from './radius'
export * from './animations'
export * from './z-index'
export * from './breakpoints'

// Re-export for convenience
export { spacing, semanticSpacing, type SpacingToken, type SemanticSpacingToken } from './spacing'

export {
  typography,
  semanticTypography,
  fontWeight,
  lineHeight,
  letterSpacing,
  type TypographyToken,
  type SemanticTypographyToken,
  type FontWeightToken,
  type LineHeightToken,
  type LetterSpacingToken,
} from './typography'

export {
  colors,
  textColors,
  borderColors,
  semanticColors,
  type ColorToken,
  type TextColorToken,
  type BorderColorToken,
  type SemanticColorToken,
} from './colors'

export { shadows, semanticShadows, type ShadowToken, type SemanticShadowToken } from './shadows'

export {
  radius,
  radiusDirectional,
  semanticRadius,
  type RadiusToken,
  type RadiusDirectionalToken,
  type SemanticRadiusToken,
} from './radius'

// Import everything first so we can use them in the objects below
import { spacing, semanticSpacing } from './spacing'

import { typography, semanticTypography } from './typography'

import { colors, textColors, borderColors, semanticColors } from './colors'

import { shadows, semanticShadows } from './shadows'

import { radius, semanticRadius } from './radius'

import {
  animationDuration,
  animationEasing,
  animationClasses,
  semanticAnimations,
} from './animations'

import { zIndex, semanticZIndex, zIndexClasses } from './z-index'

import { breakpointValues, mediaQueries, containerSizes, breakpointTokens } from './breakpoints'

// Consolidated token object for easy access
export const tokens = {
  spacing,
  typography,
  colors,
  shadows,
  radius,
  animations: {
    duration: animationDuration,
    easing: animationEasing,
    classes: animationClasses,
  },
  zIndex,
  breakpoints: breakpointTokens,

  // Semantic shortcuts
  semantic: {
    spacing: semanticSpacing,
    typography: semanticTypography,
    colors: semanticColors,
    shadows: semanticShadows,
    radius: semanticRadius,
    animations: semanticAnimations,
    zIndex: semanticZIndex,
  },
} as const

// Common token combinations for frequent use cases
export const tokenCombinations = {
  // Card styling
  card: `${semanticSpacing.cardContainer} ${semanticColors.cardBackground} ${semanticShadows.card} ${semanticRadius.card}`,

  // Button styling
  buttonPrimary: `${spacing.compact} ${colors.primary[500]} ${textColors.inverse} ${semanticShadows.button} ${semanticRadius.button}`,
  buttonSecondary: `${spacing.compact} ${colors.secondary[500]} ${textColors.inverse} ${semanticShadows.button} ${semanticRadius.button}`,

  // Input styling
  input: `${semanticSpacing.formContainer} ${semanticColors.fieldDefault} ${semanticShadows.input} ${semanticRadius.input}`,

  // Table styling
  tableCell: `${semanticSpacing.tableCell} ${borderColors.table}`,
  tableHeader: `${semanticSpacing.tableCell} ${colors.neutral[50]} ${textColors.secondary} ${borderColors.tableHeader}`,

  // Page layout
  pageContainer: `${semanticSpacing.pageContainer} ${semanticColors.pageBackground}`,
  sectionContainer: `${semanticSpacing.sectionGap}`,

  // Modal styling
  modal: `${semanticSpacing.cardContainer} ${semanticColors.modalBackground} ${semanticShadows.modal} ${semanticRadius.modal}`,
} as const

export type TokenCombination = keyof typeof tokenCombinations
