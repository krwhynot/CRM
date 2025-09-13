import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Grid, Ruler } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { semanticSpacing, semanticTypography, semanticRadius } from '@/styles/tokens'
export function SpacingDemo() {
  const [selectedSpacing, setSelectedSpacing] = useState('md')

  const copyCode = (code: string, label: string) => {
    navigator.clipboard.writeText(code)
    toast.success(`Copied ${label} to clipboard`)
  }

  const spacingScale = [
    {
      name: 'XS',
      value: '0.5rem',
      pixels: '8px',
      className: 'space-y-2',
      usage: 'Tight spacing, form elements',
    },
    {
      name: 'SM',
      value: '1rem',
      pixels: '16px',
      className: 'space-y-4',
      usage: 'Small spacing, list items',
    },
    {
      name: 'MD',
      value: '1.5rem',
      pixels: '24px',
      className: 'space-y-6',
      usage: 'Standard spacing, card content',
    },
    {
      name: 'LG',
      value: '2rem',
      pixels: '32px',
      className: 'space-y-8',
      usage: 'Large spacing, sections',
    },
    {
      name: 'XL',
      value: '3rem',
      pixels: '48px',
      className: 'space-y-12',
      usage: 'Extra large, page sections',
    },
    {
      name: '2XL',
      value: '4rem',
      pixels: '64px',
      className: 'space-y-16',
      usage: 'Section breaks',
    },
    {
      name: '3XL',
      value: '5rem',
      pixels: '80px',
      className: 'space-y-20',
      usage: 'Major page divisions',
    },
  ]

  const paddingScale = [
    { name: 'P-2', value: '0.5rem', pixels: '8px', className: 'p-2', usage: 'Tight padding' },
    { name: 'P-3', value: '0.75rem', pixels: '12px', className: 'p-3', usage: 'Small padding' },
    { name: 'P-4', value: '1rem', pixels: '16px', className: 'p-4', usage: 'Standard padding' },
    {
      name: 'P-6',
      value: '1.5rem',
      pixels: '24px',
      className: 'p-6',
      usage: 'Card padding (standard)',
    },
    { name: 'P-8', value: '2rem', pixels: '32px', className: 'p-8', usage: 'Large padding' },
    {
      name: 'P-12',
      value: '3rem',
      pixels: '48px',
      className: 'p-12',
      usage: 'Extra large padding',
    },
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
      description: '4-column responsive grid for dashboard KPIs',
    },
    {
      name: 'Content Grid',
      className: 'grid grid-cols-1 lg:grid-cols-3 gap-6',
      description: '3-column layout for main content areas',
    },
    {
      name: 'Form Grid',
      className: 'grid grid-cols-1 md:grid-cols-2 gap-4',
      description: '2-column form layout for desktop',
    },
    {
      name: 'Card Grid',
      className: 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4',
      description: 'Responsive card grid',
    },
  ]

  const SpacingVisualizer = ({ spacing }: { spacing: (typeof spacingScale)[0] }) => (
    <div className={`${semanticSpacing.stack.md}`}>
      <div className="flex items-center justify-between">
        <h4 className={`${semanticTypography.h4}`}>
          {spacing.name} - {spacing.pixels}
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyCode(spacing.className, `${spacing.name} Spacing`)}
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>

      <div
        className={cn(semanticRadius.large, semanticSpacing.cardContainer, 'border bg-background')}
      >
        <div className={spacing.className}>
          <div
            className={cn(
              semanticRadius.small,
              semanticTypography.caption,
              'h-8 bg-primary/20 flex items-center justify-center'
            )}
          >
            Element 1
          </div>
          <div
            className={cn(
              semanticRadius.small,
              semanticTypography.caption,
              'h-8 bg-primary/20 flex items-center justify-center'
            )}
          >
            Element 2
          </div>
          <div
            className={cn(
              semanticRadius.small,
              semanticTypography.caption,
              'h-8 bg-primary/20 flex items-center justify-center'
            )}
          >
            Element 3
          </div>
        </div>
      </div>

      <p className="text-caption text-muted">{spacing.usage}</p>

      <div className={`${semanticSpacing.stack.xs}`}>
        <code
          className={cn(
            semanticSpacing.compact,
            semanticRadius.small,
            semanticTypography.caption,
            'block bg-muted'
          )}
        >
          className="{spacing.className}"
        </code>
        <code
          className={cn(
            semanticSpacing.compact,
            semanticRadius.small,
            semanticTypography.caption,
            'block bg-muted'
          )}
        >
          gap: {spacing.value} /* {spacing.pixels} */
        </code>
      </div>
    </div>
  )

  const PaddingVisualizer = ({ padding }: { padding: (typeof paddingScale)[0] }) => (
    <div className={`${semanticSpacing.stack.md}`}>
      <div className="flex items-center justify-between">
        <h4 className={`${semanticTypography.h4}`}>
          {padding.name} - {padding.pixels}
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyCode(padding.className, `${padding.name} Padding`)}
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>

      <div className={cn(semanticRadius.large, 'border overflow-hidden')}>
        <div
          className={`${padding.className} bg-primary/10 border-2 border-dashed border-primary/30`}
        >
          <div
            className={cn(
              semanticRadius.small,
              semanticSpacing.compactY,
              semanticTypography.caption,
              'bg-background border text-center'
            )}
          >
            Content Area
          </div>
        </div>
      </div>

      <p className="text-caption text-muted">{padding.usage}</p>

      <code
        className={cn(
          semanticSpacing.compact,
          semanticRadius.small,
          semanticTypography.caption,
          'block bg-muted'
        )}
      >
        className="{padding.className}"
      </code>
    </div>
  )

  const RadiusVisualizer = ({ radius }: { radius: (typeof radiusScale)[0] }) => (
    <div className={`${semanticSpacing.stack.md}`}>
      <div className="flex items-center justify-between">
        <h4 className={`${semanticTypography.h4}`}>
          {radius.name} - {radius.value}
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyCode(radius.className, `${radius.name} Radius`)}
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex justify-center">
        <div
          className={`w-24 h-24 bg-primary/20 border-2 border-primary ${radius.className} flex items-center justify-center`}
        >
          <span className={cn(semanticTypography.caption, 'text-center')}>{radius.value}</span>
        </div>
      </div>

      <p className="text-caption text-muted text-center">{radius.usage}</p>

      <code
        className={cn(
          semanticSpacing.compact,
          semanticRadius.small,
          semanticTypography.caption,
          'block bg-muted text-center'
        )}
      >
        className="{radius.className}"
      </code>
    </div>
  )

  const GridVisualizer = ({ grid }: { grid: (typeof gridExamples)[0] }) => (
    <div className={`${semanticSpacing.stack.md}`}>
      <div className="flex items-center justify-between">
        <h4 className={`${semanticTypography.h4}`}>{grid.name}</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyCode(grid.className, `${grid.name} Grid`)}
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>

      <div
        className={cn(semanticRadius.large, semanticSpacing.cardContainer, 'border bg-background')}
      >
        <div className={grid.className}>
          {Array.from({ length: grid.name === 'KPI Cards' ? 4 : 3 }, (_, i) => (
            <div
              key={i}
              className={cn(
                semanticRadius.small,
                semanticTypography.caption,
                'h-16 bg-primary/20 flex items-center justify-center'
              )}
            >
              Item {i + 1}
            </div>
          ))}
        </div>
      </div>

      <p className="text-caption text-muted">{grid.description}</p>

      <code
        className={cn(
          semanticSpacing.compact,
          semanticRadius.small,
          semanticTypography.caption,
          'block bg-muted'
        )}
      >
        className="{grid.className}"
      </code>
    </div>
  )

  const ComponentSpacingExample = () => (
    <Card>
      <CardHeader>
        <CardTitle className={`${semanticTypography.h4}`}>Real Component Spacing</CardTitle>
        <CardDescription>See spacing applied in actual CRM components</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`${semanticSpacing.stack.xl}`}>
          {/* Card Example */}
          <div
            className={cn(
              semanticRadius.extra,
              semanticSpacing.cardContainer,
              semanticSpacing.stack.lg,
              'border bg-background'
            )}
          >
            <div className="space-y-1.5">
              <h3 className="text-title text-primary">Premier Restaurant Group</h3>
              <p className="text-caption text-muted">High-priority customer account</p>
            </div>

            <div className={cn(semanticSpacing.gap.md, 'grid grid-cols-1 md:grid-cols-3')}>
              <div className={`${semanticSpacing.stack.xs}`}>
                <label className="text-label text-muted">PRIORITY RATING</label>
                <Badge priority="a-plus">A+ Priority</Badge>
              </div>
              <div className={`${semanticSpacing.stack.xs}`}>
                <label className="text-label text-muted">ORGANIZATION TYPE</label>
                <Badge orgType="customer">Customer</Badge>
              </div>
              <div className={`${semanticSpacing.stack.xs}`}>
                <label className="text-label text-muted">STATUS</label>
                <Badge status="active">Active</Badge>
              </div>
            </div>

            <Separator />

            <div className={`${semanticSpacing.stack.md}`}>
              <h4 className={`${semanticTypography.h4}`}>Recent Activity</h4>
              <div className={`${semanticSpacing.stack.sm}`}>
                <div className={cn(semanticSpacing.compactY, 'flex items-center justify-between')}>
                  <div className={`${semanticSpacing.stack.xs}`}>
                    <p className="text-body">Called about Q2 product catalog</p>
                    <p className="text-caption text-muted">Discussed new organic product line</p>
                  </div>
                  <span className="text-small text-disabled">2h ago</span>
                </div>
                <div className={cn(semanticSpacing.compactY, 'flex items-center justify-between')}>
                  <div className={`${semanticSpacing.stack.xs}`}>
                    <p className="text-body">Email sent with proposal</p>
                    <p className="text-caption text-muted">Waiting for feedback</p>
                  </div>
                  <span className="text-small text-disabled">1d ago</span>
                </div>
              </div>
            </div>

            <div className={cn(semanticSpacing.inline.sm, 'flex justify-end')}>
              <Button variant="outline">View Details</Button>
              <Button>Edit Organization</Button>
            </div>
          </div>

          {/* Spacing Annotations */}
          <div className={cn(semanticSpacing.gap.lg, 'grid grid-cols-1 md:grid-cols-2')}>
            <div className={`${semanticSpacing.stack.sm}`}>
              <h4 className={`${semanticTypography.h4}`}>Card Structure</h4>
              <ul className={cn(semanticSpacing.stack.xs, semanticTypography.body)}>
                <li>
                  <code
                    className={cn(
                      semanticTypography.caption,
                      semanticSpacing.compactX,
                      semanticSpacing.minimalY,
                      semanticRadius.small,
                      'bg-muted'
                    )}
                  >
                    p-6
                  </code>{' '}
                  - Card padding (24px)
                </li>
                <li>
                  <code
                    className={cn(
                      semanticTypography.caption,
                      semanticSpacing.compactX,
                      semanticSpacing.minimalY,
                      semanticRadius.small,
                      'bg-muted'
                    )}
                  >
                    space-y-6
                  </code>{' '}
                  - Section spacing (24px)
                </li>
                <li>
                  <code
                    className={cn(
                      semanticTypography.caption,
                      semanticSpacing.compactX,
                      semanticSpacing.minimalY,
                      semanticRadius.small,
                      'bg-muted'
                    )}
                  >
                    gap-4
                  </code>{' '}
                  - Grid gaps (16px)
                </li>
                <li>
                  <code
                    className={cn(
                      semanticTypography.caption,
                      semanticSpacing.compactX,
                      semanticSpacing.minimalY,
                      semanticRadius.small,
                      'bg-muted'
                    )}
                  >
                    space-y-3
                  </code>{' '}
                  - List item spacing (12px)
                </li>
              </ul>
            </div>
            <div className={`${semanticSpacing.stack.sm}`}>
              <h4 className={`${semanticTypography.h4}`}>Typography Spacing</h4>
              <ul className={cn(semanticSpacing.stack.xs, semanticTypography.body)}>
                <li>
                  <code
                    className={cn(
                      semanticTypography.caption,
                      semanticSpacing.compactX,
                      semanticSpacing.minimalY,
                      semanticRadius.small,
                      'bg-muted'
                    )}
                  >
                    space-y-1.5
                  </code>{' '}
                  - Title/subtitle (6px)
                </li>
                <li>
                  <code
                    className={cn(
                      semanticTypography.caption,
                      semanticSpacing.compactX,
                      semanticSpacing.minimalY,
                      semanticRadius.small,
                      'bg-muted'
                    )}
                  >
                    space-y-2
                  </code>{' '}
                  - Label/value (8px)
                </li>
                <li>
                  <code
                    className={cn(
                      semanticTypography.caption,
                      semanticSpacing.compactX,
                      semanticSpacing.minimalY,
                      semanticRadius.small,
                      'bg-muted'
                    )}
                  >
                    space-y-1
                  </code>{' '}
                  - Related text (4px)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className={`${semanticSpacing.stack.xl}`}>
      <Tabs defaultValue="spacing" className={`${semanticSpacing.stack.lg}`}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="spacing">Spacing</TabsTrigger>
          <TabsTrigger value="padding">Padding</TabsTrigger>
          <TabsTrigger value="radius">Border Radius</TabsTrigger>
          <TabsTrigger value="grids">Grid Systems</TabsTrigger>
        </TabsList>

        <TabsContent value="spacing" className={`${semanticSpacing.stack.lg}`}>
          <Card>
            <CardHeader>
              <CardTitle
                className={cn(
                  semanticTypography.h4,
                  semanticSpacing.inline.xs,
                  'flex items-center'
                )}
              >
                <Ruler className="h-5 w-5" />
                <span>8-Point Spacing System</span>
              </CardTitle>
              <CardDescription>
                Consistent vertical and horizontal spacing based on 8px increments
              </CardDescription>
            </CardHeader>
          </Card>

          <div className={cn(semanticSpacing.gap.lg, 'grid grid-cols-1 md:grid-cols-2')}>
            {spacingScale.map((spacing) => (
              <Card key={spacing.name}>
                <CardContent className={`${semanticSpacing.cardContainer}`}>
                  <SpacingVisualizer spacing={spacing} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="padding" className={`${semanticSpacing.stack.lg}`}>
          <Card>
            <CardHeader>
              <CardTitle className={`${semanticTypography.h4}`}>Padding Scale</CardTitle>
              <CardDescription>Internal spacing for components and containers</CardDescription>
            </CardHeader>
          </Card>

          <div
            className={cn(semanticSpacing.gap.lg, 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3')}
          >
            {paddingScale.map((padding) => (
              <Card key={padding.name}>
                <CardContent className={`${semanticSpacing.cardContainer}`}>
                  <PaddingVisualizer padding={padding} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="radius" className={`${semanticSpacing.stack.lg}`}>
          <Card>
            <CardHeader>
              <CardTitle className={`${semanticTypography.h4}`}>Border Radius</CardTitle>
              <CardDescription>Corner rounding for components and containers</CardDescription>
            </CardHeader>
          </Card>

          <div className={cn(semanticSpacing.gap.lg, 'grid grid-cols-2 md:grid-cols-4')}>
            {radiusScale.map((radius) => (
              <Card key={radius.name}>
                <CardContent className={`${semanticSpacing.cardContainer}`}>
                  <RadiusVisualizer radius={radius} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="grids" className={`${semanticSpacing.stack.lg}`}>
          <Card>
            <CardHeader>
              <CardTitle
                className={cn(
                  semanticTypography.h4,
                  semanticSpacing.inline.xs,
                  'flex items-center'
                )}
              >
                <Grid className="h-5 w-5" />
                <span>Grid Systems</span>
              </CardTitle>
              <CardDescription>Responsive grid patterns for different layouts</CardDescription>
            </CardHeader>
          </Card>

          <div className={`${semanticSpacing.stack.lg}`}>
            {gridExamples.map((grid) => (
              <Card key={grid.name}>
                <CardContent className={`${semanticSpacing.cardContainer}`}>
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
          <CardTitle className={`${semanticTypography.h4}`}>CSS Variables Reference</CardTitle>
          <CardDescription>Design tokens for consistent spacing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={cn(semanticSpacing.gap.lg, 'grid grid-cols-1 md:grid-cols-2')}>
            <div>
              <h4 className={cn(semanticTypography.h4, 'mb-3')}>Spacing Variables</h4>
              <div className={cn(semanticSpacing.stack.xs, semanticTypography.body, 'font-mono')}>
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
              <h4 className={cn(semanticTypography.h4, 'mb-3')}>Border Radius Variables</h4>
              <div className={cn(semanticSpacing.stack.xs, semanticTypography.body, 'font-mono')}>
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
                className={`${semanticSpacing.topGap.sm}`}
                onClick={() => copyCode('--spacing-md: 1.5rem; /* 24px */', 'CSS Variables')}
              >
                <Copy className={cn(semanticSpacing.rightGap.xs, 'h-3 w-3')} />
                Copy CSS Variables
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
