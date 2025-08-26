import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'

interface OpportunitiesFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  onAddNew?: () => void
  totalOpportunities: number
  filteredCount: number
}

export function OpportunitiesFilters({
  searchTerm,
  onSearchChange,
  onAddNew,
  totalOpportunities,
  filteredCount
}: OpportunitiesFiltersProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-400" />
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
      {onAddNew && (
        <Button onClick={onAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Opportunity
        </Button>
      )}
    </div>
  )
}