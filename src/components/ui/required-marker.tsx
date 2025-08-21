import * as React from "react"
import { cn } from "@/lib/utils"

export interface RequiredMarkerProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** Custom accessibility label. Defaults to "required field" */
  ariaLabel?: string
}

const RequiredMarker = React.forwardRef<HTMLSpanElement, RequiredMarkerProps>(
  ({ className, ariaLabel = "required field", ...props }, ref) => {
    return (
      <span
        className={cn("text-red-500 font-medium ml-1", className)}
        aria-label={ariaLabel}
        role="img"
        ref={ref}
        {...props}
      >
        *
      </span>
    )
  }
)
RequiredMarker.displayName = "RequiredMarker"

export { RequiredMarker }