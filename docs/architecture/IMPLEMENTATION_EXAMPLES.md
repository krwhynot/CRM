# Implementation Examples and Best Practices

## Overview

This document provides concrete implementation examples for the feature-based architecture, demonstrating best practices and patterns that should be followed across all CRM features.

## Complete Feature Implementation Example: Contacts

### 1. Service Layer Implementation

```typescript
// features/contacts/services/contactService.ts
import { BaseService } from '@/shared/services/api/base.service'
import type { 
  Contact, 
  ContactInsert, 
  ContactUpdate, 
  ContactFilters,
  ContactWithOrganization 
} from '../types'

export class ContactService extends BaseService<
  Contact,
  ContactInsert,
  ContactUpdate,
  ContactFilters
> {
  constructor() {
    super('contacts', `
      *,
      organization:organizations(*),
      preferred_principals:contact_preferred_principals(
        *,
        principal:organizations(*)
      )
    `)
  }

  protected applySearchFilter(query: any, search: string) {
    return query.or(
      `first_name.ilike.%${search}%,` +
      `last_name.ilike.%${search}%,` +
      `title.ilike.%${search}%,` +
      `email.ilike.%${search}%,` +
      `organization.name.ilike.%${search}%`
    )
  }

  // Feature-specific methods
  async getContactsWithOrganization(filters?: ContactFilters): Promise<ContactWithOrganization[]> {
    let query = this.query().select(this.selectFields)
    
    // Apply standard filters
    query = this.applyFilters(query, filters)

    // Apply contact-specific filters
    if (filters?.organization_id) {
      query = query.eq('organization_id', filters.organization_id)
    }

    if (filters?.role) {
      if (Array.isArray(filters.role)) {
        query = query.in('role', filters.role)
      } else {
        query = query.eq('role', filters.role)
      }
    }

    if (typeof filters?.is_primary_contact === 'boolean') {
      query = query.eq('is_primary_contact', filters.is_primary_contact)
    }

    // Default ordering
    query = query
      .order('last_name')
      .order('first_name')

    const { data, error } = await query
    if (error) throw error
    return data as ContactWithOrganization[]
  }

  async getContactsByOrganization(organizationId: string): Promise<ContactWithOrganization[]> {
    const { data, error } = await this.query()
      .select(this.selectFields)
      .eq('organization_id', organizationId)
      .is('deleted_at', null)
      .order('is_primary_contact', { ascending: false })
      .order('last_name')
      .order('first_name')

    if (error) throw error
    return data as ContactWithOrganization[]
  }

  async getPrimaryContacts(): Promise<ContactWithOrganization[]> {
    const { data, error } = await this.query()
      .select(this.selectFields)
      .eq('is_primary_contact', true)
      .is('deleted_at', null)
      .order('last_name')
      .order('first_name')

    if (error) throw error
    return data as ContactWithOrganization[]
  }

  async setPrimaryContact(contactId: string): Promise<ContactWithOrganization> {
    // Get the contact's organization
    const contact = await this.getById(contactId)
    
    // Clear existing primary contact for this organization
    await this.query()
      .update({ 
        is_primary_contact: false,
        updated_at: new Date().toISOString()
      })
      .eq('organization_id', contact.organization_id)

    // Set new primary contact
    const { data, error } = await this.query()
      .update({ 
        is_primary_contact: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', contactId)
      .select(this.selectFields)
      .single()

    if (error) throw error
    return data as ContactWithOrganization
  }

  async updatePreferredPrincipals(
    contactId: string, 
    principalIds: string[]
  ): Promise<void> {
    // Remove existing preferred principals
    await supabase
      .from('contact_preferred_principals')
      .delete()
      .eq('contact_id', contactId)

    // Add new preferred principals
    if (principalIds.length > 0) {
      const preferredPrincipals = principalIds.map(principalId => ({
        contact_id: contactId,
        principal_id: principalId
      }))

      const { error } = await supabase
        .from('contact_preferred_principals')
        .insert(preferredPrincipals)

      if (error) throw error
    }
  }
}

export const contactService = new ContactService()
```

### 2. API Layer Implementation

