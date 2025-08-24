import React from 'react'

export const ContactsTableLoading: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="h-20 bg-gray-100 animate-pulse rounded" />
      <div className="h-96 bg-gray-100 animate-pulse rounded" />
    </div>
  )
}