import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Download, FileSpreadsheet, AlertCircle, Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { OrganizationImporter } from '@/components/import-export/OrganizationImporter'

function ImportExportPage() {
  const [selectedImportType, setSelectedImportType] = useState<'none' | 'organizations'>('none')

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Import/Export</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Upload className="h-8 w-8 text-blue-600" />
          Import/Export
        </h1>
        <p className="text-muted-foreground mt-1">
          Import organizations from Excel files or export your data
        </p>
      </div>

      {/* Important Information Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Currently supporting organization imports only. Contact and product imports will be available in future updates.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-green-600" />
              Import Data
            </CardTitle>
            <CardDescription>
              Upload Excel files to import organizations into your CRM
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Organizations Import */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                <h3 className="font-medium">Organizations</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Import organization data including principals, customers, and vendors from CSV files.
              </p>
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  onClick={() => setSelectedImportType(selectedImportType === 'organizations' ? 'none' : 'organizations')}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {selectedImportType === 'organizations' ? 'Hide Importer' : 'Import Organizations'}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Supported format: CSV files (.csv)
                </p>
              </div>
            </div>

            {/* Coming Soon Items */}
            <div className="space-y-3">
              <div className="border rounded-lg p-4 space-y-3 opacity-60">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium text-muted-foreground">Contacts</h3>
                  <span className="text-xs bg-secondary px-2 py-1 rounded-full">Coming Soon</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Import contact information and associate with organizations.
                </p>
                <Button variant="secondary" className="w-full" disabled>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Excel File
                </Button>
              </div>

              <div className="border rounded-lg p-4 space-y-3 opacity-60">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium text-muted-foreground">Products</h3>
                  <span className="text-xs bg-secondary px-2 py-1 rounded-full">Coming Soon</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Import product catalog with pricing and specifications.
                </p>
                <Button variant="secondary" className="w-full" disabled>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Excel File
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-purple-600" />
              Export Data
            </CardTitle>
            <CardDescription>
              Download your CRM data in Excel format for analysis or backup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Coming Soon - Export */}
            <div className="border rounded-lg p-4 space-y-3 opacity-60">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium text-muted-foreground">Organizations Export</h3>
                <span className="text-xs bg-secondary px-2 py-1 rounded-full">Coming Soon</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Export all organization data to Excel format.
              </p>
              <Button variant="secondary" className="w-full" disabled>
                <Download className="h-4 w-4 mr-2" />
                Export Organizations
              </Button>
            </div>

            <div className="border rounded-lg p-4 space-y-3 opacity-60">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium text-muted-foreground">Contacts Export</h3>
                <span className="text-xs bg-secondary px-2 py-1 rounded-full">Coming Soon</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Export all contact information to Excel format.
              </p>
              <Button variant="secondary" className="w-full" disabled>
                <Download className="h-4 w-4 mr-2" />
                Export Contacts
              </Button>
            </div>

            <div className="border rounded-lg p-4 space-y-3 opacity-60">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium text-muted-foreground">Full Export</h3>
                <span className="text-xs bg-secondary px-2 py-1 rounded-full">Coming Soon</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Export all CRM data in a comprehensive Excel workbook.
              </p>
              <Button variant="secondary" className="w-full" disabled>
                <Download className="h-4 w-4 mr-2" />
                Export All Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organization Importer */}
      {selectedImportType === 'organizations' && (
        <OrganizationImporter />
      )}

      {/* Import Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            Import Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Organization Import Requirements</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Required columns: Name, Type (principal/customer/vendor)</li>
                <li>• Optional columns: Industry, Description, Website, Phone, Email, Address</li>
                <li>• File size limit: 5MB maximum</li>
                <li>• Maximum 1,000 rows per import</li>
                <li>• Duplicate names will be automatically handled</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Supported File Formats</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• CSV files (.csv) with UTF-8 encoding</li>
                <li>• Headers must be in the first row</li>
                <li>• Use comma (,) as field separator</li>
                <li>• Quote text fields containing commas</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Import Process</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Data validation occurs before import</li>
                <li>• Preview and confirm changes before applying</li>
                <li>• Invalid rows will be highlighted for correction</li>
                <li>• Import progress will be displayed</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ImportExportPage