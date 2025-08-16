import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { organizationSchema, type OrganizationFormData, FOOD_SERVICE_SEGMENTS, type FoodServiceSegment, ORGANIZATION_TYPES, type OrganizationType, deriveOrganizationType } from '@/types/organization.types'
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { FormErrorBoundary } from '@/components/ui/form-error-boundary'
import { useAdvocacyRelationships } from '@/stores/contactAdvocacyStore'
import { Building2, HelpCircle, Users, Star, ChevronDown, ChevronRight } from 'lucide-react'
import type { Organization, Contact } from '@/types/entities'
import type { OrganizationPriority } from '@/types/organization.types'

interface OrganizationFormProps {
  onSubmit: (data: OrganizationFormData) => void
  initialData?: Partial<Organization>
  loading?: boolean
  submitLabel?: string
}

// Priority configuration for Principal CRM
const priorityConfig: Record<OrganizationPriority, { 
  label: string; 
  description: string; 
  color: string; 
  icon: string 
}> = {
  'A': {
    label: 'A - High Priority',
    description: 'Strategic accounts with high revenue potential and strong relationships',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '🎯'
  },
  'B': {
    label: 'B - Medium Priority', 
    description: 'Important accounts with good potential for growth and expansion',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '📈'
  },
  'C': {
    label: 'C - Standard Priority',
    description: 'Regular accounts requiring standard attention and service',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
    icon: '📊'
  },
  'D': {
    label: 'D - Low Priority',
    description: 'Cold prospects or low-engagement accounts needing nurturing',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '❄️'
  }
}

// Segment configuration for food service industry
const segmentDescriptions: Record<FoodServiceSegment, string> = {
  'Fine Dining': 'High-end restaurants focused on premium ingredients and presentation',
  'Fast Food': 'Quick service restaurants emphasizing speed and consistency',
  'Fast Casual': 'Higher quality fast food with made-to-order items',
  'Healthcare': 'Hospitals, clinics, and medical facilities',
  'Education': 'Schools, universities, and educational institutions',
  'Corporate Catering': 'Business catering and corporate dining services',
  'Hotel & Resort': 'Hospitality industry including hotels and resorts',
  'Entertainment Venue': 'Sports venues, theaters, and entertainment facilities',
  'Retail Food Service': 'Grocery stores and retail food operations',
  'Government': 'Government agencies and military food service',
  'Senior Living': 'Assisted living and senior care facilities',
  'Other': 'Specialized or unique food service operations'
}

interface AdvocacySummaryProps {
  organizationId: string
  isVisible: boolean
}

