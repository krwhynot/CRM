import { describe, it, expect } from 'vitest'
import { OpportunityRules } from '../OpportunityRules'
import { BusinessRuleViolation } from '../../shared/BusinessRules'
import type {
  OpportunityStage,
  OpportunityStatus,
  OpportunityDomain,
  OpportunityNameContext,
} from '../OpportunityTypes'

describe('OpportunityRules', () => {
  describe('validateStageTransition', () => {
    describe('valid forward transitions', () => {
      it('should allow transition from New Lead to Initial Outreach', () => {
        const result = OpportunityRules.validateStageTransition('New Lead', 'Initial Outreach')
        expect(result.isValid).toBe(true)
        expect(result.reason).toBeUndefined()
      })

      it('should allow transition from Initial Outreach to Sample/Visit Offered', () => {
        const result = OpportunityRules.validateStageTransition(
          'Initial Outreach',
          'Sample/Visit Offered'
        )
        expect(result.isValid).toBe(true)
      })

      it('should allow transition from Awaiting Response to Feedback Logged', () => {
        const result = OpportunityRules.validateStageTransition(
          'Awaiting Response',
          'Feedback Logged'
        )
        expect(result.isValid).toBe(true)
      })

      it('should allow transition from Demo Scheduled to Closed - Won', () => {
        const result = OpportunityRules.validateStageTransition('Demo Scheduled', 'Closed - Won')
        expect(result.isValid).toBe(true)
      })

      it('should allow transition from Demo Scheduled to Closed - Lost', () => {
        const result = OpportunityRules.validateStageTransition('Demo Scheduled', 'Closed - Lost')
        expect(result.isValid).toBe(true)
      })
    })

    describe('valid transitions to closed states', () => {
      it('should allow transition from any active stage to Closed - Lost', () => {
        const activeStages: OpportunityStage[] = [
          'New Lead',
          'Initial Outreach',
          'Sample/Visit Offered',
          'Awaiting Response',
          'Feedback Logged',
          'Demo Scheduled',
        ]

        activeStages.forEach((stage) => {
          const result = OpportunityRules.validateStageTransition(stage, 'Closed - Lost')
          expect(result.isValid).toBe(true)
        })
      })

      it('should allow transition from Feedback Logged to Closed - Won', () => {
        const result = OpportunityRules.validateStageTransition('Feedback Logged', 'Closed - Won')
        expect(result.isValid).toBe(true)
      })
    })

    describe('same stage transitions', () => {
      it('should allow staying in the same stage', () => {
        const stages: OpportunityStage[] = [
          'New Lead',
          'Initial Outreach',
          'Sample/Visit Offered',
          'Awaiting Response',
          'Feedback Logged',
          'Demo Scheduled',
          'Closed - Won',
          'Closed - Lost',
        ]

        stages.forEach((stage) => {
          const result = OpportunityRules.validateStageTransition(stage, stage)
          expect(result.isValid).toBe(true)
        })
      })
    })

    describe('regression transitions', () => {
      it('should allow regression from later to earlier stages', () => {
        const result1 = OpportunityRules.validateStageTransition('Demo Scheduled', 'New Lead')
        expect(result1.isValid).toBe(true)
        expect(result1.reason).toBe('Stage regression allowed for process correction')

        const result2 = OpportunityRules.validateStageTransition(
          'Feedback Logged',
          'Initial Outreach'
        )
        expect(result2.isValid).toBe(true)
        expect(result2.reason).toBe('Stage regression allowed for process correction')

        const result3 = OpportunityRules.validateStageTransition('Awaiting Response', 'New Lead')
        expect(result3.isValid).toBe(true)
        expect(result3.reason).toBe('Stage regression allowed for process correction')
      })

      it('should not allow regression from closed states', () => {
        const result1 = OpportunityRules.validateStageTransition('Closed - Won', 'Demo Scheduled')
        expect(result1.isValid).toBe(false)

        const result2 = OpportunityRules.validateStageTransition('Closed - Lost', 'New Lead')
        expect(result2.isValid).toBe(false)
      })
    })

    describe('invalid transitions', () => {
      it('should reject invalid forward transitions', () => {
        const result = OpportunityRules.validateStageTransition('New Lead', 'Demo Scheduled')
        expect(result.isValid).toBe(false)
        expect(result.reason).toBe('Cannot transition from New Lead to Demo Scheduled')
        expect(result.suggestedStage).toBe('Initial Outreach')
      })

      it('should reject transitions from closed states', () => {
        const result1 = OpportunityRules.validateStageTransition('Closed - Won', 'New Lead')
        expect(result1.isValid).toBe(false)

        const result2 = OpportunityRules.validateStageTransition(
          'Closed - Lost',
          'Initial Outreach'
        )
        expect(result2.isValid).toBe(false)
      })

      it('should provide suggested stage for invalid transitions', () => {
        const result = OpportunityRules.validateStageTransition(
          'Sample/Visit Offered',
          'Closed - Won'
        )
        expect(result.isValid).toBe(false)
        expect(result.suggestedStage).toBe('Awaiting Response')
      })
    })

    describe('edge cases', () => {
      it('should handle all valid stage combinations systematically', () => {
        const stageTransitions = {
          'New Lead': ['Initial Outreach', 'Closed - Lost'],
          'Initial Outreach': ['Sample/Visit Offered', 'Awaiting Response', 'Closed - Lost'],
          'Sample/Visit Offered': ['Awaiting Response', 'Demo Scheduled', 'Closed - Lost'],
          'Awaiting Response': ['Feedback Logged', 'Demo Scheduled', 'Closed - Lost'],
          'Feedback Logged': ['Demo Scheduled', 'Closed - Won', 'Closed - Lost'],
          'Demo Scheduled': ['Closed - Won', 'Closed - Lost'],
          'Closed - Won': [],
          'Closed - Lost': [],
        }

        Object.entries(stageTransitions).forEach(([fromStage, toStages]) => {
          toStages.forEach((toStage) => {
            const result = OpportunityRules.validateStageTransition(
              fromStage as OpportunityStage,
              toStage as OpportunityStage
            )
            expect(result.isValid).toBe(true)
          })
        })
      })
    })
  })

  describe('validateOpportunityData', () => {
    describe('required field validation', () => {
      it('should require opportunity name', () => {
        expect(() => {
          OpportunityRules.validateOpportunityData({ organization_id: 'org-123' })
        }).toThrow(BusinessRuleViolation)

        expect(() => {
          OpportunityRules.validateOpportunityData({ name: '', organization_id: 'org-123' })
        }).toThrow('Business rule violation [REQUIRED_NAME]: Opportunity name is required')

        expect(() => {
          OpportunityRules.validateOpportunityData({ name: '   ', organization_id: 'org-123' })
        }).toThrow(BusinessRuleViolation)
      })

      it('should require organization_id', () => {
        expect(() => {
          OpportunityRules.validateOpportunityData({ name: 'Test Opportunity' })
        }).toThrow('Business rule violation [REQUIRED_ORGANIZATION]: Organization is required')

        expect(() => {
          OpportunityRules.validateOpportunityData({
            name: 'Test Opportunity',
            organization_id: '',
          })
        }).toThrow(BusinessRuleViolation)
      })
    })

    describe('value validation', () => {
      it('should accept valid estimated values', () => {
        expect(() => {
          OpportunityRules.validateOpportunityData({
            name: 'Test Opportunity',
            organization_id: 'org-123',
            estimated_value: 0,
          })
        }).not.toThrow()

        expect(() => {
          OpportunityRules.validateOpportunityData({
            name: 'Test Opportunity',
            organization_id: 'org-123',
            estimated_value: 1000.5,
          })
        }).not.toThrow()

        expect(() => {
          OpportunityRules.validateOpportunityData({
            name: 'Test Opportunity',
            organization_id: 'org-123',
            estimated_value: 999999.99,
          })
        }).not.toThrow()
      })

      it('should reject invalid estimated values', () => {
        expect(() => {
          OpportunityRules.validateOpportunityData({
            name: 'Test Opportunity',
            organization_id: 'org-123',
            estimated_value: -100,
          })
        }).toThrow(
          'Business rule violation [INVALID_VALUE]: Estimated value must be a positive number'
        )

        expect(() => {
          OpportunityRules.validateOpportunityData({
            name: 'Test Opportunity',
            organization_id: 'org-123',
            estimated_value: Number.POSITIVE_INFINITY,
          })
        }).toThrow(BusinessRuleViolation)

        expect(() => {
          OpportunityRules.validateOpportunityData({
            name: 'Test Opportunity',
            organization_id: 'org-123',
            estimated_value: NaN,
          })
        }).toThrow(BusinessRuleViolation)
      })
    })

    describe('name length validation', () => {
      it('should accept names within length limit', () => {
        const validNames = [
          'A', // Minimum
          'Regular Opportunity Name',
          'A'.repeat(255), // Maximum
        ]

        validNames.forEach((name) => {
          expect(() => {
            OpportunityRules.validateOpportunityData({
              name,
              organization_id: 'org-123',
            })
          }).not.toThrow()
        })
      })

      it('should reject names that are too long', () => {
        const tooLongName = 'A'.repeat(256)

        expect(() => {
          OpportunityRules.validateOpportunityData({
            name: tooLongName,
            organization_id: 'org-123',
          })
        }).toThrow(
          'Business rule violation [NAME_TOO_LONG]: Opportunity name must be 255 characters or less'
        )
      })
    })

    describe('close date validation', () => {
      it('should accept future close dates for active opportunities', () => {
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + 30)

        expect(() => {
          OpportunityRules.validateOpportunityData({
            name: 'Test Opportunity',
            organization_id: 'org-123',
            stage: 'New Lead',
            close_date: futureDate.toISOString(),
          })
        }).not.toThrow()
      })

      it('should accept past close dates for closed opportunities', () => {
        const pastDate = new Date()
        pastDate.setDate(pastDate.getDate() - 30)

        expect(() => {
          OpportunityRules.validateOpportunityData({
            name: 'Test Opportunity',
            organization_id: 'org-123',
            stage: 'Closed - Won',
            close_date: pastDate.toISOString(),
          })
        }).not.toThrow()

        expect(() => {
          OpportunityRules.validateOpportunityData({
            name: 'Test Opportunity',
            organization_id: 'org-123',
            stage: 'Closed - Lost',
            close_date: pastDate.toISOString(),
          })
        }).not.toThrow()
      })

      it('should reject past close dates for active opportunities', () => {
        const pastDate = new Date()
        pastDate.setDate(pastDate.getDate() - 30)

        expect(() => {
          OpportunityRules.validateOpportunityData({
            name: 'Test Opportunity',
            organization_id: 'org-123',
            stage: 'New Lead',
            close_date: pastDate.toISOString(),
          })
        }).toThrow('Business rule violation [INVALID_CLOSE_DATE]: Close date cannot be in the past')
      })

      it('should handle missing close dates', () => {
        expect(() => {
          OpportunityRules.validateOpportunityData({
            name: 'Test Opportunity',
            organization_id: 'org-123',
            stage: 'New Lead',
            // close_date is undefined
          })
        }).not.toThrow()
      })
    })

    describe('valid complete data', () => {
      it('should accept fully valid opportunity data', () => {
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + 30)

        const validOpportunity: Partial<OpportunityDomain> = {
          name: 'Valid Opportunity',
          organization_id: 'org-123',
          contact_id: 'contact-456',
          principal_organization_id: 'principal-789',
          stage: 'New Lead',
          status: 'Active',
          estimated_value: 50000,
          close_date: futureDate.toISOString(),
          notes: 'Some notes about this opportunity',
          context: 'Site Visit',
        }

        expect(() => {
          OpportunityRules.validateOpportunityData(validOpportunity)
        }).not.toThrow()
      })
    })
  })

  describe('stage classification methods', () => {
    describe('isActiveStage', () => {
      it('should identify active stages correctly', () => {
        const activeStages: OpportunityStage[] = [
          'New Lead',
          'Initial Outreach',
          'Sample/Visit Offered',
          'Awaiting Response',
          'Feedback Logged',
          'Demo Scheduled',
        ]

        activeStages.forEach((stage) => {
          expect(OpportunityRules.isActiveStage(stage)).toBe(true)
        })
      })

      it('should identify closed stages as not active', () => {
        expect(OpportunityRules.isActiveStage('Closed - Won')).toBe(false)
        expect(OpportunityRules.isActiveStage('Closed - Lost')).toBe(false)
      })
    })

    describe('isClosedStage', () => {
      it('should identify closed stages correctly', () => {
        expect(OpportunityRules.isClosedStage('Closed - Won')).toBe(true)
        expect(OpportunityRules.isClosedStage('Closed - Lost')).toBe(true)
      })

      it('should identify active stages as not closed', () => {
        const activeStages: OpportunityStage[] = [
          'New Lead',
          'Initial Outreach',
          'Sample/Visit Offered',
          'Awaiting Response',
          'Feedback Logged',
          'Demo Scheduled',
        ]

        activeStages.forEach((stage) => {
          expect(OpportunityRules.isClosedStage(stage)).toBe(false)
        })
      })
    })

    describe('isWonStage', () => {
      it('should identify won stage correctly', () => {
        expect(OpportunityRules.isWonStage('Closed - Won')).toBe(true)
      })

      it('should identify non-won stages correctly', () => {
        const nonWonStages: OpportunityStage[] = [
          'New Lead',
          'Initial Outreach',
          'Sample/Visit Offered',
          'Awaiting Response',
          'Feedback Logged',
          'Demo Scheduled',
          'Closed - Lost',
        ]

        nonWonStages.forEach((stage) => {
          expect(OpportunityRules.isWonStage(stage)).toBe(false)
        })
      })
    })

    describe('isLostStage', () => {
      it('should identify lost stage correctly', () => {
        expect(OpportunityRules.isLostStage('Closed - Lost')).toBe(true)
      })

      it('should identify non-lost stages correctly', () => {
        const nonLostStages: OpportunityStage[] = [
          'New Lead',
          'Initial Outreach',
          'Sample/Visit Offered',
          'Awaiting Response',
          'Feedback Logged',
          'Demo Scheduled',
          'Closed - Won',
        ]

        nonLostStages.forEach((stage) => {
          expect(OpportunityRules.isLostStage(stage)).toBe(false)
        })
      })
    })
  })

  describe('default values', () => {
    it('should return correct default stage', () => {
      expect(OpportunityRules.getDefaultStage()).toBe('New Lead')
    })

    it('should return correct default status', () => {
      expect(OpportunityRules.getDefaultStatus()).toBe('Active')
    })
  })

  describe('generateOpportunityName', () => {
    it('should generate basic name with organization only', () => {
      const context: OpportunityNameContext = {
        organizationName: 'Acme Corp',
      }

      const name = OpportunityRules.generateOpportunityName(context)
      expect(name).toBe('Acme Corp')
    })

    it('should include context when provided', () => {
      const context: OpportunityNameContext = {
        organizationName: 'Acme Corp',
        context: 'Site Visit',
      }

      const name = OpportunityRules.generateOpportunityName(context)
      expect(name).toBe('Acme Corp - Site Visit')
    })

    it('should include principal name when provided', () => {
      const context: OpportunityNameContext = {
        organizationName: 'Acme Corp',
        context: 'Food Show',
        principalName: 'Coca-Cola',
      }

      const name = OpportunityRules.generateOpportunityName(context)
      expect(name).toBe('Acme Corp - Food Show (Coca-Cola)')
    })

    it('should include sequence number when existing opportunities exist', () => {
      const context: OpportunityNameContext = {
        organizationName: 'Acme Corp',
        context: 'Site Visit',
        principalName: 'Pepsi',
        existingOpportunityCount: 2,
      }

      const name = OpportunityRules.generateOpportunityName(context)
      expect(name).toBe('Acme Corp - Site Visit (Pepsi) #3')
    })

    it('should handle Custom context correctly', () => {
      const context: OpportunityNameContext = {
        organizationName: 'Acme Corp',
        context: 'Custom',
      }

      const name = OpportunityRules.generateOpportunityName(context)
      expect(name).toBe('Acme Corp') // Custom should be ignored
    })

    it('should handle minimal configuration', () => {
      const context: OpportunityNameContext = {
        organizationName: 'Simple Corp',
        existingOpportunityCount: 0,
      }

      const name = OpportunityRules.generateOpportunityName(context)
      expect(name).toBe('Simple Corp')
    })
  })

  describe('validateStatusTransition', () => {
    it('should allow valid status transitions for active stages', () => {
      expect(OpportunityRules.validateStatusTransition('Active', 'On Hold', 'New Lead')).toBe(true)
      expect(OpportunityRules.validateStatusTransition('On Hold', 'Active', 'Demo Scheduled')).toBe(
        true
      )
      expect(
        OpportunityRules.validateStatusTransition('Active', 'Qualified', 'Feedback Logged')
      ).toBe(true)
    })

    it('should enforce closed status for closed stages', () => {
      expect(OpportunityRules.validateStatusTransition('Active', 'Closed - Won', 'New Lead')).toBe(
        false
      )
      expect(
        OpportunityRules.validateStatusTransition('Active', 'Closed - Lost', 'Demo Scheduled')
      ).toBe(false)
    })

    it('should require matching status for closed stages', () => {
      expect(
        OpportunityRules.validateStatusTransition('Closed - Won', 'Closed - Won', 'Closed - Won')
      ).toBe(true)
      expect(
        OpportunityRules.validateStatusTransition('Closed - Lost', 'Closed - Lost', 'Closed - Lost')
      ).toBe(true)
      expect(
        OpportunityRules.validateStatusTransition('Closed - Won', 'Active', 'Closed - Won')
      ).toBe(false)
      expect(
        OpportunityRules.validateStatusTransition('Closed - Lost', 'On Hold', 'Closed - Lost')
      ).toBe(false)
    })

    it('should allow closed status transitions for closed stages', () => {
      expect(
        OpportunityRules.validateStatusTransition('Closed - Won', 'Closed - Won', 'Closed - Won')
      ).toBe(true)
      expect(
        OpportunityRules.validateStatusTransition('Closed - Lost', 'Closed - Lost', 'Closed - Lost')
      ).toBe(true)
    })
  })

  describe('pipeline calculations', () => {
    const sampleOpportunities: OpportunityDomain[] = [
      {
        id: '1',
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
        name: 'Opp 1',
        organization_id: 'org-1',
        stage: 'Closed - Won',
        status: 'Closed - Won',
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

    describe('calculateWinRate', () => {
      it('should calculate correct win rate', () => {
        const winRate = OpportunityRules.calculateWinRate(sampleOpportunities)
        // 2 won out of 3 closed (won + lost) = 66.67%
        expect(winRate).toBeCloseTo(66.67, 2)
      })

      it('should return 0 for no closed opportunities', () => {
        const activeOnly = sampleOpportunities.filter((opp) =>
          OpportunityRules.isActiveStage(opp.stage)
        )
        const winRate = OpportunityRules.calculateWinRate(activeOnly)
        expect(winRate).toBe(0)
      })

      it('should return 100 for all won opportunities', () => {
        const wonOnly = sampleOpportunities.filter((opp) => OpportunityRules.isWonStage(opp.stage))
        const winRate = OpportunityRules.calculateWinRate(wonOnly)
        expect(winRate).toBe(100)
      })
    })

    describe('calculateAverageDealSize', () => {
      it('should calculate correct average deal size', () => {
        const avgSize = OpportunityRules.calculateAverageDealSize(sampleOpportunities)
        // (10000 + 20000 + 15000 + 25000) / 4 = 17500
        expect(avgSize).toBe(17500)
      })

      it('should return 0 for empty array', () => {
        const avgSize = OpportunityRules.calculateAverageDealSize([])
        expect(avgSize).toBe(0)
      })

      it('should handle single opportunity', () => {
        const singleOpp = [sampleOpportunities[0]]
        const avgSize = OpportunityRules.calculateAverageDealSize(singleOpp)
        expect(avgSize).toBe(10000)
      })
    })
  })
})
