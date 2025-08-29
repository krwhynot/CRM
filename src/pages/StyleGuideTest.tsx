import { Button } from '@/components/ui/button';
// import { ButtonNew } from '@/components/ui/new/Button'; // Removed during component consolidation
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
// import { CardNew, CardHeader as CardHeaderNew, CardTitle as CardTitleNew, CardDescription as CardDescriptionNew, CardContent as CardContentNew } from '@/components/ui/new/Card'; // Removed during component consolidation
import { PriorityBadge } from '@/components/ui/new/PriorityBadge';
// import { InputNew } from '@/components/ui/new/Input'; // Removed during component consolidation
// import { LabelNew } from '@/components/ui/new/Label'; // Removed during component consolidation

export function StyleGuideTest() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold font-nunito text-mfb-olive mb-6">Style Guide Test Page</h1>
      
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Current Style</h2>
          {/* Old components will go here */}
          <div className="space-y-4">
            <p className="text-gray-600">Original components:</p>
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
                <p className="text-sm text-gray-500 mt-1">Active accounts</p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Consolidated Style</h2>
          {/* Consolidated components after refactoring */}
          <div className="space-y-4">
            <p className="text-gray-600">Components after consolidation:</p>
            <div className="space-x-2">
              <Button>Save Organization</Button>
              <Button variant="secondary">Cancel</Button>
              <Button variant="destructive">Delete</Button>
              <Button variant="ghost">Edit</Button>
            </div>
            <div className="space-x-2 mt-4">
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
                <p className="text-sm text-muted-foreground mt-1">Active accounts</p>
              </CardContent>
            </Card>
            <div className="mt-4 space-y-2">
              <p className="text-gray-600 text-sm">Priority Badges:</p>
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
              <p className="text-success text-sm">Components successfully consolidated!</p>
              <p className="text-muted-foreground text-sm">
                ✅ Button components merged<br/>
                ✅ Semantic color tokens implemented<br/>
                ✅ Atomic design templates created
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StyleGuideTest;