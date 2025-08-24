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
    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
      <Button 
        type="submit" 
        disabled={loading} 
        className="h-12 text-base px-6 rounded-md font-medium
                   focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-1"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
          className="h-12 text-base px-6 rounded-md font-medium
                     focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
      )}
    </div>
  )
}