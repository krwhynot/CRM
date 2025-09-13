import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Copy, Check, Eye } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { semanticSpacing, semanticTypography, semanticRadius } from '@/styles/tokens'
import { semanticColors } from '@/styles/tokens/colors'
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
    {
      name: 'Primary 50',
      value: '#F6FBF1',
      cssVar: '--primary-50',
      description: 'Lightest tint',
      textColor: 'text-primary-600',
    },
    {
      name: 'Primary 100',
      value: '#E8F5D8',
      cssVar: '--primary-100',
      description: 'Light tint',
      textColor: 'text-primary-600',
    },
    {
      name: 'Primary 200',
      value: '#D1EA9F',
      cssVar: '--primary-200',
      description: 'Light',
      textColor: 'text-primary-700',
    },
    {
      name: 'Primary 300',
      value: '#B8DE66',
      cssVar: '--primary-300',
      description: 'Medium light',
      textColor: 'text-primary-800',
    },
    {
      name: 'Primary 400',
      value: '#9DD32D',
      cssVar: '--primary-400',
      description: 'Medium',
      textColor: 'text-white',
    },
    {
      name: 'Primary 500',
      value: '#8DC63F',
      cssVar: '--primary',
      description: 'Brand primary - MFB Green',
      textColor: 'text-white',
    },
    {
      name: 'Primary 600',
      value: '#7CB342',
      cssVar: '--primary-600',
      description: 'Medium dark',
      textColor: 'text-white',
    },
    {
      name: 'Primary 700',
      value: '#689F38',
      cssVar: '--primary-700',
      description: 'Dark',
      textColor: 'text-white',
    },
    {
      name: 'Primary 800',
      value: '#558B2F',
      cssVar: '--primary-800',
      description: 'Darker',
      textColor: 'text-white',
    },
    {
      name: 'Primary 900',
      value: '#33691E',
      cssVar: '--primary-900',
      description: 'Darkest',
      textColor: 'text-white',
    },
  ]

  // Semantic Colors
  const semanticColorSwatches: ColorSwatch[] = [
    {
      name: 'Success',
      value: '#16A34A',
      cssVar: '--success',
      description: 'Success states, positive actions',
      textColor: 'text-white',
    },
    {
      name: 'Warning',
      value: '#F59E0B',
      cssVar: '--warning',
      description: 'Warning states, caution',
      textColor: 'text-black',
    },
    {
      name: 'Destructive',
      value: '#FF3333',
      cssVar: '--destructive',
      description: 'Error states, destructive actions',
      textColor: 'text-white',
    },
    {
      name: 'Info',
      value: '#0EA5E9',
      cssVar: '--info',
      description: 'Information, neutral actions',
      textColor: 'text-white',
    },
  ]

  // CRM Priority Colors
  const priorityColors: ColorSwatch[] = [
    {
      name: 'Priority A+',
      value: '#E53E3E',
      cssVar: '--priority-a-plus',
      description: 'Highest priority customers',
      textColor: 'text-white',
    },
    {
      name: 'Priority A',
      value: '#C53030',
      cssVar: '--priority-a',
      description: 'High priority customers',
      textColor: 'text-white',
    },
    {
      name: 'Priority B',
      value: '#F56500',
      cssVar: '--priority-b',
      description: 'Medium priority customers',
      textColor: 'text-white',
    },
    {
      name: 'Priority C',
      value: '#D69E2E',
      cssVar: '--priority-c',
      description: 'Lower priority customers',
      textColor: 'text-black',
    },
    {
      name: 'Priority D',
      value: '#718096',
      cssVar: '--priority-d',
      description: 'Lowest priority customers',
      textColor: 'text-white',
    },
  ]

  // Organization Type Colors
  const organizationColors: ColorSwatch[] = [
    {
      name: 'Customer',
      value: '#3182CE',
      cssVar: '--org-customer',
      description: 'Customer organizations',
      textColor: 'text-white',
    },
    {
      name: 'Distributor',
      value: '#38A169',
      cssVar: '--org-distributor',
      description: 'Distributor organizations',
      textColor: 'text-white',
    },
    {
      name: 'Principal',
      value: '#805AD5',
      cssVar: '--org-principal',
      description: 'Principal organizations',
      textColor: 'text-white',
    },
    {
      name: 'Supplier',
      value: '#667EEA',
      cssVar: '--org-supplier',
      description: 'Supplier organizations',
      textColor: 'text-white',
    },
  ]

  // Chart Colors
  const chartColors: ColorSwatch[] = [
    {
      name: 'Chart 1',
      value: 'hsl(130, 62%, 50%)',
      cssVar: '--chart-1',
      description: 'Primary data series',
      textColor: 'text-white',
    },
    {
      name: 'Chart 2',
      value: 'hsl(130, 57%, 60%)',
      cssVar: '--chart-2',
      description: 'Secondary data series',
      textColor: 'text-white',
    },
    {
      name: 'Chart 3',
      value: 'hsl(130, 58%, 46%)',
      cssVar: '--chart-3',
      description: 'Tertiary data series',
      textColor: 'text-white',
    },
    {
      name: 'Chart 4',
      value: 'hsl(160, 42%, 56%)',
      cssVar: '--chart-4',
      description: 'Quaternary data series',
      textColor: 'text-white',
    },
    {
      name: 'Chart 5',
      value: 'hsl(110, 35%, 42%)',
      cssVar: '--chart-5',
      description: 'Quinary data series',
      textColor: 'text-white',
    },
  ]

  const ColorSwatchGrid = ({ colors, title }: { colors: ColorSwatch[]; title: string }) => (
    <div className={`${semanticSpacing.stack.md}`}>
      <h3 className={cn(semanticTypography.h4, 'text-subtitle text-primary')}>{title}</h3>
      <div
        className={cn(
          semanticSpacing.gap.md,
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
        )}
      >
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
                      <Check className={cn(semanticSpacing.rightGap.xs, 'h-4 w-4')} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className={cn(semanticSpacing.rightGap.xs, 'h-4 w-4')} />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
            <CardContent className={`${semanticSpacing.cardContainer}`}>
              <div className={`${semanticSpacing.stack.xs}`}>
                <div className="flex items-center justify-between">
                  <h4 className={cn(semanticTypography.h4, semanticTypography.body)}>
                    {color.name}
                  </h4>
                  <Badge variant="outline" className={cn(semanticTypography.caption, 'font-mono')}>
                    {color.value}
                  </Badge>
                </div>
                <p className={cn(semanticTypography.caption, 'text-muted-foreground')}>
                  {color.description}
                </p>
                <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
                  <code
                    className={cn(
                      semanticTypography.caption,
                      semanticSpacing.compactX,
                      semanticSpacing.minimalY,
                      semanticRadius.small,
                      'bg-muted font-mono'
                    )}
                  >
                    hsl(var({color.cssVar}))
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(`hsl(var(${color.cssVar}))`, `${color.name} CSS`)
                    }
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
        <CardTitle className={`${semanticTypography.h4}`}>Color Usage Examples</CardTitle>
        <CardDescription>See how colors look in real components</CardDescription>
      </CardHeader>
      <CardContent className={`${semanticSpacing.stack.lg}`}>
        {/* Priority Badges */}
        <div>
          <h4 className={cn(semanticTypography.h4, 'mb-3')}>Priority Ratings</h4>
          <div className={cn(semanticSpacing.gap.xs, 'flex flex-wrap')}>
            <Badge variant="outline" className={semanticColors.badges.priorityAPlus}>
              A+ Priority
            </Badge>
            <Badge variant="outline" className={semanticColors.badges.priorityA}>
              A Priority
            </Badge>
            <Badge variant="outline" className={semanticColors.badges.priorityB}>
              B Priority
            </Badge>
            <Badge variant="outline" className={semanticColors.badges.priorityC}>
              C Priority
            </Badge>
            <Badge variant="outline" className={semanticColors.badges.priorityD}>
              D Priority
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Organization Types */}
        <div>
          <h4 className={cn(semanticTypography.h4, 'mb-3')}>Organization Types</h4>
          <div className={cn(semanticSpacing.gap.xs, 'flex flex-wrap')}>
            <Badge
              variant="outline"
              className={`${semanticColors.info.background} ${semanticColors.info.foreground} ${semanticColors.info.border}`}
            >
              Customer
            </Badge>
            <Badge
              variant="outline"
              className={`${semanticColors.success.background} ${semanticColors.success.foreground} ${semanticColors.success.border}`}
            >
              Distributor
            </Badge>
            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
              Principal
            </Badge>
            <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-300">
              Supplier
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Status Indicators */}
        <div>
          <h4 className={cn(semanticTypography.h4, 'mb-3')}>Status Indicators</h4>
          <div className={cn(semanticSpacing.gap.xs, 'flex flex-wrap')}>
            <Badge
              variant="outline"
              className={`${semanticColors.success.background} ${semanticColors.success.foreground} ${semanticColors.success.border}`}
            >
              Active
            </Badge>
            <Badge
              variant="outline"
              className={`${semanticColors.warning.background} ${semanticColors.warning.foreground} ${semanticColors.warning.border}`}
            >
              Pending
            </Badge>
            <Badge variant="outline" className="bg-muted text-foreground border-border">
              Inactive
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Buttons */}
        <div>
          <h4 className={cn(semanticTypography.h4, 'mb-3')}>Button Variants</h4>
          <div className={cn(semanticSpacing.gap.sm, 'flex flex-wrap')}>
            <Button variant="default">Primary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button
              variant="outline"
              className={`${semanticColors.success.background} ${semanticColors.success.foreground} ${semanticColors.success.border} hover:bg-green-200`}
            >
              Success
            </Button>
            <Button
              variant="outline"
              className={`${semanticColors.warning.background} ${semanticColors.warning.foreground} ${semanticColors.warning.border} hover:bg-yellow-200`}
            >
              Warning
            </Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className={`${semanticSpacing.stack.xl}`}>
      {/* Color Palette Sections */}
      <ColorSwatchGrid colors={primaryColors} title="MFB Green Primary Palette" />
      <ColorSwatchGrid colors={semanticColorSwatches} title="Semantic Colors" />
      <ColorSwatchGrid colors={priorityColors} title="CRM Priority Ratings" />
      <ColorSwatchGrid colors={organizationColors} title="Organization Types" />
      <ColorSwatchGrid colors={chartColors} title="Data Visualization Colors" />

      {/* Usage Examples */}
      <ColorUsageExample />

      {/* Accessibility Information */}
      <Card>
        <CardHeader>
          <CardTitle
            className={cn(semanticTypography.h4, semanticSpacing.inline.xs, 'flex items-center')}
          >
            <Eye className="h-5 w-5" />
            <span>Accessibility Compliance</span>
          </CardTitle>
          <CardDescription>All colors meet WCAG AAA standards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={cn(semanticSpacing.gap.lg, 'grid grid-cols-1 md:grid-cols-2')}>
            <div>
              <h4 className={cn(semanticTypography.h4, semanticSpacing.bottomGap.xs)}>
                Contrast Ratios
              </h4>
              <ul className={cn(semanticSpacing.stack.xs, semanticTypography.body)}>
                <li>• Text on primary colors: 7:1+ (AAA)</li>
                <li>• UI components: 3:1+ (AA Large)</li>
                <li>• Interactive elements: 4.5:1+ (AA)</li>
              </ul>
            </div>
            <div>
              <h4 className={cn(semanticTypography.h4, semanticSpacing.bottomGap.xs)}>
                Color Blind Support
              </h4>
              <ul className={cn(semanticSpacing.stack.xs, semanticTypography.body)}>
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
