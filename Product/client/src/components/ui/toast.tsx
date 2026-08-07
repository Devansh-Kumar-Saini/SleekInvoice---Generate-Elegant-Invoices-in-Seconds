import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export type ToastProps = {
  className?: string
  children?: React.ReactNode
  onClose?: () => void
  variant?: "default" | "destructive"
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = "default", children, onClose }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg flex items-center gap-4",
          variant === "default" 
            ? "bg-background border text-foreground" 
            : "bg-destructive text-destructive-foreground",
          className
        )}
      >
        {children}
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)

Toast.displayName = "Toast"

export const ToastTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))

ToastTitle.displayName = "ToastTitle"

export const ToastDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))

ToastDescription.displayName = "ToastDescription"
