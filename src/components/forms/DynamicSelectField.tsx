// Re-export the modular DynamicSelectField for backward compatibility
// This ensures existing imports continue to work while using the new architecture

export { DynamicSelectField } from "./dynamic-select"
export type { 
  SelectOption, 
  DynamicSelectFieldProps 
} from "./dynamic-select"

// Note: This file now serves as a thin compatibility layer
// The actual implementation is in the modular ./dynamic-select/ directory
// This approach maintains backward compatibility while enabling the new architecture