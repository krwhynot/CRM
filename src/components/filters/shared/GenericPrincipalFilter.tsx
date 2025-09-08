import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Building2 } from 'lucide-react'

export interface PrincipalOption {
  id: string
  name: string
  company?: string
}

export interface GenericPrincipalFilterProps {
  value: string
  principals: PrincipalOption[]
  isLoading?: boolean
  placeholder?: string
  className?: string
  onChange: (value: string) => void
}

export const GenericPrincipalFilter: React.FC<GenericPrincipalFilterProps> = ({
  value,
  principals,
  isLoading = false,
  placeholder = "Select Principal",
  className = "",
  onChange,
}) => {
  return (
    <div className={`flex min-w-0 items-center gap-2 ${className}`}>
      <Building2 className="size-4 shrink-0 text-muted-foreground" />
      <Select
        value={value}
        onValueChange={onChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full sm:w-filter-md">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Principals</SelectItem>
          {principals.map((principal) => (
            <SelectItem key={principal.id} value={principal.id}>
              {principal.name}
              {principal.company && principal.company !== principal.name && (
                <span className="ml-1 text-muted-foreground">({principal.company})</span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}