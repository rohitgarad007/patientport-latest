import { doctors, patients } from "@/data/hospitalData-2";
import { Clock, ArrowRight } from "lucide-react";
import { ReceptionDashboardData } from "@/services/ReceptionService";

interface ScreenProps {
  data?: ReceptionDashboardData | null;
  settings?: any;
}

export default function Screen5MinimalWhite({ data, settings }: ScreenProps) {
  // Map dynamic data or fallback
  const doctor = data?.doctors && data.doctors.length > 0 
    ? {
        name: data.doctors[0].name,
        specialty: data.doctors[0].specialization || "General",
        image: data.doctors[0].profile_image || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop",
        room: "Room 5"
      }
    : doctors[4];

  const currentPatient = data?.activeConsultations && data.activeConsultations.length > 0
    ? {
        tokenNumber: data.activeConsultations[0].token_no,
        name: data.activeConsultations[0].patient_name,
        visitType: 'Consultation'
      }
    : patients[2];

  const waitingPatients = data?.waitingQueue
    ? data.waitingQueue.slice(0, 4).map(p => ({
        id: p.id,
        tokenNumber: p.token_no,
        name: p.patient_name,
        appointmentTime: p.start_time || '10:00 AM'
      }))
    : patients.filter(p => p.status === 'waiting').slice(0, 4);

  return (
    <div className="min-h-screen bg-background p-12">
      {/* Minimal Header */}
      <header className="flex items-center justify-between mb-16">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Wellness Clinic</h1>
          <p className="text-muted-foreground">{doctor.specialty} • {doctor.room}</p>
        </div>
        <div className="text-right">
          <p className="token-number text-4xl font-bold text-foreground">
            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </p>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto">
        {/* Doctor */}
        <div className="flex items-center gap-6 mb-16">
          <img
            src={doctor.image}
            alt={doctor.name}
            className="w-16 h-16 rounded-full object-cover grayscale"
          />
          <div>
            <h2 className="text-xl font-semibold text-foreground">{doctor.name}</h2>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>~{doctor.avgTime} min consultation</span>
            </div>
          </div>
        </div>

        {/* Current Token - Massive */}
        <div className="text-center mb-20">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-[0.3em] mb-4">Currently Serving</p>
          <div className="token-number text-[12rem] font-bold text-foreground leading-none tracking-tighter">
            {currentPatient.tokenNumber}
          </div>
          <div className="mt-8">
            <h3 className="text-3xl font-medium text-foreground">{currentPatient.name}</h3>
            <p className="text-xl text-muted-foreground">{currentPatient.age} years • {currentPatient.visitType}</p>
          </div>
        </div>

        {/* Next in Line */}
        <div className="border-t border-border pt-12">
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-[0.2em]">Next in Queue</p>
            <p className="text-sm text-muted-foreground">{waitingPatients.length} waiting</p>
          </div>
          <div className="flex items-center gap-8">
            {waitingPatients.map((patient, index) => (
              <div key={patient.id} className="flex items-center gap-4">
                <div className={`${index === 0 ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`token-number text-4xl font-bold ${index === 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {patient.tokenNumber}
                  </div>
                  <p className={`text-sm ${index === 0 ? 'text-foreground' : 'text-muted-foreground'}`}>{patient.name}</p>
                </div>
                {index < waitingPatients.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-muted-foreground/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 px-12 bg-muted/50 border-t border-border">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>Please wait for your token to be called</p>
          <p>Emergency: 911</p>
        </div>
      </footer>
    </div>
  );
};
