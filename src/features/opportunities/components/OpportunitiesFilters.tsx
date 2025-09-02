import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface OpportunitiesFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  totalOpportunities: number
  filteredCount: number
}

export function OpportunitiesFilters({
  searchTerm,
  onSearchChange,
  totalOpportunities,
  filteredCount,
}: OpportunitiesFiltersProps) {
  return (
    <div className="flex items-center space-x-2">
      <Search className="size-4 text-gray-400" />
      <Input
        placeholder="Search opportunities..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-64"
      />
      {searchTerm && (
        <span className="text-sm text-gray-500">
          {filteredCount} of {totalOpportunities} opportunities
        </span>
      )}
    </div>
  )
}
