import React from 'react'
import type { Opportunity } from '@/types/dashboard'
import { CollapsibleSection } from '@/components/ui/CollapsibleSection'
import { useDashboardDensity } from '../hooks/useDashboardDensity'
import { cn } from '@/lib/utils'

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
    border: 'hsl(var(--border))',
  },
  'Initial Outreach': {
    dark: 'hsl(var(--primary))',
    light: 'hsl(var(--primary) / 0.1)',
    text: 'hsl(var(--primary))',
    border: 'hsl(var(--primary) / 0.3)',
  },
  'Sample/Visit Offered': {
    dark: 'hsl(var(--chart-2))',
    light: 'hsl(var(--chart-2) / 0.1)',
    text: 'hsl(var(--chart-2))',
    border: 'hsl(var(--chart-2) / 0.3)',
  },
  'Awaiting Response': {
    dark: 'hsl(var(--chart-3))',
    light: 'hsl(var(--chart-3) / 0.1)',
    text: 'hsl(var(--chart-3))',
    border: 'hsl(var(--chart-3) / 0.3)',
  },
  'Feedback Logged': {
    dark: 'hsl(var(--chart-4))',
    light: 'hsl(var(--chart-4) / 0.1)',
    text: 'hsl(var(--chart-4))',
    border: 'hsl(var(--chart-4) / 0.3)',
  },
  'Demo Scheduled': {
    dark: 'hsl(var(--chart-5))',
    light: 'hsl(var(--chart-5) / 0.1)',
    text: 'hsl(var(--chart-5))',
    border: 'hsl(var(--chart-5) / 0.3)',
  },
  'Closed - Won': {
    dark: 'hsl(var(--chart-1))',
    light: 'hsl(var(--chart-1) / 0.1)',
    text: 'hsl(var(--chart-1))',
    border: 'hsl(var(--chart-1) / 0.3)',
  },
}

const STAGE_ORDER = [
  'New Lead',
  'Initial Outreach',
  'Sample/Visit Offered',
  'Awaiting Response',
  'Feedback Logged',
  'Demo Scheduled',
  'Closed - Won',
]

