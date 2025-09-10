import React from 'react'
import { 
  CRMCommandPalette, 
  useCommandPalette, 
  sampleSearchFunction,
  type SearchResult,
  type CRMCommand
} from '../CRMCommandPalette'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Building2,
  User,
  Package,
  Target,
  MessageSquare,
  Calendar,
  Star,
  TrendingUp
} from 'lucide-react'

// Sample recent items
const sampleRecentItems: SearchResult[] = [
  {
    id: 'recent-1',
    title: 'Metro Restaurant Group',
    subtitle: 'Last viewed 2 hours ago',
    type: 'organization',
    icon: Building2,
    action: () => console.log('Navigate to Metro Restaurant Group'),
  },
  {
    id: 'recent-2',
    title: 'Sarah Johnson',
    subtitle: 'Last contacted yesterday',
    type: 'contact',
    icon: User,
    action: () => console.log('Navigate to Sarah Johnson'),
  },
  {
    id: 'recent-3',
    title: 'Q1 2024 Catering Deal',
    subtitle: 'Updated 3 days ago',
    type: 'opportunity',
    icon: Target,
    action: () => console.log('Navigate to Q1 2024 Catering Deal'),
  }
]

// Sample frequent actions (could come from user analytics)
const sampleFrequentActions: CRMCommand[] = [
  {
    id: 'frequent-1',
    title: 'Weekly Sales Report',
    description: 'Generate this week\'s sales performance report',
    type: 'shortcut',
    icon: TrendingUp,
    action: () => {
      toast.success('Generating weekly sales report...')
      // Actual report generation logic would go here
    },
    priority: 10,
    keywords: ['report', 'sales', 'weekly', 'performance']
  },
  {
    id: 'frequent-2',
    title: 'Schedule Follow-up',
    description: 'Quick schedule for customer follow-ups',
    type: 'shortcut',
    icon: Calendar,
    action: () => {
      toast.info('Opening follow-up scheduler...')
      // Follow-up scheduling logic would go here
    },
    priority: 8,
    keywords: ['schedule', 'follow-up', 'customer', 'meeting']
  },
  {
    id: 'frequent-3',
    title: 'Mark as Favorite',
    description: 'Add current record to favorites',
    type: 'shortcut',
    icon: Star,
    action: () => {
      toast.success('Added to favorites!')
      // Favorite marking logic would go here
    },
    priority: 6,
    keywords: ['favorite', 'star', 'bookmark', 'save']
  }
]

export function CommandPaletteExample() {
  const navigate = useNavigate()
  const { open, setOpen } = useCommandPalette()

  // Handle navigation
  const handleNavigate = (path: string) => {
    console.log('Navigating to:', path)
    navigate(path)
    toast.success(`Navigated to ${path}`)
  }

  // Handle create record
  const handleCreateRecord = (type: string) => {
    console.log('Creating new:', type)
    
    // You would typically open a modal or navigate to a create form
    switch (type) {
      case 'organization':
        toast.success('Opening new organization form...')
        // navigate('/organizations/new')
        break
      case 'contact':
        toast.success('Opening new contact form...')
        // navigate('/contacts/new')
        break
      case 'product':
        toast.success('Opening new product form...')
        // navigate('/products/new')
        break
      case 'opportunity':
        toast.success('Opening new opportunity form...')
        // navigate('/opportunities/new')
        break
      case 'interaction':
        toast.success('Opening interaction log...')
        // Open interaction logging modal
        break
      default:
        toast.error('Unknown record type')
    }
  }

  // Enhanced search function that could call your API
  const handleSearchResults = (query: string): SearchResult[] => {
    // In a real application, this would make an API call
    // const results = await searchAPI(query)
    
    // For demo purposes, use the sample function
    const results = sampleSearchFunction(query)
    
    // You could add more sophisticated matching, ranking, etc.
    return results.map(result => ({
      ...result,
      action: () => {
        console.log('Opening record:', result.title)
        toast.info(`Opening ${result.title}...`)
        // Navigate to the specific record
        // navigate(`/${result.type}s/${result.id}`)
      }
    }))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">CRM Command Palette Example</h2>
        <p className="text-muted-foreground">
          The command palette provides quick access to navigation, search, and actions throughout your CRM.
          Press <kbd className="px-1.5 py-0.5 text-xs border rounded">⌘K</kbd> or{' '}
          <kbd className="px-1.5 py-0.5 text-xs border rounded">Ctrl+K</kbd> to open it anywhere.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">🔍 Global Search</h3>
          <p className="text-sm text-muted-foreground">
            Search across all your CRM records - organizations, contacts, products, and opportunities.
          </p>
        </div>
        
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">⚡ Quick Navigation</h3>
          <p className="text-sm text-muted-foreground">
            Jump to any section with keyboard shortcuts. No more clicking through menus.
          </p>
        </div>
        
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">➕ Quick Create</h3>
          <p className="text-sm text-muted-foreground">
            Create new records instantly without navigating to forms first.
          </p>
        </div>
        
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">🕒 Recent Items</h3>
          <p className="text-sm text-muted-foreground">
            Quickly access your recently viewed contacts, organizations, and opportunities.
          </p>
        </div>
        
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">⭐ Frequent Actions</h3>
          <p className="text-sm text-muted-foreground">
            Personalized shortcuts to your most-used actions and reports.
          </p>
        </div>
        
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">📊 Smart Actions</h3>
          <p className="text-sm text-muted-foreground">
            Export data, generate reports, schedule meetings, and more.
          </p>
        </div>
      </div>

      {/* Keyboard Shortcuts Reference */}
      <div className="border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Keyboard Shortcuts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Open Command Palette</span>
              <kbd className="px-2 py-1 text-xs border rounded">⌘K</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>Go to Dashboard</span>
              <kbd className="px-2 py-1 text-xs border rounded">⌘H</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>Go to Organizations</span>
              <kbd className="px-2 py-1 text-xs border rounded">⌘O</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>Go to Contacts</span>
              <kbd className="px-2 py-1 text-xs border rounded">⌘C</kbd>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Go to Products</span>
              <kbd className="px-2 py-1 text-xs border rounded">⌘P</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>Go to Opportunities</span>
              <kbd className="px-2 py-1 text-xs border rounded">⌘U</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>Go to Interactions</span>
              <kbd className="px-2 py-1 text-xs border rounded">⌘I</kbd>
            </div>
          </div>
        </div>
      </div>

      {/* Command Palette Component */}
      <CRMCommandPalette
        open={open}
        setOpen={setOpen}
        onNavigate={handleNavigate}
        onCreateRecord={handleCreateRecord}
        onSearchResults={handleSearchResults}
        recentItems={sampleRecentItems}
        frequentActions={sampleFrequentActions}
      />

      {/* Usage Instructions */}
      <div className="border rounded-lg p-6 bg-muted/50">
        <h3 className="font-semibold mb-2">Try It Out!</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Click the search button above or press <kbd className="px-1.5 py-0.5 text-xs border rounded bg-background">⌘K</kbd> to open the command palette.
        </p>
        <div className="text-sm space-y-2">
          <p><strong>Try searching for:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>"Metro" - Find organizations and contacts</li>
            <li>"create contact" - Quick creation actions</li>
            <li>"dashboard" - Navigation commands</li>
            <li>"export" - Action commands</li>
          </ul>
        </div>
      </div>
    </div>
  )
}