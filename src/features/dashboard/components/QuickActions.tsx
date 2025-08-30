import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

const quickActions = [
  {
    title: "Principal",
    action: "principal",
  },
  {
    title: "Organization", 
    action: "organization",
  },
  {
    title: "Contact",
    action: "contact",
  },
  {
    title: "Opportunity",
    action: "opportunity",
  },
  {
    title: "Activity",
    action: "activity",
  },
]

export function QuickActions() {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex gap-2 overflow-x-auto">
      {quickActions.map((action, index) => (
        <Button
          key={index}
          className="bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white border-none rounded-md px-4 py-2 flex items-center gap-2 hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
          style={{ 
            boxShadow: 'var(--quick-action-shadow)' 
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = 'var(--quick-action-shadow-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'var(--quick-action-shadow)'
          }}
          onClick={() => console.log(`Creating new ${action.title}`)}
        >
          <Plus className="h-4 w-4" />
          {action.title}
        </Button>
      ))}
    </div>
  )
}