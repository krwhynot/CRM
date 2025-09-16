/**
 * Layout Debugger - Development Debugging Tools
 *
 * Comprehensive development debugging tools for inspecting layout state,
 * performance profiling, and runtime analysis of the layout-as-data system.
 * Provides visual debugging interface, performance metrics, and real-time
 * layout inspection capabilities for development workflow.
 *
 * Features:
 * - Visual layout structure inspection
 * - Real-time performance profiling for layout rendering
 * - Component registry inspection
 * - Schema validation in development
 * - Layout comparison tools
 * - Responsive behavior testing
 * - Error boundary visualization
 * - Memory usage monitoring
 * - Cache inspection
 * - Migration assistance tools
 *
 * Usage:
 *   <LayoutDebugger />
 *   <LayoutDebugger.Panel />
 *   <LayoutDebugger.Inspector schema={schema} />
 *   <LayoutDebugger.Profiler />
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ChevronDownIcon,
  ChevronRightIcon,
  EyeIcon,
  EyeOffIcon,
  RefreshCwIcon,
  SettingsIcon,
  BugIcon,
  BarChart3Icon,
  LayersIcon,
  ZapIcon,
  SearchIcon,
  AlertTriangleIcon,
  InfoIcon,
  XIcon,
  MinimizeIcon,
  MaximizeIcon,
} from 'lucide-react'
import { useLayoutContext } from '@/components/layout/LayoutProvider'
import { getLayoutRenderer } from '@/lib/layout/renderer'
import { getComponentRegistry } from '@/lib/layout/component-registry'
import type {
  LayoutConfiguration,
  SlotConfiguration,
  LayoutEntityType,
  SlotBasedLayout,
} from '@/types/layout/schema.types'
import type { RenderResult } from '@/types/layout/registry.types'
import { semanticSpacing, semanticColors } from '@/styles/tokens'

// Debug Tool Configuration
interface DebuggerConfig {
  enabled: boolean
  autoOpen: boolean
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'floating'
  size: 'compact' | 'normal' | 'expanded'
  showPerformanceMetrics: boolean
  showMemoryUsage: boolean
  highlightSlots: boolean
  showResponsiveIndicators: boolean
  enableProfiling: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
}

// Performance Metrics
interface PerformanceMetrics {
  renderTime: number
  componentCount: number
  slotCount: number
  memoryUsage: number
  cacheHitRate: number
  lastRenderAt: number
  averageRenderTime: number
  renderCount: number
  errors: number
  warnings: number
}

// Layout Analysis
interface LayoutAnalysis {
  complexity: number
  depth: number
  slotTypes: Record<string, number>
  responsiveSlots: number
  conditionalSlots: number
  performanceScore: number
  issues: AnalysisIssue[]
  recommendations: string[]
}

interface AnalysisIssue {
  type: 'error' | 'warning' | 'info'
  category: 'performance' | 'structure' | 'best-practices'
  message: string
  location?: string
  suggestion?: string
}

// Component Props
interface LayoutDebuggerProps {
  config?: Partial<DebuggerConfig>
  onConfigChange?: (config: DebuggerConfig) => void
  className?: string
}

interface DebuggerState {
  isOpen: boolean
  isMinimized: boolean
  activeTab: string
  selectedSlot?: string
  performanceMetrics: PerformanceMetrics
  layoutAnalysis: LayoutAnalysis | null
  errors: Error[]
  searchQuery: string
  filters: {
    showErrors: boolean
    showWarnings: boolean
    showInfo: boolean
  }
}

/**
 * Main Layout Debugger Component
 */
