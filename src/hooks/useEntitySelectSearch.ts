import { useState, useMemo } from 'react'
import type { EntityOption } from '@/components/forms/EntitySelect'

export const useEntitySelectSearch = (options: EntityOption[]) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options
    
    const searchLower = searchTerm.toLowerCase()
    return options.filter(option => 
      option.name.toLowerCase().includes(searchLower) ||
      option.description?.toLowerCase().includes(searchLower)
    )
  }, [options, searchTerm])

  const clearSearch = () => {
    setSearchTerm('')
  }

  return {
    searchTerm,
    setSearchTerm,
    filteredOptions,
    clearSearch
  }
}