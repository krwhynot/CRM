import { Button } from '@/components/ui/button';
import { ButtonNew } from '@/components/ui/new/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CardNew, CardHeader as CardHeaderNew, CardTitle as CardTitleNew, CardDescription as CardDescriptionNew, CardContent as CardContentNew } from '@/components/ui/new/Card';
import { PriorityBadge } from '@/components/ui/new/PriorityBadge';
import { InputNew } from '@/components/ui/new/Input';
import { LabelNew } from '@/components/ui/new/Label';

export function StyleGuideTest() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Style Guide Test Page</h1>
      
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
          <h2 className="text-xl font-semibold mb-4">New Style</h2>
          {/* New components will go here */}
          <div className="space-y-4">
            <p className="text-gray-600">New MFB-styled components:</p>
            <div className="space-x-2">
              <ButtonNew>Save Organization</ButtonNew>
              <ButtonNew variant="secondary">Cancel</ButtonNew>
              <ButtonNew variant="danger">Delete</ButtonNew>
              <ButtonNew variant="ghost">Edit</ButtonNew>
            </div>
            <div className="space-x-2 mt-4">
              <ButtonNew size="sm">Small</ButtonNew>
              <ButtonNew size="md">Medium</ButtonNew>
              <ButtonNew size="lg">Large</ButtonNew>
            </div>
            <CardNew className="mt-4">
              <CardHeaderNew>
                <CardTitleNew>Organization Summary</CardTitleNew>
                <CardDescriptionNew>Key metrics and data</CardDescriptionNew>
              </CardHeaderNew>
              <CardContentNew>
                <p className="text-3xl font-bold font-nunito text-mfb-green">247</p>
                <p className="text-sm text-mfb-olive/60 mt-1">Active accounts</p>
              </CardContentNew>
            </CardNew>
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
              <p className="text-gray-600 text-sm">Form Components:</p>
              <div className="space-y-4">
                <div>
                  <LabelNew required>Organization Name</LabelNew>
                  <InputNew placeholder="Enter organization name..." />
                </div>
                <div>
                  <LabelNew>Email Address</LabelNew>
                  <InputNew placeholder="Enter email..." type="email" />
                </div>
                <div>
                  <LabelNew required>Password</LabelNew>
                  <InputNew placeholder="Enter password..." type="password" error={true} />
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <LabelNew>Small Input</LabelNew>
                    <InputNew placeholder="Small" size="sm" />
                  </div>
                  <div className="flex-1">
                    <LabelNew>Large Input</LabelNew>
                    <InputNew placeholder="Large" size="lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StyleGuideTest;