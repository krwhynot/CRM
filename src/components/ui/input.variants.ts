import { cva } from "class-variance-authority"

export const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        default: "h-12 text-base file:text-base",
        sm: "h-11 text-sm file:text-sm",
        lg: "h-14 text-lg file:text-lg",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)