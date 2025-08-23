import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Activity, 
  Target, 
  User, 
  Building2, 
  Package, 
  Phone, 
  Mail, 
  Calendar,
  MessageSquare,
  Heart,
  Clock,
  Filter,
  RefreshCw
} from 'lucide-react'
import { format, parseISO, isToday, isYesterday, subDays } from 'date-fns'
import { useOrganizations } from '@/hooks/useOrganizations'
import { useContacts } from '@/hooks/useContacts'
import { useOpportunities } from '@/hooks/useOpportunities'
import { useInteractions } from '@/hooks/useInteractions'
import { useProducts } from '@/hooks/useProducts'

export interface ActivityItem {
  id: string
  type: 'opportunity' | 'interaction' | 'contact' | 'organization' | 'product'
  title: string
  description: string
  timestamp: Date
  entity?: string
  priority?: 'high' | 'medium' | 'low'
  status?: string
  relatedData?: any
}

interface EnhancedActivityFeedProps {
  limit?: number
  className?: string
  showFilters?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

const ACTIVITY_ICONS = {
  opportunity: Target,
  interaction: MessageSquare,
  contact: User,
  organization: Building2,
  product: Package
}

const INTERACTION_TYPE_ICONS = {
  phone: Phone,
  email: Mail,
  meeting: Calendar,
  demo: Heart,
  follow_up: RefreshCw
}

export function EnhancedActivityFeed({ 
  limit = 20, 
  className,
  showFilters = true,
  autoRefresh = false,
  refreshInterval = 30000
}: EnhancedActivityFeedProps) {
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [refreshKey, setRefreshKey] = useState(0)

  // Data hooks
  const { data: organizations = [], isLoading: orgLoading } = useOrganizations()
  const { data: contacts = [], isLoading: contactLoading } = useContacts()
  const { data: opportunities = [], isLoading: oppLoading } = useOpportunities()
  const { data: interactions = [], isLoading: intLoading } = useInteractions()
  const { data: products = [], isLoading: prodLoading } = useProducts()

  // Feature flag for new MFB compact styling
  const USE_NEW_STYLE = localStorage.getItem('useNewStyle') !== 'false'

  const isLoading = orgLoading || contactLoading || oppLoading || intLoading || prodLoading

  // Transform data into activity items
  const activityItems: ActivityItem[] = useMemo(() => {
    const items: ActivityItem[] = []

    // Organizations
    organizations.forEach(org => {
      if (org.created_at) {
        items.push({
          id: `org-${org.id}`,
          type: 'organization',
          title: org.name,
          description: `New ${org.type} organization added`,
          timestamp: parseISO(org.created_at),
          entity: org.name,
          status: org.is_active ? 'active' : 'inactive',
          priority: org.type === 'principal' ? 'high' : 'medium',
          relatedData: org
        })
      }
    })

    // Contacts
    contacts.forEach(contact => {
      if (contact.created_at) {
        items.push({
          id: `contact-${contact.id}`,
          type: 'contact',
          title: `${contact.first_name} ${contact.last_name}`,
          description: `New contact added${contact.title ? ` - ${contact.title}` : ''}`,
          timestamp: parseISO(contact.created_at),
          entity: `${contact.first_name} ${contact.last_name}`,
          status: contact.is_primary_contact ? 'primary' : 'active',
          priority: contact.is_primary_contact ? 'high' : 'medium',
          relatedData: contact
        })
      }
    })

    // Opportunities
    opportunities.forEach(opp => {
      if (opp.created_at) {
        items.push({
          id: `opp-${opp.id}`,
          type: 'opportunity',
          title: opp.name,
          description: `New opportunity created - ${opp.stage || 'New Lead'}`,
          timestamp: parseISO(opp.created_at),
          entity: opp.name,
          status: opp.stage?.toLowerCase().replace(' ', '_') || 'new_lead',
          priority: opp.stage === 'Demo Scheduled' || opp.stage === 'Closed - Won' ? 'high' : 'medium',
          relatedData: opp
        })
      }
    })

    // Interactions
    interactions.forEach(interaction => {
      if (interaction.created_at) {
        const InteractionIcon = INTERACTION_TYPE_ICONS[interaction.type as keyof typeof INTERACTION_TYPE_ICONS]
        items.push({
          id: `int-${interaction.id}`,
          type: 'interaction',
          title: `${interaction.type || 'Contact'} - ${interaction.subject || 'Interaction'}`,
          description: interaction.subject || `New ${interaction.type} interaction recorded`,
          timestamp: parseISO(interaction.created_at),
          entity: interaction.subject,
          status: 'completed',
          priority: interaction.type === 'demo' || interaction.type === 'meeting' ? 'high' : 'medium',
          relatedData: { ...interaction, icon: InteractionIcon }
        })
      }
    })

    // Products
    products.forEach(product => {
      if (product.created_at) {
        items.push({
          id: `prod-${product.id}`,
          type: 'product',
          title: product.name,
          description: `New product added${product.category ? ` - ${product.category}` : ''}`,
          timestamp: parseISO(product.created_at),
          entity: product.name,
          status: 'active',
          priority: 'low',
          relatedData: product
        })
      }
    })

    return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [organizations, contacts, opportunities, interactions, products, refreshKey])

  // Filter activity items
  const filteredItems = useMemo(() => {
    let filtered = activityItems

    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType)
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(item => item.priority === selectedPriority)
    }

    return filtered.slice(0, limit)
  }, [activityItems, selectedType, selectedPriority, limit])

