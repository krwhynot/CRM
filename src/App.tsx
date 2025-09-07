import React, { useState, Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/components/theme-provider'
import { Layout } from '@/layout/components/Layout'
import { AuthPage, ResetPasswordPage, AuthCallbackHandler } from '@/features/auth'
import { CommandPalette } from '@/components/CommandPalette'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { setupPerformanceMonitoring } from '@/lib/performance'

// Lazy load main pages for code splitting
const HomePage = lazy(() => import('@/pages/Home'))
const OrganizationsPage = lazy(() => import('@/pages/Organizations'))
const ContactsPage = lazy(() => import('@/pages/Contacts'))
const OpportunitiesPage = lazy(() => import('@/pages/Opportunities'))
const MultiPrincipalOpportunityPage = lazy(() => import('@/pages/MultiPrincipalOpportunity'))
const ProductsPage = lazy(() => import('@/pages/Products'))
const InteractionsPage = lazy(() => import('@/pages/Interactions'))
const ImportExportPage = lazy(() => import('@/pages/ImportExport'))
const StyleGuideTestPage = lazy(() => import('@/pages/StyleGuideTest'))

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
    return (
      <div role="status" aria-live="polite">
        Loading...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  // Set up performance monitoring
  React.useEffect(() => {
    setupPerformanceMonitoring()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Suspense fallback={<LoadingSpinner />}>
                            <HomePage />
                          </Suspense>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected app routes */}
                  <Route
                    path="/organizations"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Suspense fallback={<LoadingSpinner />}>
                            <OrganizationsPage />
                          </Suspense>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/contacts"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Suspense fallback={<LoadingSpinner />}>
                            <ContactsPage />
                          </Suspense>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/opportunities"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Suspense fallback={<LoadingSpinner />}>
                            <OpportunitiesPage />
                          </Suspense>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/opportunities/new-multi-principal"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Suspense fallback={<LoadingSpinner />}>
                            <MultiPrincipalOpportunityPage />
                          </Suspense>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/products"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Suspense fallback={<LoadingSpinner />}>
                            <ProductsPage />
                          </Suspense>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/interactions"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Suspense fallback={<LoadingSpinner />}>
                            <InteractionsPage />
                          </Suspense>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/import-export"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Suspense fallback={<LoadingSpinner />}>
                            <ImportExportPage />
                          </Suspense>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/style-test"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Suspense fallback={<LoadingSpinner />}>
                            <StyleGuideTestPage />
                          </Suspense>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </AuthCallbackHandler>
              <Toaster />
              <ReactQueryDevtools initialIsOpen={false} />
            </Router>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
