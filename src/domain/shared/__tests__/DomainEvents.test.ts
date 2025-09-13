import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  DomainEventBus,
  domainEventBus,
  type EventHandler,
  type CRMDomainEvent,
  type OpportunityCreated,
  type OpportunityStageChanged,
  type OpportunityValueUpdated,
  type OpportunityClosed,
  type OrganizationCreated,
  type OrganizationPriorityChanged,
  type ContactCreated,
  type ContactAuthorityChanged,
  type InteractionLogged,
} from '../DomainEvents'
import type { DomainEvent } from '../BaseEntity'

describe('DomainEventBus', () => {
  let eventBus: DomainEventBus

  beforeEach(() => {
    eventBus = new DomainEventBus()
  })

  describe('basic event handling', () => {
    it('should subscribe and publish events', async () => {
      const handler = vi.fn()
      const testEvent: DomainEvent = {
        eventName: 'TestEvent',
        occurredOn: new Date(),
        payload: { data: 'test' },
      }

      eventBus.subscribe('TestEvent', { handle: handler })
      await eventBus.publish(testEvent)

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(testEvent)
    })

    it('should handle multiple subscribers for same event', async () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      const handler3 = vi.fn()

      const testEvent: DomainEvent = {
        eventName: 'TestEvent',
        occurredOn: new Date(),
        payload: { data: 'test' },
      }

      eventBus.subscribe('TestEvent', { handle: handler1 })
      eventBus.subscribe('TestEvent', { handle: handler2 })
      eventBus.subscribe('TestEvent', { handle: handler3 })

      await eventBus.publish(testEvent)

      expect(handler1).toHaveBeenCalledTimes(1)
      expect(handler2).toHaveBeenCalledTimes(1)
      expect(handler3).toHaveBeenCalledTimes(1)
    })

    it('should handle different event types independently', async () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      const event1: DomainEvent = {
        eventName: 'Event1',
        occurredOn: new Date(),
        payload: { data: 'first' },
      }

      const event2: DomainEvent = {
        eventName: 'Event2',
        occurredOn: new Date(),
        payload: { data: 'second' },
      }

      eventBus.subscribe('Event1', { handle: handler1 })
      eventBus.subscribe('Event2', { handle: handler2 })

      await eventBus.publish(event1)
      await eventBus.publish(event2)

      expect(handler1).toHaveBeenCalledWith(event1)
      expect(handler2).toHaveBeenCalledWith(event2)
      expect(handler1).not.toHaveBeenCalledWith(event2)
      expect(handler2).not.toHaveBeenCalledWith(event1)
    })

    it('should not call handlers for events with no subscribers', async () => {
      const handler = vi.fn()

      const testEvent: DomainEvent = {
        eventName: 'UnsubscribedEvent',
        occurredOn: new Date(),
        payload: { data: 'test' },
      }

      eventBus.subscribe('DifferentEvent', { handle: handler })
      await eventBus.publish(testEvent)

      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('async event handling', () => {
    it('should handle async event handlers', async () => {
      const handler = vi.fn().mockImplementation(async (event) => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        return `processed: ${event.payload.data}`
      })

      const testEvent: DomainEvent = {
        eventName: 'AsyncEvent',
        occurredOn: new Date(),
        payload: { data: 'test' },
      }

      eventBus.subscribe('AsyncEvent', { handle: handler })
      await eventBus.publish(testEvent)

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should wait for all handlers to complete', async () => {
      const results: string[] = []

      const handler1 = vi.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 20))
        results.push('handler1')
      })

      const handler2 = vi.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        results.push('handler2')
      })

      const handler3 = vi.fn().mockImplementation(async () => {
        results.push('handler3') // Synchronous
      })

      const testEvent: DomainEvent = {
        eventName: 'AsyncEvent',
        occurredOn: new Date(),
        payload: { data: 'test' },
      }

      eventBus.subscribe('AsyncEvent', { handle: handler1 })
      eventBus.subscribe('AsyncEvent', { handle: handler2 })
      eventBus.subscribe('AsyncEvent', { handle: handler3 })

      await eventBus.publish(testEvent)

      // All handlers should have completed
      expect(results).toHaveLength(3)
      expect(results).toContain('handler1')
      expect(results).toContain('handler2')
      expect(results).toContain('handler3')
    })

    it('should handle handler errors gracefully', async () => {
      const workingHandler = vi.fn()
      const errorHandler = vi.fn().mockRejectedValue(new Error('Handler error'))

      const testEvent: DomainEvent = {
        eventName: 'ErrorEvent',
        occurredOn: new Date(),
        payload: { data: 'test' },
      }

      eventBus.subscribe('ErrorEvent', { handle: workingHandler })
      eventBus.subscribe('ErrorEvent', { handle: errorHandler })

      // Should not throw even if one handler fails
      await expect(eventBus.publish(testEvent)).rejects.toThrow()

      expect(workingHandler).toHaveBeenCalled()
      expect(errorHandler).toHaveBeenCalled()
    })
  })

  describe('subscription management', () => {
    it('should unsubscribe handlers', async () => {
      const handler = vi.fn()

      const testEvent: DomainEvent = {
        eventName: 'TestEvent',
        occurredOn: new Date(),
        payload: { data: 'test' },
      }

      eventBus.subscribe('TestEvent', { handle: handler })
      await eventBus.publish(testEvent)
      expect(handler).toHaveBeenCalledTimes(1)

      eventBus.unsubscribe('TestEvent', { handle: handler })
      await eventBus.publish(testEvent)
      expect(handler).toHaveBeenCalledTimes(1) // Should not be called again
    })

    it('should only unsubscribe specific handler', async () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      const testEvent: DomainEvent = {
        eventName: 'TestEvent',
        occurredOn: new Date(),
        payload: { data: 'test' },
      }

      eventBus.subscribe('TestEvent', { handle: handler1 })
      eventBus.subscribe('TestEvent', { handle: handler2 })

      eventBus.unsubscribe('TestEvent', { handle: handler1 })
      await eventBus.publish(testEvent)

      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).toHaveBeenCalledTimes(1)
    })

    it('should handle unsubscribe of non-existent handler', () => {
      const handler = vi.fn()

      // Should not throw
      expect(() => {
        eventBus.unsubscribe('NonExistentEvent', { handle: handler })
      }).not.toThrow()
    })

    it('should clear all subscriptions', async () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      eventBus.subscribe('Event1', { handle: handler1 })
      eventBus.subscribe('Event2', { handle: handler2 })

      eventBus.clear()

      const event1: DomainEvent = {
        eventName: 'Event1',
        occurredOn: new Date(),
        payload: { data: 'test1' },
      }

      const event2: DomainEvent = {
        eventName: 'Event2',
        occurredOn: new Date(),
        payload: { data: 'test2' },
      }

      await eventBus.publish(event1)
      await eventBus.publish(event2)

      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('should handle events with complex payloads', async () => {
      const handler = vi.fn()

      const complexEvent: DomainEvent = {
        eventName: 'ComplexEvent',
        occurredOn: new Date(),
        payload: {
          user: { id: '123', name: 'John', preferences: ['email', 'sms'] },
          metadata: {
            version: '1.0',
            nested: {
              deep: {
                value: 'test',
              },
            },
          },
          timestamp: Date.now(),
        },
      }

      eventBus.subscribe('ComplexEvent', { handle: handler })
      await eventBus.publish(complexEvent)

      expect(handler).toHaveBeenCalledWith(complexEvent)
      expect(handler.mock.calls[0][0].payload.user.preferences).toContain('email')
    })

    it('should handle events with empty payloads', async () => {
      const handler = vi.fn()

      const emptyEvent: DomainEvent = {
        eventName: 'EmptyEvent',
        occurredOn: new Date(),
        payload: {},
      }

      eventBus.subscribe('EmptyEvent', { handle: handler })
      await eventBus.publish(emptyEvent)

      expect(handler).toHaveBeenCalledWith(emptyEvent)
    })
  })
})

