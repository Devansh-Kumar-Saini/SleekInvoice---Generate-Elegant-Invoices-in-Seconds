import * as React from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export type ToastVariant = "default" | "destructive";

export interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  variant: ToastVariant;
}

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

let toasts: ToastItem[] = [];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

export function toast({ variant = "default", title, description }: ToastOptions): { id: string } {
  const id = Math.random().toString(36).slice(2, 9);
  toasts = [...toasts, { id, title, description, variant }];
  notify();
  setTimeout(() => dismissToast(id), 5000);
  return { id };
}

export function ToastContainer() {
  const [, setTick] = React.useState(0);

  React.useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-4">
      {toasts.map((t) => {
        const isError = t.variant === "destructive";
        return (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg bg-card text-card-foreground transition-all duration-200 ${
              isError
                ? "border-destructive/40 border-l-4 border-l-destructive"
                : "border-primary/40 border-l-4 border-l-primary"
            }`}
          >
            {isError ? (
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              {t.title && <p className="text-sm font-semibold leading-tight">{t.title}</p>}
              {t.description && (
                <p className="text-sm text-muted-foreground mt-0.5 leading-snug break-words">
                  {t.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              className="text-muted-foreground hover:text-foreground shrink-0 p-1 -mr-1 -mt-1 rounded-md opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
