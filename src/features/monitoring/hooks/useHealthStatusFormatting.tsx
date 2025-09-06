import React, { useMemo } from 'react'
import { CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface UseHealthStatusFormattingReturn {
  getStatusIcon: (serviceStatus: string) => React.ReactElement
  getStatusColor: (serviceStatus: string) => string
}

export const useHealthStatusFormatting = (): UseHealthStatusFormattingReturn => {
  const formatters = useMemo(
    () => ({
      getStatusIcon: (serviceStatus: string) => {
        switch (serviceStatus) {
          case 'healthy':
            return <CheckCircle className="size-4 text-success" />
          case 'degraded':
            return <AlertCircle className="size-4 text-warning" />
          case 'down':
            return <AlertCircle className="size-4 text-destructive" />
          default:
            return <Clock className="size-4 text-muted-foreground" />
        }
      },

      getStatusColor: (serviceStatus: string) => {
        switch (serviceStatus) {
          case 'healthy':
            return 'bg-success/10 text-success'
          case 'degraded':
            return 'bg-warning/10 text-warning'
          case 'down':
            return 'bg-destructive/10 text-destructive'
          default:
            return 'bg-muted text-muted-foreground'
        }
      },
    }),
    []
  )

  return formatters
}
