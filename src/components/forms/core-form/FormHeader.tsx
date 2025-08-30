import React from 'react'
import { CardHeader, CardTitle } from '@/components/ui/card'

interface FormHeaderProps {
  title: string
  icon: React.ComponentType<{ className?: string }>
  isEdit: boolean
}

export function FormHeader({ title, icon: Icon, isEdit }: FormHeaderProps) {
  return (
    <CardHeader className="border-b p-6">
      <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
        <Icon className="size-5" />
        {isEdit ? `Edit ${title}` : `New ${title}`}
      </CardTitle>
    </CardHeader>
  )
}