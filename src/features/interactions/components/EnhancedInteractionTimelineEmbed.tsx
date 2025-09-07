import React, { useMemo, useState, useCallback } from 'react'
import { useInteractionsByOpportunity } from '../hooks/useInteractions'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { 
  Phone, Mail, Calendar, Users, Package, 
  FileText, AlertCircle, Building,
  User, ChevronRight, Clock, ChevronDown, 
  ChevronUp, MapPin, FileCheck, MessageSquare
} from 'lucide-react'
import { format, parseISO, isThisWeek, isToday, isYesterday } from 'date-fns'
import { cn } from '@/lib/utils'
import { useIsMobile, useIsIPad } from '@/hooks/useMediaQuery'
import type { 
  InteractionWithRelations, 
  InteractionPriority
} from '@/types/entities'
import { PRIORITY_COLORS } from '@/types/interaction.types'

interface EnhancedInteractionTimelineEmbedProps {
  opportunityId: string
  maxHeight?: string
  showGrouping?: boolean
  onAddNew?: () => void
  className?: string
  enabled?: boolean
}

// Icon mapping for interaction types including new ones
const INTERACTION_ICONS = {
  'in_person': Users,
  'call': Phone, 
  'email': Mail,
  'meeting': Calendar,
  'quoted': FileText,
  'distribution': Package,
  'demo': Users,
  'proposal': FileText,
  'follow_up': Phone,
  'trade_show': Users,
  'site_visit': MapPin,
  'contract_review': FileCheck,
} as const

