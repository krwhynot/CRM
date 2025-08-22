// Constants for easier access
export const DB_STAGES = [
  'New Lead',
  'Initial Outreach',
  'Sample/Visit Offered',
  'Awaiting Response',
  'Feedback Logged',
  'Demo Scheduled',
  'Closed - Won',
  'Closed - Lost'
] as const

export const DEFAULT_OPPORTUNITY_STAGE: OpportunityStageDB = 'New Lead'

export const CODE_STAGES = [
  'lead',
  'qualified', 
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost'
] as const

// Database enum type - the database stores display values directly
export type OpportunityStageDB = typeof DB_STAGES[number]

// Application/UI coded values for internal logic (when needed)
export type OpportunityStageCode = typeof CODE_STAGES[number]

// The database stores display values, so we map database -> application codes
export const OPPORTUNITY_STAGE_DB_TO_CODE: Record<OpportunityStageDB, OpportunityStageCode> = {
  'New Lead': 'lead',
  'Initial Outreach': 'qualified',
  'Sample/Visit Offered': 'proposal',
  'Awaiting Response': 'proposal', // Both map to proposal stage
  'Feedback Logged': 'negotiation',
  'Demo Scheduled': 'negotiation', // Both map to negotiation stage
  'Closed - Won': 'closed_won',
  'Closed - Lost': 'closed_lost'
}

// Reverse mapping for code to preferred database display value
export const OPPORTUNITY_STAGE_CODE_TO_DB: Record<OpportunityStageCode, OpportunityStageDB> = {
  'lead': 'New Lead',
  'qualified': 'Initial Outreach',
  'proposal': 'Sample/Visit Offered',
  'negotiation': 'Demo Scheduled', 
  'closed_won': 'Closed - Won',
  'closed_lost': 'Closed - Lost'
}

// Utility functions for conversion
export function dbStageToCode(dbStage: OpportunityStageDB): OpportunityStageCode {
  return OPPORTUNITY_STAGE_DB_TO_CODE[dbStage]
}

export function codeStageToDb(codeStage: OpportunityStageCode): OpportunityStageDB {
  return OPPORTUNITY_STAGE_CODE_TO_DB[codeStage]
}

// Type guard functions
export function isValidDbStage(stage: string): stage is OpportunityStageDB {
  return DB_STAGES.includes(stage as OpportunityStageDB)
}

export function isValidCodeStage(stage: string): stage is OpportunityStageCode {
  return CODE_STAGES.includes(stage as OpportunityStageCode)
}

// Create properly typed stage records for metrics
export function createDbStageRecord<T>(defaultValue: T): Record<OpportunityStageDB, T> {
  return {
    'New Lead': defaultValue,
    'Initial Outreach': defaultValue,
    'Sample/Visit Offered': defaultValue,
    'Awaiting Response': defaultValue,
    'Feedback Logged': defaultValue,
    'Demo Scheduled': defaultValue,
    'Closed - Won': defaultValue,
    'Closed - Lost': defaultValue
  }
}

export function createCodeStageRecord<T>(defaultValue: T): Record<OpportunityStageCode, T> {
  return {
    'lead': defaultValue,
    'qualified': defaultValue,
    'proposal': defaultValue,
    'negotiation': defaultValue,
    'closed_won': defaultValue,
    'closed_lost': defaultValue
  }
}

// Convert between record types
export function convertDbStageRecordToCode<T>(
  dbRecord: Record<OpportunityStageDB, T>
): Record<OpportunityStageCode, T> {
  const codeRecord = createCodeStageRecord<T>(dbRecord['New Lead']) // Use 'New Lead' as default
  
  Object.entries(OPPORTUNITY_STAGE_DB_TO_CODE).forEach(([dbStage, codeStage]) => {
    if (dbRecord[dbStage as OpportunityStageDB] !== undefined) {
      // For stages that map to the same code, take the first occurrence or sum/aggregate as needed
      codeRecord[codeStage] = dbRecord[dbStage as OpportunityStageDB]
    }
  })
  
  return codeRecord
}

export function convertCodeStageRecordToDb<T>(
  codeRecord: Record<OpportunityStageCode, T>
): Record<OpportunityStageDB, T> {
  const dbRecord = createDbStageRecord<T>(codeRecord['lead']) // Use 'lead' as default
  
  Object.entries(OPPORTUNITY_STAGE_CODE_TO_DB).forEach(([codeStage, dbStage]) => {
    if (codeRecord[codeStage as OpportunityStageCode] !== undefined) {
      dbRecord[dbStage] = codeRecord[codeStage as OpportunityStageCode]
    }
  })
  
  return dbRecord
}

// Active stage helpers using database enum values
export function isActiveStage(stage: OpportunityStageDB): boolean {
  return stage !== 'Closed - Won' && stage !== 'Closed - Lost'
}

export function isClosedStage(stage: OpportunityStageDB): boolean {
  return stage === 'Closed - Won' || stage === 'Closed - Lost'
}

export function isWonStage(stage: OpportunityStageDB): boolean {
  return stage === 'Closed - Won'
}

export function isLostStage(stage: OpportunityStageDB): boolean {
  return stage === 'Closed - Lost'
}

// Code stage helpers
export function isActiveCodeStage(stage: OpportunityStageCode): boolean {
  return stage !== 'closed_won' && stage !== 'closed_lost'
}

export function isClosedCodeStage(stage: OpportunityStageCode): boolean {
  return stage === 'closed_won' || stage === 'closed_lost'
}

export function isWonCodeStage(stage: OpportunityStageCode): boolean {
  return stage === 'closed_won'
}

export function isLostCodeStage(stage: OpportunityStageCode): boolean {
  return stage === 'closed_lost'
}
