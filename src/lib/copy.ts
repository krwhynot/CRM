/**
 * Centralized copy and UX writing constants
 * This ensures consistency across the application and makes copy updates easier
 */

/** Terms config for consistent terminology */
export const TERMS = {
  INTERACTION_SINGULAR: 'Interaction',
  INTERACTION_PLURAL: 'Interactions',
} as const

export const COPY = {
  // Loading States
  LOADING: {
    SAVING: 'Saving…',
    DELETING: 'Deleting…',
    CREATING: 'Creating…',
    UPDATING: 'Updating…',
    LOADING: 'Loading…',
    SUBMITTING: 'Submitting…',
  },

  // Button Labels - Consistent Action Verbs
  BUTTONS: {
    ADD_ORGANIZATION: 'Add Organization',
    ADD_CONTACT: 'Add Contact',
    ADD_PRODUCT: 'Add Product',
    ADD_OPPORTUNITY: 'Add Opportunity',
    ADD_INTERACTION: 'Log Interaction',
    LOG_INTERACTION: 'Log Interaction', // Standardized terminology
    SAVE: 'Save',
    CANCEL: 'Cancel',
    DELETE: 'Delete',
    EDIT: 'Edit',
    CREATE: 'Create',
    UPDATE: 'Update',
  },

  // Entity Names - Consistent Terminology
  ENTITIES: {
    ORGANIZATION: 'Organization',
    ORGANIZATIONS: 'Organizations',
    CONTACT: 'Contact',
    CONTACTS: 'Contacts',
    PRODUCT: 'Product',
    PRODUCTS: 'Products',
    OPPORTUNITY: 'Opportunity',
    OPPORTUNITIES: 'Opportunities',
    INTERACTION: 'Interaction',
    INTERACTIONS: 'Interactions',
    // Legacy activity terms for backwards compatibility
    ACTIVITY: 'Interaction',
    ACTIVITIES: 'Interactions',
  },

  // Dialog Titles
  DIALOGS: {
    CREATE_ORGANIZATION: 'Add Organization',
    EDIT_ORGANIZATION: 'Edit Organization',
    DELETE_ORGANIZATION: 'Delete Organization',
    CREATE_CONTACT: 'Add Contact',
    EDIT_CONTACT: 'Edit Contact',
    DELETE_CONTACT: 'Delete Contact',
    CREATE_PRODUCT: 'Add Product',
    EDIT_PRODUCT: 'Edit Product',
    DELETE_PRODUCT: 'Delete Product',
    CREATE_OPPORTUNITY: 'Add Opportunity',
    EDIT_OPPORTUNITY: 'Edit Opportunity',
    DELETE_OPPORTUNITY: 'Delete Opportunity',
    CREATE_INTERACTION: 'Log Interaction',
    EDIT_INTERACTION: 'Edit Interaction',
    DELETE_INTERACTION: 'Delete Interaction',
    LOG_INTERACTION: 'Log Interaction',
    EDIT_ACTIVITY: 'Edit Interaction', // Legacy support
  },

  // Confirmation Messages
  CONFIRMATIONS: {
    DELETE_WARNING:
      'This action will permanently delete "{name}". This action cannot be undone and will remove all associated data.',
    ARE_YOU_SURE: 'Are you sure?',
  },

  // Success Messages
  SUCCESS: {
    ORGANIZATION_CREATED: 'Organization created successfully!',
    ORGANIZATION_UPDATED: 'Organization updated successfully!',
    ORGANIZATION_DELETED: 'Organization deleted successfully!',
    CONTACT_CREATED: 'Contact created successfully!',
    CONTACT_UPDATED: 'Contact updated successfully!',
    CONTACT_DELETED: 'Contact deleted successfully!',
    PRODUCT_CREATED: 'Product created successfully!',
    PRODUCT_UPDATED: 'Product updated successfully!',
    PRODUCT_DELETED: 'Product deleted successfully!',
    OPPORTUNITY_CREATED: 'Opportunity created successfully!',
    OPPORTUNITY_UPDATED: 'Opportunity updated successfully!',
    OPPORTUNITY_DELETED: 'Opportunity deleted successfully!',
    INTERACTION_CREATED: 'Interaction logged successfully!',
    INTERACTION_UPDATED: 'Interaction updated successfully!',
    INTERACTION_DELETED: 'Interaction deleted successfully!',
    ACTIVITY_LOGGED: 'Interaction logged successfully!', // Legacy support
    ACTIVITY_UPDATED: 'Interaction updated successfully!', // Legacy support
    ACTIVITY_DELETED: 'Interaction deleted successfully!', // Legacy support
  },

  // Error Messages
  ERRORS: {
    GENERIC: 'Something went wrong. Please try again.',
    ORGANIZATION_CREATE: 'Failed to create organization. Please try again.',
    ORGANIZATION_UPDATE: 'Failed to update organization. Please try again.',
    ORGANIZATION_DELETE: 'Failed to delete organization. Please try again.',
    CONTACT_CREATE: 'Failed to create contact. Please try again.',
    CONTACT_UPDATE: 'Failed to update contact. Please try again.',
    CONTACT_DELETE: 'Failed to delete contact. Please try again.',
    PRODUCT_CREATE: 'Failed to create product. Please try again.',
    PRODUCT_UPDATE: 'Failed to update product. Please try again.',
    PRODUCT_DELETE: 'Failed to delete product. Please try again.',
    OPPORTUNITY_CREATE: 'Failed to create opportunity. Please try again.',
    OPPORTUNITY_UPDATE: 'Failed to update opportunity. Please try again.',
    OPPORTUNITY_DELETE: 'Failed to delete opportunity. Please try again.',
    INTERACTION_CREATE: 'Failed to log interaction. Please try again.',
    INTERACTION_UPDATE: 'Failed to update interaction. Please try again.',
    INTERACTION_DELETE: 'Failed to delete interaction. Please try again.',
    ACTIVITY_LOG: 'Failed to log interaction. Please try again.', // Legacy support
    ACTIVITY_UPDATE: 'Failed to update interaction. Please try again.', // Legacy support
    ACTIVITY_DELETE: 'Failed to delete interaction. Please try again.', // Legacy support
  },

  // Form Labels and Placeholders
  FORMS: {
    REQUIRED_FIELD: 'This field is required',
    OPTIONAL_FIELD: 'Optional',
    SEARCH_PLACEHOLDER: 'Search…',
    SELECT_PLACEHOLDER: 'Select an option',
  },

  // Page Headers and Descriptions
  PAGES: {
    ORGANIZATIONS_TITLE: 'Manage Organizations',
    ORGANIZATIONS_SUBTITLE: 'Principals, Retailers & Partners',
    CONTACTS_TITLE: 'Manage Contacts',
    CONTACTS_SUBTITLE: 'Professional Network & Relationships',
    PRODUCTS_TITLE: 'Manage Products',
    PRODUCTS_SUBTITLE: 'Catalog & Inventory',
    OPPORTUNITIES_TITLE: 'Opportunities',
    OPPORTUNITIES_SUBTITLE: 'Track and manage your sales pipeline and deals',
    INTERACTIONS_TITLE: 'Interaction Timeline',
    INTERACTIONS_SUBTITLE: 'Track all customer interactions and touchpoints',
    IMPORT_EXPORT_TITLE: 'Import/Export',
    IMPORT_EXPORT_SUBTITLE: 'Import organizations and contacts from CSV files or export your data',
  },
} as const

/**
 * Helper function to get delete confirmation message with entity name
 */
export const getDeleteConfirmation = (entityName: string): string => {
  return COPY.CONFIRMATIONS.DELETE_WARNING.replace('{name}', entityName)
}

/**
 * Helper function to format button loading states consistently
 */
export const getLoadingLabel = (action: keyof typeof COPY.LOADING): string => {
  return `${COPY.LOADING[action]}`
}

/**
 * Helper function to get count display text
 */
export const getCountDisplay = (count: number, entityType: keyof typeof COPY.ENTITIES): string => {
  const entity =
    count === 1
      ? COPY.ENTITIES[entityType].toLowerCase()
      : COPY.ENTITIES[(entityType + 'S') as keyof typeof COPY.ENTITIES]?.toLowerCase() ||
        COPY.ENTITIES[entityType].toLowerCase() + 's'

  return `${count} ${entity}`
}
