import React, { useState, useMemo } from 'react'
import { useForm, UseFormReturn, FieldValues } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
// Removed banned components: Collapsible, Tooltip per optimization guidelines
import { cn } from '@/lib/utils'

// ===== Core Interfaces =====

export interface CoreFormLayoutProps<T extends FieldValues> {
  // Form configuration
  title: string
  icon: React.ComponentType<{ className?: string }>
  formSchema: yup.ObjectSchema<T>
  onSubmit: (data: T) => void | Promise<void>
  
  // Data and state
  initialData?: Partial<T>
  loading?: boolean
  submitLabel?: string
  
  // Layout configuration
  entityType: 'organization' | 'contact' | 'product' | 'opportunity' | 'interaction'
  showAdvancedOptions?: boolean
  
  // Sections configuration
  coreSections: FormSection<T>[]
  optionalSections?: FormSection<T>[]
  contextualSections?: ConditionalSection<T>[]
}

export interface FormSection<T> {
  id: string
  title?: string
  description?: string
  fields: FormFieldConfig<T>[]
  layout?: 'single' | 'double' | 'triple' | 'auto'
  className?: string
}

export interface FormFieldConfig<T> {
  name: keyof T
  type: 'text' | 'select' | 'textarea' | 'switch' | 'checkbox' | 'number' | 'email' | 'tel' | 'url'
  label: string
  placeholder?: string
  description?: string
  required?: boolean
  options?: SelectOption[]
  tooltip?: string
  validation?: yup.Schema
  conditional?: (values: T) => boolean
  className?: string
}

export interface ConditionalSection<T> {
  condition: (values: T) => boolean
  section: FormSection<T>
}

export interface SelectOption {
  value: string
  label: string
  description?: string
  icon?: string
  badge?: { text: string; variant: string; className?: string }
}

// ===== Helper Components =====

interface FormFieldRendererProps<T extends FieldValues> {
  field: FormFieldConfig<T>
  form: UseFormReturn<T>
  loading: boolean
  className?: string
}

