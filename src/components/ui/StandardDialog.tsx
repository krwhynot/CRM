import React from "react"
import { cn } from "@/lib/utils"
import { 
  Dialog, 
  DialogContent as BaseDialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog"

interface StandardDialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DialogContent(props: StandardDialogContentProps) {
  const { className, children, ...rest } = props
  return (
    <BaseDialogContent 
      className={cn("max-w-4xl w-full max-h-screen overflow-hidden", className)} 
      {...rest}
    >
      {children}
    </BaseDialogContent>
  )
}

export function DialogScrollableContent(props: StandardDialogContentProps) {
  const { className, children, ...rest } = props
  return (
    <div className={cn("flex-1 overflow-y-auto pr-2", className)} {...rest}>
      {children}
    </div>
  )
}

// Re-export all other dialog components for consistency
export { Dialog, DialogHeader, DialogTitle, DialogTrigger, DialogDescription }