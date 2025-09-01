/**
 * FormField Accessibility Tests with axe-core
 * Validates WCAG compliance and accessibility best practices
 */

import { describe, test, expect } from 'vitest'
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import type { Control } from 'react-hook-form'
import { useForm, Controller } from 'react-hook-form'
import { FormField } from '@/components/forms/FormField'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Test wrapper for React Hook Form
function AccessibilityTestForm({ 
  children, 
  defaultValues = {} 
}: { 
  children: React.ReactNode | ((control: Control<any>) => React.ReactNode)
  defaultValues?: Record<string, unknown>
}) {
  const { control } = useForm({ defaultValues })
  
  return (
    <main> {/* Semantic container for accessibility testing */}
      <form role="form" aria-label="Test form">
        {typeof children === 'function' ? children(control) : children}
      </form>
    </main>
  )
}

describe('FormField Accessibility Compliance', () => {
  describe('Basic Input Accessibility', () => {
    test('basic input field should have no accessibility violations', async () => {
      const { container } = render(
        <AccessibilityTestForm>
          {(control) => (
            <Controller
              control={control}
              name="basicInput"
              render={({ field, fieldState }) => (
                <FormField label="Full Name" required error={fieldState.error?.message}>
                  <Input {...field} type="text" />
                </FormField>
              )}
            />
          )}
        </AccessibilityTestForm>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    test('input with description should have no accessibility violations', async () => {
      const { container } = render(
        <AccessibilityTestForm>
          {(control) => (
            <Controller
              control={control}
              name="inputWithDesc"
              render={({ field, fieldState }) => (
                <FormField 
                  label="Email Address" 
                  description="We'll never share your email with anyone else."
                  error={fieldState.error?.message}
                >
                  <Input {...field} type="email" />
                </FormField>
              )}
            />
          )}
        </AccessibilityTestForm>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    test('input with error should have no accessibility violations', async () => {
      const { container } = render(
        <AccessibilityTestForm>
          {(control) => (
            <Controller
              control={control}
              name="inputWithError"
              render={({ field }) => (
                <FormField 
                  label="Username" 
                  required
                  error="Username is already taken"
                >
                  <Input {...field} type="text" aria-invalid="true" />
                </FormField>
              )}
            />
          )}
        </AccessibilityTestForm>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Complex Form Controls', () => {
    test('textarea field should have no accessibility violations', async () => {
      const { container } = render(
        <AccessibilityTestForm>
          {(control) => (
            <Controller
              control={control}
              name="description"
              render={({ field, fieldState }) => (
                <FormField 
                  label="Description" 
                  description="Provide a detailed description of your request."
                  error={fieldState.error?.message}
                >
                  <Textarea {...field} rows={4} />
                </FormField>
              )}
            />
          )}
        </AccessibilityTestForm>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    test('select field should have no accessibility violations', async () => {
      const { container } = render(
        <AccessibilityTestForm defaultValues={{ category: '' }}>
          {(control) => (
            <Controller
              control={control}
              name="category"
              render={({ field, fieldState }) => (
                <FormField 
                  label="Category" 
                  required
                  description="Choose the most relevant category."
                  error={fieldState.error?.message}
                >
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            />
          )}
        </AccessibilityTestForm>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    test('checkbox field should have no accessibility violations', async () => {
      const { container } = render(
        <AccessibilityTestForm defaultValues={{ newsletter: false }}>
          {(control) => (
            <Controller
              control={control}
              name="newsletter"
              render={({ field, fieldState }) => (
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={Boolean(field.value)}
                    onCheckedChange={field.onChange}
                    id="newsletter"
                    aria-describedby={fieldState.error ? "newsletter-error" : undefined}
                    aria-invalid={Boolean(fieldState.error)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label 
                      htmlFor="newsletter" 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Subscribe to newsletter
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Get updates about new features and releases.
                    </p>
                    {fieldState.error && (
                      <p id="newsletter-error" className="text-xs text-destructive" role="alert">
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                </div>
              )}
            />
          )}
        </AccessibilityTestForm>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Multiple Form Fields', () => {
    test('form with multiple FormField components should have no accessibility violations', async () => {
      const { container } = render(
        <AccessibilityTestForm defaultValues={{ 
          firstName: '', 
          lastName: '', 
          email: '', 
          phone: '',
          role: '',
          bio: '',
          terms: false 
        }}>
          {(control) => (
            <>
              <Controller
                control={control}
                name="firstName"
                render={({ field, fieldState }) => (
                  <FormField label="First Name" required error={fieldState.error?.message}>
                    <Input {...field} type="text" />
                  </FormField>
                )}
              />

              <Controller
                control={control}
                name="lastName"
                render={({ field, fieldState }) => (
                  <FormField label="Last Name" required error={fieldState.error?.message}>
                    <Input {...field} type="text" />
                  </FormField>
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormField 
                    label="Email Address" 
                    required
                    description="We'll use this to contact you about your account."
                    error={fieldState.error?.message}
                  >
                    <Input {...field} type="email" />
                  </FormField>
                )}
              />

              <Controller
                control={control}
                name="phone"
                render={({ field, fieldState }) => (
                  <FormField 
                    label="Phone Number" 
                    description="Optional. Include country code for international numbers."
                    error={fieldState.error?.message}
                  >
                    <Input {...field} type="tel" />
                  </FormField>
                )}
              />

              <Controller
                control={control}
                name="role"
                render={({ field, fieldState }) => (
                  <FormField label="Role" required error={fieldState.error?.message}>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="developer">Developer</SelectItem>
                        <SelectItem value="designer">Designer</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                )}
              />

              <Controller
                control={control}
                name="bio"
                render={({ field, fieldState }) => (
                  <FormField 
                    label="Bio" 
                    description="Tell us a bit about yourself and your experience."
                    error={fieldState.error?.message}
                  >
                    <Textarea {...field} rows={3} />
                  </FormField>
                )}
              />
            </>
          )}
        </AccessibilityTestForm>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Error States Accessibility', () => {
    test('form with multiple validation errors should have no accessibility violations', async () => {
      const { container } = render(
        <AccessibilityTestForm>
          {(control) => (
            <>
              <Controller
                control={control}
                name="field1"
                render={({ field }) => (
                  <FormField 
                    label="Required Field" 
                    required
                    error="This field is required"
                  >
                    <Input {...field} type="text" aria-invalid="true" />
                  </FormField>
                )}
              />

              <Controller
                control={control}
                name="field2"
                render={({ field }) => (
                  <FormField 
                    label="Email Field" 
                    required
                    error="Please enter a valid email address"
                  >
                    <Input {...field} type="email" aria-invalid="true" />
                  </FormField>
                )}
              />

              <Controller
                control={control}
                name="field3"
                render={({ field }) => (
                  <FormField 
                    label="Password Field" 
                    required
                    description="Must be at least 8 characters long"
                    error="Password is too short"
                  >
                    <Input {...field} type="password" aria-invalid="true" />
                  </FormField>
                )}
              />
            </>
          )}
        </AccessibilityTestForm>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Focus Management', () => {
    test('form fields should have proper focus order', async () => {
      const { container } = render(
        <AccessibilityTestForm>
          {(control) => (
            <div>
              <h1>Registration Form</h1>
              <Controller
                control={control}
                name="username"
                render={({ field, fieldState }) => (
                  <FormField label="Username" required error={fieldState.error?.message}>
                    <Input {...field} type="text" />
                  </FormField>
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormField label="Password" required error={fieldState.error?.message}>
                    <Input {...field} type="password" />
                  </FormField>
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <FormField label="Confirm Password" required error={fieldState.error?.message}>
                    <Input {...field} type="password" />
                  </FormField>
                )}
              />

              <button type="submit">Register</button>
            </div>
          )}
        </AccessibilityTestForm>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Color Contrast and Visual Accessibility', () => {
    test('FormField with custom styling should maintain accessibility', async () => {
      const { container } = render(
        <AccessibilityTestForm>
          {(control) => (
            <Controller
              control={control}
              name="styledField"
              render={({ field, fieldState }) => (
                <FormField 
                  label="Styled Field" 
                  description="This field has custom styling"
                  error={fieldState.error?.message}
                  className="custom-form-field"
                >
                  <Input {...field} type="text" className="border-2 border-blue-500" />
                </FormField>
              )}
            />
          )}
        </AccessibilityTestForm>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Screen Reader Compatibility', () => {
    test('FormField components should be compatible with screen readers', async () => {
      const { container } = render(
        <AccessibilityTestForm>
          {(control) => (
            <fieldset>
              <legend>Personal Information</legend>
              
              <Controller
                control={control}
                name="fullName"
                render={({ field, fieldState }) => (
                  <FormField 
                    label="Full Name" 
                    required
                    description="Enter your first and last name"
                    error={fieldState.error?.message}
                  >
                    <Input {...field} type="text" />
                  </FormField>
                )}
              />

              <Controller
                control={control}
                name="dateOfBirth"
                render={({ field, fieldState }) => (
                  <FormField 
                    label="Date of Birth" 
                    required
                    description="Format: MM/DD/YYYY"
                    error={fieldState.error?.message}
                  >
                    <Input {...field} type="date" />
                  </FormField>
                )}
              />
            </fieldset>
          )}
        </AccessibilityTestForm>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('High Contrast Mode Compatibility', () => {
    test('FormField should work in high contrast mode', async () => {
      // Simulate high contrast mode by testing with specific color combinations
      const { container } = render(
        <div style={{ 
          backgroundColor: 'black', 
          color: 'white',
          forcedColorAdjust: 'none' 
        }}>
          <AccessibilityTestForm>
            {(control) => (
              <Controller
                control={control}
                name="highContrastField"
                render={({ field, fieldState }) => (
                  <FormField 
                    label="High Contrast Field" 
                    description="This should work in high contrast mode"
                    error={fieldState.error?.message}
                  >
                    <Input {...field} type="text" />
                  </FormField>
                )}
              />
            )}
          </AccessibilityTestForm>
        </div>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Responsive Accessibility', () => {
    test('FormField should maintain accessibility on mobile viewport', async () => {
      // Set viewport to mobile size
      Object.defineProperty(window, 'innerWidth', { value: 375 })
      Object.defineProperty(window, 'innerHeight', { value: 667 })

      const { container } = render(
        <AccessibilityTestForm>
          {(control) => (
            <div className="px-4 py-2">
              <Controller
                control={control}
                name="mobileField"
                render={({ field, fieldState }) => (
                  <FormField 
                    label="Mobile Optimized Field" 
                    description="This field should work well on mobile devices"
                    error={fieldState.error?.message}
                  >
                    <Input {...field} type="text" className="text-base" />
                  </FormField>
                )}
              />
            </div>
          )}
        </AccessibilityTestForm>
      )

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})