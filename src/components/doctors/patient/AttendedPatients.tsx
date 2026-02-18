import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Eye, FileEdit } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getMyTodaysAppointmentsGrouped } from "@/services/doctorService";
import { Link, useNavigate } from "react-router-dom";

export function AttendedPatients() {
  const [attendedAppointments, setAttendedAppointments] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadAttendedPatients = async () => {
      try {
        const data = await getMyTodaysAppointmentsGrouped();
        // Combine completed and draft
        // The service now returns draft as well
        const draft = (data as any).draft || [];
        const completed = data.completed || [];
        
        // Add a 'type' or 'displayStatus' property if needed, or just use status
        const combined = [
            ...draft.map((a: any) => ({ ...a, displayStatus: 'Draft' })), 
            ...completed.map((a: any) => ({ ...a, displayStatus: 'Completed' }))
        ];
        
        setAttendedAppointments(combined);
      } catch (err) {
        console.error("Failed to load attended patients", err);
      }
    };
    loadAttendedPatients();
  }, []);

  const handleViewDetails = (patientId: string) => {
    navigate(`/doctor-view-patient/${patientId}`);
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <CardTitle className="text-base md:text-xl flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-success" />
          Completed Today
        </CardTitle>
        <span className="text-xs font-semibold text-emerald-600">
          {attendedAppointments.length > 0
            ? `${attendedAppointments.length} Done`
            : "0 Done"}
        </span>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0 md:px-6 md:pb-6">
        {/* Desktop layout */}
        <div className="hidden md:block">
          <div className="mb-4">
            <p className="text-3xl font-bold text-success">{attendedAppointments.length}</p>
            <p className="text-sm text-muted-foreground">patients attended today</p>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {attendedAppointments.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No patients attended yet.
              </p>
            ) : (
              attendedAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-success/5 border border-success/20"
                >
                  <div className="flex items-center gap-3">
                    {appointment.status === "draft" ? (
                      <FileEdit className="h-5 w-5 text-warning flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                    )}

                    <div>
                      <p className="font-medium text-foreground">
                        {appointment.patient.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.timeSlot.startTime} - {appointment.displayStatus}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetails(appointment.patient.id)}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Mobile layout */}
        <div className="md:hidden space-y-2">
          {attendedAppointments.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No patients attended yet.
            </p>
          ) : (
            attendedAppointments.map((appointment, index) => {
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
                          {appointment.timeSlot.startTime} · Age {appointment.patient.age}
                        </p>
                      </div>
                    </div>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-400 bg-white">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    </div>
                  </motion.div>
                </Link>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
