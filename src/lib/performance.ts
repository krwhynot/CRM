import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals'

function sendToAnalytics(metric: Record<string, unknown>) {
  // Log performance metrics to console (can be extended to send to analytics service)
  console.log(`Performance: ${metric.name}: ${metric.value}ms`)
  
  // Store metrics in localStorage for debugging
  const perfMetrics = JSON.parse(localStorage.getItem('perfMetrics') || '[]')
  perfMetrics.push({
    name: metric.name,
    value: metric.value,
    timestamp: Date.now()
  })
  localStorage.setItem('perfMetrics', JSON.stringify(perfMetrics.slice(-50))) // Keep last 50 metrics
}

export function setupPerformanceMonitoring() {
  // Track all Core Web Vitals (INP replaced FID in web-vitals v3+)
  onCLS(sendToAnalytics)
  onINP(sendToAnalytics) 
  onFCP(sendToAnalytics)
  onLCP(sendToAnalytics)
  onTTFB(sendToAnalytics)
}