```typescript
// features/contacts/api/queries.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { BaseQueryKeys } from '@/shared/services/api/base.service'
import { contactService } from '../services/contactService'
import type { Contact, ContactFilters, ContactWithOrganization } from '../types'

export class ContactQueries extends BaseQueryKeys {
  constructor() {
    super('contacts')
  }

  byOrganization = (organizationId: string) => 
    [...this.all(), 'organization', organizationId] as const

  primary = () => 
    [...this.all(), 'primary'] as const

  withPreferredPrincipals = (contactId: string) =>
    [...this.detail(contactId), 'preferred-principals'] as const
}

export const contactQueries = new ContactQueries()

// Query hooks
export function useContacts(
  filters?: ContactFilters,
  options?: Omit<UseQueryOptions<ContactWithOrganization[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: contactQueries.list(filters),
    queryFn: () => contactService.getContactsWithOrganization(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options
  })
}

export function useContact(
  id: string,
  options?: Omit<UseQueryOptions<ContactWithOrganization>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: contactQueries.detail(id),
    queryFn: () => contactService.getById(id) as Promise<ContactWithOrganization>,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options
  })
}

export function useContactsByOrganization(
  organizationId: string,
  options?: Omit<UseQueryOptions<ContactWithOrganization[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: contactQueries.byOrganization(organizationId),
    queryFn: () => contactService.getContactsByOrganization(organizationId),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000,
    ...options
  })
}

export function usePrimaryContacts(
  options?: Omit<UseQueryOptions<ContactWithOrganization[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: contactQueries.primary(),
    queryFn: () => contactService.getPrimaryContacts(),
    staleTime: 5 * 60 * 1000,
    ...options
  })
}

// features/contacts/api/mutations.ts
import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import { contactService } from '../services/contactService'
import { contactQueries } from './queries'
import type { Contact, ContactInsert, ContactUpdate, ContactWithOrganization } from '../types'

// Mutation hooks
export function useCreateContact(
  options?: Omit<UseMutationOptions<ContactWithOrganization, Error, ContactInsert>, 'mutationFn'>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (contact: ContactInsert) => contactService.create(contact) as Promise<ContactWithOrganization>,
    onSuccess: (newContact) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: contactQueries.lists() })
      queryClient.invalidateQueries({ 
        queryKey: contactQueries.byOrganization(newContact.organization_id) 
      })
      queryClient.invalidateQueries({ queryKey: contactQueries.primary() })
      
      // Set the new contact in cache
      queryClient.setQueryData(contactQueries.detail(newContact.id), newContact)
      
      // Show success message
      toast.success(`Contact ${newContact.first_name} ${newContact.last_name} created successfully`)
    },
    onError: (error) => {
      toast.error(`Failed to create contact: ${error.message}`)
    },
    ...options
  })
}

export function useUpdateContact(
  options?: Omit<UseMutationOptions<ContactWithOrganization, Error, { id: string; updates: ContactUpdate }>, 'mutationFn'>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ContactUpdate }) =>
      contactService.update(id, updates) as Promise<ContactWithOrganization>,
    onSuccess: (updatedContact) => {
      // Update all related queries
      queryClient.invalidateQueries({ queryKey: contactQueries.lists() })
      queryClient.invalidateQueries({ 
        queryKey: contactQueries.byOrganization(updatedContact.organization_id) 
      })
      queryClient.invalidateQueries({ queryKey: contactQueries.primary() })
      
      // Update specific contact cache
      queryClient.setQueryData(contactQueries.detail(updatedContact.id), updatedContact)
      
      toast.success(`Contact ${updatedContact.first_name} ${updatedContact.last_name} updated successfully`)
    },
    onError: (error) => {
      toast.error(`Failed to update contact: ${error.message}`)
    },
    ...options
  })
}

export function useDeleteContact(
  options?: Omit<UseMutationOptions<ContactWithOrganization, Error, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => contactService.softDelete(id) as Promise<ContactWithOrganization>,
    onSuccess: (deletedContact) => {
      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: contactQueries.lists() })
      queryClient.invalidateQueries({ 
        queryKey: contactQueries.byOrganization(deletedContact.organization_id) 
      })
      queryClient.invalidateQueries({ queryKey: contactQueries.primary() })
      
      // Remove from individual cache
      queryClient.removeQueries({ queryKey: contactQueries.detail(deletedContact.id) })
      
      toast.success(`Contact ${deletedContact.first_name} ${deletedContact.last_name} deleted`)
    },
    onError: (error) => {
      toast.error(`Failed to delete contact: ${error.message}`)
    },
    ...options
  })
}

export function useSetPrimaryContact(
  options?: Omit<UseMutationOptions<ContactWithOrganization, Error, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (contactId: string) => contactService.setPrimaryContact(contactId),
    onSuccess: (primaryContact) => {
      // Invalidate organization contacts and primary contacts
      queryClient.invalidateQueries({ 
        queryKey: contactQueries.byOrganization(primaryContact.organization_id) 
      })
      queryClient.invalidateQueries({ queryKey: contactQueries.primary() })
      
      toast.success(`${primaryContact.first_name} ${primaryContact.last_name} set as primary contact`)
    },
    onError: (error) => {
      toast.error(`Failed to set primary contact: ${error.message}`)
    },
    ...options
  })
}

// features/contacts/api/index.ts
export * from './queries'
export * from './mutations'
```

