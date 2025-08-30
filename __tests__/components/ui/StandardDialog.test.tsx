import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { StandardDialog } from '@/components/ui/StandardDialog'
import { describe, expect, it, vi, beforeEach } from 'vitest'

describe('StandardDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    title: 'Test Dialog',
    children: <div>Test content</div>,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<StandardDialog {...defaultProps} />)
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
      expect(dialog).toHaveAttribute('aria-labelledby')
      expect(dialog).toHaveAttribute('aria-describedby')
    })

    it('should have proper title labeling', () => {
      render(<StandardDialog {...defaultProps} title="Custom Title" />)
      
      expect(screen.getByText('Custom Title')).toBeInTheDocument()
      expect(screen.getByRole('dialog')).toHaveAccessibleName('Custom Title')
    })

    it('should include description when provided', () => {
      render(
        <StandardDialog 
          {...defaultProps} 
          description="Dialog description" 
        />
      )
      
      expect(screen.getByText('Dialog description')).toBeInTheDocument()
    })

    it('should handle ESC key to close dialog', async () => {
      const onOpenChange = vi.fn()
      render(<StandardDialog {...defaultProps} onOpenChange={onOpenChange} />)
      
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
      
      await waitFor(() => {
        expect(onOpenChange).toHaveBeenCalledWith(false)
      })
    })
  })

  describe('Dialog Variants', () => {
    it('should render regular dialog by default', () => {
      render(<StandardDialog {...defaultProps} />)
      
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    it('should render alert dialog when variant is "alert"', () => {
      const onConfirm = vi.fn()
      render(
        <StandardDialog 
          {...defaultProps}
          variant="alert"
          onConfirm={onConfirm}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )
      
      expect(screen.getByText('Delete')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('should call onConfirm when confirm button is clicked', () => {
      const onConfirm = vi.fn()
      render(
        <StandardDialog 
          {...defaultProps}
          variant="alert"
          onConfirm={onConfirm}
        />
      )
      
      fireEvent.click(screen.getByText('Confirm'))
      expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('should call onCancel when cancel button is clicked', () => {
      const onCancel = vi.fn()
      render(
        <StandardDialog 
          {...defaultProps}
          variant="alert"
          onConfirm={vi.fn()}
          onCancel={onCancel}
        />
      )
      
      fireEvent.click(screen.getByText('Cancel'))
      expect(onCancel).toHaveBeenCalledTimes(1)
    })
  })

  describe('Size Variants', () => {
    it('should apply small size class', () => {
      render(<StandardDialog {...defaultProps} size="sm" />)
      
      const dialogContent = screen.getByRole('dialog')
      expect(dialogContent).toHaveClass('max-w-sm')
    })

    it('should apply medium size class (default)', () => {
      render(<StandardDialog {...defaultProps} size="md" />)
      
      const dialogContent = screen.getByRole('dialog')
      expect(dialogContent).toHaveClass('max-w-lg')
    })

    it('should apply large size class', () => {
      render(<StandardDialog {...defaultProps} size="lg" />)
      
      const dialogContent = screen.getByRole('dialog')
      expect(dialogContent).toHaveClass('max-w-2xl')
    })

    it('should apply extra large size class', () => {
      render(<StandardDialog {...defaultProps} size="xl" />)
      
      const dialogContent = screen.getByRole('dialog')
      expect(dialogContent).toHaveClass('max-w-4xl')
    })
  })

  describe('Scroll Behavior', () => {
    it('should apply content scroll classes by default', () => {
      render(<StandardDialog {...defaultProps} scroll="content" />)
      
      // Check for overflow-auto class on content wrapper
      const contentDiv = screen.getByText('Test content').parentElement
      expect(contentDiv).toHaveClass('max-h-screen', 'overflow-auto')
    })

    it('should not apply scroll classes for body scroll', () => {
      render(<StandardDialog {...defaultProps} scroll="body" />)
      
      const contentDiv = screen.getByText('Test content').parentElement
      expect(contentDiv).not.toHaveClass('max-h-screen', 'overflow-auto')
    })
  })

  describe('Loading States', () => {
    it('should show loading text in alert dialog when isLoading is true', () => {
      render(
        <StandardDialog 
          {...defaultProps}
          variant="alert"
          onConfirm={vi.fn()}
          isLoading={true}
        />
      )
      
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should disable buttons when isLoading is true', () => {
      render(
        <StandardDialog 
          {...defaultProps}
          variant="alert"
          onConfirm={vi.fn()}
          isLoading={true}
        />
      )
      
      const confirmButton = screen.getByText('Loading...')
      const cancelButton = screen.getByText('Cancel')
      
      expect(confirmButton).toBeDisabled()
      expect(cancelButton).toBeDisabled()
    })
  })

  describe('Destructive Actions', () => {
    it('should apply destructive styling when confirmVariant is destructive', () => {
      render(
        <StandardDialog 
          {...defaultProps}
          variant="alert"
          onConfirm={vi.fn()}
          confirmVariant="destructive"
        />
      )
      
      const confirmButton = screen.getByText('Confirm')
      expect(confirmButton).toHaveClass('bg-destructive', 'text-destructive-foreground')
    })
  })

  describe('Header Actions', () => {
    it('should render header actions when provided', () => {
      const headerActions = <button>Header Action</button>
      render(
        <StandardDialog 
          {...defaultProps}
          headerActions={headerActions}
        />
      )
      
      expect(screen.getByText('Header Action')).toBeInTheDocument()
    })
  })

  describe('Footer', () => {
    it('should render custom footer when provided', () => {
      const footer = <button>Custom Footer</button>
      render(
        <StandardDialog 
          {...defaultProps}
          footer={footer}
        />
      )
      
      expect(screen.getByText('Custom Footer')).toBeInTheDocument()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should focus first focusable element when opened', async () => {
      render(
        <StandardDialog {...defaultProps}>
          <input data-testid="first-input" />
          <button>Second Element</button>
        </StandardDialog>
      )
      
      await waitFor(() => {
        const firstInput = screen.getByTestId('first-input')
        expect(firstInput).toHaveFocus()
      })
    })

    it('should trap focus within dialog', async () => {
      render(
        <StandardDialog 
          {...defaultProps}
          variant="alert"
          onConfirm={vi.fn()}
        />
      )
      
      const cancelButton = screen.getByText('Cancel')
      const confirmButton = screen.getByText('Confirm')
      
      // Tab from cancel to confirm
      cancelButton.focus()
      fireEvent.keyDown(cancelButton, { key: 'Tab' })
      
      await waitFor(() => {
        expect(confirmButton).toHaveFocus()
      })
      
      // Tab from confirm should cycle back to cancel
      fireEvent.keyDown(confirmButton, { key: 'Tab' })
      
      await waitFor(() => {
        expect(cancelButton).toHaveFocus()
      })
    })

    it('should handle shift+tab for reverse navigation', async () => {
      render(
        <StandardDialog 
          {...defaultProps}
          variant="alert"
          onConfirm={vi.fn()}
        />
      )
      
      const confirmButton = screen.getByText('Confirm')
      const cancelButton = screen.getByText('Cancel')
      
      // Shift+Tab from confirm to cancel
      confirmButton.focus()
      fireEvent.keyDown(confirmButton, { key: 'Tab', shiftKey: true })
      
      await waitFor(() => {
        expect(cancelButton).toHaveFocus()
      })
    })
  })
})