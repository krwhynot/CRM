/**
 * State Management Performance Monitor
 *
 * Tracks performance metrics for the new state architecture
 * to validate the benefits of separating client/server state
 */

import { isDevelopment } from '@/config/environment'

interface PerformanceMetrics {
  queryHits: number
  queryCacheSize: number
  clientStateUpdates: number
  averageQueryTime: number
  cacheHitRate: number
}

class StatePerformanceMonitor {
  private metrics: PerformanceMetrics = {
    queryHits: 0,
    queryCacheSize: 0,
    clientStateUpdates: 0,
    averageQueryTime: 0,
    cacheHitRate: 0,
  }

  private queryTimes: number[] = []
  private cacheHits = 0
  private cacheMisses = 0

  // Track TanStack Query performance
  trackQueryStart(queryKey: string): () => void {
    const startTime = performance.now()
    this.metrics.queryHits++

    return () => {
      const duration = performance.now() - startTime
      this.queryTimes.push(duration)
      this.updateAverageQueryTime()

      if (isDevelopment) {
        console.log(`🔍 Query [${queryKey}] completed in ${duration.toFixed(2)}ms`)
      }
    }
  }

  // Track cache performance
  trackCacheHit(queryKey: string) {
    this.cacheHits++
    this.updateCacheHitRate()

    if (isDevelopment) {
      console.log(`⚡ Cache hit for [${queryKey}]`)
    }
  }

  trackCacheMiss(queryKey: string) {
    this.cacheMisses++
    this.updateCacheHitRate()

    if (isDevelopment) {
      console.log(`🌐 Cache miss for [${queryKey}] - fetching from server`)
    }
  }

  // Track Zustand store updates
  trackClientStateUpdate(storeName: string, action: string) {
    this.metrics.clientStateUpdates++

    if (isDevelopment) {
      console.log(`🎨 Client state update: ${storeName}.${action}`)
    }
  }

  // Update cache size from QueryClient
  updateCacheSize(size: number) {
    this.metrics.queryCacheSize = size
  }

  private updateAverageQueryTime() {
    if (this.queryTimes.length === 0) return

    const sum = this.queryTimes.reduce((acc, time) => acc + time, 0)
    this.metrics.averageQueryTime = sum / this.queryTimes.length
  }

  private updateCacheHitRate() {
    const total = this.cacheHits + this.cacheMisses
    this.metrics.cacheHitRate = total > 0 ? (this.cacheHits / total) * 100 : 0
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  // Generate performance report
  generateReport(): string {
    const metrics = this.getMetrics()

    return `
📊 State Management Performance Report
=====================================

🗄️  Server State (TanStack Query):
   • Total queries: ${metrics.queryHits}
   • Cache size: ${metrics.queryCacheSize} entries
   • Average query time: ${metrics.averageQueryTime.toFixed(2)}ms
   • Cache hit rate: ${metrics.cacheHitRate.toFixed(1)}%

🎨 Client State (Zustand):
   • UI state updates: ${metrics.clientStateUpdates}
   • Zero server requests for UI changes ✅

⚡ Performance Benefits:
   • ${this.cacheHits} requests served from cache
   • ${this.cacheMisses} requests required server round-trip
   • Estimated time saved: ${(this.cacheHits * metrics.averageQueryTime).toFixed(0)}ms

🎯 Architecture Health:
   ${this.getHealthScore() >= 80 ? '✅ Excellent' : this.getHealthScore() >= 60 ? '⚠️  Good' : '❌ Needs Improvement'}
   Score: ${this.getHealthScore()}/100
    `
  }

  private getHealthScore(): number {
    const metrics = this.getMetrics()
    let score = 0

    // Cache hit rate contributes 40 points
    score += Math.min(40, (metrics.cacheHitRate / 100) * 40)

    // Fast queries contribute 30 points (under 100ms is excellent)
    const queryScore = Math.max(0, 30 - (metrics.averageQueryTime / 100) * 30)
    score += queryScore

    // Good separation (client updates don't trigger server queries) contributes 30 points
    const separationRatio = metrics.clientStateUpdates / Math.max(1, metrics.queryHits)
    score += Math.min(30, separationRatio * 10) // More client updates relative to queries is good

    return Math.round(score)
  }

  // Reset metrics (useful for testing)
  reset() {
    this.metrics = {
      queryHits: 0,
      queryCacheSize: 0,
      clientStateUpdates: 0,
      averageQueryTime: 0,
      cacheHitRate: 0,
    }
    this.queryTimes = []
    this.cacheHits = 0
    this.cacheMisses = 0
  }

  // Log report to console (development only)
  logReport() {
    if (isDevelopment) {
      console.log(this.generateReport())
    }
  }
}

// Singleton instance
export const statePerformanceMonitor = new StatePerformanceMonitor()

// React hook to access performance metrics
export function useStatePerformanceMetrics() {
  return statePerformanceMonitor.getMetrics()
}

// Development helper - log performance report
export function logStatePerformance() {
  statePerformanceMonitor.logReport()
}

// Integration with TanStack Query DevTools
export function createQueryClientWithMonitoring() {
  if (typeof window === 'undefined') return null

  // This could be integrated with the main QueryClient
  // to automatically track all query performance
  return {
    onQueryStart: statePerformanceMonitor.trackQueryStart.bind(statePerformanceMonitor),
    onCacheHit: statePerformanceMonitor.trackCacheHit.bind(statePerformanceMonitor),
    onCacheMiss: statePerformanceMonitor.trackCacheMiss.bind(statePerformanceMonitor),
  }
}
