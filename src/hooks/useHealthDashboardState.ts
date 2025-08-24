import React from 'react'
import { useHealthStatus } from '@/lib/monitoring'

interface UseHealthDashboardStateReturn {
  status: any
  summary: string
  isHealthy: boolean
  lastUpdated: Date
  refreshStatus: () => void
}

export const useHealthDashboardState = (refreshInterval: number = 60000): UseHealthDashboardStateReturn => {
  const { status, summary, isHealthy } = useHealthStatus()
  const [lastUpdated, setLastUpdated] = React.useState<Date>(new Date())

  React.useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date())
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshInterval])

  const refreshStatus = () => {
    window.location.reload()
  }

  return {
    status,
    summary,
    isHealthy,
    lastUpdated,
    refreshStatus
  }
}