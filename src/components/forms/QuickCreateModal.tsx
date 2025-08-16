"use client"

import * as React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { Loader2 } from "lucide-react"
import { useMediaQuery } from "@/hooks/useMediaQuery"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Form } from "@/components/ui/form"

export interface QuickCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode | ((props: { control: any; loading: boolean }) => React.ReactNode)
  onSubmit: (data: any) => Promise<void>
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  submitLabel?: string
  cancelLabel?: string
  schema: any
  defaultValues: any
  className?: string
}

export function QuickCreateModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  onSuccess,
  onError,
  submitLabel = "Create",
  cancelLabel = "Cancel",
  schema,
  defaultValues,
  className,
}: QuickCreateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  })

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      onSuccess?.(data)
      form.reset(defaultValues)
      onOpenChange(false)
    } catch (error) {
      console.error("Quick create error:", error)
      onError?.(error as Error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    form.reset(defaultValues)
    onOpenChange(false)
  }

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {typeof children === 'function' 
          ? children({ control: form.control, loading: isSubmitting })
          : children
        }
        
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 h-11"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Creating..." : submitLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="flex-1 h-11"
          >
            {cancelLabel}
          </Button>
        </div>
      </form>
    </Form>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh]">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
          <div className="mt-6">
            {formContent}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-[425px] ${className}`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="mt-4">
          {formContent}
        </div>
      </DialogContent>
    </Dialog>
  )
}