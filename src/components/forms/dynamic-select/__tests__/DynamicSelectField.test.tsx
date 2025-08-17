import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  SingleSelectTestWrapper,
  MultiSelectTestWrapper,
  DynamicSelectTestHelpers,
  TestDataPresets,
  createMockSearchFn,
  createFailingSearchFn,
  createSlowSearchFn,
  setupMocks,
  teardownMocks,
  renderDynamicSelect,
} from '@/test/utils/dynamic-select-test-utils'

describe('DynamicSelectField', () => {
  beforeEach(() => {
    setupMocks()
    vi.clearAllTimers()
    vi.useFakeTimers()
  })

  afterEach(() => {
    teardownMocks()
    cleanup()
    vi.useRealTimers()
  })

  describe('Core Functionality', () => {
    it('renders with correct label and placeholder', () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper 
          onSearch={mockSearch}
          fieldProps={{ label: 'Test Organization', placeholder: 'Choose organization...' }}
        />
      )

      expect(screen.getByText('Test Organization')).toBeInTheDocument()
      expect(screen.getByText('Choose organization...')).toBeInTheDocument()
    })

    it('shows required indicator when field is required', () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper 
          onSearch={mockSearch}
          fieldProps={{ required: true }}
        />
      )

      expect(screen.getByText('*')).toBeInTheDocument()
    })

    it('opens search interface when trigger is clicked', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper onSearch={mockSearch} />
      )

      await DynamicSelectTestHelpers.openSelect()
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
    })

    it('calls search function with debounced query', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper 
          onSearch={mockSearch}
          fieldProps={{ debounceMs: 300 }}
        />
      )

      await DynamicSelectTestHelpers.searchFor('test')
      
      // Should not call immediately
      expect(mockSearch).not.toHaveBeenCalled()
      
      // Fast-forward debounce time
      vi.advanceTimersByTime(300)
      await waitFor(() => {
        expect(mockSearch).toHaveBeenCalledWith('test')
      })
    })

    it('displays search results correctly', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper onSearch={mockSearch} />
      )

      await DynamicSelectTestHelpers.searchFor('organization')
      vi.advanceTimersByTime(500)
      
      await waitFor(() => {
        TestDataPresets.organizations.forEach(org => {
          expect(screen.getByText(org.label)).toBeInTheDocument()
        })
      })
    })

    it('filters results based on search query', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper onSearch={mockSearch} />
      )

      await DynamicSelectTestHelpers.searchFor('Organization 1')
      vi.advanceTimersByTime(500)
      
      await waitFor(() => {
        expect(screen.getByText('Test Organization 1')).toBeInTheDocument()
        expect(screen.queryByText('Test Organization 2')).not.toBeInTheDocument()
      })
    })

    it('shows loading state during search', async () => {
      const mockSearch = createSlowSearchFn(TestDataPresets.organizations, 1000)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper onSearch={mockSearch} />
      )

      await DynamicSelectTestHelpers.searchFor('test')
      vi.advanceTimersByTime(500)
      
      await waitFor(() => {
        DynamicSelectTestHelpers.expectLoadingState()
      })
    })

    it('shows no results message when search returns empty', async () => {
      const mockSearch = createMockSearchFn([])
      
      renderDynamicSelect(
        <SingleSelectTestWrapper onSearch={mockSearch} />
      )

      await DynamicSelectTestHelpers.searchFor('nonexistent')
      vi.advanceTimersByTime(500)
      
      await waitFor(() => {
        DynamicSelectTestHelpers.expectNoResults()
      })
    })

    it('handles search errors gracefully', async () => {
      const mockSearch = createFailingSearchFn('Network error')
      
      renderDynamicSelect(
        <SingleSelectTestWrapper onSearch={mockSearch} />
      )

      await DynamicSelectTestHelpers.searchFor('test')
      vi.advanceTimersByTime(500)
      
      // Should not crash and should show some error indication
      await waitFor(() => {
        // The component should handle errors gracefully
        expect(screen.getByRole('combobox')).toBeInTheDocument()
      })
    })
  })

  describe('Single Select Mode', () => {
    it('selects option and closes popover', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper onSearch={mockSearch} />
      )

      await DynamicSelectTestHelpers.searchFor('Organization 1')
      vi.advanceTimersByTime(500)
      
      await waitFor(() => {
        expect(screen.getByText('Test Organization 1')).toBeInTheDocument()
      })
      
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      
      // Should show selected value and close popover
      DynamicSelectTestHelpers.expectSelectedValue('Test Organization 1')
      expect(screen.queryByPlaceholderText(/search/i)).not.toBeInTheDocument()
    })

    it('replaces selection when new option is selected', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper onSearch={mockSearch} />
      )

      // Select first option
      await DynamicSelectTestHelpers.searchFor('Organization 1')
      vi.advanceTimersByTime(500)
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      
      DynamicSelectTestHelpers.expectSelectedValue('Test Organization 1')

      // Select different option
      await DynamicSelectTestHelpers.searchFor('Organization 2')
      vi.advanceTimersByTime(500)
      await DynamicSelectTestHelpers.selectOption('Test Organization 2')
      
      DynamicSelectTestHelpers.expectSelectedValue('Test Organization 2')
      expect(screen.queryByText('Test Organization 1')).not.toBeInTheDocument()
    })

    it('shows clear button when clearable and has selection', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper 
          onSearch={mockSearch}
          fieldProps={{ clearable: true }}
        />
      )

      await DynamicSelectTestHelpers.searchFor('Organization 1')
      vi.advanceTimersByTime(500)
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      
      expect(screen.getByLabelText(/clear selection/i)).toBeInTheDocument()
    })

    it('clears selection when clear button is clicked', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper 
          onSearch={mockSearch}
          fieldProps={{ clearable: true }}
        />
      )

      await DynamicSelectTestHelpers.searchFor('Organization 1')
      vi.advanceTimersByTime(500)
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      
      await DynamicSelectTestHelpers.clearSelection()
      
      DynamicSelectTestHelpers.expectNoSelection()
    })

    it('displays badges correctly for selected option', async () => {
      const optionsWithBadges = TestDataPresets.organizations
      const mockSearch = createMockSearchFn(optionsWithBadges)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper onSearch={mockSearch} />
      )

      await DynamicSelectTestHelpers.searchFor('Organization 1')
      vi.advanceTimersByTime(500)
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      
      // Should show the badge
      expect(screen.getByText('CUSTOMER')).toBeInTheDocument()
    })
  })

  describe('Multi Select Mode', () => {
    it('allows multiple selections without closing popover', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <MultiSelectTestWrapper onSearch={mockSearch} />
      )

      await DynamicSelectTestHelpers.searchFor('Organization')
      vi.advanceTimersByTime(500)
      
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      await DynamicSelectTestHelpers.selectOption('Test Organization 2')
      
      // Should still have search input visible (popover open)
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
      
      // Should show both selections as badges
      DynamicSelectTestHelpers.expectSelectedBadges(['Test Organization 1', 'Test Organization 2'])
    })

    it('removes selection when badge remove button is clicked', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <MultiSelectTestWrapper onSearch={mockSearch} />
      )

      await DynamicSelectTestHelpers.searchFor('Organization')
      vi.advanceTimersByTime(500)
      
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      await DynamicSelectTestHelpers.selectOption('Test Organization 2')
      
      // Remove first selection
      await DynamicSelectTestHelpers.removeBadge('Test Organization 1')
      
      // Should only show second selection
      expect(screen.queryByText('Test Organization 1')).not.toBeInTheDocument()
      DynamicSelectTestHelpers.expectSelectedBadges(['Test Organization 2'])
    })

    it('respects maxSelections limit', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <MultiSelectTestWrapper 
          onSearch={mockSearch}
          fieldProps={{ maxSelections: 2 }}
        />
      )

      await DynamicSelectTestHelpers.searchFor('Organization')
      vi.advanceTimersByTime(500)
      
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      await DynamicSelectTestHelpers.selectOption('Test Organization 2')
      
      // Try to select third option - should be prevented
      await DynamicSelectTestHelpers.selectOption('Test Organization 3')
      
      // Should only have 2 selections
      DynamicSelectTestHelpers.expectSelectedBadges(['Test Organization 1', 'Test Organization 2'])
      expect(screen.queryByText('Test Organization 3')).not.toBeInTheDocument()
    })

    it('shows +N more indicator when many options selected', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations.slice(0, 5))
      
      renderDynamicSelect(
        <MultiSelectTestWrapper onSearch={mockSearch} />
      )

      await DynamicSelectTestHelpers.searchFor('Organization')
      vi.advanceTimersByTime(500)
      
      // Select 5 options
      for (let i = 1; i <= 5; i++) {
        await DynamicSelectTestHelpers.selectOption(`Test Organization ${i}`)
      }
      
      // Should show +N more indicator
      expect(screen.getByText('+2 more')).toBeInTheDocument()
    })

    it('clears all selections when clear button is clicked', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <MultiSelectTestWrapper 
          onSearch={mockSearch}
          fieldProps={{ clearable: true }}
        />
      )

      await DynamicSelectTestHelpers.searchFor('Organization')
      vi.advanceTimersByTime(500)
      
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      await DynamicSelectTestHelpers.selectOption('Test Organization 2')
      
      await DynamicSelectTestHelpers.clearSelection()
      
      DynamicSelectTestHelpers.expectNoSelection()
    })
  })

  describe('Create New Functionality', () => {
    it('shows create new option when enabled and no results', async () => {
      const mockSearch = createMockSearchFn([])
      const mockCreateNew = vi.fn()
      
      renderDynamicSelect(
        <SingleSelectTestWrapper 
          onSearch={mockSearch}
          fieldProps={{ 
            onCreateNew: mockCreateNew,
            showCreateWhenEmpty: true 
          }}
        />
      )

      await DynamicSelectTestHelpers.searchFor('nonexistent')
      vi.advanceTimersByTime(500)
      
      await waitFor(() => {
        DynamicSelectTestHelpers.expectCreateNewOption()
      })
    })

    it('calls onCreateNew when create button is clicked', async () => {
      const mockSearch = createMockSearchFn([])
      const mockCreateNew = vi.fn()
      
      renderDynamicSelect(
        <SingleSelectTestWrapper 
          onSearch={mockSearch}
          fieldProps={{ 
            onCreateNew: mockCreateNew,
            showCreateWhenEmpty: true 
          }}
        />
      )

      await DynamicSelectTestHelpers.searchFor('new item')
      vi.advanceTimersByTime(500)
      
      await DynamicSelectTestHelpers.clickCreateNew()
      
      expect(mockCreateNew).toHaveBeenCalled()
    })

    it('shows create new option always when showCreateAlways is true', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      const mockCreateNew = vi.fn()
      
      renderDynamicSelect(
        <SingleSelectTestWrapper 
          onSearch={mockSearch}
          fieldProps={{ 
            onCreateNew: mockCreateNew,
            showCreateAlways: true 
          }}
        />
      )

      await DynamicSelectTestHelpers.searchFor('Organization')
      vi.advanceTimersByTime(500)
      
      await waitFor(() => {
        DynamicSelectTestHelpers.expectCreateNewOption()
      })
    })
  })

  describe('Preload Options', () => {
    it('shows preload options when opened without search', async () => {
      const mockSearch = createMockSearchFn([])
      const preloadOptions = TestDataPresets.organizations.slice(0, 3)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper 
          onSearch={mockSearch}
          fieldProps={{ preloadOptions }}
        />
      )

      await DynamicSelectTestHelpers.openSelect()
      
      preloadOptions.forEach(option => {
        expect(screen.getByText(option.label)).toBeInTheDocument()
      })
    })

    it('combines preload options with search results', async () => {
      const searchResults = TestDataPresets.organizations.slice(3, 5)
      const mockSearch = createMockSearchFn(searchResults)
      const preloadOptions = TestDataPresets.organizations.slice(0, 2)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper 
          onSearch={mockSearch}
          fieldProps={{ preloadOptions }}
        />
      )

      await DynamicSelectTestHelpers.searchFor('Organization')
      vi.advanceTimersByTime(500)
      
      // Should show both preload and search results
      await waitFor(() => {
        [...preloadOptions, ...searchResults].forEach(option => {
          expect(screen.getByText(option.label)).toBeInTheDocument()
        })
      })
    })
  })

  describe('Form Integration', () => {
    it('shows validation error when field is required and empty', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper 
          onSearch={mockSearch}
          fieldProps={{ required: true }}
        />
      )

      // Trigger validation by focusing and blurring
      const trigger = screen.getByRole('combobox')
      await userEvent.click(trigger)
      await userEvent.tab()
      
      await waitFor(() => {
        DynamicSelectTestHelpers.expectValidationError('Test Select is required')
      })
    })

    it('clears validation error when valid selection is made', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper 
          onSearch={mockSearch}
          fieldProps={{ required: true }}
        />
      )

      // Trigger validation error
      const trigger = screen.getByRole('combobox')
      await userEvent.click(trigger)
      await userEvent.tab()
      
      await waitFor(() => {
        expect(screen.getByText('Test Select is required')).toBeInTheDocument()
      })

      // Make valid selection
      await DynamicSelectTestHelpers.searchFor('Organization 1')
      vi.advanceTimersByTime(500)
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      
      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText('Test Select is required')).not.toBeInTheDocument()
      })
    })
  })

  describe('Disabled State', () => {
    it('prevents interaction when disabled', () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper 
          onSearch={mockSearch}
          fieldProps={{ disabled: true }}
        />
      )

      const trigger = screen.getByRole('combobox')
      expect(trigger).toBeDisabled()
    })

    it('does not show clear button when disabled', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper 
          onSearch={mockSearch}
          defaultValue="option-1"
          fieldProps={{ disabled: true, clearable: true }}
        />
      )

      expect(screen.queryByLabelText(/clear/i)).not.toBeInTheDocument()
    })
  })
})