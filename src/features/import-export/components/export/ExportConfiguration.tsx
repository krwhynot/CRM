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
        <CardTitle className="flex items-center gap-2">
          <Download className="size-5 text-green-600" />
          Export Configuration
        </CardTitle>
        <CardDescription>
          Configure your export settings and select the fields to include
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Format Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Export Format</label>
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
        <div className="space-y-3">
          <label className="text-sm font-medium">Export Options</label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-inactive"
              checked={exportOptions.includeInactive}
              onCheckedChange={handleIncludeInactiveChange}
            />
            <label htmlFor="include-inactive" className="cursor-pointer text-sm font-normal">
              Include inactive organizations
            </label>
          </div>
        </div>

        {/* Field Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Fields to Export</label>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {AVAILABLE_FIELDS.map((field) => (
              <div key={field.id} className="flex items-center space-x-2">
                <Checkbox
                  id={field.id}
                  checked={exportOptions.selectedFields.includes(field.id)}
                  onCheckedChange={(checked) => handleFieldToggle(field.id, checked as boolean)}
                  disabled={field.required}
                />
                <label
                  htmlFor={field.id}
                  className={`cursor-pointer text-sm ${field.required ? 'font-medium text-gray-900' : 'font-normal'}`}
                >
                  {field.label}
                  {field.required && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Required
                    </Badge>
                  )}
                </label>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Selected {exportOptions.selectedFields.length} of {AVAILABLE_FIELDS.length} fields
          </p>
        </div>

        {/* Filters - Coming Soon */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Filter className="size-4" />
            Filters
            <Badge variant="outline" className="text-xs">
              Coming Soon
            </Badge>
          </label>
          <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            Advanced filtering options will be available in a future update
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
