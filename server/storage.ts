import { type User, type InsertUser, type Invoice, type InsertInvoice } from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface with invoice methods
export interface IStorage {
  // User methods (existing)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Invoice methods
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  getAllInvoices(): Promise<Invoice[]>;
  deleteInvoice(id: string): Promise<boolean>;
  generateInvoiceNumber(): string;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private invoices: Map<string, Invoice>;
  private invoiceCounter: Map<string, number>; // Track invoice numbers per day

  constructor() {
    this.users = new Map();
    this.invoices = new Map();
    this.invoiceCounter = new Map();
  }

  // User methods (existing)
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Invoice methods
  generateInvoiceNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const dateKey = `${year}${month}${day}`;

    // Get current count for this date
    const currentCount = this.invoiceCounter.get(dateKey) || 0;
    const newCount = currentCount + 1;
    this.invoiceCounter.set(dateKey, newCount);

    // Format: INV-YYYYMMDD-XXX
    const sequenceNumber = String(newCount).padStart(3, "0");
    return `INV-${dateKey}-${sequenceNumber}`;
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = randomUUID();
    const now = new Date();
    
    const invoice: Invoice = {
      ...insertInvoice,
      id,
      createdAt: now,
    };
    
    this.invoices.set(id, invoice);
    return invoice;
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async getAllInvoices(): Promise<Invoice[]> {
    // Return invoices sorted by creation date (newest first)
    return Array.from(this.invoices.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async deleteInvoice(id: string): Promise<boolean> {
    return this.invoices.delete(id);
  }
}

export const storage = new MemStorage();
