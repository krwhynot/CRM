import React, { useState } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { semanticSpacing, semanticRadius, semanticTypography } from '@/styles/tokens'
import {
  Users,
  Building,
  Package,
  TrendingUp,
  MessageSquare,
  Calendar,
  Phone,
  Mail,
  FileText,
  Download,
  Upload,
  Trash2,
  Save,
  X,
  Edit,
  Eye,
  Star,
  Clock,
  MapPin,
  Globe,
  Filter,
  Search,
  Plus,
  Settings,
  MoreHorizontal,
  ExternalLink,
  History,
  Tag,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// Removed unused: import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

// Sheet Variants
const sheetVariants = cva('w-full sm:max-w-sm', {
  variants: {
    size: {
      sm: 'sm:max-w-sm',
      md: 'sm:max-w-md',
      lg: 'sm:max-w-lg',
      xl: 'sm:max-w-xl',
      wide: 'sm:max-w-2xl',
    },
    type: {
      details: 'sm:max-w-lg',
      form: 'sm:max-w-md',
      filters: 'sm:max-w-sm',
      activity: 'sm:max-w-md',
    },
  },
  defaultVariants: {
    size: 'md',
    type: 'details',
  },
})

// Base CRM Sheet Props
export interface CRMSheetProps extends VariantProps<typeof sheetVariants> {
  open: boolean
  onOpenChange: (open: boolean) => void
  side?: 'top' | 'right' | 'bottom' | 'left'
  title: string
  subtitle?: string
  children: React.ReactNode
  actions?: React.ReactNode
  loading?: boolean
  className?: string
}

// Base CRM Sheet Component
export function CRMSheet({
  open,
  onOpenChange,
  side = 'right',
  title,
  subtitle,
  children,
  actions,
  loading = false,
  size = 'md',
  type = 'details',
  className,
  ...props
}: CRMSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className={cn(sheetVariants({ size, type }), className)} {...props}>
        <SheetHeader>
          <SheetTitle className={cn(semanticSpacing.gap.xs, 'flex items-center')}>
            {title}
            {loading && (
              <div
                className={cn(
                  semanticRadius.full,
                  'size-4 animate-spin border-2 border-muted border-t-primary'
                )}
              />
            )}
          </SheetTitle>
          {subtitle && <SheetDescription>{subtitle}</SheetDescription>}
        </SheetHeader>

        <div className={cn(semanticSpacing.cardY, 'flex-1 overflow-hidden')}>{children}</div>

        {actions && <SheetFooter>{actions}</SheetFooter>}
      </SheetContent>
    </Sheet>
  )
}

// Entity Detail Sheet
export interface EntityDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityType: 'contact' | 'organization' | 'product' | 'opportunity' | 'interaction'
  entityId: string
  data: any
  onEdit?: () => void
  onDelete?: () => void
  loading?: boolean
  activities?: Array<{
    id: string
    type: string
    title: string
    description?: string
    timestamp: Date
    user?: { name: string; avatar?: string }
  }>
}

