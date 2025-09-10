import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Type, Eye } from 'lucide-react'
import { toast } from 'sonner'

interface TypographyExample {
  name: string
  className: string
  size: string
  weight: string
  lineHeight: string
  usage: string
  example: string
  cssCode: string
}

export function TypographyShowcase() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(label)
    toast.success(`Copied ${label} to clipboard`)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const typographyScale: TypographyExample[] = [
    {
      name: 'Display',
      className: 'text-display',
      size: '32px (2rem)',
      weight: '700 (Bold)',
      lineHeight: '1.2 (38.4px)',
      usage: 'Page titles, hero sections',
      example: 'Organization Management',
      cssCode: 'font-size: 2rem; font-weight: 700; line-height: 1.2; letter-spacing: -0.025em;'
    },
    {
      name: 'Title',
      className: 'text-title',
      size: '24px (1.5rem)',
      weight: '600 (Semibold)',
      lineHeight: '1.3 (31.2px)',
      usage: 'Section titles, card headers',
      example: 'Active Customers',
      cssCode: 'font-size: 1.5rem; font-weight: 600; line-height: 1.3; letter-spacing: -0.015em;'
    },
    {
      name: 'Subtitle',
      className: 'text-subtitle',
      size: '18px (1.125rem)',
      weight: '600 (Semibold)',
      lineHeight: '1.4 (25.2px)',
      usage: 'Subsection headers, form sections',
      example: 'Premier Restaurant Group',
      cssCode: 'font-size: 1.125rem; font-weight: 600; line-height: 1.4;'
    },
    {
      name: 'Body',
      className: 'text-body',
      size: '15px (0.9375rem)',
      weight: '400 (Regular)',
      lineHeight: '1.5 (22.5px)',
      usage: 'Main content, descriptions',
      example: 'Complete customer profile with contact information and interaction history.',
      cssCode: 'font-size: 0.9375rem; font-weight: 400; line-height: 1.5;'
    },
    {
      name: 'Label',
      className: 'text-label',
      size: '14px (0.875rem)',
      weight: '600 (Semibold)',
      lineHeight: '1.5 (21px)',
      usage: 'Form labels, table headers',
      example: 'ORGANIZATION TYPE',
      cssCode: 'font-size: 0.875rem; font-weight: 600; line-height: 1.5; text-transform: uppercase; letter-spacing: 0.05em;'
    },
    {
      name: 'Caption',
      className: 'text-caption',
      size: '14px (0.875rem)',
      weight: '400 (Regular)',
      lineHeight: '1.4 (19.6px)',
      usage: 'Metadata, help text',
      example: 'Last updated 2 hours ago',
      cssCode: 'font-size: 0.875rem; font-weight: 400; line-height: 1.4;'
    },
    {
      name: 'Small',
      className: 'text-small',
      size: '12px (0.75rem)',
      weight: '400 (Regular)',
      lineHeight: '1.4 (16.8px)',
      usage: 'Fine print, timestamps',
      example: 'Data updated every 15 minutes',
      cssCode: 'font-size: 0.75rem; font-weight: 400; line-height: 1.4;'
    }
  ]

  const fontWeights = [
    { name: 'Regular', weight: '400', className: 'font-regular', usage: 'Body text, descriptions' },
    { name: 'Medium', weight: '500', className: 'font-medium', usage: 'Emphasis, important text' },
    { name: 'Semibold', weight: '600', className: 'font-semibold', usage: 'Headings, labels' },
    { name: 'Bold', weight: '700', className: 'font-bold', usage: 'Page titles, strong emphasis' }
  ]

  const textColors = [
    { name: 'Primary', className: 'text-primary', usage: 'Main headings, primary content', description: '15.8:1 contrast ratio' },
    { name: 'Body', className: 'text-body', usage: 'Regular body text', description: '12.6:1 contrast ratio' },
    { name: 'Muted', className: 'text-muted', usage: 'Secondary text, captions', description: '7.5:1 contrast ratio' },
    { name: 'Disabled', className: 'text-disabled', usage: 'Disabled states', description: '4.5:1 contrast ratio' }
  ]

  const TypographyExample = ({ example }: { example: TypographyExample }) => (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Live Example */}
          <div className="border rounded-lg p-6 bg-background">
            <div className={`${example.className} text-primary`}>
              {example.example}
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Properties</h4>
              <ul className="space-y-1">
                <li><strong>Size:</strong> {example.size}</li>
                <li><strong>Weight:</strong> {example.weight}</li>
                <li><strong>Line Height:</strong> {example.lineHeight}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Usage</h4>
              <p className="text-muted-foreground">{example.usage}</p>
            </div>
          </div>

          {/* CSS Code */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">CSS Properties</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(example.cssCode, `${example.name} CSS`)}
                className="h-8"
              >
                <Copy className="h-3 w-3 mr-2" />
                {copiedCode === `${example.name} CSS` ? 'Copied!' : 'Copy CSS'}
              </Button>
            </div>
            <code className="block p-3 bg-muted rounded text-xs overflow-x-auto">
              {example.cssCode}
            </code>
          </div>

          {/* Tailwind Class */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">Tailwind Class</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(example.className, `${example.name} Class`)}
                className="h-8"
              >
                <Copy className="h-3 w-3 mr-2" />
                {copiedCode === `${example.name} Class` ? 'Copied!' : 'Copy Class'}
              </Button>
            </div>
            <code className="block p-3 bg-muted rounded text-xs">
              className="{example.className}"
            </code>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const FontWeightDemo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Font Weights</CardTitle>
        <CardDescription>Nunito font weight variations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {fontWeights.map((weight) => (
            <div key={weight.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">{weight.name} ({weight.weight})</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(weight.className, `${weight.name} Weight`)}
                  className="h-8"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="border rounded-lg p-4 bg-background">
                <p className={`text-lg ${weight.className}`}>
                  Master Food Brokers CRM System
                </p>
              </div>
              <p className="text-caption text-muted">{weight.usage}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const TextColorDemo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Eye className="h-5 w-5" />
          <span>Text Colors & Accessibility</span>
        </CardTitle>
        <CardDescription>AAA compliant text color hierarchy</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {textColors.map((color) => (
            <div key={color.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">{color.name}</h4>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {color.description}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(color.className, `${color.name} Color`)}
                    className="h-8"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="border rounded-lg p-4 bg-background">
                <p className={`text-body ${color.className}`}>
                  The quick brown fox jumps over the lazy dog. This text demonstrates the {color.name.toLowerCase()} color with proper contrast ratios for accessibility compliance.
                </p>
              </div>
              <p className="text-caption text-muted">{color.usage}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  const TypographyInContext = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Typography in Context</CardTitle>
        <CardDescription>See how typography works in real CRM components</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Page Header Example */}
          <div className="border rounded-lg p-6 bg-background space-y-4">
            <h2 className="text-display text-primary">Organization Dashboard</h2>
            <p className="text-subtitle text-muted">
              Manage your customer relationships and track business opportunities
            </p>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-title text-primary">Recent Activities</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-body text-body">Called Premier Restaurant Group</p>
                    <p className="text-caption text-muted">Discussed Q2 product catalog updates</p>
                  </div>
                  <div className="text-right">
                    <p className="text-small text-disabled">2 hours ago</p>
                    <Badge priority="a">A Priority</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-body text-body">Email sent to Healthy Foods Inc.</p>
                    <p className="text-caption text-muted">Product proposal for new organic line</p>
                  </div>
                  <div className="text-right">
                    <p className="text-small text-disabled">4 hours ago</p>
                    <Badge priority="b">B Priority</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Example */}
          <div className="border rounded-lg p-6 bg-background space-y-4">
            <h3 className="text-title text-primary">Create New Organization</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-label text-muted">ORGANIZATION NAME *</label>
                <div className="h-12 border rounded-lg flex items-center px-3 bg-input">
                  <span className="text-body text-muted">Enter organization name</span>
                </div>
                <p className="text-caption text-muted">This will be displayed in all communications</p>
              </div>
              <div className="space-y-2">
                <label className="text-label text-muted">PRIORITY RATING</label>
                <div className="h-12 border rounded-lg flex items-center px-3 bg-input">
                  <span className="text-body text-muted">Select priority level</span>
                </div>
                <p className="text-caption text-muted">Used for customer segmentation</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-8">
      <Tabs defaultValue="scale" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scale">Type Scale</TabsTrigger>
          <TabsTrigger value="weights">Font Weights</TabsTrigger>
          <TabsTrigger value="colors">Text Colors</TabsTrigger>
          <TabsTrigger value="context">In Context</TabsTrigger>
        </TabsList>

        <TabsContent value="scale" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Type className="h-5 w-5" />
                <span>Typography Scale</span>
              </CardTitle>
              <CardDescription>
                Professional hierarchy optimized for business software
              </CardDescription>
            </CardHeader>
          </Card>
          
          <div className="grid grid-cols-1 gap-6">
            {typographyScale.map((example) => (
              <TypographyExample key={example.name} example={example} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="weights" className="space-y-6">
          <FontWeightDemo />
        </TabsContent>

        <TabsContent value="colors" className="space-y-6">
          <TextColorDemo />
        </TabsContent>

        <TabsContent value="context" className="space-y-6">
          <TypographyInContext />
        </TabsContent>
      </Tabs>

      {/* Font Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Font Family</CardTitle>
          <CardDescription>Nunito - Professional sans-serif for business applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Why Nunito?</h4>
              <ul className="space-y-1 text-sm">
                <li>• Optimized for digital interfaces</li>
                <li>• Excellent readability at all sizes</li>
                <li>• Professional yet approachable</li>
                <li>• Strong web font performance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Implementation</h4>
              <code className="block p-3 bg-muted rounded text-xs">
                font-family: 'Nunito', system-ui, -apple-system, sans-serif;
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard("font-family: 'Nunito', system-ui, -apple-system, sans-serif;", 'Font Family')}
                className="mt-2 h-8"
              >
                <Copy className="h-3 w-3 mr-2" />
                Copy Font Stack
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}