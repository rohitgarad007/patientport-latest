import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Eye, FileEdit } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getMyTodaysAppointmentsGrouped } from "@/services/doctorService";
import { useNavigate } from "react-router-dom";

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
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-success" />
          Today's Attended Patients
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-3xl font-bold text-success">{attendedAppointments.length}</p>
          <p className="text-sm text-muted-foreground">patients attended today</p>
        </div>
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {attendedAppointments.length === 0 ? (
             <p className="text-muted-foreground text-center py-4">No patients attended yet.</p>
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
                    {appointment.status === 'draft' ? (
                        <FileEdit className="h-5 w-5 text-warning flex-shrink-0" />
                    ) : (
                        <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                    )}
                    
                    <div>
                      <p className="font-medium text-foreground">{appointment.patient.name}</p>
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
      </CardContent>
    </Card>
  );
}
