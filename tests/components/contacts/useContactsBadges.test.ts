import { renderHook } from '@testing-library/react'
import { beforeEach, describe, it, expect } from 'vitest'
import { useContactsBadges } from '@/features/contacts/hooks/useContactsBadges'

describe('useContactsBadges', () => {
  let result: ReturnType<typeof useContactsBadges>

  beforeEach(() => {
    const { result: hookResult } = renderHook(() => useContactsBadges())
    result = hookResult.current
  })

  describe('getInfluenceBadge', () => {
    it('should return correct badge for High influence', () => {
      const badge = result.getInfluenceBadge('High')
      
      expect(badge.props).toEqual({ influence: 'high' })
      expect(badge.label).toBe('High Influence')
    })

    it('should return correct badge for Medium influence', () => {
      const badge = result.getInfluenceBadge('Medium')
      
      expect(badge.props).toEqual({ influence: 'medium' })
      expect(badge.label).toBe('Medium Influence')
    })

    it('should return correct badge for Low influence', () => {
      const badge = result.getInfluenceBadge('Low')
      
      expect(badge.props).toEqual({ influence: 'low' })
      expect(badge.label).toBe('Low Influence')
    })

    it('should return default badge for null influence', () => {
      const badge = result.getInfluenceBadge(null)
      
      expect(badge.props).toEqual({ influence: 'low' })
      expect(badge.label).toBe('Unknown Influence')
    })

    it('should return default badge for unknown influence', () => {
      const badge = result.getInfluenceBadge('Unknown')
      
      expect(badge.props).toEqual({ influence: 'low' })
      expect(badge.label).toBe('Unknown Influence')
    })
  })

  describe('getAuthorityBadge', () => {
    it('should return correct badge for Decision Maker', () => {
      const badge = result.getAuthorityBadge('Decision Maker')
      
      expect(badge.props).toEqual({ status: 'active' })
      expect(badge.label).toBe('Decision Maker')
    })

    it('should return correct badge for Influencer', () => {
      const badge = result.getAuthorityBadge('Influencer')
      
      expect(badge.props).toEqual({ status: 'pending' })
      expect(badge.label).toBe('Influencer')
    })

    it('should return correct badge for User', () => {
      const badge = result.getAuthorityBadge('User')
      
      expect(badge.props).toEqual({ status: 'inactive' })
      expect(badge.label).toBe('User')
    })

    it('should return correct badge for Gatekeeper', () => {
      const badge = result.getAuthorityBadge('Gatekeeper')
      
      expect(badge.props).toEqual({ status: 'pending' })
      expect(badge.label).toBe('Gatekeeper')
    })

    it('should return default badge for null authority', () => {
      const badge = result.getAuthorityBadge(null)
      
      expect(badge.props).toEqual({ status: 'inactive' })
      expect(badge.label).toBe('Unknown Authority')
    })
  })

  describe('getPriorityBadge', () => {
    it('should return Key Contact badge for primary contact with high influence', () => {
      const badge = result.getPriorityBadge(true, 'High')
      
      expect(badge).not.toBeNull()
      expect(badge!.props).toEqual({ priority: 'a-plus' })
      expect(badge!.label).toBe('Key Contact')
    })

    it('should return Primary Contact badge for primary contact without high influence', () => {
      const badge = result.getPriorityBadge(true, 'Medium')
      
      expect(badge).not.toBeNull()
      expect(badge!.props).toEqual({ priority: 'a' })
      expect(badge!.label).toBe('Primary Contact')
    })

    it('should return null for non-primary contact with high influence', () => {
      const badge = result.getPriorityBadge(false, 'High')
      
      expect(badge).toBeNull()
    })

    it('should return null for non-primary contact without high influence', () => {
      const badge = result.getPriorityBadge(false, 'Medium')
      
      expect(badge).toBeNull()
    })

    it('should return null for non-primary contact with null influence', () => {
      const badge = result.getPriorityBadge(false, null)
      
      expect(badge).toBeNull()
    })
  })
})