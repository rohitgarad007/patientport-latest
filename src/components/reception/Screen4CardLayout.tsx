import { doctors, patients } from "@/data/hospitalData-2";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, User, ChevronRight } from "lucide-react";
import { ReceptionDashboardData } from "@/services/ReceptionService";

interface ScreenProps {
  data?: ReceptionDashboardData | null;
  settings?: any;
}

export default function Screen4CardLayout({ data, settings }: ScreenProps) {
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
    return patients.filter(p => p.status === 'waiting');
  };

  // Helper to get doctor info
  const getDoctor = () => {
    if (data?.activeConsultations && data.activeConsultations.length > 0) {
      const d = data.activeConsultations[0];
      return {
        name: d.doctor_name,
        specialty: d.department_name,
        image: d.doc_img || doctors[3].image,
        room: "102",
        avgTime: 12
      };
    }
    return doctors[3];
  };

  const doctor = getDoctor();
  const currentPatient = getCurrentPatient();
  const waitingPatients = getWaitingPatients();

  return (
    <div className="min-h-screen bg-slate-100 p-8 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
            <span className="text-2xl">🏥</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">MetroHealth Medical Center</h1>
            <p className="text-sm text-slate-500 font-medium">Excellence in Healthcare</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-slate-900">
            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </p>
          <p className="text-sm text-slate-500 font-medium">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6 mb-8 flex-1">
        {/* Doctor Card */}
        <div className="col-span-4">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm h-full border border-slate-100">
            <div className="flex items-start gap-4 mb-8">
              <img
                src={doctor.image}
                alt={doctor.name}
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-slate-50"
              />
              <div>
                <h2 className="text-xl font-bold text-slate-900">{doctor.name}</h2>
                <p className="text-slate-500 font-medium mb-2">{doctor.specialty}</p>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-sm text-emerald-600 font-bold">Available</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-500">
                <MapPin className="w-5 h-5 text-slate-400" />
                <span className="font-medium text-lg">{doctor.room}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                <Clock className="w-5 h-5 text-slate-400" />
                <span className="font-medium">~{doctor.avgTime} min per consultation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Token Card - Center */}
        <div className="col-span-4">
          <div className="bg-[#FF8A00] rounded-[2.5rem] p-8 shadow-xl shadow-orange-200/50 h-full flex flex-col items-center justify-center text-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full blur-3xl -ml-32 -mb-32"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6 mx-auto backdrop-blur-sm">
                <User className="w-8 h-8 text-white" />
              </div>
              <p className="text-xs font-bold text-white/80 uppercase tracking-[0.2em] mb-4">Now Serving</p>
              <div className="token-number text-7xl font-bold text-white mb-4 tracking-tight">{currentPatient.tokenNumber}</div>
              <h3 className="text-3xl font-bold text-white mb-2">{currentPatient.name}</h3>
              <p className="text-white/90 font-medium text-lg">{currentPatient.age ? `${currentPatient.age} yrs • ` : ''}{currentPatient.visitType}</p>
            </div>
          </div>
        </div>

        {/* Right Column - Stats */}
        <div className="col-span-4 flex flex-col gap-6">
          {/* Next Up Card */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex-1 flex flex-col justify-center relative group overflow-hidden">
            <div className="absolute right-0 top-0 h-full w-2 bg-blue-500"></div>
            <p className="text-slate-400 font-medium mb-2">Next Up</p>
            <div className="flex items-center justify-between">
              <p className="text-5xl font-bold text-blue-600">{waitingPatients[0]?.tokenNumber || '-'}</p>
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          </div>

          {/* Queue Stats Card */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex-1 flex flex-col justify-center">
            <div className="flex items-start justify-between mb-2">
              <p className="text-slate-400 font-medium">In Queue</p>
              <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">~15 min wait</Badge>
            </div>
            <p className="text-4xl font-bold text-slate-900">{waitingPatients.length} <span className="text-xl text-slate-400 font-medium">patients</span></p>
          </div>
        </div>
      </div>

      {/* Waiting Queue List */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          Waiting Queue
          <span className="w-full h-px bg-slate-200 ml-4"></span>
        </h3>
        <div className="relative w-full overflow-hidden">
          <style>{`
            @keyframes scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-scroll {
              animation: scroll 40s linear infinite;
            }
            .animate-scroll:hover {
              animation-play-state: paused;
            }
          `}</style>
          <div className="flex gap-5 animate-scroll w-max py-2 px-2">
            {[...waitingPatients, ...waitingPatients].map((patient, index) => {
              const isFirst = index % waitingPatients.length === 0;
              return (
                <div
                  key={`${patient.id}-${index}`}
                  className={`min-w-[220px] bg-white rounded-2xl p-5 shadow-sm transition-all hover:shadow-md ${
                    isFirst 
                      ? 'border-2 border-[#FF8A00] ring-4 ring-orange-50' 
                      : 'border border-slate-100'
                  }`}
                >
                  <div className={`token-number text-3xl font-bold mb-3 ${
                    isFirst ? 'text-[#FF8A00]' : 'text-blue-600'
                  }`}>
                    {patient.tokenNumber}
                  </div>
                  <p className="font-bold text-slate-900 text-lg mb-1 truncate">{patient.name}</p>
                  <p className="text-sm text-slate-500 font-medium mb-3">{patient.appointmentTime}</p>
                  
                  <div className="flex gap-2">
                    {patient.priority === 'urgent' && (
                      <Badge variant="destructive" className="rounded-full px-3">Urgent</Badge>
                    )}
                    {patient.priority === 'vip' && (
                      <Badge className="bg-amber-400 hover:bg-amber-500 text-white rounded-full px-3 border-0">VIP</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto pt-6 flex items-center justify-between text-sm text-slate-400 font-medium border-t border-slate-200">
        <p>OPD Hours: 9:00 AM - 8:00 PM</p>
        <p>Emergency: 911 | Helpline: 1-800-HEALTH</p>
      </footer>
    </div>
  );
};
