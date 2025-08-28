import React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2 } from 'lucide-react'
import type { Organization } from '@/types/entities'

interface BulkDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizations: Organization[]
  onConfirm: () => void
  isDeleting?: boolean
}

export const BulkDeleteDialog: React.FC<BulkDeleteDialogProps> = ({
  open,
  onOpenChange,
  organizations,
  onConfirm,
  isDeleting = false
}) => {
  const organizationCount = organizations.length
  
  const handleConfirm = () => {
    if (!isDeleting) {
      onConfirm()
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Archive {organizationCount} Organization{organizationCount !== 1 ? 's' : ''}?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                This will archive the selected organizations. They will be hidden from view but can be restored later if needed.
              </p>
              
              {organizations.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium text-sm">Organizations to be archived:</p>
                  <div className="max-h-32 overflow-y-auto bg-gray-50 rounded p-2">
                    <ul className="text-sm space-y-1">
                      {organizations.slice(0, 5).map((org) => (
                        <li key={org.id} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0" />
                          {org.name}
                        </li>
                      ))}
                      {organizations.length > 5 && (
                        <li className="text-gray-600 italic">
                          ...and {organizations.length - 5} more
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
              
              <p className="text-sm font-medium text-amber-700 bg-amber-50 p-2 rounded">
                ⚠️ This action will soft-delete these organizations (they can be restored)
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting ? 'Archiving...' : 'Archive Organizations'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}