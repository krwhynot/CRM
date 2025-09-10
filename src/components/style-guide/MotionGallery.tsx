import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Play, Square, Zap, Timer, MousePointer, Loader } from 'lucide-react'
import { toast } from 'sonner'

export function MotionGallery() {
  const [isAnimating, setIsAnimating] = useState<{ [key: string]: boolean }>({})
  const [reducedMotion, setReducedMotion] = useState(false)

  const copyCode = (code: string, label: string) => {
    navigator.clipboard.writeText(code)
    toast.success(`Copied ${label} to clipboard`)
  }

  const triggerAnimation = (key: string) => {
    setIsAnimating(prev => ({ ...prev, [key]: true }))
    setTimeout(() => {
      setIsAnimating(prev => ({ ...prev, [key]: false }))
    }, 1000)
  }

  const timingFunctions = [
    {
      name: 'Quick',
      duration: '150ms',
      easing: 'ease-out',
      usage: 'Micro-interactions, hover states',
      className: 'transition-all duration-150 ease-out',
      cssCode: 'transition: all 150ms ease-out;'
    },
    {
      name: 'Standard',
      duration: '250ms',
      easing: 'ease-in-out',
      usage: 'Standard interactions, focus states',
      className: 'transition-all duration-200 ease-in-out',
      cssCode: 'transition: all 250ms ease-in-out;'
    },
    {
      name: 'Slow',
      duration: '400ms',
      easing: 'ease-in-out',
      usage: 'Page transitions, major state changes',
      className: 'transition-all duration-400 ease-in-out',
      cssCode: 'transition: all 400ms ease-in-out;'
    }
  ]

  const interactionAnimations = [
    {
      name: 'Hover Lift',
      description: 'Subtle elevation on hover',
      className: 'hover-lift',
      cssCode: `
.hover-lift {
  transition: all 200ms ease-in-out;
}
.hover-lift:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}`,
      element: 'card'
    },
    {
      name: 'Button Press',
      description: 'Scale down on press',
      className: 'button-press',
      cssCode: `
.button-press {
  transition: all 150ms ease-in-out;
}
.button-press:active {
  transform: scale(0.95);
}`,
      element: 'button'
    },
    {
      name: 'Interactive Scale',
      description: 'Scale and shadow on interaction',
      className: 'interactive-element',
      cssCode: `
.interactive-element {
  transition: all 200ms ease-in-out;
}
.interactive-element:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}
.interactive-element:active {
  transform: scale(0.95);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}`,
      element: 'interactive'
    }
  ]

  const loadingAnimations = [
    {
      name: 'Shimmer',
      description: 'MFB branded loading shimmer',
      className: 'loading-shimmer',
      cssCode: `
.loading-shimmer {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(141, 198, 63, 0.1) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite ease-in-out;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}`,
      element: 'shimmer'
    },
    {
      name: 'Pulse',
      description: 'Success feedback pulse',
      className: 'success-pulse',
      cssCode: `
.success-pulse {
  animation: success-pulse 0.6s ease-out;
}

@keyframes success-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(141, 198, 63, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(141, 198, 63, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(141, 198, 63, 0);
  }
}`,
      element: 'pulse'
    },
    {
      name: 'Spin',
      description: 'Loading spinner',
      className: 'animate-spin',
      cssCode: `
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}`,
      element: 'spinner'
    }
  ]

  const TimingDemo = ({ timing }: { timing: typeof timingFunctions[0] }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold">{timing.name}</h4>
          <p className="text-caption text-muted">{timing.duration} • {timing.easing}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyCode(timing.cssCode, `${timing.name} Timing`)}
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>

      <div className="border rounded-lg p-4 bg-background">
        <div 
          className={`w-16 h-16 bg-primary rounded-lg flex items-center justify-center cursor-pointer ${timing.className} ${
            isAnimating[timing.name] ? 'transform translate-x-32' : ''
          }`}
          onClick={() => triggerAnimation(timing.name)}
        >
          <Play className="h-6 w-6 text-white" />
        </div>
      </div>

      <div>
        <p className="text-caption text-muted mb-2">{timing.usage}</p>
        <code className="block p-2 bg-muted rounded text-xs">
          {timing.cssCode}
        </code>
      </div>
    </div>
  )

  const InteractionDemo = ({ animation }: { animation: typeof interactionAnimations[0] }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold">{animation.name}</h4>
          <p className="text-caption text-muted">{animation.description}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyCode(animation.cssCode, `${animation.name} Animation`)}
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>

      <div className="border rounded-lg p-8 bg-background flex justify-center">
        {animation.element === 'card' && (
          <div className="hover-lift">
            <Card className="w-48 cursor-pointer">
              <CardContent className="p-6">
                <div className="text-center">
                  <h5 className="font-semibold">Hover Me</h5>
                  <p className="text-caption text-muted">Card with lift effect</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {animation.element === 'button' && (
          <Button className="button-press">
            Click Me
          </Button>
        )}

        {animation.element === 'interactive' && (
          <div className="interactive-element bg-primary/10 p-6 rounded-lg cursor-pointer">
            <div className="text-center">
              <MousePointer className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold">Interactive Element</p>
            </div>
          </div>
        )}
      </div>

      <details className="space-y-2">
        <summary className="cursor-pointer text-sm font-medium">View CSS Code</summary>
        <pre className="p-3 bg-muted rounded text-xs overflow-x-auto">
          <code>{animation.cssCode}</code>
        </pre>
      </details>
    </div>
  )

  const LoadingDemo = ({ animation }: { animation: typeof loadingAnimations[0] }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold">{animation.name}</h4>
          <p className="text-caption text-muted">{animation.description}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyCode(animation.cssCode, `${animation.name} Animation`)}
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>

      <div className="border rounded-lg p-8 bg-background flex justify-center">
        {animation.element === 'shimmer' && (
          <div className="w-48 space-y-3">
            <div className="h-4 bg-gray-200 rounded loading-shimmer"></div>
            <div className="h-4 bg-gray-200 rounded loading-shimmer" style={{ animationDelay: '0.1s' }}></div>
            <div className="h-4 bg-gray-200 rounded loading-shimmer" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}

        {animation.element === 'pulse' && (
          <Button
            onClick={() => triggerAnimation('pulse')}
            className={isAnimating.pulse ? 'success-pulse' : ''}
          >
            Trigger Success
          </Button>
        )}

        {animation.element === 'spinner' && (
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span>Loading...</span>
          </div>
        )}
      </div>

      <details className="space-y-2">
        <summary className="cursor-pointer text-sm font-medium">View CSS Code</summary>
        <pre className="p-3 bg-muted rounded text-xs overflow-x-auto">
          <code>{animation.cssCode}</code>
        </pre>
      </details>
    </div>
  )

  const RealWorldExamples = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Real-World CRM Examples</CardTitle>
        <CardDescription>See motion design in actual application components</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Button Group */}
        <div className="space-y-4">
          <h4 className="font-semibold">Interactive Buttons</h4>
          <div className="flex flex-wrap gap-3">
            <Button className="button-press">
              Create Organization
            </Button>
            <Button variant="outline" className="hover-lift">
              Export Data
            </Button>
            <Button variant="destructive" className="button-press">
              Delete Record
            </Button>
            <Button variant="ghost" className="hover:bg-accent transition-colors duration-150">
              Cancel
            </Button>
          </div>
        </div>

        <Separator />

        {/* Card Examples */}
        <div className="space-y-4">
          <h4 className="font-semibold">Interactive Cards</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover-lift cursor-pointer">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold">Total Customers</h5>
                    <Badge priority="a">A</Badge>
                  </div>
                  <div className="text-2xl font-bold text-primary">247</div>
                  <p className="text-caption text-muted">+12% vs last month</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift cursor-pointer">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold">Active Opportunities</h5>
                    <Badge status="active">Active</Badge>
                  </div>
                  <div className="text-2xl font-bold text-primary">89</div>
                  <p className="text-caption text-muted">+5% vs last month</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift cursor-pointer">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold">Revenue Pipeline</h5>
                    <Badge orgType="customer">Customer</Badge>
                  </div>
                  <div className="text-2xl font-bold text-primary">$2.4M</div>
                  <p className="text-caption text-muted">+18% vs last month</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        {/* Loading States */}
        <div className="space-y-4">
          <h4 className="font-semibold">Loading States</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Button disabled>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </Button>
              <span className="text-caption text-muted">Button with loading spinner</span>
            </div>

            <div className="border rounded-lg p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded loading-shimmer"></div>
              <div className="h-4 bg-gray-200 rounded loading-shimmer w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded loading-shimmer w-1/2"></div>
            </div>
            <span className="text-caption text-muted">Content loading shimmer</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const ReducedMotionDemo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Accessibility Considerations</CardTitle>
        <CardDescription>Respecting user motion preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-3">
          <Switch
            id="reduced-motion"
            checked={reducedMotion}
            onCheckedChange={(checked) => {
              setReducedMotion(checked)
              document.documentElement.style.setProperty(
                '--motion-reduce',
                checked ? 'reduce' : 'no-preference'
              )
            }}
          />
          <Label htmlFor="reduced-motion">Simulate reduced motion preference</Label>
        </div>

        {reducedMotion && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Timer className="h-5 w-5 text-warning" />
              <span className="font-medium text-warning">Reduced Motion Active</span>
            </div>
            <p className="text-caption text-muted mt-2">
              All animations are disabled or significantly reduced for accessibility.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <h4 className="font-semibold">CSS Implementation</h4>
          <pre className="p-4 bg-muted rounded text-xs overflow-x-auto">
            <code>{`@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  .btn-primary:hover,
  button:hover {
    transform: none !important;
  }
}`}</code>
          </pre>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyCode('@media (prefers-reduced-motion: reduce) { ... }', 'Reduced Motion CSS')}
          >
            <Copy className="h-3 w-3 mr-2" />
            Copy Reduced Motion CSS
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-8">
      <Tabs defaultValue="timing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timing">Timing</TabsTrigger>
          <TabsTrigger value="interactions">Interactions</TabsTrigger>
          <TabsTrigger value="loading">Loading</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="timing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Timer className="h-5 w-5" />
                <span>Animation Timing</span>
              </CardTitle>
              <CardDescription>
                Professional timing hierarchy for smooth interactions
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {timingFunctions.map((timing) => (
              <Card key={timing.name}>
                <CardContent className="p-6">
                  <TimingDemo timing={timing} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="interactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <MousePointer className="h-5 w-5" />
                <span>Interaction Animations</span>
              </CardTitle>
              <CardDescription>
                Hover states, focus effects, and micro-interactions
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="space-y-6">
            {interactionAnimations.map((animation) => (
              <Card key={animation.name}>
                <CardContent className="p-6">
                  <InteractionDemo animation={animation} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="loading" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Loader className="h-5 w-5" />
                <span>Loading Animations</span>
              </CardTitle>
              <CardDescription>
                Feedback animations and loading states
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="space-y-6">
            {loadingAnimations.map((animation) => (
              <Card key={animation.name}>
                <CardContent className="p-6">
                  <LoadingDemo animation={animation} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <RealWorldExamples />
        </TabsContent>
      </Tabs>

      {/* Reduced Motion */}
      <ReducedMotionDemo />

      {/* Motion Principles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Motion Design Principles</CardTitle>
          <CardDescription>Guidelines for implementing professional animations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Performance Guidelines</h4>
              <ul className="space-y-2 text-sm">
                <li>• Use transform and opacity for hardware acceleration</li>
                <li>• Avoid animating layout properties (width, height, padding)</li>
                <li>• Implement will-change for complex animations</li>
                <li>• Keep animations under 500ms for responsiveness</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">User Experience</h4>
              <ul className="space-y-2 text-sm">
                <li>• Always respect prefers-reduced-motion</li>
                <li>• Use motion to guide attention, not distract</li>
                <li>• Provide visual feedback for all interactions</li>
                <li>• Maintain consistent timing throughout the app</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}