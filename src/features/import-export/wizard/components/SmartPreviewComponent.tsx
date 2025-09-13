import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
// Removed unused: import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/DataTable'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CheckCircle2,
  AlertTriangle,
  Users,
  Sparkles,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { ImportResultsSimplified } from './ImportResultsSimplified'
import type { SmartFieldMapping } from '../hooks/useSmartImport'
import type { ParsedData } from '@/hooks/useFileUpload'
import { semanticSpacing, semanticTypography, semanticColors } from '@/styles/tokens'

interface SmartPreviewComponentProps {
  parsedData: ParsedData | null
  mappings: SmartFieldMapping[]
  aiInProgress: boolean
  onRegenerateMapping?: () => Promise<void>
  onProceedToImport?: () => void
  className?: string
}

interface PreviewRow {
  [key: string]: string | null
  _originalRowIndex?: number
}

// Available CRM field labels for display
const FIELD_LABELS: Record<string, string> = {
  name: 'Organization Name',
  type: 'Organization Type',
  priority: 'Priority Level',
  segment: 'Business Segment',
  website: 'Website',
  phone: 'Phone Number',
  email: 'Email Address',
  address_line_1: 'Street Address',
  address_line_2: 'Address Line 2',
  city: 'City',
  state_province: 'State/Province',
  postal_code: 'ZIP/Postal Code',
  country: 'Country',
  notes: 'Notes',
  primary_manager_name: 'Primary Manager',
  secondary_manager_name: 'Secondary Manager',
  contact_name: 'Contact Name',
  contact_email: 'Contact Email',
  contact_phone: 'Contact Phone',
  contact_title: 'Contact Title',
  is_active: 'Active Status',
}

