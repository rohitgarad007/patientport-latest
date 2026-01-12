import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bed, BedStatus } from '@/types/bedManagement';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface EditBedDialogProps {
  bed: Bed;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditBedDialog = ({ bed, open, onOpenChange }: EditBedDialogProps) => {
  const [formData, setFormData] = useState({
    status: bed.status,
    notes: bed.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Bed updated successfully!', {
      description: `Bed #${bed.number} has been updated`,
    });
    onOpenChange(false);
  };

  const statusColors = {
    available: 'bg-available/10 text-available border-available',
    occupied: 'bg-occupied/10 text-occupied border-occupied',
    reserved: 'bg-reserved/10 text-reserved border-reserved',
    maintenance: 'bg-maintenance/10 text-maintenance border-maintenance',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Bed #{bed.number}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Current Status Display */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <span className="text-sm font-medium">Current Status:</span>
            <Badge className={statusColors[bed.status]} variant="outline">
              {bed.status.charAt(0).toUpperCase() + bed.status.slice(1)}
            </Badge>
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status">Update Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as BedStatus })}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="available">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-available" />
                    Available
                  </div>
                </SelectItem>
                <SelectItem value="occupied">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-occupied" />
                    Occupied
                  </div>
                </SelectItem>
                <SelectItem value="reserved">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-reserved" />
                    Reserved
                  </div>
                </SelectItem>
                <SelectItem value="maintenance">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-maintenance" />
                    Maintenance
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Patient Information (Read-only if occupied) */}
          {bed.status === 'occupied' && bed.patientName && (
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg border">
              <h4 className="font-semibold text-sm">Patient Information</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <p className="font-medium">{bed.patientName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">ID:</span>
                  <p className="font-medium">{bed.patientId}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Admitted:</span>
                  <p className="font-medium">
                    {new Date(bed.admissionDate!).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes or comments about this bed..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
            />
          </div>

          {/* Bed Specifications */}
          <div className="space-y-2">
            <Label>Bed Specifications</Label>
            <div className="grid grid-cols-2 gap-2 text-sm p-3 bg-muted/50 rounded-lg">
              <div>
                <span className="text-muted-foreground">Bed Number:</span>
                <p className="font-medium">#{bed.number}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Type:</span>
                <p className="font-medium">Standard</p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
