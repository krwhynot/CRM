import { useState, useEffect, createElement, useCallback } from 'react'
import { toast } from 'sonner'
import { LayoutGrid, Grid, List } from 'lucide-react'
import { useDeviceDetection, DeviceUtils } from '@/hooks/useDeviceDetection'

export type DashboardDensity = 'compact' | 'comfortable' | 'spacious'

export interface DensityConfig {
  value: DashboardDensity
  label: string
  description: string
  icon: string
}

export const DENSITY_CONFIGS: Record<DashboardDensity, DensityConfig> = {
  compact: {
    value: 'compact',
    label: 'Field Mode',
    description: 'Optimized for mobile sales and quick status checks',
    icon: 'LayoutGrid'
  },
  comfortable: {
    value: 'comfortable', 
    label: 'Office Mode',
    description: 'Standard daily workflow and opportunity management',
    icon: 'Grid'
  },
  spacious: {
    value: 'spacious',
    label: 'Presentation Mode', 
    description: 'Client meetings and detailed review sessions',
    icon: 'List'
  }
}

const BASE_STORAGE_KEY = 'dashboard-density-preference'
// const DEFAULT_DENSITY: DashboardDensity = 'comfortable' // Reserved for future use

// Device-specific auto-switching rules
const AUTO_DENSITY_RULES = {
  mobile: 'compact',
  'tablet-portrait': 'compact',
  'tablet-landscape': 'comfortable',
  desktop: 'comfortable',
  'large-desktop': 'spacious'
} as const

// Auto-switch tracking keys
// const AUTO_SWITCH_KEY = 'density-auto-switch-enabled' // Reserved for future use

// Toast messages for density changes
const DENSITY_TOAST_MESSAGES = {
  compact: {
    title: 'Field Mode Active',
    description: '📱 Perfect for on-the-go sales and mobile workflow!',
    icon: LayoutGrid
  },
  comfortable: {
    title: 'Office Mode Active', 
    description: '💼 Optimized for daily workflow and standard operations',
    icon: Grid
  },
  spacious: {
    title: 'Presentation Mode Active',
    description: '📊 Ideal for client meetings and detailed reviews',
    icon: List
  }
} as const

