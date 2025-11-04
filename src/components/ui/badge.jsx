import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))]",
        secondary:
          "border-transparent bg-[hsl(var(--color-secondary))] text-[hsl(var(--color-secondary-foreground))]",
        success:
          "border-transparent bg-[hsl(var(--color-success))] text-[hsl(var(--color-success-foreground))]",
        destructive:
          "border-transparent bg-[hsl(var(--color-destructive))] text-[hsl(var(--color-destructive-foreground))]",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

