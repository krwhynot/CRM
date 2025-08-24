import { useCallback } from 'react'

interface StageConfig {
  dot: string
  position: number
}

interface UseOpportunitiesFormattingReturn {
  getStageConfig: (stage: string) => StageConfig
  formatCurrency: (value: number | null) => string
  formatActivityType: (type: string | null) => string
}

export const useOpportunitiesFormatting = (): UseOpportunitiesFormattingReturn => {
  const getStageConfig = useCallback((stage: string): StageConfig => {
    const configs: Record<string, StageConfig> = {
      "New Lead": { dot: "bg-blue-500", position: 1 },
      "Initial Outreach": { dot: "bg-purple-500", position: 2 },
      "Sample/Visit Offered": { dot: "bg-yellow-500", position: 3 },
      "Awaiting Response": { dot: "bg-orange-500", position: 4 },
      "Feedback Logged": { dot: "bg-pink-500", position: 5 },
      "Demo Scheduled": { dot: "bg-green-500", position: 6 },
      "Closed - Won": { dot: "bg-emerald-500", position: 7 }
    }
    return configs[stage] || configs["New Lead"]
  }, [])

  const formatCurrency = useCallback((value: number | null): string => {
    if (!value) return 'N/A'
    if (value >= 1000000) return `$${(value/1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value/1000).toFixed(0)}K`
    return `$${value.toLocaleString()}`
  }, [])

  const formatActivityType = useCallback((type: string | null): string => {
    if (!type) return 'No interactions'
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }, [])

  return {
    getStageConfig,
    formatCurrency,
    formatActivityType
  }
}