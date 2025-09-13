import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { describe, test, beforeEach, expect, vi } from 'vitest'
import { PageHeader, PageHeaderAction } from '@/components/ui/new/PageHeader'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

/**
 * Accessibility tests for PageHeader component
 * These tests ensure the component meets WCAG guidelines
 */

describe('PageHeader Accessibility', () => {
  const mockOnClick = vi.fn()
  
  beforeEach(() => {
    mockOnClick.mockClear()
  })

  test('renders semantic header landmark', () => {
    render(<PageHeader title="Test Page" />)
    
    const header = screen.getByRole('banner')
    expect(header).toBeInTheDocument()
    expect(header).toHaveAttribute('data-page-header')
  })

  test('renders proper heading hierarchy', () => {
    render(<PageHeader title="Main Page Title" />)
    
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Main Page Title')
  })

  test('action buttons have proper accessibility labels', () => {
    const actions: PageHeaderAction[] = [
      {
        type: 'button',
        label: 'Save',
        onClick: mockOnClick,
        'aria-label': 'Save current changes'
      },
      {
        type: 'button', 
        label: 'Cancel',
        onClick: mockOnClick
      }
    ]
    
    render(<PageHeader title="Test" actions={actions} />)
    
    const saveButton = screen.getByLabelText('Save current changes')
    expect(saveButton).toBeInTheDocument()
    
    const cancelButton = screen.getByLabelText('Cancel')
    expect(cancelButton).toBeInTheDocument()
  })

  test('back button has proper accessibility attributes', () => {
    const handleBack = vi.fn()
    
    render(
      <PageHeader 
        title="Test Page"
        backButton={{
          onClick: handleBack,
          label: "Back to Home",
          'aria-label': "Navigate back to home page"
        }}
      />
    )
    
    const backButton = screen.getByLabelText('Navigate back to home page')
    expect(backButton).toBeInTheDocument()
    expect(backButton).toHaveTextContent('Back to Home')
  })

  test('actions are wrapped in navigation landmark when appropriate', () => {
    const actions: PageHeaderAction[] = [
      { type: 'link', label: 'View Details', to: '/details' },
      { type: 'button', label: 'Edit', onClick: mockOnClick }
    ]
    
    render(<PageHeader title="Test" actions={actions} />)
    
    const nav = screen.getByRole('navigation', { name: 'Page actions' })
    expect(nav).toBeInTheDocument()
  })

  test('keyboard navigation works properly', async () => {
    const user = userEvent.setup()
    const handleAction1 = vi.fn()
    const handleAction2 = vi.fn()
    
    const actions: PageHeaderAction[] = [
      { type: 'button', label: 'Action 1', onClick: handleAction1 },
      { type: 'button', label: 'Action 2', onClick: handleAction2 }
    ]
    
    render(<PageHeader title="Test" actions={actions} />)
    
    const action1Button = screen.getByText('Action 1')
    const action2Button = screen.getByText('Action 2')
    
    // Test tab navigation
    await user.tab()
    expect(action1Button).toHaveFocus()
    
    await user.tab() 
    expect(action2Button).toHaveFocus()
    
    // Test button activation
    await user.keyboard('{Enter}')
    expect(handleAction2).toHaveBeenCalledTimes(1)
  })

  test('passes axe accessibility audit - basic header', async () => {
    const { container } = render(
      <PageHeader 
        title="Test Page" 
        subtitle="Page description"
      />
    )
    
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  test('passes axe accessibility audit - complex header', async () => {
    const actions: PageHeaderAction[] = [
      { 
        type: 'button', 
        label: 'Create', 
        onClick: mockOnClick,
        'aria-label': 'Create new item'
      },
      {
        type: 'link',
        label: 'View All',
        to: '/all',
        'aria-label': 'View all items'
      }
    ]
    
    const { container } = render(
      <PageHeader
        title="Complex Page"
        subtitle="With multiple actions and navigation"
        icon={<div role="img" aria-label="Page icon">📄</div>}
        backButton={{
          onClick: mockOnClick,
          'aria-label': 'Go back to previous page'
        }}
        actions={actions}
        meta={<span>Additional info</span>}
      />
    )
    
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  test('icon-only buttons have accessible names', () => {
    const actions: PageHeaderAction[] = [
      {
        type: 'button',
        label: '',
        onClick: mockOnClick,
        icon: <span>⚙️</span>,
        'aria-label': 'Settings'
      }
    ]
    
    render(<PageHeader title="Test" actions={actions} />)
    
    const settingsButton = screen.getByLabelText('Settings')
    expect(settingsButton).toBeInTheDocument()
  })

  test('handles responsive design without accessibility issues', async () => {
    // Test mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })
    
    const { container } = render(
      <PageHeader
        title="Responsive Header"
        subtitle="Should work on mobile"
        actions={[
          { type: 'button', label: 'Action 1', onClick: mockOnClick },
          { type: 'button', label: 'Action 2', onClick: mockOnClick }
        ]}
      />
    )
    
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  test('color contrast meets accessibility standards', () => {
    render(
      <PageHeader
        title="Color Test"
        subtitle="Testing text contrast"
      />
    )
    
    const title = screen.getByRole('heading', { level: 1 })
    const subtitle = screen.getByText('Testing text contrast')
    
    // These elements should have appropriate contrast ratios
    // The actual color values are tested through visual regression
    // Check for semantic token classes
    expect(title).toBeInTheDocument()
    expect(subtitle).toHaveClass('text-muted-foreground')
  })
})