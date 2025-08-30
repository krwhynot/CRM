import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2 } from "lucide-react"
import { Principal, FilterState } from "@/types/dashboard"

interface PrincipalFilterProps {
  localFilters: FilterState
  principals: Principal[]
  isLoading: boolean
  onFilterChange: (key: keyof FilterState, value: string) => void
}

export const PrincipalFilter: React.FC<PrincipalFilterProps> = ({
  localFilters,
  principals,
  isLoading,
  onFilterChange
}) => {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Building2 className="size-4 shrink-0 text-muted-foreground" />
      <Select
        value={localFilters.principal}
        onValueChange={(value) => onFilterChange('principal', value)}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full sm:w-filter-md">
          <SelectValue placeholder="Select Principal" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Principals</SelectItem>
          {principals.map((principal) => (
            <SelectItem key={principal.id} value={principal.id}>
              {principal.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}