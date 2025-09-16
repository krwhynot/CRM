import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { cn } from '@/lib/utils'

interface BreadcrumbsProps {
  className?: string
}

// Route to page title mapping
const ROUTE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/organizations': 'Organizations',
  '/contacts': 'Contacts',
  '/opportunities': 'Opportunities',
  '/opportunities/new-multi-principal': 'New Multi-Principal Opportunity',
  '/products': 'Products',
  '/interactions': 'Interactions',
  '/import-export': 'Import/Export',
}

/**
 * Simple breadcrumb component that auto-generates breadcrumbs from the current route.
 * Follows "Home > [Current Page]" pattern for consistent navigation.
 */
export function Breadcrumbs({ className }: BreadcrumbsProps) {
  const location = useLocation()
  const currentPath = location.pathname

  // For home page, don't show breadcrumbs
  if (currentPath === '/') {
    return null
  }

  // Get the current page title
  const currentPageTitle = ROUTE_TITLES[currentPath] || 'Page'

  return (
    <Breadcrumb className={cn('mb-4', className)}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              to="/"
              className="flex items-center gap-2"
              aria-label="Navigate to dashboard home"
            >
              <Home className="size-4" />
              <span className="sr-only md:not-sr-only">Home</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        <BreadcrumbItem>
          <BreadcrumbPage>{currentPageTitle}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}