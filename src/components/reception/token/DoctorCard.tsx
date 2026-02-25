import { Clock } from "lucide-react";
import { Doctor } from "@/data/hospitalData-2";
import { Badge } from "@/components/ui/badge";

interface DoctorCardProps {
  doctor: Doctor;
  variant?: "header" | "sidebar" | "compact" | "detailed";
}

export const DoctorCard = ({ doctor, variant = "header" }: DoctorCardProps) => {
  const statusColors = {
    available: "bg-success",
    busy: "bg-warning",
    break: "bg-muted-foreground",
  };

  if (variant === "header") {
    return (
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={doctor.image}
            alt={doctor.name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
          />
          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${statusColors[doctor.status]}`} />
        </div>
        <div className="text-slate-800">
          <h2 className="text-lg font-bold leading-tight">{doctor.name}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-slate-600 font-medium text-sm">{doctor.specialty}</span>
            <Badge variant="secondary" className="bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 px-2 py-0 h-5 text-[10px]">
              {doctor.room}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              ~{doctor.avgTime} min/patient
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "sidebar") {
    return (
      <div className="bg-card rounded-xl p-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={doctor.image}
              alt={doctor.name}
              className="w-14 h-14 rounded-lg object-cover"
            />
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${statusColors[doctor.status]}`} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{doctor.name}</h3>
            <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
            <p className="text-xs text-primary">{doctor.room}</p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={doctor.image}
            alt={doctor.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background ${statusColors[doctor.status]}`} />
        </div>
        <div>
          <h4 className="font-medium text-sm">{doctor.name}</h4>
          <p className="text-xs text-muted-foreground">{doctor.specialty}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="relative">
          <img
            src={doctor.image}
            alt={doctor.name}
            className="w-20 h-20 rounded-xl object-cover ring-4 ring-primary/10"
          />
          <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-card ${statusColors[doctor.status]}`} />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground">{doctor.name}</h2>
          <p className="text-lg text-muted-foreground">{doctor.specialty}</p>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="outline" className="bg-primary/5">
              {doctor.room}
            </Badge>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              ~{doctor.avgTime} min/patient
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
