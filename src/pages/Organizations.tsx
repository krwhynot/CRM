import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { ContentSection } from '@/components/layout/ContentSection'

function OrganizationsPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Organizations"
        description="Manage organizations in your CRM"
      />
      <ContentSection>
        <div className="text-center py-8 text-muted-foreground">
          Organizations functionality is being restructured.
        </div>
      </ContentSection>
    </PageLayout>
  )
}

export default OrganizationsPage
