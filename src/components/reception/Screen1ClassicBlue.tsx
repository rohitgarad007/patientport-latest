import { useEffect, useState } from "react";
import { AlertCircle, Crown, Clock, WifiOff, Home } from "lucide-react";
import { doctors as defaultDoctors, patients as defaultPatients, Doctor, Patient } from "@/data/hospitalData-2";
import { DoctorCard } from "@/components/reception/token/DoctorCard";
import { TokenDisplay } from "@/components/reception/token/TokenDisplay";
import { QueueList } from "@/components/reception/token/QueueList";
import { AnnouncementTicker } from "@/components/reception/token/AnnouncementTicker";
import { TimeDisplay } from "@/components/reception/token/TimeDisplay";
import { ReceptionDashboardData } from "@/services/ReceptionService";
import { configService } from "@/services/configService";
import maleImg from "@/assets/images/male.png";
import femaleImg from "@/assets/images/female.png";

interface ScreenProps {
  data?: ReceptionDashboardData | null;
  settings?: any;
}

export default function Screen1ClassicBlue ({ data, settings }: ScreenProps) {
  
  const [apiBase, setApiBase] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const url = await configService.getApiUrl();
        if (mounted) {
          const base = url.endsWith("/") ? url : `${url}/`;
          setApiBase(base);
        }
      } catch {
        // ignore, fallback will use relative which may fail until reload
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Helper to map backend doctor to frontend Doctor interface
  const getDoctor = (): Doctor => {
    if (data?.doctors && data.doctors.length > 0) {
      const d = data.doctors[0];
      const raw = d.profile_image || "";
      let resolvedImage = raw;
      if (!raw) {
        resolvedImage = (d.gender && d.gender.toString().toUpperCase() === "F") ? femaleImg : maleImg;
      } else if (!(raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:"))) {
        const prefix = apiBase || "";
        resolvedImage = prefix + (raw.startsWith("/") ? raw.slice(1) : raw);
      }
      return {
        id: d.id,
        name: d.name,
        specialty: d.specialization || "General",
        room: d.room_number || "Room 1",
        image: resolvedImage || defaultDoctors[0].image,
        avgTime: d.avg_consultation_time ? parseInt(d.avg_consultation_time) : 15,
        status: Number(d.is_online) === 1 ? 'available' : 'offline',
        is_online: d.is_online,
        back_online_time: d.back_online_time,
        away_message: d.away_message
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
      return data.waitingQueue.map(p => {
        // Format time to "09:30 am"
        let timeStr = p.created_at || p.start_time || '';
        if (timeStr) {
           try {
             const date = new Date(timeStr.includes(' ') || timeStr.includes('T') ? timeStr : `2000-01-01 ${timeStr}`);
             if (!isNaN(date.getTime())) {
               timeStr = date.toLocaleTimeString('en-US', { 
                 hour: '2-digit', 
                 minute: '2-digit', 
                 hour12: true 
               }).toLowerCase();
             }
           } catch (e) {
             // fallback to original string
           }
        }

        return {
          id: p.id,
          tokenNumber: p.token_no,
          name: p.patient_name,
          age: 0,
          gender: 'M',
          visitType: 'consultation',
          appointmentTime: timeStr,
          status: 'waiting'
        };
      });
    }
    return defaultPatients.filter(p => p.status === 'waiting');
  };

  const doctor = getDoctor();
  const currentPatient = getCurrentPatient();
  const waitingPatients = getWaitingPatients();

  const isQueueEmpty = waitingPatients.length === 0;
  const isCurrentPatientEmpty = !currentPatient || currentPatient.tokenNumber === '--' || currentPatient.status === 'waiting' || currentPatient.id === 'waiting';
  const showOfflineMessage = doctor.status === 'offline' && isQueueEmpty && isCurrentPatientEmpty;

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-[#EBF3F9] p-3 shadow-sm rounded-b-2xl mx-4 mt-2 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/reception-screen-live" className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors">
              <Home className="w-5 h-5 text-slate-600" />
            </a>
            <DoctorCard doctor={doctor} variant="header" />
          </div>
          <div className="text-slate-700">
            <TimeDisplay variant="compact" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 max-w-7xl mx-auto w-full overflow-hidden flex ${showOfflineMessage ? 'p-4 items-center justify-center' : 'p-0 gap-4'}`}>
        {showOfflineMessage ? (
          <div className="relative flex flex-col items-center justify-center text-center bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-6 max-w-sm w-full animate-in fade-in zoom-in duration-300">
            {/* Status Indicator Pulse */}
            <span className="absolute top-4 right-4 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-500"></span>
            </span>
            
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
              <WifiOff className="w-8 h-8 text-slate-500" />
            </div>
            
            <h2 className="text-xl font-bold text-slate-800 mb-2">Doctor Offline</h2>
            
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Dr. {doctor.name.split(' ').pop()} is currently unavailable.
            </p>

            {doctor.back_online_time ? (
              <div className="w-full bg-orange-50/80 border border-orange-100 rounded-xl p-3 flex items-center justify-center gap-3">
                <div className="bg-white p-1.5 rounded-lg shadow-sm">
                  <Clock className="w-4 h-4 text-orange-500" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Back Online</p>
                  <p className="text-sm font-bold text-orange-700">{doctor.back_online_time}</p>
                </div>
              </div>
            ) : (
              <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3">
                <p className="text-xs text-slate-400 font-medium">Please wait for updates</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Current Token */}
            <div className="w-1/4 h-full flex flex-col justify-center">
              <TokenDisplay patient={currentPatient} doctor={doctor} variant="hero" />
            </div>

            {/* Waiting Queue */}
            <div className="flex-1 bg-card rounded-2xl p-4 shadow-lg h-full overflow-y-auto">
              <QueueList patients={waitingPatients} doctor={doctor} variant="default" maxItems={5} />
            </div>
          </>
        )}
      </main>

      {/* Announcement Ticker */}
      <AnnouncementTicker variant="default" doctorId={doctor.id} />
    </div>
  );
};
