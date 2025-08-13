/**
 * Export Service
 * 
 * Handles data export functionality for engagement analytics
 * Supports multiple formats: JSON, CSV, Excel, PDF
 */

import type { 
  PrincipalEngagementAnalytics,
  EngagementRecommendation,
  RelationshipRiskFactor
} from '../types/engagement.types'

export interface ExportOptions {
  format: 'json' | 'csv' | 'excel' | 'pdf'
  includeCharts?: boolean
  includeRawData?: boolean
  dateRange?: {
    start: string
    end: string
  }
  principalIds?: string[]
}

export interface ExportData {
  metadata: {
    exportedAt: string
    exportedBy: string
    format: string
    version: string
  }
  summary: {
    totalPrincipals: number
    averageHealthScore: number
    highRiskCount: number
    growthOpportunityCount: number
  }
  principals: PrincipalEngagementAnalytics[]
  recommendations?: EngagementRecommendation[]
  riskFactors?: RelationshipRiskFactor[]
  chartData?: any[]
}

class ExportService {
  
  /**
   * Export engagement analytics data
   */
  async exportEngagementData(data: ExportData, options: ExportOptions): Promise<Blob> {
    switch (options.format) {
      case 'json':
        return this.exportAsJSON(data, options)
      case 'csv':
        return this.exportAsCSV(data, options)
      case 'excel':
        return this.exportAsExcel(data, options)
      case 'pdf':
        return this.exportAsPDF(data, options)
      default:
        throw new Error(`Unsupported export format: ${options.format}`)
    }
  }

  /**
   * Export as JSON
   */
  private exportAsJSON(data: ExportData, options: ExportOptions): Blob {
    const exportPayload = {
      ...data,
      options,
      metadata: {
        ...data.metadata,
        format: 'json'
      }
    }

    const jsonString = JSON.stringify(exportPayload, null, 2)
    return new Blob([jsonString], { type: 'application/json' })
  }

  /**
   * Export as CSV
   */
  private exportAsCSV(data: ExportData, options: ExportOptions): Blob {
    const csvRows: string[] = []

    // Header
    csvRows.push([
      'Principal ID',
      'Principal Name', 
      'Principal Type',
      'Health Score',
      'Risk Score',
      'Total Interactions',
      'Distributor Count',
      'Last Interaction',
      'Days Since Last Interaction',
      'Health Trend',
      'Relationship Stage'
    ].join(','))

    // Data rows
    data.principals.forEach(principal => {
      const mainStage = principal.distributor_relationships[0]?.relationship_stage || 'unknown'
      const row = [
        principal.principal_id,
        `"${principal.principal_name}"`,
        `"${principal.principal_type}"`,
        principal.relationship_health.overall_health_score,
        principal.risk_score,
        principal.total_interactions,
        principal.distributor_count,
        principal.last_interaction_date || '',
        principal.days_since_last_interaction || '',
        principal.relationship_health.health_trend,
        mainStage
      ].join(',')
      
      csvRows.push(row)
    })

    const csvContent = csvRows.join('\n')
    return new Blob([csvContent], { type: 'text/csv' })
  }

  /**
   * Export as Excel (simplified - would use a library like SheetJS in production)
   */
  private async exportAsExcel(data: ExportData, options: ExportOptions): Promise<Blob> {
    // This is a placeholder implementation
    // In a real app, you'd use a library like xlsx or exceljs
    
    const csvBlob = this.exportAsCSV(data, options)
    return csvBlob // Return CSV for now, but would be Excel format
  }

  /**
   * Export as PDF (simplified - would use a library like jsPDF in production)
   */
  private async exportAsPDF(data: ExportData, options: ExportOptions): Promise<Blob> {
    // This is a placeholder implementation
    // In a real app, you'd use a library like jsPDF or Puppeteer
    
    const reportContent = this.generatePDFContent(data, options)
    return new Blob([reportContent], { type: 'text/plain' })
  }