describe('Domain Event Types', () => {
  describe('OpportunityCreated', () => {
    it('should have correct structure', () => {
      const event: OpportunityCreated = {
        eventName: 'OpportunityCreated',
        occurredOn: new Date(),
        payload: {
          opportunityId: 'opp-123',
          organizationId: 'org-456',
          stage: 'New Lead',
          value: 50000,
        },
      }

      expect(event.eventName).toBe('OpportunityCreated')
      expect(event.payload.opportunityId).toBe('opp-123')
      expect(event.payload.organizationId).toBe('org-456')
      expect(event.payload.stage).toBe('New Lead')
      expect(event.payload.value).toBe(50000)
    })
  })

  describe('OpportunityStageChanged', () => {
    it('should have correct structure with optional changedBy', () => {
      const eventWithUser: OpportunityStageChanged = {
        eventName: 'OpportunityStageChanged',
        occurredOn: new Date(),
        payload: {
          opportunityId: 'opp-123',
          oldStage: 'New Lead',
          newStage: 'Initial Outreach',
          changedBy: 'user-789',
        },
      }

      const eventWithoutUser: OpportunityStageChanged = {
        eventName: 'OpportunityStageChanged',
        occurredOn: new Date(),
        payload: {
          opportunityId: 'opp-123',
          oldStage: 'New Lead',
          newStage: 'Initial Outreach',
        },
      }

      expect(eventWithUser.payload.changedBy).toBe('user-789')
      expect(eventWithoutUser.payload.changedBy).toBeUndefined()
    })
  })

  describe('OpportunityValueUpdated', () => {
    it('should track value changes', () => {
      const event: OpportunityValueUpdated = {
        eventName: 'OpportunityValueUpdated',
        occurredOn: new Date(),
        payload: {
          opportunityId: 'opp-123',
          oldValue: 25000,
          newValue: 35000,
        },
      }

      expect(event.payload.oldValue).toBe(25000)
      expect(event.payload.newValue).toBe(35000)
    })
  })

  describe('OpportunityClosed', () => {
    it('should handle both won and lost scenarios', () => {
      const wonEvent: OpportunityClosed = {
        eventName: 'OpportunityClosed',
        occurredOn: new Date(),
        payload: {
          opportunityId: 'opp-123',
          finalStage: 'Closed - Won',
          finalValue: 50000,
          closedAt: new Date(),
        },
      }

      const lostEvent: OpportunityClosed = {
        eventName: 'OpportunityClosed',
        occurredOn: new Date(),
        payload: {
          opportunityId: 'opp-456',
          finalStage: 'Closed - Lost',
          finalValue: 0,
          closedAt: new Date(),
        },
      }

      expect(wonEvent.payload.finalStage).toBe('Closed - Won')
      expect(lostEvent.payload.finalStage).toBe('Closed - Lost')
    })
  })

  describe('OrganizationCreated', () => {
    it('should capture organization details', () => {
      const event: OrganizationCreated = {
        eventName: 'OrganizationCreated',
        occurredOn: new Date(),
        payload: {
          organizationId: 'org-123',
          name: 'Acme Corp',
          type: 'customer',
          segment: 'restaurant',
        },
      }

      expect(event.payload.name).toBe('Acme Corp')
      expect(event.payload.type).toBe('customer')
      expect(event.payload.segment).toBe('restaurant')
    })
  })

  describe('OrganizationPriorityChanged', () => {
    it('should track priority changes', () => {
      const event: OrganizationPriorityChanged = {
        eventName: 'OrganizationPriorityChanged',
        occurredOn: new Date(),
        payload: {
          organizationId: 'org-123',
          oldPriority: 'B',
          newPriority: 'A',
        },
      }

      expect(event.payload.oldPriority).toBe('B')
      expect(event.payload.newPriority).toBe('A')
    })
  })

  describe('ContactCreated', () => {
    it('should capture contact details', () => {
      const event: ContactCreated = {
        eventName: 'ContactCreated',
        occurredOn: new Date(),
        payload: {
          contactId: 'contact-123',
          organizationId: 'org-456',
          name: 'John Smith',
          decisionAuthority: 'primary',
        },
      }

      expect(event.payload.name).toBe('John Smith')
      expect(event.payload.decisionAuthority).toBe('primary')
    })
  })

  describe('ContactAuthorityChanged', () => {
    it('should track authority changes', () => {
      const event: ContactAuthorityChanged = {
        eventName: 'ContactAuthorityChanged',
        occurredOn: new Date(),
        payload: {
          contactId: 'contact-123',
          oldAuthority: 'influencer',
          newAuthority: 'primary',
        },
      }

      expect(event.payload.oldAuthority).toBe('influencer')
      expect(event.payload.newAuthority).toBe('primary')
    })
  })

  describe('InteractionLogged', () => {
    it('should handle optional relationships', () => {
      const fullEvent: InteractionLogged = {
        eventName: 'InteractionLogged',
        occurredOn: new Date(),
        payload: {
          interactionId: 'int-123',
          type: 'phone_call',
          organizationId: 'org-456',
          contactId: 'contact-789',
          opportunityId: 'opp-101',
        },
      }

      const minimalEvent: InteractionLogged = {
        eventName: 'InteractionLogged',
        occurredOn: new Date(),
        payload: {
          interactionId: 'int-124',
          type: 'email',
        },
      }

      expect(fullEvent.payload.organizationId).toBe('org-456')
      expect(fullEvent.payload.contactId).toBe('contact-789')
      expect(fullEvent.payload.opportunityId).toBe('opp-101')

      expect(minimalEvent.payload.organizationId).toBeUndefined()
      expect(minimalEvent.payload.contactId).toBeUndefined()
      expect(minimalEvent.payload.opportunityId).toBeUndefined()
    })
  })
})