export function EnhancedInteractionTimelineEmbed({ 
  opportunityId, 
  maxHeight = '500px',
  showGrouping = true,
  onAddNew,
  className,
  enabled = true
}: EnhancedInteractionTimelineEmbedProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [showAll, setShowAll] = useState(false)
  
  const isMobile = useIsMobile()
  const isIPad = useIsIPad()
  
  const { data: interactions, isLoading, error } = useInteractionsByOpportunity(opportunityId, { enabled })

  // Group interactions by date
  const groupedInteractions = useMemo(() => {
    if (!interactions) return {}
    
    const groups: Record<string, InteractionWithRelations[]> = {}
    
    interactions.forEach((interaction) => {
      const date = parseISO(interaction.interaction_date)
      let groupKey = format(date, 'MMMM d, yyyy')
      
      if (isToday(date)) groupKey = 'Today'
      else if (isYesterday(date)) groupKey = 'Yesterday'
      else if (isThisWeek(date)) groupKey = 'This Week'
      
      if (!groups[groupKey]) groups[groupKey] = []
      groups[groupKey].push(interaction)
    })
    
    return groups
  }, [interactions])

  const handleToggleExpand = useCallback((interactionId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(interactionId)) {
        newSet.delete(interactionId)
      } else {
        newSet.add(interactionId)
      }
      return newSet
    })
  }, [])

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("text-center py-6 text-red-600", className)}>
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p className="text-sm font-medium">Failed to load interactions</p>
        <p className="text-xs mt-1">Please try refreshing the page</p>
      </div>
    )
  }

  if (!interactions?.length) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-600 font-medium mb-1">No interactions yet</p>
        <p className="text-sm text-gray-500">
          Start tracking customer touchpoints to see them here
        </p>
        {onAddNew && (
          <Button onClick={onAddNew} className="mt-4" size="sm">
            Add First Interaction
          </Button>
        )}
      </div>
    )
  }

  // Mobile-responsive display logic
  let maxDisplayed: number
  if (isMobile) {
    maxDisplayed = showAll ? interactions.length : 3
  } else if (isIPad) {
    maxDisplayed = showAll ? interactions.length : 5
  } else {
    maxDisplayed = showAll ? interactions.length : 4
  }
  
  const hasMore = interactions.length > maxDisplayed
  const remaining = interactions.length - maxDisplayed

  return (
    <ScrollArea className="w-full" style={{ height: maxHeight }}>
      <div className={cn("space-y-6 pr-4", className)}>
        {Object.entries(groupedInteractions).map(([groupName, groupInteractions]) => (
          <div key={groupName}>
            {showGrouping && (
              <div className="sticky top-0 bg-white z-10 pb-2 mb-3">
                <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  {groupName}
                  <Badge variant="secondary" className="ml-auto">
                    {groupInteractions.length}
                  </Badge>
                </h4>
                <div className="h-px bg-gray-200 mt-2" />
              </div>
            )}
            
            <div className="space-y-3">
              {groupInteractions.slice(0, maxDisplayed).map((interaction) => (
                <InteractionCard 
                  key={interaction.id} 
                  interaction={interaction} 
                  isExpanded={expandedItems.has(interaction.id)}
                  onToggleExpand={() => handleToggleExpand(interaction.id)}
                />
              ))}
            </div>
          </div>
        ))}
        
        {hasMore && (
          <div className="border-t pt-4 text-center">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-2 w-full md:w-auto"
            >
              {showAll ? (
                <>
                  <ChevronUp className="size-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="size-4" />
                  Show {remaining} More
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}

// Individual Enhanced Interaction Card Component
function InteractionCard({ 
  interaction, 
  isExpanded, 
  onToggleExpand 
}: { 
  interaction: InteractionWithRelations
  isExpanded: boolean
  onToggleExpand: () => void
}) {
  const Icon = INTERACTION_ICONS[interaction.type] || MessageSquare
  const priorityColors = interaction.priority ? PRIORITY_COLORS[interaction.priority as InteractionPriority] : null
  
  return (
    <div className="group relative flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
      {/* Priority Badge */}
      {interaction.priority && (
        <div className="absolute -left-2 top-3">
          <Badge className={cn("h-5 w-8 text-xs font-bold", priorityColors?.badge)}>
            {interaction.priority}
          </Badge>
        </div>
      )}
      
      {/* Icon */}
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
        "bg-blue-100 text-blue-600",
        interaction.priority && "ml-4" // Offset for priority badge
      )}>
        <Icon className="h-5 w-5" />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-sm text-gray-900 capitalize">
                {interaction.type.replace('_', ' ')}
              </p>
              {interaction.subject && (
                <span className="text-gray-600 text-sm">• {interaction.subject}</span>
              )}
            </div>
            
            {/* Metadata Row */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              {/* Organization */}
              {interaction.organization && (
                <span className="flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  {interaction.organization.name}
                  {interaction.organization.formula && (
                    <span className="text-gray-400">({interaction.organization.formula})</span>
                  )}
                </span>
              )}
              
              {/* Contact */}
              {interaction.contact && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {interaction.contact.first_name} {interaction.contact.last_name}
                  {interaction.contact.dropdown && (
                    <span className="text-gray-400">- {interaction.contact.dropdown}</span>
                  )}
                </span>
              )}
            </div>
          </div>
          
          {/* Time & Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {format(parseISO(interaction.interaction_date), 'h:mm a')}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpand}
              className="h-6 w-6 p-0"
            >
              <ChevronRight className={cn(
                "h-3 w-3 transition-transform",
                isExpanded && "rotate-90"
              )} />
            </Button>
          </div>
        </div>
        
        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-3 space-y-3 pl-2 border-l-2 border-gray-100">
            {/* Account Manager */}
            {interaction.account_manager && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600">Account Manager:</span>
                <Badge variant="outline" className="text-xs">
                  {interaction.account_manager}
                </Badge>
              </div>
            )}
            
            {/* Principals */}
            {interaction.principals && interaction.principals.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-gray-600">Principals:</span>
                <div className="flex flex-wrap gap-1">
                  {interaction.principals.map((principal, idx) => (
                    <div key={idx} className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {principal.name}
                      </Badge>
                      {principal.principal2 && (
                        <Badge variant="secondary" className="text-xs">
                          {principal.principal2}
                        </Badge>
                      )}
                      {principal.principal3 && (
                        <Badge variant="secondary" className="text-xs">
                          {principal.principal3}
                        </Badge>
                      )}
                      {principal.principal4 && (
                        <Badge variant="secondary" className="text-xs">
                          {principal.principal4}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Description/Notes */}
            {(interaction.description || interaction.notes) && (
              <div className="bg-gray-50 rounded p-2 text-sm text-gray-700">
                {interaction.description || interaction.notes}
              </div>
            )}
            
            {/* Follow-up indicator */}
            {interaction.follow_up_required && (
              <div className="flex items-center gap-1 text-xs text-orange-600">
                <AlertCircle className="h-3 w-3" />
                Follow-up required
                {interaction.follow_up_date && (
                  <span className="text-gray-500">
                    by {format(parseISO(interaction.follow_up_date), 'MMM d')}
                  </span>
                )}
              </div>
            )}
            
            {/* Import Notes */}
            {interaction.import_notes && (
              <div className="text-xs text-gray-400 italic">
                Import notes: {interaction.import_notes}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}