import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  SingleSelectTestWrapper,
  MultiSelectTestWrapper,
  DynamicSelectTestHelpers,
  TestDataPresets,
  createMockSearchFn,
  setupMocks,
  teardownMocks,
  renderDynamicSelect,
} from '@/test/utils/dynamic-select-test-utils'

describe('DynamicSelectField - Accessibility', () => {
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

  describe('ARIA Attributes', () => {
    it('has proper combobox role and attributes', () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper onSearch={mockSearch} />
      )

      const trigger = screen.getByRole('combobox')
      
      // Basic combobox attributes
      expect(trigger).toHaveAttribute('role', 'combobox')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
      expect(trigger).toHaveAttribute('aria-label')
    })

    it('updates aria-expanded when opened/closed', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper onSearch={mockSearch} />
      )

      const trigger = screen.getByRole('combobox')
      
      // Initially closed
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      
      // Open the select
      await userEvent.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      
      // Close with Escape
      await userEvent.keyboard('{Escape}')
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'false')
      })
    })

    it('provides descriptive aria-label for current state', () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper onSearch={mockSearch} />
      )

      const trigger = screen.getByRole('combobox')
      const ariaLabel = trigger.getAttribute('aria-label')
      
      expect(ariaLabel).toMatch(/Test Select/)
      expect(ariaLabel).toMatch(/No selection/)
      expect(ariaLabel).toMatch(/Press Enter or Space to open/)
    })

    it('updates aria-label when selection is made', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper onSearch={mockSearch} />
      )

      const trigger = screen.getByRole('combobox')
      
      // Make a selection
      await DynamicSelectTestHelpers.searchFor('Organization 1')
      vi.advanceTimersByTime(500)
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      
      // Check updated aria-label
      const ariaLabel = trigger.getAttribute('aria-label')
      expect(ariaLabel).toMatch(/Currently selected: Test Organization 1/)
    })

    it('provides proper aria-label for multi-select', () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <MultiSelectTestWrapper onSearch={mockSearch} />
      )

      const trigger = screen.getByRole('combobox')
      const ariaLabel = trigger.getAttribute('aria-label')
      
      expect(ariaLabel).toMatch(/Test Multi-Select/)
      expect(ariaLabel).toMatch(/No selections/)
    })

    it('updates aria-label for multi-select with selections', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <MultiSelectTestWrapper onSearch={mockSearch} />
      )

      const trigger = screen.getByRole('combobox')
      
      // Make multiple selections
      await DynamicSelectTestHelpers.searchFor('Organization')
      vi.advanceTimersByTime(500)
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      await DynamicSelectTestHelpers.selectOption('Test Organization 2')
      
      // Check updated aria-label
      const ariaLabel = trigger.getAttribute('aria-label')
      expect(ariaLabel).toMatch(/Currently selected: 2 items/)
    })

    it('provides aria-label for clear buttons', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper 
          onSearch={mockSearch}
          fieldProps={{ clearable: true }}
        />
      )

      // Make a selection to show clear button
      await DynamicSelectTestHelpers.searchFor('Organization 1')
      vi.advanceTimersByTime(500)
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      
      // Check clear button aria-label
      const clearButton = screen.getByLabelText(/clear selection/i)
      expect(clearButton).toHaveAttribute('aria-label', 'Clear selection: Test Organization 1')
    })

    it('provides aria-label for remove buttons in multi-select', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <MultiSelectTestWrapper onSearch={mockSearch} />
      )

      // Make selections
      await DynamicSelectTestHelpers.searchFor('Organization')
      vi.advanceTimersByTime(500)
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      
      // Check remove button aria-label
      const removeButton = screen.getByLabelText(/remove test organization 1/i)
      expect(removeButton).toBeInTheDocument()
    })
  })

  describe('Keyboard Navigation', () => {
    it('opens with Enter key', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper onSearch={mockSearch} />
      )

      const trigger = screen.getByRole('combobox')
      trigger.focus()
      
      await userEvent.keyboard('{Enter}')
      
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true')
        expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
      })
    })

    it('opens with Space key', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper onSearch={mockSearch} />
      )

      const trigger = screen.getByRole('combobox')
      trigger.focus()
      
      await userEvent.keyboard(' ')
      
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'true')
        expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
      })
    })

    it('closes with Escape key', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper onSearch={mockSearch} />
      )

      const trigger = screen.getByRole('combobox')
      
      // Open first
      await userEvent.click(trigger)
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
      
      // Close with Escape
      await userEvent.keyboard('{Escape}')
      
      await waitFor(() => {
        expect(trigger).toHaveAttribute('aria-expanded', 'false')
      })
    })

    it('navigates options with arrow keys', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper onSearch={mockSearch} />
      )

      await DynamicSelectTestHelpers.openSelect()
      vi.advanceTimersByTime(500)
      
      // Wait for options to load
      await waitFor(() => {
        expect(screen.getByText('Test Organization 1')).toBeInTheDocument()
      })
      
      // Navigate with arrow keys
      await userEvent.keyboard('{ArrowDown}')
      await userEvent.keyboard('{ArrowUp}')
      
      // Should not crash or have accessibility violations
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
    })

    it('focuses search input when opened', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper onSearch={mockSearch} />
      )

      const trigger = screen.getByRole('combobox')
      await userEvent.click(trigger)
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/search/i)
        expect(searchInput).toHaveFocus()
      })
    })

    it('returns focus to trigger after selection', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper onSearch={mockSearch} />
      )

      const trigger = screen.getByRole('combobox')
      
      await DynamicSelectTestHelpers.searchFor('Organization 1')
      vi.advanceTimersByTime(500)
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      
      // Focus should return to trigger after selection
      await waitFor(() => {
        expect(trigger).toHaveFocus()
      })
    })

    it('supports keyboard navigation for clear button', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper 
          onSearch={mockSearch}
          fieldProps={{ clearable: true }}
        />
      )

      // Make a selection
      await DynamicSelectTestHelpers.searchFor('Organization 1')
      vi.advanceTimersByTime(500)
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      
      // Tab to clear button and activate with keyboard
      const clearButton = screen.getByLabelText(/clear selection/i)
      clearButton.focus()
      
      await userEvent.keyboard('{Enter}')
      
      // Selection should be cleared
      DynamicSelectTestHelpers.expectNoSelection()
    })

    it('supports keyboard navigation for remove buttons in multi-select', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <MultiSelectTestWrapper onSearch={mockSearch} />
      )

      // Make selections
      await DynamicSelectTestHelpers.searchFor('Organization')
      vi.advanceTimersByTime(500)
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      
      // Focus and activate remove button with keyboard
      const removeButton = screen.getByLabelText(/remove test organization 1/i)
      removeButton.focus()
      
      await userEvent.keyboard('{Enter}')
      
      // Selection should be removed
      expect(screen.queryByText('Test Organization 1')).not.toBeInTheDocument()
    })
  })

  describe('Screen Reader Support', () => {
    it('announces selection changes', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper onSearch={mockSearch} />
      )

      // Look for live region
      const liveRegion = screen.getByRole('status')
      expect(liveRegion).toHaveAttribute('aria-live', 'polite')
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true')
      
      // Make a selection
      await DynamicSelectTestHelpers.searchFor('Organization 1')
      vi.advanceTimersByTime(500)
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      
      // Should announce selection
      await waitFor(() => {
        expect(liveRegion).toHaveTextContent(/selected.*test organization 1/i)
      })
    })

    it('announces multi-select changes with count', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <MultiSelectTestWrapper onSearch={mockSearch} />
      )

      const liveRegion = screen.getByRole('status')
      
      // Make multiple selections
      await DynamicSelectTestHelpers.searchFor('Organization')
      vi.advanceTimersByTime(500)
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      
      // Should announce with count
      await waitFor(() => {
        expect(liveRegion).toHaveTextContent(/1 items selected/i)
      })
      
      await DynamicSelectTestHelpers.selectOption('Test Organization 2')
      
      await waitFor(() => {
        expect(liveRegion).toHaveTextContent(/2 items selected/i)
      })
    })

    it('announces removal in multi-select', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <MultiSelectTestWrapper onSearch={mockSearch} />
      )

      const liveRegion = screen.getByRole('status')
      
      // Make selections and then remove one
      await DynamicSelectTestHelpers.searchFor('Organization')
      vi.advanceTimersByTime(500)
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      await DynamicSelectTestHelpers.selectOption('Test Organization 2')
      
      await DynamicSelectTestHelpers.removeBadge('Test Organization 1')
      
      // Should announce removal
      await waitFor(() => {
        expect(liveRegion).toHaveTextContent(/removed.*test organization 1.*1 items selected/i)
      })
    })

    it('announces clear action', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper 
          onSearch={mockSearch}
          fieldProps={{ clearable: true }}
        />
      )

      const liveRegion = screen.getByRole('status')
      
      // Make selection and clear
      await DynamicSelectTestHelpers.searchFor('Organization 1')
      vi.advanceTimersByTime(500)
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      
      await DynamicSelectTestHelpers.clearSelection()
      
      // Should announce clear
      await waitFor(() => {
        expect(liveRegion).toHaveTextContent(/selection cleared/i)
      })
    })

    it('announces max selections reached', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <MultiSelectTestWrapper 
          onSearch={mockSearch}
          fieldProps={{ maxSelections: 2 }}
        />
      )

      const liveRegion = screen.getByRole('status')
      
      // Reach max selections
      await DynamicSelectTestHelpers.searchFor('Organization')
      vi.advanceTimersByTime(500)
      await DynamicSelectTestHelpers.selectOption('Test Organization 1')
      await DynamicSelectTestHelpers.selectOption('Test Organization 2')
      
      // Try to select third
      await DynamicSelectTestHelpers.selectOption('Test Organization 3')
      
      // Should announce max reached
      await waitFor(() => {
        expect(liveRegion).toHaveTextContent(/maximum 2 selections allowed/i)
      })
    })
  })

  describe('Focus Management', () => {
    it('maintains focus trap within component when open', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <div>
          <button>Before</button>
          <SingleSelectTestWrapper onSearch={mockSearch} />
          <button>After</button>
        </div>
      )

      const trigger = screen.getByRole('combobox')
      await userEvent.click(trigger)
      
      const searchInput = screen.getByPlaceholderText(/search/i)
      expect(searchInput).toHaveFocus()
      
      // Tabbing should cycle within the component
      await userEvent.tab()
      // Focus should remain within the component (exact behavior depends on options available)
      expect(document.activeElement).not.toBe(screen.getByText('After'))
    })

    it('restores focus to trigger when closed with Escape', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper onSearch={mockSearch} />
      )

      const trigger = screen.getByRole('combobox')
      await userEvent.click(trigger)
      
      // Close with Escape
      await userEvent.keyboard('{Escape}')
      
      // Focus should return to trigger
      await waitFor(() => {
        expect(trigger).toHaveFocus()
      })
    })

    it('provides visual focus indicators', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper onSearch={mockSearch} />
      )

      const trigger = screen.getByRole('combobox')
      trigger.focus()
      
      // Trigger should have focus styles
      expect(trigger).toHaveClass('focus:ring-2', 'focus:ring-ring')
    })

    it('handles focus for disabled state', () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper 
          onSearch={mockSearch}
          fieldProps={{ disabled: true }}
        />
      )

      const trigger = screen.getByRole('combobox')
      
      // Disabled trigger should not be focusable
      expect(trigger).toBeDisabled()
      expect(trigger).toHaveAttribute('tabindex', '-1')
    })
  })

  describe('Error State Accessibility', () => {
    it('associates error message with field', async () => {
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
        const errorMessage = screen.getByText('Test Select is required')
        expect(errorMessage).toBeInTheDocument()
        
        // Error should be associated with the field
        expect(trigger).toHaveAttribute('aria-describedby', expect.stringContaining(errorMessage.id || ''))
      })
    })

    it('uses appropriate error message role', async () => {
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
        const errorMessage = screen.getByText('Test Select is required')
        // Error message should have proper role or be in a live region
        expect(errorMessage).toBeInTheDocument()
      })
    })
  })

  describe('Mobile Accessibility', () => {
    it('uses sheet interface on mobile with proper accessibility', async () => {
      // Mock mobile media query
      const { mockMatchMedia } = require('@/test/utils/dynamic-select-test-utils')
      mockMatchMedia.mockImplementation((query: string) => ({
        matches: query === '(max-width: 768px)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))

      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper onSearch={mockSearch} />
      )

      const trigger = screen.getByRole('combobox')
      
      // Should have dialog attributes for mobile
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
      
      await userEvent.click(trigger)
      
      // Should open as sheet/dialog
      await waitFor(() => {
        const dialog = screen.getByRole('dialog')
        expect(dialog).toBeInTheDocument()
        expect(dialog).toHaveAttribute('aria-labelledby')
      })
    })

    it('maintains proper labeling in mobile sheet', async () => {
      // Mock mobile media query
      const { mockMatchMedia } = require('@/test/utils/dynamic-select-test-utils')
      mockMatchMedia.mockImplementation((query: string) => ({
        matches: query === '(max-width: 768px)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))

      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper 
          onSearch={mockSearch}
          fieldProps={{ label: 'Select Organization' }}
        />
      )

      const trigger = screen.getByRole('combobox')
      await userEvent.click(trigger)
      
      await waitFor(() => {
        // Sheet should have proper title
        expect(screen.getByText('Select Organization')).toBeInTheDocument()
      })
    })
  })

  describe('High Contrast Mode Support', () => {
    it('maintains visibility in high contrast mode', () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper onSearch={mockSearch} />
      )

      const trigger = screen.getByRole('combobox')
      
      // Should have proper border and background for high contrast
      expect(trigger).toHaveClass('border')
      expect(trigger).toHaveClass('bg-background')
    })

    it('provides adequate focus indicators for high contrast', async () => {
      const mockSearch = createMockSearchFn(TestDataPresets.organizations)
      
      renderDynamicSelect(
        <SingleSelectTestWrapper onSearch={mockSearch} />
      )

      const trigger = screen.getByRole('combobox')
      trigger.focus()
      
      // Should have high contrast compatible focus styles
      expect(trigger).toHaveClass('focus:ring-2')
    })
  })
})