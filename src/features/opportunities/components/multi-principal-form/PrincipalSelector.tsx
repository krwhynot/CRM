import React from 'react'
import { X } from 'lucide-react'
import { FormLabel } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusIndicator } from '@/components/ui/status-indicator'
import type { Organization } from '@/types/entities'

interface PrincipalSelectorProps {
  principalOrganizations: Organization[]
  selectedPrincipals: string[]
  organizations: Organization[]
  onAddPrincipal: (principalId: string) => void
  onRemovePrincipal: (principalId: string) => void
}

export const PrincipalSelector: React.FC<PrincipalSelectorProps> = ({
  principalOrganizations,
  selectedPrincipals,
  organizations,
  onAddPrincipal,
  onRemovePrincipal,
}) => {
  return (
    <div className="space-y-4">
      <FormLabel>Principals *</FormLabel>

      <Select onValueChange={onAddPrincipal}>
        <SelectTrigger data-testid="add-organization-select">
          <SelectValue placeholder="Add principal organization" />
        </SelectTrigger>
        <SelectContent>
          {principalOrganizations
            .filter((org) => !selectedPrincipals.includes(org.id))
            .map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {selectedPrincipals.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Selected Principals:</p>
          <div className="flex flex-wrap gap-2">
            {selectedPrincipals.map((principalId) => {
              const principal = organizations.find((org) => org.id === principalId)
              return principal ? (
                <StatusIndicator
                  key={principalId}
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  {principal.name}
                  <button
                    type="button"
                    onClick={() => onRemovePrincipal(principalId)}
                    className="ml-1 rounded-full p-0.5 hover:bg-gray-200"
                  >
                    <X className="size-3" />
                  </button>
                </StatusIndicator>
              ) : null
            })}
          </div>
        </div>
      )}
    </div>
  )
}
