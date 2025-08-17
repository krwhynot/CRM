import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OpportunityWizard } from '@/components/opportunities/OpportunityWizard'
import {
  DynamicSelectTestHelpers,
  createMockSearchFn,
  createPrincipalOptions,
  createOrganizationOptions,
  setupMocks,
  teardownMocks,
} from '@/test/utils/dynamic-select-test-utils'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        is: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              or: vi.fn(() => ({
                data: [],
                error: null,
              })),
              eq: vi.fn(() => ({
                data: [],
                error: null,
              })),
              data: [],
              error: null,
            })),
          })),
        })),
      })),
    })),
  },
}))

// Mock database responses
const mockOrganizations = createOrganizationOptions(10)
const mockPrincipals = createPrincipalOptions(8)
const mockContacts = [
  {
    id: 'contact-1',
    first_name: 'John',
    last_name: 'Doe',
    title: 'Manager',
    email: 'john.doe@test.com',
    organization_id: 'org-1',
    organizations: { name: 'Test Organization 1' }
  },
  {
    id: 'contact-2',
    first_name: 'Jane',
    last_name: 'Smith',
    title: 'Director',
    email: 'jane.smith@test.com',
    organization_id: 'org-1',
    organizations: { name: 'Test Organization 1' }
  }
]

const mockSupabaseQueries = () => {
  const { supabase } = require('@/lib/supabase')
  
  // Mock organizations query
  supabase.from.mockImplementation((table: string) => {
    if (table === 'organizations') {
      return {
        select: vi.fn(() => ({
          is: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                or: vi.fn(() => Promise.resolve({
                  data: mockOrganizations.map(org => ({
                    id: org.value,
                    name: org.label,
                    type: org.metadata?.type || 'customer',
                    city: 'Test City',
                    state_province: 'TS'
                  })),
                  error: null
                })),
                eq: vi.fn((field: string, value: string) => {
                  if (field === 'type' && value === 'principal') {
                    return Promise.resolve({
                      data: mockPrincipals.map(principal => ({
                        id: principal.value,
                        name: principal.label,
                        type: 'principal',
                        city: 'Principal City',
                        state_province: 'PS'
                      })),
                      error: null
                    })
                  }
                  return Promise.resolve({ data: [], error: null })
                }),
                data: mockOrganizations.map(org => ({
                  id: org.value,
                  name: org.label,
                  type: org.metadata?.type || 'customer',
                  city: 'Test City',
                  state_province: 'TS'
                })),
                error: null
              })),
            })),
          })),
        }))
      }
    }
    
    if (table === 'contacts') {
      return {
        select: vi.fn(() => ({
          is: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                eq: vi.fn(() => ({
                  or: vi.fn(() => Promise.resolve({
                    data: mockContacts,
                    error: null
                  })),
                  data: mockContacts,
                  error: null
                })),
                or: vi.fn(() => Promise.resolve({
                  data: mockContacts,
                  error: null
                })),
                data: mockContacts,
                error: null
              })),
            })),
          })),
        }))
      }
    }
    
    return {
      select: vi.fn(() => Promise.resolve({ data: [], error: null }))
    }
  })
}

