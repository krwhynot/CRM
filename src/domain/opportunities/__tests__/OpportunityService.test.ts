import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OpportunityService } from '../OpportunityService'
// Removed unused: import { Result } from '../../shared/BaseEntity'
// Removed unused: import { BusinessRuleViolation } from '../../shared/BusinessRules'
import type {
  OpportunityDomain,
  CreateOpportunityData,
  UpdateOpportunityData,
  OpportunityNameContext,
  PipelineMetrics,
} from '../OpportunityTypes'
import type { BaseRepository } from '../../shared/BaseEntity'

// Mock repository implementation
class MockOpportunityRepository implements BaseRepository<OpportunityDomain> {
  private opportunities: Map<string, OpportunityDomain> = new Map()
  private nextId = 1

  async findById(id: string): Promise<OpportunityDomain | null> {
    return this.opportunities.get(id) || null
  }

  async findAll(): Promise<OpportunityDomain[]> {
    return Array.from(this.opportunities.values())
  }

  async create(
    entity: Omit<OpportunityDomain, 'id' | 'created_at' | 'updated_at'>
  ): Promise<OpportunityDomain> {
    const now = new Date().toISOString()
    const opportunity: OpportunityDomain = {
      ...entity,
      id: String(this.nextId++),
      created_at: now,
      updated_at: now,
    }
    this.opportunities.set(opportunity.id, opportunity)
    return opportunity
  }

  async update(entity: OpportunityDomain): Promise<OpportunityDomain> {
    if (!this.opportunities.has(entity.id)) {
      throw new Error('Opportunity not found')
    }
    const updated = { ...entity, updated_at: new Date().toISOString() }
    this.opportunities.set(entity.id, updated)
    return updated
  }

  async delete(id: string): Promise<void> {
    this.opportunities.delete(id)
  }

  async softDelete(id: string): Promise<void> {
    const opportunity = this.opportunities.get(id)
    if (!opportunity) {
      throw new Error('Opportunity not found')
    }
    // Mock soft delete by updating timestamp
    await this.update({ ...opportunity, updated_at: new Date().toISOString() })
  }

  // Helper method for testing
  clear(): void {
    this.opportunities.clear()
    this.nextId = 1
  }

  // Helper method for testing
  setOpportunity(opportunity: OpportunityDomain): void {
    this.opportunities.set(opportunity.id, opportunity)
  }
}

