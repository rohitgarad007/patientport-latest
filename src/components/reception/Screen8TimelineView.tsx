import { patients, doctors } from "@/data/hospitalData-2";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, User, ArrowDown } from "lucide-react";
import { ReceptionDashboardData } from "@/services/ReceptionService";

interface ScreenProps {
  data?: ReceptionDashboardData | null;
  settings?: any;
}

export default function Screen8TimelineView({ data, settings }: ScreenProps) {
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
    return patients.find(p => p.status === 'current')!;
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
        status: 'waiting',
        priority: 'normal'
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
        image: d.doc_img || doctors[2].image,
        room: "101",
        avgTime: 15
      };
    }
    return doctors[2];
  };

  const doctor = getDoctor();
  const currentPatient = getCurrentPatient();
  const waitingPatients = getWaitingPatients();
  // Note: API doesn't return list of completed patients yet, so we use dummy data for now
  const completedPatients = patients.filter(p => p.status === 'completed');

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-6">
          <img
            src={doctor.image}
            alt={doctor.name}
            className="w-16 h-16 rounded-full object-cover ring-4 ring-slate-50"
          />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{doctor.name}</h1>
            <p className="text-slate-500 font-medium">{doctor.specialty} • {doctor.room}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="token-number text-3xl font-bold text-slate-900">
            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </p>
          <p className="text-slate-500 font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8 h-[calc(100vh-180px)]">
        {/* Timeline */}
        <div className="col-span-5 overflow-y-auto pr-4 custom-scrollbar">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Today's Timeline</h2>
          <div className="relative pl-4">
            {/* Timeline Line */}
            <div className="absolute left-10 top-2 bottom-0 w-0.5 bg-slate-200" />

            {/* Completed */}
            {completedPatients.map((patient) => (
              <div key={patient.id} className="relative flex items-start gap-6 mb-6 group">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center z-10 ring-8 ring-slate-50 group-hover:scale-110 transition-transform">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1 bg-white rounded-2xl p-5 shadow-sm border border-slate-100 group-hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <span className="token-number font-bold text-green-600 text-lg">{patient.tokenNumber}</span>
                    <span className="text-sm text-slate-400 font-medium">{patient.appointmentTime}</span>
                  </div>
                  <p className="font-bold text-slate-900 text-lg mb-2">{patient.name}</p>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-500 hover:bg-slate-200 border-0">Completed</Badge>
                </div>
              </div>
            ))}

            {/* Current */}
            <div className="relative flex items-start gap-6 mb-8 mt-8">
              <div className="w-12 h-12 rounded-full bg-[#FF8A00] flex items-center justify-center z-10 ring-8 ring-orange-50 shadow-lg shadow-orange-200">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 bg-orange-50 rounded-2xl p-6 border-2 border-[#FF8A00] relative overflow-hidden shadow-lg shadow-orange-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="token-number text-1xl font-bold text-[#FF8A00]">{currentPatient.tokenNumber}</span>
                  <Badge className="bg-[#FF8A00] hover:bg-[#E67C00] text-white border-0 px-3 py-1">NOW SERVING</Badge>
                </div>
                <p className="font-bold text-slate-900 text-xl mb-1">{currentPatient.name}</p>
                <p className="text-slate-500 font-medium">{currentPatient.age ? `${currentPatient.age} yrs • ` : ''}{currentPatient.visitType}</p>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center my-6 pl-12">
              <ArrowDown className="w-5 h-5 text-slate-300 animate-bounce" />
            </div>

            {/* Waiting */}
            {waitingPatients.slice(0, 5).map((patient, index) => (
              <div key={patient.id} className="relative flex items-start gap-6 mb-6 opacity-90 hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center z-10 ring-8 ring-slate-50">
                  <Clock className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex-1 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="token-number font-bold text-blue-600 text-lg">{patient.tokenNumber}</span>
                    <span className="text-sm text-slate-400 font-medium">{patient.appointmentTime}</span>
                  </div>
                  <p className="font-bold text-slate-900 text-lg mb-2">{patient.name}</p>
                  {/* @ts-ignore */}
                  {patient.priority === 'urgent' && (
                    <Badge variant="destructive" className="rounded-full">Urgent</Badge>
                  )}
                  {/* @ts-ignore */}
                  {patient.priority === 'vip' && (
                    <Badge className="bg-amber-400 hover:bg-amber-500 text-white border-0 rounded-full">VIP</Badge>
                  )}
                  {/* @ts-ignore */}
                  {!patient.priority && (
                    <Badge variant="outline" className="text-slate-400 border-slate-200">Regular</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Focus Card */}
        <div className="col-span-7 h-full">
          <div className="bg-[#FF8A00] rounded-[2.5rem] p-12 h-full flex flex-col items-center justify-center text-center shadow-2xl shadow-orange-200 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/5 rounded-full blur-3xl -ml-48 -mb-48 pointer-events-none"></div>
            
            <div className="relative z-10">
              <p className="text-lg font-bold text-white/80 uppercase tracking-[0.4em] mb-8">Currently Serving</p>
              
              <div className="token-number text-[4rem] font-bold text-white leading-none mb-8 tracking-tighter drop-shadow-sm">
                {currentPatient.tokenNumber}
              </div>
              
              <h2 className="text-5xl font-bold text-white mb-3 tracking-tight">{currentPatient.name}</h2>
              <p className="text-2xl text-white/90 font-medium mb-16">{currentPatient.age} years • {currentPatient.visitType}</p>
              
              <div className="grid grid-cols-3 gap-12 w-full max-w-2xl mx-auto border-t border-white/20 pt-12">
                <div className="text-center group">
                  <p className="text-3xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">{completedPatients.length}</p>
                  <p className="text-white/80 font-medium uppercase tracking-wider text-sm">Completed</p>
                </div>
                <div className="text-center group border-x border-white/20 px-8">
                  <p className="text-3xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">1</p>
                  <p className="text-white/80 font-medium uppercase tracking-wider text-sm">In Progress</p>
                </div>
                <div className="text-center group">
                  <p className="text-3xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">{waitingPatients.length}</p>
                  <p className="text-white/80 font-medium uppercase tracking-wider text-sm">Waiting</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
