import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { semanticSpacing, semanticTypography, semanticRadius } from '@/styles/tokens'
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'

interface ForgotPasswordFormProps {
  onBackToLogin?: () => void
}

export function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    if (!email) {
      setError('Please enter your email address')
      setLoading(false)
      return
    }

    const { error: resetError } = await resetPassword(email)

    if (resetError) {
      setError(resetError.message)
    } else {
      setSuccess('Password reset email sent! Please check your inbox for further instructions.')
    }

    setLoading(false)
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className={cn(semanticTypography.h2, semanticTypography.h2)}>
          Reset Password
        </CardTitle>
        <CardDescription>
          Enter your email address and we&apos;ll send you a link to reset your password
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className={semanticSpacing.stackContainer}>
          {error && (
            <div
              className={cn(
                semanticRadius.default,
                'flex items-center',
                semanticSpacing.gap.xs,
                'border border-red-200 bg-red-50',
                semanticSpacing.cardContainer,
                semanticTypography.body,
                'text-red-600'
              )}
            >
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {success && (
            <div
              className={cn(
                semanticRadius.default,
                'flex items-center',
                semanticSpacing.gap.xs,
                'border border-green-200 bg-green-50',
                semanticSpacing.cardContainer,
                semanticTypography.body,
                'text-green-600'
              )}
            >
              <CheckCircle size={16} />
              {success}
            </div>
          )}

          <div className={semanticSpacing.stack.xs}>
            <label
              htmlFor="email"
              className={cn(semanticTypography.label, semanticTypography.body)}
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              autoComplete="email"
            />
          </div>
        </CardContent>

        <CardFooter className={`flex flex-col ${semanticSpacing.gap.lg}`}>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Email'}
          </Button>

          {onBackToLogin && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onBackToLogin}
              disabled={loading}
              className={`flex items-center ${semanticSpacing.gap.xs}`}
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}
