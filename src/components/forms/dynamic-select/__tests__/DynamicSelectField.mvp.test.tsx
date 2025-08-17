import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm, FormProvider } from 'react-hook-form'
import { DynamicSelectField } from '../DynamicSelectField'
import type { SelectOption } from '../types'

// Mock useMediaQuery to avoid mobile/desktop complexity in tests
vi.mock('@/hooks/useMediaQuery', () => ({
  useMediaQuery: vi.fn(() => false), // Always desktop
}))

// Mock TanStack Virtual to simplify testing
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: vi.fn(() => ({
    getVirtualItems: () => [],
    getTotalSize: () => 0,
    scrollToIndex: vi.fn(),
  })),
}))

// Test wrapper component
function TestWrapper({ 
  children, 
  defaultValues = {} 
}: { 
  children: React.ReactNode
  defaultValues?: Record<string, any>
}) {
  const methods = useForm({ defaultValues })
  return <FormProvider {...methods}>{children}</FormProvider>
}

const mockOptions: SelectOption[] = [
  { value: '1', label: 'Organization 1' },
  { value: '2', label: 'Organization 2', badge: { text: 'CUSTOMER', variant: 'default' } },
  { value: '3', label: 'Organization 3' },
]

describe('DynamicSelectField MVP Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with basic props', () => {
    const mockSearch = vi.fn().mockResolvedValue([])
    
    render(
      <TestWrapper>
        <DynamicSelectField
          name="test"
          label="Test Field"
          onSearch={mockSearch}
        />
      </TestWrapper>
    )

    expect(screen.getByText('Test Field')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('shows placeholder when no selection', () => {
    const mockSearch = vi.fn().mockResolvedValue([])
    
    render(
      <TestWrapper>
        <DynamicSelectField
          name="test"
          label="Test Field"
          placeholder="Choose option"
          onSearch={mockSearch}
        />
      </TestWrapper>
    )

    expect(screen.getByText('Choose option')).toBeInTheDocument()
  })

  it('shows required indicator when required=true', () => {
    const mockSearch = vi.fn().mockResolvedValue([])
    
    render(
      <TestWrapper>
        <DynamicSelectField
          name="test"
          label="Test Field"
          onSearch={mockSearch}
          required
        />
      </TestWrapper>
    )

    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('opens when trigger is clicked', async () => {
    const user = userEvent.setup()
    const mockSearch = vi.fn().mockResolvedValue([])
    
    render(
      <TestWrapper>
        <DynamicSelectField
          name="test"
          label="Test Field"
          onSearch={mockSearch}
        />
      </TestWrapper>
    )

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('displays selected value', () => {
    const mockSearch = vi.fn().mockResolvedValue([])
    
    render(
      <TestWrapper defaultValues={{ test: '1' }}>
        <DynamicSelectField
          name="test"
          label="Test Field"
          onSearch={mockSearch}
          preloadOptions={mockOptions}
        />
      </TestWrapper>
    )

    expect(screen.getByText('Organization 1')).toBeInTheDocument()
  })

  it('shows clear button when clearable and has selection', () => {
    const mockSearch = vi.fn().mockResolvedValue([])
    
    render(
      <TestWrapper defaultValues={{ test: '1' }}>
        <DynamicSelectField
          name="test"
          label="Test Field"
          onSearch={mockSearch}
          preloadOptions={mockOptions}
          clearable
        />
      </TestWrapper>
    )

    expect(screen.getByLabelText(/clear selection/i)).toBeInTheDocument()
  })

  it('clears selection when clear button clicked', async () => {
    const user = userEvent.setup()
    const mockSearch = vi.fn().mockResolvedValue([])
    
    render(
      <TestWrapper defaultValues={{ test: '1' }}>
        <DynamicSelectField
          name="test"
          label="Test Field"
          onSearch={mockSearch}
          preloadOptions={mockOptions}
          clearable
        />
      </TestWrapper>
    )

    const clearButton = screen.getByLabelText(/clear selection/i)
    await user.click(clearButton)

    await waitFor(() => {
      expect(screen.getByText('Select an option...')).toBeInTheDocument()
    })
  })

  it('supports multi-select mode', () => {
    const mockSearch = vi.fn().mockResolvedValue([])
    
    render(
      <TestWrapper defaultValues={{ test: ['1', '2'] }}>
        <DynamicSelectField
          name="test"
          label="Test Field"
          onSearch={mockSearch}
          preloadOptions={mockOptions}
          multiple
        />
      </TestWrapper>
    )

    expect(screen.getByText('Organization 1')).toBeInTheDocument()
    expect(screen.getByText('Organization 2')).toBeInTheDocument()
  })

  it('shows badges in multi-select mode', () => {
    const mockSearch = vi.fn().mockResolvedValue([])
    
    render(
      <TestWrapper defaultValues={{ test: ['2'] }}>
        <DynamicSelectField
          name="test"
          label="Test Field"
          onSearch={mockSearch}
          preloadOptions={mockOptions}
          multiple
        />
      </TestWrapper>
    )

    expect(screen.getByText('Organization 2')).toBeInTheDocument()
    expect(screen.getByText('CUSTOMER')).toBeInTheDocument()
  })

  it('removes individual items in multi-select', async () => {
    const user = userEvent.setup()
    const mockSearch = vi.fn().mockResolvedValue([])
    
    render(
      <TestWrapper defaultValues={{ test: ['1', '2'] }}>
        <DynamicSelectField
          name="test"
          label="Test Field"
          onSearch={mockSearch}
          preloadOptions={mockOptions}
          multiple
        />
      </TestWrapper>
    )

    const removeButtons = screen.getAllByLabelText(/remove/i)
    await user.click(removeButtons[0])

    await waitFor(() => {
      expect(screen.queryByText('Organization 1')).not.toBeInTheDocument()
      expect(screen.getByText('Organization 2')).toBeInTheDocument()
    })
  })

  it('shows overflow indicator for many selections', () => {
    const mockSearch = vi.fn().mockResolvedValue([])
    
    render(
      <TestWrapper defaultValues={{ test: ['1', '2', '3'] }}>
        <DynamicSelectField
          name="test"
          label="Test Field"
          onSearch={mockSearch}
          preloadOptions={mockOptions}
          multiple
        />
      </TestWrapper>
    )

    // Should show first 2 items + overflow
    expect(screen.getByText('Organization 1')).toBeInTheDocument()
    expect(screen.getByText('Organization 2')).toBeInTheDocument()
    expect(screen.getByText('+1 more')).toBeInTheDocument()
  })

  it('handles disabled state', () => {
    const mockSearch = vi.fn().mockResolvedValue([])
    
    render(
      <TestWrapper>
        <DynamicSelectField
          name="test"
          label="Test Field"
          onSearch={mockSearch}
          disabled
        />
      </TestWrapper>
    )

    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeDisabled()
  })

  it('shows form validation error', () => {
    const TestFormWithError = () => {
      const methods = useForm({
        defaultValues: { test: '' },
        mode: 'onChange'
      })
      
      methods.setError('test', { message: 'This field is required' })
      
      return (
        <FormProvider {...methods}>
          <DynamicSelectField
            name="test"
            label="Test Field"
            onSearch={vi.fn().mockResolvedValue([])}
            required
          />
        </FormProvider>
      )
    }

    render(<TestFormWithError />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('shows loading state', async () => {
    const user = userEvent.setup()
    // Mock a slow search that takes time to resolve
    const mockSearch = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve([]), 1000))
    )
    
    render(
      <TestWrapper>
        <DynamicSelectField
          name="test"
          label="Test Field"
          onSearch={mockSearch}
          loadingText="Searching..."
        />
      </TestWrapper>
    )

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    const searchInput = screen.getByPlaceholderText('Search...')
    await user.type(searchInput, 'test')

    // Should show loading state while search is happening
    await waitFor(() => {
      expect(screen.getByText('Searching...')).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('shows no results message', async () => {
    const user = userEvent.setup()
    const mockSearch = vi.fn().mockResolvedValue([])
    
    render(
      <TestWrapper>
        <DynamicSelectField
          name="test"
          label="Test Field"
          onSearch={mockSearch}
          noResultsText="No items found"
        />
      </TestWrapper>
    )

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    const searchInput = screen.getByPlaceholderText('Search...')
    await user.type(searchInput, 'nonexistent')

    await waitFor(() => {
      expect(screen.getByText('No items found')).toBeInTheDocument()
    })
  })

  it('shows create new option when enabled', async () => {
    const user = userEvent.setup()
    const mockSearch = vi.fn().mockResolvedValue([])
    const mockCreateNew = vi.fn()
    
    render(
      <TestWrapper>
        <DynamicSelectField
          name="test"
          label="Test Field"
          onSearch={mockSearch}
          onCreateNew={mockCreateNew}
          showCreateAlways
          createNewText="Add new item"
        />
      </TestWrapper>
    )

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('Add new item')).toBeInTheDocument()
    })
  })

  it('calls onCreateNew when create button clicked', async () => {
    const user = userEvent.setup()
    const mockSearch = vi.fn().mockResolvedValue([])
    const mockCreateNew = vi.fn()
    
    render(
      <TestWrapper>
        <DynamicSelectField
          name="test"
          label="Test Field"
          onSearch={mockSearch}
          onCreateNew={mockCreateNew}
          showCreateAlways
        />
      </TestWrapper>
    )

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    const createButton = await screen.findByText('Create new')
    await user.click(createButton)

    expect(mockCreateNew).toHaveBeenCalled()
  })

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup()
    const mockSearch = vi.fn().mockResolvedValue([])
    
    render(
      <TestWrapper>
        <DynamicSelectField
          name="test"
          label="Test Field"
          onSearch={mockSearch}
        />
      </TestWrapper>
    )

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)
    
    // Press Escape to close
    await user.keyboard('{Escape}')
    
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })
  })

  it('has proper ARIA attributes', () => {
    const mockSearch = vi.fn().mockResolvedValue([])
    
    render(
      <TestWrapper>
        <DynamicSelectField
          name="test"
          label="Test Field"
          onSearch={mockSearch}
        />
      </TestWrapper>
    )

    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
    expect(trigger).toHaveAttribute('aria-label')
  })
})