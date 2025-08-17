import React, { useState, useMemo } from 'react'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from 'lucide-react'

export interface EntityOption {
  id: string
  name: string
  description?: string
  metadata?: Record<string, any>
}

export interface EntitySelectProps {
  options: EntityOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  searchable?: boolean
  disabled?: boolean
  loading?: boolean
  emptyMessage?: string
  className?: string
}

export function EntitySelect({
  options,
  value,
  onValueChange,
  placeholder,
  searchable = true,
  disabled = false,
  loading = false,
  emptyMessage = "No options found",
  className
}: EntitySelectProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options
    
    const searchLower = searchTerm.toLowerCase()
    return options.filter(option => 
      option.name.toLowerCase().includes(searchLower) ||
      option.description?.toLowerCase().includes(searchLower)
    )
  }, [options, searchTerm])

  // Get selected option display
  const selectedOption = options.find(option => option.id === value)

  const handleClearSearch = () => {
    setSearchTerm('')
  }

  const handleSelectOption = (optionId: string) => {
    onValueChange(optionId)
    setSearchTerm('')
    setIsOpen(false)
  }

  if (loading) {
    return (
      <div className="h-12 w-full rounded-md border border-gray-300 bg-gray-50 flex items-center px-4">
        <span className="text-gray-500 text-base">Loading options...</span>
      </div>
    )
  }

  return (
    <div className={className}>
      <Select
        value={value}
        onValueChange={handleSelectOption}
        disabled={disabled}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SelectTrigger className="h-12 text-base px-4 focus:ring-2 focus:ring-blue-200">
          <SelectValue placeholder={placeholder}>
            {selectedOption?.name || placeholder}
          </SelectValue>
        </SelectTrigger>
        
        <SelectContent className="max-h-80 overflow-y-auto">
          {searchable && (
            <div className="p-2 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search options..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 pl-10 pr-10 text-sm"
                  autoFocus={false}
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSearch}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {filteredOptions.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              {emptyMessage}
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {filteredOptions.map((option) => (
                <SelectItem 
                  key={option.id} 
                  value={option.id}
                  className="h-12 px-4 cursor-pointer hover:bg-gray-50 focus:bg-blue-50"
                >
                  <div className="flex flex-col items-start w-full">
                    <span className="font-medium text-base">{option.name}</span>
                    {option.description && (
                      <span className="text-xs text-gray-500 mt-1">
                        {option.description}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}

// Export specialized versions for common CRM entities
export interface OrganizationSelectProps extends Omit<EntitySelectProps, 'options'> {
  organizations: Array<{
    id: string
    name: string
    type?: string
    segment?: string
  }>
}

export function OrganizationSelect({ organizations, ...props }: OrganizationSelectProps) {
  const options: EntityOption[] = organizations.map(org => ({
    id: org.id,
    name: org.name,
    description: org.type && org.segment ? `${org.type} - ${org.segment}` : org.type || org.segment,
    metadata: { type: org.type, segment: org.segment }
  }))

  return <EntitySelect options={options} {...props} />
}

export interface ContactSelectProps extends Omit<EntitySelectProps, 'options'> {
  contacts: Array<{
    id: string
    first_name: string
    last_name: string
    title?: string
    organization?: { name: string }
  }>
}

export function ContactSelect({ contacts, ...props }: ContactSelectProps) {
  const options: EntityOption[] = contacts.map(contact => ({
    id: contact.id,
    name: `${contact.first_name} ${contact.last_name}`,
    description: contact.title && contact.organization 
      ? `${contact.title} at ${contact.organization.name}`
      : contact.title || contact.organization?.name,
    metadata: { title: contact.title, organization: contact.organization }
  }))

  return <EntitySelect options={options} {...props} />
}

export interface ProductSelectProps extends Omit<EntitySelectProps, 'options'> {
  products: Array<{
    id: string
    name: string
    sku?: string
    category?: string
    principal?: { name: string }
  }>
}

export function ProductSelect({ products, ...props }: ProductSelectProps) {
  const options: EntityOption[] = products.map(product => ({
    id: product.id,
    name: product.name,
    description: [
      product.sku && `SKU: ${product.sku}`,
      product.principal?.name,
      product.category
    ].filter(Boolean).join(' • '),
    metadata: { sku: product.sku, category: product.category, principal: product.principal }
  }))

  return <EntitySelect options={options} {...props} />
}