function AdvocacySummary({ organizationId, isVisible }: AdvocacySummaryProps) {
  const { relationships, fetchRelationships, isLoading } = useAdvocacyRelationships()
  const [advocacyData, setAdvocacyData] = useState<{
    totalAdvocates: number
    averageStrength: number
    topAdvocates: Array<{ contact: Contact; strength: number }>
  }>({ totalAdvocates: 0, averageStrength: 0, topAdvocates: [] })

  useEffect(() => {
    if (isVisible && organizationId) {
      fetchRelationships({ principal_organization_id: organizationId })
    }
  }, [isVisible, organizationId, fetchRelationships])

  useEffect(() => {
    const orgRelationships = relationships.filter(rel => 
      rel.principal_organization_id === organizationId
    )
    
    if (orgRelationships.length > 0) {
      const totalAdvocates = orgRelationships.length
      const averageStrength = orgRelationships.reduce(
        (sum, rel) => sum + (rel.advocacy_strength || 0), 0
      ) / totalAdvocates
      
      const topAdvocates = orgRelationships
        .filter(rel => rel.contact)
        .sort((a, b) => (b.advocacy_strength || 0) - (a.advocacy_strength || 0))
        .slice(0, 3)
        .map(rel => ({
          contact: rel.contact!,
          strength: rel.advocacy_strength || 0
        }))
      
      setAdvocacyData({ totalAdvocates, averageStrength, topAdvocates })
    }
  }, [relationships, organizationId])

  if (!isVisible || isLoading) {
    return (
      <div className="text-sm text-muted-foreground">
        {isLoading ? 'Loading advocacy data...' : 'Enable Principal status to view advocacy relationships'}
      </div>
    )
  }

  return (
    <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-blue-600" />
        <span className="font-medium text-blue-900">Contact Advocacy Summary</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">Total Advocates:</span>
            <Badge variant="secondary">{advocacyData.totalAdvocates}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">Average Strength:</span>
            <Badge variant="secondary">
              {advocacyData.averageStrength.toFixed(1)}/10
            </Badge>
          </div>
        </div>
        
        {advocacyData.topAdvocates.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium text-blue-700">Top Advocates:</span>
            {advocacyData.topAdvocates.map((advocate) => (
              <div key={advocate.contact.id} className="flex items-center justify-between text-xs">
                <span className="text-blue-600">
                  {advocate.contact.first_name} {advocate.contact.last_name}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span>{advocate.strength}/10</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function OrganizationForm({ 
  onSubmit, 
  initialData, 
  loading = false,
  submitLabel = 'Save Organization'
}: OrganizationFormProps) {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [showAdvocacySummary, setShowAdvocacySummary] = useState(false)
  
  const form = useForm({
    resolver: yupResolver(organizationSchema) as any,
    defaultValues: {
      name: initialData?.name || '',
      priority: (initialData?.priority as OrganizationPriority) || 'C',
      segment: initialData?.segment || '',
      type: (initialData?.type as OrganizationType) || deriveOrganizationType(
        initialData?.is_principal || false,
        initialData?.is_distributor || false
      ),
      is_principal: initialData?.is_principal || false,
      is_distributor: initialData?.is_distributor || false,
      address: initialData?.address_line_1 || null,
      city: initialData?.city || null,
      state: initialData?.state_province || null,
      zip: initialData?.postal_code || null,
      phone: initialData?.phone || null,
      website: initialData?.website || null,
      notes: initialData?.notes || null,
    }
  })
  
  const watchedValues = form.watch()
  const isPrincipal = watchedValues.is_principal
  const isDistributor = watchedValues.is_distributor
  const selectedPriority = watchedValues.priority
  const selectedSegment = watchedValues.segment
  const selectedType = watchedValues.type
  
  useEffect(() => {
    setShowAdvocacySummary(isPrincipal && !!initialData?.id)
  }, [isPrincipal, initialData?.id])

  // Sync type field when boolean flags change
  useEffect(() => {
    const derivedType = deriveOrganizationType(isPrincipal, isDistributor)
    if (selectedType !== derivedType) {
      form.setValue('type', derivedType)
    }
  }, [isPrincipal, isDistributor, selectedType, form])

  const handleFormSubmit = (data: OrganizationFormData) => {
    // Clean up data before submission and map form fields to database fields
    const cleanData = {
      name: data.name,
      priority: data.priority,
      segment: data.segment,
      type: data.type, // Include the required type field
      is_principal: data.is_principal,
      is_distributor: data.is_distributor,
      // Map form fields to database field names
      address_line_1: data.address || null,
      city: data.city || null,
      state_province: data.state || null,
      postal_code: data.zip || null,
      phone: data.phone || null,
      website: data.website || null,
      notes: data.notes || null
    }
    onSubmit(cleanData)
  }

  return (
    <FormErrorBoundary>
      <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          {initialData ? 'Edit Organization' : 'New Organization'}
        </CardTitle>
        {(isPrincipal || isDistributor) && (
          <div className="flex gap-2 mt-2">
            {isPrincipal && (
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                Principal
              </Badge>
            )}
            {isDistributor && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                Distributor
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Essential Information */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Organization Name
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter organization name"
                          disabled={loading}
                          className="h-12 text-base" // Larger touch target
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Account Priority
                        <span className="text-red-500">*</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Set the strategic importance and engagement level for this account</p>
                          </TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Select priority level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(priorityConfig).map(([priority, config]) => (
                            <SelectItem key={priority} value={priority}>
                              <div className="flex items-center gap-2">
                                <span>{config.icon}</span>
                                <div>
                                  <div className="font-medium">{config.label}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {config.description}
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedPriority && (
                        <div className="mt-2">
                          <Badge className={priorityConfig[selectedPriority].color}>
                            {priorityConfig[selectedPriority].icon} {priorityConfig[selectedPriority].label}
                          </Badge>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="segment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Food Service Segment
                      <span className="text-red-500">*</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Select the primary food service market segment this organization operates in</p>
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Select food service segment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FOOD_SERVICE_SEGMENTS.map((segment) => (
                          <SelectItem key={segment} value={segment}>
                            <div>
                              <div className="font-medium">{segment}</div>
                              <div className="text-xs text-muted-foreground">
                                {segmentDescriptions[segment]}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedSegment && (
                      <FormDescription className="text-sm text-muted-foreground">
                        {segmentDescriptions[selectedSegment as FoodServiceSegment]}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Organization Type
                      <span className="text-red-500">*</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          <p>Select the organization's business relationship type with your company</p>
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value)
                        // Auto-update boolean flags based on type selection
                        const isPrincipal = value === 'principal'
                        const isDistributor = value === 'distributor'
                        form.setValue('is_principal', isPrincipal)
                        form.setValue('is_distributor', isDistributor)
                      }} 
                      defaultValue={field.value}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Select organization type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ORGANIZATION_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            <div className="capitalize">{type}</div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Organization Type Management */}
            <div className="space-y-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-amber-900">Business Relationship Details</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-amber-600" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p><strong>Principal:</strong> Food manufacturers or suppliers that Master Food Brokers represents</p>
                    <p><strong>Distributor:</strong> Companies that purchase and distribute products to end customers</p>
                    <p>These flags work with the organization type above to define the business relationship</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              <div className="text-sm text-amber-700 mb-3">
                Current Type: <strong className="capitalize">{selectedType}</strong>
                {selectedType === 'principal' && ' - This organization is a principal we represent'}
                {selectedType === 'distributor' && ' - This organization distributes our products'}
                {selectedType === 'customer' && ' - This organization is a customer or prospect'}
                {selectedType === 'prospect' && ' - This organization is a potential customer'}
                {selectedType === 'vendor' && ' - This organization provides services to us'}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="is_principal"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-medium">
                          Principal Organization
                        </FormLabel>
                        <FormDescription className="text-sm">
                          Food manufacturer or supplier that we represent
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked)
                            // Auto-update type when flags change
                            const newType = deriveOrganizationType(checked, isDistributor)
                            form.setValue('type', newType)
                          }}
                          disabled={loading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="is_distributor"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-medium">
                          Distributor Organization
                        </FormLabel>
                        <FormDescription className="text-sm">
                          Company that purchases and distributes our products
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked)
                            // Auto-update type when flags change
                            const newType = deriveOrganizationType(isPrincipal, checked)
                            form.setValue('type', newType)
                          }}
                          disabled={loading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Advocacy Summary for Principals */}
            {isPrincipal && initialData?.id && (
              <AdvocacySummary 
                organizationId={initialData.id} 
                isVisible={showAdvocacySummary}
              />
            )}

            {/* Contact and Location Information */}
            <Collapsible 
              open={showAdvancedOptions} 
              onOpenChange={setShowAdvancedOptions}
            >
              <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {showAdvancedOptions ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                Contact & Location Details (Optional)
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-6 mt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="(555) 123-4567"
                              disabled={loading}
                              className="h-12 text-base"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://www.company.com"
                              disabled={loading}
                              className="h-12 text-base"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Address Information</h3>
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="123 Main Street, Suite 100"
                            disabled={loading}
                            className="h-12 text-base"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="City"
                              disabled={loading}
                              className="h-12 text-base"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State/Province</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="State"
                              disabled={loading}
                              className="h-12 text-base"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="zip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP/Postal Code</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="12345"
                              disabled={loading}
                              className="h-12 text-base"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>



            {/* Notes Section */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional information about this organization..."
                      disabled={loading}
                      rows={4}
                      className="text-base"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Internal notes, special requirements, relationship history, etc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              <Button type="submit" disabled={loading} className="flex-1 h-12 text-base">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </div>
                ) : (
                  submitLabel
                )}
              </Button>
              {initialData && (
                <Button 
                  type="button" 
                  variant="outline" 
                  className="h-12 text-base"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
    </FormErrorBoundary>
  )
}