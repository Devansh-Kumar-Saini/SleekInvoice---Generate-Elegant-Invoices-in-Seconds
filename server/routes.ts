import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInvoiceSchema, invoiceItemSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a new invoice
  app.post("/api/invoices", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertInvoiceSchema.parse(req.body);
      
      // Generate invoice number
      const invoiceNumber = storage.generateInvoiceNumber();
      
      // Create invoice with generated number
      const invoice = await storage.createInvoice({
        ...validatedData,
        invoiceNumber,
      });
      
      res.json(invoice);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validationError.toString() 
        });
      }
      console.error("Error creating invoice:", error);
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });

  // Get all invoices
  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await storage.getAllInvoices();
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  // Get a single invoice by ID
  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const invoice = await storage.getInvoice(id);
      
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ error: "Failed to fetch invoice" });
    }
  });

  // Delete an invoice
  app.delete("/api/invoices/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteInvoice(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      
      res.json({ success: true, message: "Invoice deleted successfully" });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      res.status(500).json({ error: "Failed to delete invoice" });
    }
  });

  // Generate PDF for an invoice
  app.post("/api/invoices/:id/pdf", async (req, res) => {
    try {
      const { id } = req.params;
      const invoice = await storage.getInvoice(id);
      
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      
      // PDF generation will be handled on the frontend using jsPDF
      // This endpoint returns the invoice data for PDF generation
      res.json(invoice);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  // Generate CSV for an invoice
  app.post("/api/invoices/:id/csv", async (req, res) => {
    try {
      const { id } = req.params;
      const invoice = await storage.getInvoice(id);
      
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      
      // Parse items from JSON string
      const items = JSON.parse(invoice.items);
      
      // Generate CSV content
      let csv = "Invoice Number,Date,Company,Customer,Category,Currency\n";
      csv += `${invoice.invoiceNumber},${invoice.date},${invoice.companyName},${invoice.customerName},${invoice.category},${invoice.currency}\n\n`;
      
      csv += "Item Name,Quantity,Price,Details,Total\n";
      items.forEach((item: any) => {
        const total = item.quantity * item.price;
        csv += `"${item.name}",${item.quantity},${item.price},"${item.details || ""}",${total}\n`;
      });
      
      csv += "\nCalculations\n";
      csv += `Subtotal,${invoice.subtotal}\n`;
      csv += `Tax (${invoice.taxPercentage}%),${invoice.tax}\n`;
      if (invoice.discount) {
        csv += `Discount,${invoice.discount}\n`;
      }
      csv += `Grand Total,${invoice.grandTotal}\n`;
      
      // Set headers for CSV download
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${invoice.invoiceNumber}.csv"`
      );
      
      res.send(csv);
    } catch (error) {
      console.error("Error generating CSV:", error);
      res.status(500).json({ error: "Failed to generate CSV" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
