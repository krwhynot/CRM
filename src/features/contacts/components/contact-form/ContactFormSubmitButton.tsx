import React from 'react'
import { Button } from '@/components/ui/button'

interface ContactFormSubmitButtonProps {
  loading: boolean
  submitLabel: string
  useNewStyle?: boolean // Optional for backwards compatibility
  inputClassName?: string
}

export const ContactFormSubmitButton: React.FC<ContactFormSubmitButtonProps> = ({
  loading,
  submitLabel,
  inputClassName = ""
}) => {
  const buttonText = loading ? 'Saving...' : submitLabel

  return (
    <Button type="submit" disabled={loading} className={`w-full ${inputClassName}`}>
      {buttonText}
    </Button>
  )
}