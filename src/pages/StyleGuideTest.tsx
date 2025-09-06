import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { PriorityBadge } from '@/components/ui/new/PriorityBadge'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/ui/new/PageHeader'

export function StyleGuideTest() {
  return (
    <PageContainer>
      <PageHeader title="Style Guide Test Page" className="mb-6" />

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="mb-4 text-xl font-semibold">Current Style</h2>
          {/* Old components will go here */}
          <div className="space-y-4">
            <p className="text-muted-foreground">Original components:</p>
            <div className="space-x-2">
              <Button>Save Organization</Button>
              <Button variant="secondary">Cancel</Button>
              <Button variant="destructive">Delete</Button>
              <Button variant="ghost">Edit</Button>
            </div>
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Organization Summary</CardTitle>
                <CardDescription>Key metrics and data</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">247</p>
                <p className="mt-1 text-sm text-muted-foreground">Active accounts</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold">Consolidated Style</h2>
          {/* Consolidated components after refactoring */}
          <div className="space-y-4">
            <p className="text-muted-foreground">Components after consolidation:</p>
            <div className="space-x-2">
              <Button>Save Organization</Button>
              <Button variant="secondary">Cancel</Button>
              <Button variant="destructive">Delete</Button>
              <Button variant="ghost">Edit</Button>
            </div>
            <div className="mt-4 space-x-2">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
            </div>
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Organization Summary</CardTitle>
                <CardDescription>Key metrics and data with semantic tokens</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">247</p>
                <p className="mt-1 text-sm text-muted-foreground">Active accounts</p>
              </CardContent>
            </Card>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">Priority Badges:</p>
              <div className="space-x-2">
                <PriorityBadge priority="A+" />
                <PriorityBadge priority="A" />
                <PriorityBadge priority="B" />
                <PriorityBadge priority="C" />
                <PriorityBadge priority="D" />
              </div>
              <div className="space-x-2">
                <PriorityBadge priority="A+" showIcon={false} />
                <PriorityBadge priority="A" showIcon={false} />
                <PriorityBadge priority="B" showIcon={false} />
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <p className="text-sm text-success">Components successfully consolidated!</p>
              <p className="text-sm text-muted-foreground">
                ✅ Button components merged
                <br />
                ✅ Semantic color tokens implemented
                <br />✅ Atomic design templates created
              </p>
            </div>

            {/* New Design System Color Tokens Demo */}
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">New Design System Color Tokens</h3>
              
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Organization Types:</p>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2 rounded-lg border p-3">
                    <div className="h-4 w-4 rounded bg-organization-customer"></div>
                    <span className="text-sm font-medium text-organization-customer-foreground bg-organization-customer px-2 py-1 rounded">Customer</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border p-3">
                    <div className="h-4 w-4 rounded bg-organization-distributor"></div>
                    <span className="text-sm font-medium text-organization-distributor-foreground bg-organization-distributor px-2 py-1 rounded">Distributor</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border p-3">
                    <div className="h-4 w-4 rounded bg-organization-principal"></div>
                    <span className="text-sm font-medium text-organization-principal-foreground bg-organization-principal px-2 py-1 rounded">Principal</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border p-3">
                    <div className="h-4 w-4 rounded bg-organization-supplier"></div>
                    <span className="text-sm font-medium text-organization-supplier-foreground bg-organization-supplier px-2 py-1 rounded">Supplier</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Market Segments:</p>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2 rounded-lg border p-3">
                    <div className="h-4 w-4 rounded bg-segment-restaurant"></div>
                    <span className="text-sm font-medium text-segment-restaurant-foreground bg-segment-restaurant px-2 py-1 rounded">Restaurant</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border p-3">
                    <div className="h-4 w-4 rounded bg-segment-healthcare"></div>
                    <span className="text-sm font-medium text-segment-healthcare-foreground bg-segment-healthcare px-2 py-1 rounded">Healthcare</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border p-3">
                    <div className="h-4 w-4 rounded bg-segment-education"></div>
                    <span className="text-sm font-medium text-segment-education-foreground bg-segment-education px-2 py-1 rounded">Education</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Priority System (Updated):</p>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2 rounded-lg border p-3">
                    <div className="h-4 w-4 rounded bg-priority-a-plus"></div>
                    <span className="text-sm font-medium text-priority-a-plus-foreground bg-priority-a-plus px-2 py-1 rounded">A+ Priority</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border p-3">
                    <div className="h-4 w-4 rounded bg-priority-a"></div>
                    <span className="text-sm font-medium text-priority-a-foreground bg-priority-a px-2 py-1 rounded">A Priority</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border p-3">
                    <div className="h-4 w-4 rounded bg-priority-b"></div>
                    <span className="text-sm font-medium text-priority-b-foreground bg-priority-b px-2 py-1 rounded">B Priority</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border p-3">
                    <div className="h-4 w-4 rounded bg-priority-c"></div>
                    <span className="text-sm font-medium text-priority-c-foreground bg-priority-c px-2 py-1 rounded">C Priority</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border p-3">
                    <div className="h-4 w-4 rounded bg-priority-d"></div>
                    <span className="text-sm font-medium text-priority-d-foreground bg-priority-d px-2 py-1 rounded">D Priority</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default StyleGuideTest
