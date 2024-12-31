import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(` 
            flex 
            min-h-[60px] 
            w-full  
            rounded-[10px] 
            border 
            border-color
            bg-muted
            px-3 
            py-2 
            text-sm 
            text-foreground
            shadow-sm 
            placeholder:text-muted-foreground !important
            placeholder:opacity-40 !important 
            focus-visible:outline-none 
            disabled:cursor-not-allowed 
            disabled:opacity-50`,
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
