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
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Info,
  Settings,
  Filter,
  Search,
  Plus,
  Edit,
  Eye,
  MoreHorizontal,
  Clock,
  Star
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

// Modal Variants
const modalVariants = cva(
  "sm:max-w-lg",
  {
    variants: {
      size: {
        sm: "sm:max-w-md",
        md: "sm:max-w-lg",
        lg: "sm:max-w-2xl",
        xl: "sm:max-w-4xl",
        full: "sm:max-w-[95vw]"
      },
      type: {
        form: "sm:max-w-lg",
        confirmation: "sm:max-w-md",
        details: "sm:max-w-2xl",
        wizard: "sm:max-w-3xl",
        fullscreen: "sm:max-w-[95vw] sm:h-[95vh]"
      }
    },
    defaultVariants: {
      size: "md",
      type: "form"
    }
  }
)

// Base CRM Modal Props
export interface CRMModalProps extends VariantProps<typeof modalVariants> {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  actions?: React.ReactNode
  loading?: boolean
  error?: string
  className?: string
  showCloseButton?: boolean
}

// Base CRM Modal Component
export function CRMModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  actions,
  loading = false,
  error,
  size = 'md',
  type = 'form',
  className,
  showCloseButton = true,
  ...props
}: CRMModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(modalVariants({ size, type }), className)}
        showCloseButton={showCloseButton}
        {...props}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {title}
            {loading && (
              <div className="size-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
            )}
          </DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        
        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            <AlertTriangle className="size-4" />
            {error}
          </div>
        )}
        
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
        
        {actions && (
          <DialogFooter>
            {actions}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Confirmation Modal
export interface ConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  variant?: 'default' | 'destructive' | 'warning'
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  loading?: boolean
  icon?: React.ComponentType<{ className?: string }>
}

export function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  variant = 'default',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  icon: Icon
}: ConfirmationModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      // Error handling would be done by the calling component
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  const iconColor = variant === 'destructive' 
    ? 'text-destructive' 
    : variant === 'warning' 
    ? 'text-yellow-600' 
    : 'text-primary'

  const confirmVariant = variant === 'destructive' ? 'destructive' : 'default'

  return (
    <CRMModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      type="confirmation"
      actions={
        <>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading || loading}>
            {cancelLabel}
          </Button>
          <Button 
            variant={confirmVariant} 
            onClick={handleConfirm} 
            disabled={isLoading || loading}
          >
            {(isLoading || loading) && (
              <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
            )}
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4 py-4">
        {Icon && (
          <div className={cn('shrink-0', iconColor)}>
            <Icon className="size-6" />
          </div>
        )}
        <div className="text-sm text-muted-foreground">
          {description}
        </div>
      </div>
    </CRMModal>
  )
}

// Multi-step Wizard Modal
export interface WizardStep {
  id: string
  title: string
  description?: string
  content: React.ReactNode
  validation?: () => boolean | Promise<boolean>
  optional?: boolean
}

export interface WizardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  steps: WizardStep[]
  onComplete: (data: any) => void | Promise<void>
  onStepChange?: (stepIndex: number, stepId: string) => void
  showProgress?: boolean
  allowSkipOptional?: boolean
}

