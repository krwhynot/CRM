import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { semanticSpacing, semanticTypography } from '@/styles/tokens'

interface SignUpFormLayoutProps {
  children: ReactNode
  footer: ReactNode
}

export function SignUpFormLayout({ children, footer }: SignUpFormLayoutProps) {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className={cn(semanticTypography.h2, semanticTypography.title)}>
          Create Account
        </CardTitle>
        <CardDescription>
          Join KitchenPantry CRM to manage your food service relationships
        </CardDescription>
      </CardHeader>

      <CardContent className={semanticSpacing.stack.lg}>{children}</CardContent>

      <CardFooter className={`flex flex-col ${semanticSpacing.gap.lg}`}>{footer}</CardFooter>
    </Card>
  )
}
