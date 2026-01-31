import { doctors, patients } from "@/data/hospitalData-2";
import { DoctorCard } from "@/components/reception/token/DoctorCard";
import { TokenDisplay } from "@/components/reception/token/TokenDisplay";
import { QueueList } from "@/components/reception/token/QueueList";
import { AnnouncementTicker } from "@/components/reception/token/AnnouncementTicker";
import { TimeDisplay } from "@/components/reception/token/TimeDisplay";

export default function Screen1ClassicBlue () {
  const doctor = doctors[0];
  const currentPatient = patients.find(p => p.status === 'current')!;
  const waitingPatients = patients.filter(p => p.status === 'waiting');

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