describe('OpportunityWizard - DynamicSelect Integration', () => {
  const mockProps = {
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    loading: false,
  }

  beforeEach(() => {
    setupMocks()
    mockSupabaseQueries()
    vi.clearAllTimers()
    vi.useFakeTimers()
  })

  afterEach(() => {
    teardownMocks()
    cleanup()
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('Organization Selection (Step 2)', () => {
    it('renders organization DynamicSelectField in step 2', async () => {
      render(<OpportunityWizard {...mockProps} />)
      
      // Navigate to step 2
      const nextButton = screen.getByText('Next')
      await userEvent.click(nextButton)
      
      // Should show organization select field
      expect(screen.getByText('Organization')).toBeInTheDocument()
      expect(screen.getByText('Search and select organization...')).toBeInTheDocument()
    })

    it('searches and displays organizations when typing', async () => {
      render(<OpportunityWizard {...mockProps} />)
      
      // Navigate to step 2
      const nextButton = screen.getByText('Next')
      await userEvent.click(nextButton)
      
      // Open organization select
      await DynamicSelectTestHelpers.openSelect()
      
      // Search for organizations
      const searchInput = screen.getByPlaceholderText(/search organizations/i)
      await userEvent.type(searchInput, 'Test Organization')
      
      // Fast-forward debounce
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        expect(screen.getByText('Test Organization 1')).toBeInTheDocument()
      })
    })

    it('shows organization type badges correctly', async () => {
      render(<OpportunityWizard {...mockProps} />)
      
      // Navigate to step 2
      const nextButton = screen.getByText('Next')
      await userEvent.click(nextButton)
      
      await DynamicSelectTestHelpers.openSelect()
      
      const searchInput = screen.getByPlaceholderText(/search organizations/i)
      await userEvent.type(searchInput, 'Organization')
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        // Should show badges for organization types
        expect(screen.getByText('CUSTOMER')).toBeInTheDocument()
      })
    })

    it('groups organizations by type', async () => {
      render(<OpportunityWizard {...mockProps} />)
      
      // Navigate to step 2
      const nextButton = screen.getByText('Next')
      await userEvent.click(nextButton)
      
      await DynamicSelectTestHelpers.openSelect()
      
      const searchInput = screen.getByPlaceholderText(/search organizations/i)
      await userEvent.type(searchInput, 'Organization')
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        // Should show group headers
        expect(screen.getByText('Other Organizations')).toBeInTheDocument()
      })
    })

    it('enables contact field when organization is selected', async () => {
      render(<OpportunityWizard {...mockProps} />)
      
      // Navigate to step 2
      const nextButton = screen.getByText('Next')
      await userEvent.click(nextButton)
      
      // Select an organization
      await DynamicSelectTestHelpers.openSelect()
      const searchInput = screen.getByPlaceholderText(/search organizations/i)
      await userEvent.type(searchInput, 'Organization 1')
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        expect(screen.getByText('Test Organization 1')).toBeInTheDocument()
      })
      
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      
      // Contact field should now be enabled
      const contactTrigger = screen.getAllByRole('combobox').find(trigger => 
        trigger.getAttribute('aria-label')?.includes('Primary Contact')
      )
      expect(contactTrigger).not.toBeDisabled()
    })

    it('clears contact when organization is cleared', async () => {
      render(<OpportunityWizard {...mockProps} />)
      
      // Navigate to step 2 and select organization
      const nextButton = screen.getByText('Next')
      await userEvent.click(nextButton)
      
      await DynamicSelectTestHelpers.openSelect()
      const searchInput = screen.getByPlaceholderText(/search organizations/i)
      await userEvent.type(searchInput, 'Organization 1')
      vi.advanceTimersByTime(300)
      
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      
      // Clear organization
      await DynamicSelectTestHelpers.clearSelection()
      
      // Contact field should be disabled again
      const contactTrigger = screen.getAllByRole('combobox').find(trigger => 
        trigger.getAttribute('aria-label')?.includes('Primary Contact')
      )
      expect(contactTrigger).toBeDisabled()
    })
  })

  describe('Contact Selection (Step 2)', () => {
    it('searches contacts for selected organization', async () => {
      render(<OpportunityWizard {...mockProps} />)
      
      // Navigate to step 2 and select organization
      const nextButton = screen.getByText('Next')
      await userEvent.click(nextButton)
      
      await DynamicSelectTestHelpers.openSelect()
      let searchInput = screen.getByPlaceholderText(/search organizations/i)
      await userEvent.type(searchInput, 'Organization 1')
      vi.advanceTimersByTime(300)
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      
      // Now search contacts
      const contactTriggers = screen.getAllByRole('combobox')
      const contactTrigger = contactTriggers.find(trigger => 
        trigger.getAttribute('aria-label')?.includes('Primary Contact')
      )
      
      await userEvent.click(contactTrigger!)
      
      await waitFor(() => {
        searchInput = screen.getByPlaceholderText(/search contacts/i)
        expect(searchInput).toBeInTheDocument()
      })
      
      await userEvent.type(searchInput, 'John')
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })
    })

    it('shows contact details in description', async () => {
      render(<OpportunityWizard {...mockProps} />)
      
      // Navigate to step 2 and select organization
      const nextButton = screen.getByText('Next')
      await userEvent.click(nextButton)
      
      await DynamicSelectTestHelpers.openSelect()
      let searchInput = screen.getByPlaceholderText(/search organizations/i)
      await userEvent.type(searchInput, 'Organization 1')
      vi.advanceTimersByTime(300)
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      
      // Search contacts
      const contactTriggers = screen.getAllByRole('combobox')
      const contactTrigger = contactTriggers.find(trigger => 
        trigger.getAttribute('aria-label')?.includes('Primary Contact')
      )
      
      await userEvent.click(contactTrigger!)
      searchInput = screen.getByPlaceholderText(/search contacts/i)
      await userEvent.type(searchInput, 'John')
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        // Should show contact title and organization
        expect(screen.getByText('Manager at Test Organization 1')).toBeInTheDocument()
      })
    })
  })

  describe('Principal Selection (Step 3)', () => {
    it('renders multi-select principal field in step 3', async () => {
      render(<OpportunityWizard {...mockProps} />)
      
      // Navigate to step 3 (skip validation for simplicity)
      const step3Button = screen.getByText('Principals')
      await userEvent.click(step3Button)
      
      expect(screen.getByText('Principal Organizations')).toBeInTheDocument()
      expect(screen.getByText('Search and select principal organizations...')).toBeInTheDocument()
    })

    it('supports multi-select for principals', async () => {
      render(<OpportunityWizard {...mockProps} />)
      
      // Navigate to step 3
      const step3Button = screen.getByText('Principals')
      await userEvent.click(step3Button)
      
      // Open principal select
      await DynamicSelectTestHelpers.openSelect()
      
      const searchInput = screen.getByPlaceholderText(/search principals/i)
      await userEvent.type(searchInput, 'Principal')
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        expect(screen.getByText('Principal Organization 1')).toBeInTheDocument()
        expect(screen.getByText('Principal Organization 2')).toBeInTheDocument()
      })
      
      // Select multiple principals
      await DynamicSelectTestHelpers.selectOption('Principal Organization 1')
      await DynamicSelectTestHelpers.selectOption('Principal Organization 2')
      
      // Should show both as badges
      DynamicSelectTestHelpers.expectSelectedBadges(['Principal Organization 1', 'Principal Organization 2'])
    })

    it('limits principal selections to maximum', async () => {
      render(<OpportunityWizard {...mockProps} />)
      
      // Navigate to step 3
      const step3Button = screen.getByText('Principals')
      await userEvent.click(step3Button)
      
      await DynamicSelectTestHelpers.openSelect()
      
      const searchInput = screen.getByPlaceholderText(/search principals/i)
      await userEvent.type(searchInput, 'Principal')
      vi.advanceTimersByTime(300)
      
      // Try to select more than maxSelections (5)
      for (let i = 1; i <= 6; i++) {
        await waitFor(() => {
          expect(screen.getByText(`Principal Organization ${i}`)).toBeInTheDocument()
        })
        await DynamicSelectTestHelpers.selectOption(`Principal Organization ${i}`)
      }
      
      // Should only have 5 selections (due to maxSelections: 5)
      const badges = screen.getAllByText(/Principal Organization \d/)
      expect(badges.length).toBeLessThanOrEqual(5)
    })

    it('shows principal badges correctly', async () => {
      render(<OpportunityWizard {...mockProps} />)
      
      // Navigate to step 3
      const step3Button = screen.getByText('Principals')
      await userEvent.click(step3Button)
      
      await DynamicSelectTestHelpers.openSelect()
      
      const searchInput = screen.getByPlaceholderText(/search principals/i)
      await userEvent.type(searchInput, 'Principal')
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        // Should show PRINCIPAL badges
        expect(screen.getByText('PRINCIPAL')).toBeInTheDocument()
      })
    })

    it('removes principal selection when badge is clicked', async () => {
      render(<OpportunityWizard {...mockProps} />)
      
      // Navigate to step 3
      const step3Button = screen.getByText('Principals')
      await userEvent.click(step3Button)
      
      await DynamicSelectTestHelpers.openSelect()
      
      const searchInput = screen.getByPlaceholderText(/search principals/i)
      await userEvent.type(searchInput, 'Principal')
      vi.advanceTimersByTime(300)
      
      // Select multiple principals
      await DynamicSelectTestHelpers.selectOption('Principal Organization 1')
      await DynamicSelectTestHelpers.selectOption('Principal Organization 2')
      
      // Remove one selection
      await DynamicSelectTestHelpers.removeBadge('Principal Organization 1')
      
      // Should only show second selection
      expect(screen.queryByText('Principal Organization 1')).not.toBeInTheDocument()
      DynamicSelectTestHelpers.expectSelectedBadges(['Principal Organization 2'])
    })
  })

  describe('Form Validation', () => {
    it('prevents navigation to step 3 without organization selection', async () => {
      render(<OpportunityWizard {...mockProps} />)
      
      // Try to navigate to step 3 directly
      const step3Button = screen.getByText('Principals')
      await userEvent.click(step3Button)
      
      // Should not navigate (current step should still be 1)
      expect(screen.getByText('Opportunity Context')).toBeInTheDocument()
    })

    it('shows validation error for required principal selection', async () => {
      render(<OpportunityWizard {...mockProps} />)
      
      // Navigate through steps to final submission
      const nextButton = screen.getByText('Next')
      
      // Step 1 - set context
      const contextSelect = screen.getByRole('combobox')
      await userEvent.click(contextSelect)
      await userEvent.click(screen.getByText('New Product Interest'))
      await userEvent.click(nextButton)
      
      // Step 2 - select organization
      await DynamicSelectTestHelpers.openSelect()
      let searchInput = screen.getByPlaceholderText(/search organizations/i)
      await userEvent.type(searchInput, 'Organization 1')
      vi.advanceTimersByTime(300)
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      await userEvent.click(nextButton)
      
      // Step 3 - don't select principal, try to continue
      await userEvent.click(nextButton)
      
      // Should prevent navigation and show error
      expect(screen.getByText('Principal Organizations')).toBeInTheDocument()
    })
  })

  describe('Preselected Values', () => {
    it('disables organization field when preselected', () => {
      render(
        <OpportunityWizard 
          {...mockProps} 
          preselectedOrganization="org-1"
        />
      )
      
      // Navigate to step 2
      const nextButton = screen.getByText('Next')
      userEvent.click(nextButton)
      
      // Organization field should be disabled
      const orgTrigger = screen.getByRole('combobox')
      expect(orgTrigger).toBeDisabled()
    })

    it('disables contact field when preselected', () => {
      render(
        <OpportunityWizard 
          {...mockProps} 
          preselectedOrganization="org-1"
          preselectedContact="contact-1"
        />
      )
      
      // Navigate to step 2
      const nextButton = screen.getByText('Next')
      userEvent.click(nextButton)
      
      // Both fields should be disabled
      const triggers = screen.getAllByRole('combobox')
      triggers.forEach(trigger => {
        expect(trigger).toBeDisabled()
      })
    })
  })

  describe('Create New Functionality', () => {
    it('shows create new organization option', async () => {
      render(<OpportunityWizard {...mockProps} />)
      
      // Navigate to step 2
      const nextButton = screen.getByText('Next')
      await userEvent.click(nextButton)
      
      await DynamicSelectTestHelpers.openSelect()
      
      const searchInput = screen.getByPlaceholderText(/search organizations/i)
      await userEvent.type(searchInput, 'nonexistent')
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        DynamicSelectTestHelpers.expectCreateNewOption()
      })
    })

    it('calls create new organization function', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      render(<OpportunityWizard {...mockProps} />)
      
      // Navigate to step 2
      const nextButton = screen.getByText('Next')
      await userEvent.click(nextButton)
      
      await DynamicSelectTestHelpers.openSelect()
      
      const searchInput = screen.getByPlaceholderText(/search organizations/i)
      await userEvent.type(searchInput, 'new org')
      vi.advanceTimersByTime(300)
      
      await DynamicSelectTestHelpers.clickCreateNew()
      
      expect(consoleSpy).toHaveBeenCalledWith('Create new organization')
      consoleSpy.mockRestore()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes on all select fields', async () => {
      render(<OpportunityWizard {...mockProps} />)
      
      // Navigate to step 2
      const nextButton = screen.getByText('Next')
      await userEvent.click(nextButton)
      
      // Check organization field
      const orgTrigger = screen.getAllByRole('combobox')[0]
      expect(orgTrigger).toHaveAttribute('aria-expanded')
      expect(orgTrigger).toHaveAttribute('aria-haspopup')
      expect(orgTrigger).toHaveAttribute('aria-label')
      
      // Check contact field
      const contactTrigger = screen.getAllByRole('combobox')[1]
      expect(contactTrigger).toHaveAttribute('aria-expanded')
      expect(contactTrigger).toHaveAttribute('aria-haspopup')
      expect(contactTrigger).toHaveAttribute('aria-label')
    })

    it('maintains focus management during interactions', async () => {
      render(<OpportunityWizard {...mockProps} />)
      
      // Navigate to step 2
      const nextButton = screen.getByText('Next')
      await userEvent.click(nextButton)
      
      // Test keyboard navigation
      const orgTrigger = screen.getAllByRole('combobox')[0]
      orgTrigger.focus()
      
      await userEvent.keyboard('{Enter}')
      
      // Search input should be focused
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/search organizations/i)
        expect(searchInput).toHaveFocus()
      })
    })
  })
})