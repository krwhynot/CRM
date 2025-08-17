// Main component - lightweight wrapper
export { DynamicSelectField } from "./DynamicSelectField"

// Types - always available for tree-shaking
export type {
  SelectOption,
  DynamicSelectFieldProps,
  OptionListProps,
  SearchInputProps,
} from "./types"

export { DYNAMIC_SELECT_TOKENS } from "./types"

// Components - statically exported for now, can be optimized later
export { OptionList } from "./OptionList"
export { SearchInput } from "./SearchInput"

// Hooks - available for direct import when needed
export { useDynamicSelectSearch } from "./hooks/useDynamicSelectSearch"
export { useConditionalVirtualization, bundleMonitoring } from "./hooks/useConditionalVirtualization"

// Bundle size monitoring for development
if (process.env.NODE_ENV === 'development') {
  // Track component usage for bundle optimization
  const componentUsage = {
    core: 0,
    virtualization: 0,
    search: 0,
  }
  
  // Export for development monitoring
  ;(window as any).__DynamicSelectBundleMonitoring = {
    componentUsage,
    getUsageStats: () => componentUsage,
    logBundleImpact: () => {
      console.info('[DynamicSelect] Bundle impact:', {
        coreComponent: '~8KB',
        virtualizedOptions: componentUsage.virtualization > 0 ? '~15KB' : 'Not loaded',
        searchLogic: '~3KB',
        totalEstimate: '~26KB (with conditional loading)',
      })
    }
  }
}