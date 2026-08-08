import { Link } from "wouter";
import { FileStack, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <div
              className="flex items-center gap-2.5 hover-elevate rounded-md px-3 py-2 -ml-3 cursor-pointer"
              data-testid="link-home"
            >
              <div className="w-9 h-9 bg-primary rounded-lg shadow-sm flex items-center justify-center shrink-0">
                <FileStack className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground tracking-tight whitespace-nowrap">
                Invoice<span className="text-primary">Forge</span>
              </span>
            </div>
          </Link>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}