import React from 'react'
import { TableRow, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { InteractionTimeline } from '@/features/interactions/components/InteractionTimeline' /* ui-audit: allow */
import { 
  CalendarDays, 
  DollarSign, 
  Target, 
  Building2, 
  User, 
  Phone, 
  MessageSquare,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OpportunityWithRelations, InteractionWithRelations } from '@/types/entities' /* ui-audit: allow */

interface OpportunityRowDetailsProps {
  opportunity: OpportunityWithRelations
  interactions?: InteractionWithRelations[] /* ui-audit: allow */
  activitiesLoading?: boolean
  onAddInteraction?: () => void /* ui-audit: allow */
  onEditInteraction?: (interaction: InteractionWithRelations) => void /* ui-audit: allow */
  onDeleteInteraction?: (interaction: InteractionWithRelations) => void /* ui-audit: allow */
  onInteractionItemClick?: (interaction: InteractionWithRelations) => void /* ui-audit: allow */
}

export const OpportunityRowDetails: React.FC<OpportunityRowDetailsProps> = ({
  opportunity,
  interactions = [],
  activitiesLoading = false,
  onAddInteraction,
  onEditInteraction,
  onDeleteInteraction,
  onInteractionItemClick
}) => {
  // Format currency utility function
  const formatCurrency = (value: number | null): string => {
    if (!value) return 'N/A'
    if (value >= 1000000) return `$${(value/1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value/1000).toFixed(0)}K`
    return `$${value.toLocaleString()}`
  }

  // Format date utility function
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Not set'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  // Get stage color configuration
  const getStageColor = (stage: string) => {
    const stageColors: Record<string, string> = {
      'New Lead': 'bg-blue-100 text-blue-800 border-blue-200',
      'Initial Outreach': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Sample/Visit Offered': 'bg-purple-100 text-purple-800 border-purple-200',
      'Awaiting Response': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Feedback Logged': 'bg-orange-100 text-orange-800 border-orange-200',
      'Demo Scheduled': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'Closed - Won': 'bg-green-100 text-green-800 border-green-200',
      'Closed - Lost': 'bg-red-100 text-red-800 border-red-200'
    }
    return stageColors[stage] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <TableRow>
      <TableCell colSpan={6} className="p-0 border-b-0">
        <div className="bg-gray-50 border-t border-gray-100">
          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="p-6">
              {/* Opportunity Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {opportunity.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="h-4 w-4" />
                    {opportunity.organization?.name || 'No Organization'}
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={cn("text-sm font-medium", getStageColor(opportunity.stage))}
                >
                  {opportunity.stage}
                </Badge>
              </div>

              {/* Opportunity Details Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                {/* Estimated Value */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Value</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    {formatCurrency(opportunity.estimated_value || 0)}
                  </div>
                  {opportunity.probability && (
                    <div className="text-sm text-gray-600 mt-1">
                      {opportunity.probability}% probability
                    </div>
                  )}
                </div>

                {/* Contact */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Contact</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {opportunity.contact ? 
                      `${opportunity.contact.first_name} ${opportunity.contact.last_name}` : 
                      'No contact assigned'
                    }
                  </div>
                  {opportunity.contact?.email && (
                    <div className="text-sm text-gray-600 mt-1">
                      {opportunity.contact.email}
                    </div>
                  )}
                </div>

                {/* Close Date */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarDays className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Close Date</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {opportunity.estimated_close_date ? 
                      formatDate(opportunity.estimated_close_date) : 
                      'Not set'
                    }
                  </div>
                </div>

                {/* Next Action */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-gray-700">Next Action</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {opportunity.next_action || 'No action set'}
                  </div>
                  {opportunity.next_action_date && (
                    <div className="text-sm text-gray-600 mt-1">
                      {formatDate(opportunity.next_action_date)}
                    </div>
                  )}
                </div>
              </div>

              {/* Description & Notes */}
              {(opportunity.description || opportunity.notes) && (
                <>
                  <div className="border-t border-gray-200 my-4"></div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {opportunity.description && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {opportunity.description}
                        </p>
                      </div>
                    )}
                    {opportunity.notes && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {opportunity.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Activity Timeline */}
              <div className="border-t border-gray-200 my-6"></div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Activity Timeline
                  </h4>
                  {onAddInteraction && (
                    <Button
                      onClick={onAddInteraction}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Activity
                    </Button>
                  )}
                </div>
                
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <InteractionTimeline
                    interactions={interactions}
                    loading={activitiesLoading}
                    onEditInteraction={onEditInteraction}
                    onDeleteInteraction={onDeleteInteraction}
                    onItemClick={onInteractionItemClick}
                    onAddNew={onAddInteraction}
                    opportunityId={opportunity.id}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TableCell>
    </TableRow>
  )
}