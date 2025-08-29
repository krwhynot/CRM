import { onCLS, onINP, onFCP, onLCP, onTTFB, type CLSMetric, type INPMetric, type FCPMetric, type LCPMetric, type TTFBMetric } from 'web-vitals'
import { safeGetJSON, safeSetJSON } from '@/lib/secure-storage'

type WebVitalsMetric = CLSMetric | INPMetric | FCPMetric | LCPMetric | TTFBMetric

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
}

function sendToAnalytics(metric: WebVitalsMetric) {
  // Store metrics in localStorage for debugging - now with safe JSON handling
  const perfMetrics = safeGetJSON<PerformanceMetric[]>('perfMetrics', [])
  
  const newMetric: PerformanceMetric = {
    name: metric.name,
    value: metric.value,
    timestamp: Date.now()
  }
  
  perfMetrics.push(newMetric)
  
  // Keep last 50 metrics and store safely
  const success = safeSetJSON('perfMetrics', perfMetrics.slice(-50))
  
  // Development-only performance logging
  if (process.env.NODE_ENV === 'development') {
    console.log(`Performance: ${metric.name}: ${metric.value}ms`)
    if (!success) {
      console.warn('Failed to store performance metrics - localStorage may be full or disabled')
    }
  }
}

export function setupPerformanceMonitoring() {
  // Track all Core Web Vitals (INP replaced FID in web-vitals v3+)
  onCLS(sendToAnalytics)
  onINP(sendToAnalytics) 
  onFCP(sendToAnalytics)
  onLCP(sendToAnalytics)
  onTTFB(sendToAnalytics)
}