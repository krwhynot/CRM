import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AuthPage } from './AuthPage'
import { semanticSpacing, semanticRadius } from '@/styles/tokens'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mfb-cream">
        <div className="text-center">
          <div
            className={`mx-auto size-12 animate-spin ${semanticRadius.full} border-b-2 border-mfb-green`}
          ></div>
          <p className={`text-mfb-olive/60 ${semanticSpacing.topGap.lg} font-nunito`}>
            Loading Master Food Brokers CRM...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return fallback || <AuthPage />
  }

  return <>{children}</>
}