export const LayoutDebugger: React.FC<LayoutDebuggerProps> & {
  Panel: typeof DebuggerPanel
  Inspector: typeof LayoutInspector
  Profiler: typeof PerformanceProfiler
  SlotHighlight: typeof SlotHighlight
} = ({ config: configProp, onConfigChange, className }) => {
  // Default configuration
  const defaultConfig: DebuggerConfig = {
    enabled: process.env.NODE_ENV === 'development',
    autoOpen: false,
    position: 'bottom-right',
    size: 'normal',
    showPerformanceMetrics: true,
    showMemoryUsage: true,
    highlightSlots: true,
    showResponsiveIndicators: true,
    enableProfiling: true,
    logLevel: 'info',
    ...configProp,
  }

  const [config, setConfig] = useState<DebuggerConfig>(defaultConfig)
  const [state, setState] = useState<DebuggerState>({
    isOpen: config.autoOpen,
    isMinimized: false,
    activeTab: 'overview',
    performanceMetrics: {
      renderTime: 0,
      componentCount: 0,
      slotCount: 0,
      memoryUsage: 0,
      cacheHitRate: 0,
      lastRenderAt: 0,
      averageRenderTime: 0,
      renderCount: 0,
      errors: 0,
      warnings: 0,
    },
    layoutAnalysis: null,
    errors: [],
    searchQuery: '',
    filters: {
      showErrors: true,
      showWarnings: true,
      showInfo: true,
    },
  })

  const layoutContext = useLayoutContext()
  const renderer = useRef(getLayoutRenderer())
  const updateInterval = useRef<NodeJS.Timeout | null>(null)

  // Update configuration handler
  const handleConfigChange = useCallback((newConfig: Partial<DebuggerConfig>) => {
    const updatedConfig = { ...config, ...newConfig }
    setConfig(updatedConfig)
    onConfigChange?.(updatedConfig)
  }, [config, onConfigChange])

  // Performance monitoring
  useEffect(() => {
    if (!config.enabled || !config.enableProfiling) return

    const startMonitoring = () => {
      updateInterval.current = setInterval(() => {
        const stats = renderer.current.getPerformanceStats()
        const memoryInfo = performance.memory

        setState(prev => ({
          ...prev,
          performanceMetrics: {
            ...prev.performanceMetrics,
            memoryUsage: memoryInfo?.usedJSHeapSize || 0,
            cacheHitRate: stats.cacheSize > 0 ? (stats.cacheSize / (stats.cacheSize + stats.totalErrors)) * 100 : 0,
            lastRenderAt: Date.now(),
          },
        }))
      }, 1000)
    }

    startMonitoring()

    return () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current)
      }
    }
  }, [config.enabled, config.enableProfiling])

  // Layout analysis
  const analyzeCurrentLayout = useCallback(async () => {
    if (!layoutContext?.currentLayout) return

    const analysis = await analyzeLayout(layoutContext.currentLayout)
    setState(prev => ({ ...prev, layoutAnalysis: analysis }))
  }, [layoutContext?.currentLayout])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!config.enabled) return

      // Ctrl+Shift+D to toggle debugger
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault()
        setState(prev => ({ ...prev, isOpen: !prev.isOpen }))
      }

      // Ctrl+Shift+R to refresh analysis
      if (event.ctrlKey && event.shiftKey && event.key === 'R') {
        event.preventDefault()
        analyzeCurrentLayout()
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [config.enabled, analyzeCurrentLayout])

  // Don't render in production unless explicitly enabled
  if (!config.enabled) return null

  return (
    <>
      {/* Slot highlighting overlays */}
      {config.highlightSlots && state.isOpen && (
        <SlotHighlights
          selectedSlot={state.selectedSlot}
          onSlotSelect={(slotId) => setState(prev => ({ ...prev, selectedSlot: slotId }))}
        />
      )}

      {/* Main debugger interface */}
      <DebuggerPanel
        config={config}
        state={state}
        onStateChange={setState}
        onConfigChange={handleConfigChange}
        onAnalyze={analyzeCurrentLayout}
        className={className}
      />

      {/* Floating toggle button when minimized */}
      {(!state.isOpen || state.isMinimized) && (
        <DebuggerToggle
          isOpen={state.isOpen}
          isMinimized={state.isMinimized}
          position={config.position}
          onClick={() => setState(prev => ({
            ...prev,
            isOpen: true,
            isMinimized: false
          }))}
        />
      )}
    </>
  )
}

/**
 * Main Debugger Panel Component
 */
