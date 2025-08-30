import React from 'react'

export const EntitySelectLoadingState: React.FC = () => {
  return (
    <div className="flex h-12 w-full items-center rounded-md border border-gray-300 bg-gray-50 px-4">
      <span className="text-base text-gray-500">Loading options...</span>
    </div>
  )
}