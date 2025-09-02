import { useNavigate } from 'react-router-dom'
import { toast } from '@/lib/toast-styles'
import { Users } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { SimpleMultiPrincipalForm } from '@/features/opportunities/components/SimpleMultiPrincipalForm'
import { PageContainer } from '@/components/layout'
import { PageHeader } from '@/components/ui/new/PageHeader'

function MultiPrincipalOpportunityPage() {
  const navigate = useNavigate()

  const handleSuccess = () => {
    toast.success('Multi-principal opportunity created successfully!')
    // Opportunity created successfully, navigating to opportunities list
    navigate(`/opportunities`) // Could navigate to specific opportunity view if it exists
  }

  const handleCancel = () => {
    navigate('/opportunities')
  }

  return (
    <PageContainer>
      <PageHeader
        title="New Multi-Principal Opportunity"
        subtitle="Create opportunities with multiple principals and complex participant relationships"
        icon={<Users className="size-8 text-primary" />}
        backButton={{
          onClick: handleCancel,
          label: 'Back to Opportunities',
          'aria-label': 'Go back to opportunities page',
        }}
      />

      {/* Main Form */}
      <div>
        <SimpleMultiPrincipalForm onSuccess={handleSuccess} className="w-full" />
      </div>

      {/* Help Text */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Multi-Principal Opportunities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-medium">When to Use</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Multiple food brokers involved</li>
                <li>• Complex distributor relationships</li>
                <li>• Joint territory coverage</li>
                <li>• Commission sharing arrangements</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-medium">Key Features</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Assign multiple principals per opportunity</li>
                <li>• Set primary principal per role</li>
                <li>• Configure commission rates</li>
                <li>• Define territory coverage</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}

export default MultiPrincipalOpportunityPage
