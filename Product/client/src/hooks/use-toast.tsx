import * as React from "react"
import { toast as toastify, type Id } from "react-toastify"

/**
 * Unified notification adapter — every popup, notification, and error in the
 * app (across all templates, forms, and background operations) is expected
 * to go through this single `toast()` function, which is a thin wrapper
 * around react-toastify. Keeping the original `{ title, description,
 * variant }` call shape means every existing call site (and any future one)
 * stays untouched — only the rendering backend changed.
 */

export type ToastVariant = "default" | "destructive"

export interface ToastOptions {
  title?: string
  description?: string
  variant?: ToastVariant
}

function renderToastBody({ title, description }: ToastOptions) {
  if (title && description) {
    return (
      <div className="grid gap-1">
        <p className="text-sm font-semibold leading-tight">{title}</p>
        <p className="text-sm opacity-90 leading-snug">{description}</p>
      </div>
    )
  }
  return <p className="text-sm font-medium">{title ?? description ?? ""}</p>
}

function toast({ variant = "default", ...props }: ToastOptions): { id: Id } {
  const body = renderToastBody(props)

  const id =
    variant === "destructive"
      ? toastify.error(body)
      : toastify.success(body)

  return { id }
}

/** Kept for API parity with the previous hook-based implementation — react-toastify
 * needs no subscription/state plumbing, so this is now just a stable accessor. */
function useToast() {
  return {
    toast,
    dismiss: (toastId?: Id) => toastify.dismiss(toastId),
  }
}

export { useToast, toast }
