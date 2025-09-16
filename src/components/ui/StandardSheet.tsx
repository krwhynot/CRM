import React from 'react'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent as BaseSheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from './sheet'
import { SheetContextProvider, type SheetSize, type SheetSide } from '@/contexts/SheetContext'

// Size mapping for consistent sheet sizing - using mobile-first responsive ladder
const sizeClasses = {
  sm: 'w-[90%] sm:w-[320px]',
  md: 'w-[90%] sm:w-[400px]',
  lg: 'w-[90%] sm:w-[500px] md:w-[600px]',
  xl: 'w-[90%] sm:w-[600px] md:w-[700px] lg:w-[800px]',
} as const

// Mobile-first height classes for top/bottom sheets
const heightClasses = {
  sm: 'h-[50%]',
  md: 'h-[60%]',
  lg: 'h-[70%]',
  xl: 'h-[80%]',
} as const

// Base sheet props interface
interface BaseSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  size?: SheetSize
  side?: SheetSide
  headerActions?: React.ReactNode
  children: React.ReactNode
}

// Regular sheet props (for forms, content, filters)
interface RegularSheetProps extends BaseSheetProps {
  footer?: React.ReactNode
  scroll?: 'content' | 'body'
  trigger?: React.ReactNode
}

// Union type for StandardSheet props
type StandardSheetProps = RegularSheetProps

/**
 * StandardSheet - Unified sheet component for the CRM system
 *
 * Supports sheets for filters, forms, and content with consistent sizing,
 * scrolling patterns, responsive behavior, and accessibility features.
 *
 * @example Filter Sheet
 * <StandardSheet
 *   open={isFiltersOpen}
 *   onOpenChange={setIsFiltersOpen}
 *   title="Filter Contacts"
 *   description="Adjust filters to refine your contact list"
 *   size="md"
 *   side="right"
 *   trigger={<Button variant="outline">Filters</Button>}
 * >
 *   <ContactsFilters />
 * </StandardSheet>
 *
 * @example Form Sheet
 * <StandardSheet
 *   open={isFormOpen}
 *   onOpenChange={setIsFormOpen}
 *   title="Add Contact"
 *   description="Fill in the contact details below"
 *   size="lg"
 *   side="right"
 *   scroll="content"
 *   footer={<Button>Save Contact</Button>}
 * >
 *   <ContactForm />
 * </StandardSheet>
 *
 * @example Bottom Drawer (Mobile)
 * <StandardSheet
 *   open={isDrawerOpen}
 *   onOpenChange={setIsDrawerOpen}
 *   title="Quick Actions"
 *   size="md"
 *   side="bottom"
 *   trigger={<Button>More Actions</Button>}
 * >
 *   <QuickActionsList />
 * </StandardSheet>
 */
export function StandardSheet(props: StandardSheetProps) {
  const {
    open,
    onOpenChange,
    title,
    description,
    size = 'md',
    side = 'right',
    headerActions,
    children,
    footer,
    scroll = 'content',
    trigger,
  } = props

  // Determine appropriate classes based on sheet side and size
  const isHorizontal = side === 'left' || side === 'right'
  const sizeClass = isHorizontal ? sizeClasses[size] : heightClasses[size]
  const scrollClasses = scroll === 'content' ? 'flex-1 min-h-0 overflow-y-auto' : ''

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <BaseSheetContent
        side={side}
        className={cn(
          'flex flex-col gap-4',
          sizeClass,
          // Ensure proper spacing and layout
          'data-[side=right]:border-l data-[side=left]:border-r',
          'data-[side=top]:border-b data-[side=bottom]:border-t'
        )}
      >
        <SheetContextProvider
          isInSheet={true}
          size={size}
          side={side}
          onClose={() => onOpenChange(false)}
        >
          <SheetHeader className="flex items-start justify-between">
            <div className="space-y-1">
              <SheetTitle>{title}</SheetTitle>
              {description && <SheetDescription>{description}</SheetDescription>}
            </div>
            {headerActions}
          </SheetHeader>

          <div className={cn(scrollClasses, scroll === 'content' && 'pr-2')}>{children}</div>

          {footer && <SheetFooter>{footer}</SheetFooter>}
        </SheetContextProvider>
      </BaseSheetContent>
    </Sheet>
  )
}

// Export legacy components for backward compatibility during migration
export { Sheet, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetTrigger }
export { BaseSheetContent as SheetContent }