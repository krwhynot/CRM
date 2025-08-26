import React from 'react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/new/PageHeader'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContactsPageHeaderProps {
  contactsCount: number
  onAddClick: () => void
  useNewStyle: boolean
}

export const ContactsPageHeader: React.FC<ContactsPageHeaderProps> = ({
  contactsCount,
  onAddClick,
  useNewStyle
}) => {
  return (
    <div className="flex items-center justify-between">
      <PageHeader 
        title="Manage Contacts"
        subtitle="Professional Network & Relationships"
        count={contactsCount}
      />
      <Button 
        onClick={onAddClick}
        className="ml-6"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Contact
      </Button>
    </div>
  )
}