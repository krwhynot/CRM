import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { ContentSection } from '@/components/layout/ContentSection'

function OpportunitiesPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Opportunities"
        description="Manage sales opportunities in your pipeline"
      />
      <ContentSection>
        <div className="text-center py-8 text-muted-foreground">
          Opportunities functionality is being restructured.
        </div>
      </ContentSection>
    </PageLayout>
  )
}

export default OpportunitiesPage
