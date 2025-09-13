import React from 'react'
import { Download, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AVAILABLE_FIELDS,
  type ExportOptions,
} from '@/features/import-export/hooks/useExportConfiguration'
import { semanticSpacing, semanticTypography, semanticRadius, fontWeight } from '@/styles/tokens'

interface ExportConfigurationProps {
  exportOptions: ExportOptions
  handleFieldToggle: (fieldId: string, checked: boolean) => void
  handleFormatChange: (format: 'csv' | 'xlsx') => void
  handleIncludeInactiveChange: (checked: boolean) => void
}

export const ExportConfiguration: React.FC<ExportConfigurationProps> = ({
  exportOptions,
  handleFieldToggle,
  handleFormatChange,
  handleIncludeInactiveChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className={`flex items-center ${semanticSpacing.gap.xs}`}>
          <Download className="size-5 text-success" />
          Export Configuration
        </CardTitle>
        <CardDescription>
          Configure your export settings and select the fields to include
        </CardDescription>
      </CardHeader>
      <CardContent className={semanticSpacing.stack.xl}>
        {/* Format Selection */}
        <div className={semanticSpacing.stack.xs}>
          <label className={`${semanticTypography.body} ${fontWeight.medium}`}>Export Format</label>
          <Select value={exportOptions.format} onValueChange={handleFormatChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV File (.csv)</SelectItem>
              <SelectItem value="xlsx" disabled>
                Excel File (.xlsx) - Coming Soon
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Options */}
        <div className={semanticSpacing.stack.lg}>
          <label className={`${semanticTypography.body} ${fontWeight.medium}`}>
            Export Options
          </label>
          <div className={`flex items-center ${semanticSpacing.gap.xs}`}>
            <Checkbox
              id="include-inactive"
              checked={exportOptions.includeInactive}
              onCheckedChange={handleIncludeInactiveChange}
            />
            <label
              htmlFor="include-inactive"
              className={`cursor-pointer ${semanticTypography.body} ${fontWeight.normal}`}
            >
              Include inactive organizations
            </label>
          </div>
        </div>

        {/* Field Selection */}
        <div className={semanticSpacing.stack.lg}>
          <label className={`${semanticTypography.body} ${fontWeight.medium}`}>
            Fields to Export
          </label>
          <div className={`grid grid-cols-2 ${semanticSpacing.gap.lg} md:grid-cols-3`}>
            {AVAILABLE_FIELDS.map((field) => (
              <div key={field.id} className={`flex items-center ${semanticSpacing.gap.xs}`}>
                <Checkbox
                  id={field.id}
                  checked={exportOptions.selectedFields.includes(field.id)}
                  onCheckedChange={(checked) => handleFieldToggle(field.id, checked as boolean)}
                  disabled={field.required}
                />
                <label
                  htmlFor={field.id}
                  className={`cursor-pointer ${semanticTypography.body} ${field.required ? `${fontWeight.medium} text-foreground` : fontWeight.normal}`}
                >
                  {field.label}
                  {field.required && (
                    <Badge
                      variant="secondary"
                      className={`${semanticSpacing.leftGap.xs} ${semanticTypography.caption}`}
                    >
                      Required
                    </Badge>
                  )}
                </label>
              </div>
            ))}
          </div>
          <p className={`${semanticTypography.caption} text-muted-foreground`}>
            Selected {exportOptions.selectedFields.length} of {AVAILABLE_FIELDS.length} fields
          </p>
        </div>

        {/* Filters - Coming Soon */}
        <div className={semanticSpacing.stack.lg}>
          <label
            className={`flex items-center ${semanticSpacing.gap.xs} ${semanticTypography.body} ${fontWeight.medium}`}
          >
            <Filter className="size-4" />
            Filters
            <Badge variant="outline" className={semanticTypography.caption}>
              Coming Soon
            </Badge>
          </label>
          <div
            className={`${semanticRadius.lg} border border-dashed ${semanticSpacing.layoutPadding.lg} text-center ${semanticTypography.body} text-muted-foreground`}
          >
            Advanced filtering options will be available in a future update
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
