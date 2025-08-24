import React from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight, MapPin, Briefcase, User, Mail, ExternalLink, FileText } from 'lucide-react'
import { OrganizationBadges } from './OrganizationBadges'
import { OrganizationActions } from './OrganizationActions'
import type { Organization } from '@/types/entities'

interface OrganizationRowProps {
  organization: Organization
  isExpanded: boolean
  onToggleExpansion: () => void
  onEdit?: (organization: Organization) => void
  onDelete?: (organization: Organization) => void
  onView?: (organization: Organization) => void
  onContact?: (organization: Organization) => void
}

const EmptyCell = () => (
  <span className="text-gray-400 italic">Not provided</span>
)

export const OrganizationRow: React.FC<OrganizationRowProps> = ({
  organization,
  isExpanded,
  onToggleExpansion,
  onEdit,
  onDelete,
  onView,
  onContact
}) => {
  return (
    <>
      {/* Main Row */}
      <TableRow className="hover:bg-gray-50 transition-colors duration-200 group">
        <TableCell className="py-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleExpansion}
            className="p-0 h-auto hover:bg-transparent"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        </TableCell>
        <TableCell className="font-medium py-4">
          <div className="space-y-2">
            <div className="text-base font-semibold text-gray-900">
              {organization.name || <EmptyCell />}
            </div>
            <OrganizationBadges
              priority={organization.priority}
              type={organization.type}
              segment={organization.segment}
            />
          </div>
        </TableCell>
        <TableCell className="py-4 text-gray-700">
          {organization.phone || <EmptyCell />}
        </TableCell>
        <TableCell className="py-4">
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-900">
              {organization.primary_manager_name || <EmptyCell />}
            </div>
            {organization.secondary_manager_name && (
              <div className="text-xs text-gray-600">
                + {organization.secondary_manager_name}
              </div>
            )}
          </div>
        </TableCell>
        <TableCell className="py-4">
          <div className="text-sm text-gray-700">
            {organization.city && organization.state_province ? (
              <>{organization.city}, {organization.state_province}</>
            ) : organization.city ? (
              organization.city
            ) : organization.state_province ? (
              organization.state_province
            ) : (
              <EmptyCell />
            )}
          </div>
        </TableCell>
        <TableCell className="py-4">
          <OrganizationActions
            organization={organization}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
            onContact={onContact}
          />
        </TableCell>
      </TableRow>

      {/* Expandable Row Details */}
      {isExpanded && (
        <TableRow className="border-b-2 border-gray-100">
          <TableCell 
            colSpan={6} 
            className="bg-[--mfb-sage-tint] border-l-4 border-[--mfb-green] p-6 transition-all duration-300 ease-out"
          >
            <div className="space-y-6">
              {/* Address - Full Width */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <MapPin className="h-4 w-4" />
                  Address
                </div>
                <div className="text-sm text-gray-600 pl-6">
                  {organization.address_line_1 ? (
                    <>
                      <div>{organization.address_line_1}</div>
                      {organization.address_line_2 && <div>{organization.address_line_2}</div>}
                      {(organization.city || organization.state_province) && (
                        <div>
                          {organization.city}{organization.city && organization.state_province && ', '}
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

              {/* Compact Info Row 1: Business Segment + Secondary Manager */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <Briefcase className="h-4 w-4" />
                    Business Segment
                  </div>
                  <div className="text-sm text-gray-600 pl-6">
                    {organization.segment || <EmptyCell />}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <User className="h-4 w-4" />
                    Secondary Manager
                  </div>
                  <div className="text-sm text-gray-600 pl-6">
                    {organization.secondary_manager_name || <EmptyCell />}
                  </div>
                </div>
              </div>

              {/* Compact Info Row 2: Email + LinkedIn */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <div className="text-sm text-gray-600 pl-6">
                    {organization.email || <EmptyCell />}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <ExternalLink className="h-4 w-4" />
                    LinkedIn Profile
                  </div>
                  <div className="text-sm pl-6">
                    {organization.website ? (
                      <a
                        href={organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        View Profile
                      </a>
                    ) : (
                      <EmptyCell />
                    )}
                  </div>
                </div>
              </div>

              {/* Notes - Full Width (only if present) */}
              {organization.notes && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <FileText className="h-4 w-4" />
                    Notes
                  </div>
                  <div className="text-sm text-gray-600 pl-6">
                    {organization.notes}
                  </div>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}