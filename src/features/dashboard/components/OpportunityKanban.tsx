import React from 'react'
import { Opportunity } from '@/types/dashboard'

interface OpportunityKanbanProps {
  opportunities: Opportunity[]
  principals?: Array<{ id: string; name: string; company: string }>
  loading?: boolean
}

// Elevated Stage Colors - Dark Headers / Light Cards
const ELEVATED_STAGE_COLORS = {
  'New Lead': {
    dark: '#6B7280',   // Header - dark gray
    light: '#F3F4F6',  // Cards - light gray
    text: '#111827',
    border: '#D1D5DB'
  },
  'Initial Outreach': {
    dark: '#1E40AF',   // Header - dark blue
    light: '#DBEAFE',  // Cards - light blue
    text: '#1E40AF',
    border: '#93C5FD'
  },
  'Sample/Visit Offered': {
    dark: '#3730A3',   // Header - dark indigo
    light: '#E0E7FF',  // Cards - light indigo
    text: '#3730A3',
    border: '#C7D2FE'
  },
  'Awaiting Response': {
    dark: '#D97706',   // Header - dark amber
    light: '#FEF3C7',  // Cards - light amber
    text: '#78350F',
    border: '#FDE047'
  },
  'Feedback Logged': {
    dark: '#EA580C',   // Header - dark orange
    light: '#FED7AA',  // Cards - light orange
    text: '#7C2D12',
    border: '#FDBA74'
  },
  'Demo Scheduled': {
    dark: '#65A30D',   // Header - dark lime
    light: '#D9F99D',  // Cards - light lime
    text: '#365314',
    border: '#BEF264'
  },
  'Closed - Won': {
    dark: '#059669',   // Header - dark green
    light: '#86EFAC',  // Cards - light green
    text: '#14532D',
    border: '#4ADE80'
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
      <div className="h-[250px] w-full animate-pulse bg-muted rounded-lg flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading pipeline...</div>
      </div>
    )
  }

  const totalOpportunities = opportunities.length

  return (
    <div className="kanban-section">
      {/* Section Header */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-700">
          Sales Pipeline ({totalOpportunities} opportunities)
        </h3>
        <button className="text-xs text-gray-500 hover:text-gray-700">
          Expand ↕
        </button>
      </div>

      {/* Compact Pipeline Container */}
      <div className="h-[250px] border border-gray-200 rounded-lg bg-gray-50 p-2 shadow-sm overflow-hidden">
        <div className="flex gap-1 h-full">
            {STAGE_ORDER.map((stage) => {
              const stageOpportunities = opportunitiesByStage[stage] || []
              const colors = ELEVATED_STAGE_COLORS[stage as keyof typeof ELEVATED_STAGE_COLORS]
              const stageCount = stageOpportunities.length
              
              return (
                <div
                  key={stage}
                  className="flex-1 min-w-[130px] flex flex-col bg-white rounded border overflow-hidden"
                  style={{
                    borderColor: colors.border
                  }}
                  role="region"
                  aria-label={`${stage} column with ${stageCount} opportunities`}
                >
                  {/* Elevated Sticky Header */}
                  <div 
                    className="sticky top-0 z-10 px-3 py-2 font-semibold text-white text-sm border-b-2 flex justify-between items-center"
                    style={{ 
                      backgroundColor: colors.dark,
                      borderBottomColor: colors.border
                    }}
                  >
                    <span>{stage}</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-normal">
                      {stageCount}
                    </span>
                  </div>

                  {/* Scrollable Cards Container */}
                  <div className="flex-1 overflow-y-auto px-2 py-2 max-h-[180px] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
                    {stageOpportunities.map((opportunity) => {
                      const principal = principals.find(p => p.id === opportunity.principalId)
                      const organizationName = principal?.company || principal?.name || 'Unknown Organization'
                      
                      return (
                        <div
                          key={opportunity.id}
                          className="mb-1.5 px-2 py-1.5 rounded cursor-grab hover:shadow-sm transition-all duration-200 hover:-translate-y-px"
                          style={{
                            backgroundColor: colors.light,
                            color: colors.text,
                            border: `1px solid ${colors.border}`
                          }}
                          role="button"
                          tabIndex={0}
                          aria-label={`Opportunity: ${opportunity.title} - ${organizationName}`}
                        >
                          <div className="text-xs font-medium truncate">
                            {organizationName}
                          </div>
                          <div className="text-[10px] opacity-75 truncate">
                            {opportunity.title}
                          </div>
                        </div>
                      )
                    })}
                    
                    {/* Empty State */}
                    {stageOpportunities.length === 0 && (
                      <div className="text-[10px] text-gray-400 text-center py-4">
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