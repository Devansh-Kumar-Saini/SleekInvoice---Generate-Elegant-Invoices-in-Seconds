import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 items-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h1 className="text-2xl font-bold text-foreground">404 Page Not Found</h1>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            The page you're looking for doesn't exist.
          </p>

          <Link href="/">
            <Button variant="default" className="mt-6 w-full" data-testid="button-go-home">
              <Home className="w-4 h-4 mr-2" />
              Back to InvoiceForge
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}