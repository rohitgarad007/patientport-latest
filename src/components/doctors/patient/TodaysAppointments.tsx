import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { getMyTodaysAppointmentsGrouped } from "@/services/doctorService";

type AptStatus = "active" | "waiting" | "arrived" | "booked" | "completed";

type Appointment = {
  id: string;
  tokenNumber: number;
  patient: { id: string; name: string; phone: string; age: number };
  doctor: { id: string };
  date: string;
  timeSlot: { id: string; startTime: string; endTime: string };
  status: AptStatus;
  queuePosition?: number | null;
  arrivalTime?: string | null;
  consultationStartTime?: string | null;
  completedTime?: string | null;
  statusTime?: string | null;
};

interface TodaysAppointmentsProps {
  onViewPatient: (patientId: string) => void;
}

export function TodaysAppointments({ onViewPatient }: TodaysAppointmentsProps) {
  const [grouped, setGrouped] = useState<{
    active: Appointment[];
    waiting: Appointment[];
    arrived: Appointment[];
    booked: Appointment[];
    completed: Appointment[];
  }>({ active: [], waiting: [], arrived: [], booked: [], completed: [] });
  const navigate = useNavigate();

  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  }, []);

  // Convert backend timestamp → HH:mm AM/PM
  const formatTo12hr = (time?: string | null) => {
    if (!time) return "";

    // Extract time part
    let hhmm = "";

    // If input is "HH:mm:ss" or "HH:mm"
    if (/^\d{2}:\d{2}/.test(time)) {
      hhmm = time.substring(0, 5);
    } else if (time.includes(" ")) {
      // format: YYYY-MM-DD HH:mm:ss
      hhmm = time.split(" ")[1]?.substring(0, 5);
    }

    if (!hhmm) return "";

    const [HH, MM] = hhmm.split(":");
    let h = Number(HH);
    const ampm = h >= 12 ? "PM" : "AM";

    h = h % 12 || 12; // convert 0 → 12

    return `${h}:${MM} ${ampm}`;
  };

  const deriveStatusTime = (apt: Appointment) => {
    let raw = "";

    if (apt.statusTime) raw = apt.statusTime;
    else {
      switch (apt.status) {
        case "booked":
          raw = apt.timeSlot.startTime;
          break;
        case "arrived":
          raw = apt.arrivalTime || "";
          break;
        case "waiting":
          raw = apt.arrivalTime || "";
          break;
        case "active":
          raw = apt.consultationStartTime || "";
          break;
        case "completed":
          raw = apt.completedTime || "";
          break;
      }
    }

    return formatTo12hr(raw);
  };

  // Load today's appointments
  useEffect(() => {
    (async () => {
      try {
        const data = await getMyTodaysAppointmentsGrouped(today);
        setGrouped(data);
      } catch (err) {
        console.error("Failed to load today's appointments", err);
      }
    })();
  }, [today]);

  // Ordered list for doctor workflow
  const ordered = useMemo(() => {
    return [
      ...grouped.active,
      ...grouped.waiting,
      ...grouped.arrived,
      ...grouped.booked,
    ];
  }, [grouped]);

  // Status colors
  const getStatusColor = (status: AptStatus) => {
    switch (status) {
      case "active":
        return "bg-status-active/10 text-status-active border-status-active/20";
      case "waiting":
        return "bg-status-waiting/10 text-status-waiting border-status-waiting/20";
      case "arrived":
        return "bg-status-arrived/10 text-status-arrived border-status-arrived/20";
      case "booked":
        return "bg-muted/30 text-muted-foreground border-border";
      case "completed":
        return "bg-success/10 text-success border-success/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <CardTitle className="text-base md:text-xl">Today's Appointments</CardTitle>
        <button
          type="button"
          onClick={() => navigate("/doctor-today-visit")}
          className="hidden text-xs font-semibold text-emerald-600 md:inline-flex"
        >
          View All
        </button>
        <button
          type="button"
          onClick={() => navigate("/doctor-today-visit")}
          className="md:hidden text-xs font-semibold text-emerald-600"
        >
          View All
        </button>
      </CardHeader>

      <CardContent className="px-4 pb-4 pt-0 md:px-6 md:pb-6">
        {/* Desktop layout */}
        <div className="hidden md:block">
          <div className="space-y-3">
            {ordered.map((appointment, index) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all hover:shadow-md",
                  appointment.status === "active"
                    ? "bg-status-active/5 border-status-active/20"
                    : "bg-card border-border"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-foreground">
                        {appointment.patient.name}
                      </h4>
                      <Badge className={getStatusColor(appointment.status)} variant="outline">
                        {appointment.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {formatTo12hr(appointment.timeSlot.startTime)} -{" "}
                          {formatTo12hr(appointment.timeSlot.endTime)}
                        </span>
                      </div>

                      <span>•</span>

                      <span>Token #{appointment.tokenNumber}</span>

                      {deriveStatusTime(appointment) && (
                        <>
                          <span>•</span>
                          <span>{deriveStatusTime(appointment)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Link to={`/doctor-view-patient/${appointment.patient.id}`}>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {grouped.completed.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Completed
              </h3>

              <div className="space-y-3">
                {grouped.completed.map((appointment, index) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl border-2 bg-success/5 border-success/20"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-foreground">
                            {appointment.patient.name}
                          </h4>
                          <Badge className={getStatusColor("completed")} variant="outline">
                            completed
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Token #{appointment.tokenNumber}</span>

                          <span>•</span>

                          <span>
                            {formatTo12hr(appointment.timeSlot.startTime)} -
                            {formatTo12hr(appointment.timeSlot.endTime)}
                          </span>

                          {deriveStatusTime(appointment) && (
                            <>
                              <span>•</span>
                              <span>{deriveStatusTime(appointment)}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Link to={`/doctor-view-patient/${appointment.patient.id}`}>
                        <Button size="sm" variant="outline" className="gap-2">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile layout */}
        <div className="md:hidden space-y-3">
          {ordered.map((appointment, index) => {
            const initial =
              appointment.patient.name && appointment.patient.name.length > 0
                ? appointment.patient.name.charAt(0).toUpperCase()
                : "P";

            return (
              <Link
                key={appointment.id}
                to={`/doctor-view-patient/${appointment.patient.id}`}
                className="block"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between rounded-2xl bg-emerald-50/40 px-3 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-[13px] font-semibold text-emerald-700">
                      {initial}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {appointment.patient.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {formatTo12hr(appointment.timeSlot.startTime)} · Token #
                        {appointment.tokenNumber}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full border-0",
                      appointment.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : appointment.status === "waiting" || appointment.status === "arrived"
                        ? "bg-amber-100 text-amber-700"
                        : appointment.status === "booked"
                        ? "bg-sky-100 text-sky-700"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {appointment.status.charAt(0).toUpperCase() +
                      appointment.status.slice(1)}
                  </Badge>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
