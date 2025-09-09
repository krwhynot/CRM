import React from 'react'
import { CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import type { Organization } from '@/types/entities'

interface PrincipalCardHeaderProps {
  principal: Organization
  priority: string
  priorityColor: string
}

export const PrincipalCardHeader: React.FC<PrincipalCardHeaderProps> = ({
  principal,
  priority,
  priorityColor,
}) => {
  const handleExport = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Export functionality placeholder - will be implemented in future iteration
    alert(`Export functionality for ${principal.name} will be implemented soon`)
  }

  return (
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between gap-2">
        <CardTitle className="text-lg transition-colors group-hover:text-primary">
          {principal.name}
        </CardTitle>

        <div className="flex items-center gap-2">
          {/* Export Button - Hidden by default, shown on hover */}
          <Button
            size="sm"
            variant="ghost"
            className="size-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={handleExport}
            title={`Export ${principal.name} data`}
          >
            <Download className="size-4" />
          </Button>

          <Badge className={priorityColor} variant="outline">
            {priority}
          </Badge>
        </div>
      </div>

      {principal.industry && <p className="text-sm text-muted-foreground">{principal.industry}</p>}

      {principal.description && (
        <p className="line-clamp-2 text-xs text-muted-foreground">{principal.description}</p>
      )}
    </CardHeader>
  )
}
