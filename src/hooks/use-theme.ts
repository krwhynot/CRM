import { useTheme as useThemeContext } from '@/contexts/ThemeContext'

// Re-export the useTheme hook from the context for backwards compatibility
export const useTheme = useThemeContext

// Re-export types for convenience
export type { Theme, ThemeProviderState } from '@/contexts/ThemeContext'
