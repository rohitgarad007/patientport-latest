import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Monitor, AlertTriangle } from "lucide-react";

interface Screen {
  id: string;
  name: string;
  location: string;
  doctor: any;
  status: string;
}

interface DeleteScreenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  screen: Screen | null;
  onConfirm: (screenId: string) => void;
}

export function DeleteScreenDialog({ open, onOpenChange, screen, onConfirm }: DeleteScreenDialogProps) {
  if (!screen) return null;

  const handleConfirm = () => {
    onConfirm(screen.id);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-destructive/10 rounded-full">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <AlertDialogTitle>Delete Screen</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3">
            <p>
              Are you sure you want to delete this screen? This action cannot be undone.
            </p>
            <div className="p-3 bg-muted rounded-lg flex items-center gap-3">
              <Monitor className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">{screen.name}</p>
                <p className="text-sm text-muted-foreground">{screen.location}</p>
              </div>
            </div>
            <p className="text-sm">
              The screen configuration, settings, and all associated data will be permanently removed.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Screen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
