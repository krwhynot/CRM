import { safeGetString } from '@/lib/secure-storage'

export function useChartStyling() {
  const useNewStyle = safeGetString('useNewStyle', 'true') !== 'false'
  
  return {
    useNewStyle,
    cardClassName: useNewStyle ? "shadow-sm border-primary/10" : "shadow-md",
    headerClassName: useNewStyle ? "p-4 pb-3" : "p-6 pb-4",
    contentClassName: useNewStyle ? "p-4 pt-0" : "p-6 pt-0",
    titleClassName: useNewStyle 
      ? "text-base font-bold text-foreground" 
      : "text-lg font-semibold",
    subtitleClassName: useNewStyle ? "text-xs" : "text-sm"
  }
}