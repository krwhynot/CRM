import React from 'react'
import { Control, FieldPath, FieldValues } from 'react-hook-form'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { 
  CalendarIcon, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  DollarSign,
  Building2,
  User,
  Package,
  Target,
  Plus,
  X
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

// Common field props interface
interface BaseFieldProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label: string
  description?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

// Text Input Field
export function TextFormField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  required,
  disabled,
  className
}: BaseFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className={required ? "after:content-['*'] after:ml-0.5 after:text-destructive" : undefined}>
            {label}
          </FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder}
              disabled={disabled}
              {...field}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Email Input Field
export function EmailFormField<T extends FieldValues>(props: BaseFieldProps<T>) {
  return (
    <FormField
      control={props.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className={props.className}>
          <FormLabel className={props.required ? "after:content-['*'] after:ml-0.5 after:text-destructive" : undefined}>
            {props.label}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder={props.placeholder || "name@example.com"}
                disabled={props.disabled}
                className="pl-9"
                {...field}
              />
            </div>
          </FormControl>
          {props.description && <FormDescription>{props.description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Phone Input Field
export function PhoneFormField<T extends FieldValues>(props: BaseFieldProps<T>) {
  return (
    <FormField
      control={props.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className={props.className}>
          <FormLabel className={props.required ? "after:content-['*'] after:ml-0.5 after:text-destructive" : undefined}>
            {props.label}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="tel"
                placeholder={props.placeholder || "+1 (555) 123-4567"}
                disabled={props.disabled}
                className="pl-9"
                {...field}
              />
            </div>
          </FormControl>
          {props.description && <FormDescription>{props.description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// URL Input Field
export function UrlFormField<T extends FieldValues>(props: BaseFieldProps<T>) {
  return (
    <FormField
      control={props.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className={props.className}>
          <FormLabel className={props.required ? "after:content-['*'] after:ml-0.5 after:text-destructive" : undefined}>
            {props.label}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="url"
                placeholder={props.placeholder || "https://example.com"}
                disabled={props.disabled}
                className="pl-9"
                {...field}
              />
            </div>
          </FormControl>
          {props.description && <FormDescription>{props.description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Currency Input Field
export function CurrencyFormField<T extends FieldValues>(props: BaseFieldProps<T> & { currency?: string }) {
  return (
    <FormField
      control={props.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className={props.className}>
          <FormLabel className={props.required ? "after:content-['*'] after:ml-0.5 after:text-destructive" : undefined}>
            {props.label}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                step="0.01"
                placeholder={props.placeholder || "0.00"}
                disabled={props.disabled}
                className="pl-9"
                {...field}
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
              />
              {props.currency && (
                <div className="absolute right-2.5 top-2.5 text-sm text-muted-foreground">
                  {props.currency}
                </div>
              )}
            </div>
          </FormControl>
          {props.description && <FormDescription>{props.description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Textarea Field
export function TextareaFormField<T extends FieldValues>(props: BaseFieldProps<T> & { rows?: number }) {
  return (
    <FormField
      control={props.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className={props.className}>
          <FormLabel className={props.required ? "after:content-['*'] after:ml-0.5 after:text-destructive" : undefined}>
            {props.label}
          </FormLabel>
          <FormControl>
            <Textarea
              placeholder={props.placeholder}
              disabled={props.disabled}
              rows={props.rows || 3}
              {...field}
            />
          </FormControl>
          {props.description && <FormDescription>{props.description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Select Field
export function SelectFormField<T extends FieldValues>(
  props: BaseFieldProps<T> & {
    options: Array<{ value: string; label: string; disabled?: boolean }>
    emptyText?: string
  }
) {
  return (
    <FormField
      control={props.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className={props.className}>
          <FormLabel className={props.required ? "after:content-['*'] after:ml-0.5 after:text-destructive" : undefined}>
            {props.label}
          </FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={props.disabled}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={props.placeholder || "Select an option"} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {props.options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {props.description && <FormDescription>{props.description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Date Picker Field
export function DateFormField<T extends FieldValues>(props: BaseFieldProps<T>) {
  return (
    <FormField
      control={props.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-col", props.className)}>
          <FormLabel className={props.required ? "after:content-['*'] after:ml-0.5 after:text-destructive" : undefined}>
            {props.label}
          </FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  disabled={props.disabled}
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    format(new Date(field.value), "PPP")
                  ) : (
                    <span>{props.placeholder || "Pick a date"}</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value ? new Date(field.value) : undefined}
                onSelect={field.onChange}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {props.description && <FormDescription>{props.description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Checkbox Field
export function CheckboxFormField<T extends FieldValues>(props: BaseFieldProps<T>) {
  return (
    <FormField
      control={props.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-row items-start space-x-3 space-y-0", props.className)}>
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={props.disabled}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel className={props.required ? "after:content-['*'] after:ml-0.5 after:text-destructive" : undefined}>
              {props.label}
            </FormLabel>
            {props.description && <FormDescription>{props.description}</FormDescription>}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Switch Field
export function SwitchFormField<T extends FieldValues>(props: BaseFieldProps<T>) {
  return (
    <FormField
      control={props.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-row items-center justify-between rounded-lg border p-4", props.className)}>
          <div className="space-y-0.5">
            <FormLabel className={props.required ? "after:content-['*'] after:ml-0.5 after:text-destructive" : "text-base"}>
              {props.label}
            </FormLabel>
            {props.description && <FormDescription>{props.description}</FormDescription>}
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={props.disabled}
            />
          </FormControl>
        </FormItem>
      )}
    />
  )
}

// Radio Group Field
export function RadioFormField<T extends FieldValues>(
  props: BaseFieldProps<T> & {
    options: Array<{ value: string; label: string; description?: string }>
  }
) {
  return (
    <FormField
      control={props.control}
      name={props.name}
      render={({ field }) => (
        <FormItem className={props.className}>
          <FormLabel className={props.required ? "after:content-['*'] after:ml-0.5 after:text-destructive" : undefined}>
            {props.label}
          </FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={props.disabled}
              className="flex flex-col space-y-1"
            >
              {props.options.map((option) => (
                <FormItem
                  key={option.value}
                  className="flex items-center space-x-3 space-y-0"
                >
                  <FormControl>
                    <RadioGroupItem value={option.value} />
                  </FormControl>
                  <div className="space-y-0.5">
                    <FormLabel className="font-normal cursor-pointer">
                      {option.label}
                    </FormLabel>
                    {option.description && (
                      <FormDescription className="mt-0">
                        {option.description}
                      </FormDescription>
                    )}
                  </div>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          {props.description && <FormDescription>{props.description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Address Field Group
export function AddressFormFields<T extends FieldValues>({
  control,
  namePrefix,
  className
}: {
  control: Control<T>
  namePrefix: string
  className?: string
}) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center space-x-2 mb-4">
        <MapPin className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-medium">Address Information</h3>
      </div>
      
      <TextFormField
        control={control}
        name={`${namePrefix}.addressLine1` as FieldPath<T>}
        label="Address Line 1"
        placeholder="123 Main Street"
        required
      />
      
      <TextFormField
        control={control}
        name={`${namePrefix}.addressLine2` as FieldPath<T>}
        label="Address Line 2"
        placeholder="Suite 100 (optional)"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextFormField
          control={control}
          name={`${namePrefix}.city` as FieldPath<T>}
          label="City"
          placeholder="Chicago"
          required
        />
        
        <TextFormField
          control={control}
          name={`${namePrefix}.state` as FieldPath<T>}
          label="State/Province"
          placeholder="IL"
          required
        />
        
        <TextFormField
          control={control}
          name={`${namePrefix}.zipCode` as FieldPath<T>}
          label="ZIP/Postal Code"
          placeholder="60601"
          required
        />
      </div>
      
      <TextFormField
        control={control}
        name={`${namePrefix}.country` as FieldPath<T>}
        label="Country"
        placeholder="United States"
        required
      />
    </div>
  )
}

// Tag/Multi-select Field
export function TagsFormField<T extends FieldValues>(
  props: BaseFieldProps<T> & {
    suggestions?: string[]
    maxTags?: number
  }
) {
  return (
    <FormField
      control={props.control}
      name={props.name}
      render={({ field }) => {
        const tags = field.value || []
        const [inputValue, setInputValue] = React.useState('')

        const addTag = (tag: string) => {
          if (tag.trim() && !tags.includes(tag.trim())) {
            const newTags = [...tags, tag.trim()]
            if (!props.maxTags || newTags.length <= props.maxTags) {
              field.onChange(newTags)
            }
          }
          setInputValue('')
        }

        const removeTag = (tagToRemove: string) => {
          field.onChange(tags.filter((tag: string) => tag !== tagToRemove))
        }

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            addTag(inputValue)
          } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            removeTag(tags[tags.length - 1])
          }
        }

        return (
          <FormItem className={props.className}>
            <FormLabel className={props.required ? "after:content-['*'] after:ml-0.5 after:text-destructive" : undefined}>
              {props.label}
            </FormLabel>
            <FormControl>
              <div className="space-y-2">
                {/* Tags Display */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag: string, index: number) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="pr-1"
                      >
                        {tag}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeTag(tag)}
                          type="button"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Input */}
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={props.placeholder || "Type and press Enter to add tags"}
                  disabled={props.disabled || (props.maxTags && tags.length >= props.maxTags)}
                />
                
                {/* Suggestions */}
                {props.suggestions && inputValue && (
                  <div className="flex flex-wrap gap-2">
                    {props.suggestions
                      .filter(suggestion => 
                        suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
                        !tags.includes(suggestion)
                      )
                      .slice(0, 5)
                      .map(suggestion => (
                        <Button
                          key={suggestion}
                          variant="outline"
                          size="sm"
                          onClick={() => addTag(suggestion)}
                          type="button"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {suggestion}
                        </Button>
                      ))
                    }
                  </div>
                )}
              </div>
            </FormControl>
            {props.description && <FormDescription>{props.description}</FormDescription>}
            {props.maxTags && (
              <FormDescription>
                {tags.length}/{props.maxTags} tags
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}