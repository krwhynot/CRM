import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FilterType } from '@/features/contacts/hooks/useContactsFiltering'

interface FilterPill {
  key: FilterType
  label: string
  count: number
}

interface ContactsFiltersProps {
  activeFilter: FilterType
  onFilterChange: (filter: FilterType) => void
  searchTerm: string
  onSearchChange: (term: string) => void
  filterPills: FilterPill[]
  totalContacts: number
  filteredCount: number
}

export const ContactsFilters = ({
  activeFilter,
  onFilterChange,
  searchTerm,
  onSearchChange,
  filterPills,
  totalContacts,
  filteredCount,
}: ContactsFiltersProps) => {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-card-foreground">Contacts</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {filteredCount === totalContacts
            ? `${totalContacts} contacts`
            : `${filteredCount} of ${totalContacts} contacts`}
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search contacts by name, title, email, organization, or phone..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full py-2 pl-10 pr-4"
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
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {pill.label}
            <span
              className={cn(
                'ml-1 px-1.5 py-0.5 rounded-full text-xs font-medium',
                activeFilter === pill.key
                  ? 'bg-primary/80 text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
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
