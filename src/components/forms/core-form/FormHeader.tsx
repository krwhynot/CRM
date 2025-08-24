import { CardHeader, CardTitle } from '@/components/ui/card'

interface FormHeaderProps {
  title: string
  icon: React.ComponentType<{ className?: string }>
  isEdit: boolean
}

export function FormHeader({ title, icon: Icon, isEdit }: FormHeaderProps) {
  return (
    <CardHeader className="p-6 border-b">
      <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
        <Icon className="h-5 w-5" />
        {isEdit ? `Edit ${title}` : `New ${title}`}
      </CardTitle>
    </CardHeader>
  )
}