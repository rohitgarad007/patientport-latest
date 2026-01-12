import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/StatusBadge';
import { AppointmentJourney } from '@/components/AppointmentJourney';
import { AppointmentBookingModal } from '@/components/AppointmentBookingModal';
import { AppointmentReportModal } from '@/components/AppointmentReportModal';
import { RolesPermissionsManager } from '@/components/RolesPermissionsManager';
import BillingManager from '@/components/BillingManager';
import { aptMockAppointments as mockAppointments, aptMockDoctors as mockDoctors, aptMockPatients as mockPatients, mockClinicStats } from '@/data/mockData';
import { Appointment, Doctor, Patient, ClinicStats } from '@/types/appointment';
import { updateAppointmentStatus } from '@/services/SfstaffUseService';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  Calendar,
  Plus,
  Bell,
  Activity,
  Timer,
  UserCheck,
  FileText,
  Eye,
  Shield,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StaffaAppointmentList() {

  const [stats, setStats] = useState<ClinicStats>(mockClinicStats);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);

  // Simulate real-time updates
  useEffect(() => {
    // Normalize legacy statuses from mock data to new set
    setAppointments(prev => prev.map(apt => {
      const s = String(apt.status);
      const normalized = s === 'scheduled' ? 'booked'
        : s === 'checked-in' ? 'waiting'
        : s === 'in-progress' ? 'active'
        : s;
      return { ...apt, status: normalized as Appointment['status'] };
    }));

    const interval = setInterval(() => {
      setAppointments(prev => 
        prev.map(apt => {
          if (apt.status === 'waiting' && Math.random() > 0.9) {
            return { ...apt, estimatedWaitTime: Math.max(0, (apt.estimatedWaitTime || 0) - 1) };
          }
          return apt;
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredAppointments = selectedDoctor === 'all' 
    ? appointments 
    : appointments.filter(apt => apt.doctorId === selectedDoctor);

  const todayAppointments = filteredAppointments.filter(apt => {
    const today = new Date();
    const aptDate = new Date(apt.scheduledTime);
    return aptDate.toDateString() === today.toDateString();
  });

   const getPatientById = (id: string): Patient | undefined => 
    mockPatients.find(p => p.id === id);

  const getDoctorById = (id: string): Doctor | undefined => 
    mockDoctors.find(d => d.id === id);
    
  const handleStatusUpdate = (appointmentId: string, newStatus: Appointment['status']) => {
    setAppointments(prev =>
      prev.map(apt =>
        apt.id === appointmentId
          ? { ...apt, status: newStatus }
          : apt
      )
    );
  };

  const formatDate = (d: Date) => {
    try {
      return new Date(d).toISOString().slice(0, 10);
    } catch {
      const now = new Date();
      return now.toISOString().slice(0, 10);
    }
  };

  const handleMarkArrived = async (apt: any) => {
    try {
      const dateStr = formatDate(apt.scheduledTime);
      const res = await updateAppointmentStatus({
        appointmentId: String(apt.id),
        doctorId: String(apt.doctorId),
        date: dateStr,
        status: 'waiting',
        queuePosition: apt.queuePosition ?? null,
      });
      if (res?.success) {
        handleStatusUpdate(String(apt.id), 'waiting');
      }
    } catch (e) {
      console.error('Mark Arrived failed', e);
    }
  };

  const handleStartConsultation = async (apt: any) => {
    try {
      const dateStr = formatDate(apt.scheduledTime);
      const res = await updateAppointmentStatus({
        appointmentId: String(apt.id),
        doctorId: String(apt.doctorId),
        date: dateStr,
        status: 'active',
      });
      if (res?.success) {
        handleStatusUpdate(String(apt.id), 'active');
      }
    } catch (e) {
      console.error('Start Consultation failed', e);
    }
  };

  const handleComplete = async (apt: any) => {
    try {
      const dateStr = formatDate(apt.scheduledTime);
      const res = await updateAppointmentStatus({
        appointmentId: String(apt.id),
        doctorId: String(apt.doctorId),
        date: dateStr,
        status: 'completed',
      });
      if (res?.success) {
        handleStatusUpdate(String(apt.id), 'completed');
      }
    } catch (e) {
      console.error('Complete Consultation failed', e);
    }
  };

  const handleBookAppointment = (appointmentData: any) => {
    const newAppointment: Appointment = {
      id: appointmentData.id,
      patientId: appointmentData.patientId,
      doctorId: appointmentData.doctorId,
      scheduledTime: appointmentData.scheduledTime,
      estimatedDuration: appointmentData.estimatedDuration,
      status: 'scheduled',
      type: appointmentData.appointmentType,
      notes: appointmentData.notes
    };
    
    setAppointments(prev => [...prev, newAppointment]);
    setStats(prev => ({
      ...prev,
      totalAppointments: prev.totalAppointments + 1
    }));
  };


  return (
    
    <div className="space-y-6">
      

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-1">
        <div>
          <h1 className="text-2xl font-bold text-foreground pb-4">Appointment List</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-soft rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Today</p>
                  <p className="text-2xl font-bold">{stats.totalAppointments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-waiting-soft rounded-lg">
                  <Users className="h-5 w-5 text-waiting" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Patients Waiting</p>
                  <p className="text-2xl font-bold text-waiting">{stats.patientsWaiting}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-soft rounded-lg">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-primary">{stats.appointmentsInProgress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success-soft rounded-lg">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-success">{stats.completedToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Doctor Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Doctor Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-2">
              <Button
                variant={selectedDoctor === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedDoctor('all')}
                size="sm"
              >
                All Doctors
              </Button>
              {mockDoctors.map(doctor => (
                <Button
                  key={doctor.id}
                  variant={selectedDoctor === doctor.id ? 'default' : 'outline'}
                  onClick={() => setSelectedDoctor(doctor.id)}
                  size="sm"
                >
                  {doctor.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>


        {/* Appointments List */}
        <div className="pt-4">
          <Card >
            <CardHeader>
              <CardTitle>Today's Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayAppointments.map(appointment => {
                  const patient = getPatientById(appointment.patientId);
                  const doctor = getDoctorById(appointment.doctorId);
                  
                  return (
                    <div key={appointment.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{patient?.name}</h3>
                            <StatusBadge status={appointment.status} />
                            {appointment.queuePosition !== undefined && appointment.status === 'waiting' && (
                              <Badge variant="outline" className="text-waiting border-waiting/20">
                                Position: {appointment.queuePosition + 1}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p><strong>Doctor:</strong> {doctor?.name} ({doctor?.specialty})</p>
                            <p><strong>Type:</strong> {appointment.type}</p>
                            <p><strong>Scheduled:</strong> {appointment.scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            {appointment.estimatedWaitTime && (
                              <p className="flex items-center gap-1 text-waiting">
                                <Timer className="h-3 w-3" />
                                Est. wait: {appointment.estimatedWaitTime} min
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {appointment.status === 'completed' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewReport(appointment)}
                              className="gap-1"
                            >
                              <FileText className="h-3 w-3" />
                              View Report
                            </Button>
                          )}
                          {appointment.status === 'booked' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkArrived(appointment)}
                              className="gap-1"
                            >
                              <UserCheck className="h-3 w-3" />
                              Mark Arrived
                            </Button>
                          )}
                          {appointment.status === 'waiting' && (
                            <Button
                              size="sm"
                              onClick={() => handleStartConsultation(appointment)}
                            >
                              Start Consultation
                            </Button>
                          )}
                          {appointment.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleComplete(appointment)}
                              className="gap-1"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <AppointmentJourney currentStatus={appointment.status} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>



      </main>
    </div>
    
  );
}
