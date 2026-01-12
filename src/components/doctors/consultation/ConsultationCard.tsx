import { Eye, Pencil, Trash2, Calendar, Pill, FlaskConical, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ConsultationSummary } from "@/data/consultationSummaries";

interface ConsultationCardProps {
  summary: ConsultationSummary;
  viewMode: "grid" | "list";
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ConsultationCard({
  summary,
  viewMode,
  onView,
  onEdit,
  onDelete,
}: ConsultationCardProps) {
  const formatFrequency = (freq: string) => freq.replace(/_/g, " ");

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <div className="flex flex-col md:flex-row md:items-center p-4 gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground truncate">
                  {summary.diagnosis}
                </h3>
                <Badge variant="" className="mt-1 text-xs">
                  {summary.diagnosisCode}
                </Badge>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <FlaskConical className="h-4 w-4" />
                {summary.labTests.length} tests
              </span>
              <span className="flex items-center gap-1">
                <Pill className="h-4 w-4" />
                {summary.prescription.length} medications
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {summary.createdOn}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(summary.id)}
              className="gap-1"
            >
              <Eye className="h-4 w-4" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(summary.id)}
              className="gap-1"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(summary.id)}
              className="gap-1 text-destructive hover:text-destructive hover:bg-tag-red-bg"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground line-clamp-2 mb-2">
              {summary.diagnosis}
            </h3>
            <p  className="text-xs">
              {summary.diagnosisCode}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 pb-4">

        {/* Lab Tests */}
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
            <FlaskConical className="h-4 w-4" />
            Lab Tests ({summary.labTests.length})
          </div>

          <div className="flex flex-wrap gap-1.5">
            {summary.labTests.map((test, i) => (
              <Badge
                key={i}
                className="rounded-full bg-[#D7F8DF] text-[#1E8A47] border border-transparent text-xs font-semibold px-3 py-1"
              >
                {test}
              </Badge>
            ))}
          </div>
        </div>

        {/* Patient History */}
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
            <History className="h-4 w-4" />
            Patient History ({summary.patientHistory.length})
          </div>

          <div className="flex flex-wrap gap-1.5">
            {summary.patientHistory.map((item, i) => (
              <Badge
                key={i}
                className="rounded-full bg-[#FFE7D6] text-[#D75A1F] border border-transparent text-xs font-semibold px-3 py-1"
              >
                {item}
              </Badge>
            ))}
          </div>
        </div>

        {/* Prescription */}
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
            <Pill className="h-4 w-4" />
            Prescription ({summary.prescription.length})
          </div>

          <div className="space-y-2">
            {summary.prescription.slice(0, 2).map((med, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">

                {/* Number Tag */}
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#D7E9FF] text-[#2A66D9] text-xs font-bold">
                  {i + 1}
                </span>

                {/* Medicine Text */}
                <div className="flex-1 min-w-0 leading-tight">
                  <span className="font-semibold text-foreground">{med.name}</span>
                  <span className="text-muted-foreground ml-1 text-xs">
                    {med.dosage} • {formatFrequency(med.frequency)}
                  </span>
                </div>
              </div>
            ))}

            {summary.prescription.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{summary.prescription.length - 2} more
              </span>
            )}
          </div>
        </div>

        {/* Created Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
          <Calendar className="h-4 w-4" />
          Created: {summary.createdOn}
        </div>

      </CardContent>

      <CardFooter className="pt-0 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView(summary.id)}
          className="flex-1 gap-1"
        >
          <Eye className="h-4 w-4" />
          View
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(summary.id)}
          className="flex-1 gap-1"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(summary.id)}
          className="gap-1 text-destructive hover:text-destructive hover:bg-tag-red-bg"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