export function useDashboardDensity() {
  const { deviceContext, hasChanged } = useDeviceDetection()
  
  // Get device-specific storage key
  const getStorageKey = useCallback(() => DeviceUtils.getStorageKey(deviceContext, BASE_STORAGE_KEY), [deviceContext])
  
  // Get device-based default density
  const getDeviceBasedDefault = useCallback((): DashboardDensity => {
    const recommended = DeviceUtils.getRecommendedDensity(deviceContext)
    return AUTO_DENSITY_RULES[deviceContext] as DashboardDensity || recommended
  }, [deviceContext])

  const [density, setDensityState] = useState<DashboardDensity>(() => {
    // Initialize from device-specific localStorage
    try {
      const storageKey = DeviceUtils.getStorageKey(deviceContext, BASE_STORAGE_KEY)
      const saved = localStorage.getItem(storageKey)
      if (saved && Object.keys(DENSITY_CONFIGS).includes(saved)) {
        return saved as DashboardDensity
      }
    } catch {
      // Silently fall back to default
    }
    const recommended = DeviceUtils.getRecommendedDensity(deviceContext)
    return AUTO_DENSITY_RULES[deviceContext] as DashboardDensity || recommended
  })

  const setDensity = useCallback((newDensity: DashboardDensity, showToast = true, isAutoSwitch = false) => {
    const previousDensity = density
    setDensityState(newDensity)
    
    // Persist to device-specific localStorage
    try {
      localStorage.setItem(getStorageKey(), newDensity)
      
      // Track if user has overridden auto-switching for this device
      if (!isAutoSwitch) {
        localStorage.setItem(DeviceUtils.getStorageKey(deviceContext, 'user-override'), 'true')
      }
    } catch {
      // Silently fail
    }

    // Apply density class to document root
    const root = document.documentElement
    
    // Remove all density classes
    Object.keys(DENSITY_CONFIGS).forEach(densityKey => {
      root.classList.remove(`density-${densityKey}`)
    })
    
    // Add current density class
    root.classList.add(`density-${newDensity}`)

    // Show toast notification (only if density actually changed and showToast is true)
    if (showToast && previousDensity !== newDensity) {
      const toastConfig = DENSITY_TOAST_MESSAGES[newDensity]
      const IconComponent = toastConfig.icon
      
      if (isAutoSwitch) {
        // Auto-switch notification with option to override
        toast.info(`Auto-switched to ${toastConfig.title}`, {
          description: `📱 Optimized for ${deviceContext}. Tap to change.`,
          duration: 4000,
          className: 'density-change-toast',
          icon: createElement(IconComponent, { className: 'size-4' }),
          action: {
            label: 'Change',
            onClick: () => {
              // Show density selector (implementation would depend on your UI structure)
              toast.dismiss()
            }
          }
        })
      } else {
        // Manual switch notification
        toast.success(toastConfig.title, {
          description: toastConfig.description,
          duration: 3000,
          className: 'density-change-toast',
          icon: createElement(IconComponent, { className: 'size-4' })
        })
      }
    }
  }, [density, deviceContext, getStorageKey])

  // Sync across tabs via storage event
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      const currentStorageKey = getStorageKey()
      if (event.key === currentStorageKey && event.newValue) {
        const newDensity = event.newValue as DashboardDensity
        if (Object.keys(DENSITY_CONFIGS).includes(newDensity)) {
          // Use setDensity but disable toast to avoid duplicate notifications
          setDensity(newDensity, false)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [getStorageKey, setDensity])

  // Handle device context changes and auto-switching
  useEffect(() => {
    if (hasChanged) {
      // Check if user has overridden auto-switching for this device context
      const hasUserOverride = localStorage.getItem(
        DeviceUtils.getStorageKey(deviceContext, 'user-override')
      )
      
      if (!hasUserOverride) {
        const recommendedDensity = getDeviceBasedDefault()
        if (recommendedDensity !== density) {
          // Auto-switch to recommended density for new device context
          setDensity(recommendedDensity, true, true) // isAutoSwitch = true
        }
      } else {
        // Load device-specific preference if user has overridden
        try {
          const savedDensity = localStorage.getItem(getStorageKey())
          if (savedDensity && Object.keys(DENSITY_CONFIGS).includes(savedDensity)) {
            const newDensity = savedDensity as DashboardDensity
            if (newDensity !== density) {
              setDensity(newDensity, false) // Don't show toast for preference restoration
            }
          }
        } catch {
          // Silently fall back to default
        }
      }
    }
  }, [deviceContext, hasChanged, density, getDeviceBasedDefault, getStorageKey, setDensity])

  // Apply initial density class on mount (without toast)
  useEffect(() => {
    const root = document.documentElement
    
    // Remove any existing density classes
    Object.keys(DENSITY_CONFIGS).forEach(densityKey => {
      root.classList.remove(`density-${densityKey}`)
    })
    
    // Add current density class
    root.classList.add(`density-${density}`)
  }, [density])

  // Keyboard shortcuts for density switching
  useEffect(() => {
    const handleKeyboardShortcut = (event: KeyboardEvent) => {
      // Only trigger on Ctrl/Cmd + number keys
      if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey) {
        switch (event.key) {
          case '1':
            event.preventDefault()
            setDensity('compact')
            break
          case '2':
            event.preventDefault()
            setDensity('comfortable')
            break
          case '3':
            event.preventDefault()
            setDensity('spacious')
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyboardShortcut)
    return () => window.removeEventListener('keydown', handleKeyboardShortcut)
  }, [setDensity])

  return {
    density,
    setDensity,
    densityConfig: DENSITY_CONFIGS[density],
    allConfigs: DENSITY_CONFIGS,
    deviceContext,
    isAutoSwitchEnabled: !localStorage.getItem(DeviceUtils.getStorageKey(deviceContext, 'user-override')),
    recommendedDensity: getDeviceBasedDefault()
  }
}