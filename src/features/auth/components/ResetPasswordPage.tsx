import { useAuthCallback } from '@/features/auth/hooks/useAuthCallback'
import { useResetPasswordState } from '@/features/auth/hooks/useResetPasswordState'
import { useSessionInitialization } from '@/features/auth/hooks/useSessionInitialization'
import { LoadingState } from './reset-password/LoadingState'
import { ErrorState } from './reset-password/ErrorState'
import { SuccessState } from './reset-password/SuccessState'
import { ResetPasswordForm } from './reset-password/ResetPasswordForm'

export function ResetPasswordPage() {
  const { isLoading: isAuthLoading, data: authData, hasValidToken, hasError } = useAuthCallback()
  const { sessionInitialized, sessionError } = useSessionInitialization({
    authData,
    isAuthLoading,
    hasValidToken,
    hasError
  })
  const resetPasswordState = useResetPasswordState()


  if (isAuthLoading) {
    return (
      <LoadingState 
        title="Loading..."
        description="Verifying your password reset link"
        bgClassName="bg-mfb-cream"
      />
    )
  }

  if (!hasValidToken || hasError) {
    return <ErrorState authData={authData} hasValidToken={hasValidToken} />
  }

  if (hasValidToken && !sessionInitialized && !sessionError) {
    return (
      <LoadingState 
        title="Initializing..."
        description="Setting up your password reset session"
      />
    )
  }

  if (resetPasswordState.success) {
    return <SuccessState />
  }

  return (
    <ResetPasswordForm
      password={resetPasswordState.password}
      setPassword={resetPasswordState.setPassword}
      confirmPassword={resetPasswordState.confirmPassword}
      setConfirmPassword={resetPasswordState.setConfirmPassword}
      showPassword={resetPasswordState.showPassword}
      setShowPassword={resetPasswordState.setShowPassword}
      showConfirmPassword={resetPasswordState.showConfirmPassword}
      setShowConfirmPassword={resetPasswordState.setShowConfirmPassword}
      loading={resetPasswordState.loading}
      error={resetPasswordState.error || sessionError}
      handleSubmit={resetPasswordState.handleSubmit}
    />
  )
}
