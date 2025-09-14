import React, { useState } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { semanticSpacing, semanticRadius, semanticTypography } from '@/styles/tokens'
import {
  Users,
  Building,
  Package,
  TrendingUp,
  MessageSquare,
  Save,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
// Removed unused: import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

// Modal Variants
const modalVariants = cva('sm:max-w-lg', {
  variants: {
    size: {
      sm: 'sm:max-w-md',
      md: 'sm:max-w-lg',
      lg: 'sm:max-w-2xl',
      xl: 'sm:max-w-4xl',
      full: 'sm:max-w-[95vw]',
    },
    type: {
      form: 'sm:max-w-lg',
      confirmation: 'sm:max-w-md',
      details: 'sm:max-w-2xl',
      wizard: 'sm:max-w-3xl',
      fullscreen: 'sm:h-[95vh] sm:max-w-[95vw]',
    },
  },
  defaultVariants: {
    size: 'md',
    type: 'form',
  },
})

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
          <DialogTitle className={cn(semanticSpacing.gap.xs, 'flex items-center')}>
            {title}
            {loading && (
              <div
                className={cn(
                  semanticRadius.full,
                  'size-4 animate-spin border-2 border-muted border-t-primary'
                )}
              />
            )}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {error && (
          <div
            className={cn(
              semanticSpacing.gap.xs,
              semanticSpacing.compact,
              semanticTypography.body,
              semanticRadius.default,
              'flex items-center text-destructive bg-destructive/10'
            )}
          >
            <AlertTriangle className="size-4" />
            {error}
          </div>
        )}

        <div className="flex-1 overflow-hidden">{children}</div>

        {actions && <DialogFooter>{actions}</DialogFooter>}
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
  icon: Icon,
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

  const iconColor =
    variant === 'destructive'
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
          <Button variant={confirmVariant} onClick={handleConfirm} disabled={isLoading || loading}>
            {(isLoading || loading) && (
              <div
                className={cn(
                  semanticRadius.full,
                  semanticSpacing.rightGap.xs,
                  'size-4 animate-spin border-2 border-current border-t-transparent'
                )}
              />
            )}
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className={cn(semanticSpacing.gap.md, semanticSpacing.cardY, 'flex items-start')}>
        {Icon && (
          <div className={cn('shrink-0', iconColor)}>
            <Icon className="size-6" />
          </div>
        )}
        <div className={cn(semanticTypography.body, 'text-muted-foreground')}>{description}</div>
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
  allowSkipOptional = true,
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
          <div className={cn(semanticSpacing.gap.xs, 'flex items-center mr-auto')}>
            <span className={cn(semanticTypography.body, 'text-muted-foreground')}>
              Step {currentStep + 1} of {steps.length}
            </span>
            {currentStepConfig.optional && (
              <Badge variant="outline" className={`${semanticTypography.caption}`}>
                Optional
              </Badge>
            )}
          </div>

          <Button variant="outline" onClick={handlePrevious} disabled={isFirstStep || loading}>
            <ChevronLeft className="mr-1 size-4" />
            Previous
          </Button>

          {currentStepConfig.optional && allowSkipOptional && (
            <Button variant="ghost" onClick={handleSkip} disabled={loading}>
              Skip
            </Button>
          )}

          <Button onClick={handleNext} disabled={loading}>
            {loading && (
              <div
                className={cn(
                  semanticRadius.full,
                  semanticSpacing.rightGap.xs,
                  'size-4 animate-spin border-2 border-current border-t-transparent'
                )}
              />
            )}
            {isLastStep ? 'Complete' : 'Next'}
            {!isLastStep && <ChevronRight className="ml-1 size-4" />}
          </Button>
        </>
      }
    >
      <div className={`${semanticSpacing.stack.md}`}>
        {/* Progress */}
        {showProgress && (
          <div className={`${semanticSpacing.stack.xs}`}>
            <Progress value={progress} className="w-full" />
            <div
              className={cn(
                semanticTypography.caption,
                'flex justify-between text-muted-foreground'
              )}
            >
              <span>{currentStepConfig.title}</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className={`${semanticSpacing.cardY}`}>
          <div className={`${semanticSpacing.bottomGap.sm}`}>
            <h3 className={`${semanticTypography.label}`}>{currentStepConfig.title}</h3>
            {currentStepConfig.description && (
              <p className={cn(semanticTypography.body, 'text-muted-foreground mt-1')}>
                {currentStepConfig.description}
              </p>
            )}
          </div>

          <div className={`${semanticSpacing.stack.md}`}>{currentStepConfig.content}</div>
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
  fields = [],
}: EntityFormModalProps) {
  const [formData, setFormData] = useState(data || {})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const entityConfig = {
    contact: { icon: Users, title: 'Contact', color: 'text-blue-600' },
    organization: { icon: Building, title: 'Organization', color: 'text-green-600' },
    product: { icon: Package, title: 'Product', color: 'text-purple-600' },
    opportunity: { icon: TrendingUp, title: 'Opportunity', color: 'text-orange-600' },
    interaction: { icon: MessageSquare, title: 'Interaction', color: 'text-teal-600' },
  }

  const config = entityConfig[entityType]
  const IconComponent = config.icon

  const handleSave = async () => {
    // Basic validation
    const newErrors: Record<string, string> = {}
    fields.forEach((field) => {
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
    setFormData((prev: Record<string, any>) => ({ ...prev, [fieldId]: value }))
    if (errors[fieldId]) {
      setErrors((prev: Record<string, string>) => ({ ...prev, [fieldId]: '' }))
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
      title={`${mode === 'create' ? 'Create' : 'Edit'} ${config.title}`}
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
              <div
                className={cn(
                  semanticRadius.full,
                  semanticSpacing.rightGap.xs,
                  'size-4 animate-spin border-2 border-current border-t-transparent'
                )}
              />
            )}
            <Save className="mr-1 size-4" />
            {mode === 'create' ? 'Create' : 'Save Changes'}
          </Button>
        </>
      }
    >
      <ScrollArea className="max-h-[60vh]">
        <div className={cn(semanticSpacing.stack.md, 'pr-2')}>
          {fields.map((field) => (
            <div key={field.id} className={`${semanticSpacing.stack.xs}`}>
              <Label htmlFor={field.id} className={cn(semanticSpacing.gap.xs, 'flex items-center')}>
                {field.label}
                {field.required && <span className="text-destructive">*</span>}
              </Label>
              {renderField(field)}
              {errors[field.id] && (
                <p className={cn(semanticTypography.body, 'text-destructive')}>
                  {errors[field.id]}
                </p>
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
  actions,
}: BulkActionsModalProps) {
  const [selectedAction, setSelectedAction] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const currentAction = actions.find((action) => action.id === selectedAction)

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
              <div
                className={cn(
                  semanticRadius.full,
                  semanticSpacing.rightGap.xs,
                  'size-4 animate-spin border-2 border-current border-t-transparent'
                )}
              />
            )}
            {showConfirmation ? 'Confirm Action' : 'Execute'}
          </Button>
        </>
      }
    >
      <div className={`${semanticSpacing.stack.md}`}>
        {/* Selected Items Summary */}
        <div className={cn(semanticRadius.large, semanticSpacing.compact, 'border')}>
          <div className={cn(semanticSpacing.bottomGap.xs, 'flex items-center justify-between')}>
            <span className={cn(semanticTypography.body, semanticTypography.label)}>
              Selected Items
            </span>
            <Badge variant="outline">{selectedItems.length}</Badge>
          </div>
          <div
            className={cn(
              semanticTypography.caption,
              'text-muted-foreground max-h-20 overflow-y-auto'
            )}
          >
            {selectedItems.slice(0, 5).map((item) => (
              <div key={item.id}>
                {item.name} {item.type && `(${item.type})`}
              </div>
            ))}
            {selectedItems.length > 5 && <div>...and {selectedItems.length - 5} more</div>}
          </div>
        </div>

        {/* Action Selection */}
        <div className={`${semanticSpacing.stack.sm}`}>
          <Label>Choose Action</Label>
          <div className={cn(semanticSpacing.gap.xs, 'grid')}>
            {actions.map((action) => (
              <div key={action.id} className={cn(semanticSpacing.inline.xs, 'flex items-center')}>
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
                  className={cn(
                    semanticSpacing.gap.xs,
                    semanticTypography.body,
                    'flex items-center cursor-pointer flex-1'
                  )}
                >
                  {action.icon && <action.icon className="size-4" />}
                  <span>{action.label}</span>
                  {action.variant === 'destructive' && (
                    <Badge variant="destructive" className={`${semanticTypography.caption}`}>
                      Destructive
                    </Badge>
                  )}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Action Description */}
        {currentAction?.description && (
          <div
            className={cn(
              semanticTypography.body,
              semanticSpacing.compact,
              semanticRadius.default,
              'text-muted-foreground bg-muted/50'
            )}
          >
            {currentAction.description}
          </div>
        )}

        {/* Confirmation Warning */}
        {showConfirmation && currentAction && (
          <div
            className={cn(
              semanticSpacing.gap.xs,
              semanticSpacing.compact,
              semanticTypography.body,
              semanticRadius.default,
              'flex items-start text-orange-800 bg-orange-50 border border-orange-200 dark:bg-orange-950/20 dark:text-orange-200 dark:border-orange-900'
            )}
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className={`${semanticTypography.label}`}>Confirm Action</p>
              <p>
                Are you sure you want to execute "{currentAction.label}" on {selectedItems.length}{' '}
                items? This action cannot be undone.
              </p>
            </div>
          </div>
        )}
      </div>
    </CRMModal>
  )
}
