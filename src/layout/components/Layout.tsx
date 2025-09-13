import React from 'react'
import { AppSidebar } from './AppSidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Header } from './Header'
import { semanticSpacing } from '@/styles/tokens'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider data-app-shell>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className={`flex-1 overflow-auto ${semanticSpacing.pageContainer}`}>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