### 3. Types Implementation

```typescript
// features/contacts/types/contact.types.ts
import type { Database } from '@/shared/types/database.types'

// Base contact types from database
export type Contact = Database['public']['Tables']['contacts']['Row']
export type ContactInsert = Database['public']['Tables']['contacts']['Insert']  
export type ContactUpdate = Database['public']['Tables']['contacts']['Update']

// Extended types with relationships
export type ContactWithOrganization = Contact & {
  organization: Database['public']['Tables']['organizations']['Row']
}

export type ContactWithPreferredPrincipals = Contact & {
  organization: Database['public']['Tables']['organizations']['Row']
  preferred_principals: Array<{
    id: string
    principal: Database['public']['Tables']['organizations']['Row']
  }>
}

export type ContactWithRelations = Contact & {
  organization: Database['public']['Tables']['organizations']['Row']
  opportunities: Database['public']['Tables']['opportunities']['Row'][]
  interactions: Database['public']['Tables']['interactions']['Row'][]
  preferred_principals: Array<{
    id: string
    principal: Database['public']['Tables']['organizations']['Row']
  }>
}

// Enum types
export type PurchaseInfluenceLevel = Database['public']['Enums']['purchase_influence_level']
export type DecisionAuthorityRole = Database['public']['Enums']['decision_authority_role']

// Filter types
export interface ContactFilters {
  organization_id?: string
  role?: PurchaseInfluenceLevel | PurchaseInfluenceLevel[]
  is_primary_contact?: boolean
  search?: string
  limit?: number
  offset?: number
  order_by?: keyof Contact
  order_direction?: 'asc' | 'desc'
  include_deleted?: boolean
}

// Common contact positions for form dropdown
export const CONTACT_POSITIONS = [
  'Owner/Operator',
  'General Manager', 
  'Kitchen Manager',
  'Chef/Head Chef',
  'Food Service Director',
  'Purchasing Manager',
  'Operations Manager',
  'Assistant Manager',
  'Other'
] as const

export type ContactPosition = typeof CONTACT_POSITIONS[number]

// features/contacts/types/contact-form.types.ts
export interface ContactFormData {
  first_name: string
  last_name: string
  title?: string
  position: string
  custom_position?: string
  organization_id: string
  purchase_influence: PurchaseInfluenceLevel
  decision_authority: DecisionAuthorityRole
  email?: string
  phone?: string
  mobile_phone?: string
  department?: string
  is_primary_contact: boolean
  notes?: string
  preferred_principals: string[]
}

export interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void
  initialData?: Partial<ContactFormData>
  loading?: boolean
  submitLabel?: string
  preselectedOrganization?: string
}

// features/contacts/types/index.ts
export * from './contact.types'
export * from './contact-form.types'
```

### 4. Schema Implementation

