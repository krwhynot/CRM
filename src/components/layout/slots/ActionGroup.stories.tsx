import type { Meta, StoryObj } from '@storybook/react'
import { Plus, Download, RefreshCw, Filter, Settings } from 'lucide-react'
import { ActionGroup } from './ActionGroup'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const meta: Meta<typeof ActionGroup> = {
  title: 'Layout/Slots/ActionGroup',
  component: ActionGroup,
  parameters: {
    docs: {
      description: {
        component: `
ActionGroup is a composite slot component for organizing multiple actions with consistent spacing
and responsive behavior. It replaces manual div composition with standardized patterns.

## Features
- **Consistent spacing** using semantic design tokens
- **Responsive wrapping** and alignment options
- **Priority-based ordering** for complex action sets
- **Mixed button and custom component** support
- **Loading and disabled states**

## Use Cases
- Page header action bars
- Toolbar compositions
- Form action sections
- Card action areas
        `,
      },
    },
  },
  argTypes: {
    direction: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Layout direction for actions',
    },
    spacing: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Spacing between action items',
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch'],
      description: 'Alignment of actions within container',
    },
    wrap: {
      control: 'boolean',
      description: 'Whether to wrap actions on smaller screens',
    },
    priorityOrder: {
      control: 'boolean',
      description: 'Whether to sort actions by priority (higher first)',
    },
  },
}

export default meta
type Story = StoryObj<typeof ActionGroup>

// Basic button group
export const Basic: Story = {
  args: {
    actions: [
      {
        type: 'button',
        label: 'Save',
        onClick: () => alert('Save clicked'),
      },
      {
        type: 'button',
        label: 'Cancel',
        onClick: () => alert('Cancel clicked'),
        variant: 'outline',
      },
    ],
  },
}

// Page header actions with icons
export const PageHeaderActions: Story = {
  args: {
    actions: [
      {
        type: 'button',
        label: 'Export',
        onClick: () => alert('Export clicked'),
        variant: 'outline',
        icon: <Download className="size-4" />,
      },
      {
        type: 'button',
        label: 'Refresh',
        onClick: () => alert('Refresh clicked'),
        variant: 'outline',
        icon: <RefreshCw className="size-4" />,
      },
      {
        type: 'button',
        label: 'Add Organization',
        onClick: () => alert('Add clicked'),
        icon: <Plus className="size-4" />,
      },
    ],
    spacing: 'sm',
  },
}

// Mixed actions with custom components
export const MixedActions: Story = {
  args: {
    actions: [
      {
        type: 'custom',
        component: (
          <Badge variant="secondary" className="shrink-0">
            5 selected
          </Badge>
        ),
      },
      {
        type: 'custom',
        component: (
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        ),
      },
      {
        type: 'button',
        label: 'Filter',
        onClick: () => alert('Filter clicked'),
        variant: 'outline',
        icon: <Filter className="size-4" />,
      },
      {
        type: 'button',
        label: 'Add Item',
        onClick: () => alert('Add clicked'),
        icon: <Plus className="size-4" />,
      },
    ],
    spacing: 'sm',
    align: 'center',
  },
}

// Vertical layout
export const VerticalLayout: Story = {
  args: {
    direction: 'vertical',
    actions: [
      {
        type: 'button',
        label: 'Primary Action',
        onClick: () => alert('Primary clicked'),
      },
      {
        type: 'button',
        label: 'Secondary Action',
        onClick: () => alert('Secondary clicked'),
        variant: 'outline',
      },
      {
        type: 'button',
        label: 'Tertiary Action',
        onClick: () => alert('Tertiary clicked'),
        variant: 'ghost',
      },
    ],
    spacing: 'sm',
  },
}

// Loading and disabled states
export const StatesDemo: Story = {
  args: {
    actions: [
      {
        type: 'button',
        label: 'Normal',
        onClick: () => alert('Normal clicked'),
      },
      {
        type: 'button',
        label: 'Loading',
        onClick: () => alert('Loading clicked'),
        loading: true,
      },
      {
        type: 'button',
        label: 'Disabled',
        onClick: () => alert('Disabled clicked'),
        disabled: true,
      },
      {
        type: 'button',
        label: 'Icon Only',
        onClick: () => alert('Settings clicked'),
        variant: 'outline',
        icon: <Settings className="size-4" />,
        'aria-label': 'Settings',
      },
    ],
    spacing: 'sm',
  },
}

// Priority ordering example
export const PriorityOrdering: Story = {
  args: {
    priorityOrder: true,
    actions: [
      {
        type: 'button',
        label: 'Low Priority',
        onClick: () => alert('Low clicked'),
        variant: 'ghost',
        priority: 1,
      } as any,
      {
        type: 'button',
        label: 'High Priority',
        onClick: () => alert('High clicked'),
        priority: 10,
      } as any,
      {
        type: 'button',
        label: 'Medium Priority',
        onClick: () => alert('Medium clicked'),
        variant: 'outline',
        priority: 5,
      } as any,
      {
        type: 'button',
        label: 'No Priority',
        onClick: () => alert('No priority clicked'),
        variant: 'secondary',
      },
    ],
    spacing: 'sm',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Actions are automatically sorted by priority when priorityOrder is enabled. Higher priority values appear first.',
      },
    },
  },
}

// Responsive wrapping
export const ResponsiveWrapping: Story = {
  args: {
    wrap: true,
    actions: [
      {
        type: 'button',
        label: 'Action One',
        onClick: () => alert('One clicked'),
        variant: 'outline',
      },
      {
        type: 'button',
        label: 'Action Two',
        onClick: () => alert('Two clicked'),
        variant: 'outline',
      },
      {
        type: 'button',
        label: 'Action Three',
        onClick: () => alert('Three clicked'),
        variant: 'outline',
      },
      {
        type: 'button',
        label: 'Action Four',
        onClick: () => alert('Four clicked'),
        variant: 'outline',
      },
      {
        type: 'button',
        label: 'Primary Action',
        onClick: () => alert('Primary clicked'),
      },
    ],
    spacing: 'sm',
    align: 'start',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Actions will wrap to new lines when space is limited. Resize the viewport to see the effect.',
      },
    },
  },
}

// Different alignments
export const AlignmentVariations: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium mb-2">Start Aligned</h3>
        <div className="border border-border rounded-lg p-4">
          <ActionGroup
            align="start"
            actions={[
              { type: 'button', label: 'Left', onClick: () => {}, variant: 'outline' },
              { type: 'button', label: 'Action', onClick: () => {}, variant: 'outline' },
            ]}
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Center Aligned</h3>
        <div className="border border-border rounded-lg p-4">
          <ActionGroup
            align="center"
            actions={[
              { type: 'button', label: 'Center', onClick: () => {}, variant: 'outline' },
              { type: 'button', label: 'Action', onClick: () => {}, variant: 'outline' },
            ]}
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">End Aligned</h3>
        <div className="border border-border rounded-lg p-4">
          <ActionGroup
            align="end"
            actions={[
              { type: 'button', label: 'Right', onClick: () => {}, variant: 'outline' },
              { type: 'button', label: 'Action', onClick: () => {}, variant: 'outline' },
            ]}
          />
        </div>
      </div>
    </div>
  ),
}
