import { describe, it, expect, beforeEach } from 'vitest'
import { Result, DomainService } from '../BaseEntity'
import type { BaseEntity, BaseRepository, DomainEvent } from '../BaseEntity'

describe('Result', () => {
  describe('success cases', () => {
    it('should create successful result with value', () => {
      const value = { id: '1', name: 'test' }
      const result = Result.success(value)

      expect(result.isSuccess).toBe(true)
      expect(result.isFailure).toBe(false)
      expect(result.value).toEqual(value)
    })

    it('should handle null/undefined success values', () => {
      const nullResult = Result.success(null)
      const undefinedResult = Result.success(undefined)

      expect(nullResult.isSuccess).toBe(true)
      expect(nullResult.value).toBeNull()
      expect(undefinedResult.isSuccess).toBe(true)
      expect(undefinedResult.value).toBeUndefined()
    })

    it('should throw error when accessing error on successful result', () => {
      const result = Result.success('test')

      expect(() => result.error).toThrow('Cannot get error from successful result')
    })
  })

  describe('failure cases', () => {
    it('should create failed result with error message', () => {
      const errorMessage = 'Something went wrong'
      const result = Result.failure<string>(errorMessage)

      expect(result.isSuccess).toBe(false)
      expect(result.isFailure).toBe(true)
      expect(result.error).toBe(errorMessage)
    })

    it('should throw error when accessing value on failed result', () => {
      const result = Result.failure<string>('error')

      expect(() => result.value).toThrow('Cannot get value from failed result')
    })

    it('should handle empty error messages', () => {
      const result = Result.failure<string>('')

      expect(result.isFailure).toBe(true)
      expect(result.error).toBe('')
    })
  })

  describe('type safety', () => {
    it('should maintain type information for success results', () => {
      interface TestEntity extends BaseEntity {
        name: string
      }

      const entity: TestEntity = {
        id: '1',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
        name: 'test',
      }

      const result = Result.success(entity)

      // TypeScript should infer the correct type
      expect(result.value.name).toBe('test')
      expect(result.value.id).toBe('1')
    })

    it('should maintain type information for failure results', () => {
      const result = Result.failure<number>('Not a number')

      expect(result.isFailure).toBe(true)
      expect(result.error).toBe('Not a number')
    })
  })

  describe('edge cases', () => {
    it('should handle complex object types', () => {
      const complexObject = {
        nested: {
          array: [1, 2, 3],
          object: { key: 'value' },
        },
      }

      const result = Result.success(complexObject)

      expect(result.value.nested.array).toEqual([1, 2, 3])
      expect(result.value.nested.object.key).toBe('value')
    })

    it('should handle error messages with special characters', () => {
      const errorMessage = 'Error with symbols: !@#$%^&*()_+{}|:"<>?[]\\;\',./'
      const result = Result.failure<string>(errorMessage)

      expect(result.error).toBe(errorMessage)
    })
  })
})

describe('DomainService', () => {
  class TestDomainService extends DomainService {
    public testEmit(eventName: string, payload: Record<string, any>): void {
      this.emit(eventName, payload)
    }
  }

  let service: TestDomainService

  beforeEach(() => {
    service = new TestDomainService()
  })

  describe('event management', () => {
    it('should emit domain events', () => {
      const eventName = 'TestEvent'
      const payload = { id: '1', data: 'test' }

      service.testEmit(eventName, payload)
      const events = service.getEvents()

      expect(events).toHaveLength(1)
      expect(events[0].eventName).toBe(eventName)
      expect(events[0].payload).toEqual(payload)
      expect(events[0].occurredOn).toBeInstanceOf(Date)
    })

    it('should emit multiple events in sequence', () => {
      service.testEmit('Event1', { data: 'first' })
      service.testEmit('Event2', { data: 'second' })
      service.testEmit('Event3', { data: 'third' })

      const events = service.getEvents()

      expect(events).toHaveLength(3)
      expect(events[0].eventName).toBe('Event1')
      expect(events[1].eventName).toBe('Event2')
      expect(events[2].eventName).toBe('Event3')
    })

    it('should maintain event order and timestamps', () => {
      const startTime = new Date()

      service.testEmit('Event1', { data: 'first' })
      // Small delay to ensure different timestamps
      setTimeout(() => {
        service.testEmit('Event2', { data: 'second' })
      }, 1)

      const events = service.getEvents()

      expect(events[0].occurredOn.getTime()).toBeGreaterThanOrEqual(startTime.getTime())
      if (events.length > 1) {
        expect(events[1].occurredOn.getTime()).toBeGreaterThanOrEqual(
          events[0].occurredOn.getTime()
        )
      }
    })

    it('should return immutable copy of events', () => {
      service.testEmit('TestEvent', { data: 'test' })
      const events1 = service.getEvents()
      const events2 = service.getEvents()

      // Should be different array instances
      expect(events1).not.toBe(events2)
      // But have same content
      expect(events1).toEqual(events2)

      // Modifying returned array should not affect internal state
      events1.push({
        eventName: 'HackedEvent',
        occurredOn: new Date(),
        payload: { malicious: true },
      })

      const events3 = service.getEvents()
      expect(events3).toHaveLength(1)
      expect(events3[0].eventName).toBe('TestEvent')
    })

    it('should clear all events', () => {
      service.testEmit('Event1', { data: 'first' })
      service.testEmit('Event2', { data: 'second' })

      expect(service.getEvents()).toHaveLength(2)

      service.clearEvents()

      expect(service.getEvents()).toHaveLength(0)
    })

    it('should handle empty payload objects', () => {
      service.testEmit('EmptyEvent', {})
      const events = service.getEvents()

      expect(events[0].payload).toEqual({})
    })

    it('should handle complex payload structures', () => {
      const complexPayload = {
        user: { id: '1', name: 'John', roles: ['admin', 'user'] },
        metadata: {
          timestamp: Date.now(),
          version: '1.0.0',
          nested: {
            deep: {
              value: 'complex',
            },
          },
        },
      }

      service.testEmit('ComplexEvent', complexPayload)
      const events = service.getEvents()

      expect(events[0].payload).toEqual(complexPayload)
      expect(events[0].payload.user.roles).toContain('admin')
      expect(events[0].payload.metadata.nested.deep.value).toBe('complex')
    })
  })

  describe('service lifecycle', () => {
    it('should start with no events', () => {
      const newService = new TestDomainService()
      expect(newService.getEvents()).toHaveLength(0)
    })

    it('should maintain events across multiple operations', () => {
      service.testEmit('Event1', { step: 1 })
      // Simulate some business logic
      const events1 = service.getEvents()
      expect(events1).toHaveLength(1)

      service.testEmit('Event2', { step: 2 })
      const events2 = service.getEvents()
      expect(events2).toHaveLength(2)

      // Events should be preserved
      expect(events2[0].payload.step).toBe(1)
      expect(events2[1].payload.step).toBe(2)
    })
  })
})