```typescript
// features/contacts/schemas/contact.schema.ts
import * as yup from 'yup'
import { CONTACT_POSITIONS } from '../types'

export const contactSchema = yup.object({
  first_name: yup
    .string()
    .required('First name is required')
    .max(50, 'First name must be less than 50 characters'),
    
  last_name: yup
    .string()
    .required('Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
    
  title: yup
    .string()
    .max(100, 'Title must be less than 100 characters'),
    
  position: yup
    .string()
    .required('Position is required')
    .oneOf([...CONTACT_POSITIONS] as string[], 'Please select a valid position'),
    
  custom_position: yup
    .string()
    .when('position', {
      is: 'Other',
      then: (schema) => schema.required('Please specify the position'),
      otherwise: (schema) => schema.notRequired()
    })
    .max(100, 'Custom position must be less than 100 characters'),
    
  organization_id: yup
    .string()
    .uuid('Invalid organization ID')
    .required('Organization is required'),
    
  purchase_influence: yup
    .string()
    .oneOf(['None', 'Low', 'Medium', 'High', 'Unknown'], 'Invalid purchase influence level')
    .required('Purchase influence is required'),
    
  decision_authority: yup
    .string()
    .oneOf(['Gatekeeper', 'Influencer', 'Decision Maker', 'Economic Buyer'], 'Invalid decision authority role')
    .required('Decision authority is required'),
    
  email: yup
    .string()
    .email('Invalid email format')
    .max(100, 'Email must be less than 100 characters'),
    
  phone: yup
    .string()
    .matches(/^[\d\s\-\(\)\+\.ext]*$/, 'Invalid phone number format')
    .max(20, 'Phone number must be less than 20 characters'),
    
  mobile_phone: yup
    .string()
    .matches(/^[\d\s\-\(\)\+\.ext]*$/, 'Invalid mobile phone number format')
    .max(20, 'Mobile phone number must be less than 20 characters'),
    
  department: yup
    .string()
    .max(100, 'Department must be less than 100 characters'),
    
  is_primary_contact: yup
    .boolean()
    .default(false),
    
  notes: yup
    .string()
    .max(1000, 'Notes must be less than 1000 characters'),
    
  preferred_principals: yup
    .array()
    .of(yup.string().uuid('Invalid principal ID'))
    .default([])
})

export type ContactFormData = yup.InferType<typeof contactSchema>

// Validation schemas for different scenarios
export const contactCreateSchema = contactSchema
export const contactUpdateSchema = contactSchema.partial()

// Quick contact schema (minimal fields)
export const quickContactSchema = yup.object({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  organization_id: yup.string().uuid().required('Organization is required'),
  email: yup.string().email('Invalid email format'),
  position: yup.string().required('Position is required')
})

export type QuickContactFormData = yup.InferType<typeof quickContactSchema>

// features/contacts/schemas/index.ts
export * from './contact.schema'
```

### 5. Component Implementation

