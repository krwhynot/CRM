import type { Meta, StoryObj } from '@storybook/react'
import { Search, Building2, Users, Filter, Plus, Download, RefreshCw } from 'lucide-react'
import { PageLayout } from './PageLayout'
import { ActionGroup, MetaBadge, FilterGroup } from './slots'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { semanticSpacing, semanticTypography } from '@/styles/tokens'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const meta: Meta<typeof PageLayout> = {
  title: 'Layout/PageLayout',
  component: PageLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
PageLayout is the new slot-based layout system that replaces template-based layouts.
It provides flexible composition through React slots with consistent spacing and responsive behavior.

## Key Benefits
- **5-10x faster development** for adding new UI elements
- **Direct composition** - any ReactNode in any slot
- **Complete app shell** - includes main navigation sidebar automatically
- **Flexible filtering** with optional filter sidebar support
- **Semantic design tokens** for consistent spacing
- **Mobile-first responsive design**

## App Shell Integration
PageLayout automatically includes the main app navigation sidebar (AppSidebar) and header,
providing the complete application shell structure. No additional layout wrappers needed.

## Migration from Templates
The old EntityManagementTemplate system has been replaced with this slot-based approach.
Use the \`usePageLayout\` hook for easy migration with automatic title/action generation.
        `,
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Page title displayed in the header',
    },
    subtitle: {
      control: 'text',
      description: 'Optional subtitle below the title',
    },
    withFilterSidebar: {
      control: 'boolean',
      description: 'Whether to include a collapsible filter sidebar',
    },
    containerized: {
      control: 'boolean',
      description: 'Whether to wrap content in a responsive container',
    },
    fullHeight: {
      control: 'boolean',
      description: 'Whether the layout should take full viewport height',
    },
  },
}

export default meta
type Story = StoryObj<typeof PageLayout>

// Sample data for stories
const sampleOrganizations = [
  { id: 1, name: 'Acme Corp', type: 'customer', contacts: 12 },
  { id: 2, name: 'Best Foods Inc', type: 'distributor', contacts: 8 },
  { id: 3, name: 'Chef Solutions', type: 'customer', contacts: 15 },
]

// Basic page layout with minimal content
export const Basic: Story = {
  args: {
    title: 'Organizations',
    children: (
      <div className={semanticSpacing.stack.md}>
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className={`${semanticTypography.h4} mb-4`}>Content Area</h3>
          <p className="text-muted-foreground">
            This is where your main page content would go. Tables, forms, dashboards, etc.
          </p>
        </div>
      </div>
    ),
  },
}

