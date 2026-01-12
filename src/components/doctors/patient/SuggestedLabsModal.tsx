import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface Lab {
  id: string;
  laboratory_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  created_at: string;
  relation_id?: string;
  added_at?: string;
}

interface SuggestedLabsModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (lab: Lab) => void;
  labs: Lab[];
  loading: boolean;
}

const SuggestedLabsModal = ({ 
  open, 
  onClose, 
  onSelect, 
  labs,
  loading 
}: SuggestedLabsModalProps) => {

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-primary" />
            Hospital Preferred Laboratories
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading preferred laboratories...</p>
          </div>
        ) : labs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No preferred laboratories found for this hospital.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto p-1">
            {labs.map((lab) => (
              <div
                key={lab.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border hover:bg-secondary/50 transition-colors gap-4"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-base">{lab.name}</h4>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                    <span>{lab.email}</span>
                    <span>•</span>
                    <span>{lab.phone}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{lab.address}</p>
                </div>
                <Button 
                    size="sm" 
                    onClick={() => {
                        onSelect(lab);
                        onClose();
                    }}
                >
                  Select
                </Button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuggestedLabsModal;
