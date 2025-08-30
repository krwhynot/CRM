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
    <div className="sticky top-0 z-10 border-b border-gray-100 bg-white p-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search options..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-10 px-10 text-sm"
          autoFocus={false}
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSearch}
            className="absolute right-1 top-1/2 size-8 -translate-y-1/2 p-0"
          >
            <X className="size-3" />
          </Button>
        )}
      </div>
    </div>
  )
}