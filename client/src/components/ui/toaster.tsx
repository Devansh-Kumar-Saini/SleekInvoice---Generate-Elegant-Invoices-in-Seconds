import { useToast } from "@/hooks/use-toast"
import { Toast, ToastDescription, ToastTitle } from "./toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <>
      {toasts.map(({ id, title, description }) => (
        <Toast key={id}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && (
              <ToastDescription>{description}</ToastDescription>
            )}
          </div>
        </Toast>
      ))}
    </>
  )
}
