import React from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from 'lucide-react'

interface EntitySelectSearchBoxProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  onClearSearch: () => void
}

export const EntitySelectSearchBox: React.FC<EntitySelectSearchBoxProps> = ({
  searchTerm,
  onSearchChange,
  onClearSearch
}) => {
  return (
    <div className="p-2 border-b border-gray-100 sticky top-0 bg-white z-10">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search options..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 pl-10 pr-10 text-sm"
          autoFocus={false}
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  )
}