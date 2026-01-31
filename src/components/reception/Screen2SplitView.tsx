import { doctors, patients, hospitalStats } from "@/data/hospitalData-2";
import { DoctorCard } from "@/components/reception/token/DoctorCard";
import { TokenDisplay } from "@/components/reception/token/TokenDisplay";
import { QueueList } from "@/components/reception/token/QueueList";
import { TimeDisplay } from "@/components/reception/token/TimeDisplay";
import { Users, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Screen2SplitView () {
  const doctor = doctors[1];
  const currentPatient = patients.find(p => p.tokenNumber === 'B-001')!;
  const waitingPatients = patients.filter(p => p.tokenNumber.startsWith('B') && p.status === 'waiting');

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
            Cardiology Department
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
                <div className="w-4 h-4 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)] animate-pulse" />
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
            <p className="text-blue-100 text-lg">{currentPatient.age} yrs • {currentPatient.visitType}</p>
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
              <span>~{hospitalStats.avgWaitTime} min</span>
            </div>
          </div>
        </div>
        
        <div className="text-right mb-6">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{waitingPatients.length} WAITING</span>
        </div>

        <div className="flex-1 overflow-hidden pr-2 -mr-2">
          <QueueList patients={patients} variant="cards" maxItems={6} title="" />
        </div>

        <div className="mt-8 grid grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl text-center shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100">
            <p className="text-sm font-medium text-slate-500 mb-1">Completed</p>
            <p className="text-3xl font-bold text-emerald-500">{hospitalStats.completedToday}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl text-center shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100">
            <p className="text-sm font-medium text-slate-500 mb-1">In Queue</p>
            <p className="text-3xl font-bold text-blue-500">{waitingPatients.length}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl text-center shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100">
            <p className="text-sm font-medium text-slate-500 mb-1">Avg Wait</p>
            <p className="text-3xl font-bold text-amber-500">{hospitalStats.avgWaitTime}m</p>
          </div>
        </div>
      </div>
    </div>
  );
};
