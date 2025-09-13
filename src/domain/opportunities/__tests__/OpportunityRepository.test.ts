import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OpportunityRepository } from '../OpportunityRepository'
import type { OpportunityDomain } from '../OpportunityTypes'

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(),
}

// Mock the supabase import
vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabaseClient,
}))

// Mock database types (simplified for testing)
type MockDatabaseOpportunity = {
  id: string
  created_at: string
  updated_at: string
  name: string
  organization_id: string
  contact_id: string | null
  principal_organization_id: string | null
  stage: string
  status: string
  estimated_value: number
  close_date: string | null
  notes: string | null
  context: string | null
  stage_updated_at: string | null
  deleted: boolean
}

describe('OpportunityRepository', () => {
  let repository: OpportunityRepository
  let mockQueryBuilder: any

  beforeEach(() => {
    repository = new OpportunityRepository()

    // Reset all mocks
    vi.clearAllMocks()

    // Setup mock query builder chain
    mockQueryBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      single: vi.fn(),
      // For counting
      head: true,
    }

    mockSupabaseClient.from.mockReturnValue(mockQueryBuilder)
  })

  describe('findById', () => {
    const mockDbOpportunity: MockDatabaseOpportunity = {
      id: 'opp-123',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      name: 'Test Opportunity',
      organization_id: 'org-456',
      contact_id: 'contact-789',
      principal_organization_id: 'principal-101',
      stage: 'New Lead',
      status: 'Active',
      estimated_value: 50000,
      close_date: '2023-12-31T00:00:00Z',
      notes: 'Test notes',
      context: 'Site Visit',
      stage_updated_at: '2023-01-01T00:00:00Z',
      deleted: false,
    }

    it('should find opportunity by ID successfully', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: mockDbOpportunity,
        error: null,
      })

      const result = await repository.findById('opp-123')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('opportunities')
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*')
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'opp-123')
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('deleted', false)
      expect(mockQueryBuilder.single).toHaveBeenCalled()

      expect(result).toBeDefined()
      expect(result!.id).toBe('opp-123')
      expect(result!.name).toBe('Test Opportunity')
      expect(result!.organization_id).toBe('org-456')
      expect(result!.contact_id).toBe('contact-789')
      expect(result!.principal_organization_id).toBe('principal-101')
      expect(result!.stage).toBe('New Lead')
      expect(result!.status).toBe('Active')
      expect(result!.estimated_value).toBe(50000)
      expect(result!.close_date).toBe('2023-12-31T00:00:00Z')
      expect(result!.notes).toBe('Test notes')
      expect(result!.context).toBe('Site Visit')
      expect(result!.stage_updated_at).toBe('2023-01-01T00:00:00Z')
    })

    it('should return null when opportunity not found', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      })

      const result = await repository.findById('non-existent')

      expect(result).toBeNull()
    })

    it('should return null when data is null', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: null,
      })

      const result = await repository.findById('opp-123')

      expect(result).toBeNull()
    })

    it('should handle null values in database fields', async () => {
      const mockDbOpportunityWithNulls: MockDatabaseOpportunity = {
        ...mockDbOpportunity,
        contact_id: null,
        principal_organization_id: null,
        close_date: null,
        notes: null,
        context: null,
        stage_updated_at: null,
      }

      mockQueryBuilder.single.mockResolvedValue({
        data: mockDbOpportunityWithNulls,
        error: null,
      })

      const result = await repository.findById('opp-123')

      expect(result!.contact_id).toBeNull()
      expect(result!.principal_organization_id).toBeNull()
      expect(result!.close_date).toBeNull()
      expect(result!.notes).toBeNull()
      expect(result!.context).toBeNull()
      expect(result!.stage_updated_at).toBeNull()
    })
  })

  describe('findAll', () => {
    const mockOpportunities: MockDatabaseOpportunity[] = [
      {
        id: 'opp-1',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        name: 'Opportunity 1',
        organization_id: 'org-1',
        contact_id: null,
        principal_organization_id: null,
        stage: 'New Lead',
        status: 'Active',
        estimated_value: 25000,
        close_date: null,
        notes: null,
        context: null,
        stage_updated_at: null,
        deleted: false,
      },
      {
        id: 'opp-2',
        created_at: '2023-01-02T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z',
        name: 'Opportunity 2',
        organization_id: 'org-2',
        contact_id: 'contact-1',
        principal_organization_id: 'principal-1',
        stage: 'Demo Scheduled',
        status: 'Qualified',
        estimated_value: 75000,
        close_date: '2023-12-31T00:00:00Z',
        notes: 'Important client',
        context: 'Food Show',
        stage_updated_at: '2023-01-02T00:00:00Z',
        deleted: false,
      },
    ]

    it('should find all non-deleted opportunities ordered by created_at desc', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: mockOpportunities,
        error: null,
      })

      const result = await repository.findAll()

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('opportunities')
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*')
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('deleted', false)
      expect(mockQueryBuilder.order).toHaveBeenCalledWith('created_at', { ascending: false })

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('opp-1')
      expect(result[1].id).toBe('opp-2')
    })

    it('should handle database errors', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      })

      await expect(repository.findAll()).rejects.toThrow(
        'Failed to fetch opportunities: Database connection failed'
      )
    })

    it('should handle empty results', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: [],
        error: null,
      })

      const result = await repository.findAll()

      expect(result).toEqual([])
    })
  })

  describe('create', () => {
    const createData = {
      name: 'New Opportunity',
      organization_id: 'org-123',
      contact_id: 'contact-456',
      principal_organization_id: 'principal-789',
      stage: 'New Lead' as const,
      status: 'Active' as const,
      estimated_value: 50000,
      close_date: '2023-12-31T00:00:00Z',
      notes: 'Test notes',
      context: 'Site Visit' as const,
      stage_updated_at: '2023-01-01T00:00:00Z',
    }

    const mockCreatedOpportunity: MockDatabaseOpportunity = {
      id: 'opp-new',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      deleted: false,
      ...createData,
    }

    it('should create opportunity successfully', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: mockCreatedOpportunity,
        error: null,
      })

      const result = await repository.create(createData)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('opportunities')
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith({
        name: 'New Opportunity',
        organization_id: 'org-123',
        contact_id: 'contact-456',
        principal_organization_id: 'principal-789',
        stage: 'New Lead',
        status: 'Active',
        estimated_value: 50000,
        close_date: '2023-12-31T00:00:00Z',
        notes: 'Test notes',
        context: 'Site Visit',
        stage_updated_at: '2023-01-01T00:00:00Z',
      })
      expect(mockQueryBuilder.select).toHaveBeenCalled()
      expect(mockQueryBuilder.single).toHaveBeenCalled()

      expect(result.id).toBe('opp-new')
      expect(result.name).toBe('New Opportunity')
      expect(result.organization_id).toBe('org-123')
    })

    it('should handle create with null optional fields', async () => {
      const minimalCreateData = {
        name: 'Minimal Opportunity',
        organization_id: 'org-123',
        contact_id: null,
        principal_organization_id: null,
        stage: 'New Lead' as const,
        status: 'Active' as const,
        estimated_value: 25000,
        close_date: null,
        notes: null,
        context: null,
        stage_updated_at: null,
      }

      const mockCreatedMinimal = {
        ...mockCreatedOpportunity,
        ...minimalCreateData,
      }

      mockQueryBuilder.single.mockResolvedValue({
        data: mockCreatedMinimal,
        error: null,
      })

      const result = await repository.create(minimalCreateData)

      expect(result.contact_id).toBeNull()
      expect(result.principal_organization_id).toBeNull()
      expect(result.close_date).toBeNull()
      expect(result.notes).toBeNull()
      expect(result.context).toBeNull()
      expect(result.stage_updated_at).toBeNull()
    })

    it('should handle database errors during create', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'Unique constraint violation' },
      })

      await expect(repository.create(createData)).rejects.toThrow(
        'Failed to create opportunity: Unique constraint violation'
      )
    })
  })

  describe('update', () => {
    const existingOpportunity: OpportunityDomain = {
      id: 'opp-123',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      name: 'Updated Opportunity',
      organization_id: 'org-456',
      contact_id: 'contact-789',
      principal_organization_id: 'principal-101',
      stage: 'Initial Outreach',
      status: 'Active',
      estimated_value: 75000,
      close_date: '2023-12-31T00:00:00Z',
      notes: 'Updated notes',
      context: 'Demo Request',
      stage_updated_at: '2023-01-02T00:00:00Z',
    }

    it('should update opportunity successfully', async () => {
      const mockUpdatedOpportunity = {
        ...existingOpportunity,
        updated_at: '2023-01-03T00:00:00Z',
      }

      mockQueryBuilder.single.mockResolvedValue({
        data: mockUpdatedOpportunity,
        error: null,
      })

      const result = await repository.update(existingOpportunity)

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('opportunities')
      expect(mockQueryBuilder.update).toHaveBeenCalledWith({
        name: 'Updated Opportunity',
        organization_id: 'org-456',
        contact_id: 'contact-789',
        principal_organization_id: 'principal-101',
        stage: 'Initial Outreach',
        status: 'Active',
        estimated_value: 75000,
        close_date: '2023-12-31T00:00:00Z',
        notes: 'Updated notes',
        context: 'Demo Request',
        stage_updated_at: '2023-01-02T00:00:00Z',
        updated_at: expect.any(String), // Will be current timestamp
      })
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'opp-123')
      expect(mockQueryBuilder.select).toHaveBeenCalled()
      expect(mockQueryBuilder.single).toHaveBeenCalled()

      expect(result.id).toBe('opp-123')
      expect(result.name).toBe('Updated Opportunity')
    })

    it('should handle update errors', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'Record not found' },
      })

      await expect(repository.update(existingOpportunity)).rejects.toThrow(
        'Failed to update opportunity: Record not found'
      )
    })

    it('should update timestamp automatically', async () => {
      const beforeUpdate = new Date().toISOString()

      mockQueryBuilder.single.mockImplementation(() => {
        // Capture the update data that was passed
        const updateCall = mockQueryBuilder.update.mock.calls[0][0]
        return Promise.resolve({
          data: { ...existingOpportunity, updated_at: updateCall.updated_at },
          error: null,
        })
      })

      await repository.update(existingOpportunity)

      const updateCall = mockQueryBuilder.update.mock.calls[0][0]
      expect(updateCall.updated_at).toBeDefined()
      expect(new Date(updateCall.updated_at).getTime()).toBeGreaterThanOrEqual(
        new Date(beforeUpdate).getTime()
      )
    })
  })

  describe('delete', () => {
    it('should hard delete opportunity successfully', async () => {
      mockQueryBuilder.single.mockResolvedValue({ error: null })

      await repository.delete('opp-123')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('opportunities')
      expect(mockQueryBuilder.delete).toHaveBeenCalled()
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'opp-123')
    })

    it('should handle delete errors', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        error: { message: 'Permission denied' },
      })

      await expect(repository.delete('opp-123')).rejects.toThrow(
        'Failed to delete opportunity: Permission denied'
      )
    })
  })

  describe('softDelete', () => {
    it('should soft delete opportunity successfully', async () => {
      mockQueryBuilder.single.mockResolvedValue({ error: null })

      await repository.softDelete('opp-123')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('opportunities')
      expect(mockQueryBuilder.update).toHaveBeenCalledWith({
        deleted: true,
        updated_at: expect.any(String),
      })
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'opp-123')
    })

    it('should handle soft delete errors', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        error: { message: 'Record not found' },
      })

      await expect(repository.softDelete('opp-123')).rejects.toThrow(
        'Failed to soft delete opportunity: Record not found'
      )
    })

    it('should update timestamp during soft delete', async () => {
      mockQueryBuilder.single.mockResolvedValue({ error: null })

      const beforeDelete = new Date().toISOString()
      await repository.softDelete('opp-123')

      const updateCall = mockQueryBuilder.update.mock.calls[0][0]
      expect(updateCall.deleted).toBe(true)
      expect(updateCall.updated_at).toBeDefined()
      expect(new Date(updateCall.updated_at).getTime()).toBeGreaterThanOrEqual(
        new Date(beforeDelete).getTime()
      )
    })
  })

  describe('findByOrganization', () => {
    const mockOrganizationOpportunities: MockDatabaseOpportunity[] = [
      {
        id: 'opp-1',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        name: 'Org Opportunity 1',
        organization_id: 'org-123',
        contact_id: null,
        principal_organization_id: null,
        stage: 'New Lead',
        status: 'Active',
        estimated_value: 25000,
        close_date: null,
        notes: null,
        context: null,
        stage_updated_at: null,
        deleted: false,
      },
      {
        id: 'opp-2',
        created_at: '2023-01-02T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z',
        name: 'Org Opportunity 2',
        organization_id: 'org-123',
        contact_id: null,
        principal_organization_id: null,
        stage: 'Demo Scheduled',
        status: 'Active',
        estimated_value: 50000,
        close_date: null,
        notes: null,
        context: null,
        stage_updated_at: null,
        deleted: false,
      },
    ]

    it('should find opportunities by organization ID', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: mockOrganizationOpportunities,
        error: null,
      })

      const result = await repository.findByOrganization('org-123')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('opportunities')
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*')
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('organization_id', 'org-123')
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('deleted', false)
      expect(mockQueryBuilder.order).toHaveBeenCalledWith('created_at', { ascending: false })

      expect(result).toHaveLength(2)
      expect(result[0].organization_id).toBe('org-123')
      expect(result[1].organization_id).toBe('org-123')
    })

    it('should handle errors when finding by organization', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      })

      await expect(repository.findByOrganization('org-123')).rejects.toThrow(
        'Failed to fetch opportunities by organization: Database error'
      )
    })
  })

  describe('findByStage', () => {
    it('should find opportunities by stage', async () => {
      const mockStageOpportunities = [
        {
          id: 'opp-1',
          stage: 'New Lead',
          // ... other fields
        },
      ]

      mockQueryBuilder.single.mockResolvedValue({
        data: mockStageOpportunities,
        error: null,
      })

      await repository.findByStage('New Lead')

      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('stage', 'New Lead')
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('deleted', false)
    })
  })

  describe('findActive', () => {
    it('should find active (non-closed) opportunities', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: [],
        error: null,
      })

      await repository.findActive()

      expect(mockQueryBuilder.not).toHaveBeenCalledWith(
        'stage',
        'in',
        '("Closed - Won","Closed - Lost")'
      )
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('deleted', false)
    })
  })

  describe('countByOrganization', () => {
    it('should count opportunities by organization', async () => {
      // Mock the count query response
      mockQueryBuilder = {
        ...mockQueryBuilder,
        select: vi.fn().mockReturnValue({
          count: 5,
          error: null,
        }),
      }
      mockSupabaseClient.from.mockReturnValue(mockQueryBuilder)

      const count = await repository.countByOrganization('org-123')

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('opportunities')
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('*', { count: 'exact', head: true })
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('organization_id', 'org-123')
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('deleted', false)

      expect(count).toBe(5)
    })

    it('should return 0 when count is null', async () => {
      mockQueryBuilder = {
        ...mockQueryBuilder,
        select: vi.fn().mockReturnValue({
          count: null,
          error: null,
        }),
      }
      mockSupabaseClient.from.mockReturnValue(mockQueryBuilder)

      const count = await repository.countByOrganization('org-123')

      expect(count).toBe(0)
    })

    it('should handle count errors', async () => {
      mockQueryBuilder = {
        ...mockQueryBuilder,
        select: vi.fn().mockReturnValue({
          count: null,
          error: { message: 'Count failed' },
        }),
      }
      mockSupabaseClient.from.mockReturnValue(mockQueryBuilder)

      await expect(repository.countByOrganization('org-123')).rejects.toThrow(
        'Failed to count opportunities by organization: Count failed'
      )
    })
  })

  describe('findWithRelations', () => {
    it('should find opportunities with related entities', async () => {
      const mockOpportunitiesWithRelations = [
        {
          id: 'opp-1',
          name: 'Test Opportunity',
          organization: { id: 'org-1', name: 'Test Org' },
          contact: { id: 'contact-1', name: 'John Doe' },
          principal_organization: { id: 'principal-1', name: 'Principal Corp' },
          // ... other fields
        },
      ]

      mockQueryBuilder.single.mockResolvedValue({
        data: mockOpportunitiesWithRelations,
        error: null,
      })

      await repository.findWithRelations()

      expect(mockQueryBuilder.select).toHaveBeenCalledWith(`
        *,
        organization:organizations(*),
        contact:contacts(*),
        principal_organization:organizations!principal_organization_id(*)
      `)
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('deleted', false)
      expect(mockQueryBuilder.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('should handle errors when finding with relations', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: { message: 'Join failed' },
      })

      await expect(repository.findWithRelations()).rejects.toThrow(
        'Failed to fetch opportunities with relations: Join failed'
      )
    })
  })

  describe('data transformation', () => {
    it('should correctly transform database row to domain entity', async () => {
      const mockDbRow: MockDatabaseOpportunity = {
        id: 'opp-123',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z',
        name: 'Test Opportunity',
        organization_id: 'org-456',
        contact_id: 'contact-789',
        principal_organization_id: 'principal-101',
        stage: 'Demo Scheduled',
        status: 'Qualified',
        estimated_value: 75000,
        close_date: '2023-12-31T00:00:00Z',
        notes: 'Important notes',
        context: 'Food Show',
        stage_updated_at: '2023-01-02T00:00:00Z',
        deleted: false,
      }

      mockQueryBuilder.single.mockResolvedValue({
        data: mockDbRow,
        error: null,
      })

      const result = await repository.findById('opp-123')

      // Verify all fields are correctly mapped
      expect(result!.id).toBe('opp-123')
      expect(result!.created_at).toBe('2023-01-01T00:00:00Z')
      expect(result!.updated_at).toBe('2023-01-02T00:00:00Z')
      expect(result!.name).toBe('Test Opportunity')
      expect(result!.organization_id).toBe('org-456')
      expect(result!.contact_id).toBe('contact-789')
      expect(result!.principal_organization_id).toBe('principal-101')
      expect(result!.stage).toBe('Demo Scheduled')
      expect(result!.status).toBe('Qualified')
      expect(result!.estimated_value).toBe(75000)
      expect(result!.close_date).toBe('2023-12-31T00:00:00Z')
      expect(result!.notes).toBe('Important notes')
      expect(result!.context).toBe('Food Show')
      expect(result!.stage_updated_at).toBe('2023-01-02T00:00:00Z')

      // Verify deleted field is not present in domain entity
      expect('deleted' in result!).toBe(false)
    })

    it('should correctly transform domain entity to database insert format', async () => {
      const domainEntity = {
        name: 'New Opportunity',
        organization_id: 'org-123',
        contact_id: 'contact-456',
        principal_organization_id: 'principal-789',
        stage: 'New Lead' as const,
        status: 'Active' as const,
        estimated_value: 50000,
        close_date: '2023-12-31T00:00:00Z',
        notes: 'Test notes',
        context: 'Site Visit' as const,
        stage_updated_at: '2023-01-01T00:00:00Z',
      }

      mockQueryBuilder.single.mockResolvedValue({
        data: { id: 'new-id', ...domainEntity },
        error: null,
      })

      await repository.create(domainEntity)

      const insertCall = mockQueryBuilder.insert.mock.calls[0][0]

      expect(insertCall).toEqual({
        name: 'New Opportunity',
        organization_id: 'org-123',
        contact_id: 'contact-456',
        principal_organization_id: 'principal-789',
        stage: 'New Lead',
        status: 'Active',
        estimated_value: 50000,
        close_date: '2023-12-31T00:00:00Z',
        notes: 'Test notes',
        context: 'Site Visit',
        stage_updated_at: '2023-01-01T00:00:00Z',
      })

      // Verify excluded fields are not in insert data
      expect('id' in insertCall).toBe(false)
      expect('created_at' in insertCall).toBe(false)
      expect('updated_at' in insertCall).toBe(false)
      expect('deleted' in insertCall).toBe(false)
    })
  })
})
