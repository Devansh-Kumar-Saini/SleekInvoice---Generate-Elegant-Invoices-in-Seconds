# Receipt/Invoice Generator - Design Guidelines

## Design Approach

**Selected Approach:** Design System - Material Design Principles with Professional Business Application Aesthetics

**Justification:** This is a utility-focused productivity tool where clarity, efficiency, and professional presentation are paramount. Drawing inspiration from modern business applications like Linear, Notion, and Wave Invoice for clean, functional interfaces that facilitate quick invoice creation and management.

**Key Design Principles:**
- **Clarity First:** Every element serves a functional purpose
- **Workflow Efficiency:** Minimize clicks and cognitive load
- **Professional Polish:** Business-appropriate aesthetics that inspire confidence
- **Scannable Information:** Clear visual hierarchy for rapid comprehension

---

## Core Design Elements

### A. Typography

**Font Families:**
- **Primary (UI/Body):** Inter or System UI Stack
- **Accent (Numbers/Invoices):** JetBrains Mono or Roboto Mono for invoice numbers, prices, totals

**Type Scale:**
- **Page Headers:** text-3xl font-semibold (Company info, Invoice preview header)
- **Section Headers:** text-xl font-semibold (Form sections, Receipt details)
- **Subsection Labels:** text-sm font-medium uppercase tracking-wide (Field labels, table headers)
- **Body Text:** text-base (Form inputs, descriptions)
- **Small Text:** text-sm (Helper text, secondary info)
- **Micro Text:** text-xs (Invoice metadata, timestamps)
- **Display Numbers:** text-2xl font-mono font-bold (Grand total)
- **Table Numbers:** text-base font-mono (Item prices, calculations)

---

### B. Layout System

**Spacing Primitives:** Tailwind units of **2, 4, 6, 8, 12, 16, 24**

**Primary Layout Pattern:**
- **Two-Column Desktop Layout:** 
  - Left: Invoice creation form (60% width, max-w-3xl)
  - Right: Live invoice preview (40% width, sticky positioning)
  - Single column on mobile with preview below form

