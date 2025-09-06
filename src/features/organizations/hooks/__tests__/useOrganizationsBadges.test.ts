import { renderHook } from '@testing-library/react'
import { useOrganizationsBadges } from '../useOrganizationsBadges'

describe('useOrganizationsBadges', () => {
  it('should return correct priority badges', () => {
    const { result } = renderHook(() => useOrganizationsBadges())
    const { getPriorityBadge } = result.current

    // Test A+ priority
    expect(getPriorityBadge('A+')).toEqual({
      props: { priority: 'a-plus' },
      label: 'A+ Priority',
    })

    // Test A priority
    expect(getPriorityBadge('A')).toEqual({
      props: { priority: 'a' },
      label: 'A Priority',
    })

    // Test B priority
    expect(getPriorityBadge('B')).toEqual({
      props: { priority: 'b' },
      label: 'B Priority',
    })

    // Test C priority
    expect(getPriorityBadge('C')).toEqual({
      props: { priority: 'c' },
      label: 'C Priority',
    })

    // Test D priority
    expect(getPriorityBadge('D')).toEqual({
      props: { priority: 'd' },
      label: 'D Priority',
    })

    // Test null/undefined priority
    expect(getPriorityBadge(null)).toEqual({
      props: { priority: 'unassigned' },
      label: 'Unassigned',
    })
  })

  it('should return correct type badges', () => {
    const { result } = renderHook(() => useOrganizationsBadges())
    const { getTypeBadge } = result.current

    expect(getTypeBadge('customer')).toEqual({
      props: { orgType: 'customer' },
      label: 'Customer',
    })

    expect(getTypeBadge('distributor')).toEqual({
      props: { orgType: 'distributor' },
      label: 'Distributor',
    })

    expect(getTypeBadge('principal')).toEqual({
      props: { orgType: 'principal' },
      label: 'Principal',
    })

    expect(getTypeBadge('supplier')).toEqual({
      props: { orgType: 'supplier' },
      label: 'Supplier',
    })

    expect(getTypeBadge(null)).toEqual({
      props: { orgType: 'unknown' },
      label: 'Unknown Type',
    })
  })

  it('should return correct segment badges', () => {
    const { result } = renderHook(() => useOrganizationsBadges())
    const { getSegmentBadge } = result.current

    expect(getSegmentBadge('Restaurant')).toEqual({
      props: { segment: 'restaurant' },
      label: 'Restaurant',
    })

    expect(getSegmentBadge('Healthcare')).toEqual({
      props: { segment: 'healthcare' },
      label: 'Healthcare',
    })

    expect(getSegmentBadge('Education')).toEqual({
      props: { segment: 'education' },
      label: 'Education',
    })

    // Unknown segment should return null (not mapped in variants)
    expect(getSegmentBadge('Unknown Segment')).toBeNull()

    // Null segment should return null
    expect(getSegmentBadge(null)).toBeNull()
  })

  it('should return correct status badges for special combinations', () => {
    const { result } = renderHook(() => useOrganizationsBadges())
    const { getStatusBadge } = result.current

    // VIP Customer (A+ priority + customer type)
    expect(getStatusBadge('A+', 'customer')).toEqual({
      props: { priority: 'a-plus', orgType: 'customer' },
      label: 'VIP Customer',
    })

    // Key Partner (A+ priority + distributor type)
    expect(getStatusBadge('A+', 'distributor')).toEqual({
      props: { priority: 'a-plus', orgType: 'distributor' },
      label: 'Key Partner',
    })

    // Key Partner (A priority + distributor type)
    expect(getStatusBadge('A', 'distributor')).toEqual({
      props: { priority: 'a', orgType: 'distributor' },
      label: 'Key Partner',
    })

    // No special status for other combinations
    expect(getStatusBadge('B', 'customer')).toBeNull()
    expect(getStatusBadge('A', 'customer')).toBeNull()
    expect(getStatusBadge('C', 'distributor')).toBeNull()
  })
})