import React, { useMemo } from 'react'
import { 
  Clock, 
  MessageSquare, 
  Phone, 
  Mail, 
  Users, 
  Calendar, 
  FileText, 
  Activity
} from 'lucide-react'

interface UseInteractionIconMappingReturn {
  getInteractionIcon: (type: string) => React.ReactNode
  getInteractionTypeColor: (type: string) => string
}

export const useInteractionIconMapping = (): UseInteractionIconMappingReturn => {
  const mappings = useMemo(() => ({
    getInteractionIcon: (type: string): React.ReactNode => {
      switch (type) {
        case 'email':
          return <Mail className="size-4" />
        case 'call':
          return <Phone className="size-4" />
        case 'meeting':
          return <Users className="size-4" />
        case 'demo':
          return <Calendar className="size-4" />
        case 'proposal':
        case 'contract_review':
          return <FileText className="size-4" />
        case 'follow_up':
          return <Clock className="size-4" />
        case 'trade_show':
        case 'site_visit':
          return <Activity className="size-4" />
        default:
          return <MessageSquare className="size-4" />
      }
    },

    getInteractionTypeColor: (type: string): string => {
      switch (type) {
        case 'email':
          return 'bg-blue-100 text-blue-800 border-blue-200'
        case 'call':
          return 'bg-green-100 text-green-800 border-green-200'
        case 'meeting':
          return 'bg-purple-100 text-purple-800 border-purple-200'
        case 'demo':
          return 'bg-orange-100 text-orange-800 border-orange-200'
        case 'proposal':
        case 'contract_review':
          return 'bg-red-100 text-red-800 border-red-200'
        case 'follow_up':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        case 'trade_show':
          return 'bg-pink-100 text-pink-800 border-pink-200'
        case 'site_visit':
          return 'bg-indigo-100 text-indigo-800 border-indigo-200'
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200'
      }
    }
  }), [])

  return mappings
}