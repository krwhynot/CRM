import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Layout } from '@/components/layout/Layout'
import { AuthPage } from '@/components/auth/AuthPage'
import { ResetPasswordPage } from '@/components/auth/ResetPasswordPage'
import { AuthCallbackHandler } from '@/components/auth/AuthCallbackHandler'
import { CommandPalette } from '@/components/command-palette'
import { DashboardPage } from '@/pages/Dashboard'
import { OrganizationsPage } from '@/pages/Organizations'
import { ContactsPage } from '@/pages/Contacts'
import { OpportunitiesPage } from '@/pages/Opportunities'
import { ProductsPage } from '@/pages/Products'
import { InteractionsPage } from '@/pages/Interactions'
import { ImportExportPage } from '@/pages/ImportExport'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div>Loading...</div>
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function App() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router>
            <AuthCallbackHandler>
            <CommandPalette open={commandPaletteOpen} setOpen={setCommandPaletteOpen} />
            <Routes>
              {/* Public auth routes - must come first */}
              <Route path="/login" element={<AuthPage />} />
              <Route path="/forgot-password" element={<AuthPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              
              {/* Root redirect */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              } />
              
              {/* Protected app routes */}
              <Route path="/organizations" element={
                <ProtectedRoute>
                  <Layout>
                    <OrganizationsPage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/contacts" element={
                <ProtectedRoute>
                  <Layout>
                    <ContactsPage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/opportunities" element={
                <ProtectedRoute>
                  <Layout>
                    <OpportunitiesPage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/products" element={
                <ProtectedRoute>
                  <Layout>
                    <ProductsPage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/interactions" element={
                <ProtectedRoute>
                  <Layout>
                    <InteractionsPage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/import-export" element={
                <ProtectedRoute>
                  <Layout>
                    <ImportExportPage />
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
            </AuthCallbackHandler>
            <Toaster />
          </Router>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App