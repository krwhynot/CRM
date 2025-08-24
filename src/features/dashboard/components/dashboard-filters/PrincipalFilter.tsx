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
    <div className="flex items-center gap-2 min-w-0">
      <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
      <Select
        value={localFilters.principal}
        onValueChange={(value) => onFilterChange('principal', value)}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
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