import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "./StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  Monitor, 
  MapPin, 
  RefreshCw, 
  Users, 
  Clock, 
  User, 
  Calendar,
  Stethoscope,
  Activity,
  Layers,
  Phone,
  FileText,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { PaIcons } from "@/components/icons/PaIcons";
import { cn } from "@/lib/utils";
import { fetchScreenAppointments, AppointmentPreview } from "@/services/HSTokenService";

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
  created_at?: string;
}

interface MultiDoctorScreen {
  id: string;
  name: string;
  location: string;
  doctors?: Doctor[];
  doctor?: Doctor;
  currentPatients?: { doctor: Doctor; patient: Patient | null }[];
  currentPatient?: Patient;
  queue?: Patient[];
  totalQueue?: number;
  status: string;
  resolution: string;
  lastUpdated: string;
  layout: string;
  screenType?: "single" | "multi";
}

interface ScreenPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  screen: MultiDoctorScreen | null;
}

export function ScreenPreviewDialog({ open, onOpenChange, screen }: ScreenPreviewDialogProps) {
  const [appointmentsMap, setAppointmentsMap] = useState<Record<string, AppointmentPreview[]>>({});

  useEffect(() => {
    if (open && screen) {
      const doctors = screen.doctors || (screen.doctor ? [screen.doctor] : []);
      if (doctors.length > 0) {
        const doctorIds = doctors.map(d => d.id);
        fetchScreenAppointments(doctorIds)
          .then(data => setAppointmentsMap(data as any))
          .catch(err => console.error(err));
      }
    }
  }, [open, screen]);

  if (!screen) return null;

  // Determine if multi-doctor or single-doctor screen
  const doctors = screen.doctors || (screen.doctor ? [screen.doctor] : []);
  const isMultiDoctor = doctors.length > 1;

  // Helper to get data
  const getDoctorData = (doctorId: string) => {
    const apps = appointmentsMap[doctorId] || [];
    // Find active patient
    const current = apps.find(a => ['active', 'in-consultation', 'calling'].includes(a.status?.toLowerCase()));
    
    // Queue (waiting/booked)
    const queue = apps.filter(a => ['waiting', 'booked', 'scheduled'].includes(a.status?.toLowerCase()) && a.id !== current?.id);
    
    return {
       currentPatient: current ? {
        id: current.id,
        token: String(current.token),
        name: current.name,
        age: 0,
        gender: '',
        visitType: 'Appointment',
        time: current.time,
        status: current.status,
        created_at: current.created_at
      } as Patient : null,
      queue: queue.map(q => ({
        id: q.id,
        token: String(q.token),
        name: q.name,
        age: 0,
        gender: '',
        visitType: 'Appointment',
        time: q.time,
        status: q.status,
        created_at: q.created_at
      } as Patient))
    };
  };

  const doctorDataList = doctors.map(doc => {
     const { currentPatient, queue } = getDoctorData(doc.id);
     return { doctor: doc, patient: currentPatient, queue };
  });

  const totalQueue = doctorDataList.reduce((acc, curr) => acc + curr.queue.length, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-3">
            <Monitor className="w-5 h-5 text-primary" />
            Screen Preview: {screen.name}
            {isMultiDoctor && (
              <Badge variant="outline" className="ml-2">
                <Layers className="w-3 h-3 mr-1" />
                {doctors.length} Doctors
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-6 pb-4">
            {/* Screen Info Bar */}
            <div className="flex flex-wrap items-center gap-4 p-3 bg-muted rounded-lg text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{screen.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-muted-foreground" />
                <span>{screen.resolution}</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
                <span>Updated {screen.lastUpdated}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{totalQueue} in queue</span>
              </div>
              <StatusBadge status={screen.status as any} />
            </div>

            {/* Live Preview - Multi-Doctor Layout */}
            <div className="border-2 border-dashed border-primary/30 rounded-xl p-4 bg-gradient-to-br from-primary/5 to-muted/30">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  Live Display Preview
                </p>
                <Badge variant="secondary" className="capitalize">
                  {screen.layout} Layout
                </Badge>
              </div>
              
              {/* Screen Display Mockup */}
              <div className="bg-card rounded-lg border shadow-lg overflow-hidden">
                {/* Screen Header */}
                <div className="bg-primary text-primary-foreground px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span className="font-semibold text-sm">Token Announcement System</span>
                  </div>
                  <div className="text-xs opacity-80">
                    {new Date().toLocaleTimeString()} | {new Date().toLocaleDateString()}
                  </div>
                </div>

                {/* Multi-Doctor Grid */}
                <div className={cn(
                  "p-4 grid gap-4",
                  doctors.length === 1 && "grid-cols-1",
                  doctors.length === 2 && "grid-cols-2",
                  doctors.length === 3 && "grid-cols-3",
                  doctors.length >= 4 && "grid-cols-2 lg:grid-cols-4"
                )}>
                  {doctorDataList.map((item, idx) => (
                    <DoctorTokenPanel 
                      key={item.doctor.id} 
                      doctor={item.doctor} 
                      currentPatient={item.patient}
                      queue={item.queue}
                      isCompact={doctors.length > 2}
                    />
                  ))}
                </div>

                {/* Screen Footer */}
                <div className="bg-muted px-4 py-2 text-xs text-muted-foreground text-center border-t overflow-hidden">
                  <div className="animate-marquee whitespace-nowrap">
                    Please have your documents ready • Thank you for your patience • For emergencies, please contact the reception
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Details Section */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-primary" />
                Doctor Details & Appointments
              </h3>
              <div className={cn(
                "grid gap-4",
                doctors.length === 1 && "grid-cols-1",
                doctors.length >= 2 && "grid-cols-1 md:grid-cols-2"
              )}>
                {doctorDataList.map((item, idx) => (
                  <DoctorDetailCard 
                    key={item.doctor.id}
                    doctor={item.doctor}
                    currentPatient={item.patient}
                    queue={item.queue}
                  />
                ))}
              </div>
            </div>

            {/* Screen Configuration Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground text-xs">Layout Template</p>
                <p className="font-medium capitalize">{screen.layout}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground text-xs">Screen Type</p>
                <p className="font-medium capitalize">{isMultiDoctor ? "Multi-Doctor" : "Single Doctor"}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground text-xs">Total Doctors</p>
                <p className="font-medium">{doctors.length}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground text-xs">Active Tokens</p>
                <p className="font-medium">{doctorDataList.filter(cp => cp.patient).length}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Doctor Token Panel - for the live preview mockup
function DoctorTokenPanel({ 
  doctor, 
  currentPatient, 
  queue,
  isCompact 
}: { 
  doctor: Doctor; 
  currentPatient: Patient | null;
  queue: Patient[];
  isCompact: boolean;
}) {
  return (
    <div className="bg-muted/30 rounded-lg border overflow-hidden">
      {/* Doctor Header */}
      <div className="bg-primary/10 p-3 flex items-center gap-3">
        <Avatar className={cn("border-2 border-primary/20", isCompact ? "w-8 h-8" : "w-10 h-10")}>
          <AvatarImage src={doctor.avatar} alt={doctor.name} />
          <AvatarFallback className="bg-muted p-0.5">
            <img 
              src={(doctor.gender || "").toLowerCase() === 'female' ? PaIcons.femaleDcotorIcon : PaIcons.maleDcotorIcon} 
              alt="Doc"
              className="w-full h-full object-contain"
            />
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className={cn("font-semibold truncate", isCompact ? "text-xs" : "text-sm")}>
            {doctor.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">{doctor.room}</p>
        </div>
        <div className={cn(
          "w-2 h-2 rounded-full shrink-0",
          doctor.status === "online" ? "bg-success" : doctor.status === "busy" ? "bg-warning" : "bg-muted-foreground"
        )} />
      </div>

      {/* Current Token */}
      <div className="p-3 text-center">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Now Serving</p>
        {currentPatient ? (
          <>
            <div className={cn(
              "font-bold text-primary",
              isCompact ? "text-2xl" : "text-3xl"
            )}>
              {currentPatient.token}
            </div>
            <p className={cn("text-muted-foreground mt-1", isCompact ? "text-[10px]" : "text-xs")}>
              {currentPatient.name}
            </p>
          </>
        ) : (
          <div className="text-muted-foreground text-sm py-2">—</div>
        )}
      </div>

      {/* Mini Queue */}
      {!isCompact && queue.length > 0 && (
        <div className="border-t p-2">
          <p className="text-[10px] text-muted-foreground mb-1">Next in Queue</p>
          <div className="flex gap-1">
            {queue.slice(0, 3).map((p) => (
              <Badge key={p.id} variant="outline" className="text-[10px] px-1.5 font-mono">
                {p.token}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Doctor Detail Card - shows full appointment details
function DoctorDetailCard({ 
  doctor, 
  currentPatient,
  queue
}: { 
  doctor: Doctor; 
  currentPatient: Patient | null;
  queue: Patient[];
}) {
  const [showAll, setShowAll] = useState(false);
  const displayQueue = showAll ? queue : queue.slice(0, 3);

  return (
    <Card className="overflow-hidden">
      {/* Doctor Header */}
      <div className="p-4 bg-gradient-to-r from-primary/10 to-transparent flex items-center gap-4">
        <Avatar className="w-14 h-14 border-2 border-primary/20">
          <AvatarImage src={doctor.avatar} alt={doctor.name} />
          <AvatarFallback className="bg-muted p-0.5">
            <img 
              src={(doctor.gender || "").toLowerCase() === 'female' ? PaIcons.femaleDcotorIcon : PaIcons.maleDcotorIcon} 
              alt="Doc"
              className="w-full h-full object-contain"
            />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold">{doctor.name}</h4>
          <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {doctor.room}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {doctor.avgTime}
            </span>
          </div>
        </div>
        <div className={cn(
          "px-2 py-1 rounded text-xs font-medium",
          doctor.status === "online" ? "bg-success/10 text-success" : 
          doctor.status === "busy" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
        )}>
          {doctor.status === "online" ? "Available" : doctor.status === "busy" ? "With Patient" : "Offline"}
        </div>
      </div>

      <Separator />

      {/* Current Patient */}
      <div className="p-4">
        <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Currently Serving
        </h5>
        {currentPatient ? (
          <div className="flex items-center gap-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="bg-primary text-primary-foreground rounded-lg px-3 py-2 text-center">
              <p className="text-xs opacity-80">Token</p>
              <p className="text-xl font-bold">{currentPatient.token}</p>
            </div>
            <div className="flex-1">
              <p className="font-medium">{currentPatient.name}</p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                <span>{currentPatient.age} yrs, {currentPatient.gender}</span>
                <Badge variant="outline" className="text-xs capitalize">
                  {currentPatient.visitType}
                </Badge>
              </div>
            </div>
            <div className="text-right text-sm">
              <p className="text-muted-foreground">Check-in</p>
              <p className="font-medium">{currentPatient.time}</p>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground bg-muted/30 rounded-lg">
            No patient currently being served
          </div>
        )}
      </div>

      <Separator />

      {/* Queue */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Waiting Queue
          </h5>
          <Badge variant="secondary" className="text-xs">
            {queue.length} waiting
          </Badge>
        </div>
        <div className="space-y-2">
          {displayQueue.map((patient, idx) => (
            <div 
              key={patient.id} 
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                {idx + 1}
              </div>
              <Badge variant="outline" className="font-mono font-bold">
                #{patient.token}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate font-medium">{patient.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={patient.status?.toLowerCase() === 'waiting' ? 'secondary' : 'outline'} className="text-[10px] px-2 h-5 capitalize">
                  {patient.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {patient.created_at ? (() => {
                    const d = new Date(patient.created_at);
                    return isNaN(d.getTime()) ? patient.time : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                  })() : patient.time}
                </span>
              </div>
            </div>
          ))}
          {queue.length > 3 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-2 h-7 text-xs text-muted-foreground"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-3 h-3 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3 mr-1" />
                  Show {queue.length - 3} More
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
