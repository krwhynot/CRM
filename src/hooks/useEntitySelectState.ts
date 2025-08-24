import { useState } from 'react'
import type { EntityOption } from '@/components/forms/EntitySelect'

export const useEntitySelectState = (
  value: string,
  options: EntityOption[],
  onValueChange: (value: string) => void
) => {
  const [isOpen, setIsOpen] = useState(false)

  const selectedOption = options.find(option => option.id === value)

  const handleSelectOption = (optionId: string) => {
    onValueChange(optionId)
    setIsOpen(false)
  }

  return {
    isOpen,
    setIsOpen,
    selectedOption,
    handleSelectOption
  }
}