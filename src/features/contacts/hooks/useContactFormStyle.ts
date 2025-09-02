import { useMemo } from 'react'
import { safeGetString } from '@/lib/secure-storage'

interface UseContactFormStyleReturn {
  useNewStyle: boolean
  inputClassName: string
}

export const useContactFormStyle = (): UseContactFormStyleReturn => {
  const useNewStyle = useMemo(() => safeGetString('useNewStyle', 'false') === 'true', [])

  const inputClassName = useMemo(() => (useNewStyle ? '' : 'h-11'), [useNewStyle])

  return {
    useNewStyle,
    inputClassName,
  }
}
