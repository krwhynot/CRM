import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-nunito font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md hover:-translate-y-0.5",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive-hover shadow-sm hover:shadow-md hover:-translate-y-0.5",
        success: "bg-success text-success-foreground hover:bg-success-hover shadow-sm hover:shadow-md hover:-translate-y-0.5",
        warning: "bg-warning text-warning-foreground hover:bg-warning-hover shadow-sm hover:shadow-md hover:-translate-y-0.5",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md hover:-translate-y-0.5",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-11 px-3 py-1.5 text-sm",
        default: "h-12 px-6 py-3 text-base",
        lg: "h-14 px-8 py-4 text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)