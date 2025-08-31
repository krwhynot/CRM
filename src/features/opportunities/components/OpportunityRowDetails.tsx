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
  MessageSquare,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  OpportunityWithRelations,
  InteractionWithRelations,
} from '@/types/entities' /* ui-audit: allow */

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
  onInteractionItemClick,
}) => {
  // Format currency utility function
  const formatCurrency = (value: number | null): string => {
    if (!value) return 'N/A'
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value.toLocaleString()}`
  }

  // Format date utility function
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Not set'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
      'Closed - Lost': 'bg-red-100 text-red-800 border-red-200',
    }
    return stageColors[stage] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <TableRow>
      <TableCell colSpan={6} className="border-b-0 p-0">
        <div className="border-t border-gray-100 bg-gray-50">
          <Card className="border-0 bg-transparent shadow-none">
            <CardContent className="p-6">
              {/* Opportunity Header */}
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h3 className="mb-1 text-lg font-semibold text-gray-900">{opportunity.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="size-4" />
                    {opportunity.organization?.name || 'No Organization'}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn('text-sm font-medium', getStageColor(opportunity.stage))}
                >
                  {opportunity.stage}
                </Badge>
              </div>

              {/* Opportunity Details Grid */}
              <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Estimated Value */}
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <DollarSign className="size-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Value</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    {formatCurrency(opportunity.estimated_value || 0)}
                  </div>
                  {opportunity.probability && (
                    <div className="mt-1 text-sm text-gray-600">
                      {opportunity.probability}% probability
                    </div>
                  )}
                </div>

                {/* Contact */}
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <User className="size-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Contact</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {opportunity.contact
                      ? `${opportunity.contact.first_name} ${opportunity.contact.last_name}`
                      : 'No contact assigned'}
                  </div>
                  {opportunity.contact?.email && (
                    <div className="mt-1 text-sm text-gray-600">{opportunity.contact.email}</div>
                  )}
                </div>

                {/* Close Date */}
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <CalendarDays className="size-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Close Date</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {opportunity.estimated_close_date
                      ? formatDate(opportunity.estimated_close_date)
                      : 'Not set'}
                  </div>
                </div>

                {/* Next Action */}
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Target className="size-4 text-orange-600" />
                    <span className="text-sm font-medium text-gray-700">Next Action</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {opportunity.next_action || 'No action set'}
                  </div>
                  {opportunity.next_action_date && (
                    <div className="mt-1 text-sm text-gray-600">
                      {formatDate(opportunity.next_action_date)}
                    </div>
                  )}
                </div>
              </div>

              {/* Description & Notes */}
              {(opportunity.description || opportunity.notes) && (
                <>
                  <div className="my-4 border-t border-gray-200"></div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {opportunity.description && (
                      <div>
                        <h4 className="mb-2 text-sm font-semibold text-gray-700">Description</h4>
                        <p className="text-sm leading-relaxed text-gray-600">
                          {opportunity.description}
                        </p>
                      </div>
                    )}
                    {opportunity.notes && (
                      <div>
                        <h4 className="mb-2 text-sm font-semibold text-gray-700">Notes</h4>
                        <p className="text-sm leading-relaxed text-gray-600">{opportunity.notes}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Activity Timeline */}
              <div className="my-6 border-t border-gray-200"></div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="flex items-center gap-2 text-base font-semibold text-gray-900">
                    <MessageSquare className="size-4" />
                    Activity Timeline
                  </h4>
                  {onAddInteraction && (
                    <Button
                      onClick={onAddInteraction}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Plus className="size-4" />
                      Add Activity
                    </Button>
                  )}
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <InteractionTimeline
                    interactions={interactions}
                    loading={activitiesLoading}
                    onEditInteraction={onEditInteraction || (() => {})}
                    onDeleteInteraction={onDeleteInteraction || (() => {})}
                    onItemClick={onInteractionItemClick || (() => {})}
                    onAddNew={onAddInteraction || (() => {})}
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
