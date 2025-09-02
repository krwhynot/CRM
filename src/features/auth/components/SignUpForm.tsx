import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSignUpForm } from '@/features/auth/hooks/useSignUpForm'
import { PasswordInput } from './form-components/PasswordInput'
import { FormAlert } from './form-components/FormAlert'
import { SignUpFormLayout } from './form-components/SignUpFormLayout'

interface SignUpFormProps {
  onToggleMode?: () => void
}

export function SignUpForm({ onToggleMode }: SignUpFormProps) {
  const { formState, loading, updateField, handleSubmit } = useSignUpForm()

  return (
    <form onSubmit={handleSubmit}>
      <SignUpFormLayout
        footer={
          <>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>

            {onToggleMode && (
              <div className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0"
                  onClick={onToggleMode}
                  disabled={loading}
                >
                  Sign in
                </Button>
              </div>
            )}
          </>
        }
      >
        {formState.error && <FormAlert type="error" message={formState.error} />}
        {formState.success && <FormAlert type="success" message={formState.success} />}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formState.email}
            onChange={(e) => updateField('email', e.target.value)}
            disabled={loading}
            required
            autoComplete="email"
          />
        </div>

        <PasswordInput
          id="password"
          label="Password"
          placeholder="Create a password"
          value={formState.password}
          showPassword={formState.showPassword}
          disabled={loading}
          required
          autoComplete="new-password"
          showHint
          onChange={(value) => updateField('password', value)}
          onToggleVisibility={() => updateField('showPassword', !formState.showPassword)}
        />

        <PasswordInput
          id="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm your password"
          value={formState.confirmPassword}
          showPassword={formState.showConfirmPassword}
          disabled={loading}
          required
          autoComplete="new-password"
          onChange={(value) => updateField('confirmPassword', value)}
          onToggleVisibility={() =>
            updateField('showConfirmPassword', !formState.showConfirmPassword)
          }
        />
      </SignUpFormLayout>
    </form>
  )
}
