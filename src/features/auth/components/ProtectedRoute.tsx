import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AuthPage } from './AuthPage'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto size-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-muted-foreground mt-4 font-nunito">Loading Master Food Brokers CRM...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return fallback || <AuthPage />
  }

  return <>{children}</>
}
