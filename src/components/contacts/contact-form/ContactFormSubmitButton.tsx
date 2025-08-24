import React from 'react'
import { Button } from '@/components/ui/button'
import { ButtonNew } from '@/components/ui/new/Button'

interface ContactFormSubmitButtonProps {
  loading: boolean
  submitLabel: string
  useNewStyle: boolean
  inputClassName: string
}

export const ContactFormSubmitButton: React.FC<ContactFormSubmitButtonProps> = ({
  loading,
  submitLabel,
  useNewStyle,
  inputClassName
}) => {
  const buttonText = loading ? 'Saving...' : submitLabel

  if (useNewStyle) {
    return (
      <ButtonNew type="submit" disabled={loading} className="w-full">
        {buttonText}
      </ButtonNew>
    )
  }

  return (
    <Button type="submit" disabled={loading} className={`w-full ${inputClassName}`}>
      {buttonText}
    </Button>
  )
}