export function SmartPreviewComponent({
  parsedData,
  mappings,
  aiInProgress,
  onRegenerateMapping,
  onProceedToImport,
  className,
}: SmartPreviewComponentProps) {
  const [isSimplifiedView, setIsSimplifiedView] = useState(true)

  if (!parsedData || !mappings.length) {
    return (
      <div
        className={cn(
          `flex items-center justify-center ${semanticSpacing.layoutPadding.xl}`,
          className
        )}
      >
        <div className="text-center">
          <div
            className={cn(
              semanticRadius.full,
              'mx-auto',
              semanticSpacing.bottomGap.lg,
              'flex size-12 items-center justify-center bg-muted'
            )}
          >
            <Users className="size-6 text-muted-foreground" />
          </div>
          <h3 className={cn(semanticTypography.h4, semanticTypography.label)}>
            No Data to Preview
          </h3>
          <p className={cn(semanticTypography.body, 'text-muted-foreground')}>
            Upload a file to see the preview.
          </p>
        </div>
      </div>
    )
  }

  // Show simplified view by default
  if (isSimplifiedView) {
    return (
      <div className={cn(semanticSpacing.stack.lg, className)}>
        {/* View Toggle */}
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSimplifiedView(false)}
            className={cn(
              semanticTypography.body,
              semanticColors.text.secondary,
              'hover:',
              semanticColors.text.primary
            )}
          >
            {isSimplifiedView ? (
              <ToggleLeft className={`${semanticSpacing.rightGap.xs} size-4`} />
            ) : (
              <ToggleRight className={`${semanticSpacing.rightGap.xs} size-4`} />
            )}
            {isSimplifiedView ? 'Switch to Advanced View' : 'Switch to Simple View'}
          </Button>
        </div>

        {/* Simplified Import Results */}
        <ImportResultsSimplified
          parsedData={parsedData}
          mappings={mappings}
          onProceedToImport={onProceedToImport}
          onShowAdvancedView={() => setIsSimplifiedView(false)}
        />
      </div>
    )
  }

  // Calculate statistics
  const totalRecords = parsedData.rows.length
  const mappedFields = mappings.filter((m) => m.crmField && m.status !== 'skipped').length
  const autoMappedFields = mappings.filter((m) => m.status === 'auto').length
  const needsReview = mappings.filter((m) => m.status === 'needs_review').length
  const isReadyToImport = needsReview === 0 && mappedFields > 0

  // Transform data for preview table
  const mappingDict = Object.fromEntries(
    mappings
      .filter((m) => m.crmField && m.status !== 'skipped')
      .map((m) => [m.csvHeader, m.crmField!])
  )

  // Create preview data with business-friendly column headers
  const previewData: PreviewRow[] = parsedData.rows.slice(0, 5).map((row, index) => {
    const previewRow: PreviewRow = {
      _originalRowIndex: index,
    }

    Object.entries(mappingDict).forEach(([csvHeader, crmField]) => {
      const friendlyLabel = FIELD_LABELS[crmField] || crmField
      previewRow[friendlyLabel] = row[csvHeader]?.trim() || null
    })

    return previewRow
  })

  // Create columns for DataTable
  const columns = Object.keys(previewData[0] || {})
    .filter((key) => key !== '_originalRowIndex')
    .map((key) => ({
      key: key,
      header: key,
      cell: (row: PreviewRow) => {
        const value = row[key]
        return value ? (
          <span className={cn(semanticTypography.label, semanticColors.text.primary)}>{value}</span>
        ) : (
          <span className="italic text-muted-foreground">—</span>
        )
      },
    }))

  return (
    <div className={cn(semanticSpacing.stack.xl, className)}>
      {/* View Toggle */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSimplifiedView(true)}
          className={cn(
            semanticTypography.body,
            semanticColors.text.secondary,
            'hover:',
            semanticColors.text.primary
          )}
        >
          <ToggleRight className={`${semanticSpacing.rightGap.xs} size-4`} />
          Switch to Simple View
        </Button>
      </div>

      {/* Header with Stats */}
      <Card
        className={`${semanticColors.info.border} bg-gradient-to-r ${semanticColors.info.background} to-indigo-50`}
      >
        <CardContent className={semanticSpacing.layoutPadding.xl}>
          <div className="flex items-center justify-between">
            <div className={semanticSpacing.stack.xs}>
              <div className={`flex items-center ${semanticSpacing.gap.xs}`}>
                <Users className={`size-5 ${semanticColors.info.foreground}`} />
                <h3
                  className={cn(
                    semanticTypography.h4,
                    semanticTypography.h4,
                    semanticColors.text.primary
                  )}
                >
                  {totalRecords.toLocaleString()} Organizations Ready to Import
                </h3>
              </div>
              <div
                className={`flex items-center ${semanticSpacing.gap.lg} ${semanticTypography.caption}`}
              >
                <div className={`flex items-center ${semanticSpacing.gap.xxs}`}>
                  <CheckCircle2 className={`size-4 ${semanticColors.success.foreground}`} />
                  <span>{autoMappedFields} fields auto-mapped</span>
                </div>
                {needsReview > 0 && (
                  <div className={`flex items-center ${semanticSpacing.gap.xxs}`}>
                    <AlertTriangle className={`size-4 ${semanticColors.warning.foreground}`} />
                    <span>{needsReview} fields need attention</span>
                  </div>
                )}
              </div>
            </div>

            {/* AI Regenerate Button */}
            {onRegenerateMapping && (
              <Button
                variant="outline"
                onClick={onRegenerateMapping}
                disabled={aiInProgress}
                className={cn(semanticSpacing.cardX, 'h-12')}
              >
                {aiInProgress ? (
                  <>
                    <RefreshCw className={`${semanticSpacing.rightGap.xs} size-4 animate-spin`} />
                    Improving...
                  </>
                ) : (
                  <>
                    <Sparkles className={`${semanticSpacing.rightGap.xs} size-4`} />
                    Improve Mapping
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Preview Table */}
      <Card>
        <CardHeader>
          <CardTitle>Data Preview</CardTitle>
          <CardDescription>
            Here's how your data will look once imported. We're showing the first 5 rows.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {previewData.length > 0 ? (
            <DataTable<PreviewRow>
              data={previewData}
              columns={columns}
              rowKey={(row) => `preview-${row._originalRowIndex}`}
              className={cn(semanticRadius.large, 'border')}
            />
          ) : (
            <div className={`flex items-center justify-center ${semanticSpacing.layoutPadding.xl}`}>
              <div className="text-center">
                <div
                  className={cn(
                    semanticRadius.full,
                    'mx-auto',
                    semanticSpacing.bottomGap.lg,
                    'flex size-12 items-center justify-center bg-muted'
                  )}
                >
                  <AlertTriangle className="size-6 text-muted-foreground" />
                </div>
                <h3 className={cn(semanticTypography.h4, semanticTypography.label)}>
                  No Preview Available
                </h3>
                <p className={cn(semanticTypography.body, 'text-muted-foreground')}>
                  Unable to create a preview with the current field mappings.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import Status */}
      {isReadyToImport ? (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="size-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="flex items-center justify-between">
              <span>
                Perfect! Your data is ready to import. We'll add {totalRecords.toLocaleString()}{' '}
                organizations to your CRM.
              </span>
              {onProceedToImport && (
                <Button
                  onClick={onProceedToImport}
                  className={`${semanticSpacing.leftGap.lg} bg-green-600 hover:bg-green-700`}
                >
                  Import Now
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="size-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            {needsReview > 0 ? (
              <>
                We need to review {needsReview} field{needsReview !== 1 ? 's' : ''} before
                importing. Click "Improve Mapping" above or check the field mapping section.
              </>
            ) : (
              'No fields are mapped yet. Use the AI mapping feature to get started.'
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats Cards */}
      <div className={`grid grid-cols-2 ${semanticSpacing.gap.lg} md:grid-cols-4`}>
        <Card className="bg-slate-50">
          <CardContent className={`${semanticSpacing.layoutPadding.lg} text-center`}>
            <div className={cn(semanticTypography.h2, semanticTypography.h2, 'text-slate-900')}>
              {totalRecords.toLocaleString()}
            </div>
            <div className={cn(semanticTypography.caption, 'text-slate-600')}>Total Records</div>
          </CardContent>
        </Card>

        <Card className="bg-green-50">
          <CardContent className={`${semanticSpacing.layoutPadding.lg} text-center`}>
            <div className={cn(semanticTypography.h2, semanticTypography.h2, 'text-green-600')}>
              {autoMappedFields}
            </div>
            <div className={cn(semanticTypography.caption, 'text-slate-600')}>Auto-Mapped</div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50">
          <CardContent className={`${semanticSpacing.layoutPadding.lg} text-center`}>
            <div className={cn(semanticTypography.h2, semanticTypography.h2, 'text-amber-600')}>
              {needsReview}
            </div>
            <div className={cn(semanticTypography.caption, 'text-slate-600')}>Need Review</div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50">
          <CardContent className={`${semanticSpacing.layoutPadding.lg} text-center`}>
            <div className={cn(semanticTypography.h2, semanticTypography.h2, 'text-blue-600')}>
              {mappedFields}
            </div>
            <div className={cn(semanticTypography.caption, 'text-slate-600')}>Fields Mapped</div>
          </CardContent>
        </Card>
      </div>

      {/* Help Section */}
      <Card className="bg-muted/30">
        <CardContent className={semanticSpacing.layoutPadding.lg}>
          <div className={`${semanticTypography.body} text-slate-600`}>
            <p className={cn(semanticTypography.label, semanticSpacing.bottomGap.xs)}>
              What happens next?
            </p>
            <ul className={`${semanticSpacing.stack.xxs} ${semanticTypography.caption}`}>
              <li>• Your data will be validated and imported into the CRM</li>
              <li>• Duplicate organizations will be automatically detected</li>
              <li>• You'll receive a detailed import report when complete</li>
              <li>• All imported data can be found in the Organizations section</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
