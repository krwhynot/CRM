import { useMemo } from 'react'
import { CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface UseHealthStatusFormattingReturn {
  getStatusIcon: (serviceStatus: string) => React.ReactElement
  getStatusColor: (serviceStatus: string) => string
}

export const useHealthStatusFormatting = (): UseHealthStatusFormattingReturn => {
  const formatters = useMemo(() => ({
    getStatusIcon: (serviceStatus: string) => {
      switch (serviceStatus) {
        case 'healthy':
          return <CheckCircle className="h-4 w-4 text-green-500" />
        case 'degraded':
          return <AlertCircle className="h-4 w-4 text-yellow-500" />
        case 'down':
          return <AlertCircle className="h-4 w-4 text-red-500" />
        default:
          return <Clock className="h-4 w-4 text-gray-500" />
      }
    },

    getStatusColor: (serviceStatus: string) => {
      switch (serviceStatus) {
        case 'healthy':
          return 'bg-green-100 text-green-800'
        case 'degraded':
          return 'bg-yellow-100 text-yellow-800'
        case 'down':
          return 'bg-red-100 text-red-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    }
  }), [])

  return formatters
}