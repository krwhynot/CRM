import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle2, AlertTriangle, X, Sparkles, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SmartFieldMapping } from '../hooks/useSmartImport'
import { CONFIDENCE_THRESHOLDS } from '@/lib/openai'

interface SmartFieldMappingProps {
  mappings: SmartFieldMapping[]
  aiInProgress: boolean
  onGenerateAIMappings: () => Promise<void>
  onUpdateMapping: (csvHeader: string, crmField: string | null) => void
  onConfirmMapping: (csvHeader: string) => void
  onSkipField: (csvHeader: string) => void
  className?: string
}

// Available CRM fields organized by category
const CRM_FIELD_OPTIONS = {
  organization: [
    { value: 'name', label: 'Organization Name', description: 'Company or business name' },
    { value: 'website', label: 'Website', description: 'Company website or LinkedIn URL' },
    { value: 'phone', label: 'Phone', description: 'Main organization phone number' },
    { value: 'email', label: 'Email', description: 'Organization contact email' },
    { value: 'address_line_1', label: 'Address Line 1', description: 'Street address' },
    { value: 'address_line_2', label: 'Address Line 2', description: 'Suite, apartment, etc.' },
    { value: 'city', label: 'City', description: 'City name' },
    { value: 'state_province', label: 'State/Province', description: 'State or province' },
    { value: 'postal_code', label: 'ZIP/Postal Code', description: 'ZIP or postal code' },
    { value: 'country', label: 'Country', description: 'Country (usually US)' },
    { value: 'notes', label: 'Notes', description: 'General notes' },
    { value: 'type', label: 'Organization Type', description: 'Customer, distributor, etc.' },
    { value: 'priority', label: 'Priority', description: 'A, B, C, or D priority' },
    { value: 'segment', label: 'Segment', description: 'Business segment' },
    {
      value: 'primary_manager_name',
      label: 'Primary Manager',
      description: 'Primary account manager name',
    },
    {
      value: 'secondary_manager_name',
      label: 'Secondary Manager',
      description: 'Secondary account manager name',
    },
    { value: 'is_active', label: 'Active Status', description: 'Whether organization is active' },
  ],
  contact: [
    { value: 'contact_name', label: 'Full Name', description: 'Contact full name' },
    { value: 'contact_email', label: 'Email', description: 'Contact email address' },
    { value: 'contact_phone', label: 'Phone', description: 'Contact phone number' },
    { value: 'contact_title', label: 'Title', description: 'Job title or role' },
  ],
}

// Get confidence badge styling
function getConfidenceBadge(confidence: number) {
  if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) {
    return {
      variant: 'default' as const,
      status: 'active' as const,
      className: '',
      label: 'High',
      icon: CheckCircle2,
    }
  }

  if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) {
    return {
      variant: 'outline' as const,
      status: 'pending' as const,
      className: '',
      label: 'Medium',
      icon: AlertTriangle,
    }
  }

  return {
    variant: 'outline' as const,
    status: 'inactive' as const,
    className: '',
    label: 'Low',
    icon: X,
  }
}

// Get status badge
function getStatusBadge(status: SmartFieldMapping['status']) {
  switch (status) {
    case 'auto':
      return {
        variant: 'outline' as const,
        status: 'active' as const,
        label: 'Auto-mapped',
        className: '',
      }
    case 'confirmed':
      return {
        variant: 'default' as const,
        label: 'Confirmed',
        className: '',
      }
    case 'needs_review':
      return {
        variant: 'outline' as const,
        status: 'pending' as const,
        label: 'Needs Review',
        className: '',
      }
    case 'skipped':
      return {
        variant: 'secondary' as const,
        label: 'Skipped',
        className: '',
      }
    default:
      return { variant: 'outline' as const, label: 'Unknown', className: '' }
  }
}

