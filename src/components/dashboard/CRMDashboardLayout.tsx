import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Dashboard Layout Variants
import { semanticTypography, semanticSpacing } from '@/styles/tokens'
const dashboardLayoutVariants = cva('w-full space-y-6', {
  variants: {
    layout: {
      default: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      wide: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6',
      compact: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
      executive: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      mobile: 'grid-cols-1 sm:grid-cols-2',
    },
    spacing: {
      tight: 'gap-3',
      normal: 'gap-4',
      relaxed: 'gap-6',
      loose: 'gap-8',
    },
  },
  defaultVariants: {
    layout: 'default',
    spacing: 'normal',
  },
})

// Dashboard Grid Container
export interface DashboardGridProps
  extends React.ComponentProps<'div'>,
    VariantProps<typeof dashboardLayoutVariants> {
  children: React.ReactNode
}

export function DashboardGrid({
  children,
  layout = 'default',
  spacing = 'normal',
  className,
  ...props
}: DashboardGridProps) {
  return (
    <div className={cn('grid', dashboardLayoutVariants({ layout, spacing }), className)} {...props}>
      {children}
    </div>
  )
}

// Dashboard Section Component
export interface DashboardSectionProps {
  title?: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  headerActions?: React.ReactNode
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export function DashboardSection({
  title,
  subtitle,
  children,
  className,
  headerActions,
  collapsible = false,
  defaultCollapsed = false,
}: DashboardSectionProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)

  return (
    <div className={cn('space-y-4', className)}>
      {title && (
        <div className="flex items-center justify-between">
          <div>
            <h3
              className={cn(
                semanticTypography.h4,
                semanticTypography.h4,
                semanticTypography.tightSpacing
              )}
            >
              {title}
            </h3>
            {subtitle && (
              <p className={cn(semanticTypography.body, 'text-muted-foreground')}>{subtitle}</p>
            )}
          </div>

          <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
            {headerActions}
            {collapsible && (
              <button
                onClick={() => setCollapsed(!collapsed)}
                className={cn(
                  semanticTypography.body,
                  'text-muted-foreground hover:text-foreground'
                )}
              >
                {collapsed ? 'Show' : 'Hide'}
              </button>
            )}
          </div>
        </div>
      )}

      {!collapsed && children}
    </div>
  )
}

// Dashboard Card Wrapper with responsive sizing
export interface DashboardCardWrapperProps {
  children: React.ReactNode
  span?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  className?: string
  priority?: 'low' | 'medium' | 'high' // For responsive reordering
}

export function DashboardCardWrapper({
  children,
  span = { md: 1 },
  className,
  priority = 'medium',
}: DashboardCardWrapperProps) {
  const spanClasses = [
    span.sm && `sm:col-span-${span.sm}`,
    span.md && `md:col-span-${span.md}`,
    span.lg && `lg:col-span-${span.lg}`,
    span.xl && `xl:col-span-${span.xl}`,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cn(spanClasses, className)} data-priority={priority}>
      {children}
    </div>
  )
}

// Predefined Dashboard Layouts
export const DashboardLayouts = {
  // Executive Summary Layout
  Executive: ({ children, className, ...props }: DashboardGridProps) => (
    <div className={cn('space-y-6', className)} {...props}>
      {/* Key Metrics Row */}
      <DashboardGrid layout="executive" spacing="normal">
        {Array.isArray(children) ? children.slice(0, 3) : children}
      </DashboardGrid>

      {/* Charts and Details */}
      <DashboardGrid layout="default" spacing="normal">
        {Array.isArray(children) ? children.slice(3) : null}
      </DashboardGrid>
    </div>
  ),

  // Sales Dashboard Layout
  Sales: ({ children, className, ...props }: DashboardGridProps) => (
    <div className={cn('space-y-6', className)} {...props}>
      {/* Quick Metrics */}
      <DashboardGrid layout="wide" spacing="tight">
        {Array.isArray(children) ? children.slice(0, 4) : children}
      </DashboardGrid>

      {/* Pipeline and Activities */}
      <div className={cn(semanticSpacing.gap.lg, 'grid grid-cols-1 lg:grid-cols-2')}>
        {Array.isArray(children) ? children.slice(4, 6) : null}
      </div>

      {/* Detailed Views */}
      <DashboardGrid layout="default">
        {Array.isArray(children) ? children.slice(6) : null}
      </DashboardGrid>
    </div>
  ),

  // Mobile-Optimized Layout
  Mobile: ({ children, className, ...props }: DashboardGridProps) => (
    <div className={cn('space-y-4', className)} {...props}>
      {/* Priority Cards First */}
      <DashboardGrid layout="mobile" spacing="tight">
        {children}
      </DashboardGrid>
    </div>
  ),

  // Analytics Layout
  Analytics: ({ children, className, ...props }: DashboardGridProps) => (
    <div className={cn('space-y-6', className)} {...props}>
      {/* Key Numbers */}
      <DashboardGrid layout="wide" spacing="normal">
        {Array.isArray(children) ? children.slice(0, 6) : children}
      </DashboardGrid>

      {/* Charts - Full Width */}
      <div className={cn(semanticSpacing.gap.lg, 'grid grid-cols-1')}>
        {Array.isArray(children) ? children.slice(6, 8) : null}
      </div>

      {/* Detailed Analytics */}
      <DashboardGrid layout="default">
        {Array.isArray(children) ? children.slice(8) : null}
      </DashboardGrid>
    </div>
  ),
}

