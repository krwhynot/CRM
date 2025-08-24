import React from 'react'
import { TableRow, TableCell } from '@/components/ui/table'

interface ContactsTableEmptyProps {
  showOrganization: boolean
  searchTerm: string
  activeFilter: string
}

export const ContactsTableEmpty: React.FC<ContactsTableEmptyProps> = ({
  showOrganization,
  searchTerm,
  activeFilter
}) => {
  const hasFilters = searchTerm || activeFilter !== 'all'
  
  return (
    <TableRow>
      <TableCell colSpan={showOrganization ? 7 : 6} className="text-center py-12">
        <div className="space-y-3">
          <div className="text-lg font-medium text-gray-500">
            {hasFilters 
              ? 'No contacts match your criteria' 
              : 'No contacts found'
            }
          </div>
          <div className="text-sm text-gray-400">
            {hasFilters 
              ? 'Try adjusting your search or filters' 
              : 'Get started by adding your first contact'
            }
          </div>
        </div>
      </TableCell>
    </TableRow>
  )
}