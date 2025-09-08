import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckCircle2, X, AlertTriangle, HelpCircle, CheckCircleIcon, Settings2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { cleanFieldName } from '../utils/import-simplifier'
import type { SmartFieldMapping } from '../hooks/useSmartImport'

interface QuickFieldReviewProps {
  mappings: SmartFieldMapping[]
  onUpdateMapping: (csvHeader: string, crmField: string | null) => void
  onConfirmMapping: (csvHeader: string) => void
  onSkipField: (csvHeader: string) => void
  onConfirmAll?: () => void
  className?: string
}

// Simplified field options for quick selection
const QUICK_FIELD_OPTIONS = [
  { value: 'name', label: 'Company Name', category: 'Essential' },
  { value: 'phone', label: 'Phone Number', category: 'Contact' },
  { value: 'email', label: 'Email Address', category: 'Contact' },
  { value: 'website', label: 'Website', category: 'Contact' },
  { value: 'address_line_1', label: 'Street Address', category: 'Address' },
  { value: 'city', label: 'City', category: 'Address' },
  { value: 'state_province', label: 'State/Province', category: 'Address' },
  { value: 'postal_code', label: 'ZIP/Postal Code', category: 'Address' },
  { value: 'priority', label: 'Priority Level (A-D)', category: 'Business' },
  { value: 'segment', label: 'Business Segment', category: 'Business' },
  { value: 'type', label: 'Organization Type', category: 'Business' },
  { value: 'primary_manager_name', label: 'Primary Manager', category: 'Management' },
  { value: 'secondary_manager_name', label: 'Secondary Manager', category: 'Management' },
  { value: 'notes', label: 'Notes/Comments', category: 'Other' },
]

