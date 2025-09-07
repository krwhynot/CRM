import { UserCheck, ChevronDown, Users } from 'lucide-react'
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

interface ManagerSelectorProps {
  value: string
  onChange: (managerName: string) => void
  managers?: string[]
  isLoading?: boolean
  compact?: boolean
  showBadges?: boolean
  disabled?: boolean
  currentUserName?: string
}

export function ManagerSelector({
  value,
  onChange,
  managers = [],
  isLoading = false,
  compact = false,
  showBadges = false,
  disabled = false,
  currentUserName = 'Me'
}: ManagerSelectorProps) {
  const getDisplayText = () => {
    if (value === 'all') return 'All Managers'
    if (value === 'my_activity') return 'My Activity'
    return managers.includes(value) ? value : 'Select Manager'
  }

  const handleSelect = (managerValue: string) => {
    onChange(managerValue)
  }

  return (
    <div className="flex flex-col space-y-1">
      {!compact && (
        <label className="text-xs font-medium text-muted-foreground">
          Manager
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
              {value === 'my_activity' ? (
                <UserCheck className="size-4" />
              ) : (
                <Users className="size-4" />
              )}
              <span className="truncate max-w-[120px]">{getDisplayText()}</span>
              {showBadges && value !== 'all' && (
                <Badge variant="secondary" className="ml-1">
                  {value === 'my_activity' ? currentUserName : '1'}
                </Badge>
              )}
            </div>
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="start" className="w-64">
          {/* All Managers Option */}
          <DropdownMenuItem
            onClick={() => handleSelect('all')}
            className={value === 'all' ? 'bg-accent' : ''}
          >
            <div className="flex items-center space-x-2">
              <Users className="size-4" />
              <div className="flex flex-col">
                <span className="font-medium">All Managers</span>
                <span className="text-xs text-muted-foreground">
                  Show data from all managers
                </span>
              </div>
            </div>
            {showBadges && value === 'all' && (
              <Badge variant="outline" className="ml-auto">
                {managers.length + 1}
              </Badge>
            )}
          </DropdownMenuItem>
          
          {/* My Activity Option */}
          <DropdownMenuItem
            onClick={() => handleSelect('my_activity')}
            className={value === 'my_activity' ? 'bg-accent' : ''}
          >
            <div className="flex items-center space-x-2">
              <UserCheck className="size-4" />
              <div className="flex flex-col">
                <span className="font-medium">My Activity</span>
                <span className="text-xs text-muted-foreground">
                  Show only my personal activities
                </span>
              </div>
            </div>
            {showBadges && value === 'my_activity' && (
              <Badge variant="outline" className="ml-auto">
                {currentUserName}
              </Badge>
            )}
          </DropdownMenuItem>
          
          {managers.length > 0 && <DropdownMenuSeparator />}
          
          {/* Manager List */}
          <ScrollArea className="max-h-48">
            {managers.map((manager) => (
              <DropdownMenuItem
                key={manager}
                onClick={() => handleSelect(manager)}
                className={value === manager ? 'bg-accent' : ''}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <Users className="size-4" />
                    <div className="flex flex-col">
                      <span className="font-medium">{manager}</span>
                      <span className="text-xs text-muted-foreground">
                        Manager
                      </span>
                    </div>
                  </div>
                  {showBadges && value === manager && (
                    <Badge variant="outline">Active</Badge>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
          
          {managers.length === 0 && !isLoading && (
            <DropdownMenuItem disabled>
              <span className="text-xs text-muted-foreground italic">
                No managers found in organization data
              </span>
            </DropdownMenuItem>
          )}
          
          {isLoading && (
            <DropdownMenuItem disabled>
              <span className="text-xs text-muted-foreground italic">
                Loading managers...
              </span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}