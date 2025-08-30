import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { COPY } from '@/lib/copy'
import type { OrganizationFilterType } from '@/features/organizations/hooks/useOrganizationsFiltering'

interface FilterPill {
  key: OrganizationFilterType
  label: string
  count: number
}

interface OrganizationsFiltersProps {
  activeFilter: OrganizationFilterType
  onFilterChange: (filter: OrganizationFilterType) => void
  searchTerm: string
  onSearchChange: (term: string) => void
  filterPills: FilterPill[]
  onAddNew?: () => void
  totalOrganizations: number
  filteredCount: number
}

export const OrganizationsFilters: React.FC<OrganizationsFiltersProps> = ({
  activeFilter,
  onFilterChange,
  searchTerm,
  onSearchChange,
  filterPills,
  onAddNew,
  totalOrganizations,
  filteredCount
}) => {
  return (
    <div className="space-y-4">
      {/* Header with Add New button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-card-foreground">Organizations</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {filteredCount === totalOrganizations 
              ? `${totalOrganizations} organizations` 
              : `${filteredCount} of ${totalOrganizations} organizations`
            }
          </p>
        </div>
        {onAddNew && (
          <Button onClick={onAddNew} className="focus-ring mobile-touch-target flex items-center gap-2">
            <Plus className="size-4" />
{COPY.BUTTONS.ADD_ORGANIZATION}
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search organizations by name, location, manager, phone, or segment..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="mobile-search-input w-full py-2 pl-10 pr-4"
        />
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {filterPills.map((pill) => (
          <Button
            key={pill.key}
            variant={activeFilter === pill.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange(pill.key)}
            className={cn(
              'flex items-center gap-1 transition-colors',
              activeFilter === pill.key
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {pill.label}
            <span 
              className={cn(
                'ml-1 px-1.5 py-0.5 rounded-full text-xs font-medium',
                activeFilter === pill.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              )}
            >
              {pill.count}
            </span>
          </Button>
        ))}
      </div>
    </div>
  )
}