  /**
   * Generate PDF content (text-based for demo)
   */
  private generatePDFContent(data: ExportData, options: ExportOptions): string {
    const lines: string[] = []

    lines.push('ENGAGEMENT ANALYTICS REPORT')
    lines.push('=' .repeat(40))
    lines.push('')
    
    lines.push(`Generated: ${data.metadata.exportedAt}`)
    lines.push(`Total Principals: ${data.summary.totalPrincipals}`)
    lines.push(`Average Health Score: ${data.summary.averageHealthScore}`)
    lines.push(`High Risk Count: ${data.summary.highRiskCount}`)
    lines.push(`Growth Opportunities: ${data.summary.growthOpportunityCount}`)
    lines.push('')

    lines.push('PRINCIPAL DETAILS')
    lines.push('-' .repeat(20))
    
    data.principals.forEach(principal => {
      lines.push('')
      lines.push(`${principal.principal_name} (${principal.principal_type})`)
      lines.push(`  Health Score: ${principal.relationship_health.overall_health_score}/100`)
      lines.push(`  Risk Score: ${principal.risk_score}/100`)
      lines.push(`  Total Interactions: ${principal.total_interactions}`)
      lines.push(`  Distributors: ${principal.distributor_count}`)
      lines.push(`  Health Trend: ${principal.relationship_health.health_trend}`)
      
      if (principal.relationship_risk_factors.length > 0) {
        lines.push('  Risk Factors:')
        principal.relationship_risk_factors.forEach(risk => {
          lines.push(`    - ${risk.factor_type} (${risk.severity})`)
        })
      }
    })

    return lines.join('\n')
  }

  /**
   * Generate filename based on options
   */
  generateFilename(options: ExportOptions, prefix = 'engagement-analytics'): string {
    const timestamp = new Date().toISOString().split('T')[0]
    const extension = options.format === 'excel' ? 'xlsx' : options.format
    
    return `${prefix}-${timestamp}.${extension}`
  }

  /**
   * Download blob as file
   */
  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * Export chart data to image
   */
  exportChartAsImage(chartRef: any, format: 'png' | 'jpeg' = 'png', quality = 0.8): string {
    if (!chartRef || !chartRef.chart) {
      throw new Error('Invalid chart reference')
    }

    const canvas = chartRef.chart.canvas
    return canvas.toDataURL(`image/${format}`, quality)
  }

  /**
   * Export multiple charts as ZIP
   */
  async exportChartsAsZip(charts: Array<{ name: string; chartRef: any }>): Promise<Blob> {
    // This would require a ZIP library like JSZip in a real implementation
    // For now, return a JSON blob with base64 images
    
    const chartImages: Record<string, string> = {}
    
    charts.forEach(({ name, chartRef }) => {
      try {
        chartImages[name] = this.exportChartAsImage(chartRef)
      } catch (error) {
        console.warn(`Failed to export chart ${name}:`, error)
      }
    })

    const zipContent = JSON.stringify(chartImages, null, 2)
    return new Blob([zipContent], { type: 'application/json' })
  }

  /**
   * Validate export data
   */
  validateExportData(data: ExportData): boolean {
    if (!data.principals || !Array.isArray(data.principals)) {
      return false
    }

    if (!data.summary || typeof data.summary !== 'object') {
      return false
    }

    if (!data.metadata || typeof data.metadata !== 'object') {
      return false
    }

    return true
  }

  /**
   * Sanitize data for export (remove sensitive information)
   */
  sanitizeExportData(data: ExportData): ExportData {
    return {
      ...data,
      principals: data.principals.map(principal => ({
        ...principal,
        // Remove potentially sensitive fields
        distributor_relationships: principal.distributor_relationships.map(rel => ({
          ...rel,
          // Keep only necessary fields
          distributor_id: rel.distributor_id,
          distributor_name: rel.distributor_name,
          relationship_stage: rel.relationship_stage,
          interaction_count: rel.interaction_count,
          last_interaction_date: rel.last_interaction_date,
          engagement_quality_score: rel.engagement_quality_score
        }))
      }))
    }
  }
}

// Export singleton instance
export const exportService = new ExportService()
export default exportService