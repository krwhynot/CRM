# API Service Layer Architecture

## Overview

The API Service Layer provides a consistent abstraction over Supabase operations, offering type-safe, reusable patterns for all CRUD operations across the CRM system.

## Core Components

### Base Service Class

The foundation service class that all entity services extend:

```typescript
// shared/services/api/base.service.ts
import { supabase } from '@/shared/lib/supabase'
import type { Database } from '@/shared/types/database.types'
import type { 
  PostgrestFilterBuilder,
  PostgrestQueryBuilder,
  PostgrestSingleResponse 
} from '@supabase/postgrest-js'

export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
  created_by: string
  updated_by: string
}

export interface EntityFilters {
  search?: string
  limit?: number
  offset?: number
  order_by?: string
  order_direction?: 'asc' | 'desc'
  include_deleted?: boolean
}

export interface PaginationOptions {
  page?: number
  per_page?: number
}

export interface ServiceResponse<T> {
  data: T
  count?: number
  error?: string
}

export abstract class BaseService<
  Entity extends BaseEntity,
  InsertEntity = Omit<Entity, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>,
  UpdateEntity = Partial<Omit<Entity, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>>,
  EntityFilters extends EntityFilters = EntityFilters
> {
  constructor(
    protected tableName: keyof Database['public']['Tables'],
    protected selectFields: string = '*'
  ) {}

  // Base query builder
  protected query() {
    return supabase.from(this.tableName)
  }

  // Apply common filters
  protected applyFilters(
    query: PostgrestFilterBuilder<any, any, any>,
    filters?: EntityFilters
  ) {
    if (!filters) return query

    // Soft delete filter
    if (!filters.include_deleted) {
      query = query.is('deleted_at', null)
    }

    // Search filter (override in subclasses)
    if (filters.search) {
      query = this.applySearchFilter(query, filters.search)
    }

    // Ordering
    if (filters.order_by) {
      query = query.order(filters.order_by, { 
        ascending: filters.order_direction !== 'desc' 
      })
    }

    // Pagination
    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    return query
  }

  // Override in subclasses for specific search logic
  protected applySearchFilter(
    query: PostgrestFilterBuilder<any, any, any>,
    search: string
  ) {
    // Default implementation - override in subclasses
    return query
  }

  // Apply pagination with count
  protected async applyPagination<T>(
    query: PostgrestQueryBuilder<any, any, T>,
    options?: PaginationOptions
  ): Promise<ServiceResponse<T[]>> {
    const page = options?.page || 1
    const perPage = options?.per_page || 10
    const start = (page - 1) * perPage
    const end = start + perPage - 1

    const { data, error, count } = await query
      .range(start, end)
      .select('*', { count: 'exact' })

    if (error) throw error

    return {
      data: data || [],
      count: count || 0
    }
  }

  // Standard CRUD operations
  async getAll(filters?: EntityFilters): Promise<Entity[]> {
    const query = this.query().select(this.selectFields)
    const filteredQuery = this.applyFilters(query, filters)
    
    const { data, error } = await filteredQuery
    if (error) throw error
    return data as Entity[]
  }

  async getAllPaginated(
    filters?: EntityFilters,
    pagination?: PaginationOptions
  ): Promise<ServiceResponse<Entity[]>> {
    const query = this.query().select(this.selectFields)
    const filteredQuery = this.applyFilters(query, filters)
    
    return this.applyPagination(filteredQuery, pagination)
  }

  async getById(id: string): Promise<Entity> {
    const { data, error } = await this.query()
      .select(this.selectFields)
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) throw error
    return data as Entity
  }

  async create(entity: InsertEntity): Promise<Entity> {
    // Get current user for audit fields
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Authentication required')
    }

    const entityData = {
      ...entity,
      created_by: user.id,
      updated_by: user.id,
    }

    const { data, error } = await this.query()
      .insert(entityData)
      .select(this.selectFields)
      .single()

    if (error) throw error
    return data as Entity
  }

  async update(id: string, updates: UpdateEntity): Promise<Entity> {
    const { data, error } = await this.query()
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(this.selectFields)
      .single()

    if (error) throw error
    return data as Entity
  }

  async softDelete(id: string): Promise<Entity> {
    const { data, error } = await this.query()
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(this.selectFields)
      .single()

    if (error) throw error
    return data as Entity
  }

  async restore(id: string): Promise<Entity> {
    const { data, error } = await this.query()
      .update({
        deleted_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(this.selectFields)
      .single()

    if (error) throw error
    return data as Entity
  }

  async hardDelete(id: string): Promise<void> {
    const { error } = await this.query().delete().eq('id', id)
    if (error) throw error
  }

  // Batch operations
  async createMany(entities: InsertEntity[]): Promise<Entity[]> {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('Authentication required')
    }

    const entitiesData = entities.map(entity => ({
      ...entity,
      created_by: user.id,
      updated_by: user.id,
    }))

    const { data, error } = await this.query()
      .insert(entitiesData)
      .select(this.selectFields)

    if (error) throw error
    return data as Entity[]
  }

  async updateMany(ids: string[], updates: UpdateEntity): Promise<Entity[]> {
    const { data, error } = await this.query()
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .in('id', ids)
      .select(this.selectFields)

    if (error) throw error
    return data as Entity[]
  }

  async softDeleteMany(ids: string[]): Promise<Entity[]> {
    const { data, error } = await this.query()
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .in('id', ids)
      .select(this.selectFields)

    if (error) throw error
    return data as Entity[]
  }

  // Utility methods
  async exists(id: string): Promise<boolean> {
    const { data, error } = await this.query()
      .select('id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    return !error && !!data
  }

  async count(filters?: EntityFilters): Promise<number> {
    const query = this.query().select('*', { count: 'exact', head: true })
    const filteredQuery = this.applyFilters(query, filters)
    
    const { count, error } = await filteredQuery
    if (error) throw error
    return count || 0
  }
}

// Query key factory base
export abstract class BaseQueryKeys {
  constructor(protected entityName: string) {}

  all = () => [this.entityName] as const
  lists = () => [...this.all(), 'list'] as const
  list = (filters?: any) => [...this.lists(), { filters }] as const
  details = () => [...this.all(), 'detail'] as const
  detail = (id: string) => [...this.details(), id] as const
}
```

