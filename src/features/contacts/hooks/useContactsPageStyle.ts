import { useMemo } from 'react'
import { safeGetString } from '@/lib/secure-storage'

export const useContactsPageStyle = () => {
  const USE_NEW_STYLE = useMemo(() => {
    return safeGetString('useNewStyle', 'true') !== 'false'
  }, [])

  return { USE_NEW_STYLE }
}