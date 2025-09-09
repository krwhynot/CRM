import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronRight, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PipelineStageFlow {
  from: string
  to: string
  count: number
  value: number
  percentage: number
}

interface PipelineFlowData {
  stages: string[]
  flows: PipelineStageFlow[]
  totalMovements: number
  timeRange: string
}

interface PipelineFlowChartProps {
  data?: PipelineFlowData
  loading?: boolean
  className?: string
}

// Mock data generator for pipeline flow
const generateMockPipelineFlow = (timeRange: string): PipelineFlowData => {
  const stages = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']
  
  const flows: PipelineStageFlow[] = [
    { from: 'Lead', to: 'Qualified', count: 12, value: 145000, percentage: 65 },
    { from: 'Lead', to: 'Closed Lost', count: 8, value: 95000, percentage: 35 },
    { from: 'Qualified', to: 'Proposal', count: 9, value: 128000, percentage: 75 },
    { from: 'Qualified', to: 'Closed Lost', count: 3, value: 17000, percentage: 25 },
    { from: 'Proposal', to: 'Negotiation', count: 6, value: 89000, percentage: 67 },
    { from: 'Proposal', to: 'Closed Lost', count: 3, value: 39000, percentage: 33 },
    { from: 'Negotiation', to: 'Closed Won', count: 4, value: 67000, percentage: 67 },
    { from: 'Negotiation', to: 'Closed Lost', count: 2, value: 22000, percentage: 33 }
  ]

  return {
    stages,
    flows,
    totalMovements: flows.reduce((sum, flow) => sum + flow.count, 0),
    timeRange
  }
}

const formatCurrency = (value: number): string => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

export function PipelineFlowChart({ 
  data, 
  loading = false, 
  className 
}: PipelineFlowChartProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('2-weeks')
  
  // Use provided data or generate mock data
  const pipelineData = data || generateMockPipelineFlow(selectedTimeRange)
  
  if (loading) {
    return (
      <div className={cn("w-full h-[280px] animate-pulse", className)}>
        <div className="h-full rounded-lg bg-muted" />
      </div>
    )
  }

  // Group flows by source stage for better visualization
  const flowsByStage = pipelineData.stages.reduce((acc, stage) => {
    acc[stage] = pipelineData.flows.filter(flow => flow.from === stage)
    return acc
  }, {} as Record<string, PipelineStageFlow[]>)

  return (
    <div className={cn("space-y-4", className)}>
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Pipeline Flow</h4>
          <p className="text-xs text-muted-foreground">
            {pipelineData.totalMovements} total movements
          </p>
        </div>
        <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
          <SelectTrigger className="h-8 w-32 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2-weeks">2 Weeks</SelectItem>
            <SelectItem value="4-weeks">4 Weeks</SelectItem>
            <SelectItem value="8-weeks">8 Weeks</SelectItem>
            <SelectItem value="12-weeks">12 Weeks</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Simplified Sankey Flow Visualization */}
      <div className="space-y-3">
        {pipelineData.stages.slice(0, -2).map((stage) => {
          const stageFlows = flowsByStage[stage] || []
          if (stageFlows.length === 0) return null

          return (
            <div key={stage} className="space-y-2">
              {/* Stage Header */}
              <div className="flex items-center text-xs font-medium text-muted-foreground">
                <span>{stage}</span>
                <ChevronRight className="mx-1 size-3" />
                <span className="text-foreground">
                  {stageFlows.reduce((sum, flow) => sum + flow.count, 0)} moved
                </span>
              </div>

              {/* Flow Bars */}
              <div className="space-y-1">
                {stageFlows.map((flow, flowIndex) => {
                  const isPositive = !flow.to.includes('Lost')
                  const width = `${Math.max(flow.percentage, 10)}%`
                  
                  return (
                    <div
                      key={`${flow.from}-${flow.to}-${flowIndex}`}
                      className="relative flex items-center"
                    >
                      {/* Flow Bar */}
                      <div className="h-6 flex-1 overflow-hidden rounded-sm bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-sm transition-all duration-300",
                            isPositive 
                              ? "bg-green-500/80 hover:bg-green-500" 
                              : "bg-red-500/80 hover:bg-red-500"
                          )}
                          style={{ width }}
                        />
                      </div>
                      
                      {/* Flow Details */}
                      <div className="ml-3 min-w-0 shrink-0">
                        <div className="flex items-center gap-1 text-xs">
                          <span className="font-medium">{flow.to}</span>
                          {isPositive ? (
                            <TrendingUp className="size-3 text-green-600" />
                          ) : (
                            <TrendingDown className="size-3 text-red-600" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {flow.count} opps • {formatCurrency(flow.value)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 border-t pt-2">
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600">
            {pipelineData.flows
              .filter(flow => flow.to === 'Closed Won')
              .reduce((sum, flow) => sum + flow.count, 0)}
          </div>
          <div className="text-xs text-muted-foreground">Won</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-red-600">
            {pipelineData.flows
              .filter(flow => flow.to === 'Closed Lost')
              .reduce((sum, flow) => sum + flow.count, 0)}
          </div>
          <div className="text-xs text-muted-foreground">Lost</div>
        </div>
      </div>
    </div>
  )
}

export default PipelineFlowChart