export function WizardModal({
  open,
  onOpenChange,
  title,
  description,
  steps,
  onComplete,
  onStepChange,
  showProgress = true,
  allowSkipOptional = true
}: WizardModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [stepData, setStepData] = useState<Record<string, any>>({})

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1
  const currentStepConfig = steps[currentStep]

  const handleNext = async () => {
    if (currentStepConfig.validation) {
      const isValid = await currentStepConfig.validation()
      if (!isValid) return
    }

    if (isLastStep) {
      setLoading(true)
      try {
        await onComplete(stepData)
        onOpenChange(false)
        setCurrentStep(0)
        setStepData({})
      } catch (error) {
        // Error handling
      } finally {
        setLoading(false)
      }
    } else {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      onStepChange?.(nextStep, steps[nextStep].id)
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      onStepChange?.(prevStep, steps[prevStep].id)
    }
  }

  const handleSkip = () => {
    if (currentStepConfig.optional && allowSkipOptional) {
      handleNext()
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <CRMModal
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) {
          setCurrentStep(0)
          setStepData({})
        }
      }}
      title={title}
      description={description}
      type="wizard"
      loading={loading}
      actions={
        <>
          <div className="flex items-center gap-2 mr-auto">
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
            {currentStepConfig.optional && (
              <Badge variant="outline" className="text-xs">Optional</Badge>
            )}
          </div>
          
          <Button 
            variant="outline" 
            onClick={handlePrevious} 
            disabled={isFirstStep || loading}
          >
            <ChevronLeft className="size-4 mr-1" />
            Previous
          </Button>
          
          {currentStepConfig.optional && allowSkipOptional && (
            <Button variant="ghost" onClick={handleSkip} disabled={loading}>
              Skip
            </Button>
          )}
          
          <Button onClick={handleNext} disabled={loading}>
            {loading && (
              <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
            )}
            {isLastStep ? 'Complete' : 'Next'}
            {!isLastStep && <ChevronRight className="size-4 ml-1" />}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Progress */}
        {showProgress && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{currentStepConfig.title}</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="py-4">
          <div className="mb-4">
            <h3 className="font-medium">{currentStepConfig.title}</h3>
            {currentStepConfig.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {currentStepConfig.description}
              </p>
            )}
          </div>
          
          <div className="space-y-4">
            {currentStepConfig.content}
          </div>
        </div>
      </div>
    </CRMModal>
  )
}

// Entity Form Modal
export interface EntityFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityType: 'contact' | 'organization' | 'product' | 'opportunity' | 'interaction'
  mode: 'create' | 'edit'
  data?: any
  onSave: (data: any) => void | Promise<void>
  loading?: boolean
  fields?: Array<{
    id: string
    label: string
    type: 'text' | 'email' | 'phone' | 'select' | 'textarea' | 'date' | 'number'
    required?: boolean
    options?: Array<{ value: string; label: string }>
    placeholder?: string
  }>
}

export function EntityFormModal({
  open,
  onOpenChange,
  entityType,
  mode,
  data,
  onSave,
  loading = false,
  fields = []
}: EntityFormModalProps) {
  const [formData, setFormData] = useState(data || {})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const entityConfig = {
    contact: { icon: Users, title: 'Contact', color: 'text-blue-600' },
    organization: { icon: Building, title: 'Organization', color: 'text-green-600' },
    product: { icon: Package, title: 'Product', color: 'text-purple-600' },
    opportunity: { icon: TrendingUp, title: 'Opportunity', color: 'text-orange-600' },
    interaction: { icon: MessageSquare, title: 'Interaction', color: 'text-teal-600' }
  }

  const config = entityConfig[entityType]
  const IconComponent = config.icon

  const handleSave = async () => {
    // Basic validation
    const newErrors: Record<string, string> = {}
    fields.forEach(field => {
      if (field.required && !formData[field.id]) {
        newErrors[field.id] = `${field.label} is required`
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await onSave(formData)
      onOpenChange(false)
      setFormData({})
      setErrors({})
    } catch (error) {
      // Error handling would be done by parent
    }
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }))
    }
  }

  const renderField = (field: any) => {
    const hasError = !!errors[field.id]
    
    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={hasError ? 'border-destructive' : ''}
            rows={3}
          />
        )
      
      case 'select':
        return (
          <Select 
            value={formData[field.id] || ''} 
            onValueChange={(value) => handleFieldChange(field.id, value)}
          >
            <SelectTrigger className={hasError ? 'border-destructive' : ''}>
              <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      
      default:
        return (
          <Input
            type={field.type}
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={hasError ? 'border-destructive' : ''}
          />
        )
    }
  }

  return (
    <CRMModal
      open={open}
      onOpenChange={onOpenChange}
      title={
        <div className="flex items-center gap-2">
          <IconComponent className={cn('size-5', config.color)} />
          {mode === 'create' ? 'Create' : 'Edit'} {config.title}
        </div>
      }
      description={
        mode === 'create' 
          ? `Add a new ${config.title.toLowerCase()} to your CRM`
          : `Update ${config.title.toLowerCase()} information`
      }
      type="form"
      loading={loading}
      actions={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && (
              <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
            )}
            <Save className="size-4 mr-1" />
            {mode === 'create' ? 'Create' : 'Save Changes'}
          </Button>
        </>
      }
    >
      <ScrollArea className="max-h-[60vh]">
        <div className="space-y-4 pr-2">
          {fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id} className="flex items-center gap-1">
                {field.label}
                {field.required && <span className="text-destructive">*</span>}
              </Label>
              {renderField(field)}
              {errors[field.id] && (
                <p className="text-sm text-destructive">{errors[field.id]}</p>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </CRMModal>
  )
}

