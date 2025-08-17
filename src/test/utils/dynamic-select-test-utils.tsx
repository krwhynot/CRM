import * as React from 'react'
import { render, screen, fireEvent, waitFor, RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm, FormProvider } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { vi } from 'vitest'
import { DynamicSelectField, type SelectOption } from '@/components/forms/dynamic-select/DynamicSelectField'
import type { DynamicSelectFieldProps } from '@/components/forms/dynamic-select/types'

// Mock data generators
export const createMockOption = (id: number, overrides: Partial<SelectOption> = {}): SelectOption => ({
  value: `option-${id}`,
  label: `Option ${id}`,
  description: `Description for option ${id}`,
  ...overrides,
})

export const createMockOptions = (count: number, overrides: (id: number) => Partial<SelectOption> = () => ({})): SelectOption[] =>
  Array.from({ length: count }, (_, i) => createMockOption(i + 1, overrides(i + 1)))

export const createPrincipalOptions = (count: number = 5): SelectOption[] =>
  createMockOptions(count, (id) => ({
    label: `Principal Organization ${id}`,
    badge: { text: 'PRINCIPAL', variant: 'default' as const },
    metadata: { type: 'principal', priority: id <= 2 ? 'A' : 'B' }
  }))

export const createOrganizationOptions = (count: number = 5): SelectOption[] =>
  createMockOptions(count, (id) => ({
    label: `Test Organization ${id}`,
    badge: { text: id <= 2 ? 'CUSTOMER' : 'PROSPECT', variant: id <= 2 ? 'default' : 'secondary' as const },
    metadata: { type: 'customer', segment: id % 2 === 0 ? 'Restaurant' : 'Retail' }
  }))

// Mock search functions
export const createMockSearchFn = (options: SelectOption[], delay: number = 100) => {
  return vi.fn().mockImplementation(async (query: string) => {
    await new Promise(resolve => setTimeout(resolve, delay))
    
    if (!query || query.length === 0) {
      return options
    }
    
    return options.filter(option => 
      option.label.toLowerCase().includes(query.toLowerCase()) ||
      option.description?.toLowerCase().includes(query.toLowerCase())
    )
  })
}

export const createSlowSearchFn = (options: SelectOption[], delay: number = 1000) => {
  return createMockSearchFn(options, delay)
}

export const createFailingSearchFn = (message: string = 'Search failed') => {
  return vi.fn().mockRejectedValue(new Error(message))
}

// Test form schemas
export const singleSelectSchema = yup.object({
  selected: yup.string().required('Selection is required'),
})

export const multiSelectSchema = yup.object({
  selected: yup.array().of(yup.string().required()).min(1, 'At least one selection is required'),
})

export const opportunityPrincipalSchema = yup.object({
  principal_organization_id: yup.string().required('Principal organization is required'),
})

// Form wrapper components
interface SingleSelectTestWrapperProps {
  onSearch: (query: string) => Promise<SelectOption[]>
  defaultValue?: string
  fieldProps?: Partial<DynamicSelectFieldProps>
  formSchema?: yup.ObjectSchema<any>
}

export function SingleSelectTestWrapper({
  onSearch,
  defaultValue = '',
  fieldProps = {},
  formSchema = singleSelectSchema
}: SingleSelectTestWrapperProps) {
  const methods = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: { selected: defaultValue },
    mode: 'onBlur'
  })

  return (
    <FormProvider {...methods}>
      <form>
        <DynamicSelectField
          name="selected"
          control={methods.control}
          label="Test Select"
          placeholder="Select an option..."
          onSearch={onSearch}
          {...fieldProps}
        />
      </form>
    </FormProvider>
  )
}

interface MultiSelectTestWrapperProps {
  onSearch: (query: string) => Promise<SelectOption[]>
  defaultValue?: string[]
  fieldProps?: Partial<DynamicSelectFieldProps>
  formSchema?: yup.ObjectSchema<any>
}

export function MultiSelectTestWrapper({
  onSearch,
  defaultValue = [],
  fieldProps = {},
  formSchema = multiSelectSchema
}: MultiSelectTestWrapperProps) {
  const methods = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: { selected: defaultValue },
    mode: 'onBlur'
  })

  return (
    <FormProvider {...methods}>
      <form>
        <DynamicSelectField
          name="selected"
          control={methods.control}
          label="Test Multi-Select"
          placeholder="Select options..."
          multiple={true}
          onSearch={onSearch}
          {...fieldProps}
        />
      </form>
    </FormProvider>
  )
}

interface OpportunityPrincipalTestWrapperProps {
  onSearch: (query: string) => Promise<SelectOption[]>
  defaultValue?: string
  fieldProps?: Partial<DynamicSelectFieldProps>
}

export function OpportunityPrincipalTestWrapper({
  onSearch,
  defaultValue = '',
  fieldProps = {}
}: OpportunityPrincipalTestWrapperProps) {
  const methods = useForm({
    resolver: yupResolver(opportunityPrincipalSchema),
    defaultValues: { principal_organization_id: defaultValue },
    mode: 'onBlur'
  })

  return (
    <FormProvider {...methods}>
      <form>
        <DynamicSelectField
          name="principal_organization_id"
          control={methods.control}
          label="Principal Organization"
          placeholder="Select principal organization..."
          onSearch={onSearch}
          {...fieldProps}
        />
      </form>
    </FormProvider>
  )
}

