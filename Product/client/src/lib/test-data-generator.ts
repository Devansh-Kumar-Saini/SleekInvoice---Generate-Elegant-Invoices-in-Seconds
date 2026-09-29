import {
  type FormValues,
  type InvoiceItem,
  generateInvoiceNumber,
  categories,
  currencies,
} from "@/types/invoice";

const COMPANY_NAMES = [
  "Acme Cloud Technologies Pvt Ltd",
  "Zenith Design & Media Studios",
  "Apex Software Labs Inc",
  "Nordic Logistics & Freight Corp",
  "Horizon Creative Works",
  "Quantum Systems International",
  "Sterling Financial Advisory",
  "BlueSky Global Consulting",
  "Nexus Digital Innovations",
];

const COMPANY_ADDRESSES = [
  "Tower B, 14th Floor, Cyber City, Phase 2, Gurugram, Haryana 122002",
  "Level 5, Embassy Tech Village, Outer Ring Road, Bengaluru, Karnataka 560103",
  "Plot 42, Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra 400051",
  "1600 Innovation Boulevard, Suite 500, Austin, TX 78701",
  "35 King William Street, Financial District, London EC4N 7TW, United Kingdom",
];

const CUSTOMER_NAMES = [
  "Rahul Sharma",
  "Priya Deshmukh",
  "Vikramaditya Singhania",
  "Sarah Jenkins",
  "Ananya Malhotra",
  "David K. Miller",
  "Aarav Patel",
  "Elena Rostova",
  "Kavita Krishnan",
  "Marcus Vance",
];

const DOMAINS = ["example.com", "techcorp.io", "ventures.co", "globalfin.org", "enterprise.in"];

const CITIES = [
  "Bengaluru, KA 560001",
  "Mumbai, MH 400001",
  "New Delhi, DL 110001",
  "Hyderabad, TS 500081",
  "San Francisco, CA 94105",
  "London, EC2A 4NE",
];

const ITEM_POOL: Array<{ name: string; minPrice: number; maxPrice: number; details: string }> = [
  {
    name: "Enterprise Cloud Hosting & Infrastructure",
    minPrice: 45000,
    maxPrice: 120000,
    details: "High-availability multi-region cluster with automated backups and 99.99% uptime SLA",
  },
  {
    name: "Full-Stack Web Application Development",
    minPrice: 85000,
    maxPrice: 350000,
    details: "Custom React/Node architecture, microservices, secure authentication, and REST APIs",
  },
  {
    name: "UI/UX Design System & Interactive Prototypes",
    minPrice: 30000,
    maxPrice: 95000,
    details: "Complete design token library, Figma wireframes, responsive mobile/desktop screens",
  },
  {
    name: "Cybersecurity & Vulnerability Assessment",
    minPrice: 40000,
    maxPrice: 150000,
    details: "OWASP Top 10 penetration testing, static code analysis, and compliance audit report",
  },
  {
    name: "PostgreSQL Database Performance Tuning",
    minPrice: 25000,
    maxPrice: 75000,
    details: "Slow query profiling, index optimization, connection pooling, and replication setup",
  },
  {
    name: "DevOps CI/CD Pipeline Automation",
    minPrice: 35000,
    maxPrice: 80000,
    details: "GitHub Actions workflow setup, Docker containerization, and Kubernetes staging cluster",
  },
  {
    name: "Mobile App Development & QA Testing",
    minPrice: 90000,
    maxPrice: 280000,
    details: "Native iOS & Android builds, end-to-end testing, app store deployment pipeline",
  },
  {
    name: "AI & Machine Learning Model Integration",
    minPrice: 60000,
    maxPrice: 220000,
    details: "Custom LLM prompt pipelines, vector embeddings, and real-time semantic search API",
  },
  {
    name: "Technical Architecture Advisory & Consulting",
    minPrice: 15000,
    maxPrice: 60000,
    details: "Bi-weekly executive engineering reviews, roadmap planning, and code quality benchmarks",
  },
  {
    name: "Annual Maintenance & 24/7 Priority Support",
    minPrice: 50000,
    maxPrice: 180000,
    details: "Dedicated Slack channel, 1-hour critical response SLA, and monthly security patching",
  },
];

const BANK_NAMES = [
  "HDFC Bank",
  "ICICI Bank",
  "State Bank of India",
  "Axis Bank",
  "JPMorgan Chase",
  "HSBC Global",
];

