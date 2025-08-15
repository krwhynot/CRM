/**
 * Mobile Touch Interface Validator Utility
 * Mobile-CRM-Optimizer Agent Implementation
 * 
 * Provides comprehensive touch interface validation utilities for ensuring
 * the Principal CRM transformation meets field sales team requirements
 * on mobile devices and tablets.
 */

/**
 * Touch Target Standards based on WCAG AA and field sales best practices
 */
export const TOUCH_STANDARDS = {
  // Size requirements (pixels)
  MINIMUM_SIZE: 48,        // WCAG AA minimum
  RECOMMENDED_SIZE: 56,    // Enhanced for field sales
  OPTIMAL_SIZE: 64,        // Ideal for finger navigation
  
  // Spacing requirements (pixels)
  MINIMUM_SPACING: 8,      // Minimum gap between targets
  RECOMMENDED_SPACING: 12, // Recommended gap for field use
  
  // Target area calculations
  MINIMUM_AREA: 48 * 48,   // 2304 square pixels
  RECOMMENDED_AREA: 56 * 56, // 3136 square pixels
  
  // Thumb reach zones (percentage of screen)
  THUMB_REACH_BOTTOM: 0.67, // Bottom 1/3 easily reachable
  THUMB_REACH_SIDES: 0.75   // Side 3/4 reachable
};

/**
 * Device-specific configurations for validation
 */
export const DEVICE_PROFILES = {
  'iPad-Pro-12.9': {
    landscape: { width: 1366, height: 1024, thumbReach: { x: 1024, y: 683 } },
    portrait: { width: 1024, height: 1366, thumbReach: { x: 768, y: 911 } },
    touchMultiplier: 1.0
  },
  'iPad-Air': {
    landscape: { width: 1180, height: 820, thumbReach: { x: 885, y: 547 } },
    portrait: { width: 820, height: 1180, thumbReach: { x: 615, y: 787 } },
    touchMultiplier: 1.0
  },
  'iPad-Standard': {
    landscape: { width: 1024, height: 768, thumbReach: { x: 768, y: 512 } },
    portrait: { width: 768, height: 1024, thumbReach: { x: 576, y: 683 } },
    touchMultiplier: 1.0
  },
  'iPhone-15-Pro-Max': {
    portrait: { width: 430, height: 932, thumbReach: { x: 323, y: 622 } },
    touchMultiplier: 1.2 // Smaller screen needs larger relative targets
  },
  'iPhone-15-Pro': {
    portrait: { width: 393, height: 852, thumbReach: { x: 295, y: 568 } },
    touchMultiplier: 1.2
  }
};

/**
 * Touch Target Validator Class
 * Provides comprehensive validation of touch interface elements
 */
export class TouchTargetValidator {
  constructor(page, deviceProfile = null) {
    this.page = page;
    this.deviceProfile = deviceProfile;
    this.validationResults = {
      timestamp: new Date().toISOString(),
      device: deviceProfile?.name || 'Unknown',
      totalElements: 0,
      validElements: 0,
      violations: [],
      recommendations: []
    };
  }

  /**
   * Validate touch targets for a specific selector
   */
  async validateTouchTargets(selector, options = {}) {
    const {
      requireMinimum = true,
      requireRecommended = false,
      checkSpacing = true,
      checkThumbReach = false,
      elementName = selector
    } = options;

    const elements = await this.page.locator(selector).all();
    const results = {
      selector,
      elementName,
      total: elements.length,
      validMinimum: 0,
      validRecommended: 0,
      validSpacing: 0,
      inThumbReach: 0,
      elements: [],
      violations: [],
      recommendations: []
    };

    // Validate each element
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const elementResult = await this.validateSingleElement(element, i, elementName);
      results.elements.push(elementResult);

      // Count valid elements
      if (elementResult.meetsMinimum) results.validMinimum++;
      if (elementResult.meetsRecommended) results.validRecommended++;
      if (elementResult.inThumbReach) results.inThumbReach++;

      // Collect violations
      if (requireMinimum && !elementResult.meetsMinimum) {
        results.violations.push({
          type: 'SIZE_VIOLATION',
          element: i,
          required: TOUCH_STANDARDS.MINIMUM_SIZE,
          actual: Math.min(elementResult.width, elementResult.height),
          severity: 'HIGH'
        });
      }

      if (requireRecommended && !elementResult.meetsRecommended) {
        results.recommendations.push({
          type: 'SIZE_RECOMMENDATION',
          element: i,
          recommended: TOUCH_STANDARDS.RECOMMENDED_SIZE,
          actual: Math.min(elementResult.width, elementResult.height),
          impact: 'Improved field sales usability'
        });
      }
    }

