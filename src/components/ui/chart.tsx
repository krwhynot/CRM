import { semanticTypography, semanticRadius, semanticSpacing } from '@/styles/tokens'
;('use client')

import * as React from 'react'
import * as RechartsPrimitive from 'recharts'

import { cn } from '@/lib/utils'
import { isDevelopment } from '@/config/environment'

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: '', dark: '.dark' } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />')
  }

  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<'div'> & {
  config: ChartConfig
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>['children']
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          '[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_line]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector]:stroke-transparent [&_.recharts-surface]:outline-hidden',
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  React.useEffect(() => {
    // SSR safety guard
    if (typeof document === 'undefined') return

    const colorConfig = Object.entries(config).filter(([, config]) => config.theme || config.color)

    if (!colorConfig.length) return

    const styleId = `chart-${id}-styles`

    // Clean up existing styles for this chart
    const existingStyle = document.getElementById(styleId)
    if (existingStyle) {
      existingStyle.remove()
    }

    // Create style element using secure DOM API
    const styleElement = document.createElement('style')
    styleElement.id = styleId
    document.head.appendChild(styleElement)

    const sheet = styleElement.sheet
    if (!sheet) return

    try {
      // Generate same CSS rules as before, but using secure insertRule API
      Object.entries(THEMES).forEach(([theme, prefix]) => {
        const selector = prefix ? `${prefix} [data-chart="${id}"]` : `[data-chart="${id}"]`
        const declarations = colorConfig
          .map(([key, itemConfig]) => {
            const color =
              itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color
            return color ? `--color-${key}: ${color}` : null
          })
          .filter(Boolean)
          .join('; ')

        if (declarations) {
          sheet.insertRule(`${selector} { ${declarations}; }`)
        }
      })
    } catch (error) {
      // Chart styling errors handled gracefully - charts will fall back to default colors
      if (isDevelopment) {
        // eslint-disable-next-line no-console
        console.warn('Failed to insert chart styles:', error)
      }
    }

    // Cleanup function prevents memory leaks
    return () => {
      const element = document.getElementById(styleId)
      if (element) {
        element.remove()
      }
    }
  }, [id, config])

  // No DOM element needed - styles are injected directly
  return null
}

const ChartTooltip = RechartsPrimitive.Tooltip

interface ChartPayloadItem {
  value: string | number
  name?: string
  dataKey?: string
  color?: string
  payload?: Record<string, unknown>
  fill?: string
}

type ChartTooltipContentProps = React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<'div'> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: 'line' | 'dot' | 'dashed'
    nameKey?: string
    labelKey?: string
    payload?: ChartPayloadItem[]
    label?: string
  }

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = 'dot',
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: ChartTooltipContentProps) {
  const { config } = useChart()

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null
    }

    const [item] = payload
    const key = `${labelKey || item?.dataKey || item?.name || 'value'}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value =
      !labelKey && typeof label === 'string'
        ? config[label as keyof typeof config]?.label || label
        : itemConfig?.label

    if (labelFormatter) {
      return (
        <div className={cn('font-medium', labelClassName)}>{labelFormatter(value, payload)}</div>
      )
    }

    if (!value) {
      return null
    }

    return <div className={cn('font-medium', labelClassName)}>{value}</div>
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey])

  if (!active || !payload?.length) {
    return null
  }

  const nestLabel = payload.length === 1 && indicator !== 'dot'

  return (
    <div
      className={cn(
        `border-border/50 bg-background grid min-w-[8rem] items-start ${semanticSpacing.gap.lg} ${semanticRadius.lg} border px-2.5 ${semanticSpacing.verticalPadding.lg} text-xs shadow-xl`,
        className
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className={`grid ${semanticSpacing.gap.lg}`}>
        {payload.map((item, index) => {
          const key = `${nameKey || item.name || item.dataKey || 'value'}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)
          const indicatorColor = color || item.payload?.fill || item.color

          return (
            <div
              key={item.dataKey}
              className={cn(
                `[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch ${semanticSpacing.gap.xs} [&>svg]:h-2.5 [&>svg]:w-2.5`,
                indicator === 'dot' && 'items-center'
              )}
            >
              {formatter && item?.value !== undefined && item.name ? (
                // Type assertion for recharts formatter compatibility
                (
                  formatter as unknown as (
                    value: string | number,
                    name: string | undefined,
                    entry: ChartPayloadItem,
                    index: number,
                    payload?: Record<string, unknown>
                  ) => React.ReactNode
                )(item.value, item.name, item, index, item.payload)
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      <div
                        className={cn(
                          `shrink-0 ${semanticRadius.sm} border-(--color-border) bg-(--color-bg)`,
                          {
                            'h-2.5 w-2.5': indicator === 'dot',
                            'w-1': indicator === 'line',
                            'w-0 border-[1.5px] border-dashed bg-transparent':
                              indicator === 'dashed',
                            [`${semanticSpacing.verticalMargin.xs}`]:
                              nestLabel && indicator === 'dashed',
                          }
                        )}
                        style={
                          {
                            '--color-bg': indicatorColor,
                            '--color-border': indicatorColor,
                          } as React.CSSProperties
                        }
                      />
                    )
                  )}
                  <div
                    className={cn(
                      'flex flex-1 justify-between leading-none',
                      nestLabel ? 'items-end' : 'items-center'
                    )}
                  >
                    <div className={`grid ${semanticSpacing.gap.lg}`}>
                      {nestLabel ? tooltipLabel : null}
                      <span className="text-muted-foreground">
                        {itemConfig?.label || item.name}
                      </span>
                    </div>
                    {item.value && (
                      <span
                        className={cn(
                          semanticTypography.label,
                          'font-mono tabular-nums text-foreground'
                        )}
                      >
                        {item.value.toLocaleString()}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const ChartLegend = RechartsPrimitive.Legend

interface ChartLegendPayloadItem {
  value: string
  dataKey?: string
  color?: string
  type?: string
  payload?: Record<string, unknown>
}

type ChartLegendContentProps = React.ComponentProps<'div'> &
  Pick<RechartsPrimitive.LegendProps, 'verticalAlign'> & {
    hideIcon?: boolean
    nameKey?: string
    payload?: ChartLegendPayloadItem[]
  }

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = 'bottom',
  nameKey,
}: ChartLegendContentProps) {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        `flex items-center justify-center ${semanticSpacing.gap.xl}`,
        verticalAlign === 'top' ? 'pb-3' : 'pt-3',
        className
      )}
    >
      {payload.map((item) => {
        const key = `${nameKey || item.dataKey || 'value'}`
        const itemConfig = getPayloadConfigFromPayload(config, item, key)

        return (
          <div
            key={item.value}
            className={cn(
              `[&>svg]:text-muted-foreground flex items-center ${semanticSpacing.gap.lg} [&>svg]:h-3 [&>svg]:w-3`
            )}
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className={cn(semanticRadius.small, 'size-2 shrink-0')}
                style={{
                  backgroundColor: item.color,
                }}
              />
            )}
            {itemConfig?.label}
          </div>
        )
      })}
    </div>
  )
}

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== 'object' || payload === null) {
    return undefined
  }

  const payloadPayload =
    'payload' in payload && typeof payload.payload === 'object' && payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (key in payload && typeof payload[key as keyof typeof payload] === 'string') {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === 'string'
  ) {
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string
  }

  return configLabelKey in config ? config[configLabelKey] : config[key as keyof typeof config]
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
