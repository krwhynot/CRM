import { useState } from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations'
import { semanticSpacing, semanticTypography } from '@/styles/tokens'
import type { Organization } from '@/types/entities'
// Organization type imported directly where needed

interface PreferredPrincipalsSelectProps {
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
  className?: string
}

export function PreferredPrincipalsSelect({
  value = [],
  onChange,
  disabled = false,
  className,
}: PreferredPrincipalsSelectProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch only principal organizations
  const { data: allOrganizations = [], isLoading } = useOrganizations({
    is_principal: true,
  })

  // Filter principals based on search query
  const filteredPrincipals = allOrganizations.filter((org: Organization) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get selected principals for display
  const selectedPrincipals = allOrganizations.filter((org: Organization) => value.includes(org.id))

  const handleSelect = (principalId: string) => {
    const isSelected = value.includes(principalId)
    if (isSelected) {
      // Remove from selection
      onChange(value.filter((id) => id !== principalId))
    } else {
      // Add to selection
      onChange([...value, principalId])
    }
  }

  const handleRemove = (principalId: string) => {
    onChange(value.filter((id) => id !== principalId))
  }

  const handleClearAll = () => {
    onChange([])
  }

  return (
    <div className={cn(semanticSpacing.stack.xs, className)}>
      {/* Selected Principals Display */}
      {selectedPrincipals.length > 0 && (
        <div className={`flex flex-wrap ${semanticSpacing.gap.xs}`}>
          {selectedPrincipals.map((principal: Organization) => (
            <Badge
              key={principal.id}
              variant="secondary"
              className={`group ${semanticSpacing.rightPadding.xs}`}
            >
              <span className={semanticTypography.caption}>{principal.name}</span>
              <button
                type="button"
                onClick={() => handleRemove(principal.id)}
                disabled={disabled}
                className={cn(
                  semanticRadius.full,
                  semanticSpacing.leftGap.xs,
                  'hover:bg-secondary-foreground/20 disabled:cursor-not-allowed disabled:opacity-50'
                )}
                aria-label={`Remove ${principal.name}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
          {selectedPrincipals.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={disabled}
              className={`h-6 ${semanticSpacing.horizontalPadding.xs} ${semanticTypography.caption} text-muted-foreground hover:text-foreground`}
            >
              Clear all
            </Button>
          )}
        </div>
      )}

      {/* Multi-Select Popover */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn('w-full h-11 justify-between', !value.length && 'text-muted-foreground')}
            disabled={disabled}
          >
            {value.length === 0
              ? 'Select preferred principals...'
              : value.length === 1
                ? '1 principal selected'
                : `${value.length} principals selected`}
            <ChevronsUpDown
              className={cn(semanticSpacing.leftGap.xs, 'size-4 shrink-0 opacity-50')}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={`w-full ${semanticSpacing.zero}`} align="start">
          <Command>
            <CommandInput
              placeholder="Search principals..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? 'Loading principals...' : 'No principals found.'}
              </CommandEmpty>
              {filteredPrincipals.length > 0 && (
                <CommandGroup>
                  {filteredPrincipals.map((principal: Organization) => {
                    const isSelected = value.includes(principal.id)
                    return (
                      <CommandItem
                        key={principal.id}
                        value={principal.id}
                        onSelect={() => handleSelect(principal.id)}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')}
                        />
                        <div className="flex flex-col">
                          <span className={`${semanticTypography.label}`}>{principal.name}</span>
                          {principal.city && principal.state_province && (
                            <span
                              className={cn(semanticTypography.caption, 'text-muted-foreground')}
                            >
                              {principal.city}, {principal.state_province}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
