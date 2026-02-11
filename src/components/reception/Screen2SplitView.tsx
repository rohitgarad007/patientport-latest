import { doctors as defaultDoctors, patients as defaultPatients, hospitalStats as defaultStats, Doctor, Patient } from "@/data/hospitalData-2";
import { QueueList } from "@/components/reception/token/QueueList";
import { TimeDisplay } from "@/components/reception/token/TimeDisplay";
import { Users, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ReceptionDashboardData } from "@/services/ReceptionService";

interface ScreenProps {
  data?: ReceptionDashboardData | null;
  settings?: any;
}

export default function Screen2SplitView ({ data, settings }: ScreenProps) {
  
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
    return defaultDoctors[1]; // Keep original default (doctors[1])
  };

  const getCurrentPatient = (): Patient => {
    if (data?.activeConsultations && data.activeConsultations.length > 0) {
      const p = data.activeConsultations[0];
      return {
        id: p.id,
        tokenNumber: p.token_no,
        name: p.patient_name,
        age: 0,
        gender: 'M',
        visitType: 'consultation',
        appointmentTime: new Date().toLocaleTimeString(),
        status: 'current'
      };
    }
    if (data) {
       return {
         id: 'waiting',
         tokenNumber: '--',
         name: 'Waiting...',
         age: 0,
         gender: 'M',
         visitType: 'consultation',
         appointmentTime: '',
         status: 'current'
       };
    }
    return defaultPatients.find(p => p.tokenNumber === 'B-001') || defaultPatients[0];
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
    return defaultPatients.filter(p => p.tokenNumber.startsWith('B') && p.status === 'waiting');
  };

  const getStats = () => {
    if (data?.stats) {
      return {
        avgWaitTime: data.stats.avgWaitTime || 15,
        completedToday: data.stats.completedToday || 0,
        doctorsAvailable: data.stats.doctorsAvailable || 0
      };
    }
    return defaultStats;
  };

  const doctor = getDoctor();
  const currentPatient = getCurrentPatient();
  const waitingPatients = getWaitingPatients();
  const stats = getStats();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Left Panel - Doctor & Token */}
      <div className="w-[45%] bg-[#2563EB] p-8 flex flex-col relative overflow-hidden">
        {/* Decorative Circle */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/10 to-transparent" />

        <div className="flex items-center justify-between mb-12 relative z-10">
          <img 
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=120&h=40&fit=crop" 
            alt="Hospital Logo" 
            className="h-12 rounded-lg bg-white/10 p-2"
          />
          <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 text-sm px-4 py-1.5 backdrop-blur-sm">
            {doctor.specialty || "General"} Department
          </Badge>
        </div>

        <div className="flex-1 flex flex-col justify-center relative z-10">
          <div className="mb-12 relative">
            <div className="flex items-center justify-between">
              <div className="relative">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-40 h-40 rounded-[2rem] object-cover ring-4 ring-white/20 shadow-2xl"
                />
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2">
                <div className={`w-4 h-4 rounded-full ${doctor.status === 'available' ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'bg-red-400'} animate-pulse`} />
              </div>
            </div>
            
            <div className="mt-8 space-y-2">
              <h2 className="text-4xl font-bold text-white tracking-tight">{doctor.name}</h2>
              <p className="text-xl text-blue-100 font-medium">{doctor.specialty}</p>
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 mt-2 text-base px-4 py-1">
                {doctor.room}
              </Badge>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 text-center border border-white/10 shadow-xl">
            <p className="text-xs font-bold text-blue-200 tracking-[0.2em] uppercase mb-6">Currently Serving</p>
            <div className="token-number text-8xl font-bold text-white mb-4 tracking-tight">{currentPatient.tokenNumber}</div>
            <h3 className="text-3xl font-bold text-white mb-2">{currentPatient.name}</h3>
            <p className="text-blue-100 text-lg">{currentPatient.age > 0 ? `${currentPatient.age} yrs • ` : ''}{currentPatient.visitType}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-blue-100 mt-8 relative z-10 font-medium">
          <div className="text-white">
            <TimeDisplay variant="compact" />
          </div>
          <span className="text-sm">~{doctor.avgTime} min per patient</span>
        </div>
      </div>

      {/* Right Panel - Queue */}
      <div className="w-[55%] p-10 flex flex-col bg-[#F8FAFC]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-bold text-slate-900">Waiting Queue</h2>
          <div className="flex items-center gap-6 text-slate-500">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="font-semibold">{waitingPatients.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>~{stats.avgWaitTime} min</span>
            </div>
          </div>
        </div>
        
        <div className="text-right mb-6">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{waitingPatients.length} WAITING</span>
        </div>

        <div className="flex-1 overflow-hidden pr-2 -mr-2">
          <QueueList patients={waitingPatients} variant="cards" maxItems={6} title="" />
        </div>

        <div className="mt-8 grid grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl text-center shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100">
            <p className="text-sm font-medium text-slate-500 mb-1">Completed</p>
            <p className="text-3xl font-bold text-emerald-500">{stats.completedToday}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl text-center shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100">
             <p className="text-sm font-medium text-slate-500 mb-1">Available Doctors</p>
             <p className="text-3xl font-bold text-blue-500">{stats.doctorsAvailable}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
