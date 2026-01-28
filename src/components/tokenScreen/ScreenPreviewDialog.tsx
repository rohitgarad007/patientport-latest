import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScreenPreviewCard } from "./ScreenPreviewCard";
import { StatusBadge } from "./StatusBadge";
import { Monitor, MapPin, RefreshCw } from "lucide-react";

interface Screen {
  id: string;
  name: string;
  location: string;
  doctor: any;
  currentPatient: any;
  queue: any[];
  status: string;
  resolution: string;
  lastUpdated: string;
  layout: string;
}

interface ScreenPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  screen: Screen | null;
}

export function ScreenPreviewDialog({ open, onOpenChange, screen }: ScreenPreviewDialogProps) {
  if (!screen) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Monitor className="w-5 h-5 text-primary" />
            Screen Preview: {screen.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Screen Info Bar */}
          <div className="flex flex-wrap items-center gap-4 p-3 bg-muted rounded-lg text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{screen.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-muted-foreground" />
              <span>{screen.resolution}</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
              <span>Updated {screen.lastUpdated}</span>
            </div>
            <StatusBadge status={screen.status as any} />
          </div>

          {/* Live Preview */}
          <div className="border-2 border-dashed border-border rounded-lg p-4 bg-background">
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">Live Preview</p>
            <ScreenPreviewCard
              doctor={screen.doctor}
              currentPatient={screen.currentPatient}
              queue={screen.queue}
              showQueue={true}
            />
          </div>

          {/* Screen Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">Layout Template</p>
              <p className="font-medium capitalize">{screen.layout}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">Assigned Doctor</p>
              <p className="font-medium">{screen.doctor.name}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
