'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { XIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { semanticSpacing, semanticTypography, semanticRadius, semanticShadows } from '@/styles/tokens'

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    data-slot="dialog-overlay"
    className={cn(
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean
  }
>(({ className, children, showCloseButton = true, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      data-slot="dialog-content"
      className={cn(
        `bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[96%] translate-x-[-50%] translate-y-[-50%] ${semanticSpacing.gap.lg} ${semanticRadius.large} border ${semanticSpacing.cardContainer} sm:${semanticSpacing.layoutContainer} ${semanticShadows.modal} duration-200 sm:max-w-lg md:max-w-2xl lg:max-w-4xl focus-ring max-h-dialog overflow-hidden`,
        className
      )}
      onOpenAutoFocus={(event) => {
        // Focus first input or button when dialog opens
        const target = event.currentTarget as HTMLElement
        if (target) {
          const firstFocusable = target.querySelector(
            'input:not([disabled]), button:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          ) as HTMLElement
          if (firstFocusable) {
            event.preventDefault()
            firstFocusable.focus()
          }
        }
      }}
      onCloseAutoFocus={(event) => {
        // Prevent focus from jumping when dialog closes
        event.preventDefault()
      }}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close
          data-slot="dialog-close"
          className={`${semanticRadius.small} focus:outline-hidden absolute ${semanticSpacing.rightGap.lg} ${semanticSpacing.topGap.lg} opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0`}
        >
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    data-slot="dialog-header"
    className={cn(`flex flex-col ${semanticSpacing.gap.sm} text-center sm:text-left`, className)}
    {...props}
  />
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    data-slot="dialog-footer"
    className={cn(
      `flex flex-col-reverse ${semanticSpacing.gap.sm} sm:flex-row sm:justify-end`,
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    data-slot="dialog-title"
    className={cn(`${semanticTypography.h3} leading-none font-semibold`, className)}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    data-slot="dialog-description"
    className={cn(`text-muted-foreground ${semanticTypography.body}`, className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
