import { Link, useLocation } from "wouter";
import { FileText, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const [location] = useLocation();

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/">
              <div className="flex items-center gap-2 hover-elevate rounded-md px-3 py-2 -ml-3 cursor-pointer">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold text-foreground">
                  InvoiceGen
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-1">
              <Link href="/">
                <Button
                  variant={location === "/" ? "secondary" : "ghost"}
                  size="sm"
                  data-testid="nav-create-invoice"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
              </Link>
              <Link href="/receipts">
                <Button
                  variant={location === "/receipts" ? "secondary" : "ghost"}
                  size="sm"
                  data-testid="nav-receipts"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Receipts
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
