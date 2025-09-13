import { Building2, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { semanticSpacing, semanticTypography } from '@/styles/tokens'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
  disabled = false,
}: PrincipalSelectorProps) {
  const selectedPrincipal = principals.find((p) => p.id === value)
  const displayText =
    value === 'all' ? 'All Principals' : selectedPrincipal?.name || 'Select Principal'

  const handleSelect = (principalId: string) => {
    onChange(principalId)
  }

  return (
    <div className={cn(semanticSpacing.stack.xs, 'flex flex-col')}>
      {!compact && (
        <label
          className={cn(
            semanticTypography.caption,
            semanticTypography.label,
            'text-muted-foreground'
          )}
        >
          Principal
        </label>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size={compact ? 'sm' : 'default'}
            className="justify-between"
            disabled={isLoading || disabled}
          >
            <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
              <Building2 className="size-4" />
              <span className="max-w-32 truncate">{displayText}</span>
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
            <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
              <Building2 className="size-4" />
              <div className="flex flex-col">
                <span className={`${semanticTypography.label}`}>All Principals</span>
                <span className={cn(semanticTypography.caption, 'text-muted-foreground')}>
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
                <div className="flex w-full items-center justify-between">
                  <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
                    <Building2 className="size-4" />
                    <div className="flex flex-col">
                      <span className={`${semanticTypography.label}`}>{principal.name}</span>
                      <span
                        className={cn(
                          semanticTypography.caption,
                          'capitalize text-muted-foreground'
                        )}
                      >
                        {principal.type}
                      </span>
                    </div>
                  </div>
                  {showBadges && value === principal.id && <Badge variant="outline">Active</Badge>}
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>

          {principals.length === 0 && !isLoading && (
            <DropdownMenuItem disabled>
              <span className={cn(semanticTypography.caption, 'italic text-muted-foreground')}>
                No principals available
              </span>
            </DropdownMenuItem>
          )}

          {isLoading && (
            <DropdownMenuItem disabled>
              <span className={cn(semanticTypography.caption, 'italic text-muted-foreground')}>
                Loading principals...
              </span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
