import React from 'react'
import { Filter, ChevronRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useFilterSidebar } from '@/hooks/useFilterSidebar'
import { semanticSpacing, semanticTypography } from '@/styles/tokens'
import type { FilterSidebarProps, FilterSection } from './FilterSidebar.types'

const COLLAPSED_WIDTH = 64
const DEFAULT_WIDTH = 280
const MIN_WIDTH = 200
const MAX_WIDTH = 400

export function FilterSidebar({
  children,
  sections = [],
  defaultCollapsed = false,
  collapsedWidth = COLLAPSED_WIDTH,
  expandedWidth = DEFAULT_WIDTH,
  minWidth = MIN_WIDTH,
  maxWidth = MAX_WIDTH,
  persistKey = 'filter-sidebar',
  className,
  onCollapsedChange,
  onWidthChange,
}: FilterSidebarProps) {
  const { isCollapsed, width, isMobile, toggleCollapsed, setWidth, openSections, toggleSection } =
    useFilterSidebar({
      defaultCollapsed,
      defaultWidth: expandedWidth,
      persistKey,
      collapsedWidth,
      expandedWidth,
    })

  React.useEffect(() => {
    onCollapsedChange?.(isCollapsed)
  }, [isCollapsed, onCollapsedChange])

  React.useEffect(() => {
    onWidthChange?.(width)
  }, [width, onWidthChange])

  // Calculate active filter count
  const activeFilterCount = React.useMemo(() => {
    // This would integrate with your existing filter context
    // For now, returning a placeholder
    return 0
  }, [])

  // Mobile Sheet Implementation
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className={cn('gap-2', className)}>
            <Filter className="size-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="destructive" className="ml-1 size-4 rounded-full p-0 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className={cn(semanticSpacing.layoutPadding.md, 'border-b')}>
            <SheetTitle className="flex items-center gap-2">
              <Filter className="size-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {activeFilterCount} active
                </Badge>
              )}
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-5rem)]">
            <div className={semanticSpacing.layoutPadding.md}>
              {children || (
                <FilterSections
                  sections={sections}
                  openSections={openSections}
                  toggleSection={toggleSection}
                />
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop Resizable Implementation
  return (
    <div
      className={cn(
        'relative h-full border-r bg-background transition-all duration-200',
        isCollapsed && 'overflow-hidden',
        className
      )}
      style={{
        width: isCollapsed ? collapsedWidth : width,
        minWidth: isCollapsed ? collapsedWidth : minWidth,
        maxWidth: isCollapsed ? collapsedWidth : maxWidth,
      }}
    >
      {/* Header */}
      <div
        className={cn(
          'flex h-14 items-center justify-between border-b',
          isCollapsed ? semanticSpacing.horizontalPadding.sm : semanticSpacing.horizontalPadding.md
        )}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleCollapsed} className="size-8">
                {isCollapsed ? (
                  <ChevronRight className="size-4" />
                ) : (
                  <Filter className="size-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {isCollapsed ? 'Expand filters' : 'Collapse filters'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <span className={cn(semanticTypography.body, 'font-medium')}>Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="h-[calc(100%-3.5rem)]">
        {isCollapsed ? (
          <CollapsedFilterIcons sections={sections} />
        ) : (
          <div className={semanticSpacing.layoutPadding.md}>
            {children || (
              <FilterSections
                sections={sections}
                openSections={openSections}
                toggleSection={toggleSection}
              />
            )}
          </div>
        )}
      </ScrollArea>

      {/* Resize Handle - only show when not collapsed */}
      {!isCollapsed && !isMobile && (
        <div
          className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/20"
          onMouseDown={(e) => {
            e.preventDefault()
            const startX = e.clientX
            const startWidth = width

            const handleMouseMove = (e: MouseEvent) => {
              const newWidth = Math.min(
                maxWidth,
                Math.max(minWidth, startWidth + e.clientX - startX)
              )
              setWidth(newWidth)
            }

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove)
              document.removeEventListener('mouseup', handleMouseUp)
            }

            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
          }}
        />
      )}
    </div>
  )
}

// Collapsed state icon rail
function CollapsedFilterIcons({ sections }: { sections: FilterSection[] }) {
  return (
    <div
      className={cn(semanticSpacing.stack.md, semanticSpacing.verticalPadding.md, 'items-center')}
    >
      <TooltipProvider>
        {sections.map((section) => (
          <Tooltip key={section.id}>
            <TooltipTrigger asChild>
              <div className="relative">
                <Button variant="ghost" size="icon" className="size-10">
                  {section.icon || <Filter className="size-4" />}
                </Button>
                {section.badge && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 size-4 rounded-full p-0 text-[10px]"
                  >
                    {section.badge}
                  </Badge>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{section.title}</p>
              {section.badge && (
                <p className="text-xs text-muted-foreground">{section.badge} active</p>
              )}
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  )
}

// Filter sections renderer
function FilterSections({
  sections,
  openSections,
  toggleSection,
}: {
  sections: FilterSection[]
  openSections: Set<string>
  toggleSection: (id: string) => void
}) {
  return (
    <div className={semanticSpacing.stack.md}>
      {sections.map((section) => (
        <Collapsible
          key={section.id}
          open={section.defaultExpanded ?? openSections.has(section.id)}
          onOpenChange={() => toggleSection(section.id)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-between',
                semanticSpacing.horizontalPadding.sm,
                semanticSpacing.verticalPadding.xs
              )}
            >
              <div className="flex items-center gap-2">
                {section.icon}
                <span className={semanticTypography.body}>{section.title}</span>
              </div>
              <div className="flex items-center gap-2">
                {section.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {section.badge}
                  </Badge>
                )}
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    (section.defaultExpanded ?? openSections.has(section.id)) && 'rotate-180'
                  )}
                />
              </div>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent
            className={cn(semanticSpacing.topGap.sm, semanticSpacing.horizontalPadding.sm)}
          >
            {section.content}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  )
}
