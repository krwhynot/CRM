import { AlertCircle, CheckCircle } from 'lucide-react'
import {
  semanticSpacing,
  semanticTypography,
  semanticRadius,
  semanticColors,
} from '@/styles/tokens'

interface FormAlertProps {
  type: 'error' | 'success'
  message: string
}

export function FormAlert({ type, message }: FormAlertProps) {
  const isError = type === 'error'

  return (
    <div
      className={`flex items-center ${semanticSpacing.gap.xs} ${semanticRadius.md} ${semanticSpacing.layoutPadding.lg} ${semanticTypography.body} ${
        isError
          ? `border ${semanticColors.border.danger} ${semanticColors.background.danger} ${semanticColors.text.danger}`
          : `border ${semanticColors.border.success} ${semanticColors.background.success} ${semanticColors.text.success}`
      }`}
    >
      {isError ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
      {message}
    </div>
  )
}
