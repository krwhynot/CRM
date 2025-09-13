import { describe, it, expect } from 'vitest'
import {
  PriorityRules,
  OrganizationTypeRules,
  SegmentRules,
  DecisionAuthorityRules,
  ValidationRules,
  BusinessRuleViolation,
} from '../BusinessRules'

describe('PriorityRules', () => {
  describe('isValidRating', () => {
    it('should accept valid priority ratings', () => {
      expect(PriorityRules.isValidRating('A')).toBe(true)
      expect(PriorityRules.isValidRating('B')).toBe(true)
      expect(PriorityRules.isValidRating('C')).toBe(true)
      expect(PriorityRules.isValidRating('D')).toBe(true)
    })

    it('should reject invalid priority ratings', () => {
      expect(PriorityRules.isValidRating('A+')).toBe(false)
      expect(PriorityRules.isValidRating('F')).toBe(false)
      expect(PriorityRules.isValidRating('E')).toBe(false)
      expect(PriorityRules.isValidRating('')).toBe(false)
      expect(PriorityRules.isValidRating('AA')).toBe(false)
      expect(PriorityRules.isValidRating('1')).toBe(false)
    })

    it('should be case-sensitive', () => {
      expect(PriorityRules.isValidRating('a')).toBe(false)
      expect(PriorityRules.isValidRating('b')).toBe(false)
      expect(PriorityRules.isValidRating('c')).toBe(false)
      expect(PriorityRules.isValidRating('d')).toBe(false)
    })
  })

  describe('compareRatings', () => {
    it('should correctly compare priority ratings (A highest, D lowest)', () => {
      // A is highest priority (index 0)
      expect(PriorityRules.compareRatings('A', 'B')).toBeLessThan(0)
      expect(PriorityRules.compareRatings('A', 'C')).toBeLessThan(0)
      expect(PriorityRules.compareRatings('A', 'D')).toBeLessThan(0)

      // B is higher than C and D
      expect(PriorityRules.compareRatings('B', 'C')).toBeLessThan(0)
      expect(PriorityRules.compareRatings('B', 'D')).toBeLessThan(0)

      // C is higher than D
      expect(PriorityRules.compareRatings('C', 'D')).toBeLessThan(0)

      // Reverse comparisons
      expect(PriorityRules.compareRatings('D', 'A')).toBeGreaterThan(0)
      expect(PriorityRules.compareRatings('C', 'A')).toBeGreaterThan(0)
      expect(PriorityRules.compareRatings('B', 'A')).toBeGreaterThan(0)
    })

    it('should return 0 for equal ratings', () => {
      expect(PriorityRules.compareRatings('A', 'A')).toBe(0)
      expect(PriorityRules.compareRatings('B', 'B')).toBe(0)
      expect(PriorityRules.compareRatings('C', 'C')).toBe(0)
      expect(PriorityRules.compareRatings('D', 'D')).toBe(0)
    })

    it('should handle invalid ratings gracefully', () => {
      // Invalid ratings will return -1 from indexOf, so comparison will be consistent
      const result1 = PriorityRules.compareRatings('X', 'Y')
      const result2 = PriorityRules.compareRatings('Y', 'X')
      expect(result1).toBe(-result2) // Should be inverse of each other
    })
  })

  describe('getDefaultRating', () => {
    it('should return B as default rating', () => {
      expect(PriorityRules.getDefaultRating()).toBe('B')
    })
  })

  describe('validRatings', () => {
    it('should contain exactly 4 ratings in correct order', () => {
      expect(PriorityRules.validRatings).toEqual(['A', 'B', 'C', 'D'])
      expect(PriorityRules.validRatings).toHaveLength(4)
    })
  })
})

