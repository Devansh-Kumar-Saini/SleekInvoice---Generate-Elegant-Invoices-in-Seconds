import * as React from "react";
import { cn } from "@/lib/utils";

const variantClasses = {
  default: "bg-primary text-primary-foreground border border-primary-border",
  destructive: "bg-destructive text-destructive-foreground border border-destructive-border",
  outline: "border [border-color:var(--button-outline)] shadow-xs active:shadow-none",
  secondary: "border bg-secondary text-secondary-foreground border-secondary-border",
  ghost: "border border-transparent",
};

const sizeClasses = {
  default: "min-h-9 px-4 py-2",
  sm: "min-h-8 rounded-md px-3 text-xs",
  lg: "min-h-10 rounded-md px-8",
  icon: "h-9 w-9",
};

export type ButtonVariant = keyof typeof variantClasses;
export type ButtonSize = keyof typeof sizeClasses;

export function buttonVariants({
  variant = "default",
  size = "default",
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover-elevate active-elevate-2",
    variantClasses[variant] || variantClasses.default,
    sizeClasses[size] || sizeClasses.default,
    className
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
