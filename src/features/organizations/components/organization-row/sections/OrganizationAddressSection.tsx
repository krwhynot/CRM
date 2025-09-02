import React from 'react'
import { MapPin } from 'lucide-react'
import type { Organization } from '@/types/entities'

interface OrganizationAddressSectionProps {
  organization: Organization
}

const EmptyCell = () => <span className="italic text-gray-400">Not provided</span>

export const OrganizationAddressSection: React.FC<OrganizationAddressSectionProps> = ({
  organization,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
        <MapPin className="size-4" />
        Address
      </div>
      <div className="pl-6 text-sm text-gray-600">
        {organization.address_line_1 ? (
          <>
            <div>{organization.address_line_1}</div>
            {organization.address_line_2 && <div>{organization.address_line_2}</div>}
            {(organization.city || organization.state_province) && (
              <div>
                {organization.city}
                {organization.city && organization.state_province && ', '}
                {organization.state_province} {organization.postal_code}
              </div>
            )}
            {organization.country && <div>{organization.country}</div>}
          </>
        ) : (
          <EmptyCell />
        )}
      </div>
    </div>
  )
}
