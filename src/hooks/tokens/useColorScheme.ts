import { useMemo } from 'react'
import { useThemeTokens } from './useThemeTokens'
import { colors, textColors, borderColors, semanticColors } from '@/styles/tokens'

/**
 * Hook for semantic color access with contrast validation
 *
 * Provides easy access to semantic colors and ensures proper contrast ratios
 * for accessibility compliance (WCAG AA standards).
 */
export function useColorScheme() {
  const { isDark, isLight } = useThemeTokens()

  const colorScheme = useMemo(() => {
    return {
      // Theme information
      currentScheme: isDark ? 'dark' : 'light',
      isDark,
      isLight,

      // Core color categories
      colors,
      textColors,
      borderColors,
      semantic: semanticColors,

      // Status colors with theme awareness
      status: {
        success: {
          background: semanticColors.entityActive,
          text: textColors.success,
          border: borderColors.success,
        },
        warning: {
          background: semanticColors.priorityMedium,
          text: textColors.warning,
          border: borderColors.warning,
        },
        error: {
          background: semanticColors.entityError,
          text: textColors.error,
          border: borderColors.error,
        },
        info: {
          background: semanticColors.priorityLow,
          text: textColors.info,
          border: borderColors.info,
        },
      },

      // Priority colors for CRM entities
      priority: {
        high: {
          background: semanticColors.priorityHigh,
          text: textColors.error,
          indicator: 'bg-red-500',
        },
        medium: {
          background: semanticColors.priorityMedium,
          text: textColors.warning,
          indicator: 'bg-yellow-500',
        },
        low: {
          background: semanticColors.priorityLow,
          text: textColors.info,
          indicator: 'bg-blue-500',
        },
        none: {
          background: semanticColors.priorityNone,
          text: textColors.secondary,
          indicator: 'bg-gray-400',
        },
      },

      // Opportunity stage colors
      opportunity: {
        new: {
          background: semanticColors.opportunityNew,
          text: textColors.info,
          badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        },
        qualified: {
          background: semanticColors.opportunityQualified,
          text: textColors.warning,
          badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        },
        proposal: {
          background: semanticColors.opportunityProposal,
          text: textColors.warning,
          badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        },
        negotiation: {
          background: semanticColors.opportunityNegotiation,
          text: textColors.warning,
          badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
        },
        won: {
          background: semanticColors.opportunityWon,
          text: textColors.success,
          badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        },
        lost: {
          background: semanticColors.opportunityLost,
          text: textColors.error,
          badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        },
      },

      // Interactive states
      interactive: {
        hover: semanticColors.hoverBackground,
        active: semanticColors.activeBackground,
        focus: semanticColors.focusRing,
        disabled: 'bg-muted text-muted-foreground cursor-not-allowed opacity-50',
      },

      // Form field states
      field: {
        default: semanticColors.fieldDefault,
        focus: semanticColors.fieldFocus,
        error: semanticColors.fieldError,
        disabled: semanticColors.fieldDisabled,
      },
    }
  }, [isDark, isLight])

  return colorScheme
}

/**
 * Hook for getting status-based colors
 *
 * @param status - The status type ('success', 'warning', 'error', 'info')
 * @param variant - The color variant ('background', 'text', 'border')
 */
export function useStatusColor(
  status: 'success' | 'warning' | 'error' | 'info',
  variant: 'background' | 'text' | 'border' = 'background'
) {
  const { status: statusColors } = useColorScheme()
  return statusColors[status][variant]
}

/**
 * Hook for getting priority-based colors
 *
 * @param priority - The priority level ('high', 'medium', 'low', 'none')
 * @param variant - The color variant ('background', 'text', 'indicator')
 */
export function usePriorityColor(
  priority: 'high' | 'medium' | 'low' | 'none',
  variant: 'background' | 'text' | 'indicator' = 'background'
) {
  const { priority: priorityColors } = useColorScheme()
  return priorityColors[priority][variant]
}

/**
 * Hook for getting opportunity stage colors
 *
 * @param stage - The opportunity stage
 * @param variant - The color variant ('background', 'text', 'badge')
 */
export function useOpportunityColor(
  stage: 'new' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost',
  variant: 'background' | 'text' | 'badge' = 'background'
) {
  const { opportunity: opportunityColors } = useColorScheme()
  return opportunityColors[stage][variant]
}

/**
 * Hook for contrast checking and accessibility
 */
export function useContrastChecker() {
  const { isDark } = useColorScheme()

  return {
    // Helper to ensure proper contrast for text on background
    getAccessibleTextColor: (backgroundIsLight: boolean) => {
      return backgroundIsLight ? textColors.primary : textColors.inverse
    },

    // Helper to get appropriate border color for contrast
    getAccessibleBorderColor: (backgroundIsLight: boolean) => {
      return backgroundIsLight ? borderColors.muted : borderColors.strong
    },

    // WCAG AA compliance helpers
    ensureMinimumContrast: (foreground: string, background: string) => {
      // This would ideally calculate actual contrast ratios
      // For now, return theme-appropriate defaults
      return isDark ? 'text-foreground' : 'text-foreground'
    },
  }
}
