import React from 'react'
import { EntitySelect, type EntitySelectProps } from '@/components/forms/EntitySelect'
import { transformOrganizations } from '@/lib/entity-transformers'

export interface OrganizationSelectProps extends Omit<EntitySelectProps, 'options'> {
  organizations: Array<{
    id: string
    name: string
    type?: string
    segment?: string
  }>
}

export const OrganizationSelect: React.FC<OrganizationSelectProps> = ({
  organizations,
  ...props
}) => {
  const options = transformOrganizations(organizations)
  return <EntitySelect options={options} {...props} />
}
