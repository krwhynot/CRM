/**
 * Design Token Hooks - Consolidated Export
 *
 * Central access point for all design token hooks used throughout the CRM application.
 */

export { useThemeTokens, useThemeValue, useThemeClasses } from './useThemeTokens'
export {
  useResponsiveTokens,
  useResponsiveValue,
  useResponsiveClasses,
} from './useResponsiveTokens'
export {
  useColorScheme,
  useStatusColor,
  usePriorityColor,
  useOpportunityColor,
  useContrastChecker,
} from './useColorScheme'

// Re-export for convenience
import { useThemeTokens } from './useThemeTokens'
import { useResponsiveTokens } from './useResponsiveTokens'
import { useColorScheme } from './useColorScheme'

/**
 * Combined hook that provides all token functionality
 * Use this when you need access to multiple token categories
 */
export function useDesignTokens() {
  const theme = useThemeTokens()
  const responsive = useResponsiveTokens()
  const colors = useColorScheme()

  return {
    theme,
    responsive,
    colors,

    // Quick access to common combinations
    current: {
      spacing: responsive.spacing,
      typography: responsive.typography,
      colors: colors.semantic,
      shadows: responsive.shadows,
      isDark: theme.isDark,
      isMobile: responsive.isMobile,
    },
  }
}