describe('OrganizationTypeRules', () => {
  describe('isValidType', () => {
    it('should accept valid organization types', () => {
      expect(OrganizationTypeRules.isValidType('customer')).toBe(true)
      expect(OrganizationTypeRules.isValidType('distributor')).toBe(true)
      expect(OrganizationTypeRules.isValidType('principal')).toBe(true)
      expect(OrganizationTypeRules.isValidType('supplier')).toBe(true)
    })

    it('should reject invalid organization types', () => {
      expect(OrganizationTypeRules.isValidType('vendor')).toBe(false)
      expect(OrganizationTypeRules.isValidType('client')).toBe(false)
      expect(OrganizationTypeRules.isValidType('')).toBe(false)
      expect(OrganizationTypeRules.isValidType('CUSTOMER')).toBe(false)
    })
  })

  describe('canHaveOpportunities', () => {
    it('should only allow customers to have opportunities', () => {
      expect(OrganizationTypeRules.canHaveOpportunities('customer')).toBe(true)
      expect(OrganizationTypeRules.canHaveOpportunities('distributor')).toBe(false)
      expect(OrganizationTypeRules.canHaveOpportunities('principal')).toBe(false)
      expect(OrganizationTypeRules.canHaveOpportunities('supplier')).toBe(false)
    })

    it('should handle invalid types', () => {
      expect(OrganizationTypeRules.canHaveOpportunities('invalid')).toBe(false)
      expect(OrganizationTypeRules.canHaveOpportunities('')).toBe(false)
    })
  })

  describe('canBePrincipal', () => {
    it('should only allow principal type to be principal', () => {
      expect(OrganizationTypeRules.canBePrincipal('principal')).toBe(true)
      expect(OrganizationTypeRules.canBePrincipal('customer')).toBe(false)
      expect(OrganizationTypeRules.canBePrincipal('distributor')).toBe(false)
      expect(OrganizationTypeRules.canBePrincipal('supplier')).toBe(false)
    })
  })

  describe('requiresManager', () => {
    it('should require managers for customer and distributor types', () => {
      expect(OrganizationTypeRules.requiresManager('customer')).toBe(true)
      expect(OrganizationTypeRules.requiresManager('distributor')).toBe(true)
      expect(OrganizationTypeRules.requiresManager('principal')).toBe(false)
      expect(OrganizationTypeRules.requiresManager('supplier')).toBe(false)
    })

    it('should handle invalid types', () => {
      expect(OrganizationTypeRules.requiresManager('invalid')).toBe(false)
    })
  })
})

describe('SegmentRules', () => {
  describe('isValidSegment', () => {
    it('should accept valid segments', () => {
      expect(SegmentRules.isValidSegment('restaurant')).toBe(true)
      expect(SegmentRules.isValidSegment('healthcare')).toBe(true)
      expect(SegmentRules.isValidSegment('education')).toBe(true)
    })

    it('should reject invalid segments', () => {
      expect(SegmentRules.isValidSegment('retail')).toBe(false)
      expect(SegmentRules.isValidSegment('hospitality')).toBe(false)
      expect(SegmentRules.isValidSegment('')).toBe(false)
      expect(SegmentRules.isValidSegment('RESTAURANT')).toBe(false)
    })
  })

  describe('getDefaultSegment', () => {
    it('should return restaurant as default segment', () => {
      expect(SegmentRules.getDefaultSegment()).toBe('restaurant')
    })
  })
})

describe('DecisionAuthorityRules', () => {
  describe('isValidAuthority', () => {
    it('should accept valid decision authorities', () => {
      expect(DecisionAuthorityRules.isValidAuthority('primary')).toBe(true)
      expect(DecisionAuthorityRules.isValidAuthority('secondary')).toBe(true)
      expect(DecisionAuthorityRules.isValidAuthority('influencer')).toBe(true)
    })

    it('should reject invalid decision authorities', () => {
      expect(DecisionAuthorityRules.isValidAuthority('tertiary')).toBe(false)
      expect(DecisionAuthorityRules.isValidAuthority('decision_maker')).toBe(false)
      expect(DecisionAuthorityRules.isValidAuthority('')).toBe(false)
      expect(DecisionAuthorityRules.isValidAuthority('PRIMARY')).toBe(false)
    })
  })

  describe('canMakeFinalDecision', () => {
    it('should only allow primary authority to make final decisions', () => {
      expect(DecisionAuthorityRules.canMakeFinalDecision('primary')).toBe(true)
      expect(DecisionAuthorityRules.canMakeFinalDecision('secondary')).toBe(false)
      expect(DecisionAuthorityRules.canMakeFinalDecision('influencer')).toBe(false)
    })

    it('should handle invalid authorities', () => {
      expect(DecisionAuthorityRules.canMakeFinalDecision('invalid')).toBe(false)
    })
  })

  describe('getDefaultAuthority', () => {
    it('should return influencer as default authority', () => {
      expect(DecisionAuthorityRules.getDefaultAuthority()).toBe('influencer')
    })
  })
})

