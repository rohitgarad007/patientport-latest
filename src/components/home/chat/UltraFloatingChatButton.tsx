import { useState } from "react";
import { MessageCircle, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import UltraChatWindow from "./UltraChatWindow";

const UltraFloatingChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl transition-all duration-300 z-50",
          "bg-gradient-to-br from-primary via-primary to-secondary",
          "hover:scale-110 hover:shadow-primary/50",
          "group"
        )}
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6 text-white" />
            <Sparkles className="h-3 w-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
          </>
        )}
        <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-0 group-hover:opacity-100" />
      </Button>

      <UltraChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default UltraFloatingChatButton;
