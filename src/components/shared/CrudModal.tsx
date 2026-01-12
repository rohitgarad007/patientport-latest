import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CrudModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  onSave?: () => void;
  onCancel?: () => void;
  mode: "view" | "add" | "edit";
  saveDisabled?: boolean;
}

export function CrudModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSave,
  onCancel,
  mode,
  saveDisabled,
}: CrudModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="py-4">{children}</div>
        {mode !== "view" && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                onCancel?.();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={!!saveDisabled}
              aria-disabled={!!saveDisabled}
              onClick={() => {
                if (saveDisabled) return;
                onSave?.();
                onOpenChange(false);
              }}
            >
              {mode === "add" ? "Add" : "Save Changes"}
            </Button>
          </DialogFooter>
        )}
        {mode === "view" && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
