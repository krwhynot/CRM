import type { EntityOption } from '@/components/forms/EntitySelect'

export const transformOrganizations = (
  organizations: Array<{
    id: string
    name: string
    type?: string
    segment?: string
  }>
): EntityOption[] => {
  return organizations.map((org) => ({
    id: org.id,
    name: org.name,
    description: org.type && org.segment ? `${org.type} - ${org.segment}` : org.type || org.segment,
    metadata: { type: org.type, segment: org.segment },
  }))
}

export const transformContacts = (
  contacts: Array<{
    id: string
    first_name: string
    last_name: string
    title?: string
    organization?: { name: string }
  }>
): EntityOption[] => {
  return contacts.map((contact) => ({
    id: contact.id,
    name: `${contact.first_name} ${contact.last_name}`,
    description:
      contact.title && contact.organization
        ? `${contact.title} at ${contact.organization.name}`
        : contact.title || contact.organization?.name,
    metadata: { title: contact.title, organization: contact.organization },
  }))
}

export const transformProducts = (
  products: Array<{
    id: string
    name: string
    sku?: string
    category?: string
    principal?: { name: string }
  }>
): EntityOption[] => {
  return products.map((product) => ({
    id: product.id,
    name: product.name,
    description: [product.sku && `SKU: ${product.sku}`, product.principal?.name, product.category]
      .filter(Boolean)
      .join(' • '),
    metadata: { sku: product.sku, category: product.category, principal: product.principal },
  }))
}
