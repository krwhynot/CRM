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
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default StyleGuideTest
