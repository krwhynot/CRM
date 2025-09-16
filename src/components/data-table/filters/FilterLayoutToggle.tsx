import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Settings, Check, Smartphone, Tablet, Monitor, Layout } from 'lucide-react'
import { useFilterModeSelector } from '@/hooks/useFilterLayout'
import type { FilterLayoutMode } from '@/contexts/FilterLayoutContext'

interface FilterLayoutToggleProps {
  /**
   * Show debug information in development mode
   */
  showDebugInfo?: boolean
  /**
   * Enable compact mode for smaller spaces
   */
  compact?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * FilterLayoutToggle - Development and testing controls for filter layout modes
 *
 * Provides user controls for manual layout preference override and layout debugging.
 * Shows current device context, active mode, and allows switching between modes.
 *
 * @example Basic Usage
 * <FilterLayoutToggle />
 *
 * @example With Debug Info (Development)
 * <FilterLayoutToggle showDebugInfo={process.env.NODE_ENV === 'development'} />
 *
 * @example Compact Mode
 * <FilterLayoutToggle compact />
 */
export function FilterLayoutToggle({
  showDebugInfo = false,
  compact = false,
  className
}: FilterLayoutToggleProps) {
  const { currentMode, setMode, availableModes, deviceContext } = useFilterModeSelector()

  // Get appropriate icon for device context
  const getDeviceIcon = () => {
    switch (deviceContext) {
      case 'mobile':
        return <Smartphone className="size-3" />
      case 'tablet-portrait':
      case 'tablet-landscape':
        return <Tablet className="size-3" />
      case 'desktop':
      case 'large-desktop':
        return <Monitor className="size-3" />
      default:
        return <Layout className="size-3" />
    }
  }

  // Get display label for current mode
  const getCurrentModeLabel = () => {
    const mode = availableModes.find(m => m.value === currentMode)
    return mode?.label || 'Unknown'
  }

  // Get variant for mode selection (highlight optimal modes)
  const getModeVariant = (mode: FilterLayoutMode, optimal: boolean) => {
    if (mode === currentMode) return 'default'
    if (optimal) return 'secondary'
    return 'ghost'
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Debug info badge (development only) */}
      {showDebugInfo && (
        <Badge variant="outline" className="hidden items-center gap-1 text-xs md:flex">
          {getDeviceIcon()}
          <span className="capitalize">{deviceContext.replace('-', ' ')}</span>
        </Badge>
      )}

      {/* Layout mode selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size={compact ? "sm" : "default"}
            className={cn(
              'flex items-center gap-2',
              compact && 'h-8 px-2'
            )}
          >
            <Settings className={cn('h-4 w-4', compact && 'h-3 w-3')} />
            {!compact && (
              <>
                <span className="hidden sm:inline">Layout:</span>
                <span className="font-medium">{getCurrentModeLabel()}</span>
              </>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Layout className="size-4" />
            Filter Layout Mode
          </DropdownMenuLabel>

          {showDebugInfo && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {getDeviceIcon()}
                  <span>Device: {deviceContext.replace('-', ' ')}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Active: {currentMode}
                </div>
              </div>
            </>
          )}

          <DropdownMenuSeparator />

          {availableModes.map((mode) => (
            <DropdownMenuItem
              key={mode.value}
              onClick={() => setMode(mode.value)}
              className="flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <span>{mode.label}</span>
                {mode.optimal && (
                  <Badge variant="secondary" className="text-xs">
                    Optimal
                  </Badge>
                )}
              </div>
              {mode.value === currentMode && (
                <Check className="size-4 text-green-600" />
              )}
            </DropdownMenuItem>
          ))}

          {showDebugInfo && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1 text-xs text-muted-foreground">
                <div className="space-y-1">
                  <div>• Auto: System chooses optimal layout</div>
                  <div>• Inline: Always show filters inline</div>
                  <div>• Sheet: Side panel for filters</div>
                  <div>• Drawer: Bottom drawer for filters</div>
                </div>
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

/**
 * Simple layout mode badge for quick visual feedback
 */
interface LayoutModeBadgeProps {
  className?: string
}

export function LayoutModeBadge({ className }: LayoutModeBadgeProps) {
  const { currentMode, deviceContext } = useFilterModeSelector()

  const getBadgeColor = () => {
    switch (currentMode) {
      case 'inline':
        return 'bg-green-500/10 text-green-700 border-green-200'
      case 'sheet':
        return 'bg-blue-500/10 text-blue-700 border-blue-200'
      case 'drawer':
        return 'bg-purple-500/10 text-purple-700 border-purple-200'
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200'
    }
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'text-xs font-mono',
        getBadgeColor(),
        className
      )}
    >
      {currentMode}
    </Badge>
  )
}

/**
 * Development-only layout debugger component
 */
interface LayoutDebuggerProps {
  className?: string
}

export function LayoutDebugger({ className }: LayoutDebuggerProps) {
  const { currentMode, preferredMode, deviceContext, isOpen } = useFilterModeSelector()

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className={cn('rounded-md border bg-muted/20 p-3 font-mono text-xs', className)}>
      <div className="mb-2 font-semibold">Filter Layout Debug</div>
      <div className="space-y-1 text-muted-foreground">
        <div>Device: <span className="text-foreground">{deviceContext}</span></div>
        <div>Preferred: <span className="text-foreground">{preferredMode}</span></div>
        <div>Current: <span className="text-foreground">{currentMode}</span></div>
        <div>Open: <span className="text-foreground">{isOpen ? 'true' : 'false'}</span></div>
      </div>
    </div>
  )
}