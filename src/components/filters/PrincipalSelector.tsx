import { Building2, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { FilterOrganizationData } from '@/types/filters.types'

interface PrincipalSelectorProps {
  value: string
  onChange: (principalId: string) => void
  principals?: FilterOrganizationData[]
  isLoading?: boolean
  compact?: boolean
  showBadges?: boolean
  disabled?: boolean
}

export function PrincipalSelector({
  value,
  onChange,
  principals = [],
  isLoading = false,
  compact = false,
  showBadges = false,
  disabled = false
}: PrincipalSelectorProps) {
  const selectedPrincipal = principals.find(p => p.id === value)
  const displayText = value === 'all' 
    ? 'All Principals' 
    : selectedPrincipal?.name || 'Select Principal'

  const handleSelect = (principalId: string) => {
    onChange(principalId)
  }

  return (
    <div className="flex flex-col space-y-1">
      {!compact && (
        <label className="text-xs font-medium text-muted-foreground">
          Principal
        </label>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size={compact ? "sm" : "default"}
            className="justify-between"
            disabled={isLoading || disabled}
          >
            <div className="flex items-center space-x-2">
              <Building2 className="size-4" />
              <span className="truncate max-w-[120px]">{displayText}</span>
              {showBadges && value !== 'all' && (
                <Badge variant="secondary" className="ml-1">
                  1
                </Badge>
              )}
            </div>
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuItem
            onClick={() => handleSelect('all')}
            className={value === 'all' ? 'bg-accent' : ''}
          >
            <div className="flex items-center space-x-2">
              <Building2 className="size-4" />
              <div className="flex flex-col">
                <span className="font-medium">All Principals</span>
                <span className="text-xs text-muted-foreground">
                  Show data from all principals
                </span>
              </div>
            </div>
            {showBadges && value === 'all' && (
              <Badge variant="outline" className="ml-auto">
                {principals.length}
              </Badge>
            )}
          </DropdownMenuItem>
          
          {principals.length > 0 && <DropdownMenuSeparator />}
          
          <ScrollArea className="max-h-48">
            {principals.map((principal) => (
              <DropdownMenuItem
                key={principal.id}
                onClick={() => handleSelect(principal.id)}
                className={value === principal.id ? 'bg-accent' : ''}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <Building2 className="size-4" />
                    <div className="flex flex-col">
                      <span className="font-medium">{principal.name}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {principal.type}
                      </span>
                    </div>
                  </div>
                  {showBadges && value === principal.id && (
                    <Badge variant="outline">Active</Badge>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
          
          {principals.length === 0 && !isLoading && (
            <DropdownMenuItem disabled>
              <span className="text-xs text-muted-foreground italic">
                No principals available
              </span>
            </DropdownMenuItem>
          )}
          
          {isLoading && (
            <DropdownMenuItem disabled>
              <span className="text-xs text-muted-foreground italic">
                Loading principals...
              </span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}