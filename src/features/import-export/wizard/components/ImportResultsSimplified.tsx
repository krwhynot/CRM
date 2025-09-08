import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle2, 
  Users, 
  ArrowRight, 
  ChevronDown, 
  ChevronRight,
  FileDown,
  Eye,
  Zap
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { SmartFieldMapping } from '../hooks/useSmartImport'
import type { ParsedData } from '@/hooks/useFileUpload'
import {
  autoFixImportData,
  detectCriticalIssues,
  calculateImportConfidence,
  generateImportSummary,
  type AutoFixResult,
  type CriticalIssue
} from '../utils/import-simplifier'

interface ImportResultsSimplifiedProps {
  parsedData: ParsedData | null
  mappings: SmartFieldMapping[]
  onProceedToImport?: () => void
  onShowAdvancedView?: () => void
  className?: string
}

interface CriticalDecisionProps {
  issue: CriticalIssue
  onDecision: (decision: string) => void
  selectedDecision?: string
}

function CriticalDecision({ issue, onDecision, selectedDecision }: CriticalDecisionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
      <div 
        className="flex cursor-pointer items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <span className="text-sm font-bold text-amber-700">{issue.count}</span>
          </div>
          <div>
            <h4 className="font-medium text-amber-900">{issue.title}</h4>
            <p className="text-sm text-amber-700">{issue.description}</p>
          </div>
        </div>
        {isExpanded ? <ChevronDown className="size-4 text-amber-600" /> : <ChevronRight className="size-4 text-amber-600" />}
      </div>
      
      {isExpanded && (
        <div className="mt-4 space-y-3 pl-9">
          <div className="text-sm text-amber-800">
            <strong>Recommended:</strong> {issue.recommendation}
          </div>
          
          <div className="space-y-2">
            {[issue.recommendation, ...issue.alternatives].map((option, index) => (
              <label
                key={option}
                className={cn(
                  "flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors",
                  selectedDecision === option || (index === 0 && !selectedDecision)
                    ? "bg-amber-100 border border-amber-300"
                    : "hover:bg-amber-50"
                )}
              >
                <input
                  type="radio"
                  name={`decision-${issue.type}`}
                  value={option}
                  checked={selectedDecision === option || (index === 0 && !selectedDecision)}
                  onChange={() => onDecision(option)}
                  className="text-amber-600"
                />
                <span className="text-sm text-amber-900">
                  {option}
                  {index === 0 && <Badge variant="secondary" className="ml-2 text-xs">Recommended</Badge>}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AutoFixesSummary({ autoFixes }: { autoFixes: AutoFixResult }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  if (autoFixes.fixes.length === 0) return null
  
  return (
    <div className="rounded-lg border border-green-200 bg-green-50/50 p-4">
      <div 
        className="flex cursor-pointer items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-green-100">
            <Zap className="size-3 text-green-600" />
          </div>
          <div>
            <h4 className="font-medium text-green-900">Auto-Fixes Applied</h4>
            <p className="text-sm text-green-700">{autoFixes.totalFixes.toLocaleString()} improvements made</p>
          </div>
        </div>
        {isExpanded ? <ChevronDown className="size-4 text-green-600" /> : <ChevronRight className="size-4 text-green-600" />}
      </div>
      
      {isExpanded && (
        <div className="mt-4 space-y-1 pl-9">
          {autoFixes.fixes.map((fix, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm text-green-800">
              <CheckCircle2 className="size-3 shrink-0 text-green-600" />
              <span>{fix.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ConfidenceIndicator({ confidence }: { confidence: number }) {
  const percentage = Math.round(confidence * 100)
  const color = confidence >= 0.9 ? 'bg-green-500' : confidence >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">Confidence</span>
        <span className="font-bold text-slate-900">{percentage}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-200">
        <div 
          className={cn("h-2 rounded-full transition-all duration-500", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-slate-600">
        {confidence >= 0.9 ? "Excellent! Ready to import" : 
         confidence >= 0.7 ? "Good to go with minor adjustments" :
         "Needs some attention before importing"}
      </div>
    </div>
  )
}

export function ImportResultsSimplified({
  parsedData,
  mappings,
  onProceedToImport,
  onShowAdvancedView,
  className,
}: ImportResultsSimplifiedProps) {
  const [decisions, setDecisions] = useState<Record<string, string>>({})
  
  if (!parsedData || !mappings.length) {
    return (
      <div className={cn('flex items-center justify-center p-12', className)}>
        <div className="space-y-4 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-slate-100">
            <Users className="size-8 text-slate-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-900">No Data Ready</h3>
            <p className="text-sm text-slate-600">Upload a file to see import preview</p>
          </div>
        </div>
      </div>
    )
  }

  // Process the data
  const autoFixes = autoFixImportData(parsedData)
  const issues = detectCriticalIssues(parsedData, mappings)
  const confidence = calculateImportConfidence(mappings)
  const summary = generateImportSummary(parsedData.rows.length, mappings, autoFixes, issues)
  
  const totalRecords = parsedData.rows.length
  const mappedFields = mappings.filter(m => m.status !== 'skipped').length
  const totalFields = mappings.length
  const isReadyToImport = confidence >= 0.9 && issues.length === 0

  const handleDecision = (issueType: string, decision: string) => {
    setDecisions(prev => ({ ...prev, [issueType]: decision }))
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Status Header */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Title */}
            <div className="flex items-center space-x-3">
              <Users className="size-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-slate-900">
                {isReadyToImport ? 'Ready:' : 'Preparing:'} {totalRecords.toLocaleString()} organizations
              </h2>
            </div>
            
            {/* Summary */}
            <p className="text-slate-700">{summary}</p>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="default" className="px-3 py-1">
                Records: {totalRecords.toLocaleString()}
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                Mapped: {mappedFields}/{totalFields}
              </Badge>
              {issues.length > 0 && (
                <Badge variant="destructive" className="px-3 py-1">
                  Issues: {issues.length}
                </Badge>
              )}
              {autoFixes.totalFixes > 0 && (
                <Badge variant="outline" className="border-green-300 px-3 py-1 text-green-700">
                  Auto-fixed: {autoFixes.totalFixes.toLocaleString()}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Decisions */}
      {issues.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-slate-900">Quick Decisions Needed</h3>
          <div className="space-y-3">
            {issues.slice(0, 3).map((issue, index) => (
              <CriticalDecision
                key={issue.type}
                issue={issue}
                onDecision={(decision) => handleDecision(issue.type, decision)}
                selectedDecision={decisions[issue.type]}
              />
            ))}
          </div>
        </div>
      )}

      {/* Auto-Fixes Applied */}
      {autoFixes.fixes.length > 0 && (
        <AutoFixesSummary autoFixes={autoFixes} />
      )}

      {/* Confidence Indicator */}
      <ConfidenceIndicator confidence={confidence} />

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {isReadyToImport ? (
          <Button
            onClick={onProceedToImport}
            size="lg"
            className="flex-1 bg-green-600 text-white hover:bg-green-700"
          >
            <ArrowRight className="mr-2 size-5" />
            Import Now
          </Button>
        ) : (
          <Button
            onClick={onProceedToImport}
            size="lg"
            className="flex-1"
            disabled={issues.length > 0 && Object.keys(decisions).length === 0}
          >
            <ArrowRight className="mr-2 size-5" />
            Import with Decisions
          </Button>
        )}
        
        {onShowAdvancedView && (
          <Button
            onClick={onShowAdvancedView}
            variant="outline"
            size="lg"
            className="flex-1 sm:w-auto sm:flex-none"
          >
            <Eye className="mr-2 size-4" />
            Review Details
          </Button>
        )}
        
        <Button
          variant="outline"
          size="lg"
          className="flex-1 sm:w-auto sm:flex-none"
        >
          <FileDown className="mr-2 size-4" />
          Download Report
        </Button>
      </div>

      {/* Help Text */}
      {!isReadyToImport && issues.length > 0 && (
        <Alert>
          <AlertDescription>
            <strong>What happens next?</strong> We'll apply your decisions and import your data. 
            You can always review and edit organizations after importing.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}