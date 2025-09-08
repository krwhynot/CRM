import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

export const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        outline: 'text-foreground',
      },
      priority: {
        'a-plus': 'border-priority-a-plus bg-priority-a-plus bg-gradient-to-r from-priority-a-plus to-priority-a text-priority-a-plus-foreground shadow-lg',
        'a': 'border-priority-a bg-priority-a text-priority-a-foreground',
        'b': 'border-priority-b bg-priority-b text-priority-b-foreground',
        'c': 'border-priority-c bg-priority-c text-priority-c-foreground',
        'd': 'border-priority-d bg-priority-d text-priority-d-foreground',
        'unassigned': 'border-muted bg-muted text-muted-foreground',
      },
      orgType: {
        customer: 'border-organization-customer bg-organization-customer text-organization-customer-foreground',
        distributor: 'border-organization-distributor bg-organization-distributor text-organization-distributor-foreground',
        principal: 'border-organization-principal bg-organization-principal text-organization-principal-foreground',
        supplier: 'border-organization-supplier bg-organization-supplier text-organization-supplier-foreground',
        vendor: 'border-organization-vendor bg-organization-vendor text-organization-vendor-foreground',
        prospect: 'border-organization-prospect bg-organization-prospect text-organization-prospect-foreground',
        unknown: 'border-muted bg-muted text-muted-foreground',
      },
      segment: {
        restaurant: 'border-segment-restaurant bg-segment-restaurant text-segment-restaurant-foreground',
        healthcare: 'border-segment-healthcare bg-segment-healthcare text-segment-healthcare-foreground',
        education: 'border-segment-education bg-segment-education text-segment-education-foreground',
      },
      status: {
        active: 'border-success bg-success text-success-foreground',
        inactive: 'border-destructive bg-destructive text-destructive-foreground',
        pending: 'border-warning bg-warning text-warning-foreground',
      },
      influence: {
        high: 'border-info bg-info text-info-foreground',
        medium: 'border-warning bg-warning text-warning-foreground',
        low: 'border-muted bg-muted text-muted-foreground',
      }
    },
    compoundVariants: [
      {
        priority: 'a-plus',
        orgType: 'customer',
        className: 'border-yellow-300 bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
      },
      {
        priority: ['a-plus', 'a'],
        orgType: 'distributor',
        className: 'border-green-300 bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg'
      }
    ],
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}