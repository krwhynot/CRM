import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { InteractionsTable } from '@/components/interactions/InteractionsTable'
import type { InteractionWithRelations } from '@/types/entities'

interface InteractionsSearchAndTableProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  isLoading: boolean
  interactions: InteractionWithRelations[]
  onEdit: (interaction: InteractionWithRelations) => void
  onDelete: (interaction: InteractionWithRelations) => void
}

export const InteractionsSearchAndTable: React.FC<InteractionsSearchAndTableProps> = ({
  searchTerm,
  onSearchChange,
  isLoading,
  interactions,
  onEdit,
  onDelete
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Interactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder=""
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8 font-nunito text-mfb-green">Loading interactions...</div>
        ) : (
          <InteractionsTable 
            interactions={interactions} 
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
      </CardContent>
    </Card>
  )
}