```typescript
// features/contacts/components/ContactForm/ContactForm.tsx
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { CoreFormLayout, EntitySelect, FormFieldWrapper, ProgressiveDetails } from '@/shared/components/forms'
import { Button, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Checkbox } from '@/shared/components/ui'
import { useOrganizations } from '@/features/organizations'
import { contactSchema, CONTACT_POSITIONS } from '../../schemas'
import { PreferredPrincipalsSelect } from './PreferredPrincipalsSelect'
import type { ContactFormData, ContactFormProps } from '../../types'

export function ContactForm({ 
  onSubmit, 
  initialData, 
  loading = false,
  submitLabel = 'Save Contact',
  preselectedOrganization
}: ContactFormProps) {
  const { data: organizations = [], isLoading: organizationsLoading } = useOrganizations()
  
  const form = useForm<ContactFormData>({
    resolver: yupResolver(contactSchema),
    defaultValues: {
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || '',
      title: initialData?.title || '',
      position: initialData?.position || '',
      custom_position: initialData?.custom_position || '',
      organization_id: preselectedOrganization || initialData?.organization_id || '',
      purchase_influence: initialData?.purchase_influence || 'Unknown',
      decision_authority: initialData?.decision_authority || 'Gatekeeper',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      mobile_phone: initialData?.mobile_phone || '',
      department: initialData?.department || '',
      is_primary_contact: initialData?.is_primary_contact || false,
      notes: initialData?.notes || '',
      preferred_principals: initialData?.preferred_principals || []
    }
  })

  const watchedPosition = form.watch('position')

  const handleSubmit = (data: ContactFormData) => {
    onSubmit(data)
  }

  return (
    <CoreFormLayout
      title={initialData ? 'Edit Contact' : 'New Contact'}
      description="Enter contact information and role details"
      actions={
        <div className="flex space-x-2">
          <Button type="button" variant="outline" disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            loading={loading}
            onClick={form.handleSubmit(handleSubmit)}
          >
            {submitLabel}
          </Button>
        </div>
      }
    >
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormFieldWrapper
            control={form.control}
            name="first_name"
            label="First Name"
            required
          >
            <Input placeholder="Enter first name" {...form.register('first_name')} />
          </FormFieldWrapper>

          <FormFieldWrapper
            control={form.control}
            name="last_name"
            label="Last Name"
            required
          >
            <Input placeholder="Enter last name" {...form.register('last_name')} />
          </FormFieldWrapper>
        </div>

        <FormFieldWrapper
          control={form.control}
          name="title"
          label="Job Title"
        >
          <Input placeholder="Enter job title" {...form.register('title')} />
        </FormFieldWrapper>

        {/* Organization Selection */}
        <FormFieldWrapper
          control={form.control}
          name="organization_id"
          label="Organization"
          required
        >
          <EntitySelect
            entities={organizations.map(org => ({
              id: org.id,
              name: org.name,
              description: `${org.city}, ${org.state}`
            }))}
            placeholder="Select organization"
            loading={organizationsLoading}
            value={form.watch('organization_id')}
            onValueChange={(value) => form.setValue('organization_id', value)}
          />
        </FormFieldWrapper>

        {/* Position Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormFieldWrapper
            control={form.control}
            name="position"
            label="Position"
            required
          >
            <Select
              value={form.watch('position')}
              onValueChange={(value) => form.setValue('position', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_POSITIONS.map((position) => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormFieldWrapper>

          {watchedPosition === 'Other' && (
            <FormFieldWrapper
              control={form.control}
              name="custom_position"
              label="Specify Position"
              required
            >
              <Input placeholder="Enter specific position" {...form.register('custom_position')} />
            </FormFieldWrapper>
          )}
        </div>

        {/* Role & Influence */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormFieldWrapper
            control={form.control}
            name="purchase_influence"
            label="Purchase Influence"
            required
          >
            <Select
              value={form.watch('purchase_influence')}
              onValueChange={(value) => form.setValue('purchase_influence', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select influence level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </FormFieldWrapper>

          <FormFieldWrapper
            control={form.control}
            name="decision_authority"
            label="Decision Authority"
            required
          >
            <Select
              value={form.watch('decision_authority')}
              onValueChange={(value) => form.setValue('decision_authority', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select decision role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Gatekeeper">Gatekeeper</SelectItem>
                <SelectItem value="Influencer">Influencer</SelectItem>
                <SelectItem value="Decision Maker">Decision Maker</SelectItem>
                <SelectItem value="Economic Buyer">Economic Buyer</SelectItem>
              </SelectContent>
            </Select>
          </FormFieldWrapper>
        </div>

        {/* Progressive Details */}
        <ProgressiveDetails title="Contact Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormFieldWrapper
              control={form.control}
              name="email"
              label="Email"
            >
              <Input type="email" placeholder="Enter email address" {...form.register('email')} />
            </FormFieldWrapper>

            <FormFieldWrapper
              control={form.control}
              name="phone"
              label="Phone"
            >
              <Input placeholder="Enter phone number" {...form.register('phone')} />
            </FormFieldWrapper>

            <FormFieldWrapper
              control={form.control}
              name="mobile_phone"
              label="Mobile Phone"
            >
              <Input placeholder="Enter mobile number" {...form.register('mobile_phone')} />
            </FormFieldWrapper>

            <FormFieldWrapper
              control={form.control}
              name="department"
              label="Department"
            >
              <Input placeholder="Enter department" {...form.register('department')} />
            </FormFieldWrapper>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_primary_contact"
              checked={form.watch('is_primary_contact')}
              onCheckedChange={(checked) => form.setValue('is_primary_contact', checked as boolean)}
            />
            <label
              htmlFor="is_primary_contact"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Set as primary contact for this organization
            </label>
          </div>
        </ProgressiveDetails>

        {/* Preferred Principals */}
        <ProgressiveDetails title="Preferred Principals">
          <FormFieldWrapper
            control={form.control}
            name="preferred_principals"
            label="Select Preferred Principals"
            description="Choose which principals this contact prefers to work with"
          >
            <PreferredPrincipalsSelect
              selectedPrincipals={form.watch('preferred_principals')}
              onSelectionChange={(principals) => form.setValue('preferred_principals', principals)}
            />
          </FormFieldWrapper>
        </ProgressiveDetails>

        {/* Notes */}
        <ProgressiveDetails title="Additional Notes">
          <FormFieldWrapper
            control={form.control}
            name="notes"
            label="Notes"
          >
            <Textarea 
              placeholder="Enter any additional notes about this contact"
              rows={4}
              {...form.register('notes')}
            />
          </FormFieldWrapper>
        </ProgressiveDetails>
      </form>
    </CoreFormLayout>
  )
}

// features/contacts/components/ContactForm/index.ts
export { ContactForm } from './ContactForm'
export type { ContactFormProps } from './ContactForm'
```

