import { Button } from '@/components/ui/button';
import { ButtonNew } from '@/components/ui/new/Button';

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
          </div>
        </div>
      </div>
    </div>
  );
}

export default StyleGuideTest;