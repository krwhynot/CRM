import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface AuthData {
  errorCode?: string
  error?: string
  errorDescription?: string
  accessToken?: string
  type?: string
}

interface ErrorStateProps {
  authData: AuthData
  hasValidToken: boolean
}

export const ErrorState: React.FC<ErrorStateProps> = ({ authData }) => {
  const navigate = useNavigate()

  let errorTitle = 'Invalid Reset Link'
  let errorMessage = 'This password reset link is invalid or has expired'

  if (authData.errorCode === 'otp_expired') {
    errorTitle = 'Reset Link Expired'
    errorMessage = 'This password reset link has expired. Please request a new one.'
  } else if (authData.error === 'access_denied') {
    errorTitle = 'Access Denied'
    errorMessage = authData.errorDescription
      ? decodeURIComponent(authData.errorDescription.replace(/\+/g, ' '))
      : 'Access to this reset link has been denied.'
  } else if (!authData.accessToken) {
    errorTitle = 'Missing Reset Token'
    errorMessage = 'This page requires a valid password reset link from your email.'
  } else if (authData.type !== 'recovery') {
    errorTitle = 'Invalid Link Type'
    errorMessage = 'This link is not a valid password reset link.'
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-red-600">{errorTitle}</CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-3">
          <Button onClick={() => navigate('/forgot-password')} className="w-full">
            Request New Reset Link
          </Button>
          <Button onClick={() => navigate('/login')} variant="ghost" className="w-full">
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
