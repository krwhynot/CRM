import { cva } from "class-variance-authority"

export const priorityIndicatorVariants = cva(
  "rounded-full border-2 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      priority: {
        low: "bg-gray-100 border-gray-300 text-gray-700",
        medium: "bg-blue-100 border-blue-300 text-blue-700",
        high: "bg-orange-100 border-orange-300 text-orange-700",
        critical: "bg-red-100 border-red-400 text-red-800",
      },
      size: {
        sm: "w-6 h-6 min-w-[44px] min-h-[44px] p-2",
        default: "w-8 h-8 min-w-[48px] min-h-[48px] p-3",
        lg: "w-10 h-10 min-w-[52px] min-h-[52px] p-4",
      },
    },
    defaultVariants: {
      priority: "medium",
      size: "default",
    },
  }
)