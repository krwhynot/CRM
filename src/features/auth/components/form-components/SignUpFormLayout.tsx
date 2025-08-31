import type { ReactNode } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface SignUpFormLayoutProps {
  children: ReactNode
  footer: ReactNode
}

export function SignUpFormLayout({ children, footer }: SignUpFormLayoutProps) {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <CardDescription>
          Join KitchenPantry CRM to manage your food service relationships
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">{children}</CardContent>

      <CardFooter className="flex flex-col gap-4">{footer}</CardFooter>
    </Card>
  )
}