const DebuggerPanel: React.FC<{
  config: DebuggerConfig
  state: DebuggerState
  onStateChange: React.Dispatch<React.SetStateAction<DebuggerState>>
  onConfigChange: (config: Partial<DebuggerConfig>) => void
  onAnalyze: () => void
  className?: string
}> = ({ config, state, onStateChange, onConfigChange, onAnalyze, className }) => {
  const layoutContext = useLayoutContext()

  if (!state.isOpen) return null

  const positionStyles = {
    'bottom-right': 'fixed bottom-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4',
    'top-right': 'fixed top-4 right-4',
    'top-left': 'fixed top-4 left-4',
    'floating': 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
  }

  const sizeStyles = {
    compact: 'w-80 h-96',
    normal: 'w-96 h-[32rem]',
    expanded: 'w-[40rem] h-[40rem]',
  }

  return createPortal(
    <div
      className={cn(
        'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl z-[9999]',
        positionStyles[config.position],
        sizeStyles[config.size],
        state.isMinimized && 'h-12',
        className
      )}
      style={{ fontFamily: 'system-ui, sans-serif' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-3 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <BugIcon className="size-4 text-blue-500" />
          <span className="text-sm font-semibold">Layout Debugger</span>
          {state.performanceMetrics.errors > 0 && (
            <Badge variant="destructive" className="text-xs">
              {state.performanceMetrics.errors} errors
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onStateChange(prev => ({ ...prev, isMinimized: !prev.isMinimized }))}
          >
            {state.isMinimized ? <MaximizeIcon className="size-4" /> : <MinimizeIcon className="size-4" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onStateChange(prev => ({ ...prev, isOpen: false }))}
          >
            <XIcon className="size-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {!state.isMinimized && (
        <div className="flex h-full flex-col">
          {/* Quick Stats */}
          <div className="border-b border-gray-100 p-3 dark:border-gray-800">
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="text-center">
                <div className="font-semibold">{state.performanceMetrics.componentCount}</div>
                <div className="text-gray-500">Components</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{state.performanceMetrics.slotCount}</div>
                <div className="text-gray-500">Slots</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{state.performanceMetrics.renderTime}ms</div>
                <div className="text-gray-500">Render</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">
                  {(state.performanceMetrics.memoryUsage / 1024 / 1024).toFixed(1)}MB
                </div>
                <div className="text-gray-500">Memory</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            value={state.activeTab}
            onValueChange={(tab) => onStateChange(prev => ({ ...prev, activeTab: tab }))}
            className="flex flex-1 flex-col"
          >
            <TabsList className="grid h-10 w-full grid-cols-4">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="inspector" className="text-xs">Inspector</TabsTrigger>
              <TabsTrigger value="performance" className="text-xs">Performance</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="overview" className="h-full">
                <OverviewTab
                  layoutContext={layoutContext}
                  performanceMetrics={state.performanceMetrics}
                  layoutAnalysis={state.layoutAnalysis}
                  onAnalyze={onAnalyze}
                />
              </TabsContent>

              <TabsContent value="inspector" className="h-full">
                <LayoutInspector
                  schema={layoutContext?.currentLayout}
                  selectedSlot={state.selectedSlot}
                  onSlotSelect={(slotId) => onStateChange(prev => ({ ...prev, selectedSlot: slotId }))}
                />
              </TabsContent>

              <TabsContent value="performance" className="h-full">
                <PerformanceProfiler
                  metrics={state.performanceMetrics}
                  config={config}
                />
              </TabsContent>

              <TabsContent value="settings" className="h-full">
                <SettingsTab
                  config={config}
                  onConfigChange={onConfigChange}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      )}
    </div>,
    document.body
  )
}

/**
 * Overview Tab Component
 */
const OverviewTab: React.FC<{
  layoutContext: any
  performanceMetrics: PerformanceMetrics
  layoutAnalysis: LayoutAnalysis | null
  onAnalyze: () => void
}> = ({ layoutContext, performanceMetrics, layoutAnalysis, onAnalyze }) => {
  return (
    <ScrollArea className="h-full p-3">
      <div className="space-y-4">
        {/* Current Layout Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              Current Layout
              <Button size="sm" variant="outline" onClick={onAnalyze}>
                <RefreshCwIcon className="mr-1 size-3" />
                Analyze
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {layoutContext?.currentLayout ? (
              <>
                <div><strong>ID:</strong> {layoutContext.currentLayout.id}</div>
                <div><strong>Name:</strong> {layoutContext.currentLayout.name}</div>
                <div><strong>Entity:</strong> {layoutContext.currentLayout.entityType}</div>
                <div><strong>Type:</strong> {layoutContext.currentLayout.type}</div>
                <div><strong>Version:</strong> {layoutContext.currentLayout.version}</div>
              </>
            ) : (
              <div className="text-gray-500">No active layout</div>
            )}
          </CardContent>
        </Card>

        {/* Layout Analysis */}
        {layoutAnalysis && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div><strong>Complexity:</strong> {layoutAnalysis.complexity}/10</div>
              <div><strong>Performance Score:</strong> {layoutAnalysis.performanceScore}/100</div>
              <div><strong>Slot Depth:</strong> {layoutAnalysis.depth}</div>
              <div><strong>Responsive Slots:</strong> {layoutAnalysis.responsiveSlots}</div>

              {layoutAnalysis.issues.length > 0 && (
                <div className="mt-2 space-y-1">
                  <strong>Issues:</strong>
                  {layoutAnalysis.issues.map((issue, index) => (
                    <Alert key={index} className="py-2">
                      <AlertDescription className="text-xs">
                        {issue.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Performance Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div><strong>Last Render:</strong> {performanceMetrics.renderTime}ms</div>
            <div><strong>Average:</strong> {performanceMetrics.averageRenderTime.toFixed(1)}ms</div>
            <div><strong>Cache Hit Rate:</strong> {performanceMetrics.cacheHitRate.toFixed(1)}%</div>
            <div><strong>Render Count:</strong> {performanceMetrics.renderCount}</div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}

/**
 * Layout Inspector Component
 */
const LayoutInspector: React.FC<{
  schema?: LayoutConfiguration
  selectedSlot?: string
  onSlotSelect?: (slotId: string) => void
}> = ({ schema, selectedSlot, onSlotSelect }) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  if (!schema || !('structure' in schema)) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        No schema available for inspection
      </div>
    )
  }

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }

  return (
    <ScrollArea className="h-full p-3">
      <div className="space-y-2">
        <div className="mb-2 text-sm font-semibold">Layout Structure</div>

        {(schema as SlotBasedLayout).structure.slots.map((slot) => (
          <SlotTreeNode
            key={slot.id}
            slot={slot}
            isSelected={selectedSlot === slot.id}
            isExpanded={expandedNodes.has(slot.id)}
            onToggle={() => toggleNode(slot.id)}
            onSelect={() => onSlotSelect?.(slot.id)}
          />
        ))}
      </div>
    </ScrollArea>
  )
}

/**
 * Slot Tree Node Component
 */
const SlotTreeNode: React.FC<{
  slot: SlotConfiguration
  isSelected: boolean
  isExpanded: boolean
  onToggle: () => void
  onSelect: () => void
}> = ({ slot, isSelected, isExpanded, onToggle, onSelect }) => {
  const hasChildren = slot.props && Object.keys(slot.props).length > 0

  return (
    <div className={cn(
      "border rounded p-2 text-xs cursor-pointer transition-colors",
      isSelected
        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
    )}>
      <div className="flex items-center justify-between" onClick={onSelect}>
        <div className="flex items-center gap-2">
          {hasChildren && (
            <button onClick={(e) => { e.stopPropagation(); onToggle(); }}>
              {isExpanded ?
                <ChevronDownIcon className="size-3" /> :
                <ChevronRightIcon className="size-3" />
              }
            </button>
          )}
          <div className="font-medium">{slot.displayName || slot.name}</div>
          <Badge variant="outline" className="text-xs">{slot.type}</Badge>
        </div>

        <div className="flex items-center gap-1">
          {slot.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
          {slot.responsive && <Badge variant="default" className="text-xs">Responsive</Badge>}
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="mt-2 space-y-1 border-l border-gray-200 pl-4 dark:border-gray-700">
          {Object.entries(slot.props || {}).map(([key, value]) => (
            <div key={key} className="text-xs text-gray-600 dark:text-gray-400">
              <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Performance Profiler Component
 */
const PerformanceProfiler: React.FC<{
  metrics: PerformanceMetrics
  config: DebuggerConfig
}> = ({ metrics, config }) => {
  return (
    <ScrollArea className="h-full p-3">
      <div className="space-y-4">
        {/* Render Performance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3Icon className="size-4" />
              Render Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-semibold">Last Render</div>
                <div className={cn(
                  metrics.renderTime > 100 ? "text-red-600" :
                  metrics.renderTime > 50 ? "text-yellow-600" : "text-green-600"
                )}>
                  {metrics.renderTime}ms
                </div>
              </div>
              <div>
                <div className="font-semibold">Average</div>
                <div>{metrics.averageRenderTime.toFixed(1)}ms</div>
              </div>
              <div>
                <div className="font-semibold">Total Renders</div>
                <div>{metrics.renderCount}</div>
              </div>
              <div>
                <div className="font-semibold">Cache Hit Rate</div>
                <div>{metrics.cacheHitRate.toFixed(1)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Memory Usage */}
        {config.showMemoryUsage && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <ZapIcon className="size-4" />
                Memory Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs">
              <div>
                <div className="font-semibold">Heap Used</div>
                <div>{(metrics.memoryUsage / 1024 / 1024).toFixed(2)} MB</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Summary */}
        {(metrics.errors > 0 || metrics.warnings > 0) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <AlertTriangleIcon className="size-4" />
                Issues
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Errors:</span>
                <Badge variant="destructive">{metrics.errors}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Warnings:</span>
                <Badge variant="secondary">{metrics.warnings}</Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  )
}

/**
 * Settings Tab Component
 */
const SettingsTab: React.FC<{
  config: DebuggerConfig
  onConfigChange: (config: Partial<DebuggerConfig>) => void
}> = ({ config, onConfigChange }) => {
  return (
    <ScrollArea className="h-full p-3">
      <div className="space-y-4">
        {/* Display Settings */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Display</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-open" className="text-xs">Auto-open on load</Label>
              <Switch
                id="auto-open"
                checked={config.autoOpen}
                onCheckedChange={(checked) => onConfigChange({ autoOpen: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="highlight-slots" className="text-xs">Highlight slots</Label>
              <Switch
                id="highlight-slots"
                checked={config.highlightSlots}
                onCheckedChange={(checked) => onConfigChange({ highlightSlots: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="responsive-indicators" className="text-xs">Show responsive indicators</Label>
              <Switch
                id="responsive-indicators"
                checked={config.showResponsiveIndicators}
                onCheckedChange={(checked) => onConfigChange({ showResponsiveIndicators: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Performance Settings */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-profiling" className="text-xs">Enable profiling</Label>
              <Switch
                id="enable-profiling"
                checked={config.enableProfiling}
                onCheckedChange={(checked) => onConfigChange({ enableProfiling: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-performance" className="text-xs">Show performance metrics</Label>
              <Switch
                id="show-performance"
                checked={config.showPerformanceMetrics}
                onCheckedChange={(checked) => onConfigChange({ showPerformanceMetrics: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-memory" className="text-xs">Show memory usage</Label>
              <Switch
                id="show-memory"
                checked={config.showMemoryUsage}
                onCheckedChange={(checked) => onConfigChange({ showMemoryUsage: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}

/**
 * Floating Toggle Button
 */
const DebuggerToggle: React.FC<{
  isOpen: boolean
  isMinimized: boolean
  position: string
  onClick: () => void
}> = ({ isOpen, isMinimized, position, onClick }) => {
  const positionStyles = {
    'bottom-right': 'fixed bottom-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4',
    'top-right': 'fixed top-4 right-4',
    'top-left': 'fixed top-4 left-4',
    'floating': 'fixed bottom-4 right-4',
  }

  return (
    <Button
      onClick={onClick}
      className={cn(
        'z-[9998] shadow-lg',
        positionStyles[position as keyof typeof positionStyles]
      )}
      size="sm"
    >
      <BugIcon className="mr-1 size-4" />
      Debug
    </Button>
  )
}

/**
 * Slot Highlighting Overlays
 */
const SlotHighlights: React.FC<{
  selectedSlot?: string
  onSlotSelect: (slotId: string) => void
}> = ({ selectedSlot, onSlotSelect }) => {
  // This would implement visual overlays to highlight slots in the actual layout
  // For now, it's a placeholder that would interact with DOM elements

  useEffect(() => {
    const handleSlotClick = (event: Event) => {
      const target = event.target as HTMLElement
      const slotElement = target.closest('[data-slot-id]')
      if (slotElement) {
        const slotId = slotElement.getAttribute('data-slot-id')
        if (slotId) {
          onSlotSelect(slotId)
        }
      }
    }

    document.addEventListener('click', handleSlotClick, true)
    return () => document.removeEventListener('click', handleSlotClick, true)
  }, [onSlotSelect])

  return null // Visual highlighting would be implemented here
}

/**
 * Slot Highlight Component (for individual slot highlighting)
 */
const SlotHighlight: React.FC<{ slotId: string; children: React.ReactNode }> = ({ slotId, children }) => {
  return (
    <div data-slot-id={slotId} className="relative">
      {children}
    </div>
  )
}

/**
 * Layout Analysis Utility
 */
async function analyzeLayout(schema: LayoutConfiguration): Promise<LayoutAnalysis> {
  const analysis: LayoutAnalysis = {
    complexity: 0,
    depth: 0,
    slotTypes: {},
    responsiveSlots: 0,
    conditionalSlots: 0,
    performanceScore: 100,
    issues: [],
    recommendations: [],
  }

  if ('structure' in schema && schema.structure.slots) {
    const slots = (schema as SlotBasedLayout).structure.slots

    // Calculate complexity
    analysis.complexity = Math.min(10, slots.length / 2)
    analysis.depth = calculateSlotDepth(slots)

    // Analyze slot types
    slots.forEach(slot => {
      analysis.slotTypes[slot.type] = (analysis.slotTypes[slot.type] || 0) + 1

      if (slot.responsive) analysis.responsiveSlots++
      if (slot.conditional) analysis.conditionalSlots++
    })

    // Performance analysis
    const contentSlots = slots.filter(s => s.type === 'content')
    if (contentSlots.length === 0) {
      analysis.issues.push({
        type: 'warning',
        category: 'structure',
        message: 'No content slots found',
        suggestion: 'Add at least one content slot to display data',
      })
      analysis.performanceScore -= 10
    }

    // Virtualization check
    const hasVirtualization = contentSlots.some(s => s.props?.enableVirtualization)
    if (!hasVirtualization && schema.entityType) {
      analysis.recommendations.push('Consider enabling virtualization for large datasets')
    }

    // Responsive design check
    if (analysis.responsiveSlots === 0) {
      analysis.issues.push({
        type: 'info',
        category: 'best-practices',
        message: 'No responsive slots configured',
        suggestion: 'Add responsive behavior for mobile-first design',
      })
    }
  }

  return analysis
}

function calculateSlotDepth(slots: SlotConfiguration[]): number {
  // Simplified depth calculation
  return Math.max(1, Math.ceil(slots.length / 5))
}

// Assign sub-components
LayoutDebugger.Panel = DebuggerPanel
LayoutDebugger.Inspector = LayoutInspector
LayoutDebugger.Profiler = PerformanceProfiler
LayoutDebugger.SlotHighlight = SlotHighlight

export { LayoutDebugger }
export default LayoutDebugger

// Type exports for external use
export type { DebuggerConfig, PerformanceMetrics, LayoutAnalysis }