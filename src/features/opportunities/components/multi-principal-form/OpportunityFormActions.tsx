import React from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { semanticSpacing } from '@/styles/tokens'

interface OpportunityFormActionsProps {
  canSubmit: boolean
  isLoading: boolean
}

export const OpportunityFormActions: React.FC<OpportunityFormActionsProps> = ({
  canSubmit,
  isLoading,
}) => {
  return (
    <div
      className={`flex flex-col ${semanticSpacing.gap.lg} border-t ${semanticSpacing.topGap.lg}`}
    >
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
            <Loader2 className={`${semanticSpacing.rightGap.xs} size-4 animate-spin`} />
            Creating...
          </>
        ) : (
          'Create Multi-Principal Opportunity'
        )}
      </Button>
    </div>
  )
}
