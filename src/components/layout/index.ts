// Layout Component Exports
// This directory contains simple, composable layout components
// replacing the complex layout-builder system

// Core layout components
export { Container } from './Container'
export { PageContainer } from './PageContainer'
export { PageLayout } from './PageLayout'
export { PageHeader } from './PageHeader'
export { ContentSection } from './ContentSection'
export { Breadcrumbs } from './Breadcrumbs'
export { EmptyState, EmptyStatePresets } from './EmptyState'
export type { EmptyStateProps } from './EmptyState'
export { EntityListWrapper } from './EntityListWrapper'

// Complex layout components (legacy - being phased out)
export { LayoutProvider } from './LayoutProvider'
export { PageLayoutRenderer } from './PageLayoutRenderer'
