import React from 'react'
import { TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface ContactsTableHeaderProps {
  showOrganization: boolean
}

export const ContactsTableHeader: React.FC<ContactsTableHeaderProps> = ({ 
  showOrganization 
}) => {
  return (
    <TableHeader>
      <TableRow className="bg-gray-50/80">
        <TableHead className="w-12" />
        <TableHead className="font-semibold text-gray-700 min-w-[200px]">Contact</TableHead>
        {showOrganization && (
          <TableHead className="font-semibold text-gray-700 min-w-[150px]">Organization</TableHead>
        )}
        <TableHead className="font-semibold text-gray-700 min-w-[120px]">Position</TableHead>
        <TableHead className="font-semibold text-gray-700 min-w-[140px]">Primary Contact</TableHead>
        <TableHead className="font-semibold text-gray-700 text-center min-w-[120px]">Status</TableHead>
        <TableHead className="font-semibold text-gray-700 text-center min-w-[150px]">Quick Actions</TableHead>
      </TableRow>
    </TableHeader>
  )
}