import type { Meta, StoryObj } from '@storybook/react'
import { Users, CheckCircle, AlertTriangle, Info, Building2 } from 'lucide-react'
import { MetaBadge } from './MetaBadge'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { semanticSpacing, semanticTypography } from '@/styles/tokens'

const meta: Meta<typeof MetaBadge> = {
  title: 'Layout/Slots/MetaBadge',
  component: MetaBadge,
  parameters: {
    docs: {
      description: {
        component: `
MetaBadge is a composite slot component for displaying meta information like counts, statuses,
and badges with consistent formatting and spacing.

## Features
- **Multiple display types** (count, status, badge, text, custom)
- **Semantic spacing** and typography tokens
- **Flexible separator support**
- **Color-coded status indicators**
- **Mixed content support**

## Use Cases
- Entity count displays in page headers
- Filter status indicators
- Progress and status summaries
- Mixed metadata compositions
        `,
      },
    },
  },
  argTypes: {
    direction: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Layout direction for meta items',
    },
    spacing: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Spacing between meta items',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Text size for meta items',
    },
    separator: {
      control: 'boolean',
      description: 'Whether to show separators between items',
    },
    separatorChar: {
      control: 'text',
      description: 'Custom separator character',
    },
  },
}

export default meta
type Story = StoryObj<typeof MetaBadge>

// Basic count display
export const BasicCount: Story = {
  args: {
    items: [
      {
        type: 'count',
        value: 156,
        label: 'organizations',
      },
    ],
  },
}

// Entity count with icon
export const EntityCount: Story = {
  args: {
    items: [
      {
        type: 'count',
        value: 1247,
        label: 'contacts',
        icon: <Users className="size-4" />,
      },
    ],
  },
}

// Filter status with separators
export const FilterStatus: Story = {
  args: {
    items: [
      {
        type: 'count',
        value: 24,
        label: 'filtered',
      },
      {
        type: 'count',
        value: 156,
        label: 'total',
      },
    ],
    separator: 'of',
  },
}

// Status indicators
export const StatusIndicators: Story = {
  args: {
    items: [
      {
        type: 'status',
        value: 'healthy',
        color: 'success',
        icon: <CheckCircle className="size-3" />,
      },
      {
        type: 'status',
        value: 'warning',
        color: 'warning',
        icon: <AlertTriangle className="size-3" />,
      },
      {
        type: 'status',
        value: 'syncing',
        color: 'info',
        icon: <Info className="size-3" />,
      },
    ],
  },
}

// Mixed badge types
export const MixedBadges: Story = {
  args: {
    items: [
      {
        type: 'badge',
        label: 'Priority',
        value: 'High',
        variant: 'destructive',
      },
      {
        type: 'badge',
        label: 'Status',
        value: 'Active',
        variant: 'secondary',
      },
      {
        type: 'badge',
        label: 'Type',
        value: 'Customer',
        variant: 'outline',
      },
    ],
    spacing: 'sm',
  },
}

// Complex metadata composition
export const ComplexComposition: Story = {
  args: {
    items: [
      {
        type: 'count',
        value: 342,
        label: 'contacts',
        icon: <Users className="size-4" />,
      },
      {
        type: 'badge',
        label: 'Active',
        value: '89%',
        variant: 'secondary',
      },
      {
        type: 'status',
        value: 'healthy',
        color: 'success',
        icon: <CheckCircle className="size-3" />,
      },
    ],
    spacing: 'sm',
  },
}

// Vertical layout
export const VerticalLayout: Story = {
  args: {
    direction: 'vertical',
    items: [
      {
        type: 'count',
        value: 89,
        label: 'customers',
      },
      {
        type: 'count',
        value: 67,
        label: 'distributors',
      },
      {
        type: 'count',
        value: 12,
        label: 'principals',
      },
    ],
    spacing: 'xs',
  },
}

// Text metadata
export const TextMetadata: Story = {
  args: {
    items: [
      {
        type: 'text',
        label: 'Last updated',
        value: '2 hours ago',
      },
      {
        type: 'text',
        label: 'Modified by',
        value: 'John Smith',
      },
    ],
    separator: true,
  },
}

// Custom components
export const CustomComponents: Story = {
  args: {
    items: [
      {
        type: 'count',
        value: 156,
        label: 'organizations',
      },
      {
        type: 'custom',
        component: (
          <Badge variant="outline" className={semanticSpacing.gap.xs}>
            <Building2 className="size-3" />
            Mixed Types
          </Badge>
        ),
      },
      {
        type: 'status',
        value: 'synced',
        color: 'success',
      },
    ],
    spacing: 'sm',
  },
}

// Different sizes
export const SizeVariations: Story = {
  render: () => (
    <div className={semanticSpacing.stack.lg}>
      <div>
        <h3 className={cn(semanticTypography.caption, 'mb-2 font-medium')}>Small</h3>
        <MetaBadge
          size="sm"
          items={[
            { type: 'count', value: 156, label: 'organizations' },
            { type: 'status', value: 'active', color: 'success' },
          ]}
        />
      </div>

      <div>
        <h3 className={cn(semanticTypography.caption, 'mb-2 font-medium')}>Medium (Default)</h3>
        <MetaBadge
          size="md"
          items={[
            { type: 'count', value: 156, label: 'organizations' },
            { type: 'status', value: 'active', color: 'success' },
          ]}
        />
      </div>

      <div>
        <h3 className={cn(semanticTypography.caption, 'mb-2 font-medium')}>Large</h3>
        <MetaBadge
          size="lg"
          items={[
            { type: 'count', value: 156, label: 'organizations' },
            { type: 'status', value: 'active', color: 'success' },
          ]}
        />
      </div>
    </div>
  ),
}

// Dashboard summary example
export const DashboardSummary: Story = {
  args: {
    items: [
      {
        type: 'count',
        value: 1247,
        label: 'total contacts',
        icon: <Users className="size-4" />,
      },
      {
        type: 'count',
        value: 89,
        label: 'active opportunities',
      },
      {
        type: 'badge',
        label: 'Revenue',
        value: '$2.4M',
        variant: 'secondary',
      },
      {
        type: 'status',
        value: 'on track',
        color: 'success',
        icon: <CheckCircle className="size-3" />,
      },
    ],
    spacing: 'md',
    separator: true,
  },
}

// Filter summary with tooltips
export const FilterSummaryWithTooltips: Story = {
  args: {
    items: [
      {
        type: 'count',
        value: 24,
        label: 'filtered',
        tooltip: 'Items matching current filter criteria',
      },
      {
        type: 'count',
        value: 156,
        label: 'total',
        tooltip: 'Total items in the system',
      },
      {
        type: 'status',
        value: 'filtered',
        color: 'info',
        tooltip: 'Active filters are applied',
      },
    ],
    separator: 'of',
    spacing: 'sm',
  },
}
