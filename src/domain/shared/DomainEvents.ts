import type { DomainEvent } from './BaseEntity'

/**
 * Domain events for tracking business state changes
 */

// Opportunity Events
export interface OpportunityCreated extends DomainEvent {
  eventName: 'OpportunityCreated'
  payload: {
    opportunityId: string
    organizationId: string
    stage: string
    value: number
  }
}

export interface OpportunityStageChanged extends DomainEvent {
  eventName: 'OpportunityStageChanged'
  payload: {
    opportunityId: string
    oldStage: string
    newStage: string
    changedBy?: string
  }
}

export interface OpportunityValueUpdated extends DomainEvent {
  eventName: 'OpportunityValueUpdated'
  payload: {
    opportunityId: string
    oldValue: number
    newValue: number
  }
}

export interface OpportunityClosed extends DomainEvent {
  eventName: 'OpportunityClosed'
  payload: {
    opportunityId: string
    finalStage: 'Closed - Won' | 'Closed - Lost'
    finalValue: number
    closedAt: Date
  }
}

// Organization Events
export interface OrganizationCreated extends DomainEvent {
  eventName: 'OrganizationCreated'
  payload: {
    organizationId: string
    name: string
    type: string
    segment: string
  }
}

export interface OrganizationPriorityChanged extends DomainEvent {
  eventName: 'OrganizationPriorityChanged'
  payload: {
    organizationId: string
    oldPriority: string
    newPriority: string
  }
}

// Contact Events
export interface ContactCreated extends DomainEvent {
  eventName: 'ContactCreated'
  payload: {
    contactId: string
    organizationId: string
    name: string
    decisionAuthority: string
  }
}

export interface ContactAuthorityChanged extends DomainEvent {
  eventName: 'ContactAuthorityChanged'
  payload: {
    contactId: string
    oldAuthority: string
    newAuthority: string
  }
}

// Interaction Events
export interface InteractionLogged extends DomainEvent {
  eventName: 'InteractionLogged'
  payload: {
    interactionId: string
    type: string
    organizationId?: string
    contactId?: string
    opportunityId?: string
  }
}

// Union type of all domain events
export type CRMDomainEvent =
  | OpportunityCreated
  | OpportunityStageChanged
  | OpportunityValueUpdated
  | OpportunityClosed
  | OrganizationCreated
  | OrganizationPriorityChanged
  | ContactCreated
  | ContactAuthorityChanged
  | InteractionLogged

/**
 * Event handler interface
 */
export interface EventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void> | void
}

/**
 * Simple event bus for domain events
 */
export class DomainEventBus {
  private handlers: Map<string, EventHandler<any>[]> = new Map()

  subscribe<T extends DomainEvent>(eventName: T['eventName'], handler: EventHandler<T>): void {
    const eventHandlers = this.handlers.get(eventName) || []
    eventHandlers.push(handler)
    this.handlers.set(eventName, eventHandlers)
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventName) || []

    // Execute handlers in parallel
    await Promise.all(handlers.map((handler) => handler.handle(event)))
  }

  unsubscribe(eventName: string, handler: EventHandler<any>): void {
    const handlers = this.handlers.get(eventName) || []
    const index = handlers.indexOf(handler)
    if (index > -1) {
      handlers.splice(index, 1)
    }
  }

  clear(): void {
    this.handlers.clear()
  }
}

// Global event bus instance
export const domainEventBus = new DomainEventBus()
