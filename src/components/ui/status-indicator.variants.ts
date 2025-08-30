import { cva } from "class-variance-authority"

export const statusIndicatorVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        success: "border border-green-300 bg-green-100 text-green-800 hover:bg-green-200",
        warning: "border border-yellow-300 bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        destructive: "border border-red-300 bg-red-100 text-red-800 hover:bg-red-200",
        outline: "border border-input text-foreground hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        sm: "h-11 min-w-11 px-3 py-2 text-xs",
        default: "h-12 min-w-12 px-4 py-2 text-sm",
        lg: "h-14 min-w-14 px-5 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)