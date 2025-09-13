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
  Zap,
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
  type CriticalIssue,
} from '../utils/import-simplifier'
import { semanticSpacing, semanticTypography, semanticRadius } from '@/styles/tokens'

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
    <div
      className={`${semanticRadius.default}-lg border border-amber-200 bg-amber-50/50 ${semanticSpacing.layoutPadding.lg}`}
    >
      <div
        className="flex cursor-pointer items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={`flex items-center ${semanticSpacing.gap.lg}`}>
          <div className="flex size-6 shrink-0 items-center justify-center ${semanticRadius.default}-full bg-amber-100">
            <span className="${semanticTypography.body} ${fontWeight.bold} text-amber-700">
              {issue.count}
            </span>
          </div>
          <div>
            <h4 className="${fontWeight.medium} text-amber-900">{issue.title}</h4>
            <p className="${semanticTypography.body} text-amber-700">{issue.description}</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="size-4 text-amber-600" />
        ) : (
          <ChevronRight className="size-4 text-amber-600" />
        )}
      </div>
      {isExpanded && (
        <div
          className={`${semanticSpacing.topGap.lg} ${semanticSpacing.stack.lg} ${semanticSpacing.leftGap.xl}`}
        >
          <div className={`${semanticTypography.body} text-amber-800`}>
            <strong>Recommended:</strong> {issue.recommendation}
          </div>

          <div className={semanticSpacing.stack.xs}>
            {[issue.recommendation, ...issue.alternatives].map((option, index) => (
              <label
                key={option}
                className={cn(
                  `flex items-center ${semanticSpacing.gap.xs} ${semanticSpacing.layoutPadding.xs} rounded cursor-pointer transition-colors`,
                  selectedDecision === option || (index === 0 && !selectedDecision)
                    ? 'bg-amber-100 border border-amber-300'
                    : 'hover:bg-amber-50'
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
                <span className="${semanticTypography.body} text-amber-900">
                  {option}
                  {index === 0 && (
                    <Badge
                      variant="secondary"
                      className={`${semanticSpacing.leftGap.xs} ${semanticTypography.caption}`}
                    >
                      Recommended
                    </Badge>
                  )}
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
    <div
      className={`${semanticRadius.default}-lg border border-green-200 ${bg - success / 10}/50 ${semanticSpacing.layoutPadding.lg}`}
    >
      <div
        className="flex cursor-pointer items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={`flex items-center ${semanticSpacing.gap.lg}`}>
          <div className="flex size-6 shrink-0 items-center justify-center ${semanticRadius.default}-full bg-green-100">
            <Zap className="size-3 ${text-success}" />
          </div>
          <div>
            <h4 className="${fontWeight.medium} text-green-900">Auto-Fixes Applied</h4>
            <p className="${semanticTypography.body} text-green-700">
              {autoFixes.totalFixes.toLocaleString()} improvements made
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="size-4 ${text-success}" />
        ) : (
          <ChevronRight className="size-4 ${text-success}" />
        )}
      </div>
      {isExpanded && (
        <div
          className={`${semanticSpacing.topGap.lg} ${semanticSpacing.stack.xxs} ${semanticSpacing.leftGap.xl}`}
        >
          {autoFixes.fixes.map((fix, index) => (
            <div
              key={index}
              className={`flex items-center ${semanticSpacing.gap.xs} ${semanticTypography.body} text-green-800`}
            >
              <CheckCircle2 className="size-3 shrink-0 ${text-success}" />
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
  const color =
    confidence >= 0.9 ? 'bg-green-500' : confidence >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className={semanticSpacing.stack.xs}>
      <div className={`flex items-center justify-between ${semanticTypography.body}`}>
        <span className="${fontWeight.medium} text-slate-700">Confidence</span>
        <span className="${fontWeight.bold} text-slate-900">{percentage}%</span>
      </div>
      <div className="h-2 w-full ${semanticRadius.default}-full bg-slate-200">
        <div
          className={cn('h-2 rounded-full transition-all duration-500', color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className={`${semanticTypography.caption} text-slate-600`}>
        {confidence >= 0.9
          ? 'Excellent! Ready to import'
          : confidence >= 0.7
            ? 'Good to go with minor adjustments'
            : 'Needs some attention before importing'}
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
      <div
        className={cn(
          `flex items-center justify-center ${semanticSpacing.layoutPadding.xxl}`,
          className
        )}
      >
        <div className={`${semanticSpacing.stack.lg} text-center`}>
          <div className="mx-auto flex size-16 items-center justify-center ${semanticRadius.default}-full bg-slate-100">
            <Users className="size-8 text-slate-400" />
          </div>
          <div>
            <h3 className="${semanticTypography.subtitle} ${fontWeight.medium} text-slate-900">
              No Data Ready
            </h3>
            <p className="${semanticTypography.body} text-slate-600">
              Upload a file to see import preview
            </p>
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
  const mappedFields = mappings.filter((m) => m.status !== 'skipped').length
  const totalFields = mappings.length
  const isReadyToImport = confidence >= 0.9 && issues.length === 0

  const handleDecision = (issueType: string, decision: string) => {
    setDecisions((prev) => ({ ...prev, [issueType]: decision }))
  }

  return (
    <div className={cn(semanticSpacing.stack.xl, className)}>
      {/* Status Header */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className={semanticSpacing.layoutPadding.xl}>
          <div className={semanticSpacing.stack.lg}>
            {/* Title */}
            <div className={`flex items-center ${semanticSpacing.gap.lg}`}>
              <Users className="size-6 ${text-primary}" />
              <h2 className="${semanticTypography.title} ${fontWeight.semibold} text-slate-900">
                {isReadyToImport ? 'Ready:' : 'Preparing:'} {totalRecords.toLocaleString()}{' '}
                organizations
              </h2>
            </div>

            {/* Summary */}
            <p className="text-slate-700">{summary}</p>

            {/* Quick Stats */}
            <div className={`flex flex-wrap items-center ${semanticSpacing.gap.lg}`}>
              <Badge
                variant="default"
                className={cn(semanticSpacing.compactX, semanticSpacing.minimalY)}
              >
                Records: {totalRecords.toLocaleString()}
              </Badge>
              <Badge
                variant="secondary"
                className={`${semanticSpacing.horizontalPadding.lg} ${semanticSpacing.verticalPadding.xs}`}
              >
                Mapped: {mappedFields}/{totalFields}
              </Badge>
              {issues.length > 0 && (
                <Badge
                  variant="destructive"
                  className={`${semanticSpacing.horizontalPadding.lg} ${semanticSpacing.verticalPadding.xs}`}
                >
                  Issues: {issues.length}
                </Badge>
              )}
              {autoFixes.totalFixes > 0 && (
                <Badge
                  variant="outline"
                  className={`border-green-300 ${semanticSpacing.horizontalPadding.lg} ${semanticSpacing.verticalPadding.xs} text-green-700`}
                >
                  Auto-fixed: {autoFixes.totalFixes.toLocaleString()}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Critical Decisions */}
      {issues.length > 0 && (
        <div className={semanticSpacing.stack.lg}>
          <h3 className="${semanticTypography.subtitle} ${fontWeight.medium} text-slate-900">
            Quick Decisions Needed
          </h3>
          <div className={semanticSpacing.stack.lg}>
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
      {autoFixes.fixes.length > 0 && <AutoFixesSummary autoFixes={autoFixes} />}
      {/* Confidence Indicator */}
      <ConfidenceIndicator confidence={confidence} />
      {/* Action Buttons */}
      <div className={`flex flex-col ${semanticSpacing.gap.lg} sm:flex-row`}>
        {isReadyToImport ? (
          <Button
            onClick={onProceedToImport}
            size="lg"
            className="flex-1 bg-green-600 text-white hover:bg-green-700"
          >
            <ArrowRight className={`${semanticSpacing.rightGap.xs} size-5`} />
            Import Now
          </Button>
        ) : (
          <Button
            onClick={onProceedToImport}
            size="lg"
            className="flex-1"
            disabled={issues.length > 0 && Object.keys(decisions).length === 0}
          >
            <ArrowRight className={`${semanticSpacing.rightGap.xs} size-5`} />
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
            <Eye className={`${semanticSpacing.rightGap.xs} size-4`} />
            Review Details
          </Button>
        )}

        <Button variant="outline" size="lg" className="flex-1 sm:w-auto sm:flex-none">
          <FileDown className={`${semanticSpacing.rightGap.xs} size-4`} />
          Download Report
        </Button>
      </div>
      {/* Help Text */}
      {!isReadyToImport && issues.length > 0 && (
        <Alert>
          <AlertDescription>
            <strong>What happens next?</strong> We'll apply your decisions and import your data. You
            can always review and edit organizations after importing.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
