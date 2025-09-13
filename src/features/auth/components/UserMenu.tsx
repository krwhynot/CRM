import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { semanticSpacing, semanticTypography, semanticRadius } from '@/styles/tokens'
import { LogOut, User, Settings } from 'lucide-react'

export function UserMenu() {
  const { user, signOut } = useAuth()

  if (!user) return null

  const handleSignOut = async () => {
    await signOut()
  }

  const getUserInitials = (email: string) => {
    const parts = email.split('@')[0].split('.')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return email.slice(0, 2).toUpperCase()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn(semanticRadius.full, 'relative size-8')}>
          <Avatar className="size-8">
            <AvatarFallback className={semanticTypography.caption}>
              {getUserInitials(user.email || '')}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className={`${semanticTypography.body}`}>
          <div className={`flex flex-col ${semanticSpacing.stack.xxs}`}>
            <p
              className={cn(
                semanticTypography.label,
                semanticTypography.tightLine,
                semanticTypography.body
              )}
            >
              {user.user_metadata?.full_name || 'User'}
            </p>
            <p
              className={cn(
                semanticTypography.tightLine,
                semanticTypography.caption,
                'text-muted-foreground'
              )}
            >
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className={`${semanticSpacing.rightGap.xs} size-4`} />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className={`${semanticSpacing.rightGap.xs} size-4`} />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className={`${semanticSpacing.rightGap.xs} size-4`} />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
