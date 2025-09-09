import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Users } from 'lucide-react'
import { ACCOUNT_MANAGERS } from '@/types/interaction.types'
import type { FilterState } from '@/types/dashboard'

interface AccountManagerFilterProps {
  localFilters: FilterState
  isLoading: boolean
  onFilterChange: (key: keyof FilterState, value: string[]) => void
}

export const AccountManagerFilter: React.FC<AccountManagerFilterProps> = ({
  localFilters,
  isLoading,
  onFilterChange,
}) => {
  // For now, handle single selection (can be enhanced to multi-select later)
  const currentValue = localFilters.accountManagers?.[0] || 'all'

  const handleValueChange = (value: string) => {
    if (value === 'all') {
      onFilterChange('accountManagers', [])
    } else {
      onFilterChange('accountManagers', [value])
    }
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Users className="size-4 shrink-0 text-muted-foreground" />
      <Select value={currentValue} onValueChange={handleValueChange} disabled={isLoading}>
        <SelectTrigger className="w-36 border-0 bg-background/50 p-2 text-sm focus:ring-1">
          <SelectValue placeholder="Account Manager" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All AMs</SelectItem>
          {ACCOUNT_MANAGERS.map((am) => (
            <SelectItem key={am} value={am}>
              {am}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
