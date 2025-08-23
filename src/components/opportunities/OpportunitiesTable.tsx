import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Plus, 
  Search, 
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { cn, formatTimeAgo, isOpportunityStalled, getStalledDays } from '@/lib/utils'
import { useOpportunitiesWithLastActivity } from '@/hooks/useOpportunities'
import type { OpportunityFilters } from '@/types/entities'
import type { OpportunityWithLastActivity } from '@/types/opportunity.types'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface OpportunitiesTableProps {
  filters?: OpportunityFilters
  onEdit?: (opportunity: OpportunityWithLastActivity) => void
  onDelete?: (opportunity: OpportunityWithLastActivity) => void
  onView?: (opportunity: OpportunityWithLastActivity) => void
  onAddNew?: () => void
}

type SortField = 'last_activity' | 'company' | 'stage' | 'value' | 'probability'
type SortDirection = 'asc' | 'desc'

export function OpportunitiesTable({ 
  filters,
  onEdit, 
  onDelete, 
  onView,
  onAddNew
}: OpportunitiesTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<SortField>('last_activity')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  
  const { data: opportunities = [], isLoading } = useOpportunitiesWithLastActivity(filters)

  // Filter opportunities by search term
  const filteredOpportunities = opportunities.filter(opportunity =>
    opportunity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opportunity.organization?.name && opportunity.organization.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (opportunity.contact && `${opportunity.contact.first_name} ${opportunity.contact.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Sort opportunities
  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1
    
    switch (sortField) {
      case 'last_activity':
        if (a.last_activity_date && b.last_activity_date) {
          return (new Date(a.last_activity_date).getTime() - new Date(b.last_activity_date).getTime()) * direction
        }
        if (a.last_activity_date && !b.last_activity_date) return -1 * direction
        if (!a.last_activity_date && b.last_activity_date) return 1 * direction
        return (new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()) * direction
      
      case 'company':
        const aName = a.organization?.name || 'Z'
        const bName = b.organization?.name || 'Z'
        return aName.localeCompare(bName) * direction
      
      case 'stage':
        return a.stage.localeCompare(b.stage) * direction
      
      case 'value':
        const aValue = a.estimated_value || 0
        const bValue = b.estimated_value || 0
        return (aValue - bValue) * direction
      
      case 'probability':
        const aProb = a.probability || 0
        const bProb = b.probability || 0
        return (aProb - bProb) * direction
      
      default:
        return 0
    }
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection(field === 'last_activity' ? 'desc' : 'asc') // Default last activity to desc
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(sortedOpportunities.map(opp => opp.id)))
    } else {
      setSelectedItems(new Set())
    }
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedItems)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedItems(newSelected)
  }

  // Stage configuration with colors matching the spec
  const getStageConfig = (stage: string) => {
    const configs: Record<string, { dot: string; position: number }> = {
      "New Lead": { dot: "bg-blue-500", position: 1 },
      "Initial Outreach": { dot: "bg-purple-500", position: 2 },
      "Sample/Visit Offered": { dot: "bg-yellow-500", position: 3 },
      "Awaiting Response": { dot: "bg-orange-500", position: 4 },
      "Feedback Logged": { dot: "bg-pink-500", position: 5 },
      "Demo Scheduled": { dot: "bg-green-500", position: 6 },
      "Closed - Won": { dot: "bg-emerald-500", position: 7 }
    }
    return configs[stage] || configs["New Lead"]
  }

  const formatCurrency = (value: number | null) => {
    if (!value) return 'N/A'
    if (value >= 1000000) return `$${(value/1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value/1000).toFixed(0)}K`
    return `$${value.toLocaleString()}`
  }

  const formatActivityType = (type: string | null) => {
    if (!type) return 'No interactions'
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const SortableHeader = ({ field, children, className }: { 
    field: SortField
    children: React.ReactNode
    className?: string 
  }) => (
    <TableHead 
      className={cn(
        "font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors select-none",
        className
      )}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === 'desc' ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />
        )}
      </div>
    </TableHead>
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Search bar */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search opportunities..."
              className="w-64"
              disabled
            />
          </div>
          {onAddNew && (
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              Add Opportunity
            </Button>
          )}
        </div>
        
        {/* Loading state */}
        <div className="border rounded-lg bg-white shadow-sm">
          <div className="p-8 text-center text-gray-500">
            Loading opportunities...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search bar - only search box on right as specified */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search opportunities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        {onAddNew && (
          <Button onClick={onAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Opportunity
          </Button>
        )}
      </div>

      {/* Minimal table - starts directly with headers */}
      <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            {/* Sticky header with white background */}
            <TableHeader className="sticky top-0 z-20 bg-white shadow-sm border-b border-gray-200">
              <TableRow className="bg-gray-50/80">
                {/* Checkbox column - 40px fixed */}
                <TableHead className="w-[40px] px-6 py-3">
                  <Checkbox
                    checked={selectedItems.size === sortedOpportunities.length && sortedOpportunities.length > 0}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                
                {/* Company/Opportunity - 35% */}
                <SortableHeader field="company" className="w-[35%] px-6 py-3 text-xs">
                  Company / Opportunity
                </SortableHeader>
                
                {/* Stage - 20% */}
                <SortableHeader field="stage" className="w-[20%] px-6 py-3 text-xs">
                  Stage
                </SortableHeader>
                
                {/* Value/Probability - 15% */}
                <SortableHeader field="value" className="w-[15%] px-6 py-3 text-xs text-right">
                  Value / Probability
                </SortableHeader>
                
                {/* Last Interaction - 20% - Default sort */}
                <SortableHeader field="last_activity" className="w-[20%] px-6 py-3 text-xs text-right">
                  Last Interaction
                </SortableHeader>
                
                {/* Actions - 10% */}
                <TableHead className="w-[10%] px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {sortedOpportunities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No opportunities match your search.' : (
                      <div className="space-y-2">
                        <div>No opportunities yet</div>
                        {onAddNew && (
                          <Button variant="outline" onClick={onAddNew} className="mt-2">
                            Add First Opportunity
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                sortedOpportunities.map((opportunity) => {
                  const stalled = isOpportunityStalled(opportunity.stage_updated_at || null, opportunity.created_at || '')
                  const stalledDays = stalled ? getStalledDays(opportunity.stage_updated_at || null, opportunity.created_at || '') : 0
                  const stageConfig = getStageConfig(opportunity.stage)
                  
                  return (
                    <TableRow 
                      key={opportunity.id}
                      className="h-[52px] hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100"
                      onClick={() => onView?.(opportunity)}
                    >
                      {/* Checkbox */}
                      <TableCell className="px-6 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedItems.has(opportunity.id)}
                          onCheckedChange={(checked) => handleSelectItem(opportunity.id, !!checked)}
                          aria-label={`Select ${opportunity.name}`}
                        />
                      </TableCell>
                      
                      {/* Company / Opportunity */}
                      <TableCell className="px-6 py-2.5">
                        <div>
                          <div className="font-medium text-sm text-gray-900">
                            {opportunity.organization?.name || 'No Organization'}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {opportunity.name} • {opportunity.interaction_count || 0} interactions
                          </div>
                        </div>
                      </TableCell>
                      
                      {/* Stage */}
                      <TableCell className="px-6 py-2.5">
                        <div className="flex items-center gap-1.5">
                          {/* Stage color dot */}
                          <span className={cn("w-2 h-2 rounded-full", stageConfig.dot)}></span>
                          
                          {/* Stalled indicator - red pulsing dot */}
                          {stalled && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Stalled for {stalledDays} days</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          
                          <span className="text-sm font-medium">{opportunity.stage}</span>
                          <span className="text-xs text-gray-400">{stageConfig.position}/7</span>
                        </div>
                      </TableCell>
                      
                      {/* Value / Probability */}
                      <TableCell className="px-6 py-2.5 text-right">
                        <div>
                          <div className="font-medium text-sm">{formatCurrency(opportunity.estimated_value)}</div>
                          <div className="text-xs text-gray-500">
                            {opportunity.probability ? `${opportunity.probability}% likely` : 'No probability'}
                          </div>
                        </div>
                      </TableCell>
                      
                      {/* Last Interaction */}
                      <TableCell className="px-6 py-2.5 text-right">
                        <div>
                          <div className="text-sm text-gray-900">
                            {formatTimeAgo(opportunity.last_activity_date || null)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatActivityType(opportunity.last_activity_type || null)}
                          </div>
                        </div>
                      </TableCell>
                      
                      {/* Actions */}
                      <TableCell className="px-6 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-6 w-6 p-0 hover:bg-gray-100 rounded">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onView && (
                              <DropdownMenuItem onClick={() => onView(opportunity)}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            )}
                            {onEdit && (
                              <DropdownMenuItem onClick={() => onEdit(opportunity)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <DropdownMenuItem 
                                onClick={() => onDelete(opportunity)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}