  const formatTimestamp = (timestamp: Date): string => {
    if (isToday(timestamp)) {
      return `Today, ${format(timestamp, 'h:mm a')}`
    } else if (isYesterday(timestamp)) {
      return `Yesterday, ${format(timestamp, 'h:mm a')}`
    } else if (timestamp > subDays(new Date(), 7)) {
      return format(timestamp, 'EEE, MMM d, h:mm a')
    } else {
      return format(timestamp, 'MMM d, yyyy, h:mm a')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  if (isLoading) {
    return (
      <Card className={`${USE_NEW_STYLE ? "shadow-sm" : "shadow-md"} ${className}`}>
        <CardHeader className={USE_NEW_STYLE ? "p-4 pb-3" : "p-6 pb-4"}>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className={USE_NEW_STYLE ? "p-4 pt-0" : "p-6 pt-0"}>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${USE_NEW_STYLE ? "shadow-sm border-primary/10" : "shadow-md"} ${className}`}>
      <CardHeader className={USE_NEW_STYLE ? "p-4 pb-3" : "p-6 pb-4"}>
        <div className="flex items-center justify-between">
          <CardTitle className={`flex items-center gap-2 ${USE_NEW_STYLE ? "text-base font-bold text-[hsl(var(--foreground))]" : "text-lg font-semibold"}`}>
            <Activity className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        {showFilters && (
          <div className="flex flex-wrap gap-2 mt-3">
            <Button
              variant={selectedType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('all')}
              className="h-7 px-3 text-xs"
            >
              All
            </Button>
            <Button
              variant={selectedType === 'opportunity' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('opportunity')}
              className="h-7 px-3 text-xs"
            >
              Opportunities
            </Button>
            <Button
              variant={selectedType === 'interaction' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('interaction')}
              className="h-7 px-3 text-xs"
            >
              Interactions
            </Button>
            <Button
              variant={selectedType === 'contact' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('contact')}
              className="h-7 px-3 text-xs"
            >
              Contacts
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className={USE_NEW_STYLE ? "p-4 pt-0" : "p-6 pt-0"}>
        {filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Recent Activity</h3>
            <p className="text-sm text-muted-foreground">
              No activities match your current filters.
            </p>
          </div>
        ) : (
          <div className={`space-y-3 max-h-[400px] overflow-y-auto ${USE_NEW_STYLE ? "pr-2" : "pr-3"}`}>
            {filteredItems.map((item) => {
              const IconComponent = ACTIVITY_ICONS[item.type]
              const InteractionIcon = item.relatedData?.icon
              
              return (
                <div 
                  key={item.id} 
                  className={`flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-border hover:bg-muted/30 transition-colors cursor-pointer ${USE_NEW_STYLE ? "p-2" : ""}`}
                >
                  <div className={`flex-shrink-0 ${USE_NEW_STYLE ? "mt-0.5" : "mt-1"}`}>
                    {InteractionIcon ? (
                      <InteractionIcon className="h-4 w-4 text-primary" />
                    ) : (
                      <IconComponent className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`font-medium truncate ${USE_NEW_STYLE ? "text-sm text-[hsl(var(--foreground))]" : "text-sm"}`}>
                        {item.title}
                      </h4>
                      {item.priority && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-2 py-0 ${getPriorityColor(item.priority)}`}
                        >
                          {item.priority}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimestamp(item.timestamp)}</span>
                      {item.status && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{item.status.replace('_', ' ')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {filteredItems.length > 0 && filteredItems.length === limit && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm" className="text-xs">
              View All Activity
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}