export function EntityDetailSheet({
  open,
  onOpenChange,
  entityType,
  entityId,
  data,
  onEdit,
  onDelete,
  loading = false,
  activities = [],
}: EntityDetailSheetProps) {
  const entityConfig = {
    contact: {
      icon: Users,
      title: 'Contact',
      color: 'text-blue-600',
      fields: [
        { key: 'email', label: 'Email', icon: Mail },
        { key: 'phone', label: 'Phone', icon: Phone },
        { key: 'company', label: 'Company', icon: Building },
        { key: 'position', label: 'Position', icon: FileText },
      ],
    },
    organization: {
      icon: Building,
      title: 'Organization',
      color: 'text-green-600',
      fields: [
        { key: 'website', label: 'Website', icon: Globe },
        { key: 'phone', label: 'Phone', icon: Phone },
        { key: 'address', label: 'Address', icon: MapPin },
        { key: 'employees', label: 'Employees', icon: Users },
      ],
    },
    product: {
      icon: Package,
      title: 'Product',
      color: 'text-purple-600',
      fields: [
        { key: 'price', label: 'Price', icon: DollarSign },
        { key: 'category', label: 'Category', icon: Tag },
        { key: 'status', label: 'Status', icon: CheckCircle },
        { key: 'sku', label: 'SKU', icon: FileText },
      ],
    },
    opportunity: {
      icon: TrendingUp,
      title: 'Opportunity',
      color: 'text-orange-600',
      fields: [
        { key: 'value', label: 'Value', icon: DollarSign },
        { key: 'stage', label: 'Stage', icon: Target },
        { key: 'probability', label: 'Probability', icon: TrendingUp },
        { key: 'closeDate', label: 'Close Date', icon: Calendar },
      ],
    },
    interaction: {
      icon: MessageSquare,
      title: 'Interaction',
      color: 'text-teal-600',
      fields: [
        { key: 'type', label: 'Type', icon: MessageSquare },
        { key: 'duration', label: 'Duration', icon: Clock },
        { key: 'outcome', label: 'Outcome', icon: CheckCircle },
        { key: 'followUp', label: 'Follow Up', icon: Calendar },
      ],
    },
  }

  const config = entityConfig[entityType]
  const IconComponent = config.icon

  return (
    <CRMSheet
      open={open}
      onOpenChange={onOpenChange}
      title={data.name || data.title || 'Details'}
      subtitle={config.title}
      type="details"
      size="lg"
      loading={loading}
      actions={
        <div className={cn(semanticSpacing.gap.xs, 'flex items-center w-full')}>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="mr-1 size-4" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="mr-1 size-4" />
              Delete
            </Button>
          )}
        </div>
      }
    >
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="related">Related</TabsTrigger>
        </TabsList>

        <TabsContent
          value="details"
          className={cn(semanticSpacing.stack.md, semanticSpacing.topGap.sm)}
        >
          <ScrollArea className="h-full">
            <div className={cn(semanticSpacing.stack.md, 'pr-2')}>
              {/* Header Info */}
              <div className={cn(semanticSpacing.gap.sm, 'flex items-start')}>
                {data.avatar && (
                  <Avatar className="size-12">
                    <AvatarImage src={data.avatar} />
                    <AvatarFallback>
                      {(data.name || data.title || '').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className={cn(semanticTypography.h4, semanticTypography.h4, 'truncate')}>
                    {data.name || data.title}
                  </h3>
                  {data.subtitle && (
                    <p className={cn(semanticTypography.body, 'text-muted-foreground')}>
                      {data.subtitle}
                    </p>
                  )}
                  <div
                    className={cn(
                      semanticSpacing.gap.xs,
                      semanticSpacing.topGap.xs,
                      'flex items-center'
                    )}
                  >
                    {data.status && <Badge variant="outline">{data.status}</Badge>}
                    {data.priority && (
                      <Badge
                        variant={
                          data.priority === 'high'
                            ? 'destructive'
                            : data.priority === 'medium'
                              ? 'default'
                              : 'secondary'
                        }
                      >
                        {data.priority}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Fields */}
              <div className={cn(semanticSpacing.gap.md, 'grid')}>
                {config.fields.map((field) => {
                  const value = data[field.key]
                  if (!value) return null

                  return (
                    <div
                      key={field.key}
                      className={cn(semanticSpacing.gap.sm, 'flex items-center')}
                    >
                      <field.icon className="size-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className={cn(semanticTypography.body, 'text-muted-foreground')}>
                          {field.label}
                        </div>
                        <div className={cn(semanticTypography.label, 'truncate')}>
                          {field.key === 'price' || field.key === 'value'
                            ? typeof value === 'number'
                              ? `$${value.toLocaleString()}`
                              : value
                            : value}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Description/Notes */}
              {data.description && (
                <>
                  <Separator />
                  <div>
                    <h4 className={cn(semanticTypography.label, semanticSpacing.bottomGap.xs)}>
                      Description
                    </h4>
                    <p
                      className={cn(
                        semanticTypography.body,
                        'text-muted-foreground whitespace-pre-wrap'
                      )}
                    >
                      {data.description}
                    </p>
                  </div>
                </>
              )}

              {/* Tags */}
              {data.tags && data.tags.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className={cn(semanticTypography.label, semanticSpacing.bottomGap.xs)}>
                      Tags
                    </h4>
                    <div className={cn(semanticSpacing.gap.xs, 'flex flex-wrap')}>
                      {data.tags.map((tag: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className={`${semanticTypography.caption}`}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Metadata */}
              <Separator />
              <div
                className={cn(
                  semanticTypography.caption,
                  semanticSpacing.stack.xs,
                  'text-muted-foreground'
                )}
              >
                {data.createdAt && (
                  <div>Created: {new Date(data.createdAt).toLocaleDateString()}</div>
                )}
                {data.updatedAt && (
                  <div>Updated: {new Date(data.updatedAt).toLocaleDateString()}</div>
                )}
                {data.createdBy && <div>Created by: {data.createdBy}</div>}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent
          value="activity"
          className={cn(semanticSpacing.stack.md, semanticSpacing.topGap.sm)}
        >
          <ScrollArea className="h-full">
            <div className={cn(semanticSpacing.stack.sm, 'pr-2')}>
              {activities.length === 0 ? (
                <div className={cn(semanticSpacing.pageY, 'text-center text-muted-foreground')}>
                  <History
                    className={cn(semanticSpacing.bottomGap.xs, 'size-8 mx-auto opacity-50')}
                  />
                  <p className={`${semanticTypography.body}`}>No activity yet</p>
                </div>
              ) : (
                activities.map((activity) => (
                  <div
                    key={activity.id}
                    className={cn(
                      semanticSpacing.gap.sm,
                      semanticSpacing.compact,
                      semanticRadius.large,
                      'flex items-start border'
                    )}
                  >
                    {activity.user?.avatar ? (
                      <Avatar className="size-6">
                        <AvatarImage src={activity.user.avatar} />
                        <AvatarFallback className={`${semanticTypography.caption}`}>
                          {activity.user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div
                        className={cn(
                          semanticRadius.full,
                          'size-6 bg-muted flex items-center justify-center'
                        )}
                      >
                        <MessageSquare className="size-3" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className={cn(semanticTypography.body, semanticTypography.label)}>
                          {activity.title}
                        </h5>
                        <span className={cn(semanticTypography.caption, 'text-muted-foreground')}>
                          {activity.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      {activity.description && (
                        <p className={cn(semanticTypography.caption, 'text-muted-foreground mt-1')}>
                          {activity.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent
          value="related"
          className={cn(semanticSpacing.stack.md, semanticSpacing.topGap.sm)}
        >
          <ScrollArea className="h-full">
            <div className={cn(semanticSpacing.stack.md, 'pr-2')}>
              <div className={cn(semanticSpacing.pageY, 'text-center text-muted-foreground')}>
                <ExternalLink
                  className={cn(semanticSpacing.bottomGap.xs, 'size-8 mx-auto opacity-50')}
                />
                <p className={`${semanticTypography.body}`}>Related items will appear here</p>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </CRMSheet>
  )
}

// Filter Sheet
export interface FilterOption {
  id: string
  label: string
  type: 'select' | 'multiselect' | 'range' | 'date' | 'text'
  options?: Array<{ value: string; label: string }>
  value?: any
}

export interface FilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  filters: FilterOption[]
  onApply: (filters: Record<string, any>) => void
  onReset: () => void
  activeFilters?: Record<string, any>
}

export function FilterSheet({
  open,
  onOpenChange,
  title = 'Filters',
  filters,
  onApply,
  onReset,
  activeFilters = {},
}: FilterSheetProps) {
  const [localFilters, setLocalFilters] = useState(activeFilters)
  const [hasChanges, setHasChanges] = useState(false)

  const handleFilterChange = (filterId: string, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [filterId]: value }))
    setHasChanges(true)
  }

  const handleApply = () => {
    onApply(localFilters)
    setHasChanges(false)
    onOpenChange(false)
  }

  const handleReset = () => {
    setLocalFilters({})
    onReset()
    setHasChanges(true)
  }

  const activeCount = Object.values(localFilters).filter(
    (v) => v !== undefined && v !== null && v !== '' && (Array.isArray(v) ? v.length > 0 : true)
  ).length

  return (
    <CRMSheet
      open={open}
      onOpenChange={onOpenChange}
      side="right"
      title={`${title}${activeCount > 0 ? ` (${activeCount})` : ''}`}
      subtitle="Filter and refine your data"
      type="filters"
      actions={
        <div className={cn(semanticSpacing.gap.xs, 'flex items-center w-full')}>
          <Button variant="outline" size="sm" onClick={handleReset}>
            Clear All
          </Button>
          <Button size="sm" onClick={handleApply} disabled={!hasChanges}>
            Apply Filters
          </Button>
        </div>
      }
    >
      <ScrollArea className="h-full">
        <div className={cn(semanticSpacing.stack.md, 'pr-2')}>
          {filters.map((filter) => (
            <div key={filter.id} className={`${semanticSpacing.stack.xs}`}>
              <Label htmlFor={filter.id}>{filter.label}</Label>

              {filter.type === 'text' && (
                <Input
                  id={filter.id}
                  value={localFilters[filter.id] || ''}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  placeholder={`Filter by ${filter.label.toLowerCase()}`}
                />
              )}

              {filter.type === 'select' && (
                <select
                  id={filter.id}
                  className={cn(
                    semanticSpacing.compactX,
                    semanticSpacing.compactY,
                    semanticTypography.body,
                    semanticRadius.default,
                    'w-full border border-input bg-background'
                  )}
                  value={localFilters[filter.id] || ''}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                >
                  <option value="">All</option>
                  {filter.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}

              {/* Add other filter types as needed */}
            </div>
          ))}
        </div>
      </ScrollArea>
    </CRMSheet>
  )
}

// Quick Actions Sheet
export interface QuickActionsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  actions: Array<{
    id: string
    label: string
    description?: string
    icon?: React.ComponentType<{ className?: string }>
    shortcut?: string
    variant?: 'default' | 'destructive' | 'secondary'
    onClick: () => void
  }>
  searchable?: boolean
}

export function QuickActionsSheet({
  open,
  onOpenChange,
  title = 'Quick Actions',
  actions,
  searchable = true,
}: QuickActionsSheetProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredActions = searchQuery
    ? actions.filter(
        (action) =>
          action.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          action.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : actions

  const handleActionClick = (action: any) => {
    action.onClick()
    onOpenChange(false)
  }

  return (
    <CRMSheet
      open={open}
      onOpenChange={onOpenChange}
      side="bottom"
      title={title}
      subtitle={`${actions.length} actions available`}
      className="sm:max-w-full"
    >
      <div className={`${semanticSpacing.stack.md}`}>
        {/* Search */}
        {searchable && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search actions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {/* Actions Grid */}
        <ScrollArea className="h-full max-h-96">
          <div
            className={cn(
              semanticSpacing.gap.xs,
              'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pr-2'
            )}
          >
            {filteredActions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant || 'outline'}
                className={cn(semanticSpacing.compact, 'h-auto justify-start')}
                onClick={() => handleActionClick(action)}
              >
                <div className={cn(semanticSpacing.gap.sm, 'flex items-center w-full')}>
                  {action.icon && <action.icon className="size-4 shrink-0" />}
                  <div className="min-w-0 flex-1 text-left">
                    <div className={cn(semanticTypography.label, semanticTypography.body)}>
                      {action.label}
                    </div>
                    {action.description && (
                      <div
                        className={cn(semanticTypography.caption, 'text-muted-foreground truncate')}
                      >
                        {action.description}
                      </div>
                    )}
                  </div>
                  {action.shortcut && (
                    <kbd
                      className={cn(
                        semanticSpacing.gap.xs,
                        semanticRadius.small,
                        semanticTypography.label,
                        'hidden sm:inline-flex h-5 select-none items-center border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground'
                      )}
                    >
                      {action.shortcut}
                    </kbd>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>

        {filteredActions.length === 0 && (
          <div className={cn(semanticSpacing.pageY, 'text-center text-muted-foreground')}>
            <Search className={cn(semanticSpacing.bottomGap.xs, 'size-8 mx-auto opacity-50')} />
            <p className={`${semanticTypography.body}`}>No actions found</p>
          </div>
        )}
      </div>
    </CRMSheet>
  )
}
