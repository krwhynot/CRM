import { Button } from '@/components/ui/button'

interface FormSubmitActionsProps {
  loading: boolean
  submitLabel: string
  hasInitialData: boolean
}

export function FormSubmitActions({ 
  loading, 
  submitLabel, 
  hasInitialData 
}: FormSubmitActionsProps) {
  return (
    <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row">
      <Button 
        type="submit" 
        disabled={loading} 
        className="h-12 flex-1 rounded-md px-6 text-base
                   font-medium focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="size-4 animate-spin rounded-full border-b-2 border-white"></div>
            Saving...
          </div>
        ) : (
          submitLabel
        )}
      </Button>
      
      {hasInitialData && (
        <Button 
          type="button" 
          variant="outline" 
          className="h-12 rounded-md px-6 text-base font-medium
                     focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
      )}
    </div>
  )
}