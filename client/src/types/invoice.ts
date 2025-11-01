import { z } from "zod";

// Invoice item type
export const invoiceItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price must be positive"),
  details: z.string().optional(),
});

export type InvoiceItem = z.infer<typeof invoiceItemSchema>;

// Invoice form data type
export const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  date: z.string().min(1, "Date is required"),
  companyName: z.string().min(1, "Company name is required"),
  companyLogo: z.string().optional(),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  currency: z.string().min(1, "Currency is required"),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  subtotal: z.number(),
  taxPercentage: z.number(),
  tax: z.number(),
  discountType: z.enum(["flat", "percentage"]).optional(),
  discountValue: z.number().optional(),
  discount: z.number().optional(),
  grandTotal: z.number(),
});

export type Invoice = z.infer<typeof invoiceSchema>;
