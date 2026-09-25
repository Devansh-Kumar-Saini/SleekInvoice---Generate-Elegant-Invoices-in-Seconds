import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { type InvoiceItem, QTY_OPTIONAL_CATEGORIES } from "@/types/invoice";

interface ItemsSectionProps {
  items: InvoiceItem[];
  category: string;
  addItem: () => void;
  removeItem: (index: number) => void;
  updateItem: (index: number, field: keyof InvoiceItem, value: string | number) => void;
}

export function ItemsSection({
  items,
  category,
  addItem,
  removeItem,
  updateItem,
}: ItemsSectionProps) {
  const showQty = !QTY_OPTIONAL_CATEGORIES.has(category);

  return (
    <AccordionItem
      value="items"
      className="rounded-xl border bg-card border-card-border text-card-foreground shadow-sm overflow-hidden"
    >
      <AccordionTrigger className="px-6 sm:px-8 py-5 hover:no-underline [&>svg]:ml-4">
        <div className="flex items-center justify-between w-full pr-2">
          <h2 className="text-xl font-semibold">Items</h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              addItem();
            }}
            data-testid="button-add-item"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-6 sm:px-8 pb-8">
        <div className="space-y-4">
          {!showQty && (
            <p className="text-xs text-muted-foreground -mt-2">
              Qty is hidden for {category} — each line item is treated as a single flat-fee entry.
            </p>
          )}
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-4 p-4 border border-border rounded-md bg-card hover-elevate"
              data-testid={`item-row-${index}`}
            >
              <div className={showQty ? "col-span-12 md:col-span-4 space-y-2" : "col-span-12 md:col-span-6 space-y-2"}>
                <Label className="text-sm font-medium">Item Name *</Label>
                <Input
                  placeholder="Product or service"
                  value={item.name}
                  onChange={(e) => updateItem(index, "name", e.target.value)}
                  data-testid={`input-item-name-${index}`}
                  className="h-12"
                />
              </div>

              {showQty && (
                <div className="col-span-6 md:col-span-2 space-y-2">
                  <Label className="text-sm font-medium">Qty *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, "quantity", parseInt(e.target.value) || 1)
                    }
                    data-testid={`input-item-quantity-${index}`}
                    className="h-12"
                  />
                </div>
              )}

              <div className="col-span-6 md:col-span-2 space-y-2">
                <Label className="text-sm font-medium">Price *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={item.price}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateItem(index, "price", val === "" ? "" : parseFloat(val) || 0);
                  }}
                  data-testid={`input-item-price-${index}`}
                  className="h-12"
                />
              </div>

              <div className="col-span-10 md:col-span-3 space-y-2">
                <Label className="text-sm font-medium">Details</Label>
                <Input
                  placeholder="e.g., SKU, warranty"
                  value={item.details || ""}
                  onChange={(e) => updateItem(index, "details", e.target.value)}
                  data-testid={`input-item-details-${index}`}
                  className="h-12"
                />
              </div>

              <div className="col-span-2 md:col-span-1 flex flex-col space-y-2">
                <Label className="text-sm font-medium invisible hidden md:block">
                  Remove
                </Label>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  data-testid={`button-remove-item-${index}`}
                  aria-label="Remove item"
                  className="h-12 w-full"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