### Entity-Specific Service Implementation

Example Contact Service implementation:

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
      organization:organizations(*)
    `)
  }

  protected applySearchFilter(query: any, search: string) {
    return query.or(
      `first_name.ilike.%${search}%,` +
      `last_name.ilike.%${search}%,` +
      `title.ilike.%${search}%,` +
      `email.ilike.%${search}%`
    )
  }

  async getContactsWithOrganization(filters?: ContactFilters): Promise<ContactWithOrganization[]> {
    return this.getAll(filters) as Promise<ContactWithOrganization[]>
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
    
    // Clear existing primary contact
    await this.query()
      .update({ 
        is_primary_contact: false,
        updated_at: new Date().toISOString()
      })
      .eq('organization_id', contact.organization_id)

    // Set new primary contact
    return this.update(contactId, { is_primary_contact: true })
  }
}

export const contactService = new ContactService()
```

### React Query Integration

Query hooks that use the service layer:

```typescript
// features/contacts/api/queries.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query'
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
}

export const contactQueries = new ContactQueries()

export function useContacts(
  filters?: ContactFilters,
  options?: UseQueryOptions<ContactWithOrganization[]>
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
  options?: UseQueryOptions<ContactWithOrganization>
) {
  return useQuery({
    queryKey: contactQueries.detail(id),
    queryFn: () => contactService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options
  })
}

export function useContactsByOrganization(
  organizationId: string,
  options?: UseQueryOptions<ContactWithOrganization[]>
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
  options?: UseQueryOptions<ContactWithOrganization[]>
) {
  return useQuery({
    queryKey: contactQueries.primary(),
    queryFn: () => contactService.getPrimaryContacts(),
    staleTime: 5 * 60 * 1000,
    ...options
  })
}
```

### Mutation Hooks

Mutation hooks for CUD operations:

```typescript
// features/contacts/api/mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { contactService } from '../services/contactService'
import { contactQueries } from './queries'
import type { Contact, ContactInsert, ContactUpdate } from '../types'

export function useCreateContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (contact: ContactInsert) => contactService.create(contact),
    onSuccess: (newContact) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: contactQueries.lists() })
      queryClient.invalidateQueries({ 
        queryKey: contactQueries.byOrganization(newContact.organization_id) 
      })
      queryClient.invalidateQueries({ queryKey: contactQueries.primary() })
      
      // Set the new contact in cache
      queryClient.setQueryData(
        contactQueries.detail(newContact.id), 
        newContact
      )
    },
  })
}

export function useUpdateContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ContactUpdate }) =>
      contactService.update(id, updates),
    onSuccess: (updatedContact) => {
      // Update all related queries
      queryClient.invalidateQueries({ queryKey: contactQueries.lists() })
      queryClient.invalidateQueries({ 
        queryKey: contactQueries.byOrganization(updatedContact.organization_id) 
      })
      queryClient.invalidateQueries({ queryKey: contactQueries.primary() })
      
      // Update specific contact cache
      queryClient.setQueryData(
        contactQueries.detail(updatedContact.id), 
        updatedContact
      )
    },
  })
}

export function useDeleteContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => contactService.softDelete(id),
    onSuccess: (deletedContact) => {
      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: contactQueries.lists() })
      queryClient.invalidateQueries({ 
        queryKey: contactQueries.byOrganization(deletedContact.organization_id) 
      })
      queryClient.invalidateQueries({ queryKey: contactQueries.primary() })
      
      // Remove from individual cache
      queryClient.removeQueries({ 
        queryKey: contactQueries.detail(deletedContact.id) 
      })
    },
  })
}

export function useSetPrimaryContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (contactId: string) => 
      contactService.setPrimaryContact(contactId),
    onSuccess: (primaryContact) => {
      // Invalidate organization contacts
      queryClient.invalidateQueries({ 
        queryKey: contactQueries.byOrganization(primaryContact.organization_id) 
      })
      queryClient.invalidateQueries({ queryKey: contactQueries.primary() })
    },
  })
}
```

## Benefits

1. **Consistent API**: All entities follow the same service patterns
2. **Type Safety**: Full TypeScript support with generic constraints
3. **DRY Principle**: Common CRUD operations abstracted to base class
4. **React Query Integration**: Optimized caching and synchronization
5. **Error Handling**: Centralized error handling patterns
6. **Audit Trail**: Automatic audit field management
7. **Soft Deletes**: Built-in soft delete support
8. **Pagination**: Consistent pagination patterns
9. **Search**: Standardized search implementations
10. **Testing**: Easy to mock and test service layers

## Usage Example

```typescript
// In a component
import { useContacts, useCreateContact } from '@/features/contacts'

function ContactsPage() {
  const { data: contacts, isLoading } = useContacts({ search: 'john' })
  const createContact = useCreateContact()

  const handleCreate = (contactData) => {
    createContact.mutate(contactData)
  }

  return (
    <div>
      {isLoading ? 'Loading...' : contacts?.map(contact => ...)}
    </div>
  )
}
```