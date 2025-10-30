import { randomUUID } from "crypto";
import type { InsertInvoice, InsertUser } from "@shared/schema";

declare global {
  var storage: MemStorage;
}

type StorageInvoice = {
  id: string;
  invoiceNumber: string;
  date: string;
  companyName: string;
  companyLogo?: string | null;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  customerAddress?: string | null;
  category: string;
  currency: string;
  items: string;
  subtotal: string;
  taxPercentage: string;
  tax: string;
  discountType?: string | null;
  discountValue?: string | null;
  discount?: string | null;
  grandTotal: string;
  createdAt: Date;
};

type StorageUser = {
  id: string;
  username: string;
  password: string;
};

class MemStorage {
  users: Map<string, StorageUser>;
  invoices: Map<string, StorageInvoice>;
  invoiceCounter: Map<string, number>;

  constructor() {
    this.users = new Map();
    this.invoices = new Map();
    this.invoiceCounter = new Map();
    this.initializeSampleData();
  }

  private initializeSampleData() {
    this.createUser({ 
      username: "admin", 
      password: "admin123" 
    });
    
    const sampleItems = [{
      name: "Web Development",
      quantity: 1,
      price: 1000,
      details: "Website redesign"
    }];
    
    this.createInvoice({
      date: new Date().toISOString().split('T')[0],
      companyName: "Example Corp",
      companyLogo: null,
      customerName: "Test Client",
      customerEmail: "client@example.com",
      customerPhone: "123-456-7890",
      customerAddress: "123 Main St",
      category: "services",
      currency: "USD",
      items: JSON.stringify(sampleItems),
      subtotal: "1000",
      taxPercentage: "10",
      tax: "100",
      discountType: null,
      discountValue: null,
      discount: null,
      grandTotal: "1100",
      invoiceNumber: "INV-000001"
    });
  }

  async getUser(id: string): Promise<StorageUser | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<StorageUser | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: InsertUser): Promise<StorageUser> {
    const id = randomUUID();
    const newUser = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  generateInvoiceNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const dateKey = `${year}${month}${day}`;
    const currentCount = this.invoiceCounter.get(dateKey) || 0;
    const newCount = currentCount + 1;
    this.invoiceCounter.set(dateKey, newCount);
    const sequenceNumber = String(newCount).padStart(3, "0");
    return `INV-${dateKey}-${sequenceNumber}`;
  }

  async createInvoice(invoice: Omit<InsertInvoice, 'id' | 'createdAt'> & { invoiceNumber: string }): Promise<StorageInvoice> {
    const id = randomUUID();
    const now = new Date();
    const newInvoice = {
      ...invoice,
      id,
      createdAt: now,
    };
    this.invoices.set(id, newInvoice);
    return newInvoice;
  }

  async getInvoice(id: string): Promise<StorageInvoice | undefined> {
    return this.invoices.get(id);
  }

  async getAllInvoices(): Promise<StorageInvoice[]> {
    return Array.from(this.invoices.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async deleteInvoice(id: string): Promise<boolean> {
    return this.invoices.delete(id);
  }
}

// Persistent storage instance
export const storage = global.storage || new MemStorage();
global.storage = storage;
