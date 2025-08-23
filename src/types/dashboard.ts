export interface Principal {
  id: string
  name: string
  company: string
}

export interface Product {
  id: string
  name: string
  category: string
  principalId: string
}

export interface Interaction {
  id: string
  type: string
  date: Date
  description: string
  opportunityId: string
}

export interface Opportunity {
  id: string
  principalId: string
  productId: string
  date: Date
  title: string
  value: number
  status: 'open' | 'closed' | 'pending'
  interactions: Interaction[]
}

export interface DashboardProps {
  opportunities: Opportunity[]
  principals: Principal[]
  products: Product[]
}

export interface FilterState {
  principal: string
  product: string  
  weeks: string
}

export interface ChartDataPoint {
  week: string
  count: number
  weekStart: Date
}

export interface ActivityItem {
  id: string
  type: 'opportunity' | 'interaction'
  title: string
  date: Date
  principalName: string
  productName?: string
}