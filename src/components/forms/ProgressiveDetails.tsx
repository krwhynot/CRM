import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface ProgressiveDetailsProps {
  isOpen?: boolean
  onToggle?: (open: boolean) => void
  buttonText?: string
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'subtle' | 'card'
  disabled?: boolean
}

export function ProgressiveDetails({
  isOpen: controlledIsOpen,
  onToggle,
  buttonText = "Show Details",
  children,
  className,
  variant = 'default',
  disabled = false
}: ProgressiveDetailsProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  
  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen
  const setIsOpen = onToggle || setInternalIsOpen

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  const getButtonText = () => {
    if (typeof buttonText === 'string') {
      return isOpen ? `Hide ${buttonText.replace('Show ', '')}` : buttonText
    }
    return buttonText
  }

  const renderContent = () => {
    if (!isOpen) return null

    switch (variant) {
      case 'card':
        return (
          <Card className="mt-4">
            <CardContent className="p-4">
              {children}
            </CardContent>
          </Card>
        )
      
      case 'subtle':
        return (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            {children}
          </div>
        )
      
      default:
        return (
          <div className="mt-4 space-y-4">
            {children}
          </div>
        )
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <Button
        type="button"
        variant="outline"
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          "h-12 w-full text-base font-medium transition-all duration-200",
          "hover:bg-gray-50 focus:ring-2 focus:ring-blue-200",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        aria-expanded={isOpen}
        aria-controls="progressive-details-content"
      >
        {getButtonText()}
      </Button>
      
      <div
        id="progressive-details-content"
        className={cn(
          "transition-all duration-300 ease-in-out",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
          !isOpen && "sr-only"
        )}
        aria-hidden={!isOpen}
      >
        {renderContent()}
      </div>
    </div>
  )
}

// Specialized versions for common use cases
export interface FormSectionDetailsProps extends Omit<ProgressiveDetailsProps, 'buttonText'> {
  sectionTitle: string
}

export function FormSectionDetails({ sectionTitle, ...props }: FormSectionDetailsProps) {
  return (
    <ProgressiveDetails
      buttonText={`Show ${sectionTitle}`}
      variant="subtle"
      {...props}
    />
  )
}

export interface OptionalFieldsProps extends Omit<ProgressiveDetailsProps, 'buttonText' | 'variant'> {
  fieldCount?: number
}

export function OptionalFields({ fieldCount, ...props }: OptionalFieldsProps) {
  const buttonText = fieldCount 
    ? `Show ${fieldCount} Additional Fields`
    : "Show Additional Fields"

  return (
    <ProgressiveDetails
      buttonText={buttonText}
      variant="subtle"
      {...props}
    />
  )
}

export interface AdvancedOptionsProps extends Omit<ProgressiveDetailsProps, 'buttonText' | 'variant'> {
}

export function AdvancedOptions(props: AdvancedOptionsProps) {
  return (
    <ProgressiveDetails
      buttonText="Show Advanced Options"
      variant="card"
      {...props}
    />
  )
}

// Context-specific progressive details
export interface ContactDetailsProps extends FormSectionDetailsProps {
}

export function ContactDetails(props: ContactDetailsProps) {
  return (
    <FormSectionDetails
      {...props}
      sectionTitle="Contact Details"
    />
  )
}

export interface OrganizationDetailsProps extends FormSectionDetailsProps {
}

export function OrganizationDetails(props: OrganizationDetailsProps) {
  return (
    <FormSectionDetails
      {...props}
      sectionTitle="Organization Details"
    />
  )
}

export interface AddressDetailsProps extends FormSectionDetailsProps {
}

export function AddressDetails(props: AddressDetailsProps) {
  return (
    <FormSectionDetails
      {...props}
      sectionTitle="Address Information"
    />
  )
}