### 6. Feature Public API

```typescript
// features/contacts/index.ts
// Public API for the contacts feature
// This is the single entry point for other parts of the application

// API exports
export {
  useContacts,
  useContact,
  useContactsByOrganization,
  usePrimaryContacts,
  useCreateContact,
  useUpdateContact,
  useDeleteContact,
  useSetPrimaryContact,
  contactQueries
} from './api'

// Component exports
export { ContactForm } from './components/ContactForm'
export { ContactsTable } from './components/ContactsTable'
export { ContactCard } from './components/ContactCard'
export { PreferredPrincipalsSelect } from './components/PreferredPrincipalsSelect'

// Type exports
export type {
  Contact,
  ContactInsert,
  ContactUpdate,
  ContactWithOrganization,
  ContactWithPreferredPrincipals,
  ContactWithRelations,
  ContactFilters,
  ContactFormData,
  ContactFormProps,
  PurchaseInfluenceLevel,
  DecisionAuthorityRole,
  ContactPosition
} from './types'

// Schema exports
export {
  contactSchema,
  contactCreateSchema,
  contactUpdateSchema,
  quickContactSchema,
  CONTACT_POSITIONS
} from './schemas'

// Service exports (typically not exposed, but available for advanced use cases)
export { contactService } from './services/contactService'
```

## Usage Examples

### 1. Using the Contacts Feature in a Page

```typescript
// app/pages/Contacts/ContactsPage.tsx
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui'
import { Layout } from '@/shared/components/layout'
import { DataTable, SearchableList } from '@/shared/components/data-display'
import { 
  useContacts, 
  useCreateContact,
  useUpdateContact,
  useDeleteContact,
  ContactForm,
  ContactsTable,
  type ContactFormData 
} from '@/features/contacts'

export function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingContact, setEditingContact] = useState<string | null>(null)

  // Queries
  const { data: contacts = [], isLoading } = useContacts({ 
    search: searchQuery || undefined 
  })

  // Mutations
  const createContact = useCreateContact({
    onSuccess: () => setShowCreateForm(false)
  })
  
  const updateContact = useUpdateContact({
    onSuccess: () => setEditingContact(null)
  })
  
  const deleteContact = useDeleteContact()

  const handleCreateContact = (data: ContactFormData) => {
    createContact.mutate(data)
  }

  const handleUpdateContact = (data: ContactFormData) => {
    if (editingContact) {
      updateContact.mutate({ id: editingContact, updates: data })
    }
  }

  const handleDeleteContact = (id: string) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      deleteContact.mutate(id)
    }
  }

  if (showCreateForm) {
    return (
      <Layout title="New Contact">
        <ContactForm
          onSubmit={handleCreateContact}
          loading={createContact.isPending}
          submitLabel="Create Contact"
        />
      </Layout>
    )
  }

  if (editingContact) {
    const contact = contacts.find(c => c.id === editingContact)
    return (
      <Layout title="Edit Contact">
        <ContactForm
          onSubmit={handleUpdateContact}
          initialData={contact}
          loading={updateContact.isPending}
          submitLabel="Update Contact"
        />
      </Layout>
    )
  }

  return (
    <Layout title="Contacts">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Contacts</h1>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Contact
          </Button>
        </div>

        {/* Contacts Table */}
        <ContactsTable
          contacts={contacts}
          loading={isLoading}
          onSearch={setSearchQuery}
          onEdit={(contact) => setEditingContact(contact.id)}
          onDelete={handleDeleteContact}
        />
      </div>
    </Layout>
  )
}
```

