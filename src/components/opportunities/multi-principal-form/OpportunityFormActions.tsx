import React from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface OpportunityFormActionsProps {
  canSubmit: boolean
  isLoading: boolean
}

export const OpportunityFormActions: React.FC<OpportunityFormActionsProps> = ({
  canSubmit,
  isLoading
}) => {
  return (
    <div className="flex flex-col gap-4 pt-4 border-t">
      {!canSubmit && (
        <Alert>
          <AlertDescription>
            Please select at least one principal and complete all required fields.
          </AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={!canSubmit || isLoading}
        className="w-full"
        data-testid="create-opportunity-button"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Creating...
          </>
        ) : (
          'Create Multi-Principal Opportunity'
        )}
      </Button>
    </div>
  )
}