import { useMemo } from 'react'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { tokens } from '@/styles/tokens'

/**
 * Hook for responsive design tokens
 *
 * Provides tokens that adapt based on screen size, following mobile-first approach.
 * Returns different token values based on current breakpoint.
 */
export function useResponsiveTokens() {
  // Standard Tailwind breakpoints
  const isSm = useMediaQuery('(min-width: 640px)')
  const isMd = useMediaQuery('(min-width: 768px)')
  const isLg = useMediaQuery('(min-width: 1024px)')
  const isXl = useMediaQuery('(min-width: 1280px)')
  const is2Xl = useMediaQuery('(min-width: 1536px)')

  const responsiveTokens = useMemo(() => {
    // Determine current breakpoint
    const breakpoint = is2Xl ? '2xl' : isXl ? 'xl' : isLg ? 'lg' : isMd ? 'md' : isSm ? 'sm' : 'xs'
    const isMobile = !isSm
    const isTablet = isSm && !isLg
    const isDesktop = isLg

    return {
      // Current breakpoint info
      breakpoint,
      isMobile,
      isTablet,
      isDesktop,

      // Responsive spacing
      spacing: {
        page: isMobile ? 'p-4' : isTablet ? 'p-6' : 'p-8',
        card: isMobile ? 'p-3' : isTablet ? 'p-4' : 'p-6',
        compact: isMobile ? 'p-2' : 'p-3',
        stack: isMobile ? tokens.semantic.spacing.stack.sm : tokens.semantic.spacing.stack.md,
        gap: isMobile ? tokens.semantic.spacing.gap.sm : tokens.semantic.spacing.gap.md,
      },

      // Responsive typography
      typography: {
        pageTitle: isMobile ? tokens.typography.h2 : tokens.typography.h1,
        sectionTitle: isMobile ? tokens.typography.h3 : tokens.typography.h2,
        cardTitle: isMobile ? tokens.typography.h4 : tokens.typography.h3,
        body: isMobile ? tokens.typography.small : tokens.typography.body,
        button: isMobile ? tokens.typography.button.sm : tokens.typography.button.md,
      },

      // Responsive layout
      layout: {
        containerWidth: isMobile ? 'w-full' : isTablet ? 'max-w-4xl' : 'max-w-6xl',
        sidebarWidth: isMobile ? 'w-64' : 'w-72',
        modalWidth: isMobile ? 'w-full max-w-sm' : isTablet ? 'max-w-md' : 'max-w-lg',
      },

      // Responsive shadows (lighter on mobile for better performance)
      shadows: {
        card: isMobile ? tokens.shadows.xs : tokens.shadows.sm,
        modal: isMobile ? tokens.shadows.lg : tokens.shadows.xl,
        dropdown: isMobile ? tokens.shadows.md : tokens.shadows.lg,
      },

      // All base tokens for fallback
      base: tokens,
    }
  }, [isSm, isMd, isLg, isXl, is2Xl])

  return responsiveTokens
}

/**
 * Hook for getting responsive token values
 *
 * @param values - Object with breakpoint values { xs?, sm?, md?, lg?, xl?, '2xl'? }
 */
export function useResponsiveValue<T>(values: {
  xs?: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
  '2xl'?: T
}): T | undefined {
  const { breakpoint } = useResponsiveTokens()

  // Find the appropriate value based on current breakpoint (mobile-first)
  const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const
  const currentIndex = breakpointOrder.indexOf(breakpoint as any)

  // Look for the highest applicable value
  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpointOrder[i]
    if (values[bp] !== undefined) {
      return values[bp]
    }
  }

  return undefined
}

/**
 * Hook for responsive classes based on screen size
 */
export function useResponsiveClasses() {
  const { isMobile, isTablet, isDesktop } = useResponsiveTokens()

  return {
    // Visibility classes
    hiddenMobile: isMobile ? 'hidden' : '',
    hiddenTablet: isTablet ? 'hidden' : '',
    hiddenDesktop: isDesktop ? 'hidden' : '',

    visibleMobile: isMobile ? '' : 'hidden',
    visibleTablet: isTablet ? '' : 'hidden',
    visibleDesktop: isDesktop ? '' : 'hidden',

    // Layout classes
    flexDirection: isMobile ? 'flex-col' : 'flex-row',
    textAlign: isMobile ? 'text-center' : 'text-left',

    // Grid classes
    gridCols: isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3',
  }
}
