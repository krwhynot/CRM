/**
 * Contacts Page Schema Configuration
 *
 * Layout-as-data configuration for the Contacts page, supporting both traditional
 * slot-based composition and schema-driven rendering with expanded content and
 * table integration as additional complexity layers.
 */

import type {
  ContactLayoutConfig,
  SlotConfiguration,
} from '@/types/layout/schema.types'
import type { Contact } from '@/types/entities'

/**
 * Extended contact interface with expanded content layers
 */
export interface ContactWithExpandedContent extends Contact {
  // Decision Authority Tracking
  decision_authority_level?: 'high' | 'medium' | 'low'
  budget_authority?: boolean
  technical_authority?: boolean
  user_authority?: boolean

  // Purchase Influence Scoring
  purchase_influence_score?: number
  high_value_contact?: boolean

  // Weekly Context Integration
  recent_interactions_count?: number
  last_interaction_date?: string | Date
  needs_follow_up?: boolean

  // Organization Context
  organization?: {
    id: string
    name: string
    type: string
    segment?: string
  }
}

/**
 * Header slot configuration for contacts page
 */
const contactsHeaderSlot: SlotConfiguration = {
  id: 'header',
  type: 'header',
  name: 'pageHeader',
  displayName: 'Page Header',
  required: true,
  multiple: false,
  defaultComponent: 'PageHeader',
  props: {
    title: 'Contacts',
    subtitle: 'Manage your business relationships and decision makers',
  }
}

/**
 * Actions slot configuration with create contact functionality
 */
const contactsActionsSlot: SlotConfiguration = {
  id: 'actions',
  type: 'actions',
  name: 'pageActions',
  displayName: 'Page Actions',
  required: false,
  multiple: false,
  defaultComponent: 'ActionGroup',
  props: {
    actions: [{
      type: 'primary',
      label: 'Add Contact',
      icon: 'Plus',
      action: 'contacts:create'
    }]
  }
}

/**
 * Content slot configuration with expanded table integration
 */
const contactsContentSlot: SlotConfiguration = {
  id: 'content',
  type: 'content',
  name: 'pageContent',
  displayName: 'Page Content',
  required: true,
  multiple: false,
  defaultComponent: 'ContactsDataDisplay',
  props: {
    features: {
      virtualization: 'auto',
      expansion: true,
      selection: true
    }
  }
}

/**
 * Main contacts page layout configuration
 */
export const contactsPageSchema: ContactLayoutConfig = {
  id: 'contacts-list-page',
  name: 'Contacts List Page',
  version: '1.0.0',
  entityType: 'contacts',
  type: 'slots',

  // Layout metadata
  metadata: {
    displayName: 'Contacts List Page',
    description: 'Schema-driven contacts list with expanded content and decision authority tracking',
    category: 'default',
    tags: ['contacts', 'list', 'expandable', 'authority-tracking'],
    isShared: false,
    isDefault: true,
    usageCount: 0
  },

  // Entity-specific configuration
  entitySpecific: {
    roleFilters: [],
    authorityLevels: ['high', 'medium', 'low'],
    organizationContext: true
  },

  // Slot-based layout structure
  structure: {
    slots: [
      contactsHeaderSlot,
      contactsActionsSlot,
      contactsContentSlot
    ],
    composition: {
      requiredSlots: ['header', 'content'],
      maxSlots: 10,
      slotOrder: ['header', 'actions', 'content'],
      inheritance: {
        overrides: [],
        merge: []
      },
      validation: {
        required: ['header', 'content'],
        dependencies: {},
        conflicts: {}
      }
    },
    responsive: {
      breakpoints: {
        mobile: 768,
        tablet: 1024,
        laptop: 1280,
        desktop: 1920
      },
      mobileFirst: true,
      adaptiveLayout: true
    }
  }
}

/**
 * Default layout configuration for backward compatibility
 */
export const defaultContactsLayout = contactsPageSchema

/**
 * Schema version for migration tracking
 */
export const CONTACTS_SCHEMA_VERSION = '1.0.0'

/**
 * Export layout for registration
 */
export default contactsPageSchema