describe('CRMDomainEvent Union Type', () => {
  it('should accept all domain event types', () => {
    const events: CRMDomainEvent[] = [
      {
        eventName: 'OpportunityCreated',
        occurredOn: new Date(),
        payload: { opportunityId: '1', organizationId: '2', stage: 'New Lead', value: 1000 },
      },
      {
        eventName: 'OpportunityStageChanged',
        occurredOn: new Date(),
        payload: { opportunityId: '1', oldStage: 'New Lead', newStage: 'Initial Outreach' },
      },
      {
        eventName: 'OrganizationCreated',
        occurredOn: new Date(),
        payload: { organizationId: '1', name: 'Test', type: 'customer', segment: 'restaurant' },
      },
    ]

    expect(events).toHaveLength(3)
    expect(events[0].eventName).toBe('OpportunityCreated')
    expect(events[1].eventName).toBe('OpportunityStageChanged')
    expect(events[2].eventName).toBe('OrganizationCreated')
  })
})

describe('Global Event Bus Instance', () => {
  beforeEach(() => {
    // Clear the global event bus before each test
    domainEventBus.clear()
  })

  it('should provide a singleton event bus instance', () => {
    expect(domainEventBus).toBeInstanceOf(DomainEventBus)
  })

  it('should maintain state across multiple references', async () => {
    const handler = vi.fn()

    // Subscribe using the global instance
    domainEventBus.subscribe('TestGlobalEvent', { handle: handler })

    // Publish using the global instance
    await domainEventBus.publish({
      eventName: 'TestGlobalEvent',
      occurredOn: new Date(),
      payload: { test: true },
    })

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should be independent of local instances', async () => {
    const localBus = new DomainEventBus()
    const globalHandler = vi.fn()
    const localHandler = vi.fn()

    domainEventBus.subscribe('TestEvent', { handle: globalHandler })
    localBus.subscribe('TestEvent', { handle: localHandler })

    const testEvent: DomainEvent = {
      eventName: 'TestEvent',
      occurredOn: new Date(),
      payload: { source: 'test' },
    }

    // Publish to global bus
    await domainEventBus.publish(testEvent)
    expect(globalHandler).toHaveBeenCalledTimes(1)
    expect(localHandler).not.toHaveBeenCalled()

    // Publish to local bus
    await localBus.publish(testEvent)
    expect(globalHandler).toHaveBeenCalledTimes(1) // Still only once
    expect(localHandler).toHaveBeenCalledTimes(1)
  })
})

