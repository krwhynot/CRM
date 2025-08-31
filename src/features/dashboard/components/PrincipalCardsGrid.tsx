import { PrincipalCard } from './PrincipalCard'
import { usePrincipals } from '@/features/organizations/hooks/useOrganizations'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

interface PrincipalCardsGridProps {
  className?: string
  maxItems?: number
}

/**
 * PrincipalCardsGrid Component
 *
 * Displays a responsive grid of PrincipalCard components showing
 * all principal organizations with their key metrics and analytics.
 *
 * Features:
 * - Responsive grid layout (1 column mobile, 2 tablet, 3+ desktop)
 * - Loading states with skeleton placeholders
 * - Error handling with user-friendly messages
 * - Optional limit on number of cards displayed
 * - Optimized data fetching using existing hooks
 */
export function PrincipalCardsGrid({ className, maxItems }: PrincipalCardsGridProps) {
  const { data: principals = [], isLoading, error, isError } = usePrincipals()

  // Handle loading state
  if (isLoading) {
    return (
      <div
        className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className || ''}`}
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-4">
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  // Handle error state
  if (isError) {
    return (
      <div className={`${className || ''}`}>
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-6">
            <div className="text-destructive">
              <h3 className="font-semibold">Failed to load principal organizations</h3>
              <p className="mt-1 text-sm">Please try again later.</p>
              {error?.message && (
                <div className="mt-2 text-xs text-destructive">Error: {error.message}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Handle empty state
  if (principals.length === 0) {
    return (
      <div className={`${className || ''}`}>
        <div className="py-12 text-center">
          <h3 className="text-lg font-semibold text-muted-foreground">
            No Principal Organizations Found
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Add principal organizations to see them displayed here.
          </p>
        </div>
      </div>
    )
  }

  // Apply optional limit
  const displayPrincipals = maxItems ? principals.slice(0, maxItems) : principals

  // Sort principals by priority (A first) and then by name
  const sortedPrincipals = displayPrincipals.sort((a, b) => {
    // Priority order: A -> B -> C -> D -> null
    const priorityOrder: { [key: string]: number } = {
      A: 0,
      B: 1,
      C: 2,
      D: 3,
    }

    const aPriority = priorityOrder[a.priority] ?? 4
    const bPriority = priorityOrder[b.priority] ?? 4

    if (aPriority !== bPriority) {
      return aPriority - bPriority
    }

    // If same priority, sort by name
    return a.name.localeCompare(b.name)
  })

  return (
    <div
      className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className || ''}`}
    >
      {sortedPrincipals.map((principal) => (
        <PrincipalCard key={principal.id} principal={principal} className="h-full" />
      ))}

      {maxItems && principals.length > maxItems && (
        <div className="col-span-full">
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">
              Showing {maxItems} of {principals.length} principal organizations
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default PrincipalCardsGrid