    // Validate spacing if requested
    if (checkSpacing && elements.length > 1) {
      const spacingResults = await this.validateElementSpacing(elements, elementName);
      results.spacingViolations = spacingResults.violations;
      results.validSpacing = spacingResults.validPairs;
    }

    // Update overall validation results
    this.validationResults.totalElements += results.total;
    this.validationResults.validElements += results.validMinimum;
    this.validationResults.violations.push(...results.violations);
    this.validationResults.recommendations.push(...results.recommendations);

    return results;
  }

  /**
   * Validate a single touch target element
   */
  async validateSingleElement(element, index, elementName) {
    const box = await element.boundingBox();
    
    if (!box) {
      return {
        index,
        elementName,
        visible: false,
        error: 'Element not visible or has no bounding box'
      };
    }

    const viewport = this.page.viewportSize();
    const thumbReach = this.calculateThumbReach(viewport);
    
    // Apply device-specific touch multiplier
    const multiplier = this.deviceProfile?.touchMultiplier || 1.0;
    const adjustedMinimum = TOUCH_STANDARDS.MINIMUM_SIZE * multiplier;
    const adjustedRecommended = TOUCH_STANDARDS.RECOMMENDED_SIZE * multiplier;

    const result = {
      index,
      elementName,
      visible: true,
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
      area: box.width * box.height,
      
      // Size validations
      meetsMinimum: box.width >= adjustedMinimum && box.height >= adjustedMinimum,
      meetsRecommended: box.width >= adjustedRecommended && box.height >= adjustedRecommended,
      meetsOptimal: box.width >= TOUCH_STANDARDS.OPTIMAL_SIZE && box.height >= TOUCH_STANDARDS.OPTIMAL_SIZE,
      
      // Position validations
      inThumbReach: this.isInThumbReach(box, thumbReach),
      distanceFromThumbReach: this.calculateThumbReachDistance(box, thumbReach),
      
      // Accessibility score (0-100)
      accessibilityScore: this.calculateAccessibilityScore(box, adjustedMinimum, adjustedRecommended)
    };

    return result;
  }

  /**
   * Validate spacing between elements
   */
  async validateElementSpacing(elements, elementName) {
    const results = {
      elementName,
      totalPairs: 0,
      validPairs: 0,
      violations: [],
      averageSpacing: 0
    };

    const spacings = [];

    for (let i = 0; i < elements.length - 1; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        const box1 = await elements[i].boundingBox();
        const box2 = await elements[j].boundingBox();
        
        if (box1 && box2) {
          const spacing = this.calculateMinimumSpacing(box1, box2);
          spacings.push(spacing);
          results.totalPairs++;

          if (spacing >= TOUCH_STANDARDS.MINIMUM_SPACING) {
            results.validPairs++;
          } else {
            results.violations.push({
              type: 'SPACING_VIOLATION',
              element1: i,
              element2: j,
              actualSpacing: spacing,
              requiredSpacing: TOUCH_STANDARDS.MINIMUM_SPACING,
              severity: spacing < 4 ? 'HIGH' : 'MEDIUM'
            });
          }
        }
      }
    }

    results.averageSpacing = spacings.length > 0 
      ? spacings.reduce((sum, spacing) => sum + spacing, 0) / spacings.length 
      : 0;

    return results;
  }

  /**
   * Calculate minimum spacing between two elements
   */
  calculateMinimumSpacing(box1, box2) {
    // Calculate gaps in all directions
    const rightGap = Math.abs(box1.x + box1.width - box2.x);
    const leftGap = Math.abs(box2.x + box2.width - box1.x);
    const bottomGap = Math.abs(box1.y + box1.height - box2.y);
    const topGap = Math.abs(box2.y + box2.height - box1.y);

    // Return minimum gap (closest elements)
    return Math.min(rightGap, leftGap, bottomGap, topGap);
  }

  /**
   * Calculate thumb reach zones based on viewport size
   */
  calculateThumbReach(viewport) {
    return {
      bottom: viewport.height * TOUCH_STANDARDS.THUMB_REACH_BOTTOM,
      side: viewport.width * TOUCH_STANDARDS.THUMB_REACH_SIDES,
      center: {
        x: viewport.width / 2,
        y: viewport.height * 0.8 // Slightly lower for natural thumb position
      }
    };
  }

  /**
   * Check if element is within thumb reach
   */
  isInThumbReach(box, thumbReach) {
    const elementCenter = {
      x: box.x + box.width / 2,
      y: box.y + box.height / 2
    };

    // Element is in thumb reach if:
    // 1. In bottom 1/3 of screen, OR
    // 2. Within reasonable distance from center bottom
    const inBottomThird = elementCenter.y >= thumbReach.bottom;
    const distanceFromCenter = Math.sqrt(
      Math.pow(elementCenter.x - thumbReach.center.x, 2) +
      Math.pow(elementCenter.y - thumbReach.center.y, 2)
    );
    const withinReach = distanceFromCenter <= 300; // 300px radius from center

    return inBottomThird || withinReach;
  }

  /**
   * Calculate distance from thumb reach zone
   */
  calculateThumbReachDistance(box, thumbReach) {
    const elementCenter = {
      x: box.x + box.width / 2,
      y: box.y + box.height / 2
    };

    return Math.sqrt(
      Math.pow(elementCenter.x - thumbReach.center.x, 2) +
      Math.pow(elementCenter.y - thumbReach.center.y, 2)
    );
  }

  /**
   * Calculate accessibility score for an element
   */
  calculateAccessibilityScore(box, minSize, recSize) {
    let score = 0;

    // Size score (40 points)
    const minDimension = Math.min(box.width, box.height);
    if (minDimension >= recSize) {
      score += 40;
    } else if (minDimension >= minSize) {
      score += 25;
    } else {
      score += Math.max(0, 15 * (minDimension / minSize));
    }

    // Area score (30 points)
    const area = box.width * box.height;
    if (area >= TOUCH_STANDARDS.RECOMMENDED_AREA) {
      score += 30;
    } else if (area >= TOUCH_STANDARDS.MINIMUM_AREA) {
      score += 20;
    } else {
      score += Math.max(0, 10 * (area / TOUCH_STANDARDS.MINIMUM_AREA));
    }

    // Aspect ratio score (20 points) - prefer square-ish elements
    const aspectRatio = Math.max(box.width, box.height) / Math.min(box.width, box.height);
    if (aspectRatio <= 1.5) {
      score += 20;
    } else if (aspectRatio <= 2.0) {
      score += 15;
    } else {
      score += Math.max(0, 10 - (aspectRatio - 2) * 2);
    }

    // Position score (10 points) - bonus for good positioning
    score += 10; // Base positioning score

    return Math.round(Math.min(100, score));
  }

  /**
   * Generate comprehensive validation report
   */
  generateReport() {
    const totalElements = this.validationResults.totalElements;
    const validElements = this.validationResults.validElements;
    const complianceRate = totalElements > 0 ? (validElements / totalElements) * 100 : 0;

    return {
      ...this.validationResults,
      compliance: {
        rate: complianceRate,
        grade: this.getComplianceGrade(complianceRate),
        status: complianceRate >= 95 ? 'EXCELLENT' : complianceRate >= 85 ? 'GOOD' : complianceRate >= 70 ? 'FAIR' : 'POOR'
      },
      summary: {
        totalViolations: this.validationResults.violations.length,
        criticalViolations: this.validationResults.violations.filter(v => v.severity === 'HIGH').length,
        recommendations: this.validationResults.recommendations.length,
        overallScore: this.calculateOverallScore()
      }
    };
  }

  /**
   * Get compliance grade based on rate
   */
  getComplianceGrade(rate) {
    if (rate >= 95) return 'A+';
    if (rate >= 90) return 'A';
    if (rate >= 85) return 'B+';
    if (rate >= 80) return 'B';
    if (rate >= 75) return 'C+';
    if (rate >= 70) return 'C';
    return 'F';
  }

  /**
   * Calculate overall accessibility score
   */
  calculateOverallScore() {
    const complianceRate = this.validationResults.totalElements > 0 
      ? (this.validationResults.validElements / this.validationResults.totalElements) * 100 
      : 0;
    
    // Deduct points for violations
    const criticalViolations = this.validationResults.violations.filter(v => v.severity === 'HIGH').length;
    const mediumViolations = this.validationResults.violations.filter(v => v.severity === 'MEDIUM').length;
    
    const penaltyPoints = (criticalViolations * 10) + (mediumViolations * 5);
    
    return Math.max(0, Math.round(complianceRate - penaltyPoints));
  }

  /**
   * Get field sales specific recommendations
   */
  getFieldSalesRecommendations() {
    const recommendations = [];

    // Check compliance rate
    const complianceRate = this.validationResults.totalElements > 0 
      ? (this.validationResults.validElements / this.validationResults.totalElements) * 100 
      : 0;

    if (complianceRate < 95) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Touch Targets',
        issue: `Touch target compliance at ${complianceRate.toFixed(1)}% (target: 95%+)`,
        recommendation: 'Increase button and interactive element sizes to ≥48px minimum',
        businessImpact: 'Critical for field sales team productivity and accuracy'
      });
    }

    if (this.validationResults.violations.filter(v => v.type === 'SPACING_VIOLATION').length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Element Spacing',
        issue: 'Touch targets too close together, risking accidental activation',
        recommendation: 'Increase spacing between interactive elements to ≥8px minimum',
        businessImpact: 'Reduces input errors during field operations'
      });
    }

    return recommendations;
  }
}

