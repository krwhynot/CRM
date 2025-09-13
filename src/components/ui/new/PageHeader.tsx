import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { semanticSpacing, semanticTypography } from '@/styles/tokens'

import { cn } from '@/lib/utils'
export interface PageHeaderAction {
  type: 'button' | 'link'
  label: string
  onClick?: () => void
  to?: string
  variant?: 'default' | 'secondary' | 'ghost' | 'outline'
  icon?: React.ReactNode
  'aria-label'?: string
}

export interface PageHeaderBackButton {
  to?: string
  onClick?: () => void
  label?: string
  'aria-label'?: string
  icon?: React.ReactNode
}

export interface PageHeaderProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  description?: React.ReactNode // alias for subtitle for backward compatibility
  icon?: React.ReactNode
  backButton?: PageHeaderBackButton
  actions?: PageHeaderAction[] | React.ReactNode
  meta?: React.ReactNode
  count?: number // backward compatibility
  className?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  description,
  icon,
  backButton,
  actions,
  meta,
  count,
  className = '',
}) => {
  // Handle backward compatibility
  const displaySubtitle = subtitle || description
  const displayMeta =
    meta ||
    (count !== undefined && (
      <span className={`${semanticTypography.body} text-muted-foreground`}>({count})</span>
    ))

  const renderBackButton = () => {
    if (!backButton) return null

    const buttonIcon = backButton.icon || <ArrowLeft className="size-4" />
    const buttonLabel = backButton.label || 'Back'
    const ariaLabel = backButton['aria-label'] || `Go back to previous page`

    const buttonProps = {
      variant: 'ghost' as const,
      size: 'sm' as const,
      className: semanticSpacing.topGap.xxs,
      'aria-label': ariaLabel,
    }

    if (backButton.to) {
      return (
        <Button asChild {...buttonProps}>
          <a href={backButton.to}>
            {buttonIcon}
            <span className={semanticSpacing.leftGap.xs}>{buttonLabel}</span>
          </a>
        </Button>
      )
    }

    return (
      <Button {...buttonProps} onClick={backButton.onClick}>
        {buttonIcon}
        <span className={`${semanticSpacing.leftGap.xs}`}>{buttonLabel}</span>
      </Button>
    )
  }

  const renderActions = () => {
    if (!actions) return null

    if (React.isValidElement(actions) || typeof actions === 'string') {
      return actions
    }

    if (Array.isArray(actions)) {
      return (
        <nav aria-label="Page actions" className={`flex flex-wrap ${semanticSpacing.gap.xs}`}>
          {actions.map((action, index) => {
            const key = `action-${index}`
            const ariaLabel = action['aria-label'] || action.label

            if (action.type === 'link' && action.to) {
              return (
                <Button
                  key={key}
                  asChild
                  variant={action.variant || 'secondary'}
                  aria-label={ariaLabel}
                >
                  <a href={action.to}>
                    {action.icon && (
                      <span className={semanticSpacing.rightGap.xs}>{action.icon}</span>
                    )}
                    {action.label}
                  </a>
                </Button>
              )
            }

            return (
              <Button
                key={key}
                variant={action.variant || 'default'}
                onClick={action.onClick}
                aria-label={ariaLabel}
              >
                {action.icon && (
                  <span className={`${semanticSpacing.rightGap.xs}`}>{action.icon}</span>
                )}
                {action.label}
              </Button>
            )
          })}
        </nav>
      )
    }

    return actions
  }

  return (
    <header
      data-page-header
      className={`flex flex-col ${semanticSpacing.gap.lg} sm:flex-row sm:items-start sm:justify-between ${className}`}
    >
      <div className={`flex min-w-0 flex-1 items-start ${semanticSpacing.gap.lg}`}>
        {renderBackButton()}
        {icon && <div className={`${semanticSpacing.topGap.xxs} shrink-0`}>{icon}</div>}
        <div className="min-w-0 flex-1">
          <div className={`flex flex-wrap items-center ${semanticSpacing.gap.xs}`}>
            <h1
              className={cn(
                semanticTypography.h2,
                semanticTypography.h4,
                semanticTypography.tightSpacing
              )}
            >
              {title}
            </h1>
            {displayMeta}
          </div>
          {displaySubtitle && (
            <p
              className={`${semanticSpacing.topGap.xxs} ${semanticTypography.body} text-muted-foreground`}
            >
              {displaySubtitle}
            </p>
          )}
        </div>
      </div>

      <div className={`${semanticSpacing.topGap.xs} shrink-0 sm:${semanticSpacing.topGap.zero}`}>
        {renderActions()}
      </div>
    </header>
  )
}
