import { renderHook } from '@testing-library/react'
import { useOrganizationsBadges } from '../useOrganizationsBadges'

describe('useOrganizationsBadges', () => {
  it('should return correct priority badges', () => {
    const { result } = renderHook(() => useOrganizationsBadges())
    const { getPriorityBadge } = result.current

    // Test A+ priority
    expect(getPriorityBadge('A+')).toEqual({
      className: 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-300',
      label: 'A+ Priority',
    })

    // Test A priority
    expect(getPriorityBadge('A')).toEqual({
      className: 'bg-red-100 text-red-800 border-red-200',
      label: 'A Priority',
    })

    // Test B priority
    expect(getPriorityBadge('B')).toEqual({
      className: 'bg-orange-100 text-orange-800 border-orange-200',
      label: 'B Priority',
    })

    // Test C priority
    expect(getPriorityBadge('C')).toEqual({
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      label: 'C Priority',
    })

    // Test D priority
    expect(getPriorityBadge('D')).toEqual({
      className: 'bg-gray-100 text-gray-800 border-gray-200',
      label: 'D Priority',
    })

    // Test null/undefined priority
    expect(getPriorityBadge(null)).toEqual({
      className: 'bg-gray-100 text-gray-600 border-gray-200',
      label: 'Unassigned',
    })
  })

  it('should return correct type badges', () => {
    const { result } = renderHook(() => useOrganizationsBadges())
    const { getTypeBadge } = result.current

    expect(getTypeBadge('customer')).toEqual({
      className: 'bg-blue-100 text-blue-800 border-blue-200',
      label: 'Customer',
    })

    expect(getTypeBadge('distributor')).toEqual({
      className: 'bg-green-100 text-green-800 border-green-200',
      label: 'Distributor',
    })

    expect(getTypeBadge('principal')).toEqual({
      className: 'bg-purple-100 text-purple-800 border-purple-200',
      label: 'Principal',
    })

    expect(getTypeBadge('supplier')).toEqual({
      className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      label: 'Supplier',
    })

    expect(getTypeBadge(null)).toEqual({
      className: 'bg-gray-100 text-gray-800 border-gray-200',
      label: 'Unknown Type',
    })
  })

  it('should return correct segment badges', () => {
    const { result } = renderHook(() => useOrganizationsBadges())
    const { getSegmentBadge } = result.current

    expect(getSegmentBadge('Restaurant')).toEqual({
      className: 'bg-amber-100 text-amber-800 border-amber-200',
      label: 'Restaurant',
    })

    expect(getSegmentBadge('Fine Dining')).toEqual({
      className: 'bg-rose-100 text-rose-800 border-rose-200',
      label: 'Fine Dining',
    })

    expect(getSegmentBadge('Healthcare')).toEqual({
      className: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      label: 'Healthcare',
    })

    // Unknown segment should get default styling
    expect(getSegmentBadge('Unknown Segment')).toEqual({
      className: 'bg-slate-100 text-slate-800 border-slate-200',
      label: 'Unknown Segment',
    })

    // Null segment should return null
    expect(getSegmentBadge(null)).toBeNull()
  })

  it('should return correct status badges for special combinations', () => {
    const { result } = renderHook(() => useOrganizationsBadges())
    const { getStatusBadge } = result.current

    // VIP Customer (A+ priority + customer type)
    expect(getStatusBadge('A+', 'customer')).toEqual({
      className: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-300',
      label: 'VIP Customer',
    })

    // Key Partner (A/A+ priority + distributor type)
    expect(getStatusBadge('A+', 'distributor')).toEqual({
      className: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-green-300',
      label: 'Key Partner',
    })

    expect(getStatusBadge('A', 'distributor')).toEqual({
      className: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-green-300',
      label: 'Key Partner',
    })

    // No special status for other combinations
    expect(getStatusBadge('B', 'customer')).toBeNull()
    expect(getStatusBadge('A', 'customer')).toBeNull()
    expect(getStatusBadge('C', 'distributor')).toBeNull()
  })
})
