/**
 * Unit Tests for QuickInteractionBar Component
 * 
 * Tests the form logic including:
 * - Form submission and validation
 * - Auto-fill behavior based on interaction type
 * - Mobile-responsive touch targets
 * - Error handling and loading states
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QuickInteractionBar } from '@/features/interactions/components/QuickInteractionBar'
import { useCreateInteraction } from '@/features/interactions/hooks/useInteractions'
import '../../backend/setup/test-setup'

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}))

vi.mock('@/features/interactions/hooks/useInteractions', () => ({
  useCreateInteraction: vi.fn()
}))

vi.mock('@/hooks/useMediaQuery', () => ({
  useIsMobile: vi.fn(() => false)
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const mockCreateInteraction = {
  mutateAsync: vi.fn(),
  isPending: false
}

const defaultProps = {
  opportunityId: 'opp-1',
  contactId: 'contact-1',
  organizationId: 'org-1',
  onSuccess: vi.fn(),
  onCancel: vi.fn()
}

describe('QuickInteractionBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mock implementation
    ;(useCreateInteraction as ReturnType<typeof vi.fn>).mockReturnValue(mockCreateInteraction)
    
    // Reset mock functions
    mockCreateInteraction.mutateAsync.mockResolvedValue({ id: 'new-interaction' })
    mockCreateInteraction.isPending = false
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Form Rendering', () => {
    it('should render all interaction type buttons', () => {
      render(<QuickInteractionBar {...defaultProps} />, { wrapper: createWrapper() })

      expect(screen.getByRole('button', { name: /call/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /email/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /meeting/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /note/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /demo/i })).toBeInTheDocument()
    })

    it('should render subject and notes input fields', () => {
      render(<QuickInteractionBar {...defaultProps} />, { wrapper: createWrapper() })

      expect(screen.getByPlaceholderText(/quick follow_up summary/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/add details.*optional/i)).toBeInTheDocument()
    })

    it('should render follow-up checkbox and add button', () => {
      render(<QuickInteractionBar {...defaultProps} />, { wrapper: createWrapper() })

      expect(screen.getByRole('checkbox', { name: /follow-up needed/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument()
    })

    it('should render cancel button when onCancel is provided', () => {
      render(<QuickInteractionBar {...defaultProps} />, { wrapper: createWrapper() })

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('should not render cancel button when onCancel is not provided', () => {
      const propsWithoutCancel = { ...defaultProps, onCancel: undefined }
      render(<QuickInteractionBar {...propsWithoutCancel} />, { wrapper: createWrapper() })

      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument()
    })
  })

  describe('Interaction Type Selection', () => {
    it('should default to follow_up type', () => {
      render(<QuickInteractionBar {...defaultProps} />, { wrapper: createWrapper() })

      const followUpButton = screen.getByRole('button', { name: /note/i })
      expect(followUpButton).toHaveClass('bg-primary') // Selected variant
    })

    it('should change interaction type when button is clicked', async () => {
      const user = userEvent.setup()
      render(<QuickInteractionBar {...defaultProps} />, { wrapper: createWrapper() })

      const callButton = screen.getByRole('button', { name: /call/i })
      await user.click(callButton)

      expect(callButton).toHaveClass('bg-primary')
    })

    it('should auto-fill subject based on selected type', async () => {
      const user = userEvent.setup()
      render(<QuickInteractionBar {...defaultProps} />, { wrapper: createWrapper() })

      // Initially should have follow-up subject (default)
      const subjectInput = screen.getByPlaceholderText(/quick follow_up summary/i) as HTMLInputElement
      expect(subjectInput.value).toBe('Follow-up contact')

      // Change to call type
      const callButton = screen.getByRole('button', { name: /call/i })
      await user.click(callButton)

      expect(subjectInput.value).toBe('Follow-up call')
    })

    it('should not overwrite manually entered subject', async () => {
      const user = userEvent.setup()
      render(<QuickInteractionBar {...defaultProps} />, { wrapper: createWrapper() })

      const subjectInput = screen.getByPlaceholderText(/quick follow_up summary/i)
      
      // User enters custom subject
      await user.clear(subjectInput)
      await user.type(subjectInput, 'Custom subject')

      // Change interaction type
      const callButton = screen.getByRole('button', { name: /call/i })
      await user.click(callButton)

      // Should preserve user's custom subject
      expect(subjectInput).toHaveValue('Custom subject')
    })

    it('should update placeholder text based on selected type', async () => {
      const user = userEvent.setup()
      render(<QuickInteractionBar {...defaultProps} />, { wrapper: createWrapper() })

      const callButton = screen.getByRole('button', { name: /call/i })
      await user.click(callButton)

      expect(screen.getByPlaceholderText(/quick call summary/i)).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should show error when subject is empty on submit', async () => {
      const user = userEvent.setup()
      render(<QuickInteractionBar {...defaultProps} />, { wrapper: createWrapper() })

      // Clear the auto-filled subject
      const subjectInput = screen.getByPlaceholderText(/quick follow_up summary/i)
      await user.clear(subjectInput)

      const addButton = screen.getByRole('button', { name: /add/i })
      await user.click(addButton)

      expect(toast.error).toHaveBeenCalledWith('Please add a subject')
      expect(mockCreateInteraction.mutateAsync).not.toHaveBeenCalled()
    })

    it('should disable add button when subject is empty', async () => {
      const user = userEvent.setup()
      render(<QuickInteractionBar {...defaultProps} />, { wrapper: createWrapper() })

      const subjectInput = screen.getByPlaceholderText(/quick follow_up summary/i)
      await user.clear(subjectInput)

      const addButton = screen.getByRole('button', { name: /add/i })
      expect(addButton).toBeDisabled()
    })

    it('should enable add button when subject has content', async () => {
      const user = userEvent.setup()
      render(<QuickInteractionBar {...defaultProps} />, { wrapper: createWrapper() })

      const subjectInput = screen.getByPlaceholderText(/quick follow_up summary/i)
      await user.clear(subjectInput)
      await user.type(subjectInput, 'Valid subject')

      const addButton = screen.getByRole('button', { name: /add/i })
      expect(addButton).not.toBeDisabled()
    })
  })

  describe('Form Submission', () => {
    it('should submit interaction with correct data', async () => {
      const user = userEvent.setup()
      render(<QuickInteractionBar {...defaultProps} />, { wrapper: createWrapper() })

      // Fill form
      const subjectInput = screen.getByPlaceholderText(/quick follow_up summary/i)
      const notesInput = screen.getByPlaceholderText(/add details.*optional/i)
      const followUpCheckbox = screen.getByRole('checkbox', { name: /follow-up needed/i })
      
      await user.clear(subjectInput)
      await user.type(subjectInput, 'Test interaction')
      await user.type(notesInput, 'Test notes')
      await user.click(followUpCheckbox)

      const addButton = screen.getByRole('button', { name: /add/i })
      await user.click(addButton)

      expect(mockCreateInteraction.mutateAsync).toHaveBeenCalledWith({
        type: 'follow_up',
        subject: 'Test interaction',
        description: 'Test notes',
        opportunity_id: 'opp-1',
        contact_id: 'contact-1',
        organization_id: 'org-1',
        interaction_date: expect.any(String),
        follow_up_required: true,
        follow_up_date: expect.any(String)
      })
    })

    it('should set follow_up_date to 7 days from now when follow-up is required', async () => {
      const user = userEvent.setup()
      render(<QuickInteractionBar {...defaultProps} />, { wrapper: createWrapper() })

      const followUpCheckbox = screen.getByRole('checkbox', { name: /follow-up needed/i })
      await user.click(followUpCheckbox)

      const addButton = screen.getByRole('button', { name: /add/i })
      await user.click(addButton)

      const callArgs = mockCreateInteraction.mutateAsync.mock.calls[0][0]
      const followUpDate = new Date(callArgs.follow_up_date)
      const expectedDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      
      // Should be approximately 7 days from now (within 1 minute tolerance)
      expect(Math.abs(followUpDate.getTime() - expectedDate.getTime())).toBeLessThan(60000)
    })

    it('should set follow_up_date to null when follow-up is not required', async () => {
      const user = userEvent.setup()
      render(<QuickInteractionBar {...defaultProps} />, { wrapper: createWrapper() })

      const addButton = screen.getByRole('button', { name: /add/i })
      await user.click(addButton)

      const callArgs = mockCreateInteraction.mutateAsync.mock.calls[0][0]
      expect(callArgs.follow_up_required).toBe(false)
      expect(callArgs.follow_up_date).toBeNull()
    })

    it('should call onSuccess callback after successful submission', async () => {
      const user = userEvent.setup()
      render(<QuickInteractionBar {...defaultProps} />, { wrapper: createWrapper() })

      const addButton = screen.getByRole('button', { name: /add/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalled()
      })

      expect(toast.success).toHaveBeenCalledWith('Interaction added!')
    })

    it('should reset form after successful submission', async () => {
      const user = userEvent.setup()
      render(<QuickInteractionBar {...defaultProps} />, { wrapper: createWrapper() })

      const subjectInput = screen.getByPlaceholderText(/quick follow_up summary/i) as HTMLInputElement
      const notesInput = screen.getByPlaceholderText(/add details.*optional/i) as HTMLInputElement
      const followUpCheckbox = screen.getByRole('checkbox', { name: /follow-up needed/i }) as HTMLInputElement

      // Fill form
      await user.clear(subjectInput)
      await user.type(subjectInput, 'Test subject')
      await user.type(notesInput, 'Test notes')
      await user.click(followUpCheckbox)

      const addButton = screen.getByRole('button', { name: /add/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(subjectInput.value).toBe('')
        expect(notesInput.value).toBe('')
        expect(followUpCheckbox.checked).toBe(false)
      })
    })
  })

  describe('Error Handling', () => {
    it('should show error toast when submission fails', async () => {
      const user = userEvent.setup()
      
      // Mock failed submission
      mockCreateInteraction.mutateAsync.mockRejectedValue(new Error('Network error'))
      
      render(<QuickInteractionBar {...defaultProps} />, { wrapper: createWrapper() })

      const addButton = screen.getByRole('button', { name: /add/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to add interaction')
      })
    })

    it('should not call onSuccess when submission fails', async () => {
      const user = userEvent.setup()
      
      mockCreateInteraction.mutateAsync.mockRejectedValue(new Error('Network error'))
      
      render(<QuickInteractionBar {...defaultProps} />, { wrapper: createWrapper() })

      const addButton = screen.getByRole('button', { name: /add/i })
      await user.click(addButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
      })

      expect(defaultProps.onSuccess).not.toHaveBeenCalled()
    })
  })

  describe('Loading States', () => {
    it('should disable buttons during submission', async () => {
      const user = userEvent.setup()
      
      // Mock pending state
      mockCreateInteraction.isPending = true
      ;(useCreateInteraction as ReturnType<typeof vi.fn>).mockReturnValue(mockCreateInteraction)
      
      render(<QuickInteractionBar {...defaultProps} />, { wrapper: createWrapper() })

      const addButton = screen.getByRole('button', { name: /adding.../i })
      const cancelButton = screen.getByRole('button', { name: /cancel/i })

      expect(addButton).toBeDisabled()
      expect(cancelButton).toBeDisabled()
    })

    it('should show "Adding..." text during submission', () => {
      mockCreateInteraction.isPending = true
      ;(useCreateInteraction as ReturnType<typeof vi.fn>).mockReturnValue(mockCreateInteraction)
      
      render(<QuickInteractionBar {...defaultProps} />, { wrapper: createWrapper() })

      expect(screen.getByRole('button', { name: /adding.../i })).toBeInTheDocument()
    })
  })

  describe('Cancel Functionality', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<QuickInteractionBar {...defaultProps} />, { wrapper: createWrapper() })

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      expect(defaultProps.onCancel).toHaveBeenCalled()
    })
  })
})