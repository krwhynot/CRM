import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useDialogContext } from '@/contexts/DialogContext'
import { semanticSpacing, semanticTypography } from '@/styles/tokens'
import {
  getFormCardClasses,
  getFormContainerClasses,
  getFormPaddingClasses,
  getFormHeaderSpacing,
} from '@/lib/utils/form-utils'

interface FormCardProps {
  title?: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  className?: string
}

/**
 * FormCard - Dialog-aware form container component
 *
 * Automatically adapts styling based on whether it's rendered inside
 * a dialog or as a standalone page component.
 *
 * @example In Dialog
 * <StandardDialog title="Add Contact">
 *   <FormCard>
 *     <ContactForm />
 *   </FormCard>
 * </StandardDialog>
 *
 * @example Standalone Page
 * <FormCard title="Add Contact" description="Fill in contact details">
 *   <ContactForm />
 * </FormCard>
 */
export function FormCard({ title, description, icon: Icon, children, className }: FormCardProps) {
  const { isInDialog, size } = useDialogContext()

  // Get responsive classes based on context
  const containerClasses = getFormContainerClasses(isInDialog, size)
  const cardClasses = getFormCardClasses(isInDialog)
  const paddingClasses = getFormPaddingClasses(isInDialog)
  const headerSpacing = getFormHeaderSpacing(isInDialog)

  // In dialog - render without Card wrapper since StandardDialog provides container
  if (isInDialog) {
    return (
      <div className={cn(containerClasses, className)}>
        {(title || description) && (
          <div className={cn('space-y-2', headerSpacing)}>
            {title && (
              <div className={cn(semanticSpacing.gap.sm, 'flex items-center')}>
                {Icon && <Icon className="size-6 text-primary" />}
                <h3 className={cn(semanticTypography.h4, semanticTypography.h4, 'text-gray-900')}>
                  {title}
                </h3>
              </div>
            )}
            {description && (
              <p className={cn(semanticTypography.body, 'text-muted-foreground')}>{description}</p>
            )}
          </div>
        )}
        <div className={paddingClasses}>{children}</div>
      </div>
    )
  }

  // Standalone page - use Card component
  return (
    <div className={containerClasses}>
      <Card className={cn(cardClasses, className)}>
        {(title || description) && (
          <CardHeader className="border-b bg-gray-50/50">
            <div className={cn(semanticSpacing.gap.sm, 'flex items-center')}>
              {Icon && <Icon className="size-6 text-primary" />}
              <div>
                {title && (
                  <CardTitle className={cn(semanticTypography.h3, semanticTypography.h4)}>
                    {title}
                  </CardTitle>
                )}
                {description && (
                  <p className={cn(semanticTypography.body, 'mt-1 text-muted-foreground')}>
                    {description}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
        )}
        <CardContent className={paddingClasses}>{children}</CardContent>
      </Card>
    </div>
  )
}
