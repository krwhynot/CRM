// Contacts Feature - Main Exports
export { ContactForm } from './components/ContactForm'
export { ContactsList } from './components/ContactsList'
export { ContactsTable } from './components/ContactsTable' // Legacy - deprecated
export { ContactActions } from './components/ContactActions'
export { ContactBadges } from './components/ContactBadges'
export { ContactsDialogs } from './components/ContactsDialogs'
export { ContactsDataDisplay } from './components/ContactsDataDisplay'
export { PreferredPrincipalsSelect } from './components/PreferredPrincipalsSelect'
export { ContactSelect, type ContactSelectProps } from './components/ContactSelect'

// Hooks
export { useContacts, useRefreshContacts } from './hooks/useContacts'
export { useContactsFiltering } from './hooks/useContactsFiltering'
export { useContactsDisplay } from './hooks/useContactsDisplay'
export { useContactFormState } from './hooks/useContactFormState'
export { useContactFormStyle } from './hooks/useContactFormStyle'
export { useContactsBadges } from './hooks/useContactsBadges'
export { useContactPreferredPrincipals } from './hooks/useContactPreferredPrincipals'
export { useContactsPageState } from './hooks/useContactsPageState'
export { useContactsPageActions } from './hooks/useContactsPageActions'
export { useContactFormData } from './hooks/useContacts'
