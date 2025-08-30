import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import type { Database } from '@/lib/database.types'

interface CsvRow {
  [key: string]: string
}

interface TransformedOrganizationRow {
  name: string
  type: Database['public']['Enums']['organization_type']
  priority: 'A' | 'B' | 'C' | 'D'
  segment: string
  website: string | null
  phone: string | null
  address_line_1: string | null
  city: string | null
  state_province: string | null
  postal_code: string | null
  country: string | null
  notes: string | null
  primary_manager_name: string | null
  secondary_manager_name: string | null
  import_notes?: string | null
  is_active: boolean
}

interface ParsedData {
  headers: string[]
  rows: CsvRow[]
  validRows: TransformedOrganizationRow[]
  invalidRows: Array<{ row: CsvRow; errors: string[] }>
}

interface DataPreviewTableProps {
  parsedData: ParsedData
}

export function DataPreviewTable({ parsedData }: DataPreviewTableProps) {

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {parsedData.rows.length}
          </div>
          <div className="text-sm text-gray-600">Total Rows</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {parsedData.validRows.length}
          </div>
          <div className="text-sm text-gray-600">Valid Rows</div>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {parsedData.invalidRows.length}
          </div>
          <div className="text-sm text-gray-600">Invalid Rows</div>
        </div>
      </div>

      {/* Invalid Rows Table */}
      {parsedData.invalidRows.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-red-600 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Invalid Rows (Need Correction)
          </h3>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Row</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Errors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedData.invalidRows.slice(0, 10).map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.row.organizations || '-'}</TableCell>
                    <TableCell>{item.row['priority-focus'] || '-'}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {item.errors.map((error, errorIndex) => (
                          <Badge key={errorIndex} variant="destructive" className="text-xs">
                            {error}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {parsedData.invalidRows.length > 10 && (
            <p className="text-sm text-gray-500">
              Showing first 10 of {parsedData.invalidRows.length} invalid rows
            </p>
          )}
        </div>
      )}

      {/* Valid Rows Preview */}
      {parsedData.validRows.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-green-600 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Valid Rows Preview
          </h3>
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-36">Organization</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="min-w-32">Website</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Zip</TableHead>
                    <TableHead className="min-w-24">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.validRows.slice(0, 5).map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell>
                        <Badge variant={row.priority === 'A' ? 'default' : 'outline'}>
                          {row.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{row.type}</Badge>
                      </TableCell>
                      <TableCell>{row.phone || '-'}</TableCell>
                      <TableCell className="max-w-32 truncate">
                        {row.website ? (
                          <a 
                            href={row.website} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:underline text-xs"
                          >
                            Website
                          </a>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="max-w-32 truncate">
                        {row.address_line_1 || '-'}
                      </TableCell>
                      <TableCell>{row.city || '-'}</TableCell>
                      <TableCell>{row.state_province || '-'}</TableCell>
                      <TableCell>{row.postal_code || '-'}</TableCell>
                      <TableCell className="max-w-24 truncate" title={row.notes || ''}>
                        {row.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          {parsedData.validRows.length > 5 && (
            <p className="text-sm text-gray-500">
              Showing first 5 of {parsedData.validRows.length} valid rows
            </p>
          )}
        </div>
      )}
    </div>
  )
}