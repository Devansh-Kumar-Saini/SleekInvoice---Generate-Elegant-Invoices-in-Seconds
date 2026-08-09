import { Switch, Route } from "wouter";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { Header } from "@/components/header";
import CreateInvoice from "@/pages/create-invoice";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={CreateInvoice} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Header />
          <Router />
        </div>
        {/* Single, app-wide notification surface. Every popup, toast, and
         * error in the app goes through the toast() helper in
         * hooks/use-toast.tsx, which calls into react-toastify — this is the
         * one container that renders all of them. */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="colored"
          toastClassName="invoiceforge-toast"
        />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
