import { doctors, patients } from "@/data/hospitalData-2";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Clock, Users, ChevronRight, Wifi, Volume2 } from "lucide-react";
import { ReceptionDashboardData } from "@/services/ReceptionService";

interface ScreenProps {
  data?: ReceptionDashboardData | null;
  settings?: any;
}

export default function Screen10GradientModern({ data, settings }: ScreenProps) {
  // Helper to get current patient from data
  const getCurrentPatient = () => {
    if (data?.activeConsultations && data.activeConsultations.length > 0) {
      const p = data.activeConsultations[0];
      return {
        id: p.id,
        tokenNumber: p.token_no,
        name: p.patient_name,
        age: 0,
        gender: 'M',
        visitType: 'Consultation',
        appointmentTime: new Date().toLocaleTimeString(),
        status: 'current'
      };
    }
    // Fallback
    return patients[2];
  };

  // Helper to get waiting patients
  const getWaitingPatients = () => {
    if (data?.waitingQueue && data.waitingQueue.length > 0) {
      return data.waitingQueue.map(p => ({
        id: p.id,
        tokenNumber: p.token_no,
        name: p.patient_name,
        age: 0,
        gender: 'M',
        visitType: 'Consultation',
        appointmentTime: p.created_at || new Date().toLocaleTimeString(),
        status: 'waiting'
      }));
    }
    // Fallback
    return patients.filter(p => p.status === 'waiting').slice(0, 5);
  };

  // Helper to get doctor info
  const getDoctor = () => {
    if (data?.activeConsultations && data.activeConsultations.length > 0) {
      const d = data.activeConsultations[0];
      return {
        name: d.doctor_name,
        specialty: d.department_name,
        image: d.doc_img || doctors[0].image,
        room: "101",
        avgTime: 15
      };
    }
    return doctors[0];
  };

  const doctor = getDoctor();
  const currentPatient = getCurrentPatient();
  const waitingPatients = getWaitingPatients();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-accent to-primary relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-foreground/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen p-8 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center border border-primary-foreground/20">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="text-primary-foreground">
              <h1 className="text-xl font-bold">HealthCare Plus</h1>
              <p className="text-primary-foreground/60 text-sm">{doctor.specialty} Department</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-primary-foreground">
            <div className="flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm px-4 py-2 rounded-full border border-primary-foreground/20">
              <Wifi className="w-4 h-4" />
              <span className="text-sm">Free WiFi</span>
            </div>
            <div className="flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm px-4 py-2 rounded-full border border-primary-foreground/20">
              <Volume2 className="w-4 h-4" />
              <span className="text-sm">Audio On</span>
            </div>
            <div className="text-right">
              <p className="token-number text-2xl font-bold">
                {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </p>
              <p className="text-primary-foreground/60 text-sm">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-2 gap-8">
          {/* Left - Current Token */}
          <div className="flex flex-col items-center justify-center">
            <div className="bg-primary-foreground/10 backdrop-blur-xl rounded-[3rem] p-12 border border-primary-foreground/20 shadow-2xl">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <p className="text-sm font-semibold text-primary-foreground/80 uppercase tracking-[0.3em]">Now Serving</p>
                </div>
                
                <div className="relative my-8">
                  <div className="absolute inset-0 bg-primary-foreground/20 blur-3xl rounded-full scale-75" />
                  <div className="relative token-number text-[4rem] font-bold text-primary-foreground leading-none">
                    {currentPatient.tokenNumber}
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-primary-foreground mb-2">{currentPatient.name}</h2>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-primary-foreground/70">{currentPatient.age ? `${currentPatient.age} years` : ''}</span>
                  <span className="text-primary-foreground/40">•</span>
                  <Badge className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
                    {currentPatient.visitType.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Doctor Info */}
            <div className="mt-8 flex items-center gap-4 bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-4 border border-primary-foreground/20">
              <img
                src={doctor.image}
                alt={doctor.name}
                className="w-14 h-14 rounded-xl object-cover ring-2 ring-primary-foreground/30"
              />
              <div className="text-primary-foreground">
                <h3 className="font-semibold">{doctor.name}</h3>
                <p className="text-primary-foreground/60 text-sm">{doctor.room} • ~{doctor.avgTime}min</p>
              </div>
            </div>
          </div>

          {/* Right - Queue */}
          <div className="flex flex-col">
            <div className="bg-primary-foreground/10 backdrop-blur-xl rounded-3xl p-8 border border-primary-foreground/20 flex-1">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-primary-foreground">Waiting Queue</h3>
                <div className="flex items-center gap-2 text-primary-foreground/70">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{waitingPatients.length} waiting</span>
                </div>
              </div>

              <div className="space-y-4">
                {waitingPatients.map((patient, index) => (
                  <div
                    key={patient.id}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                      index === 0 
                        ? 'bg-primary-foreground/20 border border-primary-foreground/30' 
                        : 'bg-primary-foreground/5 border border-primary-foreground/10'
                    }`}
                    style={{ opacity: 1 - index * 0.1 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        index === 0 ? 'bg-primary-foreground/20' : 'bg-primary-foreground/10'
                      }`}>
                        <span className="token-number text-xl font-bold text-primary-foreground">{patient.tokenNumber}</span>
                      </div>
                      <div className="text-primary-foreground">
                        <p className="font-semibold">{patient.name}</p>
                        <p className="text-sm text-primary-foreground/60">{patient.visitType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right text-primary-foreground/70">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span className="text-sm">{patient.appointmentTime}</span>
                        </div>
                      </div>
                      {index === 0 && (
                        <ChevronRight className="w-5 h-5 text-primary-foreground/50" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-primary-foreground/10 flex items-center justify-between text-primary-foreground/60">
                <span className="text-sm">Average wait time</span>
                <span className="font-semibold text-primary-foreground">~12 minutes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 flex items-center justify-between text-primary-foreground/60 text-sm">
          <p>Please wait for your token to be announced</p>
          <div className="flex items-center gap-6">
            <span>OPD: 9 AM - 8 PM</span>
            <span>Emergency: 24/7</span>
            <Badge variant="outline" className="border-destructive/50 text-destructive bg-destructive/10">
              Emergency: 911
            </Badge>
          </div>
        </footer>
      </div>
    </div>
  );
};
