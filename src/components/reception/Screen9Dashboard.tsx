import { doctors, patients, hospitalStats, departments } from "@/data/hospitalData-2";
import { StatsCard } from "@/components/reception/token/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, CheckCircle, AlertTriangle, Activity, TrendingUp } from "lucide-react";
import { ReceptionDashboardData } from "@/services/ReceptionService";

interface ScreenProps {
  data?: ReceptionDashboardData | null;
  settings?: any;
}

export default function Screen9Dashboard({ data, settings }: ScreenProps) {
  // Use dynamic data if available
  const stats = data?.stats || hospitalStats;
  
  // Map dynamic doctors if available
  const activeDoctors = data?.doctors 
    ? data.doctors.map(d => ({
        id: d.id,
        name: d.name,
        specialty: d.specialization || "General",
        room: "Room 1", // Needs backend field
        image: d.profile_image || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop",
        status: d.status === "1" ? 'available' : 'busy',
        patients: 0,
        avgTime: 15
      }))
    : doctors.filter(d => d.status !== 'break');

  const currentPatients = data?.activeConsultations 
    ? data.activeConsultations.map(c => ({
        id: c.id,
        tokenNumber: c.token_no,
        name: c.patient_name,
        status: 'current',
        appointmentTime: new Date().toLocaleTimeString(),
        age: 30, // Dummy
        gender: 'M', // Dummy
        visitType: 'Consultation'
      }))
    : patients.filter(p => p.status === 'current');

  const waitingPatients = data?.waitingQueue
    ? data.waitingQueue.map(q => ({
        id: q.id,
        tokenNumber: q.token_no,
        name: q.patient_name,
        status: 'waiting',
        appointmentTime: q.start_time || new Date().toLocaleTimeString(),
        age: 30, // Dummy
        gender: 'M', // Dummy
        visitType: 'Consultation'
      }))
    : patients.filter(p => p.status === 'waiting');

  return (
    <div className="min-h-screen bg-muted p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hospital Dashboard</h1>
          <p className="text-muted-foreground">Real-time queue monitoring system</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="font-medium">System Online</span>
          </div>
          <div className="text-right">
            <p className="token-number text-2xl font-bold text-foreground">
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </p>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <StatsCard title="Total Patients" value={stats.totalPatients} icon={Users} variant="primary" />
        <StatsCard title="Average Wait" value={`${stats.avgWaitTime} min`} icon={Clock} variant="warning" />
        <StatsCard title="Completed" value={stats.completedToday} icon={CheckCircle} variant="success" trend="+12% from yesterday" />
        <StatsCard title="Emergency" value={stats.emergencyCases} icon={AlertTriangle} variant="default" />
        <StatsCard title="Doctors Online" value={stats.doctorsAvailable} icon={Activity} variant="accent" />
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Active Consultations */}
        <div className="col-span-8">
          <div className="bg-card rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Active Consultations</h2>
              <Badge variant="secondary">{currentPatients.length} in progress</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {activeDoctors.slice(0, 3).map((doctor, index) => {
                const patient = currentPatients[index] || patients[index + 2];
                return (
                  <div key={doctor.id} className="bg-muted rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground text-sm">{doctor.name}</h3>
                        <p className="text-xs text-muted-foreground">{doctor.room}</p>
                      </div>
                      <span className={`w-3 h-3 rounded-full ${doctor.status === 'available' ? 'bg-success' : 'bg-warning'}`} />
                    </div>
                    <div className="bg-card rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Now Serving</p>
                      <div className="token-number text-2xl font-bold text-token-active">{patient?.tokenNumber || '-'}</div>
                      <p className="text-sm text-foreground mt-1">{patient?.name || 'Available'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Department Overview */}
          <div className="bg-card rounded-2xl p-6 shadow-lg mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Department Overview</h2>
              <div className="flex items-center gap-2 text-success">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">All departments operational</span>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-4">
              {departments.map((dept) => (
                <div key={dept.name} className="bg-muted rounded-xl p-4 text-center">
                  <span className="text-3xl mb-2 block">{dept.icon}</span>
                  <h4 className="font-medium text-foreground text-sm mb-1">{dept.name}</h4>
                  <p className="text-2xl font-bold text-primary">{dept.activeTokens}</p>
                  <p className="text-xs text-muted-foreground">~{dept.waitTime}m wait</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Waiting Queue Sidebar */}
        <div className="col-span-4">
          <div className="bg-card rounded-2xl p-6 shadow-lg h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Waiting Queue</h2>
              <Badge className="bg-warning/10 text-warning">{waitingPatients.length} waiting</Badge>
            </div>
            <div className="space-y-3">
              {waitingPatients.slice(0, 8).map((patient, index) => (
                <div
                  key={patient.id}
                  className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                    index === 0 ? 'bg-token-active/10 border border-token-active/20' : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      index === 0 ? 'bg-token-active/20' : 'bg-card'
                    }`}>
                      <span className={`token-number font-bold text-sm ${index === 0 ? 'text-token-active' : 'text-primary'}`}>
                        {patient.tokenNumber}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">{patient.visitType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{patient.appointmentTime}</p>
                    {patient.priority && (
                      <Badge variant={patient.priority === 'urgent' ? 'destructive' : 'default'} className="text-xs mt-1">
                        {patient.priority}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