function sample<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1));
}

export interface GeneratedInvoiceData {
  values: FormValues;
  items: InvoiceItem[];
  invoiceNumber: string;
}

/**
 * Generates rich, realistic, randomized test data for the invoice form.
 * @param itemCount Number of invoice items to generate (defaults to 3-5 random items if omitted).
 */
export function generateRandomInvoiceData(itemCount?: number): GeneratedInvoiceData {
  const count = typeof itemCount === "number" && itemCount > 0 ? itemCount : randomInt(3, 5);
  const companyName = sample(COMPANY_NAMES);
  const customerName = sample(CUSTOMER_NAMES);
  const sanitizedName = customerName.toLowerCase().replace(/[^a-z]/g, "");
  const domain = sample(DOMAINS);
  const customerEmail = `${sanitizedName}@${domain}`;
  const customerPhone = `+91 ${randomInt(91000, 99999)} ${randomInt(10000, 99999)}`;
  const companyAddress = sample(COMPANY_ADDRESSES);
  const customerAddress = `${randomInt(101, 999)}, Avenue ${randomInt(1, 15)}, ${sample(CITIES)}`;

  const currencyCode = sample(["INR", "USD", "EUR", "GBP"]);
  const isINR = currencyCode === "INR";

  // Build items
  const shuffledItems = [...ITEM_POOL].sort(() => 0.5 - Math.random());
  const items: InvoiceItem[] = [];

  for (let i = 0; i < count; i++) {
    const templateItem = shuffledItems[i % shuffledItems.length];
    const qty = randomInt(1, 4);
    // Scale price depending on currency
    const rawPrice = isINR
      ? randomInt(templateItem.minPrice, templateItem.maxPrice)
      : Math.round(randomInt(templateItem.minPrice, templateItem.maxPrice) / 80);
    // Round to clean 100 or 50
    const roundedPrice = Math.round(rawPrice / 100) * 100 || rawPrice;

    items.push({
      name: i < shuffledItems.length ? templateItem.name : `${templateItem.name} (Phase ${Math.floor(i / shuffledItems.length) + 1})`,
      quantity: qty,
      price: roundedPrice,
      details: templateItem.details,
    });
  }

  const taxPercentage = sample([0, 5, 12, 18]);
  const hasDiscount = Math.random() > 0.3;
  const discountType = hasDiscount ? (Math.random() > 0.5 ? "percentage" : "flat") : "none";
  const discountValue =
    discountType === "percentage"
      ? randomInt(5, 15)
      : discountType === "flat"
      ? isINR
        ? randomInt(1, 10) * 1000
        : randomInt(20, 150)
      : 0;

  const bankName = sample(BANK_NAMES);
  const accNum = `${randomInt(1000, 9999)}${randomInt(1000, 9999)}${randomInt(1000, 9999)}`;
  const ifsc = `${bankName.slice(0, 4).toUpperCase()}000${randomInt(1000, 9999)}`;

  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];

  const values: FormValues = {
    companyName,
    companyLogo: "",
    logoSize: "medium",
    companyAddress,
    date: dateStr,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    category: sample(categories),
    currency: currencyCode,
    taxPercentage,
    discountType,
    discountValue,
    notes: "Thank you for your business! Payment is due within 30 days of invoice date. Please mention invoice reference on transfer.",
    template: sample(["classic", "clean", "modern", "elegant", "sidebar"]),
    customColors: {},
    invoiceTheme: "light",
    bankName,
    accountName: companyName,
    accountNumber: accNum,
    routingCode: ifsc,
    upiId: `${companyName.slice(0, 6).toLowerCase().replace(/[^a-z]/g, "")}@upi`,
    paymentTerms: "Net 30 Days. 1.5% interest per month on delayed remittances.",
    paymentNotes: `Wire transfer instructions: Bank: ${bankName}, A/C: ${accNum}, IFSC: ${ifsc}`,
    paymentImages: [
      {
        id: "1",
        image: "",
        type: "qr",
        label: "Scan to Pay",
      },
    ],
    paymentImage: "",
    paymentImageType: "qr",
    paymentImageLabel: "Scan to Pay",
  };

  return {
    values,
    items,
    invoiceNumber: generateInvoiceNumber(),
  };
}