function FormFieldRenderer<T extends FieldValues>({ 
  field, 
  form, 
  loading, 
  className 
}: FormFieldRendererProps<T>) {
  const { name, type, label, placeholder, description, required, options, tooltip } = field
  
  return (
    <FormField
      control={form.control}
      name={name as string}
      render={({ field: formField }) => (
        <FormItem className={className}>
          <FormLabel className="flex items-center gap-2 text-base">
            {label}
            {required && <span className="text-red-500">*</span>}
            {tooltip && (
              <span className="text-xs text-gray-500 ml-1">
                ({tooltip})
              </span>
            )}
          </FormLabel>
          
          <FormControl>
            {renderFormControl(type, formField, placeholder, loading, options)}
          </FormControl>
          
          {description && (
            <FormDescription className="text-sm">
              {description}
            </FormDescription>
          )}
          
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function renderFormControl(
  type: FormFieldConfig<any>['type'],
  field: any,
  placeholder?: string,
  loading?: boolean,
  options?: SelectOption[]
) {
  switch (type) {
    case 'text':
    case 'email':
    case 'tel':
    case 'url':
    case 'number':
      return (
        <Input
          type={type}
          placeholder={placeholder}
          disabled={loading}
          className="h-12 text-base px-4 rounded-md border border-gray-300 
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                     disabled:bg-gray-50 disabled:text-gray-500"
          {...field}
        />
      )
      
    case 'textarea':
      return (
        <Textarea
          placeholder={placeholder}
          disabled={loading}
          rows={4}
          className="text-base p-4 rounded-md border border-gray-300 
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                     resize-none"
          {...field}
        />
      )
      
    case 'select':
      return (
        <Select 
          onValueChange={field.onChange} 
          defaultValue={field.value}
          disabled={loading}
        >
          <SelectTrigger className="h-12 text-base">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  {option.icon && <span>{option.icon}</span>}
                  <div>
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    )}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
      
    case 'switch':
      return (
        <Switch
          checked={field.value}
          onCheckedChange={field.onChange}
          disabled={loading}
        />
      )
      
    case 'checkbox':
      return (
        <Checkbox
          checked={field.value}
          onCheckedChange={field.onChange}
          disabled={loading}
        />
      )
      
    default:
      return (
        <Input
          placeholder={placeholder}
          disabled={loading}
          className="h-12 text-base px-4 rounded-md border border-gray-300 
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                     disabled:bg-gray-50 disabled:text-gray-500"
          {...field}
        />
      )
  }
}

interface FormSectionProps<T extends FieldValues> {
  section: FormSection<T>
  form: UseFormReturn<T>
  loading: boolean
  entityType: string
}

function FormSectionComponent<T extends FieldValues>({ 
  section, 
  form, 
  loading, 
  entityType 
}: FormSectionProps<T>) {
  const layoutClass = useMemo(() => {
    switch (section.layout) {
      case 'single': return 'space-y-4'
      case 'double': return 'grid grid-cols-1 md:grid-cols-2 gap-4'
      case 'triple': return 'grid grid-cols-1 md:grid-cols-3 gap-4'
      case 'auto': return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
      default: return 'space-y-4'
    }
  }, [section.layout])
  
  return (
    <div className={cn("space-y-6", section.className)}>
      {section.title && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">
            {section.title}
          </h3>
          {section.description && (
            <p className="text-sm text-gray-600">
              {section.description}
            </p>
          )}
        </div>
      )}
      
      <div className={layoutClass}>
        {section.fields.map((field) => (
          <FormFieldRenderer
            key={String(field.name)}
            field={field}
            form={form}
            loading={loading}
            className={field.className}
          />
        ))}
      </div>
    </div>
  )
}

interface ConditionalSectionRendererProps<T extends FieldValues> {
  condition: (values: T) => boolean
  section: FormSection<T>
  watchedValues: T
  form: UseFormReturn<T>
  loading: boolean
  entityType: string
}

function ConditionalSectionRenderer<T extends FieldValues>({
  condition,
  section,
  watchedValues,
  form,
  loading,
  entityType
}: ConditionalSectionRendererProps<T>) {
  const shouldShow = useMemo(() => condition(watchedValues), [condition, watchedValues])
  
  if (!shouldShow) return null
  
  return (
    <div className="p-4 rounded-lg border-l-4 bg-blue-50 border-blue-400">
      <FormSectionComponent
        section={section}
        form={form}
        loading={loading}
        entityType={entityType}
      />
    </div>
  )
}

// ===== Main Component =====

export function CoreFormLayout<T extends FieldValues>({
  title,
  icon: Icon,
  formSchema,
  onSubmit,
  initialData,
  loading = false,
  submitLabel = 'Save',
  entityType,
  showAdvancedOptions = false,
  coreSections,
  optionalSections = [],
  contextualSections = []
}: CoreFormLayoutProps<T>) {
  const [showOptionalSections, setShowOptionalSections] = useState(showAdvancedOptions)
  
  const form = useForm<T>({
    resolver: yupResolver(formSchema),
    defaultValues: initialData
  })
  
  const watchedValues = form.watch()
  
  const handleSubmit = (data: T) => {
    // Clean empty strings to null for optional fields
    const cleanData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        typeof value === 'string' && value.trim() === '' ? null : value
      ])
    ) as T
    
    onSubmit(cleanData)
  }
  
  return (
    <Card className="w-full max-w-4xl mx-auto bg-white rounded-lg border shadow-sm">
      <CardHeader className="p-6 border-b">
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
          <Icon className="h-5 w-5" />
          {initialData ? `Edit ${title}` : `New ${title}`}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            
            {/* Core Sections - Always Visible */}
            {coreSections.map((section) => (
              <FormSectionComponent
                key={section.id}
                section={section}
                form={form}
                loading={loading}
                entityType={entityType}
              />
            ))}
            
            {/* Contextual Sections - Conditionally Visible */}
            {contextualSections.map((conditionalSection, index) => (
              <ConditionalSectionRenderer
                key={`contextual-${index}`}
                condition={conditionalSection.condition}
                section={conditionalSection.section}
                watchedValues={watchedValues}
                form={form}
                loading={loading}
                entityType={entityType}
              />
            ))}
            
            {/* Optional Sections - Progressive Disclosure */}
            {optionalSections.length > 0 && (
              <div className="border-t border-gray-100 pt-6 space-y-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowOptionalSections(!showOptionalSections)}
                  className="h-12 w-full text-base font-medium"
                >
                  {showOptionalSections ? 'Hide' : 'Show'} Additional Details (Optional)
                </Button>
                
                {showOptionalSections && (
                  <div className="space-y-6 mt-6 p-4 bg-gray-50 rounded-lg">
                    {optionalSections.map((section) => (
                      <FormSectionComponent
                        key={section.id}
                        section={section}
                        form={form}
                        loading={loading}
                        entityType={entityType}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Notes Section - Universal */}
            <FormFieldRenderer
              field={{
                name: 'notes' as keyof T,
                type: 'textarea',
                label: 'Additional Notes',
                placeholder: `Any additional information about this ${entityType}...`,
                description: 'Internal notes, special requirements, relationship history, etc.'
              }}
              form={form}
              loading={loading}
              className="space-y-6"
            />
            
            {/* Submit Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              <Button 
                type="submit" 
                disabled={loading} 
                className="h-12 text-base px-6 rounded-md font-medium
                           focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-1"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </div>
                ) : (
                  submitLabel
                )}
              </Button>
              
              {initialData && (
                <Button 
                  type="button" 
                  variant="outline" 
                  className="h-12 text-base px-6 rounded-md font-medium
                             focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
              )}
            </div>
            
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default CoreFormLayout