import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, FlaskConical, History, Pill, User, X, FileText, Pencil } from "lucide-react";
import type { ConsultationSummary } from "@/data/consultationSummaries";

interface ViewSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: ConsultationSummary | null;
  onEdit?: (id: string) => void;
}

export function ViewSummaryDialog({
  open,
  onOpenChange,
  summary,
  onEdit,
}: ViewSummaryDialogProps) {
  if (!summary) return null;

  const formatFrequency = (freq: string) => freq.replace(/_/g, " ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
       

        <div className="space-y-6">
          {/* Diagnosis Section */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div>
                <p className="font-semibold text-lg text-foreground">{summary.diagnosis}</p>
                <p  className="mt-1 text-xs">{summary.diagnosisCode}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Lab Tests Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FlaskConical className="h-5 w-5 text-[#1E8A47]" />
              <h3 className="font-medium text-foreground">
                Lab Tests ({summary.labTests.length})
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {summary.labTests.map((test, i) => (
                <Badge
                  key={i}
                  className="rounded-full bg-[#D7F8DF] text-[#1E8A47] border border-transparent px-3 py-1.5 text-sm font-medium"
                >
                  {test}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Patient History Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <History className="h-5 w-5 text-[#D75A1F]" />
              <h3 className="font-medium text-foreground">
                Patient History ({summary.patientHistory.length})
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {summary.patientHistory.map((item, i) => (
                <Badge
                  key={i}
                  className="rounded-full bg-[#FFE7D6] text-[#D75A1F] border border-transparent px-3 py-1.5 text-sm font-medium"
                >
                  {item}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Prescription Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Pill className="h-5 w-5 text-[#2A66D9]" />
              <h3 className="font-medium text-foreground">
                Prescription ({summary.prescription.length})
              </h3>
            </div>

            <div className="space-y-3">
              {summary.prescription.map((med, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  {/* Blue Number Badge */}
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#D7E9FF] text-[#2A66D9] font-semibold">
                    {i + 1}
                  </span>

                  <div className="flex-1 leading-tight">
                    <p className="font-semibold text-foreground">{med.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {med.dosage} • {formatFrequency(med.frequency)} •{" "}
                      {formatFrequency(med.duration)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>


          <Separator />

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Created on: {summary.createdOn}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              {onEdit && (
                <Button onClick={() => onEdit(summary.id)} className="gap-2">
                  <Pencil className="h-4 w-4" />
                  Edit Summary
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
