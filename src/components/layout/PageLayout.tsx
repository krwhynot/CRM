import React from 'react'
import { cn } from '@/lib/utils'
import { PageContainer } from './PageContainer'
import { Breadcrumbs } from './Breadcrumbs'

interface PageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  showBreadcrumbs?: boolean
}

/**
 * Simple page layout component that provides consistent page structure.
 * Replaces the complex layout system with standard React composition.
 * Includes optional breadcrumb navigation for entity pages.
 */
export function PageLayout({ children, className, showBreadcrumbs = true, ...props }: PageLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-background', className)} {...props}>
      <PageContainer>
        {showBreadcrumbs && <Breadcrumbs />}
        {children}
      </PageContainer>
    </div>
  )
}