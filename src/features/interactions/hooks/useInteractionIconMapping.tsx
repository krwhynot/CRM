import React, { useMemo } from 'react'
import { Clock, MessageSquare, Phone, Mail, Users, Calendar, FileText, MapPin } from 'lucide-react'

interface UseInteractionIconMappingReturn {
  getInteractionIcon: (type: string) => React.ReactNode
  getInteractionTypeColor: (type: string) => string
}

export const useInteractionIconMapping = (): UseInteractionIconMappingReturn => {
  const mappings = useMemo(
    () => ({
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
            return <MapPin className="size-4" />
          default:
            return <MessageSquare className="size-4" />
        }
      },

      getInteractionTypeColor: (type: string): string => {
        switch (type) {
          case 'email':
            return 'bg-info/10 text-info border-info/20'
          case 'call':
            return 'bg-success/10 text-success border-success/20'
          case 'meeting':
            return 'bg-primary/10 text-primary border-primary/20'
          case 'demo':
            return 'bg-demo/10 text-demo border-demo/20'
          case 'proposal':
          case 'contract_review':
            return 'bg-destructive/10 text-destructive border-destructive/20'
          case 'follow_up':
            return 'bg-warning/10 text-warning border-warning/20'
          case 'trade_show':
            return 'bg-trade-show/10 text-trade-show border-trade-show/20'
          case 'site_visit':
            return 'bg-site-visit/10 text-site-visit border-site-visit/20'
          default:
            return 'bg-muted text-muted-foreground border-border'
        }
      },
    }),
    []
  )

  return mappings
}
