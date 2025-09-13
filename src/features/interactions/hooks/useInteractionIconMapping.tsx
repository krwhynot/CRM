import React, { useMemo } from 'react'
import { Clock, MessageSquare, Phone, Mail, Users, Calendar, FileText, MapPin } from 'lucide-react'
import { semanticColors } from '@/styles/tokens'

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
            return `${semanticColors.interactionTypes.email} ${semanticColors.interactionTypes.emailText} ${semanticColors.interactionTypes.emailBorder}`
          case 'call':
            return `${semanticColors.interactionTypes.call} ${semanticColors.interactionTypes.callText} ${semanticColors.interactionTypes.callBorder}`
          case 'meeting':
            return `${semanticColors.interactionTypes.meeting} ${semanticColors.interactionTypes.meetingText} ${semanticColors.interactionTypes.meetingBorder}`
          case 'demo':
            return `${semanticColors.interactionTypes.demo} ${semanticColors.interactionTypes.demoText} ${semanticColors.interactionTypes.demoBorder}`
          case 'proposal':
          case 'contract_review':
            return `${semanticColors.interactionTypes.proposal} ${semanticColors.interactionTypes.proposalText} ${semanticColors.interactionTypes.proposalBorder}`
          case 'follow_up':
            return `${semanticColors.interactionTypes.followUp} ${semanticColors.interactionTypes.followUpText} ${semanticColors.interactionTypes.followUpBorder}`
          case 'trade_show':
            return `${semanticColors.interactionTypes.tradeShow} ${semanticColors.interactionTypes.tradeShowText} ${semanticColors.interactionTypes.tradeShowBorder}`
          case 'site_visit':
            return `${semanticColors.interactionTypes.siteVisit} ${semanticColors.interactionTypes.siteVisitText} ${semanticColors.interactionTypes.siteVisitBorder}`
          default:
            return `${semanticColors.interactionTypes.default} ${semanticColors.interactionTypes.defaultText} ${semanticColors.interactionTypes.defaultBorder}`
        }
      },
    }),
    []
  )

  return mappings
}
