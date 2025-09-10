import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Grid, Ruler, Layout } from 'lucide-react'
import { toast } from 'sonner'

export function SpacingDemo() {
  const [selectedSpacing, setSelectedSpacing] = useState('md')

  const copyCode = (code: string, label: string) => {
    navigator.clipboard.writeText(code)
    toast.success(`Copied ${label} to clipboard`)
  }

  const spacingScale = [
    { name: 'XS', value: '0.5rem', pixels: '8px', className: 'space-y-2', usage: 'Tight spacing, form elements' },
    { name: 'SM', value: '1rem', pixels: '16px', className: 'space-y-4', usage: 'Small spacing, list items' },
    { name: 'MD', value: '1.5rem', pixels: '24px', className: 'space-y-6', usage: 'Standard spacing, card content' },
    { name: 'LG', value: '2rem', pixels: '32px', className: 'space-y-8', usage: 'Large spacing, sections' },
    { name: 'XL', value: '3rem', pixels: '48px', className: 'space-y-12', usage: 'Extra large, page sections' },
    { name: '2XL', value: '4rem', pixels: '64px', className: 'space-y-16', usage: 'Section breaks' },
    { name: '3XL', value: '5rem', pixels: '80px', className: 'space-y-20', usage: 'Major page divisions' },
  ]

  const paddingScale = [
    { name: 'P-2', value: '0.5rem', pixels: '8px', className: 'p-2', usage: 'Tight padding' },
    { name: 'P-3', value: '0.75rem', pixels: '12px', className: 'p-3', usage: 'Small padding' },
    { name: 'P-4', value: '1rem', pixels: '16px', className: 'p-4', usage: 'Standard padding' },
    { name: 'P-6', value: '1.5rem', pixels: '24px', className: 'p-6', usage: 'Card padding (standard)' },
    { name: 'P-8', value: '2rem', pixels: '32px', className: 'p-8', usage: 'Large padding' },
    { name: 'P-12', value: '3rem', pixels: '48px', className: 'p-12', usage: 'Extra large padding' },
  ]

  const radiusScale = [
    { name: 'None', value: '0px', className: 'rounded-none', usage: 'No rounding' },
    { name: 'SM', value: '2px', className: 'rounded-sm', usage: 'Subtle rounding' },
    { name: 'Base', value: '4px', className: 'rounded', usage: 'Default rounding' },
    { name: 'MD', value: '6px', className: 'rounded-md', usage: 'Medium rounding' },
    { name: 'LG', value: '8px', className: 'rounded-lg', usage: 'Large rounding (standard)' },
    { name: 'XL', value: '12px', className: 'rounded-xl', usage: 'Extra large (cards)' },
    { name: '2XL', value: '16px', className: 'rounded-2xl', usage: 'Very large (modals)' },
    { name: 'Full', value: '9999px', className: 'rounded-full', usage: 'Circular/pill shape' },
  ]

  const gridExamples = [
    {
      name: 'KPI Cards',
      className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
      description: '4-column responsive grid for dashboard KPIs'
    },
    {
      name: 'Content Grid',
      className: 'grid grid-cols-1 lg:grid-cols-3 gap-6',
      description: '3-column layout for main content areas'
    },
    {
      name: 'Form Grid',
      className: 'grid grid-cols-1 md:grid-cols-2 gap-4',
      description: '2-column form layout for desktop'
    },
    {
      name: 'Card Grid',
      className: 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4',
      description: 'Responsive card grid'
    }
  ]

  const SpacingVisualizer = ({ spacing }: { spacing: typeof spacingScale[0] }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{spacing.name} - {spacing.pixels}</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyCode(spacing.className, `${spacing.name} Spacing`)}
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="border rounded-lg p-4 bg-background">
        <div className={spacing.className}>
          <div className="h-8 bg-primary/20 rounded flex items-center justify-center text-xs">
            Element 1
          </div>
          <div className="h-8 bg-primary/20 rounded flex items-center justify-center text-xs">
            Element 2
          </div>
          <div className="h-8 bg-primary/20 rounded flex items-center justify-center text-xs">
            Element 3
          </div>
        </div>
      </div>
      
      <p className="text-caption text-muted">{spacing.usage}</p>
      
      <div className="space-y-2">
        <code className="block p-2 bg-muted rounded text-xs">
          className="{spacing.className}"
        </code>
        <code className="block p-2 bg-muted rounded text-xs">
          gap: {spacing.value} /* {spacing.pixels} */
        </code>
      </div>
    </div>
  )

  const PaddingVisualizer = ({ padding }: { padding: typeof paddingScale[0] }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{padding.name} - {padding.pixels}</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyCode(padding.className, `${padding.name} Padding`)}
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <div className={`${padding.className} bg-primary/10 border-2 border-dashed border-primary/30`}>
          <div className="bg-background border rounded text-center py-2 text-xs">
            Content Area
          </div>
        </div>
      </div>
      
      <p className="text-caption text-muted">{padding.usage}</p>
      
      <code className="block p-2 bg-muted rounded text-xs">
        className="{padding.className}"
      </code>
    </div>
  )

  const RadiusVisualizer = ({ radius }: { radius: typeof radiusScale[0] }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{radius.name} - {radius.value}</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyCode(radius.className, `${radius.name} Radius`)}
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="flex justify-center">
        <div className={`w-24 h-24 bg-primary/20 border-2 border-primary ${radius.className} flex items-center justify-center`}>
          <span className="text-xs text-center">{radius.value}</span>
        </div>
      </div>
      
      <p className="text-caption text-muted text-center">{radius.usage}</p>
      
      <code className="block p-2 bg-muted rounded text-xs text-center">
        className="{radius.className}"
      </code>
    </div>
  )

  const GridVisualizer = ({ grid }: { grid: typeof gridExamples[0] }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{grid.name}</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyCode(grid.className, `${grid.name} Grid`)}
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="border rounded-lg p-4 bg-background">
        <div className={grid.className}>
          {Array.from({ length: grid.name === 'KPI Cards' ? 4 : 3 }, (_, i) => (
            <div key={i} className="h-16 bg-primary/20 rounded flex items-center justify-center text-xs">
              Item {i + 1}
            </div>
          ))}
        </div>
      </div>
      
      <p className="text-caption text-muted">{grid.description}</p>
      
      <code className="block p-2 bg-muted rounded text-xs">
        className="{grid.className}"
      </code>
    </div>
  )

  const ComponentSpacingExample = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Real Component Spacing</CardTitle>
        <CardDescription>See spacing applied in actual CRM components</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Card Example */}
          <div className="border rounded-xl p-6 bg-background space-y-6">
            <div className="space-y-1.5">
              <h3 className="text-title text-primary">Premier Restaurant Group</h3>
              <p className="text-caption text-muted">High-priority customer account</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-label text-muted">PRIORITY RATING</label>
                <Badge priority="a-plus">A+ Priority</Badge>
              </div>
              <div className="space-y-2">
                <label className="text-label text-muted">ORGANIZATION TYPE</label>
                <Badge orgType="customer">Customer</Badge>
              </div>
              <div className="space-y-2">
                <label className="text-label text-muted">STATUS</label>
                <Badge status="active">Active</Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-semibold">Recent Activity</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-1">
                    <p className="text-body">Called about Q2 product catalog</p>
                    <p className="text-caption text-muted">Discussed new organic product line</p>
                  </div>
                  <span className="text-small text-disabled">2h ago</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-1">
                    <p className="text-body">Email sent with proposal</p>
                    <p className="text-caption text-muted">Waiting for feedback</p>
                  </div>
                  <span className="text-small text-disabled">1d ago</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline">View Details</Button>
              <Button>Edit Organization</Button>
            </div>
          </div>

          {/* Spacing Annotations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Card Structure</h4>
              <ul className="space-y-2 text-sm">
                <li><code className="text-xs bg-muted px-2 py-1 rounded">p-6</code> - Card padding (24px)</li>
                <li><code className="text-xs bg-muted px-2 py-1 rounded">space-y-6</code> - Section spacing (24px)</li>
                <li><code className="text-xs bg-muted px-2 py-1 rounded">gap-4</code> - Grid gaps (16px)</li>
                <li><code className="text-xs bg-muted px-2 py-1 rounded">space-y-3</code> - List item spacing (12px)</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Typography Spacing</h4>
              <ul className="space-y-2 text-sm">
                <li><code className="text-xs bg-muted px-2 py-1 rounded">space-y-1.5</code> - Title/subtitle (6px)</li>
                <li><code className="text-xs bg-muted px-2 py-1 rounded">space-y-2</code> - Label/value (8px)</li>
                <li><code className="text-xs bg-muted px-2 py-1 rounded">space-y-1</code> - Related text (4px)</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-8">
      <Tabs defaultValue="spacing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="spacing">Spacing</TabsTrigger>
          <TabsTrigger value="padding">Padding</TabsTrigger>
          <TabsTrigger value="radius">Border Radius</TabsTrigger>
          <TabsTrigger value="grids">Grid Systems</TabsTrigger>
        </TabsList>

        <TabsContent value="spacing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Ruler className="h-5 w-5" />
                <span>8-Point Spacing System</span>
              </CardTitle>
              <CardDescription>
                Consistent vertical and horizontal spacing based on 8px increments
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {spacingScale.map((spacing) => (
              <Card key={spacing.name}>
                <CardContent className="p-6">
                  <SpacingVisualizer spacing={spacing} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="padding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Padding Scale</CardTitle>
              <CardDescription>Internal spacing for components and containers</CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paddingScale.map((padding) => (
              <Card key={padding.name}>
                <CardContent className="p-6">
                  <PaddingVisualizer padding={padding} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="radius" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Border Radius</CardTitle>
              <CardDescription>Corner rounding for components and containers</CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {radiusScale.map((radius) => (
              <Card key={radius.name}>
                <CardContent className="p-6">
                  <RadiusVisualizer radius={radius} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="grids" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Grid className="h-5 w-5" />
                <span>Grid Systems</span>
              </CardTitle>
              <CardDescription>Responsive grid patterns for different layouts</CardDescription>
            </CardHeader>
          </Card>

          <div className="space-y-6">
            {gridExamples.map((grid) => (
              <Card key={grid.name}>
                <CardContent className="p-6">
                  <GridVisualizer grid={grid} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Component Spacing Example */}
      <ComponentSpacingExample />

      {/* CSS Variables Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">CSS Variables Reference</CardTitle>
          <CardDescription>Design tokens for consistent spacing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Spacing Variables</h4>
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span>--spacing-xs:</span>
                  <span>0.5rem /* 8px */</span>
                </div>
                <div className="flex justify-between">
                  <span>--spacing-sm:</span>
                  <span>1rem /* 16px */</span>
                </div>
                <div className="flex justify-between">
                  <span>--spacing-md:</span>
                  <span>1.5rem /* 24px */</span>
                </div>
                <div className="flex justify-between">
                  <span>--spacing-lg:</span>
                  <span>2rem /* 32px */</span>
                </div>
                <div className="flex justify-between">
                  <span>--spacing-xl:</span>
                  <span>3rem /* 48px */</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Border Radius Variables</h4>
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span>--radius:</span>
                  <span>0.375rem /* 6px */</span>
                </div>
                <div className="flex justify-between">
                  <span>--radius-card:</span>
                  <span>0.75rem /* 12px */</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-4"
                onClick={() => copyCode('--spacing-md: 1.5rem; /* 24px */', 'CSS Variables')}
              >
                <Copy className="h-3 w-3 mr-2" />
                Copy CSS Variables
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}