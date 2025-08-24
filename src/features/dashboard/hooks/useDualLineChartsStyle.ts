import { useMemo } from 'react'

interface UseDualLineChartsStyleReturn {
  useNewStyle: boolean
  cardClassName: string
  headerClassName: string
  titleClassName: string
  descriptionClassName: string
  contentClassName: string
}

export const useDualLineChartsStyle = (): UseDualLineChartsStyleReturn => {
  
  const useNewStyle = useMemo(() => 
    localStorage.getItem('useNewStyle') !== 'false', 
    []
  )

  const styles = useMemo(() => ({
    useNewStyle,
    cardClassName: useNewStyle ? "shadow-sm border-primary/10" : "shadow-md",
    headerClassName: useNewStyle ? "p-4 pb-3" : "p-6 pb-4",
    titleClassName: useNewStyle 
      ? "text-base font-bold text-[hsl(var(--foreground))]" 
      : "text-lg font-semibold",
    descriptionClassName: useNewStyle ? "text-xs" : "text-sm",
    contentClassName: useNewStyle ? "p-4 pt-0" : "p-6 pt-0"
  }), [useNewStyle])

  return styles
}