/**
 * Performance Monitor for Mobile Interactions
 */
export class MobilePerformanceMonitor {
  constructor(page) {
    this.page = page;
    this.measurements = [];
  }

  /**
   * Measure interaction performance
   */
  async measureInteraction(action, name, expectedThreshold = 1000) {
    const startTime = performance.now();
    const startMemory = await this.getMemoryUsage();
    
    try {
      await action();
      const endTime = performance.now();
      const endMemory = await this.getMemoryUsage();
      
      const measurement = {
        name,
        duration: endTime - startTime,
        threshold: expectedThreshold,
        passed: (endTime - startTime) <= expectedThreshold,
        memoryDelta: endMemory - startMemory,
        timestamp: new Date().toISOString()
      };

      this.measurements.push(measurement);
      return measurement;
      
    } catch (error) {
      const measurement = {
        name,
        duration: performance.now() - startTime,
        threshold: expectedThreshold,
        passed: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };

      this.measurements.push(measurement);
      return measurement;
    }
  }

  /**
   * Get current memory usage
   */
  async getMemoryUsage() {
    try {
      const metrics = await this.page.evaluate(() => {
        if (performance.memory) {
          return performance.memory.usedJSHeapSize;
        }
        return 0;
      });
      return metrics;
    } catch {
      return 0;
    }
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport() {
    const totalMeasurements = this.measurements.length;
    const passedMeasurements = this.measurements.filter(m => m.passed).length;
    const averageDuration = totalMeasurements > 0 
      ? this.measurements.reduce((sum, m) => sum + m.duration, 0) / totalMeasurements 
      : 0;

    return {
      totalMeasurements,
      passedMeasurements,
      successRate: totalMeasurements > 0 ? (passedMeasurements / totalMeasurements) * 100 : 0,
      averageDuration: Math.round(averageDuration),
      measurements: this.measurements,
      summary: {
        fastest: Math.min(...this.measurements.map(m => m.duration)),
        slowest: Math.max(...this.measurements.map(m => m.duration)),
        totalTime: this.measurements.reduce((sum, m) => sum + m.duration, 0)
      }
    };
  }
}

/**
 * Principal CRM Mobile Feature Validator
 */
export class PrincipalCRMFeatureValidator {
  constructor(page, touchValidator) {
    this.page = page;
    this.touchValidator = touchValidator;
  }