// Test interaction helpers
export class DynamicSelectTestHelpers {
  static async openSelect(container?: HTMLElement) {
    const trigger = screen.getByRole('combobox')
    await userEvent.click(trigger)
    await waitFor(() => {
      const input = screen.getByPlaceholderText(/search/i)
      expect(input).toBeInTheDocument()
    })
    return screen.getByPlaceholderText(/search/i)
  }

  static async searchFor(query: string, container?: HTMLElement) {
    const input = await this.openSelect(container)
    await userEvent.clear(input)
    await userEvent.type(input, query)
    return input
  }

  static async selectOption(optionText: string) {
    await waitFor(() => {
      const option = screen.getByText(optionText)
      expect(option).toBeInTheDocument()
    })
    
    const option = screen.getByText(optionText)
    await userEvent.click(option)
  }

  static async selectMultipleOptions(optionTexts: string[]) {
    for (const text of optionTexts) {
      await this.selectOption(text)
    }
  }

  static async clearSelection() {
    const clearButton = screen.getByLabelText(/clear/i)
    await userEvent.click(clearButton)
  }

  static async removeBadge(optionText: string) {
    const badge = screen.getByText(optionText).closest('.badge') || screen.getByText(optionText).parentElement
    const removeButton = badge?.querySelector('button')
    
    if (!removeButton) {
      throw new Error(`Remove button not found for option: ${optionText}`)
    }
    
    await userEvent.click(removeButton)
  }

  static expectSelectedValue(text: string) {
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveTextContent(text)
  }

  static expectSelectedBadges(texts: string[]) {
    texts.forEach(text => {
      expect(screen.getByText(text)).toBeInTheDocument()
    })
  }

  static expectNoSelection() {
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveTextContent(/select.*option/i)
  }

  static expectLoadingState() {
    expect(screen.getByText(/searching/i)).toBeInTheDocument()
  }

  static expectNoResults() {
    expect(screen.getByText(/no results found/i)).toBeInTheDocument()
  }

  static expectCreateNewOption() {
    expect(screen.getByText(/create new/i)).toBeInTheDocument()
  }

  static async clickCreateNew() {
    const createButton = screen.getByText(/create new/i)
    await userEvent.click(createButton)
  }

  static expectValidationError(message: string) {
    expect(screen.getByText(message)).toBeInTheDocument()
  }

  static expectAccessibilityAttributes(optionText?: string) {
    const trigger = screen.getByRole('combobox')
    
    // Check basic ARIA attributes
    expect(trigger).toHaveAttribute('aria-expanded')
    expect(trigger).toHaveAttribute('aria-haspopup')
    expect(trigger).toHaveAttribute('aria-label')
    
    if (optionText) {
      expect(trigger).toHaveAttribute('aria-label', expect.stringContaining(optionText))
    }
  }

  static async testKeyboardNavigation() {
    const trigger = screen.getByRole('combobox')
    
    // Open with Enter
    await userEvent.click(trigger)
    await userEvent.keyboard('{Enter}')
    
    // Navigate with arrows
    await userEvent.keyboard('{ArrowDown}')
    await userEvent.keyboard('{ArrowUp}')
    
    // Close with Escape
    await userEvent.keyboard('{Escape}')
  }
}

// Custom render function with default providers
export const renderDynamicSelect = (
  ui: React.ReactElement,
  options: RenderOptions = {}
) => {
  return render(ui, {
    ...options,
  })
}

// Test data presets
export const TestDataPresets = {
  principals: createPrincipalOptions(10),
  organizations: createOrganizationOptions(15),
  largeDataset: createMockOptions(100),
  emptyDataset: [],
  singleOption: [createMockOption(1)],
}

// Performance testing utilities
export const PerformanceTestHelpers = {
  async measureRenderTime(renderFn: () => void): Promise<number> {
    const start = performance.now()
    renderFn()
    const end = performance.now()
    return end - start
  },

  async measureSearchTime(searchFn: () => Promise<void>): Promise<number> {
    const start = performance.now()
    await searchFn()
    const end = performance.now()
    return end - start
  },

  expectRenderTimeUnder(time: number, actualTime: number) {
    expect(actualTime).toBeLessThan(time)
  },

  expectSearchTimeUnder(time: number, actualTime: number) {
    expect(actualTime).toBeLessThan(time)
  }
}

// Mock setup helpers
export const setupMocks = () => {
  // Mock media queries for responsive testing
  const mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mockMatchMedia,
  })

  // Mock intersection observer for virtualization
  const mockIntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: mockIntersectionObserver,
  })

  return {
    mockMatchMedia,
    mockIntersectionObserver,
  }
}

export const teardownMocks = () => {
  vi.clearAllMocks()
  vi.resetAllMocks()
}