function QuickMappingRow({
  mapping,
  onUpdateMapping,
  onConfirmMapping,
  onSkipField,
  showAllDetails = false,
}: {
  mapping: SmartFieldMapping
  onUpdateMapping: (csvHeader: string, crmField: string | null) => void
  onConfirmMapping: (csvHeader: string) => void
  onSkipField: (csvHeader: string) => void
  showAllDetails?: boolean
}) {
  const needsAttention = mapping.status === 'needs_review' && mapping.confidence < 0.9
  const isHighConfidence = mapping.confidence >= 0.95
  const isMediumConfidence = mapping.confidence >= 0.7 && mapping.confidence < 0.95
  const isLowConfidence = mapping.confidence < 0.7
  
  // Determine border and background color based on confidence
  const getCardStyling = () => {
    if (needsAttention || isLowConfidence) {
      return 'border-amber-200 bg-amber-50/30'
    }
    if (isHighConfidence) {
      return 'border-green-200 bg-green-50/30'
    }
    if (isMediumConfidence) {
      return 'border-blue-200 bg-blue-50/30'
    }
    return 'border-slate-200 bg-white'
  }
  
  return (
    <div className={cn(
      'grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg',
      getCardStyling()
    )}>
      {/* CSV Data Preview */}
      <div className="space-y-2">
        <div className="space-y-1">
          <div className="font-medium text-slate-900">
            {cleanFieldName(mapping.csvHeader) || 'Unnamed Column'}
          </div>
          {mapping.csvHeader !== cleanFieldName(mapping.csvHeader) && (
            <div className="font-mono text-xs text-slate-500">
              CSV: "{mapping.csvHeader}"
            </div>
          )}
        </div>
        {mapping.reason && (
          <div className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
            {mapping.reason}
          </div>
        )}
        {mapping.confidence > 0 && (
          <Badge 
            variant={
              mapping.confidence >= 0.95 ? "default" : 
              mapping.confidence >= 0.7 ? "secondary" : "destructive"
            }
            className={cn(
              "text-xs",
              mapping.confidence >= 0.95 ? "bg-green-100 text-green-800 border-green-200" :
              mapping.confidence >= 0.7 ? "bg-blue-100 text-blue-800 border-blue-200" :
              "bg-amber-100 text-amber-800 border-amber-200"
            )}
          >
            {Math.round(mapping.confidence * 100)}% confident
          </Badge>
        )}
        
        {/* Status Badge */}
        {mapping.status && (
          <Badge 
            variant="outline"
            className={cn(
              "text-xs",
              mapping.status === 'confirmed' ? "bg-green-50 text-green-700 border-green-200" :
              mapping.status === 'auto' ? "bg-blue-50 text-blue-700 border-blue-200" :
              mapping.status === 'skipped' ? "bg-gray-50 text-gray-700 border-gray-200" :
              "bg-amber-50 text-amber-700 border-amber-200"
            )}
          >
            {mapping.status === 'auto' ? 'Auto-mapped' :
             mapping.status === 'confirmed' ? 'Confirmed' :
             mapping.status === 'skipped' ? 'Skipped' :
             'Needs Review'}
          </Badge>
        )}
      </div>

      {/* Field Selection */}
      <div className="space-y-2">
        <Select
          value={mapping.crmField || 'none'}
          onValueChange={(value) =>
            onUpdateMapping(mapping.csvHeader, value === 'none' ? null : value)
          }
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Choose field type" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            <SelectItem value="none">
              <span className="text-muted-foreground">Skip this field</span>
            </SelectItem>
            
            {/* Group options by category */}
            {['Essential', 'Contact', 'Address', 'Business', 'Management', 'Other'].map(category => {
              const categoryOptions = QUICK_FIELD_OPTIONS.filter(opt => opt.category === category)
              if (categoryOptions.length === 0) return null
              
              return (
                <div key={category}>
                  <div className="mt-1 border-t px-2 py-1 text-xs font-semibold text-muted-foreground">
                    {category}
                  </div>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </div>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {mapping.status === 'needs_review' && mapping.crmField && (
          <Button
            size="sm"
            onClick={() => onConfirmMapping(mapping.csvHeader)}
            className="flex-1"
          >
            <CheckCircle2 className="mr-1 size-4" />
            Looks Good
          </Button>
        )}
        
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onSkipField(mapping.csvHeader)}
          className="flex-1"
        >
          <X className="mr-1 size-4" />
          Skip
        </Button>
      </div>
    </div>
  )
}

export function QuickFieldReview({
  mappings,
  onUpdateMapping,
  onConfirmMapping,
  onSkipField,
  onConfirmAll,
  className,
}: QuickFieldReviewProps) {
  const needsReviewMappings = mappings.filter(m => m.status === 'needs_review')
  const allMappings = mappings.filter(m => m.crmField !== null || m.status === 'skipped')
  const confirmedMappings = mappings.filter(m => m.status === 'confirmed' || m.status === 'auto')
  const skippedMappings = mappings.filter(m => m.status === 'skipped')
  
  // Stats for display
  const stats = {
    total: mappings.length,
    mapped: allMappings.length,
    confirmed: confirmedMappings.length,
    needsReview: needsReviewMappings.length,
    skipped: skippedMappings.length,
    avgConfidence: mappings.reduce((sum, m) => sum + m.confidence, 0) / mappings.length
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Mapping Statistics */}
      <Card className="bg-slate-50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
            <div>
              <div className="text-2xl font-bold text-slate-900">{stats.mapped}</div>
              <div className="text-sm text-slate-600">of {stats.total} mapped</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
              <div className="text-sm text-slate-600">auto-confirmed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{stats.needsReview}</div>
              <div className="text-sm text-slate-600">need review</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{Math.round(stats.avgConfidence * 100)}%</div>
              <div className="text-sm text-slate-600">avg confidence</div>
            </div>
          </div>
          {onConfirmAll && stats.needsReview > 0 && (
            <div className="mt-4 flex justify-center">
              <Button onClick={onConfirmAll} variant="outline" size="sm">
                <CheckCircleIcon className="mr-2 size-4" />
                Confirm All Mappings
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabbed Interface */}
      <Tabs defaultValue={needsReviewMappings.length > 0 ? "review" : "all"} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="review" className="flex items-center space-x-2">
            <AlertTriangle className="size-4" />
            <span>Needs Review ({needsReviewMappings.length})</span>
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center space-x-2">
            <Settings2 className="size-4" />
            <span>All Mappings ({mappings.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="review" className="space-y-4">
          {needsReviewMappings.length === 0 ? (
            <Card className="border-green-200 bg-green-50/30">
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle2 className="mx-auto size-12 text-green-600" />
                  <h3 className="mt-2 text-lg font-medium text-green-900">All Fields Confirmed!</h3>
                  <p className="text-sm text-green-700">All field mappings have been reviewed and confirmed.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-amber-200">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-amber-100">
                    <AlertTriangle className="size-4 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-amber-900">
                      Quick Review Needed
                    </CardTitle>
                    <p className="text-sm text-amber-700">
                      {needsReviewMappings.length} field{needsReviewMappings.length !== 1 ? 's' : ''} need your attention
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {needsReviewMappings.map((mapping) => (
                  <QuickMappingRow
                    key={mapping.csvHeader}
                    mapping={mapping}
                    onUpdateMapping={onUpdateMapping}
                    onConfirmMapping={onConfirmMapping}
                    onSkipField={onSkipField}
                    showAllDetails={false}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">All Field Mappings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Review and modify any field mapping below. Changes are applied immediately.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {mappings.map((mapping) => (
                <QuickMappingRow
                  key={mapping.csvHeader}
                  mapping={mapping}
                  onUpdateMapping={onUpdateMapping}
                  onConfirmMapping={onConfirmMapping}
                  onSkipField={onSkipField}
                  showAllDetails={true}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Help */}
      <Card className="bg-slate-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <HelpCircle className="mt-0.5 size-4 shrink-0 text-slate-500" />
            <div className="space-y-2 text-sm text-slate-600">
              <p className="font-medium">Field Mapping Guide</p>
              <ul className="space-y-1 text-xs">
                <li>• <strong>Green (95%+)</strong>: Auto-confirmed, high confidence matches</li>
                <li>• <strong>Blue (70-94%)</strong>: Good matches, worth reviewing</li>
                <li>• <strong>Yellow (&lt;70%)</strong>: Low confidence, needs your attention</li>
                <li>• <strong>Company Name</strong> is required for all imports</li>
                <li>• <strong>Skip</strong> fields you don't need - they won't be imported</li>
                <li>• <strong>Priority A-D</strong> helps organize your prospects (A=highest priority)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}