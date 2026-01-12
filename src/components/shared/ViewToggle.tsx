import { LayoutGrid, LayoutList, LayoutPanelTop } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ViewToggleProps {
  view: "list" | "grid";
  onViewChange: (view: "list" | "grid") => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex gap-1 bg-muted p-1 rounded-lg">
      <Button
        variant={view === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("list")}
        className="gap-2"
      >
        <LayoutList className="w-4 h-4" />
        List
      </Button>
      <Button
        variant={view === "grid" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("grid")}
        className="gap-2"
      >
        <LayoutGrid className="w-4 h-4" />
        Grid
      </Button>
    </div>
  );
}
