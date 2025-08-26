import React from 'react'
import { AppSidebar } from './AppSidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Header } from './Header'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 overflow-auto px-4 py-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}