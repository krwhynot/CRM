import React from 'react'
import { render, screen } from '@testing-library/react'
import { OrganizationBadges } from '../OrganizationBadges'

// Mock the useOrganizationsBadges hook
jest.mock('@/hooks/useOrganizationsBadges', () => ({
  useOrganizationsBadges: () => ({
    getPriorityBadge: (priority: string | null) => ({
      className: 'priority-badge',
      label: `Priority: ${priority || 'None'}`
    }),
    getTypeBadge: (type: string | null) => ({
      className: 'type-badge',
      label: `Type: ${type || 'Unknown'}`
    }),
    getSegmentBadge: (segment: string | null) => segment ? ({
      className: 'segment-badge',
      label: `Segment: ${segment}`
    }) : null,
    getStatusBadge: (priority: string | null, type: string | null) => 
      priority === 'A+' && type === 'customer' ? ({
        className: 'status-badge-vip',
        label: 'VIP Customer'
      }) : null
  })
}))

describe('OrganizationBadges', () => {
  it('should render priority and type badges', () => {
    render(
      <OrganizationBadges
        priority="A"
        type="customer"
        segment={null}
      />
    )

    expect(screen.getByText('Priority: A')).toBeInTheDocument()
    expect(screen.getByText('Type: customer')).toBeInTheDocument()
  })

  it('should render segment badge when segment is provided', () => {
    render(
      <OrganizationBadges
        priority="B"
        type="distributor"
        segment="Restaurant"
      />
    )

    expect(screen.getByText('Priority: B')).toBeInTheDocument()
    expect(screen.getByText('Type: distributor')).toBeInTheDocument()
    expect(screen.getByText('Segment: Restaurant')).toBeInTheDocument()
  })

  it('should render status badge for VIP customers', () => {
    render(
      <OrganizationBadges
        priority="A+"
        type="customer"
        segment="Restaurant"
      />
    )

    expect(screen.getByText('VIP Customer')).toBeInTheDocument()
    expect(screen.getByText('Priority: A+')).toBeInTheDocument()
    expect(screen.getByText('Type: customer')).toBeInTheDocument()
    expect(screen.getByText('Segment: Restaurant')).toBeInTheDocument()
  })

  it('should not render segment badge when segment is null', () => {
    render(
      <OrganizationBadges
        priority="C"
        type="customer"
        segment={null}
      />
    )

    expect(screen.getByText('Priority: C')).toBeInTheDocument()
    expect(screen.getByText('Type: customer')).toBeInTheDocument()
    expect(screen.queryByText(/Segment:/)).not.toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <OrganizationBadges
        priority="A"
        type="customer"
        segment={null}
        className="custom-class"
      />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should handle null/undefined values gracefully', () => {
    render(
      <OrganizationBadges
        priority={null}
        type={null}
        segment={null}
      />
    )

    expect(screen.getByText('Priority: None')).toBeInTheDocument()
    expect(screen.getByText('Type: Unknown')).toBeInTheDocument()
  })
})