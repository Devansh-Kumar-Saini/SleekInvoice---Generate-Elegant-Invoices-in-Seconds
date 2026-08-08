import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { InvoicePreview } from "@/components/invoice-preview";
import { Plus, Trash2, FileDown, Loader2, RotateCcw } from "lucide-react";
import { generateInvoicePDF, INVOICE_TEMPLATES, type InvoiceTemplate } from "@/lib/pdf-generator";
import { type InvoiceItem } from "@/types/invoice";
import { useTheme } from "@/hooks/use-theme";
import { formatCurrencyAmount } from "@/lib/invoice-format";

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

// Categories where a "quantity" doesn't make sense by default (e.g. a
// consulting engagement or a flat-fee service) — Qty is hidden and optional
// for these until the user explicitly wants it.
const QTY_OPTIONAL_CATEGORIES = new Set(["Consulting", "Services"]);

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
];

type FormValues = {
  companyName: string;
  companyLogo: string;
  companyAddress: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  category: string;
  currency: string;
  taxPercentage: number;
  discountType: "none" | "flat" | "percentage";
  discountValue: number;
  notes: string;
  template: InvoiceTemplate;
};

function generateInvoiceNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(100 + Math.random() * 900); // 3-digit suffix
  return `INV-${y}${m}${d}-${rand}`;
}