**Form Layout:**
- Vertical spacing between sections: space-y-8
- Field groups: space-y-4
- Label-to-input: space-y-2
- Horizontal field pairs (e.g., date/invoice#): gap-4

**Container Strategy:**
- Main wrapper: max-w-7xl mx-auto px-6 py-12
- Form sections: Contained cards with p-6 to p-8
- Preview panel: p-8 for generous breathing room

---

### C. Component Library

#### 1. Form Components

**Input Fields:**
- Consistent height: h-12
- Border treatment with focus states
- Labels positioned above inputs with text-sm font-medium
- Helper text below inputs with text-xs
- Error states with inline validation messages

**Text Areas:**
- Minimum height: h-24
- For customer address, additional details

**File Upload (Logo):**
- Drag-and-drop zone with dashed border
- Preview thumbnail on upload (w-32 h-32)
- Alternative URL input field side-by-side

**Dynamic Item List:**
- Each item row in a flex container with gap-4
- Columns: Item Name (flex-1), Quantity (w-20), Price (w-32), Details (w-40), Remove button
- "Add Item" button below list with icon
- Subtle dividers between items

**Dropdown Selects:**
- Category selector with common options
- Currency selector with flag icons
- Consistent h-12 height matching inputs

**Date Picker:**
- Calendar popup component
- Auto-filled with current date
- Clear visual indicator of selected date

#### 2. Invoice Preview Component

**Structure:**
- Professional invoice template styled as printable document
- Simulated paper effect (subtle shadow, defined borders)
- Max-width: max-w-2xl for optimal reading

**Header Section:**
- Company logo: max-h-16, positioned top-left
- Company name: text-2xl font-bold
- Invoice number and date: top-right, text-sm font-mono

**Customer Info Block:**
- Labeled sections with clear hierarchy
- Address formatted with line breaks

**Items Table:**
- Clean table layout with header row
- Columns: Item, Quantity, Unit Price, Total
- Right-aligned numbers
- Subtle row dividers
- Bold row for subtotal/tax/total section

**Calculations Section:**
- Right-aligned with clear labels
- Subtotal, Tax (with %), Discount (if applied), Grand Total
- Grand total with emphasized styling (text-xl font-bold)

**Footer:**
- Notes section if applicable
- Generated timestamp

#### 3. Action Buttons

**Primary Actions:** 
- "Generate Invoice": Large, prominent (h-12, px-8)
- "Download PDF": Icon + label
- "Export CSV": Secondary style

**Secondary Actions:**
- "Add Item": Plus icon, outline style
- "Clear Form": Subtle, text button
- Remove item: Icon-only, small, destructive color hint

**Button Layouts:**
- Primary action buttons in a flex group gap-4
- Fixed to bottom on mobile for easy access

#### 4. Receipt Gallery/Management

**Layout:**
- Grid layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Card-based receipt previews
- Each card shows: Invoice number, customer name, date, total
- Hover state reveals actions (View, Download, Delete)

**Filtering/Search:**
- Search bar: w-full max-w-md
- Filter dropdowns: By category, date range
- Sort options: Date, Amount, Customer

#### 5. Navigation

**Top Bar:**
- Logo/App name left-aligned
- Navigation tabs: "Create Invoice" | "Receipts" center or right
- Simple, clean header with h-16 height

---

### D. Interactions & Micro-animations

**Use Sparingly:**
- Smooth transitions on form field focus (150ms)
- Subtle scale on button hover (scale-[1.02])
- Fade-in on invoice preview updates (opacity transitions)
- Smooth collapse/expand for advanced options

**NO animations for:**
- Page loads
- Tab switches
- Form submissions (use loading states instead)

---

## Page-Specific Guidelines

### Create Invoice Page

**Above the Fold:**
- Page header with title and brief description
- Form immediately visible (no unnecessary hero)

**Form Structure (Vertical Sections):**
1. **Company Information** (p-6 card)
   - Name input, Logo upload/URL
   
2. **Invoice Details** (p-6 card)
   - Date picker, Auto-generated invoice number (display only)
   - Category dropdown, Currency selector
   
3. **Customer Information** (p-6 card)
   - Name, Email, Phone (horizontal on desktop)
   - Address (textarea)
   
4. **Items** (p-6 card)
   - Dynamic list with add/remove
   - Real-time subtotal display
   
5. **Calculations** (p-6 card)
   - Tax % input, Discount input (flat or %)
   - Live-calculated totals display
   
6. **Actions** (sticky bottom or inline)
   - Preview toggle (mobile), Generate PDF, Export CSV, Clear

**Live Preview Panel (Desktop Right Side):**
- Sticky positioning (top-8)
- Updates in real-time as form is filled
- Professional invoice template display

### Receipts/Gallery Page

**Layout:**
- Search and filter bar at top (p-6)
- Grid of receipt cards below
- Pagination or infinite scroll for many receipts

**Receipt Card:**
- Compact preview with key info
- Quick actions on hover
- Click to open detailed view (modal or dedicated page)

---

## Accessibility & Validation

**Form Validation:**
- Inline error messages below fields
- Clear error states (red accent, descriptive text)
- Disable submit until required fields valid

**Input Guidance:**
- Placeholder examples: "$12.99" for price fields
- Format hints for phone, email
- Auto-formatting for currency display

**Keyboard Navigation:**
- Tab order follows logical form flow
- Enter key adds new item in items list
- Escape closes modals/previews

---

## Images

**Company Logo:**
- User-uploaded or URL-based
- Display: max-h-16 w-auto in form preview
- Invoice template: max-h-12 w-auto top-left

**No Hero Image:** This is a utility application - launch directly into the form interface

**Empty States:**
- Receipts gallery when empty: Simple illustration (icon + text)
- "No logo uploaded" placeholder in preview

---

## Responsive Behavior

**Mobile (< 768px):**
- Single column layout
- Preview accessed via "Preview Invoice" button (opens modal or bottom sheet)
- Simplified item list (stack fields vertically)
- Sticky action buttons at bottom

**Tablet (768px - 1024px):**
- Preview panel can be toggled or placed below form
- Maintain two-column where possible

**Desktop (> 1024px):**
- Side-by-side form + preview
- Multi-column form fields where appropriate

---

This design prioritizes workflow efficiency and professional presentation, ensuring users can quickly create polished invoices while maintaining clarity and ease of use throughout the application.