// Responsive Dashboard Container
export interface ResponsiveDashboardProps {
  children: React.ReactNode
  layout?: 'executive' | 'sales' | 'analytics' | 'custom'
  className?: string
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  sections?: Array<{
    id: string
    title: string
    children: React.ReactNode
    priority?: number
  }>
}

export function ResponsiveDashboard({
  children,
  layout = 'executive',
  className,
  title,
  subtitle,
  actions,
  sections,
}: ResponsiveDashboardProps) {
  const LayoutComponent =
    layout === 'custom'
      ? DashboardGrid
      : DashboardLayouts[
          (layout.charAt(0).toUpperCase() + layout.slice(1)) as keyof typeof DashboardLayouts
        ]

  return (
    <div className={cn('w-full', className)}>
      {/* Dashboard Header */}
      {title && (
        <div className={cn(semanticSpacing.bottomGap.lg, 'flex items-center justify-between')}>
          <div>
            <h1
              className={cn(
                semanticTypography.h1,
                semanticTypography.h2,
                semanticTypography.tightSpacing
              )}
            >
              {title}
            </h1>
            {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {actions && (
            <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>{actions}</div>
          )}
        </div>
      )}

      {/* Sections or Direct Children */}
      {sections ? (
        <div className={`${semanticSpacing.stack.xl}`}>
          {sections
            .sort((a, b) => (a.priority || 0) - (b.priority || 0))
            .map((section) => (
              <DashboardSection key={section.id} title={section.title}>
                {section.children}
              </DashboardSection>
            ))}
        </div>
      ) : (
        <LayoutComponent>{children}</LayoutComponent>
      )}
    </div>
  )
}

// Dashboard Responsive Hooks
export function useDashboardBreakpoints() {
  const [breakpoint, setBreakpoint] = React.useState<'sm' | 'md' | 'lg' | 'xl'>('md')

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      if (width < 640) setBreakpoint('sm')
      else if (width < 768) setBreakpoint('md')
      else if (width < 1024) setBreakpoint('lg')
      else setBreakpoint('xl')
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return breakpoint
}

// Dashboard Card Sizes Hook
export function useDashboardCardSizes() {
  const breakpoint = useDashboardBreakpoints()

  const getCardSize = (priority: 'low' | 'medium' | 'high' = 'medium') => {
    if (breakpoint === 'sm') {
      return priority === 'high' ? 'md' : 'sm'
    }

    if (breakpoint === 'md') {
      switch (priority) {
        case 'high':
          return 'lg'
        case 'medium':
          return 'md'
        case 'low':
          return 'sm'
      }
    }

    // lg and xl breakpoints
    switch (priority) {
      case 'high':
        return 'xl'
      case 'medium':
        return 'lg'
      case 'low':
        return 'md'
    }
  }

  const getCardSpan = (priority: 'low' | 'medium' | 'high' = 'medium') => {
    if (breakpoint === 'sm') {
      return { sm: 1 }
    }

    if (breakpoint === 'md') {
      return priority === 'high' ? { md: 2 } : { md: 1 }
    }

    // lg and xl
    switch (priority) {
      case 'high':
        return { lg: 2, xl: 2 }
      case 'medium':
        return { lg: 1, xl: 1 }
      case 'low':
        return { lg: 1, xl: 1 }
    }
  }

  return { getCardSize, getCardSpan, breakpoint }
}

// Dashboard Performance Hook
export function useDashboardPerformance() {
  const [loadPriority, setLoadPriority] = React.useState<'high' | 'medium' | 'low'>('high')

  React.useEffect(() => {
    // Performance monitoring
    const updatePriority = () => {
      if (document.visibilityState === 'hidden') {
        setLoadPriority('low')
      } else if ((navigator as any).connection?.effectiveType === '4g') {
        setLoadPriority('high')
      } else {
        setLoadPriority('medium')
      }
    }

    document.addEventListener('visibilitychange', updatePriority)
    updatePriority() // Initial call
    return () => document.removeEventListener('visibilitychange', updatePriority)
  }, [])

  return { loadPriority }
}
