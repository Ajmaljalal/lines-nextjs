import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          `flex 
          w-full
          rounded-[10px]
          bg-muted
          p-3
          text-base
          text-foreground
          transition-colors
          file:border-0
          file:bg-transparent
          file:text-sm
          file:font-medium
          placeholder:text-muted-foreground !important
          placeholder:opacity-40 !important
          focus-visible:outline-none
          disabled:cursor-not-allowed
          disabled:opacity-50
          border
          border-color
          md:text-sm`,
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
