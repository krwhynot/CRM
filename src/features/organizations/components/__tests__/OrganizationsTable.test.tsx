import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { OrganizationsTable } from '../OrganizationsTable'
import { createTestOrganization } from '@/test-utils/factories'
import type { Organization } from '@/types/entities'

// Mock the custom hooks
vi.mock('@/features/organizations/hooks/useOrganizationsFiltering', () => ({
  useOrganizationsFiltering: (organizations: Organization[]) => ({
    activeFilter: 'all',
    setActiveFilter: vi.fn(),
    searchTerm: '',
    setSearchTerm: vi.fn(),
    filteredOrganizations: organizations,
    filterPills: [
      { key: 'all', label: 'All', count: organizations.length },
      { key: 'high-priority', label: 'High Priority', count: 1 },
      { key: 'customers', label: 'Customers', count: 2 },
    ],
  }),
}))

vi.mock('@/features/organizations/hooks/useOrganizationsDisplay', () => ({
  useOrganizationsDisplay: () => ({
    toggleRowExpansion: vi.fn(),
    isRowExpanded: vi.fn(() => false),
  }),
}))

// Note: OrganizationsFilters component removed - using ResponsiveFilterWrapper instead

const mockOrganizations: Organization[] = [
  createTestOrganization({
    id: '1',
    name: 'ACME Corp',
    type: 'customer',
    priority: 'A',
    phone: '(555) 123-4567',
  }),
  createTestOrganization({
    id: '2',
    name: 'Global Distributors',
    type: 'distributor',
    priority: 'B',
    phone: '(555) 234-5678',
  }),
]

describe('OrganizationsTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render loading state', () => {
    render(<OrganizationsTable organizations={[]} loading={true} />)

    expect(screen.getByText('Loading organizations...')).toBeInTheDocument()
  })

  it('should render organizations table with data', () => {
    render(<OrganizationsTable organizations={mockOrganizations} />)

    // Note: Filters component removed - OrganizationsList now uses ResponsiveFilterWrapper
    expect(screen.getByTestId('organization-row-1')).toBeInTheDocument()
    expect(screen.getByTestId('organization-row-2')).toBeInTheDocument()
    expect(screen.getByText('ACME Corp')).toBeInTheDocument()
    expect(screen.getByText('Global Distributors')).toBeInTheDocument()
  })

  it('should render empty state when no organizations', () => {
    render(<OrganizationsTable organizations={[]} />)

    expect(screen.getByText('No organizations found')).toBeInTheDocument()
    expect(screen.getByText('Get started by adding your first organization')).toBeInTheDocument()
  })

  it('should call onEdit when edit button is clicked', () => {
    const onEdit = vi.fn()

    render(<OrganizationsTable organizations={mockOrganizations} onEdit={onEdit} />)

    const editButtons = screen.getAllByText('Edit')
    fireEvent.click(editButtons[0])

    expect(onEdit).toHaveBeenCalledWith(mockOrganizations[0])
  })

  it('should call onView when view button is clicked', () => {
    const onView = vi.fn()

    render(<OrganizationsTable organizations={mockOrganizations} onView={onView} />)

    const viewButtons = screen.getAllByText('View')
    fireEvent.click(viewButtons[1])

    expect(onView).toHaveBeenCalledWith(mockOrganizations[1])
  })

  it('should call onContact when contact button is clicked', () => {
    const onContact = vi.fn()

    render(<OrganizationsTable organizations={mockOrganizations} onContact={onContact} />)

    const contactButtons = screen.getAllByText('Contact')
    fireEvent.click(contactButtons[0])

    expect(onContact).toHaveBeenCalledWith(mockOrganizations[0])
  })

  it('should use default organizations when none provided', () => {
    render(<OrganizationsTable />)

    // Should render with default organizations (3 items)
    // Note: Filters component removed - OrganizationsList now uses ResponsiveFilterWrapper
    expect(screen.getByText('040 KITCHEN INC')).toBeInTheDocument()
    expect(screen.getByText('2D RESTAURANT GROUP')).toBeInTheDocument()
    expect(screen.getByText('ACME FOOD DISTRIBUTORS')).toBeInTheDocument()
  })

  it('should render results summary when organizations exist', () => {
    render(<OrganizationsTable organizations={mockOrganizations} />)

    expect(screen.getByText('Showing 2 of 2 organizations')).toBeInTheDocument()
  })

  it('should not render results summary when no organizations', () => {
    render(<OrganizationsTable organizations={[]} />)

    expect(screen.queryByText(/Showing.*organizations/)).not.toBeInTheDocument()
  })

  it('should have correct table structure', () => {
    render(<OrganizationsTable organizations={mockOrganizations} />)

    // Check for table headers
    expect(screen.getByText('Organization')).toBeInTheDocument()
    expect(screen.getByText('Phone')).toBeInTheDocument()
    expect(screen.getByText('Managers')).toBeInTheDocument()
    expect(screen.getByText('Location')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })
})
