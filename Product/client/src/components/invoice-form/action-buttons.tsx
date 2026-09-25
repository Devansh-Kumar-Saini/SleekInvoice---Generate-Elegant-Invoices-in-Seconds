import { FileDown, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ActionButtonsProps {
  isGenerating: boolean;
  onSubmit: () => void;
  onClear: () => void;
}

export function ActionButtons({ isGenerating, onSubmit, onClear }: ActionButtonsProps) {
  return (
    <Card className="p-6 sm:p-8 mt-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          variant="default"
          size="lg"
          onClick={onSubmit}
          disabled={isGenerating}
          className="flex-1 h-12"
          data-testid="button-generate-invoice"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4 mr-2" />
              Download PDF
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="lg"
          type="button"
          onClick={onClear}
          disabled={isGenerating}
          className="h-12"
          data-testid="button-clear-form"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Clear Form
        </Button>
      </div>
    </Card>
  );
}
