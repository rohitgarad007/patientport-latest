import { useEffect, useState } from "react";
import { StatsCard } from "@/components/reception/token/StatsCard";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity,
} from "lucide-react";
import {
  receptionService,
  ReceptionDashboardData,
} from "@/services/ReceptionService";

export default function ReceptionDashboard() {
  const [data, setData] = useState<ReceptionDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await receptionService.fetchDashboardStats();
        setData(result);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted p-6 flex items-center justify-center">
        <div className="text-lg font-medium text-muted-foreground animate-pulse">
          Loading dashboard data...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-muted p-6 flex items-center justify-center">
        <div className="text-lg font-medium text-destructive">
          {error || "No data available"}
        </div>
      </div>
    );
  }

  const { stats, activeConsultations, waitingQueue, doctors } = data;

  return (
    <div className="min-h-screen bg-muted p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Reception Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time queue monitoring system
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="font-medium">System Online</span>
          </div>

          <div className="text-right">
            <p className="token-number text-2xl font-bold text-foreground">
              {new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <StatsCard
          title="Total Patients"
          value={stats.totalPatients}
          icon={Users}
          variant="primary"
        />
        <StatsCard
          title="Average Wait"
          value={`${stats.avgWaitTime} min`}
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title="Completed"
          value={stats.completedToday}
          icon={CheckCircle}
          variant="success"
          trend="+12% from yesterday"
        />
        <StatsCard
          title="Emergency"
          value={stats.emergencyCases}
          icon={AlertTriangle}
          variant="default"
        />
        <StatsCard
          title="Doctors Online"
          value={stats.doctorsAvailable}
          icon={Activity}
          variant="accent"
        />
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Doctor Status */}
        <div className="col-span-8">
          <div className="bg-card rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                Doctor Status
              </h2>
              <div className="flex gap-2">
                <Badge variant="outline" className="border-success/50 text-success">
                  {doctors?.filter((d) => Number(d.is_online) === 1).length || 0} Online
                </Badge>
                <Badge variant="outline" className="border-muted-foreground text-muted-foreground">
                  {doctors?.filter((d) => Number(d.is_online) !== 1).length || 0} Offline
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {doctors && doctors.length > 0 ? (
                doctors.map((doctor) => (
                  <div key={doctor.id} className="bg-muted rounded-xl p-5 border border-border/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        {doctor.profile_image ? (
                          <img
                            src={doctor.profile_image}
                            alt={doctor.name}
                            className="w-12 h-12 rounded-xl object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://ui-avatars.com/api/?name=" +
                                encodeURIComponent(doctor.name);
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {doctor.name.charAt(0)}
                          </div>
                        )}
                        <span 
                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-background ${
                            Number(doctor.is_online) === 1 ? "bg-success" : "bg-muted-foreground"
                          }`} 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-foreground truncate">
                          {doctor.name}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {doctor.specialization || "General"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        Number(doctor.is_online) === 1 
                          ? "bg-success/10 text-success" 
                          : "bg-muted/50 text-muted-foreground"
                      }`}>
                        {Number(doctor.is_online) === 1 ? "Available" : "Offline"}
                      </span>
                      {Number(doctor.is_online) === 1 && (
                         <span className="text-xs text-muted-foreground">
                           Accepting Patients
                         </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center text-muted-foreground py-8">
                  No doctors found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Waiting Queue */}
        <div className="col-span-4">
          <div className="bg-card rounded-2xl p-6 shadow-lg h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                Waiting Queue
              </h2>
              <Badge className="bg-warning/10 text-warning">
                {waitingQueue.length} waiting
              </Badge>
            </div>

            <div className="space-y-3">
              {waitingQueue.length > 0 ? (
                waitingQueue.map((patient, index) => (
                  <div
                    key={patient.id}
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      index === 0
                        ? "bg-token-active/10 border border-token-active/20"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          index === 0 ? "bg-token-active/20" : "bg-card"
                        }`}
                      >
                        <span
                          className={`token-number font-bold text-sm ${
                            index === 0 ? "text-token-active" : "text-primary"
                          }`}
                        >
                          {patient.token_no}
                        </span>
                      </div>

                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {patient.patient_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {patient.source || "Walk-in"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {patient.start_time || "Waiting"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Queue is empty
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
