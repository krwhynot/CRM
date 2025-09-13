import type { Meta, StoryObj } from '@storybook/react'
import { Search, Building2, Users, Filter, MapPin } from 'lucide-react'
import { FilterGroup } from './FilterGroup'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'

const meta: Meta<typeof FilterGroup> = {
  title: 'Layout/Slots/FilterGroup',
  component: FilterGroup,
  parameters: {
    docs: {
      description: {
        component: `
FilterGroup is a composite slot component for organizing filter controls into logical groups
with consistent spacing, collapsible sections, and responsive behavior.

## Features
- **Structured filter organization** with collapsible groups
- **Common filter control types** (search, select, toggle, multiselect, custom)
- **Badge indicators** for active filters
- **Compact mode** for narrow sidebars
- **Custom content support** alongside controls
- **State management** for group expansion

## Use Cases
- Filter sidebars with multiple sections
- Search and filter toolbars
- Advanced filtering interfaces
- Settings panels with grouped controls
        `,
      },
    },
  },
  argTypes: {
    spacing: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Spacing between filter groups',
    },
    showDividers: {
      control: 'boolean',
      description: 'Whether to show dividers between groups',
    },
    compact: {
      control: 'boolean',
      description: 'Compact mode for smaller sidebars',
    },
  },
}

export default meta
type Story = StoryObj<typeof FilterGroup>

// Basic search filter
export const BasicSearch: Story = {
  args: {
    groups: [
      {
        id: 'search',
        title: 'Search',
        icon: <Search className="h-4 w-4" />,
        defaultExpanded: true,
        controls: [
          {
            type: 'search',
            id: 'query',
            label: 'Search organizations',
            placeholder: 'Type to search...',
            onChange: () => {},
          },
        ],
      },
    ],
  },
}

// Organization type filter with select
export const TypeFilter: Story = {
  args: {
    groups: [
      {
        id: 'type',
        title: 'Organization Type',
        icon: <Building2 className="h-4 w-4" />,
        badge: '1',
        controls: [
          {
            type: 'select',
            id: 'orgType',
            label: 'Type',
            onChange: () => {},
            options: [
              { label: 'All Types', value: 'all' },
              { label: 'Customers', value: 'customer', count: 89 },
              { label: 'Distributors', value: 'distributor', count: 67 },
              { label: 'Principals', value: 'principal', count: 12 },
            ],
          },
        ],
      },
    ],
  },
}

// Multi-select filter
export const MultiSelectFilter: Story = {
  args: {
    groups: [
      {
        id: 'priority',
        title: 'Priority Filters',
        icon: <Filter className="h-4 w-4" />,
        badge: 2,
        controls: [
          {
            type: 'multiselect',
            id: 'priority',
            label: 'Priority Level',
            value: ['high', 'recent'],
            onChange: () => {},
            options: [
              { label: 'High Priority', value: 'high', count: 12 },
              { label: 'Recently Contacted', value: 'recent', count: 8 },
              { label: 'Needs Follow-up', value: 'followup', count: 5 },
              { label: 'Inactive', value: 'inactive', count: 23 },
            ],
          },
        ],
      },
    ],
  },
}

// Toggle filters
export const ToggleFilters: Story = {
  args: {
    groups: [
      {
        id: 'status',
        title: 'Status Filters',
        icon: <Users className="h-4 w-4" />,
        controls: [
          {
            type: 'toggle',
            id: 'active',
            label: 'Show Active Only',
            value: true,
            onChange: () => {},
          },
          {
            type: 'toggle',
            id: 'verified',
            label: 'Verified Contacts',
            value: false,
            onChange: () => {},
          },
        ],
      },
    ],
  },
}

// Custom content filter
export const CustomContentFilter: Story = {
  args: {
    groups: [
      {
        id: 'advanced',
        title: 'Advanced Filters',
        icon: <MapPin className="h-4 w-4" />,
        content: (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Location</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="northeast">Northeast</SelectItem>
                  <SelectItem value="southeast">Southeast</SelectItem>
                  <SelectItem value="midwest">Midwest</SelectItem>
                  <SelectItem value="west">West</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Revenue Range</label>
              <div className="flex gap-2">
                <Input placeholder="Min" type="number" />
                <Input placeholder="Max" type="number" />
              </div>
            </div>
          </div>
        ),
      },
    ],
  },
}

// Complete filter sidebar
export const CompleteFilterSidebar: Story = {
  args: {
    groups: [
      {
        id: 'search',
        title: 'Search',
        icon: <Search className="h-4 w-4" />,
        defaultExpanded: true,
        controls: [
          {
            type: 'search',
            id: 'query',
            label: 'Search organizations',
            placeholder: 'Type to search...',
            onChange: () => {},
          },
        ],
      },
      {
        id: 'type',
        title: 'Organization Type',
        icon: <Building2 className="h-4 w-4" />,
        badge: '1',
        controls: [
          {
            type: 'select',
            id: 'orgType',
            label: 'Type',
            onChange: () => {},
            options: [
              { label: 'All Types', value: 'all' },
              { label: 'Customers', value: 'customer', count: 89 },
              { label: 'Distributors', value: 'distributor', count: 67 },
            ],
          },
        ],
      },
      {
        id: 'quick-filters',
        title: 'Quick Filters',
        icon: <Filter className="h-4 w-4" />,
        controls: [
          {
            type: 'multiselect',
            id: 'priority',
            label: 'Priority',
            value: [],
            onChange: () => {},
            options: [
              { label: 'High Priority', value: 'high', count: 12 },
              { label: 'Recently Contacted', value: 'recent', count: 8 },
              { label: 'Needs Follow-up', value: 'followup', count: 5 },
            ],
          },
        ],
      },
      {
        id: 'advanced',
        title: 'Advanced Options',
        icon: <MapPin className="h-4 w-4" />,
        content: (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium block mb-1">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" />
                <Input type="date" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Location</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Any location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="northeast">Northeast</SelectItem>
                  <SelectItem value="southeast">Southeast</SelectItem>
                  <SelectItem value="midwest">Midwest</SelectItem>
                  <SelectItem value="west">West</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ),
      },
    ],
    spacing: 'md',
  },
}

