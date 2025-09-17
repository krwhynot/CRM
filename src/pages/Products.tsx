import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { ContentSection } from '@/components/layout/ContentSection'

function ProductsPage() {
  return (
    <PageLayout>
      <PageHeader
        title="Products"
        description="Manage products in your catalog"
      />
      <ContentSection>
        <div className="text-center py-8 text-muted-foreground">
          Products functionality is being restructured.
        </div>
      </ContentSection>
    </PageLayout>
  )
}

export default ProductsPage
