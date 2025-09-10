import React, { useState } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
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
  Info
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
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
const sheetVariants = cva(
  "w-full sm:max-w-sm",
  {
    variants: {
      size: {
        sm: "sm:max-w-sm",
        md: "sm:max-w-md", 
        lg: "sm:max-w-lg",
        xl: "sm:max-w-xl",
        wide: "sm:max-w-2xl"
      },
      type: {
        details: "sm:max-w-lg",
        form: "sm:max-w-md",
        filters: "sm:max-w-sm",
        activity: "sm:max-w-md"
      }
    },
    defaultVariants: {
      size: "md",
      type: "details"
    }
  }
)

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
      <SheetContent 
        side={side} 
        className={cn(sheetVariants({ size, type }), className)}
        {...props}
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {title}
            {loading && (
              <div className="size-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
            )}
          </SheetTitle>
          {subtitle && (
            <SheetDescription>{subtitle}</SheetDescription>
          )}
        </SheetHeader>
        
        <div className="flex-1 overflow-hidden py-4">
          {children}
        </div>
        
        {actions && (
          <SheetFooter>
            {actions}
          </SheetFooter>
        )}
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
  activities = []
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
        { key: 'position', label: 'Position', icon: FileText }
      ]
    },
    organization: { 
      icon: Building, 
      title: 'Organization', 
      color: 'text-green-600',
      fields: [
        { key: 'website', label: 'Website', icon: Globe },
        { key: 'phone', label: 'Phone', icon: Phone },
        { key: 'address', label: 'Address', icon: MapPin },
        { key: 'employees', label: 'Employees', icon: Users }
      ]
    },
    product: { 
      icon: Package, 
      title: 'Product', 
      color: 'text-purple-600',
      fields: [
        { key: 'price', label: 'Price', icon: DollarSign },
        { key: 'category', label: 'Category', icon: Tag },
        { key: 'status', label: 'Status', icon: CheckCircle },
        { key: 'sku', label: 'SKU', icon: FileText }
      ]
    },
    opportunity: { 
      icon: TrendingUp, 
      title: 'Opportunity', 
      color: 'text-orange-600',
      fields: [
        { key: 'value', label: 'Value', icon: DollarSign },
        { key: 'stage', label: 'Stage', icon: Target },
        { key: 'probability', label: 'Probability', icon: TrendingUp },
        { key: 'closeDate', label: 'Close Date', icon: Calendar }
      ]
    },
    interaction: { 
      icon: MessageSquare, 
      title: 'Interaction', 
      color: 'text-teal-600',
      fields: [
        { key: 'type', label: 'Type', icon: MessageSquare },
        { key: 'duration', label: 'Duration', icon: Clock },
        { key: 'outcome', label: 'Outcome', icon: CheckCircle },
        { key: 'followUp', label: 'Follow Up', icon: Calendar }
      ]
    }
  }

  const config = entityConfig[entityType]
  const IconComponent = config.icon

  return (
    <CRMSheet
      open={open}
      onOpenChange={onOpenChange}
      title={
        <div className="flex items-center gap-2">
          <IconComponent className={cn('size-5', config.color)} />
          {data.name || data.title || 'Details'}
        </div>
      }
      subtitle={config.title}
      type="details"
      size="lg"
      loading={loading}
      actions={
        <div className="flex items-center gap-2 w-full">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="size-4 mr-1" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="size-4 mr-1" />
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
        
        <TabsContent value="details" className="space-y-4 mt-4">
          <ScrollArea className="h-full">
            <div className="space-y-4 pr-2">
              {/* Header Info */}
              <div className="flex items-start gap-3">
                {data.avatar && (
                  <Avatar className="size-12">
                    <AvatarImage src={data.avatar} />
                    <AvatarFallback>
                      {(data.name || data.title || '').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">
                    {data.name || data.title}
                  </h3>
                  {data.subtitle && (
                    <p className="text-muted-foreground text-sm">{data.subtitle}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {data.status && (
                      <Badge variant="outline">{data.status}</Badge>
                    )}
                    {data.priority && (
                      <Badge variant={
                        data.priority === 'high' ? 'destructive' :
                        data.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {data.priority}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Fields */}
              <div className="grid gap-4">
                {config.fields.map((field) => {
                  const value = data[field.key]
                  if (!value) return null

                  return (
                    <div key={field.key} className="flex items-center gap-3">
                      <field.icon className="size-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-muted-foreground">{field.label}</div>
                        <div className="font-medium truncate">
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
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
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
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {data.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Metadata */}
              <Separator />
              <div className="text-xs text-muted-foreground space-y-1">
                {data.createdAt && (
                  <div>Created: {new Date(data.createdAt).toLocaleDateString()}</div>
                )}
                {data.updatedAt && (
                  <div>Updated: {new Date(data.updatedAt).toLocaleDateString()}</div>
                )}
                {data.createdBy && (
                  <div>Created by: {data.createdBy}</div>
                )}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4 mt-4">
          <ScrollArea className="h-full">
            <div className="space-y-3 pr-2">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="size-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No activity yet</p>
                </div>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    {activity.user?.avatar ? (
                      <Avatar className="size-6">
                        <AvatarImage src={activity.user.avatar} />
                        <AvatarFallback className="text-xs">
                          {activity.user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="size-6 rounded-full bg-muted flex items-center justify-center">
                        <MessageSquare className="size-3" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium">{activity.title}</h5>
                        <span className="text-xs text-muted-foreground">
                          {activity.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      {activity.description && (
                        <p className="text-xs text-muted-foreground mt-1">
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

        <TabsContent value="related" className="space-y-4 mt-4">
          <ScrollArea className="h-full">
            <div className="space-y-4 pr-2">
              <div className="text-center py-8 text-muted-foreground">
                <ExternalLink className="size-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Related items will appear here</p>
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
  activeFilters = {}
}: FilterSheetProps) {
  const [localFilters, setLocalFilters] = useState(activeFilters)
  const [hasChanges, setHasChanges] = useState(false)

  const handleFilterChange = (filterId: string, value: any) => {
    setLocalFilters(prev => ({ ...prev, [filterId]: value }))
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

  const activeCount = Object.values(localFilters).filter(v => 
    v !== undefined && v !== null && v !== '' && 
    (Array.isArray(v) ? v.length > 0 : true)
  ).length

  return (
    <CRMSheet
      open={open}
      onOpenChange={onOpenChange}
      side="right"
      title={
        <div className="flex items-center gap-2">
          <Filter className="size-5" />
          {title}
          {activeCount > 0 && (
            <Badge variant="default" className="text-xs">
              {activeCount}
            </Badge>
          )}
        </div>
      }
      subtitle="Filter and refine your data"
      type="filters"
      actions={
        <div className="flex items-center gap-2 w-full">
          <Button variant="outline" size="sm" onClick={handleReset}>
            Clear All
          </Button>
          <Button 
            size="sm" 
            onClick={handleApply}
            disabled={!hasChanges}
          >
            Apply Filters
          </Button>
        </div>
      }
    >
      <ScrollArea className="h-full">
        <div className="space-y-4 pr-2">
          {filters.map((filter) => (
            <div key={filter.id} className="space-y-2">
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
                  className="w-full px-3 py-2 text-sm border border-input bg-background rounded-md"
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
  searchable = true
}: QuickActionsSheetProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredActions = searchQuery
    ? actions.filter(action =>
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
      <div className="space-y-4">
        {/* Search */}
        {searchable && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pr-2">
            {filteredActions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant || 'outline'}
                className="h-auto p-3 justify-start"
                onClick={() => handleActionClick(action)}
              >
                <div className="flex items-center gap-3 w-full">
                  {action.icon && <action.icon className="size-4 shrink-0" />}
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium text-sm">{action.label}</div>
                    {action.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {action.description}
                      </div>
                    )}
                  </div>
                  {action.shortcut && (
                    <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                      {action.shortcut}
                    </kbd>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>

        {filteredActions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="size-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No actions found</p>
          </div>
        )}
      </div>
    </CRMSheet>
  )
}