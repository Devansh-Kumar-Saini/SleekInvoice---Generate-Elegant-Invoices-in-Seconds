import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Invoice item type
export const invoiceItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price must be positive"),
  details: z.string().optional(),
});

export type InvoiceItem = z.infer<typeof invoiceItemSchema>;

// Invoice table schema
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: text("invoice_number").notNull().unique(),
  date: text("date").notNull(),
  companyName: text("company_name").notNull(),
  companyLogo: text("company_logo"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  customerAddress: text("customer_address"),
  category: text("category").notNull(),
  currency: text("currency").notNull().default("USD"),
  items: text("items").notNull(), // JSON stringified array of InvoiceItem
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxPercentage: decimal("tax_percentage", { precision: 5, scale: 2 }).notNull().default("10"),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull(),
  discountType: text("discount_type"), // 'flat' or 'percentage'
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }),
  discount: decimal("discount", { precision: 10, scale: 2 }),
  grandTotal: decimal("grand_total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schema with validation
export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  invoiceNumber: true,
}).extend({
  companyName: z.string().min(1, "Company name is required"),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  currency: z.string().min(1, "Currency is required"),
  items: z.string().min(1, "At least one item is required"),
  subtotal: z.string(),
  taxPercentage: z.string(),
  tax: z.string(),
  discountType: z.string().optional().nullable(),
  discountValue: z.string().optional().nullable(),
  discount: z.string().optional().nullable(),
  grandTotal: z.string(),
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

// User schema (keeping existing for compatibility)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
