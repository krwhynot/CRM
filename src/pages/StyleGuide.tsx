import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Monitor,
  Tablet,
  Smartphone,
  Moon,
  Sun,
  Palette,
  Type,
  Layout,
  Layers,
  Accessibility,
  Zap,
} from 'lucide-react'
import {
  spacing,
  semanticSpacing,
  semanticTypography,
  semanticColors,
  fontWeight,
  semanticRadius,
} from '@/styles/tokens'

import { ColorPalette } from '@/components/style-guide/ColorPalette'
import { TypographyShowcase } from '@/components/style-guide/TypographyShowcase'
import { ComponentShowcase } from '@/components/style-guide/ComponentShowcase'
import { SpacingDemo } from '@/components/style-guide/SpacingDemo'
import { MotionGallery } from '@/components/style-guide/MotionGallery'
import { AccessibilityDemo } from '@/components/style-guide/AccessibilityDemo'

type ViewportSize = 'desktop' | 'tablet' | 'mobile'

function StyleGuide() {
  const [darkMode, setDarkMode] = useState(false)
  const [viewport, setViewport] = useState<ViewportSize>('desktop')
  const [reducedMotion, setReducedMotion] = useState(false)

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark', !darkMode)
  }

  const toggleReducedMotion = () => {
    setReducedMotion(!reducedMotion)
    document.documentElement.style.setProperty(
      '--motion-reduce',
      reducedMotion ? 'no-preference' : 'reduce'
    )
  }

  const getViewportClass = () => {
    switch (viewport) {
      case 'mobile':
        return 'max-w-sm mx-auto'
      case 'tablet':
        return 'max-w-2xl mx-auto'
      default:
        return 'max-w-full'
    }
  }

  const tabs = [
    {
      id: 'colors',
      label: 'Colors',
      icon: Palette,
      component: ColorPalette,
      description: 'Brand colors, semantic colors, and CRM-specific palettes',
    },
    {
      id: 'typography',
      label: 'Typography',
      icon: Type,
      component: TypographyShowcase,
      description: 'Font hierarchy, weights, and text styling',
    },
    {
      id: 'components',
      label: 'Components',
      icon: Layers,
      component: ComponentShowcase,
      description: 'Interactive UI components and variants',
    },
    {
      id: 'layout',
      label: 'Layout',
      icon: Layout,
      component: SpacingDemo,
      description: 'Spacing, grids, and layout patterns',
    },
    {
      id: 'motion',
      label: 'Motion',
      icon: Zap,
      component: MotionGallery,
      description: 'Animation timing and interactive effects',
    },
    {
      id: 'accessibility',
      label: 'Accessibility',
      icon: Accessibility,
      component: AccessibilityDemo,
      description: 'Focus states, contrast, and inclusive design',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className={`container mx-auto ${semanticSpacing.cardContainer}`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-display text-primary ${fontWeight.bold}`}>
                Master Food Brokers Design System
              </h1>
              <p className={`${semanticTypography.body} text-muted ${semanticSpacing.topGap.xs}`}>
                Interactive style guide and component library
              </p>
            </div>

            {/* Controls */}
            <div className={`flex items-center ${semanticSpacing.inline.lg}`}>
              {/* Viewport Toggle */}
              <div className={`flex items-center ${semanticSpacing.inline.sm}`}>
                <Label className={semanticTypography.label}>Viewport:</Label>
                <div
                  className={`flex border ${semanticRadius.lg} ${semanticSpacing.layoutPadding.xs}`}
                >
                  {[
                    { size: 'desktop', icon: Monitor },
                    { size: 'tablet', icon: Tablet },
                    { size: 'mobile', icon: Smartphone },
                  ].map(({ size, icon: Icon }) => (
                    <Button
                      key={size}
                      variant={viewport === size ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewport(size as ViewportSize)}
                      className={semanticSpacing.compactX}
                    >
                      <Icon className="size-4" />
                    </Button>
                  ))}
                </div>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Theme Toggle */}
              <div className={`flex items-center ${semanticSpacing.inline.sm}`}>
                <Label htmlFor="dark-mode" className={semanticTypography.label}>
                  Dark Mode
                </Label>
                <Switch id="dark-mode" checked={darkMode} onCheckedChange={toggleDarkMode} />
                {darkMode ? <Moon className="size-4" /> : <Sun className="size-4" />}
              </div>

              {/* Motion Toggle */}
              <div className={`flex items-center ${semanticSpacing.inline.sm}`}>
                <Label htmlFor="reduced-motion" className={semanticTypography.label}>
                  Reduce Motion
                </Label>
                <Switch
                  id="reduced-motion"
                  checked={reducedMotion}
                  onCheckedChange={toggleReducedMotion}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className={`container mx-auto ${semanticSpacing.pageContainer} ${getViewportClass()}`}>
        <Tabs defaultValue="colors" className={semanticSpacing.stack.xl}>
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-6 h-auto ${semanticSpacing.layoutPadding.xs}">
            {tabs.map(({ id, label, icon: Icon }) => (
              <TabsTrigger
                key={id}
                value={id}
                className={`flex flex-col items-center ${semanticSpacing.stack.xs} ${semanticSpacing.cardY} ${semanticSpacing.compactX} data-[state=active]:bg-primary data-[state=active]:text-primary-foreground`}
              >
                <Icon className="size-5" />
                <span className={`${semanticTypography.caption} ${fontWeight.medium}`}>
                  {label}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Content */}
          {tabs.map(({ id, component: Component, description }) => (
            <TabsContent key={id} value={id} className={semanticSpacing.stack.lg}>
              <Card>
                <CardHeader>
                  <div className={`flex items-center ${semanticSpacing.inline.sm}`}>
                    {(() => {
                      const IconComponent = tabs.find((tab) => tab.id === id)?.icon
                      return IconComponent ? (
                        <IconComponent className="size-6 text-primary" />
                      ) : null
                    })()}
                    <div>
                      <CardTitle className={`${semanticTypography.h3} capitalize`}>{id}</CardTitle>
                      <CardDescription className={semanticTypography.caption}>
                        {description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Component />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      {/* Footer */}
      <footer className="mt-16 border-t bg-card">
        <div className={`container mx-auto ${semanticSpacing.pageContainer}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${semanticTypography.body} ${fontWeight.medium}`}>
                Master Food Brokers CRM Design System
              </p>
              <p className={`${semanticTypography.caption} text-muted`}>
                Version 1.0 • Built with React, TypeScript, and Tailwind CSS
              </p>
            </div>
            <div className={`flex items-center ${semanticSpacing.inline.sm}`}>
              <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                Production Ready
              </Badge>
              <Badge variant="outline" className="border-success/20 bg-success/10 text-success">
                WCAG AAA
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default StyleGuide
