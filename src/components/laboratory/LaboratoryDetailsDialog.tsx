import { Laboratory } from '@/types/laboratory';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, MapPin, Phone, Mail, FileText, Award } from 'lucide-react';

interface LaboratoryDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  laboratory: Laboratory | null;
}

export const LaboratoryDetailsDialog = ({
  open,
  onOpenChange,
  laboratory,
}: LaboratoryDetailsDialogProps) => {
  if (!laboratory) return null;

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Pathology: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      Diagnostic: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      Imaging: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      Clinical: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      Research: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <FlaskConical className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-xl">{laboratory.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={getTypeColor(laboratory.type)}>
                  {laboratory.type}
                </Badge>
                <Badge 
                  variant={laboratory.status === 'Active' ? 'default' : 'secondary'}
                  className={laboratory.status === 'Active' 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }
                >
                  {laboratory.status}
                </Badge>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium text-muted-foreground">Location</div>
                <div className="text-foreground">{laboratory.location}</div>
                <div className="text-muted-foreground">{laboratory.city}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium text-muted-foreground">Contact Number</div>
                <div className="text-foreground">{laboratory.contactNumber}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium text-muted-foreground">Email</div>
                <div className="text-foreground">{laboratory.email}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium text-muted-foreground">License Number</div>
                <div className="text-foreground">{laboratory.licenseNo}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <Award className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium text-muted-foreground">Accreditation</div>
                <div className="text-foreground">{laboratory.accreditation}</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
