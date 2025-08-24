import { render, screen, fireEvent } from '@testing-library/react'
import { OrganizationsTable } from '../OrganizationsTable'
import type { Organization } from '@/types/entities'

import { vi } from 'vitest'

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
      { key: 'customers', label: 'Customers', count: 2 }
    ]
  })
}))

vi.mock('@/features/organizations/hooks/useOrganizationsDisplay', () => ({
  useOrganizationsDisplay: () => ({
    toggleRowExpansion: vi.fn(),
    isRowExpanded: vi.fn(() => false)
  })
}))

// Mock the child components
vi.mock('../OrganizationsFilters', () => ({
  OrganizationsFilters: ({ totalOrganizations, filteredCount }: any) => (
    <div data-testid="organizations-filters">
      <span>Total: {totalOrganizations}</span>
      <span>Filtered: {filteredCount}</span>
    </div>
  )
}))

vi.mock('../OrganizationRow', () => ({
  OrganizationRow: ({ organization, onEdit, onView, onContact }: any) => (
    <tr data-testid={`organization-row-${organization.id}`}>
      <td>{organization.name}</td>
      <td>
        {onEdit && (
          <button onClick={() => onEdit(organization)}>Edit</button>
        )}
        {onView && (
          <button onClick={() => onView(organization)}>View</button>
        )}
        {onContact && (
          <button onClick={() => onContact(organization)}>Contact</button>
        )}
      </td>
    </tr>
  )
}))

const mockOrganizations: Organization[] = [
  {
    id: '1',
    name: 'ACME Corp',
    type: 'customer' as any,
    priority: 'A',
    phone: '(555) 123-4567',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Global Distributors',
    type: 'distributor' as any,
    priority: 'B',
    phone: '(555) 234-5678',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
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

    expect(screen.getByTestId('organizations-filters')).toBeInTheDocument()
    expect(screen.getByText('Total: 2')).toBeInTheDocument()
    expect(screen.getByText('Filtered: 2')).toBeInTheDocument()
    
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
    
    render(
      <OrganizationsTable 
        organizations={mockOrganizations}
        onEdit={onEdit}
      />
    )

    const editButtons = screen.getAllByText('Edit')
    fireEvent.click(editButtons[0])
    
    expect(onEdit).toHaveBeenCalledWith(mockOrganizations[0])
  })

  it('should call onView when view button is clicked', () => {
    const onView = vi.fn()
    
    render(
      <OrganizationsTable 
        organizations={mockOrganizations}
        onView={onView}
      />
    )

    const viewButtons = screen.getAllByText('View')
    fireEvent.click(viewButtons[1])
    
    expect(onView).toHaveBeenCalledWith(mockOrganizations[1])
  })

  it('should call onContact when contact button is clicked', () => {
    const onContact = vi.fn()
    
    render(
      <OrganizationsTable 
        organizations={mockOrganizations}
        onContact={onContact}
      />
    )

    const contactButtons = screen.getAllByText('Contact')
    fireEvent.click(contactButtons[0])
    
    expect(onContact).toHaveBeenCalledWith(mockOrganizations[0])
  })

  it('should use default organizations when none provided', () => {
    render(<OrganizationsTable />)

    // Should render with default organizations
    expect(screen.getByTestId('organizations-filters')).toBeInTheDocument()
    // The default organizations include 3 items
    expect(screen.getByText('Total: 3')).toBeInTheDocument()
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