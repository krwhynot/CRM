import { useState } from 'react'
import { LoginForm } from './LoginForm'
import { SignUpForm } from './SignUpForm'
import { ForgotPasswordForm } from './ForgotPasswordForm'
import { semanticSpacing } from '@/styles/tokens'

type AuthMode = 'login' | 'signup' | 'forgot-password'

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')

  const handleToggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
  }

  const handleForgotPassword = () => {
    setMode('forgot-password')
  }

  const handleBackToLogin = () => {
    setMode('login')
  }

  return (
    <div
      className={`flex min-h-screen items-center justify-center bg-gray-50 ${semanticSpacing.layoutPadding.lg} ${semanticSpacing.layoutPadding.xxxl} sm:${semanticSpacing.layoutPadding.xxl} lg:${semanticSpacing.layoutPadding.xxxl}`}
    >
      <div className="w-full max-w-md">
        {mode === 'login' && (
          <LoginForm onToggleMode={handleToggleMode} onForgotPassword={handleForgotPassword} />
        )}

        {mode === 'signup' && <SignUpForm onToggleMode={handleToggleMode} />}

        {mode === 'forgot-password' && <ForgotPasswordForm onBackToLogin={handleBackToLogin} />}
      </div>
    </div>
  )
}
