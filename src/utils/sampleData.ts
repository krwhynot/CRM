import { startOfWeek, subWeeks, addDays } from 'date-fns'
import { Principal, Product, Opportunity, Interaction } from '@/types/dashboard'

const interactionTypes = [
  'Email', 'Phone Call', 'Meeting', 'Demo', 'Proposal', 'Follow-up', 'Contract Review'
]

const opportunityTitles = [
  'Q1 Restaurant Chain Expansion', 'New Product Line Introduction', 
  'Bulk Purchase Agreement', 'Seasonal Menu Partnership',
  'Distributor Network Expansion', 'Premium Product Launch',
  'Volume Discount Negotiation', 'Exclusive Territory Rights',
  'Supply Chain Optimization', 'Brand Partnership Deal'
]

export const generateSamplePrincipals = (): Principal[] => [
  { id: 'principal-1', name: 'Acme Foods', company: 'Acme Corporation' },
  { id: 'principal-2', name: 'Fresh Ingredients Co', company: 'Fresh Corp' },
  { id: 'principal-3', name: 'Gourmet Supplies Inc', company: 'Gourmet Holdings' },
  { id: 'principal-4', name: 'Organic Harvest Ltd', company: 'Harvest Group' },
  { id: 'principal-5', name: 'Premium Pantry LLC', company: 'Pantry Solutions' }
]

export const generateSampleProducts = (): Product[] => [
  { id: 'product-1', name: 'Organic Pasta Sauce', category: 'Condiments', principalId: 'principal-1' },
  { id: 'product-2', name: 'Artisan Bread Mix', category: 'Bakery', principalId: 'principal-1' },
  { id: 'product-3', name: 'Premium Olive Oil', category: 'Oils & Vinegars', principalId: 'principal-2' },
  { id: 'product-4', name: 'Specialty Cheese Selection', category: 'Dairy', principalId: 'principal-2' },
  { id: 'product-5', name: 'Gourmet Spice Blend', category: 'Seasonings', principalId: 'principal-3' },
  { id: 'product-6', name: 'Craft Beer Selection', category: 'Beverages', principalId: 'principal-3' },
  { id: 'product-7', name: 'Organic Produce Mix', category: 'Fresh', principalId: 'principal-4' },
  { id: 'product-8', name: 'Sustainable Seafood', category: 'Protein', principalId: 'principal-4' },
  { id: 'product-9', name: 'Premium Coffee Beans', category: 'Beverages', principalId: 'principal-5' },
  { id: 'product-10', name: 'Luxury Chocolate Collection', category: 'Confections', principalId: 'principal-5' }
]

const generateRandomDate = (weeksAgo: number): Date => {
  const baseDate = subWeeks(new Date(), weeksAgo)
  const startOfWeekDate = startOfWeek(baseDate, { weekStartsOn: 1 }) // Monday start
  const daysOffset = Math.floor(Math.random() * 7)
  const hoursOffset = Math.floor(Math.random() * 8) + 9 // 9 AM to 5 PM
  const result = addDays(startOfWeekDate, daysOffset)
  result.setHours(hoursOffset, Math.floor(Math.random() * 60), 0, 0)
  return result
}

const generateInteractions = (opportunityId: string, count: number): Interaction[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `interaction-${opportunityId}-${index + 1}`,
    type: interactionTypes[Math.floor(Math.random() * interactionTypes.length)],
    date: generateRandomDate(Math.floor(Math.random() * 12) + 1),
    description: `${interactionTypes[Math.floor(Math.random() * interactionTypes.length)]} regarding opportunity progress`,
    opportunityId
  }))
}

export const generateSampleData = () => {
  const principals = generateSamplePrincipals()
  const products = generateSampleProducts()
  
  const opportunities: Opportunity[] = Array.from({ length: 25 }, (_, index) => {
    const principalId = principals[Math.floor(Math.random() * principals.length)].id
    const principalProducts = products.filter(p => p.principalId === principalId)
    const productId = principalProducts.length > 0 
      ? principalProducts[Math.floor(Math.random() * principalProducts.length)].id
      : products[0].id
    
    const opportunityId = `opportunity-${index + 1}`
    const interactionCount = Math.floor(Math.random() * 5) + 1 // 1-5 interactions per opportunity
    
    return {
      id: opportunityId,
      principalId,
      productId,
      date: generateRandomDate(Math.floor(Math.random() * 12) + 1),
      title: opportunityTitles[Math.floor(Math.random() * opportunityTitles.length)],
      value: Math.floor(Math.random() * 500000) + 50000, // $50k - $550k
      status: ['open', 'closed', 'pending'][Math.floor(Math.random() * 3)] as 'open' | 'closed' | 'pending',
      interactions: generateInteractions(opportunityId, interactionCount)
    }
  })

  return { principals, products, opportunities }
}