describe('ValidationRules', () => {
  describe('email validation', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'firstname+lastname@company.org',
        'email@subdomain.example.com',
        'firstname.lastname@example.museum',
        'email@123.123.123.123', // Technically valid
        '1234567890@example.com',
        'email@example-one.com',
        '_______@example.com',
      ]

      validEmails.forEach((email) => {
        expect(ValidationRules.email.validate(email)).toBe(true)
      })
    })

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        '', // Empty
        'plainaddress',
        'missingdomain@',
        '@missingusername.com',
        'email@',
        'email..double.dot@example.com',
        'email @example.com', // Space
        'email@example',
        'email@.example.com',
        'email@example..com',
        'email@-example.com',
        'email@example-.com',
      ]

      invalidEmails.forEach((email) => {
        expect(ValidationRules.email.validate(email)).toBe(false)
      })
    })

    it('should handle edge cases', () => {
      expect(ValidationRules.email.validate('a@b.co')).toBe(true) // Minimum valid
      expect(ValidationRules.email.validate('a@b')).toBe(false) // No TLD
      expect(ValidationRules.email.validate('a@b.c')).toBe(true) // Single char TLD
    })
  })

  describe('phone validation', () => {
    it('should accept valid phone numbers', () => {
      const validPhones = [
        '1234567890', // 10 digits
        '12345678901', // 11 digits
        '123456789012345', // 15 digits (max)
        '+1 (555) 123-4567', // Formatted
        '555.123.4567', // Dots
        '555-123-4567', // Dashes
        '(555) 123-4567', // Parentheses
        '+44 20 7123 1234', // International
        '1-800-555-HELP', // Will fail because of letters
      ]

      // Only test numeric extraction - letters should fail
      expect(ValidationRules.phone.validate('1234567890')).toBe(true)
      expect(ValidationRules.phone.validate('+1 (555) 123-4567')).toBe(true)
      expect(ValidationRules.phone.validate('555.123.4567')).toBe(true)
      expect(ValidationRules.phone.validate('(555) 123-4567')).toBe(true)
      expect(ValidationRules.phone.validate('123456789012345')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      const invalidPhones = [
        '', // Empty
        '123456789', // Too short (9 digits)
        '1234567890123456', // Too long (16 digits)
        'abcdefghij', // No numbers
        '555-HELP', // Too short after cleaning
        '12345', // Too short
      ]

      invalidPhones.forEach((phone) => {
        expect(ValidationRules.phone.validate(phone)).toBe(false)
      })
    })

    it('should handle special formatting', () => {
      expect(ValidationRules.phone.validate('  1234567890  ')).toBe(true) // Whitespace
      expect(ValidationRules.phone.validate('1-234-567-8901')).toBe(true) // Extra formatting
    })
  })

  describe('currency validation', () => {
    it('should accept valid currency amounts', () => {
      const validAmounts = [0, 0.01, 1.0, 999.99, 1000000.5, Number.MAX_SAFE_INTEGER]

      validAmounts.forEach((amount) => {
        expect(ValidationRules.currency.validate(amount)).toBe(true)
      })
    })

    it('should reject invalid currency amounts', () => {
      const invalidAmounts = [-0.01, -100, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, NaN]

      invalidAmounts.forEach((amount) => {
        expect(ValidationRules.currency.validate(amount)).toBe(false)
      })
    })

    it('should format currency correctly', () => {
      expect(ValidationRules.currency.format(1000.5)).toBe('$1,000.50')
      expect(ValidationRules.currency.format(0)).toBe('$0.00')
      expect(ValidationRules.currency.format(999999.99)).toBe('$999,999.99')
    })

    it('should handle edge cases', () => {
      expect(ValidationRules.currency.validate(0)).toBe(true) // Zero is valid
      expect(ValidationRules.currency.validate(0.001)).toBe(true) // More than 2 decimals is valid number
      expect(ValidationRules.currency.format(0.001)).toBe('$0.00') // But formats to 2 decimals
    })
  })

  describe('required validation', () => {
    describe('string validation', () => {
      it('should accept valid non-empty strings', () => {
        expect(ValidationRules.required.string('test')).toBe(true)
        expect(ValidationRules.required.string('a')).toBe(true)
        expect(ValidationRules.required.string(' valid ')).toBe(true) // Has content after trim
      })

      it('should reject empty or invalid strings', () => {
        expect(ValidationRules.required.string('')).toBe(false)
        expect(ValidationRules.required.string('   ')).toBe(false) // Only whitespace
        expect(ValidationRules.required.string('\t\n')).toBe(false) // Only whitespace chars
        expect(ValidationRules.required.string(null)).toBe(false)
        expect(ValidationRules.required.string(undefined)).toBe(false)
      })
    })

    describe('number validation', () => {
      it('should accept valid numbers including zero', () => {
        expect(ValidationRules.required.number(0)).toBe(true)
        expect(ValidationRules.required.number(1)).toBe(true)
        expect(ValidationRules.required.number(-1)).toBe(true)
        expect(ValidationRules.required.number(3.14159)).toBe(true)
        expect(ValidationRules.required.number(Number.MAX_SAFE_INTEGER)).toBe(true)
        expect(ValidationRules.required.number(Number.MIN_SAFE_INTEGER)).toBe(true)
      })

      it('should reject null, undefined, and NaN', () => {
        expect(ValidationRules.required.number(null)).toBe(false)
        expect(ValidationRules.required.number(undefined)).toBe(false)
        expect(ValidationRules.required.number(NaN)).toBe(false)
      })

      it('should handle edge cases', () => {
        expect(ValidationRules.required.number(Number.POSITIVE_INFINITY)).toBe(true) // Infinity is a number
        expect(ValidationRules.required.number(Number.NEGATIVE_INFINITY)).toBe(true)
      })
    })
  })
})

