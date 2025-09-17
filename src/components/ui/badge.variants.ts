import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

export const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        outline: 'text-foreground',
      },
      priority: {
        critical:
          'border-priority-critical bg-priority-critical bg-gradient-to-r from-priority-critical to-destructive text-priority-critical-foreground shadow-lg',
        high: 'border-priority-high bg-priority-high text-priority-high-foreground',
        medium: 'border-priority-medium bg-priority-medium text-priority-medium-foreground',
        normal: 'border-priority-normal bg-priority-normal text-priority-normal-foreground',
        low: 'border-priority-low bg-priority-low text-priority-low-foreground',
        // Legacy priority mappings for backward compatibility
        'a-plus': 'border-priority-critical bg-priority-critical text-priority-critical-foreground shadow-lg',
        a: 'border-priority-high bg-priority-high text-priority-high-foreground',
        b: 'border-priority-medium bg-priority-medium text-priority-medium-foreground',
        c: 'border-priority-normal bg-priority-normal text-priority-normal-foreground',
        d: 'border-priority-low bg-priority-low text-priority-low-foreground',
        unassigned: 'border-muted bg-muted text-muted-foreground',
      },
      orgType: {
        customer:
          'border-organization-customer bg-organization-customer text-organization-customer-foreground',
        distributor:
          'border-organization-distributor bg-organization-distributor text-organization-distributor-foreground',
        principal:
          'border-organization-principal bg-organization-principal text-organization-principal-foreground',
        supplier:
          'border-organization-supplier bg-organization-supplier text-organization-supplier-foreground',
        vendor:
          'border-organization-vendor bg-organization-vendor text-organization-vendor-foreground',
        prospect:
          'border-organization-prospect bg-organization-prospect text-organization-prospect-foreground',
        unknown: 'border-organization-unknown bg-organization-unknown text-organization-unknown-foreground',
      },
      segment: {
        restaurant:
          'border-segment-restaurant bg-segment-restaurant text-segment-restaurant-foreground',
        healthcare:
          'border-segment-healthcare bg-segment-healthcare text-segment-healthcare-foreground',
        education:
          'border-segment-education bg-segment-education text-segment-education-foreground',
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
      },
    },
    compoundVariants: [
      {
        priority: ['critical', 'a-plus'],
        orgType: 'customer',
        className:
          'border-organization-customer bg-gradient-to-r from-organization-customer to-priority-critical text-white shadow-lg',
      },
      {
        priority: ['critical', 'high', 'a-plus', 'a'],
        orgType: 'distributor',
        className:
          'border-organization-distributor bg-gradient-to-r from-organization-distributor to-priority-high text-white shadow-lg',
      },
      {
        priority: ['critical', 'a-plus'],
        orgType: 'principal',
        className:
          'border-organization-principal bg-gradient-to-r from-organization-principal to-priority-critical text-white shadow-lg',
      },
    ],
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}
