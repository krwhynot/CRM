import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Info,
  Users,
  Database,
  TrendingUp,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { 
  SmartFieldMapping, 
  ImportConfig,
  type ParsedData
} from '../hooks/useSmartImport'
import type { 
  BatchValidationResponseType, 
  DuplicateDetectionResponseType 
} from '@/lib/aiSchemas'

interface SmartPreviewStepProps {
  parsedData: ParsedData | null
  fieldMappings: SmartFieldMapping[]
  validationResults: BatchValidationResponseType | null
  duplicateResults: DuplicateDetectionResponseType | null
  validationInProgress: boolean
  config: ImportConfig
  onRunValidation: () => Promise<void>
  onCheckDuplicates: () => Promise<void>
  className?: string
}

// Preview data table component
function DataPreviewTable({ 
  data, 
  fieldMappings, 
  maxRows = 10 
}: { 
  data: ParsedData
  fieldMappings: SmartFieldMapping[]
  maxRows?: number 
}) {
  const mappedFields = fieldMappings
    .filter(m => m.crmField && m.status !== 'skipped')
    .slice(0, 6) // Limit columns for display

  const previewRows = data.rows.slice(0, maxRows)

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-12">#</TableHead>
              {mappedFields.map((mapping) => (
                <TableHead key={mapping.csvHeader} className="min-w-36">
                  <div className="space-y-1">
                    <div className="font-medium">{mapping.csvHeader}</div>
                    <Badge variant="outline" className="text-xs">
                      {mapping.crmField}
                    </Badge>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {previewRows.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell className="text-slate-500">{idx + 1}</TableCell>
                {mappedFields.map((mapping) => (
                  <TableCell key={mapping.csvHeader} className="max-w-48">
                    <div className="truncate" title={row[mapping.csvHeader]}>
                      {row[mapping.csvHeader] || (
                        <span className="italic text-slate-400">empty</span>
                      )}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {data.rows.length > maxRows && (
        <div className="bg-slate-50 p-3 text-center text-sm text-slate-600">
          Showing {maxRows} of {data.rows.length} rows
        </div>
      )}
    </div>
  )
}

// Validation results component
function ValidationResults({ results }: { results: BatchValidationResponseType }) {
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'error' | 'warning'>('all')

  const filteredRows = results.validatedRows.filter(row => {
    if (selectedSeverity === 'all') return row.issues.length > 0
    return row.issues.some(issue => issue.severity === selectedSeverity)
  })

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <X className="size-4 text-destructive" />
      case 'warning': return <AlertTriangle className="size-4 text-yellow-500" />
      default: return <Info className="size-4 text-primary" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'error': return <Badge variant="destructive">Error</Badge>
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      default: return <Badge variant="secondary">Info</Badge>
    }
  }

  return (
    <div className="space-y-4">
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">{results.summary.totalRows}</div>
            <div className="text-sm text-slate-600">Total Rows</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{results.summary.validRows}</div>
            <div className="text-sm text-slate-600">Valid Rows</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">{results.summary.errorRows}</div>
            <div className="text-sm text-slate-600">Error Rows</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{results.summary.warningRows}</div>
            <div className="text-sm text-slate-600">Warning Rows</div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Score */}
      {results.overallQuality && (
        <Alert className="border-primary/20 bg-primary/5">
          <TrendingUp className="size-4 text-primary" />
          <AlertDescription>
            <strong>Data Quality Score: {Math.round(results.overallQuality * 100)}%</strong>
            {results.overallQuality >= 0.8 && " - Excellent data quality!"}
            {results.overallQuality >= 0.6 && results.overallQuality < 0.8 && " - Good data quality with minor issues."}
            {results.overallQuality < 0.6 && " - Consider reviewing and cleaning your data before import."}
          </AlertDescription>
        </Alert>
      )}

      {/* Issue Filters */}
      <div className="flex space-x-2">
        <Button
          size="sm"
          variant={selectedSeverity === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedSeverity('all')}
        >
          All Issues
        </Button>
        <Button
          size="sm"
          variant={selectedSeverity === 'error' ? 'default' : 'outline'}
          onClick={() => setSelectedSeverity('error')}
        >
          Errors ({results.summary.errorRows})
        </Button>
        <Button
          size="sm"
          variant={selectedSeverity === 'warning' ? 'default' : 'outline'}
          onClick={() => setSelectedSeverity('warning')}
        >
          Warnings ({results.summary.warningRows})
        </Button>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {filteredRows.map((row) => (
          <Card key={row.rowIndex}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Row {row.rowIndex + 1}</span>
                    {!row.isValid && (
                      <Badge variant="destructive">Invalid</Badge>
                    )}
                    {row.confidence && (
                      <Badge variant="outline">
                        {Math.round(row.confidence * 100)}% confidence
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    {row.issues.map((issue, idx) => (
                      <div key={idx} className="flex items-start space-x-2">
                        {getSeverityIcon(issue.severity)}
                        <div className="flex-1 text-sm">
                          <span className="font-medium">{issue.field}:</span> {issue.issue}
                          {issue.suggestion && (
                            <div className="mt-1 text-slate-600">
                              <strong>Suggestion:</strong> {issue.suggestion}
                            </div>
                          )}
                        </div>
                        {getSeverityBadge(issue.severity)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredRows.length === 0 && (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto mb-3 size-12 text-green-500" />
            <h3 className="font-medium text-slate-900">No {selectedSeverity === 'all' ? '' : selectedSeverity} issues found</h3>
            <p className="text-sm text-slate-600">Your data looks good!</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Duplicate results component
function DuplicateResults({ results }: { results: DuplicateDetectionResponseType }) {
  const getSuggestionBadge = (action: string) => {
    switch (action) {
      case 'merge': return <Badge className="bg-primary/10 text-primary">Merge</Badge>
      case 'keep_first': return <Badge className="bg-success/10 text-success">Keep First</Badge>
      case 'keep_last': return <Badge className="bg-purple-100/50 text-purple-700">Keep Last</Badge>
      default: return <Badge variant="outline">Review</Badge>
    }
  }

  return (
    <div className="space-y-4">
      
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">{results.summary.totalRows}</div>
            <div className="text-sm text-slate-600">Total Rows</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{results.summary.uniqueRows}</div>
            <div className="text-sm text-slate-600">Unique Rows</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{results.summary.duplicateGroups}</div>
            <div className="text-sm text-slate-600">Duplicate Groups</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">{results.summary.totalDuplicates}</div>
            <div className="text-sm text-slate-600">Total Duplicates</div>
          </CardContent>
        </Card>
      </div>

      {/* Duplicate Groups */}
      <div className="space-y-3">
        {results.duplicateGroups.map((group, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Duplicate Group {idx + 1}</span>
                    <Badge variant="outline">
                      {Math.round(group.confidence * 100)}% match
                    </Badge>
                    {getSuggestionBadge(group.suggestedAction)}
                  </div>
                  
                  <p className="text-sm text-slate-600">{group.reason}</p>
                  
                  <div className="text-xs text-slate-500">
                    <strong>Affected rows:</strong> {group.rows.map(r => r + 1).join(', ')}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {results.duplicateGroups.length === 0 && (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto mb-3 size-12 text-green-500" />
            <h3 className="font-medium text-slate-900">No duplicates found</h3>
            <p className="text-sm text-slate-600">All rows appear to be unique!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function SmartPreviewStep({
  parsedData,
  fieldMappings,
  validationResults,
  duplicateResults,
  validationInProgress,
  config,
  onRunValidation,
  onCheckDuplicates,
  className
}: SmartPreviewStepProps) {
  
  if (!parsedData) {
    return (
      <div className="py-8 text-center">
        <Database className="mx-auto mb-3 size-12 text-slate-400" />
        <p className="text-slate-600">No data to preview</p>
      </div>
    )
  }

  const mappedFieldsCount = fieldMappings.filter(m => m.crmField && m.status !== 'skipped').length
  const hasErrors = validationResults?.summary.errorRows > 0
  const hasWarnings = validationResults?.summary.warningRows > 0
  const hasDuplicates = (duplicateResults?.summary.totalDuplicates || 0) > 0

  return (
    <div className={cn("space-y-6", className)}>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">{parsedData.rows.length}</div>
            <div className="text-sm text-slate-600">Total Records</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{mappedFieldsCount}</div>
            <div className="text-sm text-slate-600">Mapped Fields</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">{parsedData.headers.length}</div>
            <div className="text-sm text-slate-600">CSV Columns</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center space-x-1">
              <Users className="size-5 text-slate-500" />
              <span className="text-sm capitalize text-slate-600">{config.entityType}s</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Quality Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="size-5" />
            <span>Data Quality Check</span>
          </CardTitle>
          <CardDescription>
            Run AI validation to check data quality and detect duplicates before importing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={onRunValidation}
              disabled={validationInProgress}
              className="h-12 px-6" // iPad touch-friendly
            >
              {validationInProgress ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 size-4" />
                  Run AI Validation
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={onCheckDuplicates}
              disabled={validationInProgress}
              className="h-12 px-6"
            >
              <RefreshCw className="mr-2 size-4" />
              Check Duplicates
            </Button>
          </div>

          {/* Status indicators */}
          <div className="flex flex-wrap gap-2">
            {validationResults && (
              <Badge 
                variant={hasErrors ? "destructive" : hasWarnings ? "secondary" : "default"}
                className={!hasErrors && !hasWarnings ? "bg-success/10 text-success" : ""}
              >
                {hasErrors ? "❌ Errors Found" : hasWarnings ? "⚠️ Warnings" : "✅ Validation Complete"}
              </Badge>
            )}
            {duplicateResults && (
              <Badge 
                variant={hasDuplicates ? "secondary" : "default"}
                className={!hasDuplicates ? "bg-success/10 text-success" : ""}
              >
                {hasDuplicates ? `⚠️ ${duplicateResults.summary.totalDuplicates} Duplicates` : "✅ No Duplicates"}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs defaultValue="preview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="preview">Data Preview</TabsTrigger>
          <TabsTrigger value="validation" disabled={!validationResults}>
            Validation {validationResults && `(${validationResults.summary.errorRows + validationResults.summary.warningRows})`}
          </TabsTrigger>
          <TabsTrigger value="duplicates" disabled={!duplicateResults}>
            Duplicates {duplicateResults && `(${duplicateResults.summary.totalDuplicates})`}
          </TabsTrigger>
          <TabsTrigger value="mapping">Field Mapping</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Preview</CardTitle>
              <CardDescription>
                First 10 rows of your data with mapped field names
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataPreviewTable 
                data={parsedData} 
                fieldMappings={fieldMappings}
                maxRows={10}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation">
          {validationResults ? (
            <ValidationResults results={validationResults} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertTriangle className="mx-auto mb-3 size-12 text-slate-400" />
                <h3 className="font-medium text-slate-900">No validation results</h3>
                <p className="mb-4 text-sm text-slate-600">Run AI validation to check your data quality</p>
                <Button onClick={onRunValidation}>Run Validation</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="duplicates">
          {duplicateResults ? (
            <DuplicateResults results={duplicateResults} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="mx-auto mb-3 size-12 text-slate-400" />
                <h3 className="font-medium text-slate-900">No duplicate check results</h3>
                <p className="mb-4 text-sm text-slate-600">Check for potential duplicates in your data</p>
                <Button onClick={onCheckDuplicates}>Check Duplicates</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="mapping">
          <Card>
            <CardHeader>
              <CardTitle>Field Mapping Summary</CardTitle>
              <CardDescription>
                How your CSV columns are mapped to CRM fields
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {fieldMappings.map((mapping) => (
                  <div 
                    key={mapping.csvHeader}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <div className="font-medium">{mapping.csvHeader}</div>
                      {mapping.crmField && (
                        <div className="text-sm text-slate-600">→ {mapping.crmField}</div>
                      )}
                    </div>
                    <Badge 
                      variant={mapping.status === 'skipped' ? 'secondary' : 'default'}
                      className={
                        mapping.status === 'auto' ? 'bg-success/10 text-success' :
                        mapping.status === 'confirmed' ? 'bg-primary/10 text-primary' :
                        mapping.status === 'needs_review' ? 'bg-yellow-100 text-yellow-800' :
                        ''
                      }
                    >
                      {mapping.status === 'skipped' ? 'Skipped' :
                       mapping.status === 'auto' ? 'Auto-mapped' :
                       mapping.status === 'confirmed' ? 'Confirmed' :
                       'Needs Review'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ready to Import Status */}
      {mappedFieldsCount > 0 && (
        <Alert className={hasErrors ? "border-destructive/20 bg-destructive/5" : "border-success/20 bg-success/5"}>
          <AlertDescription className="flex items-center">
            {hasErrors ? (
              <>
                <X className="mr-2 size-4 text-destructive" />
                Please fix validation errors before importing
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 size-4 text-green-600" />
                Data looks good! Ready to proceed with import.
                {hasWarnings && " Some warnings were found but won't block import."}
                {hasDuplicates && ` ${duplicateResults?.summary.totalDuplicates} duplicates detected.`}
              </>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}