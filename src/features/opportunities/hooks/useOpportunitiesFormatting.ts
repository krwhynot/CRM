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
      'New Lead': { dot: 'bg-primary', position: 1 },
      'Initial Outreach': { dot: 'bg-accent', position: 2 },
      'Sample/Visit Offered': { dot: 'bg-warning', position: 3 },
      'Awaiting Response': { dot: 'bg-warning', position: 4 },
      'Feedback Logged': { dot: 'bg-info', position: 5 },
      'Demo Scheduled': { dot: 'bg-success', position: 6 },
      'Closed - Won': { dot: 'bg-success', position: 7 },
    }
    return configs[stage] || configs['New Lead']
  }, [])

  const formatCurrency = useCallback((value: number | null): string => {
    if (!value) return 'N/A'
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value.toLocaleString()}`
  }, [])

  const formatActivityType = useCallback((type: string | null): string => {
    if (!type) return 'No activities'
    return type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }, [])

  return {
    getStageConfig,
    formatCurrency,
    formatActivityType,
  }
}
