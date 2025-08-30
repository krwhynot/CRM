/**
 * FormField Component Unit Tests
 * Tests ARIA attribute composition, accessibility compliance, and React Hook Form integration
 */

import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { useForm, Controller } from 'react-hook-form'
import { FormField } from '@/components/forms/FormField'
import { Input } from '@/components/ui/input'

// Test wrapper component for React Hook Form integration
function TestFormWrapper({ 
  label, 
  description, 
  error, 
  required = false,
  initialValue = '',
  inputProps = {}
}: {
  label: string
  description?: string  
  error?: string
  required?: boolean
  initialValue?: string
  inputProps?: Record<string, any>
}) {
  const { control } = useForm({
    defaultValues: { testField: initialValue }
  })

  return (
    <form>
      <Controller
        control={control}
        name="testField"
        render={({ field, fieldState }) => (
          <FormField 
            label={label} 
            description={description}
            error={error || fieldState.error?.message}
            required={required}
          >
            <Input {...field} {...inputProps} />
          </FormField>
        )}
      />
    </form>
  )
}

describe('FormField Component', () => {
  describe('Basic Rendering', () => {
    test('renders with required props', () => {
      render(
        <FormField label="Test Label">
          <Input />
        </FormField>
      )

      expect(screen.getByText('Test Label')).toBeInTheDocument()
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    test('adds data-form-field attribute for testing', () => {
      render(
        <FormField label="Test Label">
          <Input />
        </FormField>
      )

      const formFieldContainer = document.querySelector('[data-form-field]')
      expect(formFieldContainer).toBeInTheDocument()
    })

    test('applies custom className', () => {
      render(
        <FormField label="Test Label" className="custom-class">
          <Input />
        </FormField>
      )

      const formFieldContainer = document.querySelector('[data-form-field]')
      expect(formFieldContainer).toHaveClass('custom-class')
    })
  })

  describe('ARIA Attribute Composition', () => {
    test('generates unique IDs for form elements', () => {
      render(
        <div>
          <FormField label="First Field">
            <Input data-testid="input-1" />
          </FormField>
          <FormField label="Second Field">
            <Input data-testid="input-2" />
          </FormField>
        </div>
      )

      const input1 = screen.getByTestId('input-1')
      const input2 = screen.getByTestId('input-2')

      expect(input1.id).toBeTruthy()
      expect(input2.id).toBeTruthy()
      expect(input1.id).not.toBe(input2.id)
    })

    test('associates label with input via htmlFor and id', () => {
      render(
        <FormField label="Test Label">
          <Input />
        </FormField>
      )

      const input = screen.getByRole('textbox')
      const label = screen.getByText('Test Label')

      expect(input.id).toBeTruthy()
      expect(label).toHaveAttribute('for', input.id)
    })

    test('sets aria-describedby when description is provided', () => {
      render(
        <FormField label="Test Label" description="Helper text">
          <Input />
        </FormField>
      )

      const input = screen.getByRole('textbox')
      const description = screen.getByText('Helper text')

      expect(description.id).toBeTruthy()
      expect(input).toHaveAttribute('aria-describedby', description.id)
    })

    test('sets aria-describedby when error is provided', () => {
      render(
        <FormField label="Test Label" error="Error message">
          <Input />
        </FormField>
      )

      const input = screen.getByRole('textbox')
      const error = screen.getByText('Error message')

      expect(error.id).toBeTruthy()
      expect(input).toHaveAttribute('aria-describedby', error.id)
    })

    test('combines description and error in aria-describedby', () => {
      render(
        <FormField label="Test Label" description="Helper text" error="Error message">
          <Input />
        </FormField>
      )

      const input = screen.getByRole('textbox')
      const description = screen.getByText('Helper text')
      const error = screen.getByText('Error message')

      const expectedDescribedBy = `${description.id} ${error.id}`
      expect(input).toHaveAttribute('aria-describedby', expectedDescribedBy)
    })

    test('sets aria-invalid when error is present', () => {
      render(
        <FormField label="Test Label" error="Error message">
          <Input />
        </FormField>
      )

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    test('does not set aria-invalid when no error', () => {
      render(
        <FormField label="Test Label">
          <Input />
        </FormField>
      )

      const input = screen.getByRole('textbox')
      expect(input).not.toHaveAttribute('aria-invalid')
    })
  })

  describe('Required Field Indicators', () => {
    test('shows asterisk for required fields', () => {
      render(
        <FormField label="Required Field" required>
          <Input />
        </FormField>
      )

      const asterisk = screen.getByText('*')
      expect(asterisk).toBeInTheDocument()
      expect(asterisk).toHaveAttribute('aria-label', 'required')
    })

    test('does not show asterisk for optional fields', () => {
      render(
        <FormField label="Optional Field">
          <Input />
        </FormField>
      )

      expect(screen.queryByText('*')).not.toBeInTheDocument()
    })

    test('applies correct styling to required indicator', () => {
      render(
        <FormField label="Required Field" required>
          <Input />
        </FormField>
      )

      const asterisk = screen.getByText('*')
      expect(asterisk).toHaveClass('text-destructive')
    })
  })

  describe('Error Display', () => {
    test('displays error messages with proper styling', () => {
      render(
        <FormField label="Test Label" error="This field is required">
          <Input />
        </FormField>
      )

      const error = screen.getByText('This field is required')
      expect(error).toBeInTheDocument()
      expect(error).toHaveClass('text-destructive')
      expect(error).toHaveAttribute('role', 'alert')
    })

    test('does not render error container when no error', () => {
      render(
        <FormField label="Test Label">
          <Input />
        </FormField>
      )

      // Should not have any element with role="alert"
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('Description Display', () => {
    test('displays description text with muted styling', () => {
      render(
        <FormField label="Test Label" description="This is helper text">
          <Input />
        </FormField>
      )

      const description = screen.getByText('This is helper text')
      expect(description).toBeInTheDocument()
      expect(description).toHaveClass('text-muted-foreground')
    })

    test('does not render description container when no description', () => {
      render(
        <FormField label="Test Label">
          <Input />
        </FormField>
      )

      // Check that no element has the muted foreground class
      const mutedElements = document.querySelectorAll('.text-muted-foreground')
      expect(mutedElements).toHaveLength(0)
    })
  })

  describe('React Hook Form Integration', () => {
    test('integrates properly with React Hook Form Controller', () => {
      render(<TestFormWrapper label="Test Field" />)

      const input = screen.getByRole('textbox')
      const label = screen.getByText('Test Field')

      expect(label).toHaveAttribute('for', input.id)
      expect(input).toBeInTheDocument()
    })

    test('displays validation errors from React Hook Form', () => {
      render(<TestFormWrapper label="Test Field" error="Validation failed" />)

      const error = screen.getByText('Validation failed')
      const input = screen.getByRole('textbox')

      expect(error).toBeInTheDocument()
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveAttribute('aria-describedby', error.id)
    })

    test('handles initial values correctly', () => {
      render(<TestFormWrapper label="Test Field" initialValue="Initial value" />)

      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input.value).toBe('Initial value')
    })

    test('forwards input props correctly', () => {
      render(
        <TestFormWrapper 
          label="Test Field" 
          inputProps={{ placeholder: "Enter text", disabled: true }}
        />
      )

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('placeholder', 'Enter text')
      expect(input).toBeDisabled()
    })
  })

  describe('Accessibility Compliance', () => {
    test('label has proper accessibility attributes', () => {
      render(
        <FormField label="Accessible Label" required>
          <Input />
        </FormField>
      )

      const label = screen.getByText('Accessible Label')
      expect(label).toHaveClass('text-sm', 'font-medium', 'leading-none')
      expect(label).toHaveClass('peer-disabled:cursor-not-allowed', 'peer-disabled:opacity-70')
    })

    test('maintains focus relationships', async () => {
      const user = userEvent.setup()
      
      render(
        <FormField label="Focusable Field">
          <Input />
        </FormField>
      )

      const label = screen.getByText('Focusable Field')
      const input = screen.getByRole('textbox')

      // Clicking label should focus input
      await user.click(label)
      expect(input).toHaveFocus()
    })

    test('error messages are announced to screen readers', () => {
      render(
        <FormField label="Field with Error" error="This is an error">
          <Input />
        </FormField>
      )

      const error = screen.getByText('This is an error')
      expect(error).toHaveAttribute('role', 'alert')
    })

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      
      render(
        <div>
          <FormField label="First Field">
            <Input />
          </FormField>
          <FormField label="Second Field">
            <Input />
          </FormField>
        </div>
      )

      const inputs = screen.getAllByRole('textbox')
      
      await user.click(inputs[0])
      expect(inputs[0]).toHaveFocus()
      
      await user.tab()
      expect(inputs[1]).toHaveFocus()
    })
  })

  describe('Edge Cases', () => {
    test('handles complex label content', () => {
      render(
        <FormField label={<span>Complex <strong>Label</strong></span>}>
          <Input />
        </FormField>
      )

      expect(screen.getByText('Complex')).toBeInTheDocument()
      expect(screen.getByText('Label')).toBeInTheDocument()
    })

    test('handles complex description content', () => {
      render(
        <FormField 
          label="Test Label" 
          description={<span>Complex <em>description</em> with markup</span>}
        >
          <Input />
        </FormField>
      )

      expect(screen.getByText('Complex')).toBeInTheDocument()
      expect(screen.getByText('description')).toBeInTheDocument()
      expect(screen.getByText('with markup')).toBeInTheDocument()
    })

    test('handles empty strings gracefully', () => {
      render(
        <FormField label="" description="" error="">
          <Input />
        </FormField>
      )

      // Should still render but without content
      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
      
      // Empty description and error should not create elements
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    test('handles child components with existing IDs', () => {
      render(
        <FormField label="Test Label">
          <Input id="existing-id" />
        </FormField>
      )

      const input = screen.getByRole('textbox')
      // FormField should override the existing ID
      expect(input.id).not.toBe('existing-id')
    })
  })
})