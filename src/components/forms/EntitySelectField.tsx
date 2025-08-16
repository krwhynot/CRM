"use client"

import { useState } from "react"
import { Control, FieldValues, Path } from "react-hook-form"
import { DynamicSelectField, SelectOption } from "./DynamicSelectField"
import { QuickCreateOrganization } from "./QuickCreateOrganization"
import { QuickCreateContact } from "./QuickCreateContact"
import { 
  useOrganizationSearch,
  usePrincipalSearch,
  useDistributorSearch,
  useContactSearch,
  useProductSearch,
  useOpportunitySearch,
} from "@/hooks/useAsyncEntitySearch"
import { Building2, User, Package, Target } from "lucide-react"
import { toast } from "sonner"

export type EntitySelectType = 
  | 'organization' 
  | 'principal' 
  | 'distributor' 
  | 'contact' 
  | 'product' 
  | 'opportunity'

export interface EntitySelectFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  label: string
  entityType: EntitySelectType
  placeholder?: string
  description?: string
  required?: boolean
  disabled?: boolean
  className?: string
  
  // Filtering options
  organizationId?: string // For contact filtering
  organizationName?: string // For display purposes
  
  // Quick create options
  enableQuickCreate?: boolean
  quickCreateProps?: {
    preselectedType?: string
    organizationId?: string
    organizationName?: string
  }
  
  // Event handlers
  onQuickCreateSuccess?: (entity: any) => void
}

const entityIcons = {
  organization: Building2,
  principal: Building2,
  distributor: Building2,
  contact: User,
  product: Package,
  opportunity: Target,
}

const entityLabels = {
  organization: "Organization",
  principal: "Principal",
  distributor: "Distributor", 
  contact: "Contact",
  product: "Product",
  opportunity: "Opportunity",
}

export function EntitySelectField<TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  label,
  entityType,
  placeholder,
  description,
  required = false,
  disabled = false,
  className,
  organizationId,
  organizationName,
  enableQuickCreate = true,
  quickCreateProps,
  onQuickCreateSuccess,
}: EntitySelectFieldProps<TFieldValues>) {
  const [quickCreateOpen, setQuickCreateOpen] = useState(false)
  
  // Select the appropriate search hook based on entity type
  const organizationSearch = useOrganizationSearch()
  const principalSearch = usePrincipalSearch()
  const distributorSearch = useDistributorSearch()
  const contactSearch = useContactSearch(organizationId)
  const productSearch = useProductSearch()
  const opportunitySearch = useOpportunitySearch()

  const searchHooks = {
    organization: organizationSearch,
    principal: principalSearch,
    distributor: distributorSearch,
    contact: contactSearch,
    product: productSearch,
    opportunity: opportunitySearch,
  }

  const selectedSearch = searchHooks[entityType]
  const Icon = entityIcons[entityType]
  const entityLabel = entityLabels[entityType]

  // Handle search function
  const handleSearch = async (query: string): Promise<SelectOption[]> => {
    await selectedSearch.search(query)
    return selectedSearch.searchResults
  }

  // Handle quick create
  const handleQuickCreate = async () => {
    setQuickCreateOpen(true)
  }

  const handleQuickCreateSuccess = (entity: any) => {
    // Update search results to include the new entity
    selectedSearch.clearResults()
    
    // Notify parent component
    onQuickCreateSuccess?.(entity)
    
    // Show success message
    toast.success(`${entityLabel} created successfully`)
    
    // Close modal
    setQuickCreateOpen(false)
  }

  // Render quick create modal based on entity type
  const renderQuickCreateModal = () => {
    switch (entityType) {
      case 'organization':
      case 'principal':
      case 'distributor':
        return (
          <QuickCreateOrganization
            open={quickCreateOpen}
            onOpenChange={setQuickCreateOpen}
            onSuccess={handleQuickCreateSuccess}
            preselectedType={entityType === 'principal' ? 'principal' : entityType === 'distributor' ? 'distributor' : quickCreateProps?.preselectedType}
          />
        )
      
      case 'contact':
        return (
          <QuickCreateContact
            open={quickCreateOpen}
            onOpenChange={setQuickCreateOpen}
            onSuccess={handleQuickCreateSuccess}
            organizationId={quickCreateProps?.organizationId || organizationId}
            organizationName={quickCreateProps?.organizationName || organizationName}
          />
        )
      
      // TODO: Add QuickCreateProduct and QuickCreateOpportunity components
      case 'product':
      case 'opportunity':
        return null
      
      default:
        return null
    }
  }

  // Custom placeholder based on entity type
  const finalPlaceholder = placeholder || `Search ${entityLabel.toLowerCase()}s...`
  
  // Custom create new text
  const createNewText = `Create ${entityLabel}`

  // Custom no results text
  const noResultsText = organizationId && entityType === 'contact' 
    ? `No contacts found in ${organizationName || 'this organization'}`
    : `No ${entityLabel.toLowerCase()}s found`

  // Group function for organizations
  const groupBy = entityType === 'organization' 
    ? (option: SelectOption) => {
        const type = option.metadata?.type
        if (type === 'principal') return 'Principals'
        if (type === 'distributor') return 'Distributors'
        return 'Other Organizations'
      }
    : undefined

  return (
    <>
      <DynamicSelectField
        name={name}
        control={control}
        label={label}
        placeholder={finalPlaceholder}
        description={description}
        searchPlaceholder={`Search ${entityLabel.toLowerCase()}s...`}
        noResultsText={noResultsText}
        createNewText={createNewText}
        required={required}
        disabled={disabled}
        className={className}
        onSearch={handleSearch}
        onCreateNew={enableQuickCreate ? handleQuickCreate : undefined}
        showCreateWhenEmpty={enableQuickCreate}
        showCreateAlways={false}
        groupBy={groupBy}
        renderOption={(option) => (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="font-medium">{option.label}</span>
                {option.description && (
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                )}
              </div>
            </div>
            {option.badge && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                option.badge.variant === 'default' ? 'bg-primary text-primary-foreground' :
                option.badge.variant === 'secondary' ? 'bg-secondary text-secondary-foreground' :
                option.badge.variant === 'destructive' ? 'bg-destructive text-destructive-foreground' :
                'bg-muted text-muted-foreground'
              }`}>
                {option.badge.text}
              </span>
            )}
          </div>
        )}
        renderSelected={(option) => (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{option.label}</span>
            {option.badge && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                option.badge.variant === 'default' ? 'bg-primary text-primary-foreground' :
                option.badge.variant === 'secondary' ? 'bg-secondary text-secondary-foreground' :
                option.badge.variant === 'destructive' ? 'bg-destructive text-destructive-foreground' :
                'bg-muted text-muted-foreground'
              }`}>
                {option.badge.text}
              </span>
            )}
          </div>
        )}
      />
      
      {renderQuickCreateModal()}
    </>
  )
}