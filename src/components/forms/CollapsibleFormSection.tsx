"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { cn } from "@/lib/utils"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"

export interface CollapsibleFormSectionProps {
  id: string
  title: string
  description?: string
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
  
  // Default state behavior
  defaultOpen?: boolean
  forceState?: boolean // If true, ignores localStorage
  
  // Mobile behavior
  defaultOpenMobile?: boolean
  defaultOpenDesktop?: boolean
  
  // State persistence
  persistState?: boolean
  storageKey?: string // Custom localStorage key
  
  // Event handlers
  onOpenChange?: (open: boolean) => void
  
  // Accessibility
  level?: 2 | 3 | 4 | 5 | 6 // Heading level for proper semantic structure
}

export function CollapsibleFormSection({
  id,
  title,
  description,
  icon,
  children,
  className,
  headerClassName,
  contentClassName,
  defaultOpen = true,
  forceState = false,
  defaultOpenMobile,
  defaultOpenDesktop,
  persistState = true,
  storageKey,
  onOpenChange,
  level = 3,
}: CollapsibleFormSectionProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")
  
  // Determine the appropriate default state based on device
  const getDeviceDefault = useCallback(() => {
    if (defaultOpenMobile !== undefined && isMobile) {
      return defaultOpenMobile
    }
    if (defaultOpenDesktop !== undefined && !isMobile) {
      return defaultOpenDesktop
    }
    return defaultOpen
  }, [isMobile, defaultOpenMobile, defaultOpenDesktop, defaultOpen])

  // Generate storage key
  const finalStorageKey = storageKey || `form-section-${id}-expanded`
  
  // Get initial state from localStorage or default
  const getInitialState = useCallback(() => {
    if (forceState) {
      return getDeviceDefault()
    }
    
    if (persistState && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(finalStorageKey)
        if (stored !== null) {
          return JSON.parse(stored)
        }
      } catch (error) {
        console.warn(`Failed to parse localStorage value for ${finalStorageKey}:`, error)
      }
    }
    
    return getDeviceDefault()
  }, [forceState, persistState, finalStorageKey, getDeviceDefault])

  const [isOpen, setIsOpen] = useState(getInitialState)

  // Update state when device type changes (mobile/desktop)
  useEffect(() => {
    if (!forceState && !persistState) {
      setIsOpen(getDeviceDefault())
    }
  }, [isMobile, forceState, persistState, getDeviceDefault])

  // Handle state changes
  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)
    
    // Persist to localStorage
    if (persistState && !forceState && typeof window !== 'undefined') {
      try {
        localStorage.setItem(finalStorageKey, JSON.stringify(open))
      } catch (error) {
        console.warn(`Failed to save to localStorage for ${finalStorageKey}:`, error)
      }
    }
    
    // Call external handler
    onOpenChange?.(open)
  }, [persistState, forceState, finalStorageKey, onOpenChange])

  // Dynamic heading component based on level
  const HeadingComponent = `h${level}` as keyof React.JSX.IntrinsicElements

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={handleOpenChange}
      className={cn("space-y-2", className)}
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-lg border-b",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "min-h-[44px]", // Touch-friendly minimum height
            headerClassName
          )}
          aria-expanded={isOpen}
          aria-controls={`section-content-${id}`}
        >
          <div className="flex items-center gap-3 text-left flex-1">
            {icon && (
              <div className="flex-shrink-0" aria-hidden="true">
                {icon}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <HeadingComponent 
                className="text-lg font-semibold leading-none"
                id={`section-heading-${id}`}
              >
                {title}
              </HeadingComponent>
              {description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {description}
                </p>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 ml-2">
            {isOpen ? (
              <ChevronDown 
                className="h-5 w-5 transition-transform duration-200" 
                aria-hidden="true"
              />
            ) : (
              <ChevronRight 
                className="h-5 w-5 transition-transform duration-200" 
                aria-hidden="true"
              />
            )}
          </div>
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent
        id={`section-content-${id}`}
        aria-labelledby={`section-heading-${id}`}
        className={cn(
          "data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
          "overflow-hidden",
          contentClassName
        )}
      >
        <div className="px-4 pb-4 pt-2 space-y-6">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

// Preset configurations for common form sections
export const FormSectionPresets = {
  // Contact form sections
  contactBasic: {
    id: "contact-basic",
    title: "Contact Details",
    description: "Basic contact information including name, email, and phone",
    defaultOpenMobile: true,
    defaultOpenDesktop: true,
  },
  contactAdditional: {
    id: "contact-additional", 
    title: "Additional Details",
    description: "Optional information like notes and preferences",
    defaultOpenMobile: false,
    defaultOpenDesktop: true,
  },
  
  // Organization form sections
  organizationBasic: {
    id: "organization-basic",
    title: "Organization Details", 
    description: "Company name, type, and basic information",
    defaultOpenMobile: true,
    defaultOpenDesktop: true,
  },
  organizationContact: {
    id: "organization-contact",
    title: "Contact & Location",
    description: "Address, phone, email, and website information",
    defaultOpenMobile: false,
    defaultOpenDesktop: true,
  },
  organizationBusiness: {
    id: "organization-business",
    title: "Business Details",
    description: "Industry, size, revenue, and business-specific information",
    defaultOpenMobile: false,
    defaultOpenDesktop: false,
  },
  
  // Opportunity form sections
  opportunityBasic: {
    id: "opportunity-basic",
    title: "Basic Information",
    description: "Opportunity name, stage, and primary details",
    defaultOpenMobile: true,
    defaultOpenDesktop: true,
  },
  opportunityDetails: {
    id: "opportunity-details",
    title: "Details",
    description: "Products, value, probability, and notes",
    defaultOpenMobile: false,
    defaultOpenDesktop: true,
  },
  opportunityTimeline: {
    id: "opportunity-timeline",
    title: "Timeline",
    description: "Important dates and follow-up actions",
    defaultOpenMobile: false,
    defaultOpenDesktop: false,
  },
  
  // Interaction form sections
  interactionBasic: {
    id: "interaction-basic",
    title: "Basic Information",
    description: "Type, date, and contact information",
    defaultOpenMobile: true,
    defaultOpenDesktop: true,
  },
  interactionDetails: {
    id: "interaction-details",
    title: "Details",
    description: "Notes, attachments, and follow-up actions",
    defaultOpenMobile: false,
    defaultOpenDesktop: true,
  },
  
  // Product form sections
  productBasic: {
    id: "product-basic",
    title: "Product Details",
    description: "Name, type, and principal organization",
    defaultOpenMobile: true,
    defaultOpenDesktop: true,
  },
  productSpecs: {
    id: "product-specs",
    title: "Specifications & Details",
    description: "Description, pricing, and additional product information",
    defaultOpenMobile: false,
    defaultOpenDesktop: true,
  },
} as const