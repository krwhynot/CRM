import { useState } from 'react'

// Utility hook for managing multiple progressive details
export const useProgressiveDetails = (initialStates: Record<string, boolean> = {}) => {
  const [states, setStates] = useState(initialStates)

  const toggle = (key: string) => {
    setStates((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const set = (key: string, value: boolean) => {
    setStates((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const reset = () => {
    setStates(initialStates)
  }

  const isOpen = (key: string) => states[key] || false

  return {
    states,
    toggle,
    set,
    reset,
    isOpen,
  }
}
