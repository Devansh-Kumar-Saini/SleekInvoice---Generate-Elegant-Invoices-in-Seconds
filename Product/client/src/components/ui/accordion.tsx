import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionContextType {
  value?: string;
  onValueChange?: (val: string) => void;
}

const AccordionContext = React.createContext<AccordionContextType>({});

export function Accordion({
  value,
  onValueChange,
  className,
  children,
}: {
  value?: string;
  onValueChange?: (val: string) => void;
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <AccordionContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  );
}

const ItemContext = React.createContext<{ value: string; isOpen: boolean }>({
  value: "",
  isOpen: false,
});

export const AccordionItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ value, className, children, ...props }, ref) => {
  const { value: active } = React.useContext(AccordionContext);
  const isOpen = active === value;

  return (
    <ItemContext.Provider value={{ value, isOpen }}>
      <div
        ref={ref}
        className={cn("border-b", className)}
        data-state={isOpen ? "open" : "closed"}
        {...props}
      >
        {children}
      </div>
    </ItemContext.Provider>
  );
});
AccordionItem.displayName = "AccordionItem";

export const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const { onValueChange } = React.useContext(AccordionContext);
  const { value, isOpen } = React.useContext(ItemContext);

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onValueChange?.(isOpen ? "" : value)}
      className={cn(
        "flex w-full items-center justify-between py-4 font-medium transition-all hover:underline",
        className
      )}
      data-state={isOpen ? "open" : "closed"}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </button>
  );
});
AccordionTrigger.displayName = "AccordionTrigger";

export const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { isOpen } = React.useContext(ItemContext);
  if (!isOpen) return null;

  return (
    <div ref={ref} className={className} data-state="open" {...props}>
      {children}
    </div>
  );
});
AccordionContent.displayName = "AccordionContent";