export default function CreateInvoice() {
  const [items, setItems] = useState<InvoiceItem[]>([
    { name: "", quantity: 1, price: 0, details: "" },
  ]);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState<string>(() => generateInvoiceNumber());
  // Only one form section is expanded at a time; "Company Information" opens first.
  const [openSection, setOpenSection] = useState<string>("company");
  const { toast } = useToast();
  const { theme } = useTheme();

  const form = useForm<FormValues>({
    defaultValues: {
      companyName: "",
      companyLogo: "",
      companyAddress: "",
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
      notes: "",
      template: "classic",
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

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleLogoUrlChange = (url: string) => {
    form.setValue("companyLogo", url);
    setLogoPreview(url);
  };

  const handleLogoFileChange = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      form.setValue("companyLogo", dataUrl);
      setLogoPreview(dataUrl);
    };
    reader.onerror = () => {
      toast({
        title: "Couldn't read logo file",
        description: "Please try a different image file.",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
  };

  const category = form.watch("category");
  // For Consulting/Services, Qty isn't a natural fit (e.g. a flat-fee
  // engagement) — hide the field by default. Quantity still defaults to 1
  // under the hood so totals and the invoice designs are unaffected.
  const showQty = !QTY_OPTIONAL_CATEGORIES.has(category);

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
  const grandTotal = Math.max(subtotal + tax - discount, 0);

  const selectedCurrency = useMemo(
    () => currencies.find((c) => c.code === form.watch("currency")),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form.watch("currency")]
  );

  const formatCurrency = (amount: number) => {
    return formatCurrencyAmount(amount, selectedCurrency?.symbol || "$", selectedCurrency?.code);
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    const validItems = items.filter((item) => item.name.trim() !== "");
    if (validItems.length === 0) {
      toast({
        title: "No items added",
        description: "Please add at least one item to the invoice.",
        variant: "destructive",
      });
      return;
    }

    if (!data.companyName.trim() || !data.customerName.trim()) {
      toast({
        title: "Missing required details",
        description: "Company name and customer name are required.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      await generateInvoicePDF({
        companyName: data.companyName,
        companyLogo: logoPreview || undefined,
        companyAddress: data.companyAddress || undefined,
        invoiceNumber,
        date: data.date,
        customerName: data.customerName,
        customerEmail: data.customerEmail || undefined,
        customerPhone: data.customerPhone || undefined,
        customerAddress: data.customerAddress || undefined,
        category: data.category || undefined,
        currencySymbol: selectedCurrency?.symbol || "$",
        currencyCode: selectedCurrency?.code,
        items: validItems,
        subtotal,
        taxPercentage,
        tax,
        discountLabel:
          discountType === "percentage" ? `Discount (${discountValue}%)` : "Discount",
        discount,
        grandTotal,
        notes: data.notes || undefined,
        template: data.template,
        isDarkMode: theme === "dark",
      });

      toast({
        title: "Invoice generated successfully",
        description: `${invoiceNumber}.pdf has been downloaded.`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error generating invoice",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  });

  const handleClearForm = () => {
    form.reset();
    setItems([{ name: "", quantity: 1, price: 0, details: "" }]);
    setLogoPreview("");
    setInvoiceNumber(generateInvoiceNumber());
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* <div className="mb-8"> */}
          {/* <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2"
            data-testid="text-page-title"
          >
            Create Invoice
          </h1> */}
          {/* <p className="text-sm text-muted-foreground">
            Fill in the details below and InvoiceForge will generate a polished, ready-to-send PDF.
          </p> */}
        {/* </div> */}

        <div className="flex flex-col xl:flex-row gap-6 items-start">
          {/* Form Section */}
          <div className="w-full xl:w-1/2">
          <Accordion
            type="single"
            collapsible
            value={openSection}
            onValueChange={(value) => setOpenSection(value)}
            className="space-y-4"
          >
            {/* Company Information */}
            <AccordionItem value="company" className="rounded-xl border bg-card border-card-border text-card-foreground shadow-sm overflow-hidden">
                <AccordionTrigger className="px-6 sm:px-8 py-5 hover:no-underline [&>svg]:ml-4">
                  <h2 className="text-xl font-semibold text-left">Company Information</h2>
                </AccordionTrigger>
                <AccordionContent className="px-6 sm:px-8 pb-8">
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyLogo" className="text-sm font-medium">
                    Company Logo
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                      <Input
                        id="companyLogo"
                        data-testid="input-company-logo"
                        placeholder="https://example.com/logo.png"
                        value={logoPreview.startsWith("data:") ? "" : logoPreview}
                        onChange={(e) => handleLogoUrlChange(e.target.value)}
                        className="h-12"
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          id="companyLogoFile"
                          type="file"
                          accept="image/*"
                          data-testid="input-company-logo-file"
                          onChange={(e) => handleLogoFileChange(e.target.files?.[0] ?? null)}
                          className="h-10 text-xs file:text-xs file:font-medium"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Paste a logo URL, or upload an image file directly.
                      </p>
                    </div>
                    {logoPreview && (
                      <div className="w-16 h-16 border border-border rounded-md overflow-hidden flex items-center justify-center bg-card shrink-0">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyAddress" className="text-sm font-medium">
                    Address
                  </Label>
                  <Textarea
                    id="companyAddress"
                    data-testid="input-company-address"
                    placeholder="Enter your company address"
                    {...form.register("companyAddress")}
                    className="min-h-24 resize-none"
                  />
                </div>
              </div>
                </AccordionContent>
              </AccordionItem>

            {/* Invoice Details */}
            <AccordionItem value="invoice" className="rounded-xl border bg-card border-card-border text-card-foreground shadow-sm overflow-hidden">
                <AccordionTrigger className="px-6 sm:px-8 py-5 hover:no-underline [&>svg]:ml-4">
                  <h2 className="text-xl font-semibold text-left">Invoice Details</h2>
                </AccordionTrigger>
                <AccordionContent className="px-6 sm:px-8 pb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber" className="text-sm font-medium">
                    Invoice Number
                  </Label>
                  <Input
                    id="invoiceNumber"
                    data-testid="input-invoice-number"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="h-12 font-mono"
                  />
                </div>

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
                    Category
                  </Label>
                  <Select
                    value={form.watch("category")}
                    onValueChange={(value) => form.setValue("category", value)}
                  >
                    <SelectTrigger id="category" data-testid="select-category" className="h-12">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem
                          key={cat}
                          value={cat}
                          data-testid={`option-category-${cat.toLowerCase()}`}
                        >
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
                    <SelectTrigger id="currency" data-testid="select-currency" className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((curr) => (
                        <SelectItem
                          key={curr.code}
                          value={curr.code}
                          data-testid={`option-currency-${curr.code.toLowerCase()}`}
                        >
                          {curr.symbol} {curr.code} - {curr.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="template" className="text-sm font-medium">
                    PDF Template
                  </Label>
                  <Select
                    value={form.watch("template")}
                    onValueChange={(value) => form.setValue("template", value as InvoiceTemplate)}
                  >
                    <SelectTrigger id="template" data-testid="select-template" className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INVOICE_TEMPLATES.map((tpl) => (
                        <SelectItem
                          key={tpl.id}
                          value={tpl.id}
                          data-testid={`option-template-${tpl.id}`}
                        >
                          {tpl.label} — {tpl.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
                </AccordionContent>
              </AccordionItem>

            {/* Customer Information */}
            <AccordionItem value="customer" className="rounded-xl border bg-card border-card-border text-card-foreground shadow-sm overflow-hidden">
                <AccordionTrigger className="px-6 sm:px-8 py-5 hover:no-underline [&>svg]:ml-4">
                  <h2 className="text-xl font-semibold text-left">Customer Information</h2>
                </AccordionTrigger>
                <AccordionContent className="px-6 sm:px-8 pb-8">
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
                </AccordionContent>
              </AccordionItem>

            {/* Items */}
            <AccordionItem value="items" className="rounded-xl border bg-card border-card-border text-card-foreground shadow-sm overflow-hidden">
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

            {/* Calculations */}
            <AccordionItem value="calculations" className="rounded-xl border bg-card border-card-border text-card-foreground shadow-sm overflow-hidden">
                <AccordionTrigger className="px-6 sm:px-8 py-5 hover:no-underline [&>svg]:ml-4">
                  <h2 className="text-xl font-semibold text-left">Calculations</h2>
                </AccordionTrigger>
                <AccordionContent className="px-6 sm:px-8 pb-8">
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
                      onValueChange={(value) => form.setValue("discountType", value as any)}
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

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Notes (optional)
                  </Label>
                  <Textarea
                    id="notes"
                    data-testid="input-notes"
                    placeholder="Payment terms, thank-you message, etc."
                    {...form.register("notes")}
                    className="min-h-20 resize-none"
                  />
                </div>

                {/* Totals Display */}
                <div className="border-t border-border pt-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground">Subtotal</span>
                    <span className="text-base font-mono font-semibold" data-testid="text-subtotal">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground">Tax ({taxPercentage}%)</span>
                    <span className="text-base font-mono font-semibold" data-testid="text-tax">
                      {formatCurrency(tax)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground">Discount</span>
                      <span
                        className="text-base font-mono font-semibold text-destructive"
                        data-testid="text-discount"
                      >
                        -{formatCurrency(discount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t border-border">
                    <span className="text-lg font-semibold text-foreground">Grand Total</span>
                    <span
                      className="text-2xl font-mono font-bold text-primary"
                      data-testid="text-grand-total"
                    >
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
                </AccordionContent>
              </AccordionItem>
          </Accordion>

            {/* Action Buttons */}
            <Card className="p-6 sm:p-8 mt-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isGenerating}
                  className="flex-1 h-12"
                  data-testid="button-generate-invoice"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4 mr-2" />
                      Download PDF
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  type="button"
                  onClick={handleClearForm}
                  disabled={isGenerating}
                  className="h-12"
                  data-testid="button-clear-form"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear Form
                </Button>
              </div>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="w-full xl:w-1/2 xl:sticky xl:top-20">
            <div
              className="max-h-[calc(100vh-6rem)] overflow-y-auto overflow-x-auto rounded-xl border border-card-border bg-muted/40 p-4 sm:p-6"
              data-testid="invoice-preview-scroll-area"
            >
              <div className="min-w-fit">
                <InvoicePreview
                  template={form.watch("template")}
                  companyName={form.watch("companyName")}
                  companyLogo={logoPreview}
                  companyAddress={form.watch("companyAddress")}
                  invoiceNumber={invoiceNumber}
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
      </div>
    </div>
  );
}
