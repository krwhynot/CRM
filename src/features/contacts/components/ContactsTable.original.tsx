import React, { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Pencil, 
  Phone, 
  Eye, 
  ChevronDown, 
  ChevronRight,
  Plus,
  Star,
  Mail,
  Smartphone,
  ExternalLink,
  User,
  Briefcase,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Contact, ContactWithOrganization } from '@/types/entities'

interface ContactsTableProps {
  contacts: ContactWithOrganization[]
  loading?: boolean
  onEdit?: (contact: Contact) => void
  onDelete?: (contact: Contact) => void
  onView?: (contact: Contact) => void
  onContact?: (contact: Contact) => void
  onAddNew?: () => void
  showOrganization?: boolean
}

type FilterType = 'all' | 'decision-makers' | 'primary-contacts' | 'high-influence' | 'recently-added'

// Sample data matching CRM requirements
const sampleContacts: ContactWithOrganization[] = [
  {
    id: '1',
    first_name: 'John',
    last_name: 'Smith',
    title: 'Head Chef',
    email: 'john.smith@040kitchen.com',
    phone: '(555) 123-4567',
    mobile_phone: '(555) 123-4568',
    purchase_influence: 'High',
    decision_authority: 'Decision Maker',
    is_primary_contact: true,
    organization_id: '1',
    organization: {
      id: '1',
      name: '040 KITCHEN INC',
      type: 'customer' as any,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      description: null,
      phone: null,
      email: null,
      website: null,
      address_line_1: null,
      address_line_2: null,
      city: null,
      state_province: null,
      postal_code: null,
      country: null,
      industry: null,
      size: null,
      annual_revenue: null,
      employee_count: null,
      is_active: true,
      deleted_at: null,
      created_by: '',
      updated_by: '',
      import_notes: null,
      is_distributor: false,
      is_principal: false,
      notes: null,
      parent_organization_id: null,
      priority: 'A',
      segment: 'Fine Dining',
      primary_manager_name: null,
      search_tsv: null,
      secondary_manager_name: null
    },
    department: 'Kitchen Operations',
    linkedin_url: 'https://linkedin.com/in/johnsmith-chef',
    notes: 'Key decision maker for all kitchen equipment purchases',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: '',
    deleted_at: null,
    role: null,
    search_tsv: null,
    updated_by: ''
  },
  {
    id: '2',
    first_name: 'Sarah',
    last_name: 'Johnson',
    title: 'General Manager',
    email: 'sarah.j@2drestaurant.com',
    phone: '(555) 234-5678',
    purchase_influence: 'Medium',
    decision_authority: 'Influencer',
    is_primary_contact: true,
    organization_id: '2',
    organization: {
      id: '2',
      name: '2D RESTAURANT GROUP',
      type: 'customer' as any,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      description: null,
      phone: null,
      email: null,
      website: null,
      address_line_1: null,
      address_line_2: null,
      city: null,
      state_province: null,
      postal_code: null,
      country: null,
      industry: null,
      size: null,
      annual_revenue: null,
      employee_count: null,
      is_active: true,
      deleted_at: null,
      created_by: '',
      updated_by: '',
      import_notes: null,
      is_distributor: false,
      is_principal: false,
      notes: null,
      parent_organization_id: null,
      priority: 'B',
      segment: 'Fast Casual',
      primary_manager_name: null,
      search_tsv: null,
      secondary_manager_name: null
    },
    department: 'Operations',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: '',
    deleted_at: null,
    linkedin_url: null,
    mobile_phone: null,
    notes: null,
    role: null,
    search_tsv: null,
    updated_by: ''
  },
  {
    id: '3',
    first_name: 'David',
    last_name: 'Wilson',
    title: 'Purchasing Manager',
    email: 'dwilson@acmefood.com',
    phone: '(555) 345-6789',
    purchase_influence: 'High',
    decision_authority: 'Decision Maker',
    is_primary_contact: false,
    organization_id: '3',
    organization: {
      id: '3',
      name: 'ACME FOOD DISTRIBUTORS',
      type: 'distributor' as any,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      description: null,
      phone: null,
      email: null,
      website: null,
      address_line_1: null,
      address_line_2: null,
      city: null,
      state_province: null,
      postal_code: null,
      country: null,
      industry: null,
      size: null,
      annual_revenue: null,
      employee_count: null,
      is_active: true,
      deleted_at: null,
      created_by: '',
      updated_by: '',
      import_notes: null,
      is_distributor: true,
      is_principal: false,
      notes: null,
      parent_organization_id: null,
      priority: 'C',
      segment: 'Retail Food Service',
      primary_manager_name: null,
      search_tsv: null,
      secondary_manager_name: null
    },
    department: 'Procurement',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: '',
    deleted_at: null,
    linkedin_url: null,
    mobile_phone: null,
    notes: null,
    role: null,
    search_tsv: null,
    updated_by: ''
  }
]