  /**
   * Validate Principal advocacy workflow on mobile
   */
  async validateAdvocacyWorkflow() {
    const advocacyButton = this.page.locator('button:has-text("Add Preferred Principals")');
    
    if (await advocacyButton.count() === 0) {
      return { available: false, reason: 'Advocacy button not found' };
    }

    // Validate button touch target
    const buttonValidation = await this.touchValidator.validateTouchTargets(
      'button:has-text("Add Preferred Principals")',
      { requireMinimum: true, elementName: 'Advocacy Button' }
    );

    // Test workflow
    await advocacyButton.click();
    await this.page.waitForSelector('text=Select principals that this contact advocates for');

    // Validate checkbox touch targets
    const checkboxValidation = await this.touchValidator.validateTouchTargets(
      'input[type="checkbox"]',
      { requireMinimum: true, checkSpacing: true, elementName: 'Advocacy Checkboxes' }
    );

    return {
      available: true,
      buttonValid: buttonValidation.validMinimum === buttonValidation.total,
      checkboxesValid: checkboxValidation.validMinimum === checkboxValidation.total,
      workflowFunctional: true,
      touchCompliance: {
        button: buttonValidation,
        checkboxes: checkboxValidation
      }
    };
  }

  /**
   * Validate business intelligence dropdowns
   */
  async validateBusinessIntelligenceDropdowns() {
    const results = {
      purchaseInfluence: await this.validateDropdown('purchase_influence', 'Purchase Influence'),
      decisionAuthority: await this.validateDropdown('decision_authority', 'Decision Authority')
    };

    return results;
  }

