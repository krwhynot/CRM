import { useMemo } from 'react'
import type { BadgeProps } from '@/components/ui/badge.variants'

interface ContactBadgeConfig {
  props: Pick<BadgeProps, 'influence' | 'status' | 'priority'>
  label: string
}

export const useContactsBadges = () => {
  const getInfluenceBadge = useMemo(() => {
    return (influence: string | null): ContactBadgeConfig => {
      const influenceMap: Record<string, ContactBadgeConfig> = {
        high: { props: { influence: 'high' }, label: 'High Influence' },
        medium: { props: { influence: 'medium' }, label: 'Medium Influence' },
        low: { props: { influence: 'low' }, label: 'Low Influence' },
      }

      return influenceMap[influence?.toLowerCase() || ''] || { 
        props: { influence: 'low' }, 
        label: 'Unknown Influence' 
      }
    }
  }, [])

  const getAuthorityBadge = useMemo(() => {
    return (authority: string | null): ContactBadgeConfig => {
      const authorityMap: Record<string, ContactBadgeConfig> = {
        'decision maker': { props: { status: 'active' }, label: 'Decision Maker' },
        influencer: { props: { status: 'pending' }, label: 'Influencer' },
        user: { props: { status: 'inactive' }, label: 'User' },
        gatekeeper: { props: { status: 'pending' }, label: 'Gatekeeper' },
      }

      return authorityMap[authority?.toLowerCase() || ''] || { 
        props: { status: 'inactive' }, 
        label: 'Unknown Authority' 
      }
    }
  }, [])

  const getPriorityBadge = useMemo(() => {
    return (isPrimary: boolean, influence: string | null): ContactBadgeConfig | null => {
      if (isPrimary && influence?.toLowerCase() === 'high') {
        return { props: { priority: 'a-plus' }, label: 'Key Contact' }
      }

      if (isPrimary) {
        return { props: { priority: 'a' }, label: 'Primary Contact' }
      }

      return null
    }
  }, [])

  return {
    getInfluenceBadge,
    getAuthorityBadge,
    getPriorityBadge,
  }
}