describe('EventHandler interface', () => {
  it('should support synchronous handlers', () => {
    const syncHandler: EventHandler<DomainEvent> = {
      handle: (event) => {
        expect(event.eventName).toBeDefined()
        expect(event.occurredOn).toBeInstanceOf(Date)
        expect(event.payload).toBeDefined()
      },
    }

    expect(typeof syncHandler.handle).toBe('function')
  })

  it('should support asynchronous handlers', () => {
    const asyncHandler: EventHandler<DomainEvent> = {
      handle: async (event) => {
        await new Promise((resolve) => setTimeout(resolve, 1))
        expect(event.eventName).toBeDefined()
      },
    }

    expect(typeof asyncHandler.handle).toBe('function')
  })

  it('should be type-safe for specific event types', () => {
    const opportunityHandler: EventHandler<OpportunityCreated> = {
      handle: (event) => {
        // TypeScript should enforce that this is an OpportunityCreated event
        expect(event.eventName).toBe('OpportunityCreated')
        expect(event.payload.opportunityId).toBeDefined()
        expect(event.payload.organizationId).toBeDefined()
        expect(event.payload.stage).toBeDefined()
        expect(event.payload.value).toBeDefined()
      },
    }

    expect(typeof opportunityHandler.handle).toBe('function')
  })
})
