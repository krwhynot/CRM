import { useMemo } from 'react'
import type { BadgeProps } from '@/components/ui/badge.variants'

interface BadgeConfig {
  props: Pick<BadgeProps, 'priority' | 'orgType' | 'segment' | 'status'>
  label: string
}

interface UseOrganizationsBadgesReturn {
  getPriorityBadge: (priority: string | null) => BadgeConfig
  getTypeBadge: (type: string | null) => BadgeConfig
  getSegmentBadge: (segment: string | null) => BadgeConfig | null
  getStatusBadge: (priority: string | null, type: string | null) => BadgeConfig | null
}

export const useOrganizationsBadges = (): UseOrganizationsBadgesReturn => {
  const getPriorityBadge = useMemo(() => {
    return (priority: string | null): BadgeConfig => {
      const priorityMap: Record<string, { props: BadgeConfig['props']; label: string }> = {
        'A+': { props: { priority: 'a-plus' }, label: 'A+ Priority' },
        'A': { props: { priority: 'a' }, label: 'A Priority' },
        'B': { props: { priority: 'b' }, label: 'B Priority' },
        'C': { props: { priority: 'c' }, label: 'C Priority' },
        'D': { props: { priority: 'd' }, label: 'D Priority' },
      }

      return priorityMap[priority || ''] || { 
        props: { priority: 'unassigned' }, 
        label: 'Unassigned' 
      }
    }
  }, [])

  const getTypeBadge = useMemo(() => {
    return (type: string | null): BadgeConfig => {
      const typeMap: Record<string, { props: BadgeConfig['props']; label: string }> = {
        customer: { props: { orgType: 'customer' }, label: 'Customer' },
        distributor: { props: { orgType: 'distributor' }, label: 'Distributor' },
        principal: { props: { orgType: 'principal' }, label: 'Principal' },
        supplier: { props: { orgType: 'supplier' }, label: 'Supplier' },
      }

      return typeMap[type || ''] || { 
        props: { orgType: 'unknown' }, 
        label: 'Unknown Type' 
      }
    }
  }, [])

  const getSegmentBadge = useMemo(() => {
    return (segment: string | null): BadgeConfig | null => {
      if (!segment) return null

      const segmentMap: Record<string, { props: BadgeConfig['props']; label: string }> = {
        'Restaurant': { props: { segment: 'restaurant' }, label: 'Restaurant' },
        'Healthcare': { props: { segment: 'healthcare' }, label: 'Healthcare' },
        'Education': { props: { segment: 'education' }, label: 'Education' },
      }

      return segmentMap[segment] || null
    }
  }, [])

  const getStatusBadge = useMemo(() => {
    return (priority: string | null, type: string | null): BadgeConfig | null => {
      // Special compound variants
      if (priority === 'A+' && type === 'customer') {
        return {
          props: { priority: 'a-plus', orgType: 'customer' },
          label: 'VIP Customer'
        }
      }

      if ((priority === 'A+' || priority === 'A') && type === 'distributor') {
        return {
          props: { priority: priority === 'A+' ? 'a-plus' : 'a', orgType: 'distributor' },
          label: 'Key Partner'
        }
      }

      return null
    }
  }, [])

  return {
    getPriorityBadge,
    getTypeBadge,
    getSegmentBadge,
    getStatusBadge,
  }
}