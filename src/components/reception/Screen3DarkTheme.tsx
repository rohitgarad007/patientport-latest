import { doctors, patients, hospitalStats } from "@/data/hospitalData-2";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Activity, Zap } from "lucide-react";
import { ReceptionDashboardData } from "@/services/ReceptionService";

interface ScreenProps {
  data?: ReceptionDashboardData | null;
  settings?: any;
}

export default function Screen3DarkTheme({ data, settings }: ScreenProps) {
  // Helper to get current patient from data
  const getCurrentPatient = () => {
    if (data?.activeConsultations && data.activeConsultations.length > 0) {
      const p = data.activeConsultations[0];
      return {
        id: p.id,
        tokenNumber: p.token_no,
        name: p.patient_name,
        age: 0, // Not available in API yet
        gender: 'M', // Not available in API yet
        visitType: 'Consultation',
        appointmentTime: new Date().toLocaleTimeString(),
        status: 'current'
      };
    }
    // Fallback
    return patients.find(p => p.tokenNumber === 'C-001')!;
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
    return patients.filter(p => p.tokenNumber.startsWith('C') && p.status === 'waiting');
  };

  // Helper to get doctor info
  const getDoctor = () => {
    if (data?.activeConsultations && data.activeConsultations.length > 0) {
      const d = data.activeConsultations[0];
      return {
        name: d.doctor_name,
        specialty: d.department_name,
        image: d.doc_img || doctors[2].image,
        room: "101", // Not in API
        avgTime: 15
      };
    }
    return doctors[2];
  };

  // Helper to get stats
  const getStats = () => {
      if (data?.stats) {
          return {
              completedToday: data.stats.completed_patients,
              waiting: data.stats.waiting_patients
          };
      }
      return {
          completedToday: hospitalStats.completedToday,
          waiting: patients.filter(p => p.tokenNumber.startsWith('C') && p.status === 'waiting').length
      };
  };

  const doctor = getDoctor();
  const currentPatient = getCurrentPatient();
  const waitingPatients = getWaitingPatients();
  const stats = getStats();

  return (
    <div className="min-h-screen bg-[#111827] text-white p-8 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/50">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">City General Hospital</h1>
            <p className="text-gray-400 font-medium">{doctor.specialty} • Room {doctor.room}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold tracking-tight">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
          <p className="text-gray-400 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8 flex-1">
        {/* Left Column - Doctor Info & Stats (3 cols) */}
        <div className="col-span-3 flex flex-col gap-6">
          {/* Doctor Card */}
          <div className="bg-[#1F2937] rounded-3xl p-6 border border-gray-800 shadow-xl relative overflow-hidden group">
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="relative">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-24 h-24 rounded-2xl object-cover shadow-lg"
                />
              </div>
              <span className="w-4 h-4 rounded-full bg-green-500 border-2 border-[#1F2937] shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse mt-8" />
            </div>
            <div className="relative z-10">
              <h2 className="text-xl font-bold text-white mb-1">{doctor.name}</h2>
              <p className="text-gray-400 font-medium mb-4">{doctor.specialty}</p>
              <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                <Clock className="w-4 h-4" />
                <span>~{doctor.avgTime} min/patient</span>
              </div>
            </div>
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1F2937] rounded-2xl p-5 text-center border border-gray-800 shadow-lg">
              <p className="text-4xl font-bold text-green-500 mb-1">{stats.completedToday}</p>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Completed</p>
            </div>
            <div className="bg-[#1F2937] rounded-2xl p-5 text-center border border-gray-800 shadow-lg">
              <p className="text-4xl font-bold text-orange-500 mb-1">{stats.waiting}</p>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Waiting</p>
            </div>
          </div>
        </div>

        {/* Center Column - Current Token (5 cols) */}
        <div className="col-span-5 flex flex-col justify-start pt-4">
          <div className="bg-[#1F2937] rounded-[2.5rem] p-10 border border-gray-800 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
             {/* Glow Effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent opacity-50" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]" />
            
            <div className="relative z-10 text-center w-full">
              <p className="text-xs font-bold text-orange-500 uppercase tracking-[0.2em] mb-8">Now Serving</p>
              <div className="token-number text-[8rem] leading-none font-bold text-orange-500 mb-6 drop-shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                {currentPatient.tokenNumber}
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">{currentPatient.name}</h3>
              <p className="text-gray-400 text-lg font-medium">{currentPatient.age ? `${currentPatient.age} yrs • ` : ''}{currentPatient.visitType}</p>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center items-center gap-2 text-green-500 animate-pulse">
            <Zap className="w-5 h-5 fill-current" />
            <span className="font-bold tracking-wide text-sm uppercase">In Progress</span>
          </div>
        </div>

        {/* Right Column - Up Next (4 cols) */}
        <div className="col-span-4 space-y-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xl font-bold text-white">Up Next</h3>
            <Badge className="bg-gray-800 text-gray-300 border-0 px-3 py-1 font-medium">
              {waitingPatients.length} waiting
            </Badge>
          </div>
          
          <div className="space-y-4">
            {waitingPatients.slice(0, 4).map((patient, index) => (
              <div
                key={patient.id}
                className={`flex items-center justify-between p-5 rounded-2xl border transition-all group ${
                  index === 0 
                    ? 'bg-[#1F2937] border-orange-500/30 shadow-lg shadow-orange-900/10' 
                    : 'bg-[#1F2937] border-gray-800 opacity-60'
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                    index === 0 ? 'bg-orange-500/10 text-orange-500' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {patient.tokenNumber.split('-')[1]}
                  </div>
                  <div>
                    <h4 className={`font-bold text-lg ${index === 0 ? 'text-white' : 'text-gray-300'}`}>
                      {patient.name}
                    </h4>
                    <p className="text-sm text-gray-500 font-medium">{patient.appointmentTime}</p>
                  </div>
                </div>
                {index === 0 && (
                  <Badge variant="outline" className="text-xs border-gray-700 text-gray-400 font-medium">
                    new
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Ticker */}
      <div className="mt-8 bg-[#1F2937] rounded-full p-2 flex items-center gap-4 border border-gray-800 shadow-lg relative overflow-hidden">
        <Badge variant="destructive" className="shrink-0 bg-red-500 hover:bg-red-600 border-0 px-4 py-1 text-xs font-bold uppercase tracking-wider z-10 shadow-lg">
          Notice
        </Badge>
        <div className="flex-1 overflow-hidden relative h-6">
           <div className="absolute inset-0 flex items-center animate-marquee whitespace-nowrap text-sm font-medium text-gray-300">
             <span>Emergency services available 24/7 • Visitor hours: 10 AM - 8 PM • Free WiFi available • Cafeteria open until 9 PM • Please keep your mask on at all times •</span>
             <span className="ml-8">Emergency services available 24/7 • Visitor hours: 10 AM - 8 PM • Free WiFi available • Cafeteria open until 9 PM • Please keep your mask on at all times •</span>
           </div>
        </div>
      </div>
    </div>
  );
};
