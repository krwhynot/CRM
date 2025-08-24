import { useMemo } from 'react'

interface UseContactFormStyleReturn {
  useNewStyle: boolean
  inputClassName: string
}

export const useContactFormStyle = (): UseContactFormStyleReturn => {
  
  const useNewStyle = useMemo(() => 
    localStorage.getItem('useNewStyle') === 'true', 
    []
  )

  const inputClassName = useMemo(() => 
    useNewStyle ? '' : 'h-11', 
    [useNewStyle]
  )

  return {
    useNewStyle,
    inputClassName
  }
}