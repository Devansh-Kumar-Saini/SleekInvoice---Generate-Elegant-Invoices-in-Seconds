import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InvoicePreview } from "@/components/invoice-preview";
import { Plus, Trash2, FileText, Loader2 } from "lucide-react";
import { type InvoiceItem } from "@shared/schema";

const categories = [
  "Electronics",
  "Groceries",
  "Services",
  "Consulting",
  "Software",
  "Hardware",
  "Office Supplies",
  "Other",
];

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
];

const formSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companyLogo: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  currency: z.string().min(1, "Currency is required"),
  taxPercentage: z.number().min(0).max(100),
  discountType: z.enum(["flat", "percentage", "none"]),
  discountValue: z.number().min(0),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateInvoice() {
  const [items, setItems] = useState<InvoiceItem[]>([
    { name: "", quantity: 1, price: 0, details: "" },
  ]);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      companyLogo: "",
      date: new Date().toISOString().split("T")[0],
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      category: "",
      currency: "USD",
      taxPercentage: 10,
      discountType: "none",
      discountValue: 0,
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (invoiceData: any) => {
      return apiRequest("POST", "/api/invoices", invoiceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Invoice created successfully",
        description: "Your invoice has been saved and is ready to download.",
      });
      // Reset form
      form.reset();
      setItems([{ name: "", quantity: 1, price: 0, details: "" }]);
      setLogoPreview("");
      // Navigate to receipts
      setLocation("/receipts");
    },
    onError: (error: any) => {
      toast({
        title: "Error creating invoice",
        description: error.message || "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addItem = () => {
    setItems([...items, { name: "", quantity: 1, price: 0, details: "" }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleLogoUrlChange = (url: string) => {
    form.setValue("companyLogo", url);
    setLogoPreview(url);
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const taxPercentage = form.watch("taxPercentage") || 0;
  const tax = (subtotal * taxPercentage) / 100;
  const discountType = form.watch("discountType");
  const discountValue = form.watch("discountValue") || 0;
  const discount =
    discountType === "flat"
      ? discountValue
      : discountType === "percentage"
      ? (subtotal * discountValue) / 100
      : 0;
  const grandTotal = subtotal + tax - discount;

  const selectedCurrency = currencies.find((c) => c.code === form.watch("currency"));
  const formatCurrency = (amount: number) => {
    return `${selectedCurrency?.symbol || "$"}${amount.toFixed(2)}`;
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    // Validate items
    const validItems = items.filter((item) => item.name.trim() !== "");
    if (validItems.length === 0) {
      toast({
        title: "No items added",
        description: "Please add at least one item to the invoice.",
        variant: "destructive",
      });
      return;
    }

    // Prepare invoice data
    const invoiceData = {
      companyName: data.companyName,
      companyLogo: logoPreview || "",
      date: data.date,
      customerName: data.customerName,
      customerEmail: data.customerEmail || "",
      customerPhone: data.customerPhone || "",
      customerAddress: data.customerAddress || "",
      category: data.category,
      currency: data.currency,
      items: JSON.stringify(validItems),
      subtotal: subtotal.toString(),
      taxPercentage: data.taxPercentage.toString(),
      tax: tax.toString(),
      discountType: data.discountType === "none" ? null : data.discountType,
      discountValue: data.discountType === "none" ? null : data.discountValue.toString(),
      discount: data.discountType === "none" ? null : discount.toString(),
      grandTotal: grandTotal.toString(),
    };

    createInvoiceMutation.mutate(invoiceData);
  });

  const handleClearForm = () => {
    form.reset();
    setItems([{ name: "", quantity: 1, price: 0, details: "" }]);
    setLogoPreview("");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-2" data-testid="text-page-title">
            Create Invoice
          </h1>
          <p className="text-sm text-muted-foreground">
            Fill in the details below to generate a professional invoice
          </p>
        </div>

        <div className="flex flex-col xl:flex-row gap-6">
          {/* Form Section */}
          <div className="xl:w-2/3 space-y-6">
            {/* Company Information */}
            <Card className="p-8">
              <h2 className="text-xl font-semibold mb-6">Company Information</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-medium">
                    Company Name *
                  </Label>
                  <Input
                    id="companyName"
                    data-testid="input-company-name"
                    placeholder="Enter your company name"
                    {...form.register("companyName")}
                    className="h-12"
                  />
                  {form.formState.errors.companyName && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.companyName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyLogo" className="text-sm font-medium">
                    Company Logo (URL)
                  </Label>
                  <div className="flex gap-4">
                    <Input
                      id="companyLogo"
                      data-testid="input-company-logo"
                      placeholder="https://example.com/logo.png"
                      value={logoPreview}
                      onChange={(e) => handleLogoUrlChange(e.target.value)}
                      className="h-12 flex-1"
                    />
                    {logoPreview && (
                      <div className="w-12 h-12 border border-border rounded-md overflow-hidden flex items-center justify-center bg-card">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter a URL to your company logo
                  </p>
                </div>
              </div>
            </Card>

            {/* Invoice Details */}
            <Card className="p-8">
              <h2 className="text-xl font-semibold mb-6">Invoice Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium">
                    Date *
                  </Label>
                  <Input
                    id="date"
                    data-testid="input-date"
                    type="date"
                    {...form.register("date")}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">
                    Category *
                  </Label>
                  <Select
                    value={form.watch("category")}
                    onValueChange={(value) => form.setValue("category", value)}
                  >
                    <SelectTrigger
                      id="category"
                      data-testid="select-category"
                      className="h-12"
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat} data-testid={`option-category-${cat.toLowerCase()}`}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-sm font-medium">
                    Currency *
                  </Label>
                  <Select
                    value={form.watch("currency")}
                    onValueChange={(value) => form.setValue("currency", value)}
                  >
                    <SelectTrigger
                      id="currency"
                      data-testid="select-currency"
                      className="h-12"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((curr) => (
                        <SelectItem key={curr.code} value={curr.code} data-testid={`option-currency-${curr.code.toLowerCase()}`}>
                          {curr.symbol} {curr.code} - {curr.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Customer Information */}
            <Card className="p-8">
              <h2 className="text-xl font-semibold mb-6">Customer Information</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="customerName" className="text-sm font-medium">
                    Customer Name *
                  </Label>
                  <Input
                    id="customerName"
                    data-testid="input-customer-name"
                    placeholder="Enter customer name"
                    {...form.register("customerName")}
                    className="h-12"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="customerEmail"
                      data-testid="input-customer-email"
                      type="email"
                      placeholder="customer@example.com"
                      {...form.register("customerEmail")}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerPhone" className="text-sm font-medium">
                      Phone
                    </Label>
                    <Input
                      id="customerPhone"
                      data-testid="input-customer-phone"
                      placeholder="+1 (555) 123-4567"
                      {...form.register("customerPhone")}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerAddress" className="text-sm font-medium">
                    Address
                  </Label>
                  <Textarea
                    id="customerAddress"
                    data-testid="input-customer-address"
                    placeholder="Enter customer address"
                    {...form.register("customerAddress")}
                    className="min-h-24 resize-none"
                  />
                </div>
              </div>
            </Card>

            {/* Items */}
            <Card className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Items</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  data-testid="button-add-item"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-4 p-4 border border-border rounded-md bg-card hover-elevate"
                    data-testid={`item-row-${index}`}
                  >
                    <div className="col-span-12 md:col-span-4 space-y-2">
                      <Label className="text-sm font-medium">Item Name *</Label>
                      <Input
                        placeholder="Product or service"
                        value={item.name}
                        onChange={(e) => updateItem(index, "name", e.target.value)}
                        data-testid={`input-item-name-${index}`}
                        className="h-12"
                      />
                    </div>

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

                    <div className="col-span-6 md:col-span-2 space-y-2">
                      <Label className="text-sm font-medium">Price *</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) =>
                          updateItem(index, "price", parseFloat(e.target.value) || 0)
                        }
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

                    <div className="col-span-2 md:col-span-1 flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                        data-testid={`button-remove-item-${index}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Calculations */}
            <Card className="p-8">
              <h2 className="text-xl font-semibold mb-6">Calculations</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="taxPercentage" className="text-sm font-medium">
                      Tax Percentage (%)
                    </Label>
                    <Input
                      id="taxPercentage"
                      data-testid="input-tax-percentage"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      {...form.register("taxPercentage", {
                        valueAsNumber: true,
                      })}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountType" className="text-sm font-medium">
                      Discount Type
                    </Label>
                    <Select
                      value={form.watch("discountType")}
                      onValueChange={(value) =>
                        form.setValue("discountType", value as any)
                      }
                    >
                      <SelectTrigger
                        id="discountType"
                        data-testid="select-discount-type"
                        className="h-12"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Discount</SelectItem>
                        <SelectItem value="flat">Flat Amount</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {discountType !== "none" && (
                  <div className="space-y-2">
                    <Label htmlFor="discountValue" className="text-sm font-medium">
                      Discount Value{" "}
                      {discountType === "percentage" ? "(%)" : `(${selectedCurrency?.symbol})`}
                    </Label>
                    <Input
                      id="discountValue"
                      data-testid="input-discount-value"
                      type="number"
                      min="0"
                      step="0.01"
                      {...form.register("discountValue", {
                        valueAsNumber: true,
                      })}
                      className="h-12"
                    />
                  </div>
                )}

                {/* Totals Display */}
                <div className="border-t border-border pt-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground">Subtotal</span>
                    <span className="text-base font-mono font-semibold" data-testid="text-subtotal">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground">
                      Tax ({taxPercentage}%)
                    </span>
                    <span className="text-base font-mono font-semibold" data-testid="text-tax">
                      {formatCurrency(tax)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground">Discount</span>
                      <span className="text-base font-mono font-semibold text-destructive" data-testid="text-discount">
                        -{formatCurrency(discount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t border-border">
                    <span className="text-lg font-semibold text-foreground">
                      Grand Total
                    </span>
                    <span className="text-2xl font-mono font-bold text-primary" data-testid="text-grand-total">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <Card className="p-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleSubmit}
                  disabled={createInvoiceMutation.isPending}
                  className="flex-1 h-12"
                  data-testid="button-generate-invoice"
                >
                  {createInvoiceMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Invoice
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearForm}
                  disabled={createInvoiceMutation.isPending}
                  className="h-12"
                  data-testid="button-clear-form"
                >
                  Clear Form
                </Button>
              </div>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="w-full xl:w-1/3 xl:sticky xl:top-4 xl:h-[calc(100vh-4rem)] overflow-y-auto">
            <InvoicePreview
              companyName={form.watch("companyName")}
              companyLogo={logoPreview}
              date={form.watch("date")}
              customerName={form.watch("customerName")}
              customerEmail={form.watch("customerEmail")}
              customerPhone={form.watch("customerPhone")}
              customerAddress={form.watch("customerAddress")}
              category={form.watch("category")}
              currency={form.watch("currency")}
              items={items}
              subtotal={subtotal}
              taxPercentage={taxPercentage}
              tax={tax}
              discount={discount}
              grandTotal={grandTotal}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
