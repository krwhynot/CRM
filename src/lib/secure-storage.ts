/**
 * Secure localStorage/sessionStorage wrapper
 * Addresses localStorage security concerns based on 2025 best practices
 * 
 * Security features:
 * - Safe JSON parsing with try-catch blocks
 * - Graceful error handling for quota/security errors
 * - Fallback values for corrupted data
 * - Protection against localStorage tampering
 */

type StorageType = 'localStorage' | 'sessionStorage'

/**
 * Check if storage is available and accessible
 */
function isStorageAvailable(type: StorageType): boolean {
  try {
    const storage = type === 'localStorage' ? localStorage : sessionStorage
    const testKey = `__storage_test_${Date.now()}`
    storage.setItem(testKey, 'test')
    storage.removeItem(testKey)
    return true
  } catch (error) {
    console.warn(`${type} is not available:`, error)
    return false
  }
}

/**
 * Safely retrieve and parse JSON data from storage
 * @param key Storage key
 * @param fallback Fallback value if parsing fails
 * @param type Storage type (localStorage or sessionStorage)
 * @returns Parsed data or fallback value
 */
export function safeGetJSON<T>(
  key: string, 
  fallback: T, 
  type: StorageType = 'localStorage'
): T {
  try {
    if (!isStorageAvailable(type)) {
      console.warn(`${type} not available, using fallback for key: ${key}`)
      return fallback
    }

    const storage = type === 'localStorage' ? localStorage : sessionStorage
    const item = storage.getItem(key)
    
    if (!item) {
      return fallback
    }

    const parsed = JSON.parse(item)
    
    // Additional type safety check for arrays
    if (Array.isArray(fallback) && !Array.isArray(parsed)) {
      console.warn(`Expected array for key ${key}, got ${typeof parsed}. Using fallback.`)
      return fallback
    }
    
    return parsed
  } catch (error) {
    console.warn(`Failed to parse JSON from ${type} for key ${key}:`, error)
    return fallback
  }
}

/**
 * Safely store JSON data in storage
 * @param key Storage key
 * @param value Value to store
 * @param type Storage type (localStorage or sessionStorage)
 * @returns Success status
 */
export function safeSetJSON(
  key: string, 
  value: any, 
  type: StorageType = 'localStorage'
): boolean {
  try {
    if (!isStorageAvailable(type)) {
      console.warn(`${type} not available, cannot set key: ${key}`)
      return false
    }

    const storage = type === 'localStorage' ? localStorage : sessionStorage
    const serialized = JSON.stringify(value)
    storage.setItem(key, serialized)
    return true
  } catch (error) {
    if (error instanceof DOMException) {
      if (error.name === 'QuotaExceededError') {
        console.error(`Storage quota exceeded when setting key ${key}`)
      } else if (error.name === 'SecurityError') {
        console.error(`Security error when setting key ${key}`)
      } else {
        console.error(`Storage error when setting key ${key}:`, error)
      }
    } else {
      console.error(`Failed to stringify value for key ${key}:`, error)
    }
    return false
  }
}

/**
 * Safely retrieve string data from storage
 * @param key Storage key
 * @param fallback Fallback value if retrieval fails
 * @param type Storage type (localStorage or sessionStorage)
 * @returns String value or fallback
 */
export function safeGetString(
  key: string, 
  fallback: string, 
  type: StorageType = 'localStorage'
): string {
  try {
    if (!isStorageAvailable(type)) {
      console.warn(`${type} not available, using fallback for key: ${key}`)
      return fallback
    }

    const storage = type === 'localStorage' ? localStorage : sessionStorage
    const item = storage.getItem(key)
    
    return item !== null ? item : fallback
  } catch (error) {
    console.warn(`Failed to get string from ${type} for key ${key}:`, error)
    return fallback
  }
}

/**
 * Safely set string data in storage
 * @param key Storage key
 * @param value String value to store
 * @param type Storage type (localStorage or sessionStorage)
 * @returns Success status
 */
export function safeSetString(
  key: string, 
  value: string, 
  type: StorageType = 'localStorage'
): boolean {
  try {
    if (!isStorageAvailable(type)) {
      console.warn(`${type} not available, cannot set key: ${key}`)
      return false
    }

    const storage = type === 'localStorage' ? localStorage : sessionStorage
    storage.setItem(key, value)
    return true
  } catch (error) {
    if (error instanceof DOMException) {
      if (error.name === 'QuotaExceededError') {
        console.error(`Storage quota exceeded when setting key ${key}`)
      } else if (error.name === 'SecurityError') {
        console.error(`Security error when setting key ${key}`)
      } else {
        console.error(`Storage error when setting key ${key}:`, error)
      }
    } else {
      console.error(`Failed to set string for key ${key}:`, error)
    }
    return false
  }
}

/**
 * Safely remove item from storage
 * @param key Storage key
 * @param type Storage type (localStorage or sessionStorage)
 * @returns Success status
 */
export function safeRemoveItem(
  key: string, 
  type: StorageType = 'localStorage'
): boolean {
  try {
    if (!isStorageAvailable(type)) {
      console.warn(`${type} not available, cannot remove key: ${key}`)
      return false
    }

    const storage = type === 'localStorage' ? localStorage : sessionStorage
    storage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Failed to remove key ${key} from ${type}:`, error)
    return false
  }
}

/**
 * Get storage usage information (for debugging)
 */
export function getStorageInfo(type: StorageType = 'localStorage'): {
  available: boolean
  itemCount: number
  estimatedSize: number
} {
  try {
    if (!isStorageAvailable(type)) {
      return { available: false, itemCount: 0, estimatedSize: 0 }
    }

    const storage = type === 'localStorage' ? localStorage : sessionStorage
    let estimatedSize = 0
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (key) {
        const value = storage.getItem(key)
        estimatedSize += key.length + (value?.length || 0)
      }
    }
    
    return {
      available: true,
      itemCount: storage.length,
      estimatedSize
    }
  } catch (error) {
    console.error(`Failed to get storage info for ${type}:`, error)
    return { available: false, itemCount: 0, estimatedSize: 0 }
  }
}