// Compact mode
export const CompactMode: Story = {
  args: {
    compact: true,
    groups: [
      {
        id: 'search',
        title: 'Search',
        defaultExpanded: true,
        controls: [
          {
            type: 'search',
            id: 'query',
            label: 'Search',
            placeholder: 'Search...',
            onChange: () => {},
          },
        ],
      },
      {
        id: 'filters',
        title: 'Filters',
        badge: 2,
        controls: [
          {
            type: 'select',
            id: 'type',
            label: 'Type',
            onChange: () => {},
            options: [
              { label: 'All', value: 'all' },
              { label: 'Active', value: 'active', count: 45 },
              { label: 'Inactive', value: 'inactive', count: 12 },
            ],
          },
        ],
      },
    ],
    spacing: 'sm',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Compact mode reduces text size and spacing for use in narrow sidebars or mobile layouts.',
      },
    },
  },
}

// With dividers
export const WithDividers: Story = {
  args: {
    showDividers: true,
    groups: [
      {
        id: 'basic',
        title: 'Basic Filters',
        icon: <Search className="h-4 w-4" />,
        controls: [
          {
            type: 'search',
            id: 'search',
            label: 'Search',
            placeholder: 'Search...',
            onChange: () => {},
          },
        ],
      },
      {
        id: 'category',
        title: 'Category',
        icon: <Building2 className="h-4 w-4" />,
        controls: [
          {
            type: 'select',
            id: 'category',
            label: 'Category',
            onChange: () => {},
            options: [
              { label: 'All Categories', value: 'all' },
              { label: 'Food Service', value: 'foodservice' },
              { label: 'Retail', value: 'retail' },
            ],
          },
        ],
      },
      {
        id: 'status',
        title: 'Status',
        icon: <Filter className="h-4 w-4" />,
        controls: [
          {
            type: 'toggle',
            id: 'active',
            label: 'Active Only',
            onChange: () => {},
          },
        ],
      },
    ],
    spacing: 'md',
  },
}

// Non-collapsible groups
export const NonCollapsible: Story = {
  args: {
    groups: [
      {
        id: 'search',
        title: 'Quick Search',
        icon: <Search className="h-4 w-4" />,
        collapsible: false,
        controls: [
          {
            type: 'search',
            id: 'query',
            label: 'Search',
            placeholder: 'Search everything...',
            onChange: () => {},
          },
        ],
      },
      {
        id: 'filters',
        title: 'Filters',
        icon: <Filter className="h-4 w-4" />,
        collapsible: true,
        badge: 3,
        controls: [
          {
            type: 'multiselect',
            id: 'tags',
            label: 'Tags',
            value: ['important', 'urgent'],
            onChange: () => {},
            options: [
              { label: 'Important', value: 'important', count: 12 },
              { label: 'Urgent', value: 'urgent', count: 5 },
              { label: 'Review', value: 'review', count: 8 },
            ],
          },
        ],
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Groups can be marked as non-collapsible for always-visible filters like search.',
      },
    },
  },
}

// Dynamic filter example (with state)
export const InteractiveExample: Story = {
  render: () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedType, setSelectedType] = useState('all')
    const [priorities, setPriorities] = useState<string[]>([])

    return (
      <FilterGroup
        groups={[
          {
            id: 'search',
            title: 'Search',
            icon: <Search className="h-4 w-4" />,
            defaultExpanded: true,
            controls: [
              {
                type: 'search',
                id: 'query',
                label: 'Search',
                value: searchTerm,
                onChange: setSearchTerm,
                placeholder: 'Type to search...',
              },
            ],
          },
          {
            id: 'type',
            title: 'Type',
            icon: <Building2 className="h-4 w-4" />,
            badge: selectedType !== 'all' ? '1' : undefined,
            controls: [
              {
                type: 'select',
                id: 'type',
                label: 'Organization Type',
                value: selectedType,
                onChange: setSelectedType,
                options: [
                  { label: 'All Types', value: 'all' },
                  { label: 'Customers', value: 'customer', count: 89 },
                  { label: 'Distributors', value: 'distributor', count: 67 },
                ],
              },
            ],
          },
          {
            id: 'priority',
            title: 'Priority',
            icon: <Filter className="h-4 w-4" />,
            badge: priorities.length > 0 ? priorities.length : undefined,
            controls: [
              {
                type: 'multiselect',
                id: 'priorities',
                label: 'Priority Level',
                value: priorities,
                onChange: setPriorities,
                options: [
                  { label: 'High Priority', value: 'high', count: 12 },
                  { label: 'Medium Priority', value: 'medium', count: 34 },
                  { label: 'Low Priority', value: 'low', count: 56 },
                ],
              },
            ],
          },
        ]}
        onGroupToggle={(groupId, expanded) => {
          console.log(`Group ${groupId} ${expanded ? 'expanded' : 'collapsed'}`)
        }}
      />
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive example showing real state management and badge updates based on filter selections.',
      },
    },
  },
}