// Page with subtitle and metadata
export const WithSubtitleAndMeta: Story = {
  args: {
    title: 'Organizations',
    subtitle: 'Manage customer and distributor relationships',
    meta: (
      <MetaBadge
        items={[
          { type: 'count', value: 156, label: 'organizations' },
          { type: 'status', value: 'synced', color: 'success' },
        ]}
      />
    ),
    children: (
      <div className={semanticSpacing.stack.md}>
        <div className={`grid grid-cols-1 md:grid-cols-3 ${semanticSpacing.gap.md}`}>
          {sampleOrganizations.map((org) => (
            <div key={org.id} className="rounded-lg border border-border bg-card p-4">
              <h3 className={semanticTypography.h5}>{org.name}</h3>
              <Badge variant="secondary" className="mt-2">
                {org.type}
              </Badge>
              <p className={`${semanticTypography.caption} mt-1 text-muted-foreground`}>{org.contacts} contacts</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
}

// Page with action buttons
export const WithActions: Story = {
  args: {
    title: 'Organizations',
    subtitle: 'Manage customer and distributor relationships',
    actions: (
      <ActionGroup
        actions={[
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
        ]}
      />
    ),
    children: (
      <div className={semanticSpacing.stack.md}>
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <h3 className={`${semanticTypography.h4} mb-2`}>Ready for Content</h3>
          <p className="text-muted-foreground">
            Actions are available in the header. Try clicking the buttons above.
          </p>
        </div>
      </div>
    ),
  },
}

// Page with filter sidebar
export const WithFilterSidebar: Story = {
  args: {
    title: 'Organizations',
    subtitle: 'Manage customer and distributor relationships',
    meta: (
      <MetaBadge
        items={[
          { type: 'count', value: 24, label: 'filtered' },
          { type: 'count', value: 156, label: 'total' },
        ]}
        separator="of"
      />
    ),
    actions: (
      <ActionGroup
        actions={[
          {
            type: 'button',
            label: 'Add Organization',
            onClick: () => alert('Add clicked'),
            icon: <Plus className="size-4" />,
          },
        ]}
      />
    ),
    withFilterSidebar: true,
    filterSidebarConfig: {
      persistKey: 'storybook-filters',
      defaultCollapsed: false,
    },
    filters: (
      <FilterGroup
        groups={[
          {
            id: 'search',
            title: 'Search',
            icon: <Search className="size-4" />,
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
            icon: <Building2 className="size-4" />,
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
            icon: <Filter className="size-4" />,
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
        ]}
      />
    ),
    children: (
      <div className={semanticSpacing.stack.md}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sampleOrganizations.map((org) => (
            <div key={org.id} className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-semibold">{org.name}</h3>
              <Badge variant="secondary" className="mt-2">
                {org.type}
              </Badge>
              <p className={`${semanticTypography.caption} mt-1 text-muted-foreground`}>{org.contacts} contacts</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
}

// Complex example with all slots filled
export const CompleteExample: Story = {
  args: {
    title: 'Contact Management',
    subtitle: 'Manage contacts and their relationships with organizations',
    meta: (
      <MetaBadge
        items={[
          { type: 'count', value: 342, label: 'contacts' },
          { type: 'badge', label: 'Active', value: '89%', variant: 'secondary' },
          { type: 'status', value: 'healthy', color: 'success' },
        ]}
        spacing="sm"
      />
    ),
    actions: (
      <ActionGroup
        actions={[
          {
            type: 'custom',
            component: (
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Contacts</SelectItem>
                  <SelectItem value="customers">Customers</SelectItem>
                  <SelectItem value="distributors">Distributors</SelectItem>
                </SelectContent>
              </Select>
            ),
          },
          {
            type: 'button',
            label: 'Export',
            onClick: () => alert('Export clicked'),
            variant: 'outline',
            icon: <Download className="size-4" />,
          },
          {
            type: 'button',
            label: 'Add Contact',
            onClick: () => alert('Add contact'),
            icon: <Plus className="size-4" />,
          },
        ]}
        spacing="sm"
      />
    ),
    withFilterSidebar: true,
    filterSidebarConfig: {
      persistKey: 'contacts-filters',
      defaultCollapsed: false,
    },
    filters: (
      <FilterGroup
        groups={[
          {
            id: 'search',
            title: 'Search',
            icon: <Search className="size-4" />,
            defaultExpanded: true,
            content: (
              <div className={semanticSpacing.stack.sm}>
                <Input placeholder="Search contacts..." />
                <Input placeholder="Search by organization..." />
              </div>
            ),
          },
          {
            id: 'role',
            title: 'Decision Authority',
            icon: <Users className="size-4" />,
            controls: [
              {
                type: 'multiselect',
                id: 'authority',
                label: 'Authority Level',
                value: [],
                onChange: () => {},
                options: [
                  { label: 'Primary Decision Maker', value: 'primary', count: 45 },
                  { label: 'Secondary Contact', value: 'secondary', count: 123 },
                  { label: 'Influencer', value: 'influencer', count: 174 },
                ],
              },
            ],
          },
        ]}
      />
    ),
    children: (
      <div className={semanticSpacing.stack.lg}>
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border p-6">
            <h3 className="text-lg font-semibold">Contact Directory</h3>
            <p className="text-muted-foreground">
              All your business contacts organized by relationship and authority level.
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: 'John Smith',
                  role: 'Operations Manager',
                  org: 'Acme Corp',
                  authority: 'primary',
                },
                {
                  name: 'Sarah Johnson',
                  role: 'Purchasing Director',
                  org: 'Best Foods Inc',
                  authority: 'primary',
                },
                {
                  name: 'Mike Davis',
                  role: 'Assistant Manager',
                  org: 'Chef Solutions',
                  authority: 'secondary',
                },
                {
                  name: 'Lisa Chen',
                  role: 'Food Service Coordinator',
                  org: 'Acme Corp',
                  authority: 'influencer',
                },
              ].map((contact, index) => (
                <div key={index} className="rounded-lg border border-border bg-muted/50 p-4">
                  <h4 className="font-semibold">{contact.name}</h4>
                  <p className="text-sm text-muted-foreground">{contact.role}</p>
                  <p className="mt-1 text-sm font-medium">{contact.org}</p>
                  <Badge
                    variant={contact.authority === 'primary' ? 'default' : 'secondary'}
                    className="mt-2"
                  >
                    {contact.authority}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  },
}

// Mobile responsive example
export const MobileResponsive: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
  args: {
    title: 'Organizations',
    subtitle: 'Mobile-optimized view',
    meta: <MetaBadge items={[{ type: 'count', value: 156, label: 'organizations' }]} size="sm" />,
    actions: (
      <ActionGroup
        actions={[
          {
            type: 'button',
            label: 'Add',
            onClick: () => alert('Add clicked'),
            icon: <Plus className="size-4" />,
            size: 'sm',
          },
        ]}
      />
    ),
    withFilterSidebar: true,
    filterSidebarConfig: {
      persistKey: 'mobile-filters',
      defaultCollapsed: true,
    },
    filters: (
      <FilterGroup
        groups={[
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
        ]}
        compact
      />
    ),
    children: (
      <div className={semanticSpacing.stack.md}>
        {sampleOrganizations.map((org) => (
          <div key={org.id} className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold">{org.name}</h3>
            <Badge variant="secondary" className="mt-1 text-xs">
              {org.type}
            </Badge>
          </div>
        ))}
      </div>
    ),
  },
}
