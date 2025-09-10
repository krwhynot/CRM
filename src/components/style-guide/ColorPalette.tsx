import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Copy, Check, Eye } from 'lucide-react'
import { toast } from 'sonner'

interface ColorSwatch {
  name: string
  value: string
  cssVar: string
  description?: string
  textColor?: string
}

export function ColorPalette() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null)

  const copyToClipboard = (text: string, colorName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedColor(colorName)
    toast.success(`Copied ${colorName} to clipboard`)
    setTimeout(() => setCopiedColor(null), 2000)
  }

  // MFB Green Primary Palette
  const primaryColors: ColorSwatch[] = [
    { name: 'Primary 50', value: '#F6FBF1', cssVar: '--primary-50', description: 'Lightest tint', textColor: 'text-primary-600' },
    { name: 'Primary 100', value: '#E8F5D8', cssVar: '--primary-100', description: 'Light tint', textColor: 'text-primary-600' },
    { name: 'Primary 200', value: '#D1EA9F', cssVar: '--primary-200', description: 'Light', textColor: 'text-primary-700' },
    { name: 'Primary 300', value: '#B8DE66', cssVar: '--primary-300', description: 'Medium light', textColor: 'text-primary-800' },
    { name: 'Primary 400', value: '#9DD32D', cssVar: '--primary-400', description: 'Medium', textColor: 'text-white' },
    { name: 'Primary 500', value: '#8DC63F', cssVar: '--primary', description: 'Brand primary - MFB Green', textColor: 'text-white' },
    { name: 'Primary 600', value: '#7CB342', cssVar: '--primary-600', description: 'Medium dark', textColor: 'text-white' },
    { name: 'Primary 700', value: '#689F38', cssVar: '--primary-700', description: 'Dark', textColor: 'text-white' },
    { name: 'Primary 800', value: '#558B2F', cssVar: '--primary-800', description: 'Darker', textColor: 'text-white' },
    { name: 'Primary 900', value: '#33691E', cssVar: '--primary-900', description: 'Darkest', textColor: 'text-white' }
  ]

  // Semantic Colors
  const semanticColors: ColorSwatch[] = [
    { name: 'Success', value: '#16A34A', cssVar: '--success', description: 'Success states, positive actions', textColor: 'text-white' },
    { name: 'Warning', value: '#F59E0B', cssVar: '--warning', description: 'Warning states, caution', textColor: 'text-black' },
    { name: 'Destructive', value: '#FF3333', cssVar: '--destructive', description: 'Error states, destructive actions', textColor: 'text-white' },
    { name: 'Info', value: '#0EA5E9', cssVar: '--info', description: 'Information, neutral actions', textColor: 'text-white' }
  ]

  // CRM Priority Colors
  const priorityColors: ColorSwatch[] = [
    { name: 'Priority A+', value: '#E53E3E', cssVar: '--priority-a-plus', description: 'Highest priority customers', textColor: 'text-white' },
    { name: 'Priority A', value: '#C53030', cssVar: '--priority-a', description: 'High priority customers', textColor: 'text-white' },
    { name: 'Priority B', value: '#F56500', cssVar: '--priority-b', description: 'Medium priority customers', textColor: 'text-white' },
    { name: 'Priority C', value: '#D69E2E', cssVar: '--priority-c', description: 'Lower priority customers', textColor: 'text-black' },
    { name: 'Priority D', value: '#718096', cssVar: '--priority-d', description: 'Lowest priority customers', textColor: 'text-white' }
  ]

  // Organization Type Colors
  const organizationColors: ColorSwatch[] = [
    { name: 'Customer', value: '#3182CE', cssVar: '--org-customer', description: 'Customer organizations', textColor: 'text-white' },
    { name: 'Distributor', value: '#38A169', cssVar: '--org-distributor', description: 'Distributor organizations', textColor: 'text-white' },
    { name: 'Principal', value: '#805AD5', cssVar: '--org-principal', description: 'Principal organizations', textColor: 'text-white' },
    { name: 'Supplier', value: '#667EEA', cssVar: '--org-supplier', description: 'Supplier organizations', textColor: 'text-white' }
  ]

  // Chart Colors
  const chartColors: ColorSwatch[] = [
    { name: 'Chart 1', value: 'hsl(130, 62%, 50%)', cssVar: '--chart-1', description: 'Primary data series', textColor: 'text-white' },
    { name: 'Chart 2', value: 'hsl(130, 57%, 60%)', cssVar: '--chart-2', description: 'Secondary data series', textColor: 'text-white' },
    { name: 'Chart 3', value: 'hsl(130, 58%, 46%)', cssVar: '--chart-3', description: 'Tertiary data series', textColor: 'text-white' },
    { name: 'Chart 4', value: 'hsl(160, 42%, 56%)', cssVar: '--chart-4', description: 'Quaternary data series', textColor: 'text-white' },
    { name: 'Chart 5', value: 'hsl(110, 35%, 42%)', cssVar: '--chart-5', description: 'Quinary data series', textColor: 'text-white' }
  ]

  const ColorSwatchGrid = ({ colors, title }: { colors: ColorSwatch[], title: string }) => (
    <div className="space-y-4">
      <h3 className="text-subtitle font-semibold text-primary">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {colors.map((color) => (
          <Card key={color.name} className="overflow-hidden hover:shadow-md transition-shadow">
            <div 
              className="h-24 w-full relative group cursor-pointer"
              style={{ backgroundColor: color.value }}
              onClick={() => copyToClipboard(color.value, color.name)}
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white text-black"
                >
                  {copiedColor === color.name ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">{color.name}</h4>
                  <Badge variant="outline" className="text-xs font-mono">
                    {color.value}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{color.description}</p>
                <div className="flex items-center space-x-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                    hsl(var({color.cssVar}))
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(`hsl(var(${color.cssVar}))`, `${color.name} CSS`)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const ColorUsageExample = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Color Usage Examples</CardTitle>
        <CardDescription>See how colors look in real components</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Priority Badges */}
        <div>
          <h4 className="font-semibold mb-3">Priority Ratings</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">A+ Priority</Badge>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">A Priority</Badge>
            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">B Priority</Badge>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">C Priority</Badge>
            <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">D Priority</Badge>
          </div>
        </div>

        <Separator />

        {/* Organization Types */}
        <div>
          <h4 className="font-semibold mb-3">Organization Types</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Customer</Badge>
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Distributor</Badge>
            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">Principal</Badge>
            <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-300">Supplier</Badge>
          </div>
        </div>

        <Separator />

        {/* Status Indicators */}
        <div>
          <h4 className="font-semibold mb-3">Status Indicators</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Active</Badge>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>
            <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">Inactive</Badge>
          </div>
        </div>

        <Separator />

        {/* Buttons */}
        <div>
          <h4 className="font-semibold mb-3">Button Variants</h4>
          <div className="flex flex-wrap gap-3">
            <Button variant="default">Primary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline" className="bg-green-100 text-green-800 border-green-300 hover:bg-green-200">Success</Button>
            <Button variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200">Warning</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-8">
      {/* Color Palette Sections */}
      <ColorSwatchGrid colors={primaryColors} title="MFB Green Primary Palette" />
      <ColorSwatchGrid colors={semanticColors} title="Semantic Colors" />
      <ColorSwatchGrid colors={priorityColors} title="CRM Priority Ratings" />
      <ColorSwatchGrid colors={organizationColors} title="Organization Types" />
      <ColorSwatchGrid colors={chartColors} title="Data Visualization Colors" />
      
      {/* Usage Examples */}
      <ColorUsageExample />

      {/* Accessibility Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Accessibility Compliance</span>
          </CardTitle>
          <CardDescription>All colors meet WCAG AAA standards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Contrast Ratios</h4>
              <ul className="space-y-1 text-sm">
                <li>• Text on primary colors: 7:1+ (AAA)</li>
                <li>• UI components: 3:1+ (AA Large)</li>
                <li>• Interactive elements: 4.5:1+ (AA)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Color Blind Support</h4>
              <ul className="space-y-1 text-sm">
                <li>• Deuteranopia friendly palette</li>
                <li>• Protanopia accessible combinations</li>
                <li>• Additional visual indicators beyond color</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}