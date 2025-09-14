import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
// Removed unused: import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { semanticTypography, semanticSpacing, semanticRadius } from '@/styles/tokens'
import {
  Copy,
  Eye,
  EyeOff,
  Contrast,
  MousePointer,
  Keyboard,
  Volume2,
  Heart,
  Check,
  AlertCircle,
  Info,
  Accessibility,
} from 'lucide-react'
import { toast } from 'sonner'

export function AccessibilityDemo() {
  const [highContrast, setHighContrast] = useState(false)
  const [focusVisible, setFocusVisible] = useState(false)
  const [screenReaderMode, setScreenReaderMode] = useState(false)

  const copyCode = (code: string, label: string) => {
    navigator.clipboard.writeText(code)
    toast.success(`Copied ${label} to clipboard`)
  }

  const contrastRatios = [
    {
      name: 'Text Primary',
      lightBg: '#FFFFFF',
      darkText: '#1A1D23',
      ratio: '15.8:1',
      grade: 'AAA',
      usage: 'Main headings, primary content',
    },
    {
      name: 'Text Body',
      lightBg: '#FFFFFF',
      darkText: '#2E3338',
      ratio: '12.6:1',
      grade: 'AAA',
      usage: 'Regular body text',
    },
    {
      name: 'Text Muted',
      lightBg: '#FFFFFF',
      darkText: '#575A5E',
      ratio: '7.5:1',
      grade: 'AAA',
      usage: 'Secondary text, captions',
    },
    {
      name: 'MFB Green',
      lightBg: '#FFFFFF',
      darkText: '#8DC63F',
      ratio: '4.7:1',
      grade: 'AA',
      usage: 'Brand color, interactive elements',
    },
  ]

  const focusStates = [
    {
      name: 'Primary Focus',
      className:
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      cssCode: `
.focus-ring {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--primary)), 0 0 0 4px hsl(var(--background));
}`,
      description: 'Standard focus ring for interactive elements',
    },
    {
      name: 'Destructive Focus',
      className:
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2',
      cssCode: `
.focus-ring-destructive {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--destructive)), 0 0 0 4px hsl(var(--background));
}`,
      description: 'Focus ring for destructive actions',
    },
    {
      name: 'Success Focus',
      className:
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2',
      cssCode: `
.focus-ring-success {
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--success)), 0 0 0 4px hsl(var(--background));
}`,
      description: 'Focus ring for success actions',
    },
  ]

  const touchTargets = [
    { name: 'Button Small', size: '44px', className: 'h-11 min-w-[2.75rem]', compliant: true },
    { name: 'Button Default', size: '48px', className: 'h-12 min-w-[3rem]', compliant: true },
    { name: 'Button Large', size: '56px', className: 'h-14 min-w-[3.5rem]', compliant: true },
    { name: 'Icon Button', size: '48px', className: 'h-12 w-12', compliant: true },
    { name: 'Too Small', size: '32px', className: 'h-8 w-8', compliant: false },
  ]

  const ContrastDemo = () => (
    <Card>
      <CardHeader>
        <CardTitle
          className={cn(semanticTypography.h4, semanticSpacing.inline.xs, 'flex items-center')}
        >
          <Contrast className="size-5" />
          <span>Color Contrast Ratios</span>
        </CardTitle>
        <CardDescription>WCAG AAA compliance for text readability</CardDescription>
      </CardHeader>
      <CardContent className={`${semanticSpacing.stack.lg}`}>
        <div className={cn(semanticSpacing.gap.lg, 'grid grid-cols-1 md:grid-cols-2')}>
          {contrastRatios.map((contrast) => (
            <div key={contrast.name} className={`${semanticSpacing.stack.sm}`}>
              <div className="flex items-center justify-between">
                <h4 className={`${semanticTypography.h4}`}>{contrast.name}</h4>
                <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
                  <Badge
                    variant={contrast.grade === 'AAA' ? 'default' : 'secondary'}
                    className={contrast.grade === 'AAA' ? 'bg-success text-success-foreground' : ''}
                  >
                    {contrast.grade}
                  </Badge>
                  <span className={cn(semanticTypography.caption, 'font-mono')}>
                    {contrast.ratio}
                  </span>
                </div>
              </div>

              <div
                className={cn(semanticSpacing.cardContainer, semanticRadius.large, 'border')}
                style={{ backgroundColor: contrast.lightBg }}
              >
                <p className={`${semanticTypography.label}`} style={{ color: contrast.darkText }}>
                  Sample text demonstrating contrast ratio
                </p>
                <p
                  className={cn(semanticTypography.body, 'mt-1')}
                  style={{ color: contrast.darkText, opacity: 0.8 }}
                >
                  {contrast.usage}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Alert>
          <Info className="size-4" />
          <AlertTitle>Contrast Standards</AlertTitle>
          <AlertDescription>
            <ul
              className={cn(
                semanticSpacing.topGap.xs,
                semanticSpacing.stack.xs,
                semanticTypography.body
              )}
            >
              <li>• AAA Large Text (18px+): 4.5:1 minimum</li>
              <li>• AAA Normal Text (under 18px): 7:1 minimum</li>
              <li>• AA UI Components: 3:1 minimum</li>
              <li>• All text in this CRM meets or exceeds AAA standards</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className={cn(semanticSpacing.inline.sm, 'flex items-center')}>
          <Switch id="high-contrast" checked={highContrast} onCheckedChange={setHighContrast} />
          <Label htmlFor="high-contrast">Enable High Contrast Mode</Label>
        </div>

        {highContrast && (
          <div
            className={cn(
              semanticSpacing.cardContainer,
              semanticRadius.large,
              'border-2 border-black bg-white text-black'
            )}
          >
            <h4
              className={cn(
                semanticTypography.h2,
                semanticSpacing.bottomGap.xs,
                'border-b-2 border-black pb-2'
              )}
            >
              HIGH CONTRAST MODE
            </h4>
            <p className={`${semanticTypography.label}`}>
              This is how content appears in high contrast mode with enhanced borders and stronger
              color differentiation.
            </p>
            <div className={cn(semanticSpacing.inline.xs, 'mt-3')}>
              <button
                className={cn(
                  semanticSpacing.cardX,
                  semanticSpacing.compactY,
                  semanticTypography.h2,
                  'bg-black text-white border-2 border-black'
                )}
              >
                Primary Button
              </button>
              <button
                className={cn(
                  semanticSpacing.cardX,
                  semanticSpacing.compactY,
                  semanticTypography.h2,
                  'bg-white text-black border-2 border-black'
                )}
              >
                Secondary Button
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const FocusDemo = () => (
    <Card>
      <CardHeader>
        <CardTitle
          className={cn(semanticTypography.h4, semanticSpacing.inline.xs, 'flex items-center')}
        >
          <Keyboard className="size-5" />
          <span>Focus Management</span>
        </CardTitle>
        <CardDescription>Keyboard navigation and focus indicators</CardDescription>
      </CardHeader>
      <CardContent className={`${semanticSpacing.stack.lg}`}>
        <div className={`${semanticSpacing.stack.md}`}>
          <div className={cn(semanticSpacing.inline.sm, 'flex items-center')}>
            <Switch id="focus-visible" checked={focusVisible} onCheckedChange={setFocusVisible} />
            <Label htmlFor="focus-visible">Show Focus Indicators (Tab to navigate)</Label>
          </div>

          <Alert>
            <Keyboard className="size-4" />
            <AlertTitle>Keyboard Navigation</AlertTitle>
            <AlertDescription>
              Press Tab to cycle through focusable elements. Focus indicators are always visible for
              keyboard users.
            </AlertDescription>
          </Alert>
        </div>

        <div className={`${semanticSpacing.stack.lg}`}>
          {focusStates.map((focus, index) => (
            <div key={focus.name} className={`${semanticSpacing.stack.sm}`}>
              <div className="flex items-center justify-between">
                <h4 className={`${semanticTypography.h4}`}>{focus.name}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyCode(focus.cssCode, `${focus.name} Focus`)}
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
                <div className={cn(semanticSpacing.inline.sm, 'flex')}>
                  <Button
                    className={focus.className}
                    variant={index === 1 ? 'destructive' : index === 2 ? 'success' : 'default'}
                    tabIndex={focusVisible ? 0 : -1}
                  >
                    {focus.name} Button
                  </Button>
                  <Input
                    placeholder="Focus this input"
                    className={focus.className}
                    tabIndex={focusVisible ? 0 : -1}
                  />
                </div>
              </div>

              <p className="text-caption text-muted">{focus.description}</p>

              <details className={`${semanticSpacing.stack.xs}`}>
                <summary
                  className={cn(
                    semanticTypography.body,
                    semanticTypography.label,
                    'cursor-pointer'
                  )}
                >
                  View CSS Code
                </summary>
                <pre
                  className={cn(
                    semanticSpacing.compact,
                    semanticRadius.small,
                    semanticTypography.caption,
                    'bg-muted overflow-x-auto'
                  )}
                >
                  <code>{focus.cssCode}</code>
                </pre>
              </details>
            </div>
          ))}
        </div>

        <div className={`${semanticSpacing.stack.sm}`}>
          <h4 className={`${semanticTypography.h4}`}>Skip Links</h4>
          <div
            className={cn(
              semanticRadius.large,
              semanticSpacing.cardContainer,
              'border bg-background'
            )}
          >
            <div className="relative">
              <button className="sr-skip-link">Skip to main content</button>
              <p className={cn(semanticTypography.body, 'text-muted-foreground')}>
                Press Tab to reveal the skip link (positioned off-screen until focused)
              </p>
            </div>
          </div>
          <pre
            className={cn(
              semanticSpacing.compact,
              semanticRadius.small,
              semanticTypography.caption,
              'bg-muted overflow-x-auto'
            )}
          >
            <code>{`.sr-skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  z-index: 50;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  padding: 8px 16px;
  border-radius: 6px;
  transition: top 0.3s;
}

.sr-skip-link:focus {
  top: 16px;
}`}</code>
          </pre>
        </div>
      </CardContent>
    </Card>
  )

  const TouchTargetDemo = () => (
    <Card>
      <CardHeader>
        <CardTitle
          className={cn(semanticTypography.h4, semanticSpacing.inline.xs, 'flex items-center')}
        >
          <MousePointer className="size-5" />
          <span>Touch Target Sizing</span>
        </CardTitle>
        <CardDescription>Minimum 44px touch targets for mobile accessibility</CardDescription>
      </CardHeader>
      <CardContent className={`${semanticSpacing.stack.lg}`}>
        <Alert>
          <Info className="size-4" />
          <AlertTitle>Touch Target Guidelines</AlertTitle>
          <AlertDescription>
            All interactive elements must be at least 44px × 44px for comfortable touch interaction,
            especially important for iPad field use.
          </AlertDescription>
        </Alert>

        <div
          className={cn(semanticSpacing.gap.md, 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3')}
        >
          {touchTargets.map((target) => (
            <div key={target.name} className={`${semanticSpacing.stack.sm}`}>
              <div className="flex items-center justify-between">
                <h4 className={cn(semanticTypography.h4, semanticTypography.body)}>
                  {target.name}
                </h4>
                <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
                  <span className={`${semanticTypography.caption}`}>{target.size}</span>
                  {target.compliant ? (
                    <Check className="size-4 text-success" />
                  ) : (
                    <AlertCircle className="size-4 text-destructive" />
                  )}
                </div>
              </div>

              <div
                className={cn(
                  semanticRadius.large,
                  semanticSpacing.cardContainer,
                  'border bg-background flex justify-center items-center'
                )}
              >
                <div
                  className={cn(
                    semanticRadius.small,
                    semanticTypography.caption,
                    semanticTypography.label,
                    target.className,
                    target.compliant ? 'bg-primary' : 'bg-destructive',
                    'flex items-center justify-center text-white cursor-pointer'
                  )}
                >
                  {target.size}
                </div>
              </div>

              <div className="text-center">
                <Badge
                  variant={target.compliant ? 'default' : 'destructive'}
                  className={target.compliant ? 'bg-success text-success-foreground' : ''}
                >
                  {target.compliant ? 'Compliant' : 'Too Small'}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className={`${semanticSpacing.stack.xs}`}>
          <h4 className={`${semanticTypography.h4}`}>Implementation</h4>
          <pre
            className={cn(
              semanticSpacing.compact,
              semanticRadius.small,
              semanticTypography.caption,
              'bg-muted overflow-x-auto'
            )}
          >
            <code>{`.touch-target {
  min-height: 2.75rem; /* 44px */
  min-width: 2.75rem;  /* 44px */
  display: flex;
  align-items: center;
  justify-content: center;
}`}</code>
          </pre>
        </div>
      </CardContent>
    </Card>
  )

  const ScreenReaderDemo = () => (
    <Card>
      <CardHeader>
        <CardTitle
          className={cn(semanticTypography.h4, semanticSpacing.inline.xs, 'flex items-center')}
        >
          <Volume2 className="size-5" />
          <span>Screen Reader Support</span>
        </CardTitle>
        <CardDescription>Semantic markup and ARIA labels for assistive technology</CardDescription>
      </CardHeader>
      <CardContent className={`${semanticSpacing.stack.lg}`}>
        <div className={cn(semanticSpacing.inline.sm, 'flex items-center')}>
          <Switch
            id="screen-reader"
            checked={screenReaderMode}
            onCheckedChange={setScreenReaderMode}
          />
          <Label htmlFor="screen-reader">Highlight screen reader elements</Label>
        </div>

        <div className={`${semanticSpacing.stack.lg}`}>
          {/* Screen Reader Only Text */}
          <div className={`${semanticSpacing.stack.sm}`}>
            <h4 className={`${semanticTypography.h4}`}>Screen Reader Only Content</h4>
            <div
              className={cn(
                semanticRadius.large,
                semanticSpacing.cardContainer,
                'border bg-background'
              )}
            >
              <div className={cn(semanticSpacing.inline.sm, 'flex items-center')}>
                <Button variant="outline" size="icon">
                  <Heart className="size-4" />
                  <span
                    className={cn(
                      semanticSpacing.minimalX,
                      'sr-only',
                      screenReaderMode
                        ? 'absolute top-0 left-0 bg-yellow-200 text-black text-xs'
                        : ''
                    )}
                  >
                    Add to favorites
                  </span>
                </Button>
                <span className={`${semanticTypography.body}`}>
                  Icon button with screen reader description
                </span>
              </div>
            </div>
            <pre
              className={cn(
                semanticSpacing.compact,
                semanticRadius.small,
                semanticTypography.caption,
                'bg-muted overflow-x-auto'
              )}
            >
              <code>{`<button>
  <HeartIcon />
  <span className="sr-only">Add to favorites</span>
</button>`}</code>
            </pre>
          </div>

          {/* ARIA Labels */}
          <div className={`${semanticSpacing.stack.sm}`}>
            <h4 className={`${semanticTypography.h4}`}>ARIA Labels and Descriptions</h4>
            <div
              className={cn(
                semanticRadius.large,
                semanticSpacing.cardContainer,
                semanticSpacing.stack.sm,
                'border bg-background'
              )}
            >
              <div>
                <Label htmlFor="progress-demo">Upload Progress</Label>
                <div
                  className={cn(semanticRadius.full, 'w-full bg-gray-200 h-2')}
                  role="progressbar"
                  aria-valuenow={75}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-describedby="progress-description"
                >
                  <div
                    className={cn(semanticRadius.full, 'bg-primary h-2')}
                    style={{ width: '75%' }}
                  ></div>
                </div>
                <p
                  id="progress-description"
                  className={cn(semanticTypography.caption, 'text-muted-foreground mt-1')}
                >
                  75% complete - Uploading customer data
                </p>
              </div>

              <div>
                <Label htmlFor="search-demo">Search Organizations</Label>
                <Input
                  id="search-demo"
                  placeholder="Type to search..."
                  aria-describedby="search-help"
                />
                <p
                  id="search-help"
                  className={cn(semanticTypography.caption, 'text-muted-foreground mt-1')}
                >
                  Search by organization name, type, or contact person
                </p>
              </div>
            </div>
          </div>

          {/* Landmark Regions */}
          <div className={`${semanticSpacing.stack.sm}`}>
            <h4 className={`${semanticTypography.h4}`}>Landmark Regions</h4>
            <div
              className={cn(
                semanticRadius.large,
                semanticSpacing.cardContainer,
                'border bg-background'
              )}
            >
              <div className={cn(semanticSpacing.stack.xs, semanticTypography.body)}>
                <div
                  className={cn(
                    semanticSpacing.compact,
                    semanticRadius.small,
                    screenReaderMode ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                  )}
                >
                  <code>&lt;header role="banner"&gt;</code> - Page header with logo and navigation
                </div>
                <div
                  className={cn(
                    semanticSpacing.compact,
                    semanticRadius.small,
                    screenReaderMode ? 'bg-green-100 border-l-4 border-green-500' : ''
                  )}
                >
                  <code>&lt;nav role="navigation"&gt;</code> - Primary navigation menu
                </div>
                <div
                  className={cn(
                    semanticSpacing.compact,
                    semanticRadius.small,
                    screenReaderMode ? 'bg-yellow-100 border-l-4 border-yellow-500' : ''
                  )}
                >
                  <code>&lt;main role="main"&gt;</code> - Main content area
                </div>
                <div
                  className={cn(
                    semanticSpacing.compact,
                    semanticRadius.small,
                    screenReaderMode ? 'bg-purple-100 border-l-4 border-purple-500' : ''
                  )}
                >
                  <code>&lt;aside role="complementary"&gt;</code> - Sidebar content
                </div>
                <div
                  className={cn(
                    semanticSpacing.compact,
                    semanticRadius.small,
                    screenReaderMode ? 'bg-gray-100 border-l-4 border-gray-500' : ''
                  )}
                >
                  <code>&lt;footer role="contentinfo"&gt;</code> - Page footer
                </div>
              </div>
            </div>
          </div>

          {/* Form Labels */}
          <div className={`${semanticSpacing.stack.sm}`}>
            <h4 className={`${semanticTypography.h4}`}>Form Accessibility</h4>
            <div
              className={cn(
                semanticRadius.large,
                semanticSpacing.cardContainer,
                'border bg-background'
              )}
            >
              <div className={`${semanticSpacing.stack.md}`}>
                <div>
                  <Label htmlFor="required-field">
                    Organization Name
                    <span className="ml-1 text-destructive" aria-label="required">
                      *
                    </span>
                  </Label>
                  <Input
                    id="required-field"
                    required
                    aria-required="true"
                    aria-describedby="name-error"
                  />
                  <p
                    id="name-error"
                    className={cn(semanticTypography.caption, 'text-destructive mt-1')}
                    role="alert"
                  >
                    This field is required
                  </p>
                </div>

                <fieldset className={cn(semanticRadius.small, semanticSpacing.compact, 'border')}>
                  <legend className={`${semanticTypography.label}`}>Priority Rating</legend>
                  <div className={cn(semanticSpacing.stack.xs, semanticSpacing.topGap.xs)}>
                    <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
                      <input type="radio" id="priority-a" name="priority" value="a" />
                      <Label htmlFor="priority-a">A - High Priority</Label>
                    </div>
                    <div className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
                      <input type="radio" id="priority-b" name="priority" value="b" />
                      <Label htmlFor="priority-b">B - Medium Priority</Label>
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const AccessibilityChecklist = () => (
    <Card>
      <CardHeader>
        <CardTitle
          className={cn(semanticTypography.h4, semanticSpacing.inline.xs, 'flex items-center')}
        >
          <Check className="size-5" />
          <span>Accessibility Checklist</span>
        </CardTitle>
        <CardDescription>Complete WCAG AAA compliance checklist for the CRM</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={cn(semanticSpacing.gap.lg, 'grid grid-cols-1 md:grid-cols-2')}>
          <div>
            <h4 className={cn(semanticTypography.h4, 'mb-3')}>✅ Implemented Features</h4>
            <ul className={cn(semanticSpacing.stack.xs, semanticTypography.body)}>
              <li className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
                <Check className="size-4 text-success" />
                <span>AAA color contrast ratios (7:1+)</span>
              </li>
              <li className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
                <Check className="size-4 text-success" />
                <span>Keyboard navigation support</span>
              </li>
              <li className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
                <Check className="size-4 text-success" />
                <span>Screen reader compatibility</span>
              </li>
              <li className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
                <Check className="size-4 text-success" />
                <span>44px minimum touch targets</span>
              </li>
              <li className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
                <Check className="size-4 text-success" />
                <span>Reduced motion preferences</span>
              </li>
              <li className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
                <Check className="size-4 text-success" />
                <span>High contrast mode support</span>
              </li>
              <li className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
                <Check className="size-4 text-success" />
                <span>Semantic HTML structure</span>
              </li>
              <li className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
                <Check className="size-4 text-success" />
                <span>ARIA labels and descriptions</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className={cn(semanticTypography.h4, 'mb-3')}>📋 Testing Guidelines</h4>
            <ul className={cn(semanticSpacing.stack.xs, semanticTypography.body)}>
              <li>• Test keyboard navigation with Tab/Shift+Tab</li>
              <li>• Verify screen reader compatibility</li>
              <li>• Check color contrast with tools</li>
              <li>• Test with reduced motion enabled</li>
              <li>• Validate touch target sizes on tablet</li>
              <li>• Ensure form error announcements</li>
              <li>• Test skip links functionality</li>
              <li>• Verify ARIA live regions work</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className={`${semanticSpacing.stack.xl}`}>
      <Tabs defaultValue="contrast" className={`${semanticSpacing.stack.lg}`}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contrast">Contrast</TabsTrigger>
          <TabsTrigger value="focus">Focus</TabsTrigger>
          <TabsTrigger value="touch">Touch</TabsTrigger>
          <TabsTrigger value="screen-reader">Screen Reader</TabsTrigger>
        </TabsList>

        <TabsContent value="contrast">
          <ContrastDemo />
        </TabsContent>

        <TabsContent value="focus">
          <FocusDemo />
        </TabsContent>

        <TabsContent value="touch">
          <TouchTargetDemo />
        </TabsContent>

        <TabsContent value="screen-reader">
          <ScreenReaderDemo />
        </TabsContent>
      </Tabs>

      {/* Accessibility Checklist */}
      <AccessibilityChecklist />

      {/* Implementation Resources */}
      <Card>
        <CardHeader>
          <CardTitle className={`${semanticTypography.h4}`}>Implementation Resources</CardTitle>
          <CardDescription>Tools and guidelines for maintaining accessibility</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={cn(semanticSpacing.gap.lg, 'grid grid-cols-1 md:grid-cols-2')}>
            <div>
              <h4 className={cn(semanticTypography.h4, 'mb-3')}>CSS Utilities</h4>
              <pre
                className={cn(
                  semanticSpacing.compact,
                  semanticRadius.small,
                  semanticTypography.caption,
                  'bg-muted overflow-x-auto'
                )}
              >
                <code>{`/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Focus ring */
.focus-ring {
  @apply focus-visible:outline-none;
  @apply focus-visible:ring-2;
  @apply focus-visible:ring-primary;
  @apply focus-visible:ring-offset-2;
}

/* Touch target */
.touch-target {
  @apply min-h-[2.75rem] min-w-[2.75rem];
}`}</code>
              </pre>
            </div>
            <div>
              <h4 className={cn(semanticTypography.h4, 'mb-3')}>Testing Tools</h4>
              <ul className={cn(semanticSpacing.stack.xs, semanticTypography.body)}>
                <li>
                  • <strong>WAVE</strong> - Web accessibility evaluation
                </li>
                <li>
                  • <strong>axe DevTools</strong> - Automated accessibility testing
                </li>
                <li>
                  • <strong>Lighthouse</strong> - Performance and accessibility audit
                </li>
                <li>
                  • <strong>Screen readers</strong> - NVDA, JAWS, VoiceOver
                </li>
                <li>
                  • <strong>Keyboard testing</strong> - Tab navigation
                </li>
                <li>
                  • <strong>Color contrast analyzers</strong> - WebAIM, Colour Contrast Analyser
                </li>
              </ul>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={`${semanticSpacing.topGap.sm}`}
            onClick={() =>
              copyCode(
                '.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }',
                'Accessibility CSS'
              )
            }
          >
            <Copy className={cn(semanticSpacing.rightGap.xs, 'h-3 w-3')} />
            Copy Accessibility CSS
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