describe('OpportunityService', () => {
  let service: OpportunityService
  let mockRepository: MockOpportunityRepository

  beforeEach(() => {
    mockRepository = new MockOpportunityRepository()
    service = new OpportunityService(mockRepository)
  })

  describe('create', () => {
    const validCreateData: CreateOpportunityData = {
      name: 'Test Opportunity',
      organization_id: 'org-123',
      estimated_value: 50000,
    }

    it('should create opportunity with valid data', async () => {
      const result = await service.create(validCreateData)

      expect(result.isSuccess).toBe(true)
      const opportunity = result.value
      expect(opportunity.name).toBe('Test Opportunity')
      expect(opportunity.organization_id).toBe('org-123')
      expect(opportunity.estimated_value).toBe(50000)
      expect(opportunity.stage).toBe('New Lead') // Default
      expect(opportunity.status).toBe('Active') // Default
      expect(opportunity.id).toBeDefined()
      expect(opportunity.created_at).toBeDefined()
      expect(opportunity.updated_at).toBeDefined()
    })

    it('should apply default values', async () => {
      const result = await service.create(validCreateData)
      const opportunity = result.value

      expect(opportunity.stage).toBe('New Lead')
      expect(opportunity.status).toBe('Active')
    })

    it('should allow overriding default values', async () => {
      const dataWithDefaults: CreateOpportunityData = {
        ...validCreateData,
        stage: 'Initial Outreach',
        status: 'Qualified',
      }

      const result = await service.create(dataWithDefaults)
      const opportunity = result.value

      expect(opportunity.stage).toBe('Initial Outreach')
      expect(opportunity.status).toBe('Qualified')
    })

    it('should emit OpportunityCreated event', async () => {
      await service.create(validCreateData)

      const events = service.getEvents()
      expect(events).toHaveLength(1)
      expect(events[0].eventName).toBe('OpportunityCreated')
      expect(events[0].payload).toMatchObject({
        organizationId: 'org-123',
        stage: 'New Lead',
        value: 50000,
      })
      expect(events[0].payload.opportunityId).toBeDefined()
    })

    it('should fail with invalid data', async () => {
      const invalidData: CreateOpportunityData = {
        name: '', // Invalid: empty name
        organization_id: 'org-123',
        estimated_value: 50000,
      }

      const result = await service.create(invalidData)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Business rule violation')
    })

    it('should fail with negative estimated value', async () => {
      const invalidData: CreateOpportunityData = {
        ...validCreateData,
        estimated_value: -1000,
      }

      const result = await service.create(invalidData)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Estimated value must be a positive number')
    })

    it('should handle repository errors', async () => {
      // Mock repository to throw an error
      const throwingRepository = {
        ...mockRepository,
        create: vi.fn().mockRejectedValue(new Error('Database error')),
      }
      const failingService = new OpportunityService(throwingRepository as any)

      const result = await failingService.create(validCreateData)

      expect(result.isFailure).toBe(true)
      expect(result.error).toBe('Database error')
    })
  })

  describe('updateStage', () => {
    let existingOpportunity: OpportunityDomain

    beforeEach(() => {
      existingOpportunity = {
        id: 'opp-1',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
        name: 'Test Opportunity',
        organization_id: 'org-123',
        stage: 'New Lead',
        status: 'Active',
        estimated_value: 50000,
        stage_updated_at: '2023-01-01',
      }
      mockRepository.setOpportunity(existingOpportunity)
    })

    it('should update stage with valid transition', async () => {
      const result = await service.updateStage('opp-1', 'Initial Outreach', 'user-123')

      expect(result.isSuccess).toBe(true)
      const updated = result.value
      expect(updated.stage).toBe('Initial Outreach')
      expect(updated.stage_updated_at).not.toBe('2023-01-01') // Should be updated
    })

    it('should emit OpportunityStageChanged event', async () => {
      await service.updateStage('opp-1', 'Initial Outreach', 'user-123')

      const events = service.getEvents()
      expect(events).toHaveLength(1)
      expect(events[0].eventName).toBe('OpportunityStageChanged')
      expect(events[0].payload).toMatchObject({
        opportunityId: 'opp-1',
        oldStage: 'New Lead',
        newStage: 'Initial Outreach',
        changedBy: 'user-123',
      })
    })

    it('should auto-update status when closing as won', async () => {
      // First move to a stage that can transition to won
      await service.updateStage('opp-1', 'Demo Scheduled')
      const result = await service.updateStage('opp-1', 'Closed - Won')

      expect(result.isSuccess).toBe(true)
      expect(result.value.stage).toBe('Closed - Won')
      expect(result.value.status).toBe('Closed - Won')
    })

    it('should auto-update status when closing as lost', async () => {
      const result = await service.updateStage('opp-1', 'Closed - Lost')

      expect(result.isSuccess).toBe(true)
      expect(result.value.stage).toBe('Closed - Lost')
      expect(result.value.status).toBe('Closed - Lost')
    })

    it('should emit OpportunityClosed event for closed stages', async () => {
      await service.updateStage('opp-1', 'Closed - Won')

      const events = service.getEvents()
      expect(events).toHaveLength(2) // StageChanged + Closed

      const closedEvent = events.find((e) => e.eventName === 'OpportunityClosed')
      expect(closedEvent).toBeDefined()
      expect(closedEvent!.payload).toMatchObject({
        opportunityId: 'opp-1',
        finalStage: 'Closed - Won',
        finalValue: 50000,
      })
      expect(closedEvent!.payload.closedAt).toBeInstanceOf(Date)
    })

    it('should fail for invalid stage transition', async () => {
      const result = await service.updateStage('opp-1', 'Demo Scheduled') // Invalid jump

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Cannot transition from New Lead to Demo Scheduled')
    })

    it('should fail for non-existent opportunity', async () => {
      const result = await service.updateStage('non-existent', 'Initial Outreach')

      expect(result.isFailure).toBe(true)
      expect(result.error).toBe('Opportunity not found')
    })

    it('should allow same stage transition', async () => {
      const result = await service.updateStage('opp-1', 'New Lead')

      expect(result.isSuccess).toBe(true)
      expect(result.value.stage).toBe('New Lead')
    })
  })

  describe('update', () => {
    let existingOpportunity: OpportunityDomain

    beforeEach(() => {
      existingOpportunity = {
        id: 'opp-1',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
        name: 'Test Opportunity',
        organization_id: 'org-123',
        stage: 'New Lead',
        status: 'Active',
        estimated_value: 50000,
      }
      mockRepository.setOpportunity(existingOpportunity)
    })

    it('should update opportunity with valid data', async () => {
      const updateData: UpdateOpportunityData = {
        name: 'Updated Opportunity',
        estimated_value: 75000,
        notes: 'Some notes',
      }

      const result = await service.update('opp-1', updateData)

      expect(result.isSuccess).toBe(true)
      const updated = result.value
      expect(updated.name).toBe('Updated Opportunity')
      expect(updated.estimated_value).toBe(75000)
      expect(updated.notes).toBe('Some notes')
    })

    it('should emit OpportunityValueUpdated event when value changes', async () => {
      const updateData: UpdateOpportunityData = {
        estimated_value: 75000,
      }

      await service.update('opp-1', updateData)

      const events = service.getEvents()
      expect(events).toHaveLength(1)
      expect(events[0].eventName).toBe('OpportunityValueUpdated')
      expect(events[0].payload).toMatchObject({
        opportunityId: 'opp-1',
        oldValue: 50000,
        newValue: 75000,
      })
    })

    it('should not emit value event when value unchanged', async () => {
      const updateData: UpdateOpportunityData = {
        name: 'Updated Name',
        // No value change
      }

      await service.update('opp-1', updateData)

      const events = service.getEvents()
      expect(events).toHaveLength(0)
    })

    it('should validate status transitions', async () => {
      const updateData: UpdateOpportunityData = {
        status: 'Closed - Won', // Invalid for New Lead stage
      }

      const result = await service.update('opp-1', updateData)

      expect(result.isFailure).toBe(true)
      expect(result.error).toBe('Invalid status transition')
    })

    it('should allow valid status transitions', async () => {
      const updateData: UpdateOpportunityData = {
        status: 'On Hold', // Valid for any active stage
      }

      const result = await service.update('opp-1', updateData)

      expect(result.isSuccess).toBe(true)
      expect(result.value.status).toBe('On Hold')
    })

    it('should fail for invalid opportunity data', async () => {
      const updateData: UpdateOpportunityData = {
        estimated_value: -1000, // Invalid negative value
      }

      const result = await service.update('opp-1', updateData)

      expect(result.isFailure).toBe(true)
      expect(result.error).toContain('Business rule violation')
    })

    it('should fail for non-existent opportunity', async () => {
      const result = await service.update('non-existent', { name: 'Updated' })

      expect(result.isFailure).toBe(true)
      expect(result.error).toBe('Opportunity not found')
    })
  })

  describe('softDelete', () => {
    beforeEach(() => {
      const opportunity: OpportunityDomain = {
        id: 'opp-1',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
        name: 'Test Opportunity',
        organization_id: 'org-123',
        stage: 'New Lead',
        status: 'Active',
        estimated_value: 50000,
      }
      mockRepository.setOpportunity(opportunity)
    })

    it('should soft delete opportunity successfully', async () => {
      const result = await service.softDelete('opp-1')

      expect(result.isSuccess).toBe(true)
      expect(result.value).toBeUndefined()
    })

    it('should handle repository errors', async () => {
      const throwingRepository = {
        ...mockRepository,
        softDelete: vi.fn().mockRejectedValue(new Error('Delete failed')),
      }
      const failingService = new OpportunityService(throwingRepository as any)

      const result = await failingService.softDelete('opp-1')

      expect(result.isFailure).toBe(true)
      expect(result.error).toBe('Delete failed')
    })
  })

  describe('generateName', () => {
    it('should generate name using OpportunityRules', () => {
      const context: OpportunityNameContext = {
        organizationName: 'Test Corp',
        context: 'Site Visit',
        principalName: 'Coca-Cola',
        existingOpportunityCount: 1,
      }

      const name = service.generateName(context)

      expect(name).toBe('Test Corp - Site Visit (Coca-Cola) #2')
    })
  })

  describe('calculatePipelineMetrics', () => {
    const testOpportunities: OpportunityDomain[] = [
      {
        id: '1',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
        name: 'Opp 1',
        organization_id: 'org-1',
        stage: 'New Lead',
        status: 'Active',
        estimated_value: 10000,
      },
      {
        id: '2',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
        name: 'Opp 2',
        organization_id: 'org-1',
        stage: 'Closed - Won',
        status: 'Closed - Won',
        estimated_value: 20000,
      },
      {
        id: '3',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
        name: 'Opp 3',
        organization_id: 'org-1',
        stage: 'Closed - Lost',
        status: 'Closed - Lost',
        estimated_value: 15000,
      },
      {
        id: '4',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
        name: 'Opp 4',
        organization_id: 'org-1',
        stage: 'Demo Scheduled',
        status: 'Active',
        estimated_value: 25000,
      },
    ]

    it('should calculate comprehensive pipeline metrics', () => {
      const metrics = service.calculatePipelineMetrics(testOpportunities)

      expect(metrics.totalValue).toBe(70000) // Sum of all
      expect(metrics.activeValue).toBe(35000) // New Lead + Demo Scheduled
      expect(metrics.wonValue).toBe(20000) // Closed - Won
      expect(metrics.lostValue).toBe(15000) // Closed - Lost
      expect(metrics.averageDealSize).toBe(17500) // 70000 / 4
      expect(metrics.winRate).toBeCloseTo(66.67, 2) // 1 won / (1 won + 1 lost)
    })

    it('should calculate stage breakdown', () => {
      const metrics = service.calculatePipelineMetrics(testOpportunities)

      expect(metrics.stageBreakdown['New Lead']).toEqual({ count: 1, value: 10000 })
      expect(metrics.stageBreakdown['Closed - Won']).toEqual({ count: 1, value: 20000 })
      expect(metrics.stageBreakdown['Closed - Lost']).toEqual({ count: 1, value: 15000 })
      expect(metrics.stageBreakdown['Demo Scheduled']).toEqual({ count: 1, value: 25000 })
      expect(metrics.stageBreakdown['Initial Outreach']).toEqual({ count: 0, value: 0 })
    })

    it('should handle empty opportunity list', () => {
      const metrics = service.calculatePipelineMetrics([])

      expect(metrics.totalValue).toBe(0)
      expect(metrics.activeValue).toBe(0)
      expect(metrics.wonValue).toBe(0)
      expect(metrics.lostValue).toBe(0)
      expect(metrics.averageDealSize).toBe(0)
      expect(metrics.winRate).toBe(0)
    })
  })

  describe('validateStageTransition', () => {
    it('should delegate to OpportunityRules', () => {
      const result = service.validateStageTransition('New Lead', 'Initial Outreach')
      expect(result.isValid).toBe(true)

      const invalidResult = service.validateStageTransition('New Lead', 'Demo Scheduled')
      expect(invalidResult.isValid).toBe(false)
    })
  })

  describe('getActiveOpportunities', () => {
    beforeEach(() => {
      const opportunities: OpportunityDomain[] = [
        {
          id: '1',
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
          name: 'Active Opp',
          organization_id: 'org-1',
          stage: 'New Lead',
          status: 'Active',
          estimated_value: 10000,
        },
        {
          id: '2',
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
          name: 'Closed Opp',
          organization_id: 'org-1',
          stage: 'Closed - Won',
          status: 'Closed - Won',
          estimated_value: 20000,
        },
      ]
      opportunities.forEach((opp) => mockRepository.setOpportunity(opp))
    })

    it('should return only active opportunities', async () => {
      const activeOpportunities = await service.getActiveOpportunities()

      expect(activeOpportunities).toHaveLength(1)
      expect(activeOpportunities[0].stage).toBe('New Lead')
    })
  })

  describe('getByOrganization', () => {
    beforeEach(() => {
      const opportunities: OpportunityDomain[] = [
        {
          id: '1',
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
          name: 'Org 1 Opp',
          organization_id: 'org-1',
          stage: 'New Lead',
          status: 'Active',
          estimated_value: 10000,
        },
        {
          id: '2',
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
          name: 'Org 2 Opp',
          organization_id: 'org-2',
          stage: 'New Lead',
          status: 'Active',
          estimated_value: 20000,
        },
      ]
      opportunities.forEach((opp) => mockRepository.setOpportunity(opp))
    })

    it('should return opportunities for specific organization', async () => {
      const orgOpportunities = await service.getByOrganization('org-1')

      expect(orgOpportunities).toHaveLength(1)
      expect(orgOpportunities[0].organization_id).toBe('org-1')
    })

    it('should return empty array for non-existent organization', async () => {
      const orgOpportunities = await service.getByOrganization('non-existent')

      expect(orgOpportunities).toHaveLength(0)
    })
  })

  describe('domain event management', () => {
    it('should accumulate events from multiple operations', async () => {
      const createData: CreateOpportunityData = {
        name: 'Test Opportunity',
        organization_id: 'org-123',
        estimated_value: 50000,
      }

      const createResult = await service.create(createData)
      const opportunityId = createResult.value.id

      await service.updateStage(opportunityId, 'Initial Outreach')
      await service.update(opportunityId, { estimated_value: 75000 })

      const events = service.getEvents()
      expect(events).toHaveLength(3) // Created, StageChanged, ValueUpdated

      const eventNames = events.map((e) => e.eventName)
      expect(eventNames).toContain('OpportunityCreated')
      expect(eventNames).toContain('OpportunityStageChanged')
      expect(eventNames).toContain('OpportunityValueUpdated')
    })

    it('should clear events when requested', async () => {
      const createData: CreateOpportunityData = {
        name: 'Test Opportunity',
        organization_id: 'org-123',
        estimated_value: 50000,
      }

      await service.create(createData)
      expect(service.getEvents()).toHaveLength(1)

      service.clearEvents()
      expect(service.getEvents()).toHaveLength(0)
    })
  })

  describe('error handling', () => {
    it('should handle and wrap unknown errors', async () => {
      const throwingRepository = {
        ...mockRepository,
        create: vi.fn().mockRejectedValue('Unknown error'), // String instead of Error
      }
      const failingService = new OpportunityService(throwingRepository as any)

      const result = await failingService.create({
        name: 'Test',
        organization_id: 'org-1',
        estimated_value: 1000,
      })

      expect(result.isFailure).toBe(true)
      expect(result.error).toBe('Unknown error')
    })

    it('should preserve Error messages', async () => {
      const throwingRepository = {
        ...mockRepository,
        findById: vi.fn().mockRejectedValue(new Error('Database connection failed')),
      }
      const failingService = new OpportunityService(throwingRepository as any)

      const result = await failingService.updateStage('opp-1', 'Initial Outreach')

      expect(result.isFailure).toBe(true)
      expect(result.error).toBe('Database connection failed')
    })
  })
})
