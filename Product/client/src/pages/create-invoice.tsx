import { useMemo, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Accordion } from "@/components/ui/accordion";
import { InvoicePreview } from "@/components/invoice-preview";
import {
  CompanyInfoSection,
  InvoiceDetailsSection,
  CustomizeSection,
  CustomerInfoSection,
  ItemsSection,
  CalculationsSection,
  PaymentInfoSection,
  ActionButtons,
} from "@/components/invoice-form";
import { type ColorizableTemplate } from "@/lib/pdf-templates";
import {
  type InvoiceItem,
  type FormValues,
  type PaymentImageType,
  type PaymentImageItem,
  currencies,
  generateInvoiceNumber,
  initialFormValues,
} from "@/types/invoice";
import { formatCurrencyAmount } from "@/lib/invoice-format";

export default function CreateInvoice() {
  const [items, setItems] = useState<InvoiceItem[]>([
    { name: "", quantity: 1, price: "", details: "" },
  ]);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState<string>(() => generateInvoiceNumber());
  const [openSection, setOpenSection] = useState<string>("company");
  const [values, setValues] = useState<FormValues>(initialFormValues);

  const updateField = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  // Sets one color slot for one template's overrides independently
  const setTemplateColor = (template: ColorizableTemplate, slotKey: string, value: string) => {
    setValues((prev) => {
      const current = prev.customColors;
      return {
        ...prev,
        customColors: {
          ...current,
          [template]: { ...current[template], [slotKey]: value },
        },
      };
    });
  };

  // Clears all overrides for one template, reverting every slot to default
  const resetTemplateColors = (template: ColorizableTemplate) => {
    setValues((prev) => {
      const next = { ...prev.customColors };
      delete next[template];
      return { ...prev, customColors: next };
    });
  };

  const addItem = () => {
    setItems((prev) => [...prev, { name: "", quantity: 1, price: "", details: "" }]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setItems((prev) => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      return newItems;
    });
  };

  const handleLogoUrlChange = (url: string) => {
    updateField("companyLogo", url);
    setLogoPreview(url);
  };

  const handleLogoFileChange = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      updateField("companyLogo", dataUrl);
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

  const addPaymentImage = () => {
    if (values.paymentImages.length >= 3) return;
    const usedTypes = new Set(values.paymentImages.map((img) => img.type));
    let nextType: PaymentImageType = "qr";
    if (!usedTypes.has("qr")) nextType = "qr";
    else if (!usedTypes.has("cheque")) nextType = "cheque";
    else if (!usedTypes.has("other")) nextType = "other";

    const defaultLabels: Record<PaymentImageType, string> = {
      qr: "Scan to Pay",
      cheque: "Cancelled Cheque",
      other: "Payment Document",
    };

    const newItem: PaymentImageItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      image: "",
      type: nextType,
      label: defaultLabels[nextType],
    };

    setValues((prev) => {
      const nextImages = [...prev.paymentImages, newItem];
      return {
        ...prev,
        paymentImages: nextImages,
        paymentImage: nextImages[0]?.image || "",
        paymentImageType: nextImages[0]?.type || "qr",
        paymentImageLabel: nextImages[0]?.label || "",
      };
    });
  };

  const removePaymentImage = (index: number) => {
    setValues((prev) => {
      const nextImages = prev.paymentImages.filter((_, i) => i !== index);
      return {
        ...prev,
        paymentImages: nextImages,
        paymentImage: nextImages[0]?.image || "",
        paymentImageType: nextImages[0]?.type || "qr",
        paymentImageLabel: nextImages[0]?.label || "",
      };
    });
  };

  const updatePaymentImage = (index: number, updates: Partial<PaymentImageItem>) => {
    setValues((prev) => {
      const nextImages = [...prev.paymentImages];
      nextImages[index] = { ...nextImages[index], ...updates };
      return {
        ...prev,
        paymentImages: nextImages,
        paymentImage: nextImages[0]?.image || "",
        paymentImageType: nextImages[0]?.type || "qr",
        paymentImageLabel: nextImages[0]?.label || "",
      };
    });
  };

  const handlePaymentImageFileChange = (index: number, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      updatePaymentImage(index, { image: dataUrl });
    };
    reader.onerror = () => {
      toast({
        title: "Couldn't read payment image file",
        description: "Please try a different image file.",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
  };

  const { taxPercentage: watchedTax, discountType, discountValue: watchedDiscountValue, currency } = values;

  // Calculate totals
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0),
    [items]
  );
  const taxPercentage = watchedTax || 0;
  const tax = (subtotal * taxPercentage) / 100;
  const discountValue = watchedDiscountValue || 0;
  const discount =
    discountType === "flat"
      ? discountValue
      : discountType === "percentage"
      ? (subtotal * discountValue) / 100
      : 0;
  const grandTotal = Math.max(subtotal + tax - discount, 0);

  const selectedCurrency = useMemo(
    () => currencies.find((c) => c.code === currency),
    [currency]
  );

  const formatCurrency = (amount: number) => {
    return formatCurrencyAmount(amount, selectedCurrency?.symbol || "$", selectedCurrency?.code);
  };

  const handleSubmit = async () => {
    const validItems = items.filter((item) => item.name.trim() !== "");
    if (validItems.length === 0) {
      toast({
        title: "No items added",
        description: "Please add at least one item to the invoice.",
        variant: "destructive",
      });
      return;
    }

    if (!values.companyName.trim() || !values.customerName.trim()) {
      toast({
        title: "Missing required details",
        description: "Company name and customer name are required.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { generateInvoicePDF } = await import("@/lib/pdf");
      const { warning } = await generateInvoicePDF({
        companyName: values.companyName,
        companyLogo: logoPreview || undefined,
        logoSize: values.logoSize,
        companyAddress: values.companyAddress || undefined,
        invoiceNumber,
        date: values.date,
        customerName: values.customerName,
        customerEmail: values.customerEmail || undefined,
        customerPhone: values.customerPhone || undefined,
        customerAddress: values.customerAddress || undefined,
        category: values.category || undefined,
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
        notes: values.notes || undefined,
        template: values.template,
        isDarkMode: values.invoiceTheme === "dark",
        customColors: values.customColors,
        bankName: values.bankName || undefined,
        accountName: values.accountName || undefined,
        accountNumber: values.accountNumber || undefined,
        routingCode: values.routingCode || undefined,
        upiId: values.upiId || undefined,
        paymentTerms: values.paymentTerms || undefined,
        paymentNotes: values.paymentNotes || undefined,
        paymentImage: values.paymentImages?.[0]?.image || undefined,
        paymentImageType: values.paymentImages?.[0]?.type || undefined,
        paymentImageLabel: values.paymentImages?.[0]?.label || undefined,
        paymentImages: values.paymentImages
          ?.filter((img) => img.image && img.image.trim())
          .map((img) => ({
            image: img.image,
            type: img.type,
            label: img.label,
          })),
      });

      if (warning) {
        toast({
          title: "Invoice generated with a warning",
          description: warning,
          variant: "destructive",
        });
      }

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
  };

  const handleClearForm = () => {
    setValues({
      ...initialFormValues,
      date: new Date().toISOString().split("T")[0],
    });
    setItems([{ name: "", quantity: 1, price: "", details: "" }]);
    setLogoPreview("");
    setInvoiceNumber(generateInvoiceNumber());
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
              <CompanyInfoSection
                values={values}
                logoPreview={logoPreview}
                updateField={updateField}
                handleLogoUrlChange={handleLogoUrlChange}
                handleLogoFileChange={handleLogoFileChange}
              />

              <InvoiceDetailsSection
                values={values}
                invoiceNumber={invoiceNumber}
                setInvoiceNumber={setInvoiceNumber}
                updateField={updateField}
              />

              <CustomizeSection
                values={values}
                updateField={updateField}
                setTemplateColor={setTemplateColor}
                resetTemplateColors={resetTemplateColors}
              />

              <CustomerInfoSection
                values={values}
                updateField={updateField}
              />

              <ItemsSection
                items={items}
                category={values.category}
                addItem={addItem}
                removeItem={removeItem}
                updateItem={updateItem}
              />

              <CalculationsSection
                values={values}
                subtotal={subtotal}
                taxPercentage={taxPercentage}
                tax={tax}
                discount={discount}
                grandTotal={grandTotal}
                selectedCurrency={selectedCurrency}
                formatCurrency={formatCurrency}
                updateField={updateField}
              />

              <PaymentInfoSection
                values={values}
                updateField={updateField}
                addPaymentImage={addPaymentImage}
                removePaymentImage={removePaymentImage}
                updatePaymentImage={updatePaymentImage}
                handlePaymentImageFileChange={handlePaymentImageFileChange}
              />
            </Accordion>

            <ActionButtons
              isGenerating={isGenerating}
              onSubmit={handleSubmit}
              onClear={handleClearForm}
            />
          </div>

          {/* Preview Section */}
          <div className="w-full xl:w-1/2 xl:sticky xl:top-20">
            <div
              className="max-h-[calc(100vh-6rem)] overflow-y-auto overflow-x-auto rounded-xl border border-card-border bg-muted/40 p-4 sm:p-6"
              data-testid="invoice-preview-scroll-area"
            >
              <div className="min-w-fit w-full">
                <InvoicePreview
                  template={values.template}
                  companyName={values.companyName}
                  companyLogo={logoPreview}
                  logoSize={values.logoSize}
                  companyAddress={values.companyAddress}
                  invoiceNumber={invoiceNumber}
                  date={values.date}
                  customerName={values.customerName}
                  customerEmail={values.customerEmail}
                  customerPhone={values.customerPhone}
                  customerAddress={values.customerAddress}
                  category={values.category}
                  currency={values.currency}
                  items={items}
                  subtotal={subtotal}
                  taxPercentage={taxPercentage}
                  tax={tax}
                  discount={discount}
                  grandTotal={grandTotal}
                  notes={values.notes}
                  customColors={values.customColors}
                  invoiceTheme={values.invoiceTheme}
                  bankName={values.bankName}
                  accountName={values.accountName}
                  accountNumber={values.accountNumber}
                  routingCode={values.routingCode}
                  upiId={values.upiId}
                  paymentTerms={values.paymentTerms}
                  paymentNotes={values.paymentNotes}
                  paymentImage={values.paymentImages?.[0]?.image || ""}
                  paymentImageType={values.paymentImages?.[0]?.type || values.paymentImageType}
                  paymentImageLabel={values.paymentImages?.[0]?.label || values.paymentImageLabel}
                  paymentImages={values.paymentImages}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
