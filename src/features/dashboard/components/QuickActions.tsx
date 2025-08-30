import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'

const quickActions = [
  {
    title: 'Principal',
    action: 'principal',
  },
  {
    title: 'Organization',
    action: 'organization',
  },
  {
    title: 'Contact',
    action: 'contact',
  },
  {
    title: 'Opportunity',
    action: 'opportunity',
  },
  {
    title: 'Activity',
    action: 'activity',
  },
]

export function QuickActions() {
  return (
    <div className="flex gap-2 overflow-x-auto border-b border-gray-200 bg-white px-6 py-4">
      {quickActions.map((action, index) => (
        <Button
          key={index}
          className="from-primary-500 hover:to-primary-700 flex items-center gap-2 whitespace-nowrap rounded-md border-none bg-gradient-to-br to-primary-600 px-4 py-2 text-white transition-all duration-200 hover:-translate-y-0.5 hover:from-primary-600"
          style={{
            boxShadow: 'var(--quick-action-shadow)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = 'var(--quick-action-shadow-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'var(--quick-action-shadow)'
          }}
          onClick={() => {
            // Future: Implement navigation to create forms
          }}
        >
          <Plus className="size-4" />
          {action.title}
        </Button>
      ))}
    </div>
  )
}
