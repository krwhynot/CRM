/**
 * Base entity interface for all domain entities
 * Provides common properties and methods for domain objects
 */
export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
}

/**
 * Result type for domain operations
 * Provides consistent error handling across domain services
 */
export class Result<T> {
  constructor(
    private readonly _isSuccess: boolean,
    private readonly _value?: T,
    private readonly _error?: string
  ) {}

  get isSuccess(): boolean {
    return this._isSuccess
  }

  get isFailure(): boolean {
    return !this._isSuccess
  }

  get value(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot get value from failed result')
    }
    return this._value!
  }

  get error(): string {
    if (this._isSuccess) {
      throw new Error('Cannot get error from successful result')
    }
    return this._error!
  }

  static success<T>(value: T): Result<T> {
    return new Result(true, value)
  }

  static failure<T>(error: string): Result<T> {
    return new Result<T>(false, undefined, error)
  }
}

/**
 * Base repository interface
 * Defines common data access patterns for all entities
 */
export interface BaseRepository<T extends BaseEntity> {
  findById(id: string): Promise<T | null>
  findAll(): Promise<T[]>
  create(entity: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T>
  update(entity: T): Promise<T>
  delete(id: string): Promise<void>
  softDelete(id: string): Promise<void>
}

/**
 * Domain event interface
 * For implementing domain event patterns
 */
export interface DomainEvent {
  eventName: string
  occurredOn: Date
  payload: Record<string, any>
}

/**
 * Domain service base class
 * Provides common functionality for domain services
 */
export abstract class DomainService {
  private events: DomainEvent[] = []

  protected emit(eventName: string, payload: Record<string, any>): void {
    this.events.push({
      eventName,
      occurredOn: new Date(),
      payload,
    })
  }

  public getEvents(): DomainEvent[] {
    return [...this.events]
  }

  public clearEvents(): void {
    this.events = []
  }
}
