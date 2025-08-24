import type { ContactWithOrganization } from '@/types/entities'

// Sample data matching CRM requirements for ContactsTable
export const DEFAULT_CONTACTS: ContactWithOrganization[] = [
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
      updated_at: new Date().toISOString()
    },
    department: 'Kitchen Operations',
    linkedin_url: 'https://linkedin.com/in/johnsmith-chef',
    notes: 'Key decision maker for all kitchen equipment purchases',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
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
      updated_at: new Date().toISOString()
    },
    department: 'Operations',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
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
      updated_at: new Date().toISOString()
    },
    department: 'Procurement',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]