describe('BaseEntity interface', () => {
  it('should define required base properties', () => {
    const entity: BaseEntity = {
      id: 'test-id',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    }

    expect(entity.id).toBeDefined()
    expect(entity.created_at).toBeDefined()
    expect(entity.updated_at).toBeDefined()
  })
})

describe('BaseRepository interface', () => {
  // Mock implementation for testing
  class MockRepository implements BaseRepository<BaseEntity> {
    private entities: BaseEntity[] = []
    private nextId = 1

    async findById(id: string): Promise<BaseEntity | null> {
      return this.entities.find((e) => e.id === id) || null
    }

    async findAll(): Promise<BaseEntity[]> {
      return [...this.entities]
    }

    async create(
      entity: Omit<BaseEntity, 'id' | 'created_at' | 'updated_at'>
    ): Promise<BaseEntity> {
      const now = new Date().toISOString()
      const newEntity: BaseEntity = {
        ...entity,
        id: String(this.nextId++),
        created_at: now,
        updated_at: now,
      }
      this.entities.push(newEntity)
      return newEntity
    }

    async update(entity: BaseEntity): Promise<BaseEntity> {
      const index = this.entities.findIndex((e) => e.id === entity.id)
      if (index === -1) {
        throw new Error('Entity not found')
      }
      const updatedEntity = {
        ...entity,
        updated_at: new Date().toISOString(),
      }
      this.entities[index] = updatedEntity
      return updatedEntity
    }

    async delete(id: string): Promise<void> {
      const index = this.entities.findIndex((e) => e.id === id)
      if (index === -1) {
        throw new Error('Entity not found')
      }
      this.entities.splice(index, 1)
    }

    async softDelete(id: string): Promise<void> {
      // Mock implementation - in real usage this would set deleted flag
      const entity = await this.findById(id)
      if (!entity) {
        throw new Error('Entity not found')
      }
      // Simulate soft delete by updating timestamp
      await this.update({ ...entity, updated_at: new Date().toISOString() })
    }
  }

  let repository: MockRepository

  beforeEach(() => {
    repository = new MockRepository()
  })

  it('should implement CRUD operations', async () => {
    // Create
    const created = await repository.create({})
    expect(created.id).toBeDefined()
    expect(created.created_at).toBeDefined()
    expect(created.updated_at).toBeDefined()

    // Read
    const found = await repository.findById(created.id)
    expect(found).toEqual(created)

    // Update
    const updated = await repository.update({
      ...created,
      updated_at: '2023-01-02T00:00:00Z',
    })
    expect(updated.updated_at).toBe('2023-01-02T00:00:00Z')

    // Delete
    await repository.delete(created.id)
    const deleted = await repository.findById(created.id)
    expect(deleted).toBeNull()
  })

  it('should find all entities', async () => {
    await repository.create({})
    await repository.create({})

    const all = await repository.findAll()
    expect(all).toHaveLength(2)
  })

  it('should handle soft delete', async () => {
    const entity = await repository.create({})
    await repository.softDelete(entity.id)

    // Should still exist (mock implementation)
    const found = await repository.findById(entity.id)
    expect(found).toBeDefined()
  })
})

describe('DomainEvent interface', () => {
  it('should define required event properties', () => {
    const event: DomainEvent = {
      eventName: 'TestEvent',
      occurredOn: new Date(),
      payload: { data: 'test' },
    }

    expect(event.eventName).toBe('TestEvent')
    expect(event.occurredOn).toBeInstanceOf(Date)
    expect(event.payload).toEqual({ data: 'test' })
  })
})
