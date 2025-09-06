import { Badge } from '@/components/ui/badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { CheckCircle, AlertCircle } from 'lucide-react'
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

// Column definitions for invalid rows table
const invalidRowColumns: Column<{ row: CsvRow; errors: string[]; index: number }>[] = [
  {
    key: 'index',
    header: 'Row',
    cell: (item) => item.index + 1,
  },
  {
    key: 'organizations',
    header: 'Organization',
    cell: (item) => item.row.organizations || '-',
  },
  {
    key: 'priority',
    header: 'Priority',
    cell: (item) => item.row['priority-focus'] || '-',
  },
  {
    key: 'errors',
    header: 'Errors',
    cell: (item) => (
      <div className="space-y-1">
        {item.errors.map((error, errorIndex) => (
          <Badge key={errorIndex} variant="destructive" className="text-xs">
            {error}
          </Badge>
        ))}
      </div>
    ),
  },
]

// Column definitions for valid rows table
const validRowColumns: Column<TransformedOrganizationRow>[] = [
  {
    key: 'name',
    header: 'Organization',
    cell: (row) => <span className="font-medium">{row.name}</span>,
    className: 'min-w-36',
  },
  {
    key: 'priority',
    header: 'Priority',
    cell: (row) => (
      <Badge variant={row.priority === 'A' ? 'default' : 'outline'}>
        {row.priority}
      </Badge>
    ),
  },
  {
    key: 'type',
    header: 'Type',
    cell: (row) => <Badge variant="outline">{row.type}</Badge>,
  },
  {
    key: 'phone',
    header: 'Phone',
    cell: (row) => row.phone || '-',
  },
  {
    key: 'website',
    header: 'Website',
    cell: (row) => (
      row.website ? (
        <a
          href={row.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline"
        >
          Website
        </a>
      ) : (
        '-'
      )
    ),
    className: 'min-w-32 max-w-32 truncate',
  },
  {
    key: 'address_line_1',
    header: 'Address',
    cell: (row) => <span className="max-w-32 truncate">{row.address_line_1 || '-'}</span>,
  },
  {
    key: 'city',
    header: 'City',
    cell: (row) => row.city || '-',
  },
  {
    key: 'state_province',
    header: 'State',
    cell: (row) => row.state_province || '-',
  },
  {
    key: 'postal_code',
    header: 'Zip',
    cell: (row) => row.postal_code || '-',
  },
  {
    key: 'notes',
    header: 'Notes',
    cell: (row) => (
      <span className="max-w-24 truncate" title={row.notes || ''}>
        {row.notes || '-'}
      </span>
    ),
    className: 'min-w-24',
  },
]

export function DataPreviewTable({ parsedData }: DataPreviewTableProps) {
  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-blue-50 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{parsedData.rows.length}</div>
          <div className="text-sm text-gray-600">Total Rows</div>
        </div>
        <div className="rounded-lg bg-green-50 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{parsedData.validRows.length}</div>
          <div className="text-sm text-gray-600">Valid Rows</div>
        </div>
        <div className="rounded-lg bg-red-50 p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{parsedData.invalidRows.length}</div>
          <div className="text-sm text-gray-600">Invalid Rows</div>
        </div>
      </div>

      {/* Invalid Rows Table */}
      {parsedData.invalidRows.length > 0 && (
        <div className="space-y-2">
          <h3 className="flex items-center gap-2 font-medium text-red-600">
            <AlertCircle className="size-4" />
            Invalid Rows (Need Correction)
          </h3>
          <div className="overflow-hidden rounded-lg border">
            <DataTable<{ row: CsvRow; errors: string[]; index: number }>
              data={parsedData.invalidRows.slice(0, 10).map((item, index) => ({ ...item, index }))}
              columns={invalidRowColumns}
              rowKey={(item) => `invalid-${item.index}`}
              empty={{
                title: "No invalid rows",
                description: "All rows are valid and ready for import"
              }}
            />
          </div>
          {parsedData.invalidRows.length > 10 && (
            <p className="text-sm text-muted-foreground">
              Showing first 10 of {parsedData.invalidRows.length} invalid rows
            </p>
          )}
        </div>
      )}

      {/* Valid Rows Preview */}
      {parsedData.validRows.length > 0 && (
        <div className="space-y-2">
          <h3 className="flex items-center gap-2 font-medium text-green-600">
            <CheckCircle className="size-4" />
            Valid Rows Preview
          </h3>
          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <DataTable<TransformedOrganizationRow>
                data={parsedData.validRows.slice(0, 5)}
                columns={validRowColumns}
                rowKey={(row) => `valid-${row.name}-${parsedData.validRows.indexOf(row)}`}
                empty={{
                  title: "No valid rows",
                  description: "No rows passed validation"
                }}
              />
            </div>
          </div>
          {parsedData.validRows.length > 5 && (
            <p className="text-sm text-muted-foreground">
              Showing first 5 of {parsedData.validRows.length} valid rows
            </p>
          )}
        </div>
      )}
    </div>
  )
}
