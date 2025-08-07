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
            border-gray-300
            bg-muted
            px-3 
            py-2 
            text-base 
            text-foreground
            placeholder:text-muted-foreground !important
            placeholder:opacity-60 !important 
            focus-visible:outline-none 
            disabled:cursor-not-allowed 
            resize-none
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
