import React from 'react';

export function StyleGuideTest() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Style Guide Test Page</h1>
      
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Current Style</h2>
          {/* Old components will go here */}
          <div className="space-y-4">
            <p className="text-gray-600">Original components will be displayed here for comparison.</p>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">New Style</h2>
          {/* New components will go here */}
          <div className="space-y-4">
            <p className="text-gray-600">New MFB-styled components will be displayed here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StyleGuideTest;