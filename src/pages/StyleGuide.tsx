import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Monitor, Tablet, Smartphone, Moon, Sun, Palette, Type, Layout, Layers, Accessibility, Zap } from 'lucide-react'

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
      case 'mobile': return 'max-w-sm mx-auto'
      case 'tablet': return 'max-w-2xl mx-auto'
      default: return 'max-w-full'
    }
  }

  const tabs = [
    {
      id: 'colors',
      label: 'Colors',
      icon: Palette,
      component: ColorPalette,
      description: 'Brand colors, semantic colors, and CRM-specific palettes'
    },
    {
      id: 'typography',
      label: 'Typography',
      icon: Type,
      component: TypographyShowcase,
      description: 'Font hierarchy, weights, and text styling'
    },
    {
      id: 'components',
      label: 'Components',
      icon: Layers,
      component: ComponentShowcase,
      description: 'Interactive UI components and variants'
    },
    {
      id: 'layout',
      label: 'Layout',
      icon: Layout,
      component: SpacingDemo,
      description: 'Spacing, grids, and layout patterns'
    },
    {
      id: 'motion',
      label: 'Motion',
      icon: Zap,
      component: MotionGallery,
      description: 'Animation timing and interactive effects'
    },
    {
      id: 'accessibility',
      label: 'Accessibility',
      icon: Accessibility,
      component: AccessibilityDemo,
      description: 'Focus states, contrast, and inclusive design'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-display text-primary font-bold">
                Master Food Brokers Design System
              </h1>
              <p className="text-subtitle text-muted mt-2">
                Interactive style guide and component library
              </p>
            </div>
            
            {/* Controls */}
            <div className="flex items-center space-x-6">
              {/* Viewport Toggle */}
              <div className="flex items-center space-x-2">
                <Label className="text-small">Viewport:</Label>
                <div className="flex border rounded-lg p-1">
                  {[
                    { size: 'desktop', icon: Monitor },
                    { size: 'tablet', icon: Tablet },
                    { size: 'mobile', icon: Smartphone }
                  ].map(({ size, icon: Icon }) => (
                    <Button
                      key={size}
                      variant={viewport === size ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewport(size as ViewportSize)}
                      className="px-3"
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Theme Toggle */}
              <div className="flex items-center space-x-2">
                <Label htmlFor="dark-mode" className="text-small">Dark Mode</Label>
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={toggleDarkMode}
                />
                {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </div>

              {/* Motion Toggle */}
              <div className="flex items-center space-x-2">
                <Label htmlFor="reduced-motion" className="text-small">Reduce Motion</Label>
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
      <div className={`container mx-auto px-6 py-8 ${getViewportClass()}`}>
        <Tabs defaultValue="colors" className="space-y-8">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-6 h-auto p-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <TabsTrigger
                key={id}
                value={id}
                className="flex flex-col items-center space-y-2 py-4 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Content */}
          {tabs.map(({ id, component: Component, description }) => (
            <TabsContent key={id} value={id} className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    {(() => {
                      const IconComponent = tabs.find(tab => tab.id === id)?.icon
                      return IconComponent ? <IconComponent className="h-6 w-6 text-primary" /> : null
                    })()}
                    <div>
                      <CardTitle className="text-title capitalize">{id}</CardTitle>
                      <CardDescription className="text-caption">
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
      <footer className="border-t bg-card mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body font-medium">Master Food Brokers CRM Design System</p>
              <p className="text-caption text-muted">
                Version 1.0 • Built with React, TypeScript, and Tailwind CSS
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                Production Ready
              </Badge>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
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