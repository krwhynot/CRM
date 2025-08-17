import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InteractionForm } from '@/components/interactions/InteractionForm'
import {
  DynamicSelectTestHelpers,
  createMockSearchFn,
  createOrganizationOptions,
  setupMocks,
  teardownMocks,
} from '@/test/utils/dynamic-select-test-utils'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          is: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                or: vi.fn(() => Promise.resolve({
                  data: [],
                  error: null,
                })),
                ilike: vi.fn(() => Promise.resolve({
                  data: [],
                  error: null,
                })),
                data: [],
                error: null,
              })),
            })),
          })),
        })),
        is: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              or: vi.fn(() => Promise.resolve({
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

// Mock hooks
vi.mock('@/hooks/useOrganizations', () => ({
  useOrganizations: () => ({ data: [] }),
  usePrincipals: () => ({ data: [] }),
}))

vi.mock('@/hooks/useAsyncEntitySearch', () => ({
  useOrganizationSearch: () => ({ search: vi.fn() }),
}))

vi.mock('@/stores/opportunityAutoNamingStore', () => ({
  useOpportunityNaming: () => ({
    previewName: vi.fn(),
    currentPreview: null,
    isGenerating: false,
    error: null,
  }),
}))

// Mock data
const mockCustomerOrganizations = createOrganizationOptions(10).map(org => ({
  id: org.value,
  name: org.label,
  type: 'customer',
  email: `contact@${org.label.toLowerCase().replace(/\s+/g, '')}.com`,
  website: `https://${org.label.toLowerCase().replace(/\s+/g, '')}.com`,
  city: 'Test City',
  state_province: 'TS'
}))

const mockContacts = [
  {
    id: 'contact-1',
    first_name: 'John',
    last_name: 'Doe',
    title: 'Manager',
    email: 'john.doe@test.com',
    organization_id: 'option-1',
    organizations: { name: 'Test Organization 1' }
  },
  {
    id: 'contact-2',
    first_name: 'Jane',
    last_name: 'Smith',
    title: 'Director',
    email: 'jane.smith@test.com',
    organization_id: 'option-1',
    organizations: { name: 'Test Organization 1' }
  }
]

const mockOpportunities = [
  {
    id: 'opp-1',
    name: 'Q1 2024 Product Line Expansion',
    stage: 'Demo Scheduled',
    estimated_value: 25000,
    organization_id: 'option-1',
    organization: { name: 'Test Organization 1' }
  },
  {
    id: 'opp-2',
    name: 'Seasonal Menu Integration',
    stage: 'New Lead',
    estimated_value: 15000,
    organization_id: 'option-1',
    organization: { name: 'Test Organization 1' }
  }
]

const mockSupabaseQueries = () => {
  const { supabase } = require('@/lib/supabase')
  
  supabase.from.mockImplementation((table: string) => {
    if (table === 'organizations') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            is: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(() => ({
                  or: vi.fn(() => Promise.resolve({
                    data: mockCustomerOrganizations,
                    error: null
                  })),
                  data: mockCustomerOrganizations,
                  error: null
                })),
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
    
    if (table === 'opportunities') {
      return {
        select: vi.fn(() => ({
          is: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                eq: vi.fn(() => ({
                  ilike: vi.fn(() => Promise.resolve({
                    data: mockOpportunities,
                    error: null
                  })),
                  data: mockOpportunities,
                  error: null
                })),
                ilike: vi.fn(() => Promise.resolve({
                  data: mockOpportunities,
                  error: null
                })),
                data: mockOpportunities,
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

describe('InteractionForm - DynamicSelect Integration', () => {
  const mockProps = {
    onSubmit: vi.fn(),
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

  describe('Link Existing Mode', () => {
    it('renders organization DynamicSelectField for customers only', async () => {
      render(<InteractionForm {...mockProps} mode="link-existing" />)
      
      // Should show organization select field
      expect(screen.getByText('Customer Organization')).toBeInTheDocument()
      expect(screen.getByText('Search and select organization...')).toBeInTheDocument()
    })

    it('searches and displays customer organizations', async () => {
      render(<InteractionForm {...mockProps} mode="link-existing" />)
      
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

    it('shows organization email in description', async () => {
      render(<InteractionForm {...mockProps} mode="link-existing" />)
      
      await DynamicSelectTestHelpers.openSelect()
      
      const searchInput = screen.getByPlaceholderText(/search organizations/i)
      await userEvent.type(searchInput, 'Organization')
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        // Should show email in description
        expect(screen.getByText('contact@testorganization1.com')).toBeInTheDocument()
      })
    })

    it('enables contact field when organization is selected', async () => {
      render(<InteractionForm {...mockProps} mode="link-existing" />)
      
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
        trigger.getAttribute('aria-label')?.includes('Contact Person')
      )
      expect(contactTrigger).not.toBeDisabled()
    })

    it('enables opportunity field when organization is selected', async () => {
      render(<InteractionForm {...mockProps} mode="link-existing" />)
      
      // Select an organization first
      await DynamicSelectTestHelpers.openSelect()
      const searchInput = screen.getByPlaceholderText(/search organizations/i)
      await userEvent.type(searchInput, 'Organization 1')
      vi.advanceTimersByTime(300)
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      
      // Opportunity field should now be enabled
      const opportunityTrigger = screen.getAllByRole('combobox').find(trigger => 
        trigger.getAttribute('aria-label')?.includes('Opportunity')
      )
      expect(opportunityTrigger).not.toBeDisabled()
    })

    it('searches and displays opportunities for selected organization', async () => {
      render(<InteractionForm {...mockProps} mode="link-existing" />)
      
      // Select organization first
      await DynamicSelectTestHelpers.openSelect()
      let searchInput = screen.getByPlaceholderText(/search organizations/i)
      await userEvent.type(searchInput, 'Organization 1')
      vi.advanceTimersByTime(300)
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      
      // Now search opportunities
      const opportunityTriggers = screen.getAllByRole('combobox')
      const opportunityTrigger = opportunityTriggers.find(trigger => 
        trigger.getAttribute('aria-label')?.includes('Opportunity')
      )
      
      await userEvent.click(opportunityTrigger!)
      
      await waitFor(() => {
        searchInput = screen.getByPlaceholderText(/search opportunities/i)
        expect(searchInput).toBeInTheDocument()
      })
      
      await userEvent.type(searchInput, 'Product')
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        expect(screen.getByText('Q1 2024 Product Line Expansion')).toBeInTheDocument()
      })
    })

    it('shows opportunity stage and value in description/badge', async () => {
      render(<InteractionForm {...mockProps} mode="link-existing" />)
      
      // Select organization and search opportunities
      await DynamicSelectTestHelpers.openSelect()
      let searchInput = screen.getByPlaceholderText(/search organizations/i)
      await userEvent.type(searchInput, 'Organization 1')
      vi.advanceTimersByTime(300)
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      
      const opportunityTriggers = screen.getAllByRole('combobox')
      const opportunityTrigger = opportunityTriggers.find(trigger => 
        trigger.getAttribute('aria-label')?.includes('Opportunity')
      )
      
      await userEvent.click(opportunityTrigger!)
      searchInput = screen.getByPlaceholderText(/search opportunities/i)
      await userEvent.type(searchInput, 'Product')
      vi.advanceTimersByTime(300)
      
      await waitFor(() => {
        // Should show stage in description
        expect(screen.getByText(/Demo Scheduled.*Test Organization 1/)).toBeInTheDocument()
        // Should show value badge
        expect(screen.getByText('25K')).toBeInTheDocument()
      })
    })

    it('clears dependent fields when organization changes', async () => {
      render(<InteractionForm {...mockProps} mode="link-existing" />)
      
      // Select organization and then change it
      await DynamicSelectTestHelpers.openSelect()
      let searchInput = screen.getByPlaceholderText(/search organizations/i)
      await userEvent.type(searchInput, 'Organization 1')
      vi.advanceTimersByTime(300)
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      
      // Clear organization selection
      await DynamicSelectTestHelpers.clearSelection()
      
      // Contact and opportunity fields should be disabled again
      const triggers = screen.getAllByRole('combobox')
      const contactTrigger = triggers.find(trigger => 
        trigger.getAttribute('aria-label')?.includes('Contact Person')
      )
      const opportunityTrigger = triggers.find(trigger => 
        trigger.getAttribute('aria-label')?.includes('Opportunity')
      )
      
      expect(contactTrigger).toBeDisabled()
      expect(opportunityTrigger).toBeDisabled()
    })
  })

  describe('Create Opportunity Mode', () => {
    it('shows opportunity creation fields in create mode', async () => {
      render(<InteractionForm {...mockProps} mode="create-opportunity" />)
      
      // Should show opportunity creation section
      expect(screen.getByText('New Opportunity Creation')).toBeInTheDocument()
      expect(screen.getByText('Opportunity Context')).toBeInTheDocument()
      expect(screen.getByText('Principal Organization')).toBeInTheDocument()
    })

    it('does not show opportunity select field in create mode', () => {
      render(<InteractionForm {...mockProps} mode="create-opportunity" />)
      
      // Should not show opportunity select field
      expect(screen.queryByText(/Search and select opportunity/)).not.toBeInTheDocument()
    })

    it('allows switching between modes', async () => {
      const mockModeChange = vi.fn()
      
      render(
        <InteractionForm 
          {...mockProps} 
          mode="link-existing" 
          onModeChange={mockModeChange}
        />
      )
      
      // Should show mode selector
      const modeSelect = screen.getByDisplayValue(/Link to Existing Opportunity/)
      await userEvent.click(modeSelect)
      
      // Should be able to select create mode
      const createOption = screen.getByText(/Create New Opportunity/)
      await userEvent.click(createOption)
      
      expect(mockModeChange).toHaveBeenCalledWith('create-opportunity')
    })

    it('shows opportunity context selection in create mode', async () => {
      render(<InteractionForm {...mockProps} mode="create-opportunity" />)
      
      // Should show context selection
      expect(screen.getByText('Opportunity Context')).toBeInTheDocument()
      
      // Open context selector
      const contextSelect = screen.getByRole('combobox', { name: /opportunity context/i })
      await userEvent.click(contextSelect)
      
      // Should show context options
      expect(screen.getByText('Site Visit')).toBeInTheDocument()
      expect(screen.getByText('Food Show')).toBeInTheDocument()
      expect(screen.getByText('New Product Interest')).toBeInTheDocument()
    })

    it('shows principal organization selection in create mode', async () => {
      render(<InteractionForm {...mockProps} mode="create-opportunity" />)
      
      // Should show principal selection
      expect(screen.getByText('Principal Organization')).toBeInTheDocument()
      expect(screen.getByText('No specific principal')).toBeInTheDocument()
    })

    it('shows initial stage selection in create mode', async () => {
      render(<InteractionForm {...mockProps} mode="create-opportunity" />)
      
      // Should show stage selection
      expect(screen.getByText('Initial Stage')).toBeInTheDocument()
      
      // Open stage selector
      const stageSelect = screen.getByRole('combobox', { name: /initial stage/i })
      await userEvent.click(stageSelect)
      
      // Should show stage options
      expect(screen.getByText('New Lead')).toBeInTheDocument()
      expect(screen.getByText('Initial Outreach')).toBeInTheDocument()
    })
  })

  describe('Contact Selection', () => {
    it('searches contacts for selected organization', async () => {
      render(<InteractionForm {...mockProps} mode="link-existing" />)
      
      // Select organization first
      await DynamicSelectTestHelpers.openSelect()
      let searchInput = screen.getByPlaceholderText(/search organizations/i)
      await userEvent.type(searchInput, 'Organization 1')
      vi.advanceTimersByTime(300)
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      
      // Now search contacts
      const contactTriggers = screen.getAllByRole('combobox')
      const contactTrigger = contactTriggers.find(trigger => 
        trigger.getAttribute('aria-label')?.includes('Contact Person')
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

    it('shows contact title and organization in description', async () => {
      render(<InteractionForm {...mockProps} mode="link-existing" />)
      
      // Select organization and search contacts
      await DynamicSelectTestHelpers.openSelect()
      let searchInput = screen.getByPlaceholderText(/search organizations/i)
      await userEvent.type(searchInput, 'Organization 1')
      vi.advanceTimersByTime(300)
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      
      const contactTriggers = screen.getAllByRole('combobox')
      const contactTrigger = contactTriggers.find(trigger => 
        trigger.getAttribute('aria-label')?.includes('Contact Person')
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

    it('shows appropriate message when no organization is selected', () => {
      render(<InteractionForm {...mockProps} mode="link-existing" />)
      
      // Contact field should show appropriate message
      const contactTrigger = screen.getAllByRole('combobox').find(trigger => 
        trigger.getAttribute('aria-label')?.includes('Contact Person')
      )
      expect(contactTrigger).toBeDisabled()
    })
  })

  describe('Create New Functionality', () => {
    it('shows create new organization option when no results', async () => {
      // Mock empty results
      const { supabase } = require('@/lib/supabase')
      supabase.from.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            is: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(() => ({
                  or: vi.fn(() => Promise.resolve({
                    data: [],
                    error: null
                  })),
                  data: [],
                  error: null
                })),
              })),
            })),
          })),
        }))
      }))

      render(<InteractionForm {...mockProps} mode="link-existing" />)
      
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
      
      // Mock empty results to show create option
      const { supabase } = require('@/lib/supabase')
      supabase.from.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            is: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(() => ({
                  or: vi.fn(() => Promise.resolve({
                    data: [],
                    error: null
                  })),
                  data: [],
                  error: null
                })),
              })),
            })),
          })),
        }))
      }))

      render(<InteractionForm {...mockProps} mode="link-existing" />)
      
      await DynamicSelectTestHelpers.openSelect()
      
      const searchInput = screen.getByPlaceholderText(/search organizations/i)
      await userEvent.type(searchInput, 'new org')
      vi.advanceTimersByTime(300)
      
      await DynamicSelectTestHelpers.clickCreateNew()
      
      expect(consoleSpy).toHaveBeenCalledWith('Create new organization')
      consoleSpy.mockRestore()
    })
  })

  describe('Preselected Values', () => {
    it('disables organization field when preselected', () => {
      render(
        <InteractionForm 
          {...mockProps} 
          mode="link-existing"
          preselectedOrganization="org-1"
        />
      )
      
      // Organization field should be disabled
      const orgTrigger = screen.getAllByRole('combobox').find(trigger => 
        trigger.getAttribute('aria-label')?.includes('Customer Organization')
      )
      expect(orgTrigger).toBeDisabled()
    })

    it('disables contact field when preselected', () => {
      render(
        <InteractionForm 
          {...mockProps} 
          mode="link-existing"
          preselectedOrganization="org-1"
          preselectedContact="contact-1"
        />
      )
      
      // Contact field should be disabled
      const contactTrigger = screen.getAllByRole('combobox').find(trigger => 
        trigger.getAttribute('aria-label')?.includes('Contact Person')
      )
      expect(contactTrigger).toBeDisabled()
    })

    it('disables opportunity field when preselected', () => {
      render(
        <InteractionForm 
          {...mockProps} 
          mode="link-existing"
          preselectedOpportunity="opp-1"
        />
      )
      
      // Opportunity field should be disabled
      const oppTrigger = screen.getAllByRole('combobox').find(trigger => 
        trigger.getAttribute('aria-label')?.includes('Opportunity')
      )
      expect(oppTrigger).toBeDisabled()
    })
  })

  describe('Form Validation', () => {
    it('shows validation error for required organization', async () => {
      render(<InteractionForm {...mockProps} mode="link-existing" />)
      
      // Try to submit without selecting organization
      const submitButton = screen.getByRole('button', { name: /save interaction/i })
      await userEvent.click(submitButton)
      
      await waitFor(() => {
        // Should show validation error
        expect(screen.getByText(/organization.*required/i)).toBeInTheDocument()
      })
    })

    it('shows validation error for required opportunity in link mode', async () => {
      render(<InteractionForm {...mockProps} mode="link-existing" />)
      
      // Select organization but not opportunity
      await DynamicSelectTestHelpers.openSelect()
      const searchInput = screen.getByPlaceholderText(/search organizations/i)
      await userEvent.type(searchInput, 'Organization 1')
      vi.advanceTimersByTime(300)
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      
      // Try to submit without selecting opportunity
      const submitButton = screen.getByRole('button', { name: /save interaction/i })
      await userEvent.click(submitButton)
      
      await waitFor(() => {
        // Should show validation error for opportunity
        expect(screen.getByText(/opportunity.*required/i)).toBeInTheDocument()
      })
    })

    it('clears validation errors when valid selections are made', async () => {
      render(<InteractionForm {...mockProps} mode="link-existing" />)
      
      // Trigger validation error
      const submitButton = screen.getByRole('button', { name: /save interaction/i })
      await userEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/organization.*required/i)).toBeInTheDocument()
      })

      // Make valid selections
      await DynamicSelectTestHelpers.openSelect()
      let searchInput = screen.getByPlaceholderText(/search organizations/i)
      await userEvent.type(searchInput, 'Organization 1')
      vi.advanceTimersByTime(300)
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      
      // Select opportunity
      const opportunityTriggers = screen.getAllByRole('combobox')
      const opportunityTrigger = opportunityTriggers.find(trigger => 
        trigger.getAttribute('aria-label')?.includes('Opportunity')
      )
      await userEvent.click(opportunityTrigger!)
      searchInput = screen.getByPlaceholderText(/search opportunities/i)
      await userEvent.type(searchInput, 'Product')
      vi.advanceTimersByTime(300)
      await DynamicSelectTestHelpers.selectOption('Q1 2024 Product Line Expansion')
      
      // Errors should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/organization.*required/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/opportunity.*required/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes on all select fields', async () => {
      render(<InteractionForm {...mockProps} mode="link-existing" />)
      
      // Check all combobox elements have proper ARIA attributes
      const triggers = screen.getAllByRole('combobox')
      triggers.forEach(trigger => {
        expect(trigger).toHaveAttribute('aria-expanded')
        expect(trigger).toHaveAttribute('aria-haspopup')
        expect(trigger).toHaveAttribute('aria-label')
      })
    })

    it('provides proper labels and descriptions for all fields', () => {
      render(<InteractionForm {...mockProps} mode="link-existing" />)
      
      // Check for proper labeling
      expect(screen.getByText('Customer Organization')).toBeInTheDocument()
      expect(screen.getByText('Contact Person')).toBeInTheDocument()
      expect(screen.getByText('Opportunity')).toBeInTheDocument()
      
      // Check for descriptions
      expect(screen.getByText('Customer organization for this interaction')).toBeInTheDocument()
      expect(screen.getByText('Specific person involved in this interaction')).toBeInTheDocument()
      expect(screen.getByText('Required: Every interaction must be linked to an opportunity')).toBeInTheDocument()
    })

    it('maintains proper focus management', async () => {
      render(<InteractionForm {...mockProps} mode="link-existing" />)
      
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