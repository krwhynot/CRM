import React, { useState, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { semanticSpacing, semanticRadius, semanticTypography } from '@/styles/tokens'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Building2,
  Users,
  Package,
  Target,
  MessageSquare,
  Plus,
  Calendar,
  FileText,
  Clock,
  Home,
  Upload,
  Download,
  User,
  Zap,
  Command,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Types for different command categories
export type CommandType = 'navigation' | 'create' | 'search' | 'action' | 'recent' | 'shortcut'

export interface CRMCommand {
  id: string
  title: string
  description?: string
  type: CommandType
  icon: React.ComponentType<{ className?: string }>
  action: () => void
  shortcut?: string
  category?: string
  keywords?: string[]
  priority?: number
}

// Sample CRM entities for search results
export interface SearchResult {
  id: string
  title: string
  subtitle: string
  type: 'organization' | 'contact' | 'product' | 'opportunity' | 'interaction'
  icon: React.ComponentType<{ className?: string }>
  action: () => void
  metadata?: Record<string, any>
}

export interface CRMCommandPaletteProps {
  open: boolean
  setOpen: (open: boolean) => void
  onNavigate?: (path: string) => void
  onCreateRecord?: (type: string) => void
  onSearchResults?: (query: string) => SearchResult[]
  recentItems?: SearchResult[]
  frequentActions?: CRMCommand[]
}

export function CRMCommandPalette({
  open,
  setOpen,
  onNavigate,
  onCreateRecord,
  onSearchResults,
  recentItems = [],
  frequentActions = [],
}: CRMCommandPaletteProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  // Navigation commands
  const navigationCommands: CRMCommand[] = [
    {
      id: 'nav-home',
      title: 'Go to Dashboard',
      description: 'View main dashboard with key metrics',
      type: 'navigation',
      icon: Home,
      action: () => navigateAndClose('/'),
      shortcut: '⌘H',
      keywords: ['dashboard', 'home', 'overview', 'metrics'],
    },
    {
      id: 'nav-organizations',
      title: 'Go to Organizations',
      description: 'Manage customer and partner organizations',
      type: 'navigation',
      icon: Building2,
      action: () => navigateAndClose('/organizations'),
      shortcut: '⌘O',
      keywords: ['organizations', 'customers', 'companies', 'accounts'],
    },
    {
      id: 'nav-contacts',
      title: 'Go to Contacts',
      description: 'Manage individual contacts and relationships',
      type: 'navigation',
      icon: Users,
      action: () => navigateAndClose('/contacts'),
      shortcut: '⌘C',
      keywords: ['contacts', 'people', 'relationships', 'individuals'],
    },
    {
      id: 'nav-products',
      title: 'Go to Products',
      description: 'Manage product catalog and inventory',
      type: 'navigation',
      icon: Package,
      action: () => navigateAndClose('/products'),
      shortcut: '⌘P',
      keywords: ['products', 'catalog', 'inventory', 'items'],
    },
    {
      id: 'nav-opportunities',
      title: 'Go to Opportunities',
      description: 'Manage sales pipeline and deals',
      type: 'navigation',
      icon: Target,
      action: () => navigateAndClose('/opportunities'),
      shortcut: '⌘U',
      keywords: ['opportunities', 'deals', 'pipeline', 'sales'],
    },
    {
      id: 'nav-interactions',
      title: 'Go to Interactions',
      description: 'View communication history and activities',
      type: 'navigation',
      icon: MessageSquare,
      action: () => navigateAndClose('/interactions'),
      shortcut: '⌘I',
      keywords: ['interactions', 'activities', 'communications', 'history'],
    },
  ]

  // Create commands
  const createCommands: CRMCommand[] = [
    {
      id: 'create-organization',
      title: 'Create Organization',
      description: 'Add a new customer or partner organization',
      type: 'create',
      icon: Building2,
      action: () => createAndClose('organization'),
      keywords: ['create', 'new', 'organization', 'company', 'add'],
    },
    {
      id: 'create-contact',
      title: 'Create Contact',
      description: 'Add a new individual contact',
      type: 'create',
      icon: User,
      action: () => createAndClose('contact'),
      keywords: ['create', 'new', 'contact', 'person', 'add'],
    },
    {
      id: 'create-product',
      title: 'Create Product',
      description: 'Add a new product to catalog',
      type: 'create',
      icon: Package,
      action: () => createAndClose('product'),
      keywords: ['create', 'new', 'product', 'item', 'add'],
    },
    {
      id: 'create-opportunity',
      title: 'Create Opportunity',
      description: 'Start tracking a new sales opportunity',
      type: 'create',
      icon: Target,
      action: () => createAndClose('opportunity'),
      keywords: ['create', 'new', 'opportunity', 'deal', 'add'],
    },
    {
      id: 'create-interaction',
      title: 'Log Interaction',
      description: 'Record a new customer interaction',
      type: 'create',
      icon: MessageSquare,
      action: () => createAndClose('interaction'),
      keywords: ['create', 'new', 'interaction', 'log', 'activity', 'add'],
    },
  ]

  // Action commands
  const actionCommands: CRMCommand[] = [
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Export CRM data to spreadsheet',
      type: 'action',
      icon: Download,
      action: () => actionAndClose('export'),
      keywords: ['export', 'download', 'spreadsheet', 'backup'],
    },
    {
      id: 'import-data',
      title: 'Import Data',
      description: 'Import data from spreadsheet',
      type: 'action',
      icon: Upload,
      action: () => actionAndClose('import'),
      keywords: ['import', 'upload', 'spreadsheet', 'bulk'],
    },
    {
      id: 'generate-report',
      title: 'Generate Report',
      description: 'Create sales and activity reports',
      type: 'action',
      icon: FileText,
      action: () => actionAndClose('report'),
      keywords: ['report', 'analytics', 'generate', 'summary'],
    },
    {
      id: 'schedule-meeting',
      title: 'Schedule Meeting',
      description: 'Set up a customer meeting',
      type: 'action',
      icon: Calendar,
      action: () => actionAndClose('meeting'),
      keywords: ['meeting', 'schedule', 'appointment', 'calendar'],
    },
  ]

  // Combine all commands
  const allCommands = useMemo(
    () => [...navigationCommands, ...createCommands, ...actionCommands, ...frequentActions],
    [frequentActions]
  )

  // Filter commands based on search query
  const filteredCommands = useMemo(() => {
    if (!query) return allCommands

    const lowerQuery = query.toLowerCase()
    return allCommands
      .filter(
        (command) =>
          command.title.toLowerCase().includes(lowerQuery) ||
          command.description?.toLowerCase().includes(lowerQuery) ||
          command.keywords?.some((keyword) => keyword.includes(lowerQuery))
      )
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
  }, [query, allCommands])

  // Handle search results
  useEffect(() => {
    if (query.length > 2 && onSearchResults) {
      const results = onSearchResults(query)
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }, [query, onSearchResults])

  const navigateAndClose = (path: string) => {
    setOpen(false)
    onNavigate ? onNavigate(path) : navigate(path)
  }

  const createAndClose = (type: string) => {
    setOpen(false)
    onCreateRecord?.(type)
  }

  const actionAndClose = (action: string) => {
    setOpen(false)
    console.log('Performing action:', action)
    // Handle specific actions here
  }

  const handleSelect = (command: CRMCommand | SearchResult) => {
    command.action()
  }

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Search or run command...</span>
        <span className="sr-only">Search</span>
        <kbd
          className={cn(
            semanticSpacing.gap.xs,
            semanticRadius.small,
            semanticTypography.label,
            'pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center border bg-muted px-1.5 font-mono text-[10px] opacity-100 xl:flex'
          )}
        >
          <span className={`${semanticTypography.caption}`}>⌘</span>K
        </kbd>
      </Button>

      {/* Command Dialog */}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Command Palette"
        description="Search for commands, navigate, or find records"
      >
        <CommandInput
          placeholder="Type a command, search for records, or navigate..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            <div
              className={cn(
                semanticSpacing.gap.xs,
                semanticSpacing.cardY,
                'flex flex-col items-center'
              )}
            >
              <Search className="h-8 w-8 text-muted-foreground" />
              <p className={cn(semanticTypography.body, 'text-muted-foreground')}>
                No results found for "{query}"
              </p>
              <p className={cn(semanticTypography.caption, 'text-muted-foreground')}>
                Try searching for organizations, contacts, products, or opportunities
              </p>
            </div>
          </CommandEmpty>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <CommandGroup heading="Search Results">
              {searchResults.map((result) => (
                <CommandItem
                  key={result.id}
                  value={`${result.title} ${result.subtitle}`}
                  onSelect={() => handleSelect(result)}
                >
                  <result.icon className={cn(semanticSpacing.rightGap.xs, 'h-4 w-4')} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={cn(semanticTypography.label, 'truncate')}>
                        {result.title}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(semanticSpacing.leftGap.xs, semanticTypography.caption)}
                      >
                        {result.type}
                      </Badge>
                    </div>
                    <p className={cn(semanticTypography.caption, 'text-muted-foreground truncate')}>
                      {result.subtitle}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Recent Items */}
          {recentItems.length > 0 && !query && (
            <CommandGroup heading="Recent">
              {recentItems.slice(0, 5).map((item) => (
                <CommandItem key={item.id} value={item.title} onSelect={() => handleSelect(item)}>
                  <Clock
                    className={cn(semanticSpacing.rightGap.xs, 'h-4 w-4 text-muted-foreground')}
                  />
                  <item.icon className={cn(semanticSpacing.rightGap.xs, 'h-4 w-4')} />
                  <div className="flex-1 min-w-0">
                    <span className="truncate">{item.title}</span>
                    <p className={cn(semanticTypography.caption, 'text-muted-foreground truncate')}>
                      {item.subtitle}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Navigation */}
          {(query || !recentItems.length) && (
            <CommandGroup heading="Navigate">
              {filteredCommands
                .filter((cmd) => cmd.type === 'navigation')
                .map((command) => (
                  <CommandItem
                    key={command.id}
                    value={`${command.title} ${command.description} ${command.keywords?.join(' ')}`}
                    onSelect={() => handleSelect(command)}
                  >
                    <command.icon className={cn(semanticSpacing.rightGap.xs, 'h-4 w-4')} />
                    <div className="flex-1">
                      <span>{command.title}</span>
                      {command.description && (
                        <p className={cn(semanticTypography.caption, 'text-muted-foreground')}>
                          {command.description}
                        </p>
                      )}
                    </div>
                    {command.shortcut && <CommandShortcut>{command.shortcut}</CommandShortcut>}
                  </CommandItem>
                ))}
            </CommandGroup>
          )}

          {/* Create Actions */}
          <CommandGroup heading="Create New">
            {filteredCommands
              .filter((cmd) => cmd.type === 'create')
              .map((command) => (
                <CommandItem
                  key={command.id}
                  value={`${command.title} ${command.description} ${command.keywords?.join(' ')}`}
                  onSelect={() => handleSelect(command)}
                >
                  <Plus className={cn(semanticSpacing.rightGap.xs, 'h-4 w-4')} />
                  <command.icon className={cn(semanticSpacing.rightGap.xs, 'h-4 w-4')} />
                  <div className="flex-1">
                    <span>{command.title}</span>
                    {command.description && (
                      <p className={cn(semanticTypography.caption, 'text-muted-foreground')}>
                        {command.description}
                      </p>
                    )}
                  </div>
                </CommandItem>
              ))}
          </CommandGroup>

          {/* Actions */}
          {filteredCommands.filter((cmd) => cmd.type === 'action').length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Actions">
                {filteredCommands
                  .filter((cmd) => cmd.type === 'action')
                  .map((command) => (
                    <CommandItem
                      key={command.id}
                      value={`${command.title} ${command.description} ${command.keywords?.join(' ')}`}
                      onSelect={() => handleSelect(command)}
                    >
                      <command.icon className={cn(semanticSpacing.rightGap.xs, 'h-4 w-4')} />
                      <div className="flex-1">
                        <span>{command.title}</span>
                        {command.description && (
                          <p className={cn(semanticTypography.caption, 'text-muted-foreground')}>
                            {command.description}
                          </p>
                        )}
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </>
          )}

          {/* Quick Tips */}
          {!query && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Tips">
                <CommandItem disabled>
                  <Zap className={cn(semanticSpacing.rightGap.xs, 'h-4 w-4 text-yellow-500')} />
                  <span className={`${semanticTypography.caption}`}>
                    Use keyboard shortcuts for faster navigation
                  </span>
                </CommandItem>
                <CommandItem disabled>
                  <Command className={cn(semanticSpacing.rightGap.xs, 'h-4 w-4 text-blue-500')} />
                  <span className={`${semanticTypography.caption}`}>
                    Press ⌘K or Ctrl+K to open this palette anytime
                  </span>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}

// Hook to manage command palette state
export function useCommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return { open, setOpen }
}

// Sample search function for demonstration
export function sampleSearchFunction(query: string): SearchResult[] {
  // This would typically call your actual search API
  const sampleData: SearchResult[] = [
    {
      id: '1',
      title: 'Metro Restaurant Group',
      subtitle: 'Customer • Chicago, IL • A+ Priority',
      type: 'organization',
      icon: Building2,
      action: () => console.log('Navigate to Metro Restaurant Group'),
      metadata: { type: 'customer', priority: 'a-plus' },
    },
    {
      id: '2',
      title: 'Sarah Johnson',
      subtitle: 'Contact • Metro Restaurant Group • Primary Manager',
      type: 'contact',
      icon: User,
      action: () => console.log('Navigate to Sarah Johnson'),
      metadata: { organization: 'Metro Restaurant Group' },
    },
    {
      id: '3',
      title: 'Organic Chicken Breast',
      subtitle: 'Product • Fresh Proteins • $12.99/lb',
      type: 'product',
      icon: Package,
      action: () => console.log('Navigate to Organic Chicken Breast'),
      metadata: { category: 'Fresh Proteins' },
    },
  ]

  return sampleData.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase())
  )
}