// Individual mapping row component
function MappingRow({
  mapping,
  onUpdateMapping,
  onConfirmMapping,
  onSkipField,
}: {
  mapping: SmartFieldMapping
  onUpdateMapping: (csvHeader: string, crmField: string | null) => void
  onConfirmMapping: (csvHeader: string) => void
  onSkipField: (csvHeader: string) => void
}) {
  const confidenceBadge = getConfidenceBadge(mapping.confidence)
  const statusBadge = getStatusBadge(mapping.status)
  const ConfidenceIcon = confidenceBadge.icon

  const allFieldOptions = [...CRM_FIELD_OPTIONS.organization, ...CRM_FIELD_OPTIONS.contact]

  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg bg-white',
        mapping.status === 'needs_review' && 'border-warning/30 bg-warning/10',
        mapping.status === 'auto' && 'border-success/30 bg-success/10',
        mapping.status === 'confirmed' && 'border-primary/30 bg-primary/10'
      )}
    >
      {/* CSV Header */}
      <div className="space-y-2 md:col-span-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-slate-900 md:text-base">
            {mapping.csvHeader}
          </span>
          {mapping.aiSuggestion && <Sparkles className="size-4 text-amber-500" />}
        </div>
        <div className="flex flex-wrap gap-1">
          <Badge {...statusBadge}>{statusBadge.label}</Badge>
          {mapping.confidence > 0 && (
            <Badge {...confidenceBadge}>
              <ConfidenceIcon className="mr-1 size-3" />
              {confidenceBadge.label} ({Math.round(mapping.confidence * 100)}%)
            </Badge>
          )}
        </div>
      </div>

      {/* CRM Field Selection */}
      <div className="space-y-2 md:col-span-4">
        <Select
          value={mapping.crmField || 'none'}
          onValueChange={(value) =>
            onUpdateMapping(mapping.csvHeader, value === 'none' ? null : value)
          }
        >
          <SelectTrigger className="h-12 text-sm">
            {' '}
            {/* iPad touch-friendly height */}
            <SelectValue placeholder="Select CRM field" />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto">
            <SelectItem value="none">
              <span className="text-muted-foreground">Skip this field</span>
            </SelectItem>
            <div className="py-1">
              <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Organization Fields
              </div>
              {CRM_FIELD_OPTIONS.organization.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </SelectItem>
              ))}
            </div>
            <div className="py-1">
              <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Contact Fields
              </div>
              {CRM_FIELD_OPTIONS.contact.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </SelectItem>
              ))}
            </div>
          </SelectContent>
        </Select>

        {/* AI Suggestion Info */}
        {mapping.aiSuggestion && mapping.reason && (
          <div className="rounded border bg-slate-50 p-2 text-xs text-slate-600">
            <span className="font-medium">AI suggests:</span> {mapping.reason}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 md:col-span-3">
        {mapping.status === 'needs_review' && mapping.crmField && (
          <Button
            size="sm"
            onClick={() => onConfirmMapping(mapping.csvHeader)}
            className="h-10 px-4 text-sm" // iPad touch-friendly
          >
            <CheckCircle2 className="mr-1 size-4" />
            Confirm
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={() => onSkipField(mapping.csvHeader)}
          className="h-10 px-4 text-sm"
        >
          <X className="mr-1 size-4" />
          Skip
        </Button>
      </div>

      {/* Alternatives */}
      {mapping.alternatives.length > 0 && (
        <div className="space-y-1 md:col-span-2">
          <div className="text-xs font-medium text-slate-600">Alternatives:</div>
          {mapping.alternatives.slice(0, 2).map((alt, idx) => (
            <Button
              key={idx}
              size="sm"
              variant="ghost"
              className="h-8 w-full justify-start px-2 text-xs"
              onClick={() => onUpdateMapping(mapping.csvHeader, alt)}
            >
              {allFieldOptions.find((f) => f.value === alt)?.label || alt}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

export function SmartFieldMappingComponent({
  mappings,
  aiInProgress,
  onGenerateAIMappings,
  onUpdateMapping,
  onConfirmMapping,
  onSkipField,
  className,
}: SmartFieldMappingProps) {
  // Calculate mapping stats
  const stats = {
    total: mappings.length,
    auto: mappings.filter((m) => m.status === 'auto').length,
    confirmed: mappings.filter((m) => m.status === 'confirmed').length,
    needsReview: mappings.filter((m) => m.status === 'needs_review').length,
    skipped: mappings.filter((m) => m.status === 'skipped').length,
  }

  const isComplete = stats.needsReview === 0 && stats.total > 0

  return (
    <div className={cn('space-y-6', className)}>
      {/* AI Generation Header */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="flex items-center text-lg font-semibold text-slate-900">
                <Sparkles className="mr-2 size-5 text-amber-500" />
                AI-Powered Field Mapping
              </h3>
              <p className="text-sm text-slate-600">
                Let AI automatically map your CSV columns to CRM fields
              </p>
            </div>

            <Button
              onClick={onGenerateAIMappings}
              disabled={aiInProgress || mappings.length === 0}
              className="h-12 px-6" // iPad touch-friendly
            >
              {aiInProgress ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 size-4" />
                  Generate AI Mappings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mapping Stats */}
      {mappings.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                <div className="text-xs text-slate-600">Total Fields</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.auto}</div>
                <div className="text-xs text-slate-600">Auto-mapped</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
                <div className="text-xs text-slate-600">Confirmed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.needsReview}</div>
                <div className="text-xs text-slate-600">Need Review</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">{stats.skipped}</div>
                <div className="text-xs text-slate-600">Skipped</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion Status */}
      {mappings.length > 0 && (
        <Alert
          className={isComplete ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}
        >
          <AlertDescription className="flex items-center">
            {isComplete ? (
              <>
                <CheckCircle2 className="mr-2 size-4 text-green-600" />
                All fields are mapped! You can now proceed to preview your data.
              </>
            ) : (
              <>
                <AlertTriangle className="mr-2 size-4 text-yellow-600" />
                {stats.needsReview} field{stats.needsReview !== 1 ? 's' : ''} still need
                {stats.needsReview === 1 ? 's' : ''} review before proceeding.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Field Mappings */}
      {mappings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Field Mapping</CardTitle>
            <CardDescription>
              Map each CSV column to the corresponding CRM field. AI suggestions are marked with ✨
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {mappings.map((mapping) => (
              <MappingRow
                key={mapping.csvHeader}
                mapping={mapping}
                onUpdateMapping={onUpdateMapping}
                onConfirmMapping={onConfirmMapping}
                onSkipField={onSkipField}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <HelpCircle className="mt-0.5 size-5 text-muted-foreground" />
            <div className="space-y-2 text-sm text-slate-600">
              <p className="font-medium">Need help with field mapping?</p>
              <ul className="space-y-1 text-xs">
                <li>
                  • <strong>Auto-mapped:</strong> AI confidently mapped these fields (≥85%)
                </li>
                <li>
                  • <strong>Needs Review:</strong> AI suggestions with lower confidence (60-84%)
                </li>
                <li>
                  • <strong>Skip:</strong> Fields not needed for import
                </li>
                <li>
                  • <strong>Required:</strong> Organization Name is required for import
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Export alias for backward compatibility
export { SmartFieldMappingComponent as SmartFieldMapping }
