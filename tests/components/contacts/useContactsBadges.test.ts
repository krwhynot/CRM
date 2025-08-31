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
      
      expect(badge.className).toBe('bg-green-100 text-green-800 border-green-200')
      expect(badge.label).toBe('High Influence')
    })

    it('should return correct badge for Medium influence', () => {
      const badge = result.getInfluenceBadge('Medium')
      
      expect(badge.className).toBe('bg-yellow-100 text-yellow-800 border-yellow-200')
      expect(badge.label).toBe('Medium Influence')
    })

    it('should return correct badge for Low influence', () => {
      const badge = result.getInfluenceBadge('Low')
      
      expect(badge.className).toBe('bg-blue-100 text-blue-800 border-blue-200')
      expect(badge.label).toBe('Low Influence')
    })

    it('should return default badge for null influence', () => {
      const badge = result.getInfluenceBadge(null)
      
      expect(badge.className).toBe('bg-gray-100 text-gray-800 border-gray-200')
      expect(badge.label).toBe('Unknown Influence')
    })

    it('should return default badge for unknown influence', () => {
      const badge = result.getInfluenceBadge('Unknown')
      
      expect(badge.className).toBe('bg-gray-100 text-gray-800 border-gray-200')
      expect(badge.label).toBe('Unknown Influence')
    })
  })

  describe('getAuthorityBadge', () => {
    it('should return correct badge for Decision Maker', () => {
      const badge = result.getAuthorityBadge('Decision Maker')
      
      expect(badge.className).toBe('bg-red-100 text-red-800 border-red-200')
      expect(badge.label).toBe('Decision Maker')
    })

    it('should return correct badge for Influencer', () => {
      const badge = result.getAuthorityBadge('Influencer')
      
      expect(badge.className).toBe('bg-purple-100 text-purple-800 border-purple-200')
      expect(badge.label).toBe('Influencer')
    })

    it('should return correct badge for User', () => {
      const badge = result.getAuthorityBadge('User')
      
      expect(badge.className).toBe('bg-indigo-100 text-indigo-800 border-indigo-200')
      expect(badge.label).toBe('User')
    })

    it('should return correct badge for Gatekeeper', () => {
      const badge = result.getAuthorityBadge('Gatekeeper')
      
      expect(badge.className).toBe('bg-orange-100 text-orange-800 border-orange-200')
      expect(badge.label).toBe('Gatekeeper')
    })

    it('should return default badge for null authority', () => {
      const badge = result.getAuthorityBadge(null)
      
      expect(badge.className).toBe('bg-gray-100 text-gray-800 border-gray-200')
      expect(badge.label).toBe('Unknown Authority')
    })
  })

  describe('getPriorityBadge', () => {
    it('should return High Priority badge for primary contact with high influence', () => {
      const badge = result.getPriorityBadge(true, 'High')
      
      expect(badge).not.toBeNull()
      expect(badge!.className).toBe('bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-300')
      expect(badge!.label).toBe('High Priority')
    })

    it('should return Primary Contact badge for primary contact without high influence', () => {
      const badge = result.getPriorityBadge(true, 'Medium')
      
      expect(badge).not.toBeNull()
      expect(badge!.className).toBe('bg-blue-100 text-blue-800 border-blue-200')
      expect(badge!.label).toBe('Primary Contact')
    })

    it('should return Key Contact badge for non-primary contact with high influence', () => {
      const badge = result.getPriorityBadge(false, 'High')
      
      expect(badge).not.toBeNull()
      expect(badge!.className).toBe('bg-green-100 text-green-800 border-green-200')
      expect(badge!.label).toBe('Key Contact')
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