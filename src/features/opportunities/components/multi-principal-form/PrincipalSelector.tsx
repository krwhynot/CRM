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
import { semanticSpacing, semanticTypography, semanticRadius } from '@/styles/tokens'

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
    <div className={semanticSpacing.stackContainer}>
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
        <div className={semanticSpacing.stack.xs}>
          <p className={`${semanticTypography.body} text-muted-foreground`}>Selected Principals:</p>
          <div className={`flex flex-wrap ${semanticSpacing.gap.xs}`}>
            {selectedPrincipals.map((principalId) => {
              const principal = organizations.find((org) => org.id === principalId)
              return principal ? (
                <StatusIndicator
                  key={principalId}
                  variant="secondary"
                  size="sm"
                  className={`flex items-center ${semanticSpacing.gap.xxs}`}
                >
                  {principal.name}
                  <button
                    type="button"
                    onClick={() => onRemovePrincipal(principalId)}
                    className={`${semanticSpacing.leftGap.xxs} ${semanticRadius.default}-full ${semanticSpacing.cardContainer} hover:${bg - muted}`}
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
