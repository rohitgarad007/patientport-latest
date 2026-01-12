import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { patients } from "@/lib/dummy-data";
import { User, Phone, Calendar, AlertCircle, History, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PatientDialogProps {
  patientId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PatientDialog({ patientId, open, onOpenChange }: PatientDialogProps) {
  const navigate = useNavigate();
  const patient = patients.find(p => p.id === patientId);

  if (!patient) return null;

  const handleStartTreatment = () => {
    onOpenChange(false);
    navigate(`/treatment?patientId=${patientId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Patient Information</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-start gap-6">
            <img
              src={patient.photo}
              alt={patient.name}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-primary/20"
            />
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-foreground mb-2">{patient.name}</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{patient.age} years, {patient.gender}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{patient.contact}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>ID: {patient.id}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <History className="h-4 w-4" />
                  <span>{patient.pastVisits} past visits</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {patient.allergies.length > 0 && (
              <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <h4 className="font-semibold text-destructive">Allergies</h4>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {patient.allergies.map((allergy) => (
                    <Badge key={allergy} variant="destructive">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <h4 className="font-semibold text-foreground mb-2">Medical History</h4>
              <p className="text-sm text-muted-foreground">{patient.medicalHistory}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleStartTreatment} className="flex-1 gap-2 bg-gradient-primary">
              <PlayCircle className="h-4 w-4" />
              Start Treatment
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
