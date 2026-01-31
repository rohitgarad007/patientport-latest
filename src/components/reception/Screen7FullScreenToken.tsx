import { patients, doctors } from "@/data/hospitalData-2";
import { Badge } from "@/components/ui/badge";
import { Bell, Volume2 } from "lucide-react";

export default function  Screen7FullScreenToken ()  {
  const currentPatient = patients[2];
  const nextPatients = patients.filter(p => p.status === 'waiting').slice(0, 3);
  const doctor = doctors[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex flex-col text-white">
      {/* Slim Header */}
      <header className="px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-inner">
            <span className="text-3xl">🏥</span>
          </div>
          <div>
            <h1 className="font-bold text-2xl tracking-tight">{doctor.specialty}</h1>
            <p className="text-blue-100 font-medium text-lg opacity-90">{doctor.room} • {doctor.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 bg-white/10 px-5 py-2.5 rounded-full border border-white/10 backdrop-blur-sm">
            <Bell className="w-5 h-5" />
            <span className="font-medium">Audio Enabled</span>
          </div>
          <div className="text-right">
            <p className="token-number text-3xl font-bold tracking-widest">
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </p>
          </div>
        </div>
      </header>

      {/* Main Token Display */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="text-center relative z-10 scale-110 transform transition-transform duration-700">
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="w-3 h-3 rounded-full bg-white animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            <p className="text-xl font-bold text-blue-100 uppercase tracking-[0.5em] shadow-sm">Now Serving</p>
            <div className="w-3 h-3 rounded-full bg-white animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
          </div>
          
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-white/10 blur-[60px] rounded-full scale-90" />
            <div className="relative token-number text-[6rem] font-bold text-white leading-none tracking-tighter drop-shadow-2xl">
              {currentPatient.tokenNumber}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-6xl font-bold text-white tracking-tight drop-shadow-md">{currentPatient.name}</h2>
            <div className="flex items-center justify-center gap-4 text-blue-100 mt-4">
              <span className="text-2xl font-medium">{currentPatient.age} years old</span>
              <span className="opacity-50">•</span>
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 text-lg py-1.5 px-6 rounded-full transition-colors backdrop-blur-md">
                {currentPatient.visitType.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      </main>

      {/* Next Up Bar */}
      <footer className="bg-white/10 backdrop-blur-md border-t border-white/10 px-10 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Volume2 className="w-6 h-6 text-blue-100 animate-pulse" />
            <span className="text-blue-100 font-bold uppercase tracking-widest text-sm">Coming Up Next</span>
          </div>
          <div className="flex items-center gap-12">
            {nextPatients.map((patient, index) => (
              <div key={patient.id} className="flex items-center gap-8 group">
                <div className={`text-center transition-all duration-300 ${index === 0 ? 'opacity-100 scale-110' : 'opacity-60'}`}>
                  <div className="token-number text-2xl font-bold text-white mb-1 group-hover:text-blue-200 transition-colors">{patient.tokenNumber}</div>
                  <p className="text-base text-blue-100 font-medium">{patient.name}</p>
                </div>
                {index < nextPatients.length - 1 && (
                  <div className="w-px h-12 bg-white/20" />
                )}
              </div>
            ))}
          </div>
          <div className="text-right text-blue-100">
            <p className="text-sm font-medium opacity-80">Estimated wait: ~{nextPatients.length * 12} min</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
