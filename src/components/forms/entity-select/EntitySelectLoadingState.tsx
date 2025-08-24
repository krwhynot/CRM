import React from 'react'

export const EntitySelectLoadingState: React.FC = () => {
  return (
    <div className="h-12 w-full rounded-md border border-gray-300 bg-gray-50 flex items-center px-4">
      <span className="text-gray-500 text-base">Loading options...</span>
    </div>
  )
}