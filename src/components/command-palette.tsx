import React, { useState, useEffect } from 'react'
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

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [setOpen])

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
            <Search className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/organizations'))}>
            <Building2 className="mr-2 h-4 w-4" />
            <span>Organizations</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/contacts'))}>
            <Users className="mr-2 h-4 w-4" />
            <span>Contacts</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/opportunities'))}>
            <Target className="mr-2 h-4 w-4" />
            <span>Opportunities</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/interactions'))}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Interactions</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/products'))}>
            <Package className="mr-2 h-4 w-4" />
            <span>Products</span>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(() => navigate('/organizations?action=create'))}>
            <Building2 className="mr-2 h-4 w-4" />
            <span>New Organization</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/contacts?action=create'))}>
            <Users className="mr-2 h-4 w-4" />
            <span>New Contact</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/opportunities?action=create'))}>
            <Target className="mr-2 h-4 w-4" />
            <span>New Opportunity</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/interactions?action=create'))}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>New Interaction</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}