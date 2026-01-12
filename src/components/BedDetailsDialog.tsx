import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Bed } from '@/types/bedManagement';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, Clock, FileText, Bed as BedIcon } from 'lucide-react';

interface BedDetailsDialogProps {
  bed: Bed;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BedDetailsDialog = ({ bed, open, onOpenChange }: BedDetailsDialogProps) => {
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
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <BedIcon className="h-6 w-6" />
            Bed #{bed.number} Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Status</span>
            <Badge className={statusColors[bed.status]} variant="outline">
              {bed.status.charAt(0).toUpperCase() + bed.status.slice(1)}
            </Badge>
          </div>

          <Separator />

          {/* Bed Information */}
          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <BedIcon className="h-4 w-4 mt-1 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Bed Number</p>
                <p className="text-sm text-muted-foreground">{bed.number}</p>
              </div>
            </div>

            {bed.patientName && (
              <>
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Patient Name</p>
                    <p className="text-sm text-muted-foreground">{bed.patientName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Patient ID</p>
                    <p className="text-sm text-muted-foreground">{bed.patientId}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Admission Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(bed.admissionDate!).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Days in Hospital</p>
                    <p className="text-sm text-muted-foreground">
                      {Math.floor(
                        (Date.now() - new Date(bed.admissionDate!).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{' '}
                      days
                    </p>
                  </div>
                </div>
              </>
            )}

            {bed.notes && (
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Notes</p>
                  <p className="text-sm text-muted-foreground">{bed.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
