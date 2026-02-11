import { doctors as defaultDoctors, patients as defaultPatients, Doctor, Patient } from "@/data/hospitalData-2";
import { DoctorCard } from "@/components/reception/token/DoctorCard";
import { TokenDisplay } from "@/components/reception/token/TokenDisplay";
import { QueueList } from "@/components/reception/token/QueueList";
import { AnnouncementTicker } from "@/components/reception/token/AnnouncementTicker";
import { TimeDisplay } from "@/components/reception/token/TimeDisplay";
import { ReceptionDashboardData } from "@/services/ReceptionService";

interface ScreenProps {
  data?: ReceptionDashboardData | null;
  settings?: any;
}

export default function Screen1ClassicBlue ({ data, settings }: ScreenProps) {
  
  // Helper to map backend doctor to frontend Doctor interface
  const getDoctor = (): Doctor => {
    if (data?.doctors && data.doctors.length > 0) {
      const d = data.doctors[0];
      return {
        id: d.id,
        name: d.name,
        specialty: d.specialization || "General",
        room: (d as any).room || "Room 1",
        image: d.profile_image || defaultDoctors[0].image,
        avgTime: parseInt((d as any).avgTime) || 15,
        status: d.status === "1" ? 'available' : 'busy'
      };
    }
    return defaultDoctors[0];
  };

  const getCurrentPatient = (): Patient => {
    if (data?.activeConsultations && data.activeConsultations.length > 0) {
      const p = data.activeConsultations[0];
      return {
        id: p.id,
        tokenNumber: p.token_no,
        name: p.patient_name,
        age: 0,
        gender: 'M', // Default
        visitType: 'consultation',
        appointmentTime: new Date().toLocaleTimeString(),
        status: 'current'
      };
    }
    // Fallback if no active consultation but data exists (empty state) or no data (dummy)
    if (data) {
       // Return a dummy placeholder or empty if we want to show nothing. 
       // For now, if real data is connected but empty, let's show "Waiting for Next"
       return {
         id: 'waiting',
         tokenNumber: '--',
         name: 'Waiting for Patient',
         age: 0,
         gender: 'M',
         visitType: 'consultation',
         appointmentTime: '',
         status: 'current'
       };
    }
    return defaultPatients.find(p => p.status === 'current') || defaultPatients[0];
  };

  const getWaitingPatients = (): Patient[] => {
    if (data?.waitingQueue) {
      return data.waitingQueue.map(p => ({
        id: p.id,
        tokenNumber: p.token_no,
        name: p.patient_name,
        age: 0,
        gender: 'M',
        visitType: 'consultation',
        appointmentTime: p.start_time || '',
        status: 'waiting'
      }));
    }
    return defaultPatients.filter(p => p.status === 'waiting');
  };

  const doctor = getDoctor();
  const currentPatient = getCurrentPatient();
  const waitingPatients = getWaitingPatients();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-[#EBF3F9] p-6 shadow-sm rounded-b-3xl mx-4 mt-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <DoctorCard doctor={doctor} variant="header" />
          <div className="text-slate-700">
            <TimeDisplay variant="compact" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-8">
        {/* Current Token */}
        <div className="mb-8">
          <TokenDisplay patient={currentPatient} variant="hero" />
        </div>

        {/* Waiting Queue */}
        <div className="bg-card rounded-2xl p-6 shadow-lg">
          <QueueList patients={waitingPatients} variant="default" maxItems={5} />
        </div>
      </main>

      {/* Announcement Ticker */}
      <AnnouncementTicker variant="default" />
    </div>
  );
};
