import React from 'react'
import { Button } from '@/components/ui/button'
import { MessageSquare, Plus } from 'lucide-react'

interface InteractionsPageHeaderProps {
  onAddClick: () => void
}

export const InteractionsPageHeader: React.FC<InteractionsPageHeaderProps> = ({
  onAddClick
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold font-nunito text-mfb-olive mb-6 flex items-center gap-2">
          <MessageSquare className="h-8 w-8 text-mfb-green" />
          Interactions
        </h1>
        <p className="text-lg text-mfb-olive/70 font-nunito">
          Track all customer touchpoints and communication history
        </p>
      </div>
      <Button onClick={onAddClick}>
        <Plus className="h-4 w-4 mr-2" />
        Add Interaction
      </Button>
    </div>
  )
}