### 2. Cross-Feature Integration

```typescript
// features/opportunities/components/OpportunityForm/OpportunityForm.tsx
import { EntitySelect } from '@/shared/components/forms'
import { useOrganizations } from '@/features/organizations'
import { useContactsByOrganization } from '@/features/contacts'
import { useProducts } from '@/features/products'

export function OpportunityForm({ onSubmit, initialData }: OpportunityFormProps) {
  const [selectedOrganization, setSelectedOrganization] = useState('')
  
  // Cross-feature data fetching
  const { data: organizations = [] } = useOrganizations()
  const { data: contacts = [] } = useContactsByOrganization(selectedOrganization)
  const { data: products = [] } = useProducts()

  return (
    <CoreFormLayout title="Create Opportunity">
      {/* Organization Selection */}
      <FormFieldWrapper
        control={form.control}
        name="organization_id"
        label="Organization"
        required
      >
        <EntitySelect
          entities={organizations.map(org => ({
            id: org.id,
            name: org.name,
            description: `${org.city}, ${org.state}`
          }))}
          placeholder="Select organization"
          onValueChange={setSelectedOrganization}
        />
      </FormFieldWrapper>

      {/* Contact Selection (filtered by organization) */}
      {selectedOrganization && (
        <FormFieldWrapper
          control={form.control}
          name="contact_id"
          label="Primary Contact"
          required
        >
          <EntitySelect
            entities={contacts.map(contact => ({
              id: contact.id,
              name: `${contact.first_name} ${contact.last_name}`,
              description: contact.title || contact.position
            }))}
            placeholder="Select contact"
          />
        </FormFieldWrapper>
      )}

      {/* Product Selection */}
      <FormFieldWrapper
        control={form.control}
        name="product_ids"
        label="Products"
        required
      >
        <EntitySelect
          entities={products.map(product => ({
            id: product.id,
            name: product.name,
            description: product.category
          }))}
          placeholder="Select products"
        />
      </FormFieldWrapper>
    </CoreFormLayout>
  )
}
```

## Best Practices Summary

### 1. Service Layer Best Practices
- Extend `BaseService` for consistent patterns
- Implement feature-specific methods for complex operations
- Use proper error handling and type safety
- Keep service methods focused and single-purpose

### 2. API Layer Best Practices
- Use `BaseQueryKeys` for consistent query key patterns
- Implement proper React Query configuration
- Handle loading states and errors appropriately
- Provide optimistic updates where appropriate

### 3. Component Best Practices
- Use shared components from `@/shared/components`
- Implement proper TypeScript interfaces
- Handle loading and error states
- Follow accessibility guidelines
- Use proper form validation with schemas

### 4. Type Safety Best Practices
- Define types at the feature level
- Export types through feature public API
- Use schema-first validation approach
- Maintain type consistency across layers

### 5. Performance Best Practices
- Use React Query for efficient data fetching
- Implement proper cache invalidation
- Use lazy loading for feature modules
- Optimize bundle size with proper exports

This implementation provides a complete, production-ready example that can be replicated across all CRM features, ensuring consistency, maintainability, and scalability.