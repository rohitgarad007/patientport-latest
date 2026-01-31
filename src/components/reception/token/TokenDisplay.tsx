import { Patient } from "@/data/hospitalData-2";
import { Badge } from "@/components/ui/badge";

interface TokenDisplayProps {
  patient: Patient;
  variant?: "hero" | "large" | "medium" | "compact";
  showDetails?: boolean;
}

export const TokenDisplay = ({ patient, variant = "hero", showDetails = true }: TokenDisplayProps) => {
  const visitTypeLabels = {
    new: 'NEW PATIENT',
    'follow-up': 'FOLLOW-UP',
    emergency: 'EMERGENCY',
    consultation: 'CONSULTATION',
  };

  const visitTypeColors = {
    new: 'bg-primary text-primary-foreground',
    'follow-up': 'bg-success text-success-foreground',
    emergency: 'bg-destructive text-destructive-foreground',
    consultation: 'bg-warning text-warning-foreground',
  };

  if (variant === "hero") {
    return (
      <div className="text-center py-8">
        <p className="text-sm font-semibold tracking-widest text-primary uppercase mb-2">Now Serving</p>
        <div className="token-number text-8xl md:text-9xl font-bold text-token-active tracking-tight leading-none mb-4 shadow-token rounded-2xl inline-block px-8 py-4 bg-token-active/5">
          {patient.tokenNumber}
        </div>
        {showDetails && (
          <div className="space-y-2 mt-6">
            <h3 className="text-3xl font-semibold text-foreground">{patient.name}</h3>
            <div className="flex items-center justify-center gap-3">
              <span className="text-lg text-muted-foreground">{patient.age} yrs</span>
              <span className="text-muted-foreground">•</span>
              <Badge className={visitTypeColors[patient.visitType]}>
                {visitTypeLabels[patient.visitType]}
              </Badge>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === "large") {
    return (
      <div className="bg-gradient-warning text-center p-8 rounded-2xl shadow-token">
        <p className="text-sm font-semibold tracking-widest text-token-active-foreground/80 uppercase mb-2">Now Serving</p>
        <div className="token-number text-6xl font-bold text-token-active-foreground mb-3">
          {patient.tokenNumber}
        </div>
        {showDetails && (
          <>
            <h3 className="text-2xl font-semibold text-token-active-foreground">{patient.name}</h3>
            <p className="text-token-active-foreground/80">{patient.age} yrs • {patient.gender === 'M' ? 'Male' : 'Female'}</p>
          </>
        )}
      </div>
    );
  }

  if (variant === "medium") {
    return (
      <div className="bg-card p-6 rounded-xl shadow-lg border border-token-active/20">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-1">Currently Serving</p>
        <div className="token-number text-4xl font-bold text-token-active mb-2">
          {patient.tokenNumber}
        </div>
        {showDetails && (
          <div className="space-y-1">
            <h4 className="font-semibold text-foreground">{patient.name}</h4>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{patient.age} yrs</span>
              <Badge variant="outline" className="text-xs">
                {visitTypeLabels[patient.visitType]}
              </Badge>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
      <div className="flex items-center gap-3">
        <span className="token-number text-lg font-bold text-token-active">{patient.tokenNumber}</span>
        <span className="text-sm font-medium">{patient.name}</span>
      </div>
      <Badge variant="outline" className="text-xs">
        {patient.appointmentTime}
      </Badge>
    </div>
  );
};