// Bulk Actions Modal
export interface BulkActionsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedItems: Array<{
    id: string
    name: string
    type?: string
  }>
  actions: Array<{
    id: string
    label: string
    icon?: React.ComponentType<{ className?: string }>
    variant?: 'default' | 'destructive' | 'warning'
    description?: string
    confirmationRequired?: boolean
    onExecute: (items: any[]) => void | Promise<void>
  }>
}

export function BulkActionsModal({
  open,
  onOpenChange,
  selectedItems,
  actions
}: BulkActionsModalProps) {
  const [selectedAction, setSelectedAction] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const currentAction = actions.find(action => action.id === selectedAction)

  const handleExecute = async () => {
    if (!currentAction) return

    if (currentAction.confirmationRequired && !showConfirmation) {
      setShowConfirmation(true)
      return
    }

    setLoading(true)
    try {
      await currentAction.onExecute(selectedItems)
      onOpenChange(false)
      setSelectedAction('')
      setShowConfirmation(false)
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false)
    }
  }

  return (
    <CRMModal
      open={open}
      onOpenChange={onOpenChange}
      title={`Bulk Actions (${selectedItems.length} selected)`}
      description="Choose an action to apply to all selected items"
      type="form"
      loading={loading}
      actions={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleExecute} 
            disabled={!selectedAction || loading}
            variant={currentAction?.variant === 'destructive' ? 'destructive' : 'default'}
          >
            {loading && (
              <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
            )}
            {showConfirmation ? 'Confirm Action' : 'Execute'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Selected Items Summary */}
        <div className="border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Selected Items</span>
            <Badge variant="outline">{selectedItems.length}</Badge>
          </div>
          <div className="text-xs text-muted-foreground max-h-20 overflow-y-auto">
            {selectedItems.slice(0, 5).map((item, index) => (
              <div key={item.id}>
                {item.name} {item.type && `(${item.type})`}
              </div>
            ))}
            {selectedItems.length > 5 && (
              <div>...and {selectedItems.length - 5} more</div>
            )}
          </div>
        </div>

        {/* Action Selection */}
        <div className="space-y-3">
          <Label>Choose Action</Label>
          <div className="grid gap-2">
            {actions.map((action) => (
              <div key={action.id} className="flex items-center space-x-2">
                <Checkbox
                  id={action.id}
                  checked={selectedAction === action.id}
                  onCheckedChange={(checked) => {
                    setSelectedAction(checked ? action.id : '')
                    setShowConfirmation(false)
                  }}
                />
                <label
                  htmlFor={action.id}
                  className="flex items-center gap-2 cursor-pointer flex-1 text-sm"
                >
                  {action.icon && <action.icon className="size-4" />}
                  <span>{action.label}</span>
                  {action.variant === 'destructive' && (
                    <Badge variant="destructive" className="text-xs">Destructive</Badge>
                  )}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Action Description */}
        {currentAction?.description && (
          <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">
            {currentAction.description}
          </div>
        )}

        {/* Confirmation Warning */}
        {showConfirmation && currentAction && (
          <div className="flex items-start gap-2 p-3 text-sm text-orange-800 bg-orange-50 rounded-md border border-orange-200 dark:bg-orange-950/20 dark:text-orange-200 dark:border-orange-900">
            <AlertTriangle className="size-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Confirm Action</p>
              <p>
                Are you sure you want to execute "{currentAction.label}" on {selectedItems.length} items? 
                This action cannot be undone.
              </p>
            </div>
          </div>
        )}
      </div>
    </CRMModal>
  )
}