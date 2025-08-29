import React from "react"
import { cn } from "@/lib/utils"
import { Container } from "./Container"

export function PageContainer(
  props: React.HTMLAttributes<HTMLDivElement>
) {
  const { className, ...rest } = props
  return (
    <Container className={cn("py-6 space-y-8", className)} {...rest} />
  )
}