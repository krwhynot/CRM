import { useMemo } from 'react'
import { parseISO } from 'date-fns'
import { useOrganizations } from '@/hooks/useOrganizations'
import { useContacts } from '@/hooks/useContacts'
import { useOpportunities } from '@/features/opportunities/hooks/useOpportunities'
import { useInteractions } from '@/features/interactions/hooks/useInteractions'
import { useProducts } from '@/hooks/useProducts'

export interface ActivityItem {
  id: string
  type: 'opportunity' | 'interaction' | 'contact' | 'organization' | 'product'
  title: string
  description: string
  timestamp: Date
  entity?: string
  priority?: 'high' | 'medium' | 'low'
  status?: string
  relatedData?: any
}

const INTERACTION_TYPE_ICONS = {
  phone: 'Phone',
  email: 'Mail',
  meeting: 'Calendar',
  demo: 'Heart',
  follow_up: 'RefreshCw'
}

interface UseEnhancedActivityDataReturn {
  activityItems: ActivityItem[]
  isLoading: boolean
  refresh: () => void
}

export const useEnhancedActivityData = (refreshKey: number): UseEnhancedActivityDataReturn => {
  // Data hooks
  const { data: organizations = [], isLoading: orgLoading } = useOrganizations()
  const { data: contacts = [], isLoading: contactLoading } = useContacts()
  const { data: opportunities = [], isLoading: oppLoading } = useOpportunities()
  const { data: interactions = [], isLoading: intLoading } = useInteractions()
  const { data: products = [], isLoading: prodLoading } = useProducts()

  const isLoading = orgLoading || contactLoading || oppLoading || intLoading || prodLoading

  // Transform data into activity items
  const activityItems: ActivityItem[] = useMemo(() => {
    const items: ActivityItem[] = []

    // Organizations
    organizations.forEach(org => {
      if (org.created_at) {
        items.push({
          id: `org-${org.id}`,
          type: 'organization',
          title: org.name,
          description: `New ${org.type} organization added`,
          timestamp: parseISO(org.created_at),
          entity: org.name,
          status: org.is_active ? 'active' : 'inactive',
          priority: org.type === 'principal' ? 'high' : 'medium',
          relatedData: org
        })
      }
    })

    // Contacts
    contacts.forEach(contact => {
      if (contact.created_at) {
        items.push({
          id: `contact-${contact.id}`,
          type: 'contact',
          title: `${contact.first_name} ${contact.last_name}`,
          description: `New contact added${contact.title ? ` - ${contact.title}` : ''}`,
          timestamp: parseISO(contact.created_at),
          entity: `${contact.first_name} ${contact.last_name}`,
          status: contact.is_primary_contact ? 'primary' : 'active',
          priority: contact.is_primary_contact ? 'high' : 'medium',
          relatedData: contact
        })
      }
    })

    // Opportunities
    opportunities.forEach(opp => {
      if (opp.created_at) {
        items.push({
          id: `opp-${opp.id}`,
          type: 'opportunity',
          title: opp.name,
          description: `New opportunity created - ${opp.stage || 'New Lead'}`,
          timestamp: parseISO(opp.created_at),
          entity: opp.name,
          status: opp.stage?.toLowerCase().replace(' ', '_') || 'new_lead',
          priority: opp.stage === 'Demo Scheduled' || opp.stage === 'Closed - Won' ? 'high' : 'medium',
          relatedData: opp
        })
      }
    })

    // Interactions
    interactions.forEach(interaction => {
      if (interaction.created_at) {
        const InteractionIcon = INTERACTION_TYPE_ICONS[interaction.type as keyof typeof INTERACTION_TYPE_ICONS]
        items.push({
          id: `int-${interaction.id}`,
          type: 'interaction',
          title: `${interaction.type || 'Contact'} - ${interaction.subject || 'Interaction'}`,
          description: interaction.subject || `New ${interaction.type} interaction recorded`,
          timestamp: parseISO(interaction.created_at),
          entity: interaction.subject,
          status: 'completed',
          priority: interaction.type === 'demo' || interaction.type === 'meeting' ? 'high' : 'medium',
          relatedData: { ...interaction, icon: InteractionIcon }
        })
      }
    })

    // Products
    products.forEach(product => {
      if (product.created_at) {
        items.push({
          id: `prod-${product.id}`,
          type: 'product',
          title: product.name,
          description: `New product added${product.category ? ` - ${product.category}` : ''}`,
          timestamp: parseISO(product.created_at),
          entity: product.name,
          status: 'active',
          priority: 'low',
          relatedData: product
        })
      }
    })

    return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [organizations, contacts, opportunities, interactions, products, refreshKey])

  const refresh = () => {
    // Refresh is handled by parent component through refreshKey
  }

  return {
    activityItems,
    isLoading,
    refresh
  }
}