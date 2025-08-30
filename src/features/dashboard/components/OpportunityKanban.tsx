import React from 'react'
import { Opportunity } from '@/types/dashboard'

interface OpportunityKanbanProps {
  opportunities: Opportunity[]
  principals?: Array<{ id: string; name: string; company: string }>
  loading?: boolean
}

// Elevated Stage Colors - Using CSS Variables
const ELEVATED_STAGE_COLORS = {
  'New Lead': {
    dark: 'hsl(var(--muted-foreground))',
    light: 'hsl(var(--muted))',
    text: 'hsl(var(--foreground))',
    border: 'hsl(var(--border))'
  },
  'Initial Outreach': {
    dark: 'hsl(var(--primary))',
    light: 'hsl(var(--primary) / 0.1)',
    text: 'hsl(var(--primary))',
    border: 'hsl(var(--primary) / 0.3)'
  },
  'Sample/Visit Offered': {
    dark: 'hsl(var(--chart-2))',
    light: 'hsl(var(--chart-2) / 0.1)',
    text: 'hsl(var(--chart-2))',
    border: 'hsl(var(--chart-2) / 0.3)'
  },
  'Awaiting Response': {
    dark: 'hsl(var(--chart-3))',
    light: 'hsl(var(--chart-3) / 0.1)',
    text: 'hsl(var(--chart-3))',
    border: 'hsl(var(--chart-3) / 0.3)'
  },
  'Feedback Logged': {
    dark: 'hsl(var(--chart-4))',
    light: 'hsl(var(--chart-4) / 0.1)',
    text: 'hsl(var(--chart-4))',
    border: 'hsl(var(--chart-4) / 0.3)'
  },
  'Demo Scheduled': {
    dark: 'hsl(var(--chart-5))',
    light: 'hsl(var(--chart-5) / 0.1)',
    text: 'hsl(var(--chart-5))',
    border: 'hsl(var(--chart-5) / 0.3)'
  },
  'Closed - Won': {
    dark: 'hsl(var(--chart-1))',
    light: 'hsl(var(--chart-1) / 0.1)',
    text: 'hsl(var(--chart-1))',
    border: 'hsl(var(--chart-1) / 0.3)'
  }
}

const STAGE_ORDER = [
  'New Lead',
  'Initial Outreach', 
  'Sample/Visit Offered',
  'Awaiting Response',
  'Feedback Logged',
  'Demo Scheduled',
  'Closed - Won'
]

export const OpportunityKanban: React.FC<OpportunityKanbanProps> = ({ 
  opportunities, 
  principals = [],
  loading 
}) => {
  // Map opportunity status to pipeline stages for demo purposes
  const getStageFromStatus = (_status: string, index: number): string => {
    // Distribute opportunities across stages for visual demo
    const stageIndex = index % STAGE_ORDER.length
    return STAGE_ORDER[stageIndex]
  }

  // Group opportunities by stage
  const opportunitiesByStage = React.useMemo(() => {
    const grouped = STAGE_ORDER.reduce((acc, stage) => {
      acc[stage] = []
      return acc
    }, {} as Record<string, typeof opportunities>)
    
    // Distribute opportunities across stages for demo
    opportunities.forEach((opp, index) => {
      const stage = getStageFromStatus(opp.status, index)
      grouped[stage].push(opp)
    })
    
    return grouped
  }, [opportunities])

  if (loading) {
    return (
      <div className="flex h-chart-sm w-full animate-pulse items-center justify-center rounded-lg bg-muted">
        <div className="text-sm text-muted-foreground">Loading pipeline...</div>
      </div>
    )
  }

  const totalOpportunities = opportunities.length

  return (
    <div className="kanban-section">
      {/* Section Header */}
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Sales Pipeline ({totalOpportunities} opportunities)
        </h3>
        <button className="text-xs text-muted-foreground hover:text-foreground">
          Expand ↕
        </button>
      </div>

      {/* Compact Pipeline Container */}
      <div className="h-chart-sm overflow-hidden rounded-lg border border-border bg-muted/30 p-2 shadow-sm">
        <div className="flex h-full gap-1">
            {STAGE_ORDER.map((stage) => {
              const stageOpportunities = opportunitiesByStage[stage] || []
              const colors = ELEVATED_STAGE_COLORS[stage as keyof typeof ELEVATED_STAGE_COLORS]
              const stageCount = stageOpportunities.length
              
              return (
                <div
                  key={stage}
                  className="flex min-w-kanban-column flex-1 flex-col overflow-hidden rounded border bg-card"
                  style={{
                    borderColor: colors.border
                  }}
                  role="region"
                  aria-label={`${stage} column with ${stageCount} opportunities`}
                >
                  {/* Elevated Sticky Header */}
                  <div 
                    className="sticky top-0 z-10 flex items-center justify-between border-b-2 px-3 py-2 text-sm font-semibold text-white"
                    style={{ 
                      backgroundColor: colors.dark,
                      borderBottomColor: colors.border
                    }}
                  >
                    <span>{stage}</span>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-normal">
                      {stageCount}
                    </span>
                  </div>

                  {/* Scrollable Cards Container */}
                  <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 max-h-kanban-content flex-1 overflow-y-auto p-2">
                    {stageOpportunities.map((opportunity) => {
                      const principal = principals.find(p => p.id === opportunity.principalId)
                      const organizationName = principal?.company || principal?.name || 'Unknown Organization'
                      
                      return (
                        <div
                          key={opportunity.id}
                          className="mb-1.5 cursor-grab rounded px-2 py-1.5 transition-all duration-200 hover:-translate-y-px hover:shadow-sm"
                          style={{
                            backgroundColor: colors.light,
                            color: colors.text,
                            border: `1px solid ${colors.border}`
                          }}
                          role="button"
                          tabIndex={0}
                          aria-label={`Opportunity: ${opportunity.title} - ${organizationName}`}
                        >
                          <div className="truncate text-xs font-medium">
                            {organizationName}
                          </div>
                          <div className="truncate text-xs opacity-75">
                            {opportunity.title}
                          </div>
                        </div>
                      )
                    })}
                    
                    {/* Empty State */}
                    {stageOpportunities.length === 0 && (
                      <div className="py-4 text-center text-xs text-muted-foreground">
                        No opportunities
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

export default OpportunityKanban