import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Type, Eye } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { semanticSpacing, semanticRadius, semanticTypography } from '@/styles/tokens'
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
      cssCode: 'font-size: 2rem; font-weight: 700; line-height: 1.2; letter-spacing: -0.025em;',
    },
    {
      name: 'Title',
      className: 'text-title',
      size: '24px (1.5rem)',
      weight: '600 (Semibold)',
      lineHeight: '1.3 (31.2px)',
      usage: 'Section titles, card headers',
      example: 'Active Customers',
      cssCode: 'font-size: 1.5rem; font-weight: 600; line-height: 1.3; letter-spacing: -0.015em;',
    },
    {
      name: 'Subtitle',
      className: 'text-subtitle',
      size: '18px (1.125rem)',
      weight: '600 (Semibold)',
      lineHeight: '1.4 (25.2px)',
      usage: 'Subsection headers, form sections',
      example: 'Premier Restaurant Group',
      cssCode: 'font-size: 1.125rem; font-weight: 600; line-height: 1.4;',
    },
    {
      name: 'Body',
      className: 'text-body',
      size: '15px (0.9375rem)',
      weight: '400 (Regular)',
      lineHeight: '1.5 (22.5px)',
      usage: 'Main content, descriptions',
      example: 'Complete customer profile with contact information and interaction history.',
      cssCode: 'font-size: 0.9375rem; font-weight: 400; line-height: 1.5;',
    },
    {
      name: 'Label',
      className: 'text-label',
      size: '14px (0.875rem)',
      weight: '600 (Semibold)',
      lineHeight: '1.5 (21px)',
      usage: 'Form labels, table headers',
      example: 'ORGANIZATION TYPE',
      cssCode:
        'font-size: 0.875rem; font-weight: 600; line-height: 1.5; text-transform: uppercase; letter-spacing: 0.05em;',
    },
    {
      name: 'Caption',
      className: 'text-caption',
      size: '14px (0.875rem)',
      weight: '400 (Regular)',
      lineHeight: '1.4 (19.6px)',
      usage: 'Metadata, help text',
      example: 'Last updated 2 hours ago',
      cssCode: 'font-size: 0.875rem; font-weight: 400; line-height: 1.4;',
    },
    {
      name: 'Small',
      className: 'text-small',
      size: '12px (0.75rem)',
      weight: '400 (Regular)',
      lineHeight: '1.4 (16.8px)',
      usage: 'Fine print, timestamps',
      example: 'Data updated every 15 minutes',
      cssCode: 'font-size: 0.75rem; font-weight: 400; line-height: 1.4;',
    },
  ]

  const fontWeights = [
    { name: 'Regular', weight: '400', className: 'font-regular', usage: 'Body text, descriptions' },
    { name: 'Medium', weight: '500', className: 'font-medium', usage: 'Emphasis, important text' },
    { name: 'Semibold', weight: '600', className: 'font-semibold', usage: 'Headings, labels' },
    { name: 'Bold', weight: '700', className: 'font-bold', usage: 'Page titles, strong emphasis' },
  ]

  const textColors = [
    {
      name: 'Primary',
      className: 'text-primary',
      usage: 'Main headings, primary content',
      description: '15.8:1 contrast ratio',
    },
    {
      name: 'Body',
      className: 'text-body',
      usage: 'Regular body text',
      description: '12.6:1 contrast ratio',
    },
    {
      name: 'Muted',
      className: 'text-muted',
      usage: 'Secondary text, captions',
      description: '7.5:1 contrast ratio',
    },
    {
      name: 'Disabled',
      className: 'text-disabled',
      usage: 'Disabled states',
      description: '4.5:1 contrast ratio',
    },
  ]

  const TypographyExample = ({ example }: { example: TypographyExample }) => (
    <Card className="overflow-hidden">
      <CardContent className={`${semanticSpacing.cardContainer}`}>
        <div className={`${semanticSpacing.stack.md}`}>
          {/* Live Example */}
          <div
            className={cn(
              semanticRadius.large,
              semanticSpacing.cardContainer,
              'border bg-background'
            )}
          >
            <div className={`${example.className} text-primary`}>{example.example}</div>
          </div>

          {/* Details */}
          <div
            className={cn(
              semanticSpacing.gap.md,
              semanticTypography.body,
              'grid grid-cols-1 md:grid-cols-2'
            )}
          >
            <div>
              <h4 className={cn(semanticTypography.h4, semanticSpacing.bottomGap.xs)}>
                Properties
              </h4>
              <ul className={`${semanticSpacing.stack.xs}`}>
                <li>
                  <strong>Size:</strong> {example.size}
                </li>
                <li>
                  <strong>Weight:</strong> {example.weight}
                </li>
                <li>
                  <strong>Line Height:</strong> {example.lineHeight}
                </li>
              </ul>
            </div>
            <div>
              <h4 className={cn(semanticTypography.h4, semanticSpacing.bottomGap.xs)}>Usage</h4>
              <p className="text-muted-foreground">{example.usage}</p>
            </div>
          </div>

          {/* CSS Code */}
          <div>
            <div className={cn(semanticSpacing.bottomGap.xs, 'flex items-center justify-between')}>
              <h4 className={cn(semanticTypography.h4, semanticTypography.body)}>CSS Properties</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(example.cssCode, `${example.name} CSS`)}
                className="h-8"
              >
                <Copy className={cn(semanticSpacing.rightGap.xs, 'h-3 w-3')} />
                {copiedCode === `${example.name} CSS` ? 'Copied!' : 'Copy CSS'}
              </Button>
            </div>
            <code
              className={cn(
                semanticSpacing.compact,
                semanticRadius.small,
                semanticTypography.caption,
                'block bg-muted overflow-x-auto'
              )}
            >
              {example.cssCode}
            </code>
          </div>

          {/* Tailwind Class */}
          <div>
            <div className={cn(semanticSpacing.bottomGap.xs, 'flex items-center justify-between')}>
              <h4 className={cn(semanticTypography.h4, semanticTypography.body)}>Tailwind Class</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(example.className, `${example.name} Class`)}
                className="h-8"
              >
                <Copy className={cn(semanticSpacing.rightGap.xs, 'h-3 w-3')} />
                {copiedCode === `${example.name} Class` ? 'Copied!' : 'Copy Class'}
              </Button>
            </div>
            <code
              className={cn(
                semanticSpacing.compact,
                semanticRadius.small,
                semanticTypography.caption,
                'block bg-muted'
              )}
            >
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
        <CardTitle className={`${semanticTypography.h4}`}>Font Weights</CardTitle>
        <CardDescription>Nunito font weight variations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`${semanticSpacing.stack.lg}`}>
          {fontWeights.map((weight) => (
            <div key={weight.name} className={`${semanticSpacing.stack.xs}`}>
              <div className="flex items-center justify-between">
                <h4 className={cn(semanticTypography.h4, semanticTypography.body)}>
                  {weight.name} ({weight.weight})
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(weight.className, `${weight.name} Weight`)}
                  className="h-8"
                >
                  <Copy className="size-3" />
                </Button>
              </div>
              <div
                className={cn(
                  semanticRadius.large,
                  semanticSpacing.cardContainer,
                  'border bg-background'
                )}
              >
                <p className={cn(semanticTypography.h4, weight.className)}>
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
        <CardTitle
          className={cn(semanticTypography.h4, semanticSpacing.inline.xs, 'flex items-center')}
        >
          <Eye className="size-5" />
          <span>Text Colors & Accessibility</span>
        </CardTitle>
        <CardDescription>AAA compliant text color hierarchy</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`${semanticSpacing.stack.lg}`}>
          {textColors.map((color) => (
            <div key={color.name} className={`${semanticSpacing.stack.xs}`}>
              <div className="flex items-center justify-between">
                <h4 className={cn(semanticTypography.h4, semanticTypography.body)}>{color.name}</h4>
                <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
                  <Badge variant="outline" className={`${semanticTypography.caption}`}>
                    {color.description}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(color.className, `${color.name} Color`)}
                    className="h-8"
                  >
                    <Copy className="size-3" />
                  </Button>
                </div>
              </div>
              <div
                className={cn(
                  semanticRadius.large,
                  semanticSpacing.cardContainer,
                  'border bg-background'
                )}
              >
                <p className={`text-body ${color.className}`}>
                  The quick brown fox jumps over the lazy dog. This text demonstrates the{' '}
                  {color.name.toLowerCase()} color with proper contrast ratios for accessibility
                  compliance.
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
        <CardTitle className={`${semanticTypography.h4}`}>Typography in Context</CardTitle>
        <CardDescription>See how typography works in real CRM components</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`${semanticSpacing.stack.lg}`}>
          {/* Page Header Example */}
          <div
            className={cn(
              semanticRadius.large,
              semanticSpacing.cardContainer,
              semanticSpacing.stack.md,
              'border bg-background'
            )}
          >
            <h2 className="text-display text-primary">Organization Dashboard</h2>
            <p className="text-subtitle text-muted">
              Manage your customer relationships and track business opportunities
            </p>

            <Separator />

            <div className={`${semanticSpacing.stack.md}`}>
              <h3 className="text-title text-primary">Recent Activities</h3>
              <div className={`${semanticSpacing.stack.sm}`}>
                <div className="flex items-center justify-between">
                  <div className={`${semanticSpacing.stack.xs}`}>
                    <p className="text-body">Called Premier Restaurant Group</p>
                    <p className="text-caption text-muted">Discussed Q2 product catalog updates</p>
                  </div>
                  <div className="text-right">
                    <p className="text-small text-disabled">2 hours ago</p>
                    <Badge priority="a">A Priority</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className={`${semanticSpacing.stack.xs}`}>
                    <p className="text-body">Email sent to Healthy Foods Inc.</p>
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
          <div
            className={cn(
              semanticRadius.large,
              semanticSpacing.cardContainer,
              semanticSpacing.stack.md,
              'border bg-background'
            )}
          >
            <h3 className="text-title text-primary">Create New Organization</h3>
            <div className={cn(semanticSpacing.gap.md, 'grid grid-cols-1 md:grid-cols-2')}>
              <div className={`${semanticSpacing.stack.xs}`}>
                <label className="text-label text-muted">ORGANIZATION NAME *</label>
                <div
                  className={cn(
                    semanticRadius.large,
                    semanticSpacing.compactX,
                    'h-12 border flex items-center bg-input'
                  )}
                >
                  <span className="text-body text-muted">Enter organization name</span>
                </div>
                <p className="text-caption text-muted">
                  This will be displayed in all communications
                </p>
              </div>
              <div className={`${semanticSpacing.stack.xs}`}>
                <label className="text-label text-muted">PRIORITY RATING</label>
                <div
                  className={cn(
                    semanticRadius.large,
                    semanticSpacing.compactX,
                    'h-12 border flex items-center bg-input'
                  )}
                >
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
    <div className={`${semanticSpacing.stack.xl}`}>
      <Tabs defaultValue="scale" className={`${semanticSpacing.stack.lg}`}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scale">Type Scale</TabsTrigger>
          <TabsTrigger value="weights">Font Weights</TabsTrigger>
          <TabsTrigger value="colors">Text Colors</TabsTrigger>
          <TabsTrigger value="context">In Context</TabsTrigger>
        </TabsList>

        <TabsContent value="scale" className={`${semanticSpacing.stack.lg}`}>
          <Card>
            <CardHeader>
              <CardTitle
                className={cn(
                  semanticTypography.h4,
                  semanticSpacing.inline.xs,
                  'flex items-center'
                )}
              >
                <Type className="size-5" />
                <span>Typography Scale</span>
              </CardTitle>
              <CardDescription>
                Professional hierarchy optimized for business software
              </CardDescription>
            </CardHeader>
          </Card>

          <div className={cn(semanticSpacing.gap.lg, 'grid grid-cols-1')}>
            {typographyScale.map((example) => (
              <TypographyExample key={example.name} example={example} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="weights" className={`${semanticSpacing.stack.lg}`}>
          <FontWeightDemo />
        </TabsContent>

        <TabsContent value="colors" className={`${semanticSpacing.stack.lg}`}>
          <TextColorDemo />
        </TabsContent>

        <TabsContent value="context" className={`${semanticSpacing.stack.lg}`}>
          <TypographyInContext />
        </TabsContent>
      </Tabs>

      {/* Font Information */}
      <Card>
        <CardHeader>
          <CardTitle className={`${semanticTypography.h4}`}>Font Family</CardTitle>
          <CardDescription>
            Nunito - Professional sans-serif for business applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={cn(semanticSpacing.gap.lg, 'grid grid-cols-1 md:grid-cols-2')}>
            <div>
              <h4 className={cn(semanticTypography.h4, semanticSpacing.bottomGap.xs)}>
                Why Nunito?
              </h4>
              <ul className={cn(semanticSpacing.stack.xs, semanticTypography.body)}>
                <li>• Optimized for digital interfaces</li>
                <li>• Excellent readability at all sizes</li>
                <li>• Professional yet approachable</li>
                <li>• Strong web font performance</li>
              </ul>
            </div>
            <div>
              <h4 className={cn(semanticTypography.h4, semanticSpacing.bottomGap.xs)}>
                Implementation
              </h4>
              <code
                className={cn(
                  semanticSpacing.compact,
                  semanticRadius.small,
                  semanticTypography.caption,
                  'block bg-muted'
                )}
              >
                font-family: 'Nunito', system-ui, -apple-system, sans-serif;
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  copyToClipboard(
                    "font-family: 'Nunito', system-ui, -apple-system, sans-serif;",
                    'Font Family'
                  )
                }
                className={cn(semanticSpacing.topGap.xs, 'h-8')}
              >
                <Copy className={cn(semanticSpacing.rightGap.xs, 'h-3 w-3')} />
                Copy Font Stack
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
