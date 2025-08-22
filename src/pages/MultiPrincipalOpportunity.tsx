import { useNavigate } from 'react-router-dom'
import { toast } from '@/lib/toast-styles'
import { ArrowLeft, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { SimpleMultiPrincipalForm } from '@/components/opportunities/SimpleMultiPrincipalForm'

function MultiPrincipalOpportunityPage() {
  const navigate = useNavigate()

  const handleSuccess = (_opportunityId: string) => {
    toast.success('Multi-principal opportunity created successfully!')
    navigate(`/opportunities`) // Could navigate to specific opportunity view if it exists
  }

  const handleCancel = () => {
    navigate('/opportunities')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Opportunities
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-nunito text-mfb-olive mb-6 flex items-center gap-2">
              <Users className="h-8 w-8 text-mfb-green" />
              New Multi-Principal Opportunity
            </h1>
            <p className="text-lg text-mfb-olive/70 font-nunito">
              Create opportunities with multiple principals and complex participant relationships
            </p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-4xl mx-auto">
        <SimpleMultiPrincipalForm
          onSuccess={handleSuccess}
          className="w-full"
        />
      </div>

      {/* Help Text */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">Multi-Principal Opportunities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">When to Use</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Multiple food brokers involved</li>
                <li>• Complex distributor relationships</li>
                <li>• Joint territory coverage</li>
                <li>• Commission sharing arrangements</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Key Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Assign multiple principals per opportunity</li>
                <li>• Set primary principal per role</li>
                <li>• Configure commission rates</li>
                <li>• Define territory coverage</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MultiPrincipalOpportunityPage