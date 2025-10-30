import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Download, Trash2, FileDown, Search, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type Invoice } from "@shared/schema";
import { generateInvoicePDF } from "@/lib/pdf-generator";
import { downloadCSV } from "@/lib/csv-download";
import { useState } from "react";
import { Link } from "wouter";

export default function ReceiptsGallery() {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/invoices/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Invoice deleted",
        description: "The invoice has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error deleting invoice",
        description: "Failed to delete invoice. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      await generateInvoicePDF(invoice);
      toast({
        title: "PDF downloaded",
        description: "Your invoice PDF has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error generating PDF",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadCSV = async (invoiceId: string) => {
    try {
      await downloadCSV(invoiceId);
      toast({
        title: "CSV downloaded",
        description: "Your invoice data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Error exporting CSV",
        description: "Failed to export CSV. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInvoice = (id: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      deleteInvoiceMutation.mutate(id);
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      invoice.customerName.toLowerCase().includes(query) ||
      invoice.invoiceNumber.toLowerCase().includes(query) ||
      invoice.companyName.toLowerCase().includes(query)
    );
  });

  const currencies: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    INR: "₹",
  };

  const formatCurrency = (amount: string, currency: string) => {
    const symbol = currencies[currency] || "$";
    return `${symbol}${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2" data-testid="text-receipts-title">
            Invoice Gallery
          </h1>
          <p className="text-sm text-muted-foreground">
            View and manage all your generated invoices
          </p>
        </div>

        {/* Search Bar */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name or invoice number..."
                className="h-12 pl-10"
                data-testid="input-search-receipts"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card className="p-16">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading invoices...</p>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && filteredInvoices.length === 0 && !searchQuery && (
          <Card className="p-16">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No invoices yet
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Create your first invoice to get started. All your generated invoices
                  will appear here.
                </p>
              </div>
              <Link href="/">
                <Button className="mt-4" data-testid="button-create-first">
                  <FileText className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* No Search Results */}
        {!isLoading && filteredInvoices.length === 0 && searchQuery && (
          <Card className="p-16">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No invoices found
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  No invoices match your search query. Try a different search term.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
                data-testid="button-clear-search"
              >
                Clear Search
              </Button>
            </div>
          </Card>
        )}

        {/* Receipts Grid */}
        {!isLoading && filteredInvoices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInvoices.map((receipt) => (
              <Card
                key={receipt.id}
                className="p-6 hover-elevate"
                data-testid={`receipt-card-${receipt.id}`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-xs font-mono text-muted-foreground mb-1" data-testid={`receipt-number-${receipt.id}`}>
                        {receipt.invoiceNumber}
                      </div>
                      <h3 className="font-semibold text-foreground mb-1" data-testid={`receipt-customer-${receipt.id}`}>
                        {receipt.customerName}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {receipt.category}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-mono font-bold text-primary" data-testid={`receipt-total-${receipt.id}`}>
                        {formatCurrency(receipt.grandTotal, receipt.currency)}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground" data-testid={`receipt-date-${receipt.id}`}>
                    {new Date(receipt.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDownloadPDF(receipt)}
                      data-testid={`button-download-${receipt.id}`}
                    >
                      <Download className="w-3 h-3 mr-2" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDownloadCSV(receipt.id)}
                      data-testid={`button-export-${receipt.id}`}
                    >
                      <FileDown className="w-3 h-3 mr-2" />
                      CSV
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => handleDeleteInvoice(receipt.id)}
                      disabled={deleteInvoiceMutation.isPending}
                      data-testid={`button-delete-${receipt.id}`}
                    >
                      {deleteInvoiceMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-destructive" />
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
