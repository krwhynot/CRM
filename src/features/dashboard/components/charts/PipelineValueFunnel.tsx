import { cn } from '@/lib/utils'

interface FunnelStage {
  name: string
  count: number
  value: number
  conversionRate: number
  dropOffRate: number
  color: string
}

interface PipelineValueFunnelData {
  stages: FunnelStage[]
  totalValue: number
  totalOpportunities: number
  overallConversion: number
}

interface PipelineValueFunnelProps {
  data?: PipelineValueFunnelData
  loading?: boolean
  className?: string
  showValues?: boolean
}

// Generate mock data that matches your reference design
const generateMockFunnelData = (): PipelineValueFunnelData => {
  const stages: FunnelStage[] = [
    {
      name: 'Lead',
      count: 45,
      value: 675000,
      conversionRate: 100,
      dropOffRate: 0,
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Qualified',
      count: 32,
      value: 498000,
      conversionRate: 71,
      dropOffRate: 29,
      color: 'from-blue-600 to-indigo-600'
    },
    {
      name: 'Proposal',
      count: 24,
      value: 391000,
      conversionRate: 75,
      dropOffRate: 25,
      color: 'from-indigo-600 to-purple-600'
    },
    {
      name: 'Negotiation',
      count: 16,
      value: 296000,
      conversionRate: 67,
      dropOffRate: 33,
      color: 'from-purple-600 to-pink-500'
    },
    {
      name: 'Closed Won',
      count: 12,
      value: 234000,
      conversionRate: 75,
      dropOffRate: 25,
      color: 'from-green-500 to-green-600'
    }
  ]

  return {
    stages,
    totalValue: 234000,
    totalOpportunities: 45,
    overallConversion: (12 / 45) * 100 // 27%
  }
}

const formatCurrency = (value: number): string => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${Math.round(value / 1000)}K`
  return `$${value.toFixed(0)}`
}

const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`
}

export function PipelineValueFunnel({ 
  data,
  loading = false,
  className
}: PipelineValueFunnelProps) {
  const funnelData = data || generateMockFunnelData()
  
  if (loading) {
    return (
      <div className={cn("w-full h-[400px] animate-pulse", className)}>
        <div className="h-full rounded-lg bg-muted" />
      </div>
    )
  }

  const maxCount = funnelData.stages[0]?.count || 1

  return (
    <div className={cn("p-4 bg-white rounded-lg border", className)}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="mb-2 text-lg font-semibold">Pipeline Funnel</h3>
        <div className="space-y-1 text-sm text-gray-600">
          <div>Pipeline Value Funnel</div>
          <div className="flex items-center gap-4">
            <span>{formatPercentage(funnelData.overallConversion)} overall conversion</span>
            <span>•</span>
            <span>{formatCurrency(funnelData.totalValue)} closed value</span>
          </div>
        </div>
      </div>

      {/* Funnel Stages */}
      <div className="mb-6 space-y-3">
        {funnelData.stages.map((stage, index) => {
          const widthPercentage = (stage.count / maxCount) * 100
          const nextStage = funnelData.stages[index + 1]
          const isFirstStage = index === 0
          const isLastStage = index === funnelData.stages.length - 1
          
          return (
            <div key={stage.name} className="relative">
              {/* Funnel Stage Bar */}
              <div className="relative flex items-center">
                {/* True funnel shape using clip-path */}
                <div 
                  className={cn(
                    "relative h-12 bg-gradient-to-r rounded-md transition-all duration-300 hover:shadow-md",
                    `bg-gradient-to-r ${stage.color}`
                  )}
                  style={{ 
                    width: `${Math.max(widthPercentage * 0.85, 25)}%`,
                    clipPath: isFirstStage 
                      ? 'polygon(0 0, 100% 0, 95% 100%, 0% 100%)'
                      : isLastStage
                        ? 'polygon(5% 0, 100% 0, 100% 100%, 0% 100%)'
                        : 'polygon(5% 0, 100% 0, 95% 100%, 0% 100%)',
                    marginLeft: isFirstStage ? '0%' : '2%'
                  }}
                >
                  {/* Stage Content */}
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                      <div className="text-sm font-semibold">{stage.name}</div>
                      <div className="text-xs opacity-95">
                        {stage.count} opps • {formatCurrency(stage.value)}
                      </div>
                    </div>
                  </div>

                  {/* Start indicator */}
                  {isFirstStage && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-8 text-sm text-gray-500">
                      Start
                    </div>
                  )}
                </div>

                {/* Conversion Rate */}
                {!isFirstStage && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 text-sm font-medium text-green-600">
                    ↗ {formatPercentage(stage.conversionRate)}
                  </div>
                )}
              </div>

              {/* Drop-off Indicator */}
              {!isLastStage && stage.dropOffRate > 0 && (
                <div className="mb-2 mt-1 flex justify-center">
                  <span className="text-sm text-red-600">
                    ↘ {formatPercentage(stage.dropOffRate)} drop-off ({stage.count - (nextStage?.count || 0)} lost)
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-3 gap-8 border-t border-gray-200 pt-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {funnelData.totalOpportunities}
          </div>
          <div className="text-sm text-gray-600">
            Total Leads
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {funnelData.stages[funnelData.stages.length - 1].count}
          </div>
          <div className="text-sm text-gray-600">
            Closed Won
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {formatPercentage(funnelData.overallConversion)}
          </div>
          <div className="text-sm text-gray-600">
            Win Rate
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="mt-6 border-t border-gray-200 pt-4">
        <div className="mb-2 text-sm font-medium text-gray-700">Key Insights:</div>
        <div className="space-y-1">
          {funnelData.stages
            .filter(stage => stage.dropOffRate > 30)
            .slice(0, 1)
            .map((stage, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-orange-600">
                <span>↘</span>
                <span>High drop-off at {stage.name} stage ({formatPercentage(stage.dropOffRate)})</span>
              </div>
            ))
          }
          {funnelData.stages.every(stage => stage.dropOffRate <= 30) && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <span>↗</span>
              <span>Healthy conversion rates across all stages</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PipelineValueFunnel