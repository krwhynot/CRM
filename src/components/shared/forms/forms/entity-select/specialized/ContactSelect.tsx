import React from 'react'
import { EntitySelect, type EntitySelectProps } from '../../EntitySelect'
import { transformContacts } from '@/lib/entity-transformers'

export interface ContactSelectProps extends Omit<EntitySelectProps, 'options'> {
  contacts: Array<{
    id: string
    first_name: string
    last_name: string
    title?: string
    organization?: { name: string }
  }>
}

export const ContactSelect: React.FC<ContactSelectProps> = ({ 
  contacts, 
  ...props 
}) => {
  const options = transformContacts(contacts)
  return <EntitySelect options={options} {...props} />
}