  /**
   * Validate a specific dropdown
   */
  async validateDropdown(fieldName, displayName) {
    const dropdown = this.page.locator(`[name="${fieldName}"], select[name="${fieldName}"], [role="combobox"]`).first();
    
    if (await dropdown.count() === 0) {
      return { available: false, reason: `${displayName} dropdown not found` };
    }

    // Validate dropdown trigger touch target
    const triggerValidation = await this.touchValidator.validateTouchTargets(
      `[name="${fieldName}"], select[name="${fieldName}"], [role="combobox"]`,
      { requireMinimum: true, elementName: `${displayName} Dropdown` }
    );

    // Open dropdown and validate options
    await dropdown.click();
    await this.page.waitForSelector('[role="option"]', { timeout: 3000 });

    const optionsValidation = await this.touchValidator.validateTouchTargets(
      '[role="option"]',
      { requireMinimum: true, checkSpacing: true, elementName: `${displayName} Options` }
    );

    return {
      available: true,
      triggerValid: triggerValidation.validMinimum === triggerValidation.total,
      optionsValid: optionsValidation.validMinimum === optionsValidation.total,
      touchCompliance: {
        trigger: triggerValidation,
        options: optionsValidation
      }
    };
  }
}

// Export utility functions
export const MobileTestUtils = {
  TouchTargetValidator,
  MobilePerformanceMonitor,
  PrincipalCRMFeatureValidator,
  TOUCH_STANDARDS,
  DEVICE_PROFILES
};