import { ThemeProvider } from "@/hooks/use-theme";
import { Header } from "@/components/header";
import { ToastContainer } from "@/hooks/use-toast";
import CreateInvoice from "@/pages/create-invoice";
import NotFound from "@/pages/not-found";

export default function App() {
  const isHome = window.location.pathname === "/" || window.location.pathname === "";

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <Header />
        {isHome ? <CreateInvoice /> : <NotFound />}
      </div>
      <ToastContainer />
    </ThemeProvider>
  );
}
