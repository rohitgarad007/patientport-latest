import { Patient } from "@/data/hospitalData-2";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Crown, Clock } from "lucide-react";

interface QueueListProps {
  patients: Patient[];
  title?: string;
  variant?: "default" | "compact" | "detailed" | "cards";
  maxItems?: number;
}

export const QueueList = ({ patients, title = "Waiting Queue", variant = "default", maxItems = 5 }: QueueListProps) => {
  const waitingPatients = patients.filter(p => p.status === 'waiting').slice(0, maxItems);
  
  const priorityIcons = {
    urgent: <AlertCircle className="w-4 h-4 text-destructive" />,
    vip: <Crown className="w-4 h-4 text-warning" />,
    normal: null,
  };

  if (variant === "cards") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <Badge variant="secondary">{waitingPatients.length} WAITING</Badge>
        </div>
        <div className="grid gap-3">
          {waitingPatients.map((patient, index) => (
            <div
              key={patient.id}
              className="flex items-center justify-between p-4 bg-card rounded-xl shadow-md border border-border hover:shadow-lg transition-shadow slide-in-right"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="token-number text-lg font-bold text-primary">{patient.tokenNumber}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">{patient.name}</h4>
                    {patient.priority && priorityIcons[patient.priority]}
                  </div>
                  <p className="text-sm text-muted-foreground">{patient.age} yrs • {patient.visitType}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-foreground">{patient.appointmentTime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "detailed") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <Badge variant="secondary">{waitingPatients.length} WAITING</Badge>
        </div>
        <div className="bg-card rounded-xl overflow-hidden shadow-md">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Token</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Patient</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {waitingPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-4">
                    <span className="token-number font-bold text-primary">{patient.tokenNumber}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{patient.name}</span>
                      {patient.priority && priorityIcons[patient.priority]}
                    </div>
                    <span className="text-sm text-muted-foreground">{patient.age} yrs</span>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="outline">{patient.visitType}</Badge>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="flex items-center justify-end gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {patient.appointmentTime}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</h4>
          <span className="text-xs text-muted-foreground">{waitingPatients.length} waiting</span>
        </div>
        <div className="space-y-1">
          {waitingPatients.map((patient) => (
            <div
              key={patient.id}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="token-number text-sm font-bold text-primary">{patient.tokenNumber}</span>
                <span className="text-sm">{patient.name}</span>
                {patient.priority && priorityIcons[patient.priority]}
              </div>
              <span className="text-xs text-muted-foreground">{patient.appointmentTime}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
        <Badge variant="secondary" className="text-xs">{waitingPatients.length} WAITING</Badge>
      </div>
      <div className="space-y-2">
        {waitingPatients.map((patient, index) => (
          <div
            key={patient.id}
            className={`flex items-center justify-between py-3 px-4 rounded-xl transition-colors ${
              index === 0 ? 'bg-warning/10 border border-warning/20' : 'bg-card hover:bg-muted'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className={`token-number font-bold ${index === 0 ? 'text-token-active' : 'text-primary'}`}>
                {patient.tokenNumber}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{patient.name}</span>
                {patient.priority && priorityIcons[patient.priority]}
              </div>
            </div>
            <span className="text-sm text-muted-foreground">{patient.appointmentTime}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
