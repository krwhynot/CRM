import React from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  count?: number
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, count }) => {
  return (
    <div>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {count !== undefined && (
          <span className="text-sm text-muted-foreground">({count})</span>
        )}
      </div>
      {subtitle && (
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  )
}