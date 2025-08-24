import { useMemo } from 'react'

export const useOrganizationsPageStyle = () => {
  const USE_NEW_STYLE = useMemo(() => {
    return localStorage.getItem('useNewStyle') !== 'false'
  }, [])

  return { USE_NEW_STYLE }
}