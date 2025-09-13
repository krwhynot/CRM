import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Building2, Users, Target, MessageSquare, Package, Search } from 'lucide-react'
import { COPY } from '@/lib/copy'
import { semanticSpacing } from '@/styles/tokens'

interface CommandPaletteProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function CommandPalette({ open, setOpen }: CommandPaletteProps) {
  const navigate = useNavigate()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(!open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, setOpen])

  const runCommand = React.useCallback(
    (command: () => void) => {
      setOpen(false)
      command()
    },
    [setOpen]
  )

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search CRM"
      description="Quickly navigate to any section of your CRM"
    >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate('/'))}>
            <div className={`flex items-center ${semanticSpacing.buttonGap}`}>
              <Search className="size-4" />
              <span>Dashboard</span>
            </div>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/organizations'))}>
            <Building2 className={`size-4 ${semanticSpacing.rightGap.lg}`} />
            <span>Organizations</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/contacts'))}>
            <Users className={`size-4 ${semanticSpacing.rightGap.lg}`} />
            <span>Contacts</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/opportunities'))}>
            <Target className={`size-4 ${semanticSpacing.rightGap.lg}`} />
            <span>Opportunities</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/interactions'))}>
            {' '}
            {/* ui-audit: allow */}
            <MessageSquare className={`size-4 ${semanticSpacing.rightGap.lg}`} />
            <span>Activities</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/products'))}>
            <Package className={`size-4 ${semanticSpacing.rightGap.lg}`} />
            <span>Products</span>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(() => navigate('/organizations?action=create'))}>
            <Building2 className={`size-4 ${semanticSpacing.rightGap.lg}`} />
            <span>{COPY.BUTTONS.ADD_ORGANIZATION}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/contacts?action=create'))}>
            <Users className={`size-4 ${semanticSpacing.rightGap.lg}`} />
            <span>{COPY.BUTTONS.ADD_CONTACT}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/opportunities?action=create'))}>
            <Target className={`size-4 ${semanticSpacing.rightGap.lg}`} />
            <span>{COPY.BUTTONS.ADD_OPPORTUNITY}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/interactions?action=create'))}>
            {' '}
            {/* ui-audit: allow */}
            <MessageSquare className={`size-4 ${semanticSpacing.rightGap.lg}`} />
            <span>{COPY.BUTTONS.LOG_INTERACTION}</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