export const OpportunityKanban: React.FC<OpportunityKanbanProps> = ({
  opportunities,
  principals = [],
  loading,
}) => {
  const { density } = useDashboardDensity()

  // Density-specific configurations for the kanban
  const densityConfig = {
    compact: {
      layout: 'horizontal',
      visibleStages: 3,
      cardStyle: 'mini', // title + amount only
      showContacts: false,
      showDetails: false,
      stageWidth: '240px',
      cardHeight: '60px'
    },
    comfortable: {
      layout: 'vertical',
      visibleStages: 4,
      cardStyle: 'standard', // key fields visible
      showContacts: false,
      showDetails: true,
      stageWidth: '280px',
      cardHeight: '120px'
    },
    spacious: {
      layout: 'vertical',
      visibleStages: 6,
      cardStyle: 'expanded', // all info + contacts
      showContacts: true,
      showDetails: true,
      stageWidth: '320px',
      cardHeight: '160px'
    }
  }

  const config = densityConfig[density]
  // Map opportunity status to pipeline stages for demo purposes
  const getStageFromStatus = (_status: string, index: number): string => {
    // Distribute opportunities across stages for visual demo
    const stageIndex = index % STAGE_ORDER.length
    return STAGE_ORDER[stageIndex]
  }

  // Group opportunities by stage
  const opportunitiesByStage = React.useMemo(() => {
    const grouped = STAGE_ORDER.reduce(
      (acc, stage) => {
        acc[stage] = []
        return acc
      },
      {} as Record<string, typeof opportunities>
    )

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
  
  // Calculate total pipeline value 
  const totalPipelineValue = opportunities.reduce((sum, opp) => {
    return sum + (opp.value || 0)
  }, 0)

  // Create a collapsed preview showing stage summaries + pipeline value
  const collapsedPreview = (
    <div className="space-y-2">
      {/* Pipeline Value Summary */}
      <div className="flex items-center justify-between rounded border border-primary/20 bg-primary/5 p-2">
        <span className="text-xs font-medium text-foreground">Total Pipeline Value</span>
        <span className="text-sm font-semibold text-primary">
          ${(totalPipelineValue / 1000000).toFixed(1)}M
        </span>
      </div>
      
      {/* Stage Summary */}
      <div className="flex gap-2 rounded-lg border border-border bg-muted/30 p-3">
        {STAGE_ORDER.map((stage) => {
          const stageOpportunities = opportunitiesByStage[stage] || []
          const colors = ELEVATED_STAGE_COLORS[stage as keyof typeof ELEVATED_STAGE_COLORS]
          const stageCount = stageOpportunities.length
          
          if (stageCount === 0) return null
          
          return (
            <div
              key={stage}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs"
              style={{
                backgroundColor: colors.light,
                color: colors.text,
                border: `1px solid ${colors.border}`,
              }}
            >
              <span className="font-medium">{stage}</span>
              <span className="opacity-75">({stageCount})</span>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <CollapsibleSection
      sectionId="pipeline-kanban"
      title="Sales Pipeline"
      badge={`${totalOpportunities} opportunities`}
      priority="medium"
      className="kanban-section density-transition"
      collapsedPreview={collapsedPreview}
    >
      {/* Density-Aware Pipeline Container */}
      <div 
        className={cn(
          "overflow-hidden rounded-lg border border-border bg-muted/30 shadow-sm density-transition",
          density === 'compact' ? 'h-[240px] p-2' : 
          density === 'spacious' ? 'h-[400px] p-4' : 'h-[300px] p-3'
        )}
        style={{ height: `${config.layout === 'horizontal' ? 240 : density === 'spacious' ? 400 : 300}px` }}
      >
        {config.layout === 'horizontal' ? (
          /* Compact: Horizontal Layout - Single scrollable row */
          <div className="flex h-full gap-2 overflow-x-auto pb-2 horizontal-scroll-fade">
            {STAGE_ORDER.slice(0, config.visibleStages).map((stage) => {
              const stageOpportunities = opportunitiesByStage[stage] || []
              const colors = ELEVATED_STAGE_COLORS[stage as keyof typeof ELEVATED_STAGE_COLORS]
              const stageCount = stageOpportunities.length

              if (stageCount === 0) return null

              return (
                <div
                  key={stage}
                  className={cn("flex flex-col rounded border bg-card density-transition", 
                    config.stageWidth ? `min-w-[${config.stageWidth}]` : 'min-w-[240px]'
                  )}
                  style={{
                    borderColor: colors.border,
                    minWidth: config.stageWidth,
                  }}
                  role="region"
                  aria-label={`${stage} column with ${stageCount} opportunities`}
                >
                  {/* Compact Stage Header */}
                  <div
                    className="flex items-center justify-between rounded-t px-2 py-1.5 text-xs font-semibold text-white"
                    style={{
                      backgroundColor: colors.dark,
                    }}
                  >
                    <span className="truncate">{stage}</span>
                    <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-xs font-normal">
                      {stageCount}
                    </span>
                  </div>

                  {/* Vertically Scrollable Cards */}
                  <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-1">
                    {stageOpportunities.map((opportunity) => {
                      const principal = principals.find((p) => p.id === opportunity.principalId)
                      const organizationName =
                        principal?.company || principal?.name || 'Unknown Organization'

                      return (
                        <div
                          key={opportunity.id}
                          className="cursor-grab rounded px-2 py-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                          style={{
                            backgroundColor: colors.light,
                            color: colors.text,
                            border: `1px solid ${colors.border}`,
                            height: config.cardHeight,
                          }}
                          role="button"
                          tabIndex={0}
                          aria-label={`Opportunity: ${opportunity.title} - ${organizationName}`}
                        >
                          <div className="truncate text-xs font-medium">{organizationName}</div>
                          {config.cardStyle !== 'mini' && (
                            <div className="truncate text-xs opacity-75 mt-0.5">{opportunity.title}</div>
                          )}
                          {opportunity.value && (
                            <div className="text-xs font-semibold mt-0.5" style={{ color: colors.text }}>
                              ${(opportunity.value / 1000).toFixed(0)}K
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Comfortable/Spacious: Vertical Layout - Horizontal swimlanes */
          <div className="flex h-full flex-col gap-2 overflow-y-auto">
            {STAGE_ORDER.slice(0, config.visibleStages).map((stage) => {
              const stageOpportunities = opportunitiesByStage[stage] || []
              const colors = ELEVATED_STAGE_COLORS[stage as keyof typeof ELEVATED_STAGE_COLORS]
              const stageCount = stageOpportunities.length

              if (stageCount === 0) return null

              return (
                <div
                  key={stage}
                  className={cn(
                    "flex items-center gap-3 rounded border bg-card density-transition",
                    density === 'comfortable' ? 'min-h-[60px] p-2' : 'min-h-[80px] p-3'
                  )}
                  style={{
                    borderColor: colors.border,
                  }}
                  role="region"
                  aria-label={`${stage} swimlane with ${stageCount} opportunities`}
                >
                  {/* Stage Label (Left side) */}
                  <div
                    className={cn(
                      "flex items-center justify-between rounded text-sm font-semibold text-white",
                      density === 'comfortable' ? 
                        'min-w-[140px] max-w-[140px] px-3 py-2' : 
                        'min-w-[160px] max-w-[160px] px-4 py-3'
                    )}
                    style={{
                      backgroundColor: colors.dark,
                    }}
                  >
                    <span className="truncate">{stage}</span>
                    <span className={cn(
                      "rounded-full bg-white/20 font-normal",
                      density === 'comfortable' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
                    )}>
                      {stageCount}
                    </span>
                  </div>

                  {/* Horizontally Scrollable Cards Container */}
                  <div className="flex flex-1 gap-2 overflow-x-auto pb-2 pipeline-swimlane-scroll horizontal-scroll-fade">
                    {stageOpportunities.map((opportunity) => {
                      const principal = principals.find((p) => p.id === opportunity.principalId)
                      const organizationName =
                        principal?.company || principal?.name || 'Unknown Organization'

                      return (
                        <div
                          key={opportunity.id}
                          className={cn(
                            "cursor-grab rounded transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm",
                            config.cardStyle === 'standard' ? 'min-w-[160px] max-w-[200px] px-3 py-2' :
                            config.cardStyle === 'expanded' ? 'min-w-[180px] max-w-[220px] px-4 py-3' :
                            'min-w-[140px] max-w-[180px] px-2 py-1.5'
                          )}
                          style={{
                            backgroundColor: colors.light,
                            color: colors.text,
                            border: `1px solid ${colors.border}`,
                          }}
                          role="button"
                          tabIndex={0}
                          aria-label={`Opportunity: ${opportunity.title} - ${organizationName}`}
                        >
                          <div className={cn(
                            "truncate font-medium",
                            config.cardStyle === 'expanded' ? 'text-sm' : 'text-sm'
                          )}>{organizationName}</div>
                          
                          {config.showDetails && (
                            <div className={cn(
                              "truncate opacity-75 mt-1",
                              config.cardStyle === 'expanded' ? 'text-sm' : 'text-xs'
                            )}>{opportunity.title}</div>
                          )}
                          
                          {opportunity.value && (
                            <div className={cn(
                              "font-semibold mt-1",
                              config.cardStyle === 'expanded' ? 'text-sm' : 'text-xs'
                            )} style={{ color: colors.text }}>
                              ${(opportunity.value / 1000).toFixed(0)}K
                            </div>
                          )}

                          {config.showContacts && config.cardStyle === 'expanded' && principal && (
                            <div className="text-xs opacity-60 mt-1 truncate">
                              Contact: {principal.name}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* Empty State for all visible stages */}
            {STAGE_ORDER.slice(0, config.visibleStages).every(stage => (opportunitiesByStage[stage] || []).length === 0) && (
              <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                <div>
                  <p className={cn(
                    "font-medium",
                    density === 'compact' ? 'text-xs' : density === 'spacious' ? 'text-base' : 'text-sm'
                  )}>No opportunities in pipeline</p>
                  <p className={cn(
                    "opacity-75",
                    density === 'compact' ? 'text-xs' : density === 'spacious' ? 'text-sm' : 'text-xs'
                  )}>Opportunities will appear here when created</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </CollapsibleSection>
  )
}

export default OpportunityKanban
