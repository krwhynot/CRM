import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { OrganizationActions } from '../OrganizationActions'
import type { Organization } from '@/types/entities'

const mockOrganization: Organization = {
  id: '1',
  name: 'Test Organization',
  type: 'customer' as any,
  priority: 'A',
  phone: '(555) 123-4567',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

describe('OrganizationActions', () => {
  it('should render view button when onView is provided', () => {
    const onView = jest.fn()

    render(
      <OrganizationActions
        organization={mockOrganization}
        onView={onView}
      />
    )

    const viewButton = screen.getByTitle('View organization details')
    expect(viewButton).toBeInTheDocument()

    fireEvent.click(viewButton)
    expect(onView).toHaveBeenCalledWith(mockOrganization)
  })

  it('should render contact button when onContact is provided and phone exists', () => {
    const onContact = jest.fn()

    render(
      <OrganizationActions
        organization={mockOrganization}
        onContact={onContact}
      />
    )

    const contactButton = screen.getByTitle('Contact organization')
    expect(contactButton).toBeInTheDocument()

    fireEvent.click(contactButton)
    expect(onContact).toHaveBeenCalledWith(mockOrganization)
  })

  it('should not render contact button when phone is missing', () => {
    const onContact = jest.fn()
    const orgWithoutPhone = { ...mockOrganization, phone: undefined }

    render(
      <OrganizationActions
        organization={orgWithoutPhone}
        onContact={onContact}
      />
    )

    expect(screen.queryByTitle('Contact organization')).not.toBeInTheDocument()
  })

  it('should render edit button when onEdit is provided', () => {
    const onEdit = jest.fn()

    render(
      <OrganizationActions
        organization={mockOrganization}
        onEdit={onEdit}
      />
    )

    const editButton = screen.getByTitle('Edit organization')
    expect(editButton).toBeInTheDocument()

    fireEvent.click(editButton)
    expect(onEdit).toHaveBeenCalledWith(mockOrganization)
  })

  it('should render all action buttons when all handlers are provided', () => {
    const onView = jest.fn()
    const onContact = jest.fn()
    const onEdit = jest.fn()

    render(
      <OrganizationActions
        organization={mockOrganization}
        onView={onView}
        onContact={onContact}
        onEdit={onEdit}
      />
    )

    expect(screen.getByTitle('View organization details')).toBeInTheDocument()
    expect(screen.getByTitle('Contact organization')).toBeInTheDocument()
    expect(screen.getByTitle('Edit organization')).toBeInTheDocument()
  })

  it('should render no buttons when no handlers are provided', () => {
    const { container } = render(
      <OrganizationActions
        organization={mockOrganization}
      />
    )

    // Should render empty div with gap-2 class
    expect(container.firstChild).toBeEmptyDOMElement()
  })

  it('should not call onDelete when onDelete prop is not provided', () => {
    // This test ensures we're not using onDelete accidentally
    const onEdit = jest.fn()

    render(
      <OrganizationActions
        organization={mockOrganization}
        onEdit={onEdit}
      />
    )

    // Only edit button should be present
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(screen.getByTitle('Edit organization')).toBeInTheDocument()
  })

  it('should handle organization with empty phone string', () => {
    const onContact = jest.fn()
    const orgWithEmptyPhone = { ...mockOrganization, phone: '' }

    render(
      <OrganizationActions
        organization={orgWithEmptyPhone}
        onContact={onContact}
      />
    )

    expect(screen.queryByTitle('Contact organization')).not.toBeInTheDocument()
  })
})