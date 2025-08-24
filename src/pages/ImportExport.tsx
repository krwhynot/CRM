import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OrganizationImporter } from '@/features/import-export/components/OrganizationImporter'
import { OrganizationExporter } from '@/features/import-export/components/OrganizationExporter'
import { Upload, Download, Database, FileSpreadsheet } from 'lucide-react'

export default function ImportExportPage() {
  const [activeTab, setActiveTab] = useState('import')

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import & Export</h1>
        <p className="text-muted-foreground">
          Manage your CRM data by importing from CSV files or exporting existing data
        </p>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import Data
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </TabsTrigger>
        </TabsList>

        {/* Import Tab */}
        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                Import Organizations
              </CardTitle>
              <CardDescription>
                Upload CSV files to import organization data into your CRM. 
                Supported formats include customer data, distributor information, and contact details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrganizationImporter />
            </CardContent>
          </Card>

          {/* Future Import Types */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="opacity-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <FileSpreadsheet className="h-4 w-4" />
                  Import Contacts
                </CardTitle>
                <CardDescription className="text-xs">
                  Coming soon - Import individual contacts and associate with organizations
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="opacity-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <FileSpreadsheet className="h-4 w-4" />
                  Import Products
                </CardTitle>
                <CardDescription className="text-xs">
                  Coming soon - Import product catalogs and pricing data
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="opacity-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <FileSpreadsheet className="h-4 w-4" />
                  Import Opportunities
                </CardTitle>
                <CardDescription className="text-xs">
                  Coming soon - Import sales opportunities and pipeline data
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-green-600" />
                Export Organizations
              </CardTitle>
              <CardDescription>
                Export your organization data to CSV files for backup, analysis, or migration purposes.
                Configure field selection and export options to customize your export.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrganizationExporter />
            </CardContent>
          </Card>

          {/* Future Export Types */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="opacity-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <FileSpreadsheet className="h-4 w-4" />
                  Export Contacts
                </CardTitle>
                <CardDescription className="text-xs">
                  Coming soon - Export individual contacts with organization relationships
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="opacity-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <FileSpreadsheet className="h-4 w-4" />
                  Export Products
                </CardTitle>
                <CardDescription className="text-xs">
                  Coming soon - Export product catalogs and pricing information
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="opacity-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <FileSpreadsheet className="h-4 w-4" />
                  Export Opportunities
                </CardTitle>
                <CardDescription className="text-xs">
                  Coming soon - Export sales opportunities and pipeline data
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}