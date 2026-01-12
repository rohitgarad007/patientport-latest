import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutGrid, ArrowRight } from "lucide-react";

export const DesignSwitcher = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const designs = [
    { path: "/", label: "Design 1", description: "Classic Layout" },
    { path: "/home-2", label: "Design 2", description: "Advanced Glassmorphism" },
  ];

  const currentDesign = designs.find((d) => d.path === location.pathname) || designs[0];
  const otherDesign = designs.find((d) => d.path !== location.pathname) || designs[1];

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
      <div className="bg-card/95 backdrop-blur-xl border-2 border-primary/20 rounded-2xl shadow-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LayoutGrid className="h-4 w-4" />
          <span className="font-medium">Current: {currentDesign.label}</span>
        </div>
        <Button
          onClick={() => navigate(otherDesign.path)}
          className="w-full justify-between group hover:shadow-lg transition-all"
          size="lg"
        >
          <span>Switch to {otherDesign.label}</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          {otherDesign.description}
        </p>
      </div>
    </div>
  );
};
