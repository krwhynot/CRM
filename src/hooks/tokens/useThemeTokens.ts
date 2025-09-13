import { useMemo } from 'react'
import { useTheme } from '@/hooks/use-theme'
import { tokens } from '@/styles/tokens'

/**
 * Hook for accessing theme-aware design tokens
 *
 * Provides access to design tokens with automatic dark/light mode support.
 * Returns tokens that adapt based on the current theme.
 */
export function useThemeTokens() {
  const { theme } = useTheme()

  const themeTokens = useMemo(() => {
    const isDark = theme === 'dark'
    const isLight = theme === 'light'
    const isSystem = theme === 'system'

    // Get system preference when theme is 'system'
    const systemPrefersDark =
      isSystem &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches

    const effectivelyDark = isDark || (isSystem && systemPrefersDark)

    return {
      // Current theme info
      currentTheme: theme,
      isDark: effectivelyDark,
      isLight: !effectivelyDark,

      // All tokens (already theme-aware via CSS variables)
      spacing: tokens.spacing,
      typography: tokens.typography,
      colors: tokens.colors,
      shadows: tokens.shadows,
      radius: tokens.radius,

      // Semantic tokens
      semantic: tokens.semantic,

      // Theme-specific overrides (if needed)
      themeSpecific: {
        cardBackground: effectivelyDark ? 'bg-card' : 'bg-card',
        textPrimary: effectivelyDark ? 'text-foreground' : 'text-foreground',
        textSecondary: effectivelyDark ? 'text-muted-foreground' : 'text-muted-foreground',
        border: effectivelyDark ? 'border-border' : 'border-border',
      },
    }
  }, [theme])

  return themeTokens
}

/**
 * Hook for getting theme-aware token values
 *
 * @param lightValue - Token value for light theme
 * @param darkValue - Token value for dark theme (optional, defaults to lightValue)
 */
export function useThemeValue<T>(lightValue: T, darkValue?: T): T {
  const { isDark } = useThemeTokens()
  return isDark && darkValue !== undefined ? darkValue : lightValue
}

/**
 * Hook for conditional theme classes
 *
 * @param lightClasses - Classes for light theme
 * @param darkClasses - Classes for dark theme (optional)
 */
export function useThemeClasses(lightClasses: string, darkClasses?: string): string {
  const { isDark } = useThemeTokens()

  if (darkClasses) {
    return isDark ? darkClasses : lightClasses
  }

  // If no dark classes provided, return light classes (they should be theme-aware via CSS variables)
  return lightClasses
}
