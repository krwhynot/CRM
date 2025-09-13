import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { AlertCircle, Eye, EyeOff } from 'lucide-react'

interface LoginFormProps {
  onToggleMode?: () => void
  onForgotPassword?: () => void
}

export function LoginForm({ onToggleMode, onForgotPassword }: LoginFormProps) {
  const { signIn, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    const { error: signInError } = await signIn(email, password)

    if (signInError) {
      setError(signInError.message)
    } else {
      // Successful login - navigate to dashboard
      navigate('/', { replace: true })
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className={cn(semanticTypography.h2, semanticTypography.h2)}>
          Welcome Back
        </CardTitle>
        <CardDescription>Sign in to your KitchenPantry CRM account</CardDescription>
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

          <div className={semanticSpacing.stack.xs}>
            <label
              htmlFor="password"
              className={cn(semanticTypography.label, semanticTypography.body)}
            >
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`absolute right-0 top-0 h-full ${semanticSpacing.horizontalPadding.md} ${semanticSpacing.verticalPadding.xs} hover:bg-transparent`}
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className={`flex flex-col ${semanticSpacing.gap.lg}`}>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          <div className={`${semanticSpacing.stack.xs} text-center`}>
            {onForgotPassword && (
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={onForgotPassword}
                disabled={loading}
              >
                Forgot your password?
              </Button>
            )}

            {onToggleMode && (
              <div className={`${semanticTypography.body} text-gray-600`}>
                Don&apos;t have an account?{' '}
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className={`h-auto ${semanticSpacing.zero}`}
                  onClick={onToggleMode}
                  disabled={loading}
                >
                  Sign up
                </Button>
              </div>
            )}
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