export function ContactsTable({ 
  contacts = sampleContacts, 
  loading = false, 
  onEdit, 
  onView,
  onContact,
  onAddNew,
  showOrganization = true
}: ContactsTableProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // Filter pills configuration
  const filterPills = [
    { key: 'all' as FilterType, label: 'All', count: contacts.length },
    { key: 'decision-makers' as FilterType, label: 'Decision Makers', count: 0 },
    { key: 'primary-contacts' as FilterType, label: 'Primary Contacts', count: 0 },
    { key: 'high-influence' as FilterType, label: 'High Influence', count: 0 },
    { key: 'recently-added' as FilterType, label: 'Recently Added', count: 0 }
  ]

  // Filtered and searched contacts
  const filteredContacts = useMemo(() => {
    let filtered = contacts

    // Apply filter
    switch (activeFilter) {
      case 'decision-makers':
        filtered = filtered.filter(contact => contact.decision_authority === 'Decision Maker')
        break
      case 'primary-contacts':
        filtered = filtered.filter(contact => contact.is_primary_contact)
        break
      case 'high-influence':
        filtered = filtered.filter(contact => contact.purchase_influence === 'High')
        break
      case 'recently-added':
        // TODO: Implement based on created_at date
        break
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(contact => 
        `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(term) ||
        contact.title?.toLowerCase().includes(term) ||
        contact.email?.toLowerCase().includes(term) ||
        contact.organization?.name?.toLowerCase().includes(term) ||
        contact.phone?.includes(term)
      )
    }

    return filtered
  }, [contacts, activeFilter, searchTerm])

  // Update filter counts
  const updatedFilterPills = useMemo(() => {
    return filterPills.map(pill => ({
      ...pill,
      count: pill.key === 'all' ? contacts.length :
             pill.key === 'decision-makers' ? contacts.filter(c => c.decision_authority === 'Decision Maker').length :
             pill.key === 'primary-contacts' ? contacts.filter(c => c.is_primary_contact).length :
             pill.key === 'high-influence' ? contacts.filter(c => c.purchase_influence === 'High').length :
             pill.key === 'recently-added' ? 0 : 0
    }))
  }, [contacts])

  const toggleRowExpansion = (contactId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(contactId)) {
      newExpanded.delete(contactId)
    } else {
      newExpanded.add(contactId)
    }
    setExpandedRows(newExpanded)
  }

  const getInfluenceColor = (influence: string | null) => {
    switch (influence) {
      case 'High':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getAuthorityColor = (authority: string | null) => {
    switch (authority) {
      case 'Decision Maker':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Influencer':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'End User':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Gatekeeper':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPrimaryContactInfo = (contact: ContactWithOrganization) => {
    if (contact.email) return contact.email
    if (contact.phone) return contact.phone
    if (contact.mobile_phone) return contact.mobile_phone
    return null
  }

  const EmptyCell = () => <span className="text-gray-400">—</span>

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search contacts..."
            className="pl-10 h-12 text-lg"
            disabled
          />
        </div>
        
        <div className="border rounded-lg bg-white">
          <div className="p-12 text-center space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="text-lg font-semibold text-gray-700">Loading contacts...</div>
            <div className="text-gray-500">Please wait while we fetch your data</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-lg border-2 focus:border-blue-500"
          />
        </div>
        
        {onAddNew && (
          <Button 
            onClick={onAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 h-12"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Contact
          </Button>
        )}
      </div>

      {/* Sticky Filter Pills */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b pb-4">
        <div className="flex flex-wrap gap-2">
          {updatedFilterPills.map((pill) => (
            <button
              key={pill.key}
              onClick={() => setActiveFilter(pill.key)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                "border-2 flex items-center gap-2",
                activeFilter === pill.key
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
              )}
            >
              {pill.label}
              <span className={cn(
                "px-2 py-0.5 text-xs rounded-full",
                activeFilter === pill.key
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-500"
              )}>
                {pill.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80">
                <TableHead className="w-12"></TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[200px]">Contact</TableHead>
                {showOrganization && (
                  <TableHead className="font-semibold text-gray-700 min-w-[150px]">Organization</TableHead>
                )}
                <TableHead className="font-semibold text-gray-700 min-w-[120px]">Position</TableHead>
                <TableHead className="font-semibold text-gray-700 min-w-[140px]">Primary Contact</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center min-w-[120px]">Status</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center min-w-[150px]">Quick Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showOrganization ? 7 : 6} className="text-center py-12">
                    <div className="space-y-3">
                      <div className="text-lg font-medium text-gray-500">
                        {searchTerm || activeFilter !== 'all' ? 'No contacts match your criteria' : 'No contacts found'}
                      </div>
                      <div className="text-sm text-gray-400">
                        {searchTerm || activeFilter !== 'all' ? 'Try adjusting your search or filters' : 'Get started by adding your first contact'}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredContacts.map((contact, index) => {
                  const isExpanded = expandedRows.has(contact.id)
                  const primaryContactInfo = getPrimaryContactInfo(contact)
                  
                  return (
                    <React.Fragment key={contact.id}>
                      {/* Main Row */}
                      <TableRow 
                        className={cn(
                          "hover:bg-gray-50/80 transition-colors border-b",
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                        )}
                      >
                        {/* Expand Toggle */}
                        <TableCell className="p-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRowExpansion(contact.id)}
                            className="h-8 w-8 p-0 hover:bg-gray-200"
                          >
                            {isExpanded ? 
                              <ChevronDown className="h-4 w-4 text-gray-500" /> : 
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            }
                          </Button>
                        </TableCell>

                        {/* Contact Name */}
                        <TableCell className="font-semibold">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-gray-900 text-base">
                              {contact.first_name} {contact.last_name}
                            </div>
                            {contact.is_primary_contact && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                        </TableCell>

                        {/* Organization */}
                        {showOrganization && (
                          <TableCell>
                            <span className="text-gray-900">
                              {contact.organization?.name || <EmptyCell />}
                            </span>
                          </TableCell>
                        )}

                        {/* Position */}
                        <TableCell>
                          <span className="text-gray-900">
                            {contact.title || <EmptyCell />}
                          </span>
                        </TableCell>

                        {/* Primary Contact Info */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {primaryContactInfo ? (
                              <>
                                {contact.email && primaryContactInfo === contact.email && (
                                  <Mail className="h-4 w-4 text-gray-500" />
                                )}
                                {(contact.phone || contact.mobile_phone) && primaryContactInfo !== contact.email && (
                                  <Phone className="h-4 w-4 text-gray-500" />
                                )}
                                <span className="text-sm text-gray-600 font-mono">
                                  {primaryContactInfo}
                                </span>
                              </>
                            ) : (
                              <EmptyCell />
                            )}
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="text-center">
                          <div className="flex flex-col gap-1">
                            {contact.is_primary_contact && (
                              <Badge variant="outline" className="text-xs">
                                Primary
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Quick Actions */}
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            {onEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(contact)}
                                className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700"
                                title="Edit Contact"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {onContact && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onContact(contact)}
                                className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700"
                                title="Contact Person"
                              >
                                <Phone className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {onView && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onView(contact)}
                                className="h-8 w-8 p-0 hover:bg-gray-100 hover:text-gray-700"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expandable Row Details */}
                      {isExpanded && (
                        <TableRow className="border-b-2 border-gray-100">
                          <TableCell 
                            colSpan={showOrganization ? 7 : 6} 
                            className="bg-mfb-sage-tint border-l-4 border-mfb-green p-6 transition-all duration-300 ease-out"
                          >
                            <div className="space-y-6">
                              {/* Contact Methods - Full Width */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                  <Phone className="h-4 w-4" />
                                  Contact Methods
                                </div>
                                <div className="text-sm text-gray-600 pl-6 space-y-1">
                                  {contact.email && (
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-3 w-3" />
                                      <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                                        {contact.email}
                                      </a>
                                    </div>
                                  )}
                                  {contact.phone && (
                                    <div className="flex items-center gap-2">
                                      <Phone className="h-3 w-3" />
                                      <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                                        {contact.phone}
                                      </a>
                                    </div>
                                  )}
                                  {contact.mobile_phone && (
                                    <div className="flex items-center gap-2">
                                      <Smartphone className="h-3 w-3" />
                                      <a href={`tel:${contact.mobile_phone}`} className="text-blue-600 hover:underline">
                                        {contact.mobile_phone}
                                      </a>
                                    </div>
                                  )}
                                  {!contact.email && !contact.phone && !contact.mobile_phone && <EmptyCell />}
                                </div>
                              </div>

                              {/* Compact Info Row 1: Purchase Influence + Decision Authority */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <User className="h-4 w-4" />
                                    Purchase Influence
                                  </div>
                                  <div className="pl-6">
                                    <Badge className={cn("font-medium border", getInfluenceColor(contact.purchase_influence))}>
                                      {contact.purchase_influence || 'Unknown'}
                                    </Badge>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <User className="h-4 w-4" />
                                    Decision Authority
                                  </div>
                                  <div className="pl-6">
                                    <Badge className={cn("font-medium border", getAuthorityColor(contact.decision_authority))}>
                                      {contact.decision_authority || 'Gatekeeper'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              {/* Compact Info Row 2: Department + LinkedIn */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <Briefcase className="h-4 w-4" />
                                    Department
                                  </div>
                                  <div className="text-sm text-gray-600 pl-6">
                                    {contact.department || <EmptyCell />}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <ExternalLink className="h-4 w-4" />
                                    LinkedIn Profile
                                  </div>
                                  <div className="text-sm pl-6">
                                    {contact.linkedin_url ? (
                                      <a
                                        href={contact.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 hover:underline"
                                      >
                                        View Profile
                                      </a>
                                    ) : (
                                      <EmptyCell />
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Notes - Full Width (only if present) */}
                              {contact.notes && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <FileText className="h-4 w-4" />
                                    Notes
                                  </div>
                                  <div className="text-sm text-gray-600 pl-6">
                                    {contact.notes}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center text-sm text-gray-500 px-1">
        <span>
          Showing {filteredContacts.length} of {contacts.length} contacts
        </span>
        <span>
          {searchTerm && `Filtered by: "${searchTerm}"`}
          {activeFilter !== 'all' && (searchTerm ? ' • ' : '') + `Filter: ${updatedFilterPills.find(p => p.key === activeFilter)?.label}`}
        </span>
      </div>
    </div>
  )
}
