import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";

interface AISuggestionPopupProps {
  open: boolean;
  onClose: () => void;
  onSelect: (suggestion: string) => void;
  suggestions: string[];
  title: string;
}

const AISuggestionPopup = ({ 
  open, 
  onClose, 
  onSelect, 
  suggestions, 
  title 
}: AISuggestionPopupProps) => {
  const [loading, setLoading] = useState(false);

  const handleSelect = (suggestion: string) => {
    onSelect(suggestion);
    onClose();
  };

  // Simulate loading on open
  useState(() => {
    if (open) {
      setLoading(true);
      setTimeout(() => setLoading(false), 800);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Suggestions - {title}
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Analyzing and generating suggestions...</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {suggestions.map((suggestion, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 hover:bg-primary-light hover:border-primary transition-colors"
                onClick={() => handleSelect(suggestion)}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="w-6 h-6 rounded-full bg-primary-light text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <span className="flex-1">{suggestion}</span>
                </div>
              </Button>
            ))}
          </div>
        )}
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AISuggestionPopup;