describe('BusinessRuleViolation', () => {
  it('should create proper error with rule and message', () => {
    const rule = 'INVALID_EMAIL'
    const message = 'Email format is invalid'
    const violation = new BusinessRuleViolation(rule, message)

    expect(violation).toBeInstanceOf(Error)
    expect(violation.name).toBe('BusinessRuleViolation')
    expect(violation.message).toBe(`Business rule violation [${rule}]: ${message}`)
  })

  it('should be throwable and catchable', () => {
    const rule = 'TEST_RULE'
    const message = 'Test message'

    expect(() => {
      throw new BusinessRuleViolation(rule, message)
    }).toThrow(BusinessRuleViolation)

    try {
      throw new BusinessRuleViolation(rule, message)
    } catch (error) {
      expect(error).toBeInstanceOf(BusinessRuleViolation)
      expect((error as BusinessRuleViolation).message).toContain(rule)
      expect((error as BusinessRuleViolation).message).toContain(message)
    }
  })

  it('should handle empty rule and message', () => {
    const violation = new BusinessRuleViolation('', '')
    expect(violation.message).toBe('Business rule violation []: ')
  })

  it('should handle special characters in rule and message', () => {
    const rule = 'SPECIAL_CHARS_!@#$%^&*()'
    const message = 'Message with symbols: <>?:"{}[]|;\'\\,./'
    const violation = new BusinessRuleViolation(rule, message)

    expect(violation.message).toContain(rule)
    expect(violation.message).toContain(message)
  })
})
