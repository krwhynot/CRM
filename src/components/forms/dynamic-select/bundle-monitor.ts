// Bundle size monitoring utilities for DynamicSelectField optimization

export interface BundleMetrics {
  totalSize: number
  mainChunkSize: number
  dynamicSelectSize: number
  virtualizationSize: number
  lazyLoadedComponents: string[]
  treeShakingEffective: boolean
}

export class BundleMonitor {
  private static instance: BundleMonitor
  private metrics: Partial<BundleMetrics> = {}
  private componentLoads: Map<string, number> = new Map()

  static getInstance(): BundleMonitor {
    if (!BundleMonitor.instance) {
      BundleMonitor.instance = new BundleMonitor()
    }
    return BundleMonitor.instance
  }

  // Track component loading
  trackComponentLoad(componentName: string): void {
    const current = this.componentLoads.get(componentName) || 0
    this.componentLoads.set(componentName, current + 1)
    
    if (process.env.NODE_ENV === 'development') {
      console.info(`[DynamicSelect] Component loaded: ${componentName} (${current + 1} times)`)
    }
  }

  // Track lazy loading effectiveness
  trackLazyLoad(componentName: string, size: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[DynamicSelect] Lazy loaded: ${componentName} (~${size})`)
    }
  }

  // Validate bundle size increase is within limits
  validateBundleIncrease(beforeSize: number, afterSize: number, limitKB: number = 5): boolean {
    const increaseKB = (afterSize - beforeSize) / 1024
    const withinLimit = increaseKB <= limitKB
    
    if (process.env.NODE_ENV === 'development') {
      console.info(`[DynamicSelect] Bundle size change: ${increaseKB.toFixed(2)}KB`, {
        before: `${(beforeSize / 1024).toFixed(2)}KB`,
        after: `${(afterSize / 1024).toFixed(2)}KB`,
        withinLimit,
        limit: `${limitKB}KB`
      })
    }
    
    return withinLimit
  }

  // Check if virtualization was loaded unnecessarily
  checkVirtualizationUsage(): { necessary: boolean; itemCount: number; threshold: number } {
    const virtualizationLoads = this.componentLoads.get('virtualization') || 0
    const optionListLoads = this.componentLoads.get('optionList') || 0
    
    // Estimate if virtualization was necessary based on usage patterns
    const necessary = virtualizationLoads > 0 && optionListLoads > 0
    
    return {
      necessary,
      itemCount: 0, // Would be tracked separately in real implementation
      threshold: 50 // From DYNAMIC_SELECT_TOKENS.VIRTUALIZATION_THRESHOLD
    }
  }

  // Generate optimization report
  generateOptimizationReport(): {
    summary: string
    recommendations: string[]
    metrics: Record<string, any>
  } {
    const componentLoads = Object.fromEntries(this.componentLoads)
    const virtualizationUsage = this.checkVirtualizationUsage()
    
    const recommendations: string[] = []
    
    if (componentLoads.virtualization > 0 && !virtualizationUsage.necessary) {
      recommendations.push("Consider increasing virtualization threshold to reduce unnecessary loading")
    }
    
    if (componentLoads.optionList > componentLoads.searchInput * 2) {
      recommendations.push("OptionList is being loaded more frequently than SearchInput - check usage patterns")
    }
    
    const summary = `DynamicSelectField loaded ${Object.values(componentLoads).reduce((a, b) => a + b, 0)} components with ${recommendations.length} optimization opportunities`
    
    return {
      summary,
      recommendations,
      metrics: {
        componentLoads,
        virtualizationUsage,
        lazyLoadingEffective: this.componentLoads.size > 1 // Multiple components suggest lazy loading is working
      }
    }
  }

  // Reset metrics (useful for testing)
  reset(): void {
    this.metrics = {}
    this.componentLoads.clear()
  }
}

// Development helper to track bundle performance
if (process.env.NODE_ENV === 'development') {
  (window as any).__DynamicSelectBundleMonitor = BundleMonitor.getInstance()
}

export const bundleMonitor = BundleMonitor.getInstance()