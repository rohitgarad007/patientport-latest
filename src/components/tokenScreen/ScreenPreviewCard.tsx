import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "./StatusBadge";
import { MapPin, Clock } from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  department: string;
  specialty: string;
  room: string;
  avgTime: string;
  avatar: string;
  status: string;
}

interface Patient {
  id: string;
  token: string;
  name: string;
  age: number;
  gender: string;
  visitType: string;
  time: string;
  status: string;
}

interface ScreenPreviewCardProps {
  doctor: Doctor;
  currentPatient: Patient | null;
  queue: Patient[];
  showQueue?: boolean;
}

export function ScreenPreviewCard({ 
  doctor, 
  currentPatient, 
  queue, 
  showQueue = true 
}: ScreenPreviewCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-card hover:shadow-elevated transition-shadow">
      {/* Doctor Info & Current Token */}
      <div className="p-6 flex flex-col sm:flex-row gap-6">
        {/* Doctor Section */}
        <div className="flex items-start gap-4 flex-1">
          <div className="relative">
            <Avatar className="w-16 h-16 border-2 border-border">
              <AvatarImage src={doctor.avatar} alt={doctor.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {doctor.name.split(" ").slice(0, 2).map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            {doctor.status === "online" && (
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-success rounded-full border-2 border-card" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground">{doctor.name}</h3>
            <p className="text-muted-foreground text-sm">{doctor.department}</p>
            <p className="text-accent font-medium text-sm">{doctor.specialty}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {doctor.room}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {doctor.avgTime}
              </span>
            </div>
          </div>
        </div>

        {/* Current Token Section */}
        {currentPatient && (
          <div className="flex flex-col items-center justify-center text-center px-6 py-4 bg-muted/30 rounded-lg min-w-[160px]">
            <span className="text-4xl font-bold text-token tracking-wider font-mono">
              {currentPatient.token}
            </span>
            <p className="font-semibold text-foreground mt-2">{currentPatient.name}</p>
            <p className="text-sm text-muted-foreground">
              {currentPatient.age} yrs • {currentPatient.gender}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={currentPatient.visitType as any} />
              <span className="text-xs text-muted-foreground">{currentPatient.time}</span>
            </div>
          </div>
        )}
      </div>

      {/* Queue Section */}
      {showQueue && queue.length > 0 && (
        <div className="border-t border-border">
          <div className="px-6 py-3 flex items-center justify-between bg-muted/30">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Upcoming Queue
            </span>
            <span className="text-sm text-muted-foreground">
              {queue.length} patients
            </span>
          </div>
          <div className="divide-y divide-border">
            {queue.slice(0, 3).map((patient) => (
              <div key={patient.id} className="px-6 py-3 flex items-center gap-4">
                <span className="text-sm font-mono font-semibold text-foreground bg-muted px-2 py-1 rounded">
                  {patient.token}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{patient.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {patient.age}y • {patient.visitType}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">{patient.time}</span>
                <StatusBadge status={patient.status as any} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
