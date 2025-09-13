import type {
  OpportunityStage,
  OpportunityStatus,
  StageTransitionResult,
  OpportunityDomain,
  OpportunityNameContext,
} from './OpportunityTypes'
import { BusinessRuleViolation, ValidationRules } from '../shared/BusinessRules'

/**
 * Opportunity business rules and validation logic
 * Extracted from existing opportunity-stage-mapping.ts and form validation
 */

export class OpportunityRules {
  /**
   * Stage progression rules - opportunities should generally move forward
   */
  private static readonly STAGE_PROGRESSION: Record<OpportunityStage, OpportunityStage[]> = {
    'New Lead': ['Initial Outreach', 'Closed - Lost'],
    'Initial Outreach': ['Sample/Visit Offered', 'Awaiting Response', 'Closed - Lost'],
    'Sample/Visit Offered': ['Awaiting Response', 'Demo Scheduled', 'Closed - Lost'],
    'Awaiting Response': ['Feedback Logged', 'Demo Scheduled', 'Closed - Lost'],
    'Feedback Logged': ['Demo Scheduled', 'Closed - Won', 'Closed - Lost'],
    'Demo Scheduled': ['Closed - Won', 'Closed - Lost'],
    'Closed - Won': [], // Final state
    'Closed - Lost': [], // Final state
  }

  /**
   * Validate stage transition
   */
  static validateStageTransition(
    currentStage: OpportunityStage,
    newStage: OpportunityStage
  ): StageTransitionResult {
    // Same stage is always valid
    if (currentStage === newStage) {
      return { isValid: true }
    }

    // Check if transition is allowed
    const allowedTransitions = this.STAGE_PROGRESSION[currentStage]

    if (allowedTransitions.includes(newStage)) {
      return { isValid: true }
    }

    // Special case: can always go back to earlier stages (regression)
    if (this.isRegressionTransition(currentStage, newStage)) {
      return {
        isValid: true,
        reason: 'Stage regression allowed for process correction',
      }
    }

    // Invalid transition
    return {
      isValid: false,
      reason: `Cannot transition from ${currentStage} to ${newStage}`,
      suggestedStage: allowedTransitions[0], // Suggest first valid option
    }
  }

  /**
   * Check if transition is a regression (moving backward)
   */
  private static isRegressionTransition(
    currentStage: OpportunityStage,
    newStage: OpportunityStage
  ): boolean {
    const stageOrder: OpportunityStage[] = [
      'New Lead',
      'Initial Outreach',
      'Sample/Visit Offered',
      'Awaiting Response',
      'Feedback Logged',
      'Demo Scheduled',
      'Closed - Won',
      'Closed - Lost',
    ]

    const currentIndex = stageOrder.indexOf(currentStage)
    const newIndex = stageOrder.indexOf(newStage)

    // Don't allow regression from closed states
    if (currentStage === 'Closed - Won' || currentStage === 'Closed - Lost') {
      return false
    }

    return newIndex < currentIndex
  }

  /**
   * Validate opportunity data
   */
  static validateOpportunityData(data: Partial<OpportunityDomain>): void {
    // Required fields
    if (!ValidationRules.required.string(data.name)) {
      throw new BusinessRuleViolation('REQUIRED_NAME', 'Opportunity name is required')
    }

    if (!data.organization_id) {
      throw new BusinessRuleViolation('REQUIRED_ORGANIZATION', 'Organization is required')
    }

    // Value validation
    if (
      data.estimated_value !== undefined &&
      !ValidationRules.currency.validate(data.estimated_value)
    ) {
      throw new BusinessRuleViolation('INVALID_VALUE', 'Estimated value must be a positive number')
    }

    // Name length validation
    if (data.name && data.name.length > 255) {
      throw new BusinessRuleViolation(
        'NAME_TOO_LONG',
        'Opportunity name must be 255 characters or less'
      )
    }

    // Close date validation
    if (data.close_date && new Date(data.close_date) < new Date()) {
      // Only validate if not already closed
      if (data.stage && !this.isClosedStage(data.stage)) {
        throw new BusinessRuleViolation('INVALID_CLOSE_DATE', 'Close date cannot be in the past')
      }
    }
  }

  /**
   * Check if stage is active (not closed)
   */
  static isActiveStage(stage: OpportunityStage): boolean {
    return stage !== 'Closed - Won' && stage !== 'Closed - Lost'
  }

  /**
   * Check if stage is closed
   */
  static isClosedStage(stage: OpportunityStage): boolean {
    return stage === 'Closed - Won' || stage === 'Closed - Lost'
  }

  /**
   * Check if stage is won
   */
  static isWonStage(stage: OpportunityStage): boolean {
    return stage === 'Closed - Won'
  }

  /**
   * Check if stage is lost
   */
  static isLostStage(stage: OpportunityStage): boolean {
    return stage === 'Closed - Lost'
  }

  /**
   * Get default stage for new opportunities
   */
  static getDefaultStage(): OpportunityStage {
    return 'New Lead'
  }

  /**
   * Get default status for new opportunities
   */
  static getDefaultStatus(): OpportunityStatus {
    return 'Active'
  }

  /**
   * Generate opportunity name based on context
   */
  static generateOpportunityName(context: OpportunityNameContext): string {
    const {
      organizationName,
      context: oppContext,
      principalName,
      existingOpportunityCount = 0,
    } = context

    let baseName = organizationName

    // Add context if provided
    if (oppContext && oppContext !== 'Custom') {
      baseName += ` - ${oppContext}`
    }

    // Add principal if provided
    if (principalName) {
      baseName += ` (${principalName})`
    }

    // Add sequence number if there are existing opportunities
    if (existingOpportunityCount > 0) {
      baseName += ` #${existingOpportunityCount + 1}`
    }

    return baseName
  }

  /**
   * Validate status transition
   */
  static validateStatusTransition(
    currentStatus: OpportunityStatus,
    newStatus: OpportunityStatus,
    currentStage: OpportunityStage
  ): boolean {
    // If moving to closed status, must be in closed stage
    if (
      (newStatus === 'Closed - Won' || newStatus === 'Closed - Lost') &&
      !this.isClosedStage(currentStage)
    ) {
      return false
    }

    // If in closed stage, status should match
    if (currentStage === 'Closed - Won' && newStatus !== 'Closed - Won') {
      return false
    }

    if (currentStage === 'Closed - Lost' && newStatus !== 'Closed - Lost') {
      return false
    }

    return true
  }

  /**
   * Calculate win rate from opportunities
   */
  static calculateWinRate(opportunities: OpportunityDomain[]): number {
    const closedOpps = opportunities.filter((opp) => this.isClosedStage(opp.stage))
    if (closedOpps.length === 0) return 0

    const wonOpps = closedOpps.filter((opp) => this.isWonStage(opp.stage))
    return (wonOpps.length / closedOpps.length) * 100
  }

  /**
   * Calculate average deal size
   */
  static calculateAverageDealSize(opportunities: OpportunityDomain[]): number {
    if (opportunities.length === 0) return 0

    const totalValue = opportunities.reduce((sum, opp) => sum + opp.estimated_value, 0)
    return totalValue / opportunities.length
  }
}
