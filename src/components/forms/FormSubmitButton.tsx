import React from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormSubmitButtonProps {
  children: React.ReactNode
  loading?: boolean
  disabled?: boolean
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  type?: 'submit' | 'button'
}

export function FormSubmitButton({
  children,
  loading = false,
  disabled = false,
  variant = 'default',
  size = 'default',
  className,
  type = 'submit',
}: FormSubmitButtonProps) {
  return (
    <Button
      type={type}
      variant={variant}
      size={size}
      disabled={loading || disabled}
      className={cn('h-11', className)}
    >
      {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
      {children}
    </Button>
  )
}
