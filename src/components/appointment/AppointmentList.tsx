import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle,
  Clock,
  User,
  Phone,
  ArrowUp,
  ArrowDown,
  Play,
  Settings,
} from 'lucide-react';
// Services
import { fetchDoctorList, fetchAppointmentsByDate, updateAppointmentStatus, updateQueuePositions } from '@/services/SfstaffUseService';
import { Appointment, Doctor } from '@/types/appointment';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format, parse } from 'date-fns';

export default function AppointmentList() {
  const formatDisplayDateTime = (raw?: string) => {
    if (!raw) return '';
    let dt: Date | null = null;
    // Try parsing common backend format first
    try {
      dt = parse(raw, 'yyyy-MM-dd HH:mm:ss', new Date());
      if (isNaN(dt.getTime())) dt = null;
    } catch (_) {
      dt = null;
    }
    // Fallback to native Date parsing
    if (!dt) {
      const tmp = new Date(raw);
      dt = isNaN(tmp.getTime()) ? null : tmp;
    }
    if (!dt) return raw;
    return format(dt, 'EEE, dd MMM yyyy  hh.mm a');
  };
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [priorityDialogOpen, setPriorityDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [insertAfter, setInsertAfter] = useState<number>(2);

  // Today in YYYY-MM-DD
  const today = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  // Load doctors on mount
  useEffect(() => {
    (async () => {
      const res = await fetchDoctorList('self');
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : [];
        const mapped: Doctor[] = list.map((d: any) => ({
          id: String(d.id ?? d.id ?? ''),
          name: String(d.name ?? d.doctor_name ?? 'Doctor'),
          specialty: String(d.specialty ?? d.specialization ?? ''),
          availableDays: [],
          schedules: [],
        }));
        setDoctors(mapped);
        if (mapped.length > 0) setSelectedDoctor(mapped[0]);
      } else {
        toast.error(res.message ?? 'Failed to load doctors');
      }
    })();
  }, []);

  // Load current day appointments when doctor changes
  useEffect(() => {
    (async () => {
      if (!selectedDoctor) return;
      const res = await fetchAppointmentsByDate(selectedDoctor.id, today);
      if (res.success) {
        const items = Array.isArray(res.data) ? res.data : [];
        const mapped: Appointment[] = items.map((r: any) => ({
          id: String(r.id ?? r.appointment_uid ?? ''),
          tokenNumber: Number(r.tokenNumber ?? r.token_no ?? 0),
          patient: {
            id: String(r?.patient?.id ?? ''),
            name: String(r?.patient?.name ?? ''),
            phone: String(r?.patient?.phone ?? ''),
            age: Number(r?.patient?.age ?? 0),
          },
          doctor: selectedDoctor,
          date: String(r.date ?? today),
          timeSlot: {
            id: String(r?.timeSlot?.id ?? ''),
            startTime: String(r?.timeSlot?.startTime ?? ''),
            endTime: String(r?.timeSlot?.endTime ?? ''),
            totalTokens: Number(r?.timeSlot?.totalTokens ?? 0),
            bookedTokens: Number(r?.timeSlot?.bookedTokens ?? 0),
          },
          status: (r.status as Appointment['status']) ?? 'booked',
          arrivalTime: r.arrivalTime,
          consultationStartTime: r.consultationStartTime,
          completedTime: r.completedTime,
          queuePosition: r.queuePosition,
        }));
        setAppointments(mapped);
      } else {
        toast.error(res.message ?? 'Failed to load appointments');
        setAppointments([]);
      }
    })();
  }, [selectedDoctor, today]);

  const todayAppointments = appointments.filter((apt) => 
    selectedDoctor ? apt.doctor.id === selectedDoctor.id && apt.date === today : false
  );

  const bookedList = todayAppointments.filter((apt) => apt.status === 'booked');
  const arrivedList = todayAppointments.filter((apt) => apt.status === 'arrived');
  const waitingQueue = todayAppointments
    .filter((apt) => apt.status === 'waiting')
    .sort((a, b) => (a.queuePosition ?? 0) - (b.queuePosition ?? 0));
  const inConsultation = todayAppointments.filter((apt) => apt.status === 'active');
  const completed = todayAppointments.filter((apt) => apt.status === 'completed');

  // Booked -> Arrived
  const handleMarkArrived = async (appointmentId: string) => {
    if (!selectedDoctor) return;
    const res = await updateAppointmentStatus({
      appointmentId,
      doctorId: selectedDoctor.id,
      date: today,
      status: 'arrived',
    });
    if (res.success) {
      // Refresh the list to reflect persisted state
      const refreshed = await fetchAppointmentsByDate(selectedDoctor.id, today);
      if (refreshed.success) {
        const items = Array.isArray(refreshed.data) ? refreshed.data : [];
        const mapped: Appointment[] = items.map((r: any) => ({
          id: String(r.id ?? r.appointment_uid ?? ''),
          tokenNumber: Number(r.tokenNumber ?? r.token_no ?? 0),
          patient: {
            id: String(r?.patient?.id ?? ''),
            name: String(r?.patient?.name ?? ''),
            phone: String(r?.patient?.phone ?? ''),
            age: Number(r?.patient?.age ?? 0),
          },
          doctor: selectedDoctor,
          date: String(r.date ?? today),
          timeSlot: {
            id: String(r?.timeSlot?.id ?? ''),
            startTime: String(r?.timeSlot?.startTime ?? ''),
            endTime: String(r?.timeSlot?.endTime ?? ''),
            totalTokens: Number(r?.timeSlot?.totalTokens ?? 0),
            bookedTokens: Number(r?.timeSlot?.bookedTokens ?? 0),
          },
          status: (r.status as Appointment['status']) ?? 'booked',
          arrivalTime: r.arrivalTime,
          consultationStartTime: r.consultationStartTime,
          completedTime: r.completedTime,
          queuePosition: r.queuePosition,
        }));
        setAppointments(mapped);
      }
      toast.success('Patient marked as arrived');
    } else {
      toast.error(res.message || 'Failed to mark arrived');
    }
  };

  // Arrived -> Waiting
  const handleMarkToWaiting = async (appointmentId: string) => {
    if (!selectedDoctor) return;
    const res = await updateAppointmentStatus({
      appointmentId,
      doctorId: selectedDoctor.id,
      date: today,
      status: 'waiting',
    });
    if (res.success) {
      const refreshed = await fetchAppointmentsByDate(selectedDoctor.id, today);
      if (refreshed.success) {
        const items = Array.isArray(refreshed.data) ? refreshed.data : [];
        const mapped: Appointment[] = items.map((r: any) => ({
          id: String(r.id ?? r.appointment_uid ?? ''),
          tokenNumber: Number(r.tokenNumber ?? r.token_no ?? 0),
          patient: {
            id: String(r?.patient?.id ?? ''),
            name: String(r?.patient?.name ?? ''),
            phone: String(r?.patient?.phone ?? ''),
            age: Number(r?.patient?.age ?? 0),
          },
          doctor: selectedDoctor,
          date: String(r.date ?? today),
          timeSlot: {
            id: String(r?.timeSlot?.id ?? ''),
            startTime: String(r?.timeSlot?.startTime ?? ''),
            endTime: String(r?.timeSlot?.endTime ?? ''),
            totalTokens: Number(r?.timeSlot?.totalTokens ?? 0),
            bookedTokens: Number(r?.timeSlot?.bookedTokens ?? 0),
          },
          status: (r.status as Appointment['status']) ?? 'booked',
          arrivalTime: r.arrivalTime,
          consultationStartTime: r.consultationStartTime,
          completedTime: r.completedTime,
          queuePosition: r.queuePosition,
        }));
        setAppointments(mapped);
      }
      toast.success('Moved to waiting');
    } else {
      toast.error(res.message || 'Failed to move to waiting');
    }
  };

  const handleStartConsultation = async (appointmentId: string) => {
    if (!selectedDoctor) return;
    const res = await updateAppointmentStatus({
      appointmentId,
      doctorId: selectedDoctor.id,
      date: today,
      status: 'active',
    });
    if (res.success) {
      const refreshed = await fetchAppointmentsByDate(selectedDoctor.id, today);
      if (refreshed.success) {
        const items = Array.isArray(refreshed.data) ? refreshed.data : [];
        const mapped: Appointment[] = items.map((r: any) => ({
          id: String(r.id ?? r.appointment_uid ?? ''),
          tokenNumber: Number(r.tokenNumber ?? r.token_no ?? 0),
          patient: {
            id: String(r?.patient?.id ?? ''),
            name: String(r?.patient?.name ?? ''),
            phone: String(r?.patient?.phone ?? ''),
            age: Number(r?.patient?.age ?? 0),
          },
          doctor: selectedDoctor,
          date: String(r.date ?? today),
          timeSlot: {
            id: String(r?.timeSlot?.id ?? ''),
            startTime: String(r?.timeSlot?.startTime ?? ''),
            endTime: String(r?.timeSlot?.endTime ?? ''),
            totalTokens: Number(r?.timeSlot?.totalTokens ?? 0),
            bookedTokens: Number(r?.timeSlot?.bookedTokens ?? 0),
          },
          status: (r.status as Appointment['status']) ?? 'booked',
          arrivalTime: r.arrivalTime,
          consultationStartTime: r.consultationStartTime,
          completedTime: r.completedTime,
          queuePosition: r.queuePosition,
        }));
        setAppointments(mapped);
      }
      toast.success('Consultation started');
    } else {
      toast.error(res.message || 'Failed to start consultation');
    }
  };

  const handleComplete = async (appointmentId: string) => {
    if (!selectedDoctor) return;
    const res = await updateAppointmentStatus({
      appointmentId,
      doctorId: selectedDoctor.id,
      date: today,
      status: 'completed',
    });
    if (res.success) {
      const refreshed = await fetchAppointmentsByDate(selectedDoctor.id, today);
      if (refreshed.success) {
        const items = Array.isArray(refreshed.data) ? refreshed.data : [];
        const mapped: Appointment[] = items.map((r: any) => ({
          id: String(r.id ?? r.appointment_uid ?? ''),
          tokenNumber: Number(r.tokenNumber ?? r.token_no ?? 0),
          patient: {
            id: String(r?.patient?.id ?? ''),
            name: String(r?.patient?.name ?? ''),
            phone: String(r?.patient?.phone ?? ''),
            age: Number(r?.patient?.age ?? 0),
          },
          doctor: selectedDoctor,
          date: String(r.date ?? today),
          timeSlot: {
            id: String(r?.timeSlot?.id ?? ''),
            startTime: String(r?.timeSlot?.startTime ?? ''),
            endTime: String(r?.timeSlot?.endTime ?? ''),
            totalTokens: Number(r?.timeSlot?.totalTokens ?? 0),
            bookedTokens: Number(r?.timeSlot?.bookedTokens ?? 0),
          },
          status: (r.status as Appointment['status']) ?? 'booked',
          arrivalTime: r.arrivalTime,
          consultationStartTime: r.consultationStartTime,
          completedTime: r.completedTime,
          queuePosition: r.queuePosition,
        }));
        setAppointments(mapped);
      }
      toast.success('Consultation completed');
    } else {
      toast.error(res.message || 'Failed to complete consultation');
    }
  };

  // Hold functionality removed: backend does not support 'hold' status.

  const handleReorder = (appointmentId: string, direction: 'up' | 'down') => {
    if (!selectedDoctor) return;

    // Build current waiting list for selected doctor/date
    const waiting = appointments
      .filter((a) => a.status === 'waiting' && a.doctor.id === selectedDoctor.id && a.date === today)
      .sort((a, b) => (a.queuePosition ?? 0) - (b.queuePosition ?? 0));

    const index = waiting.findIndex((a) => a.id === appointmentId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= waiting.length) return;

    // Swap and re-index locally
    [waiting[index], waiting[newIndex]] = [waiting[newIndex], waiting[index]];
    waiting.forEach((apt, idx) => { apt.queuePosition = idx; });

    // Apply changes to full appointments list
    const newAppointments = appointments.map((apt) => {
      const updated = waiting.find((w) => w.id === apt.id);
      return updated || apt;
    });
    setAppointments(newAppointments);

    // Persist exact new order derived from updated waiting array
    (async () => {
      const orderedIds = waiting.map((a) => a.id);
      const res = await updateQueuePositions({
        doctorId: selectedDoctor.id,
        date: today,
        orderedIds,
      });
      if (res.success) {
        const items = Array.isArray(res.data) ? res.data : [];
        const mapped: Appointment[] = items.map((r: any) => ({
          id: String(r.id ?? r.appointment_uid ?? ''),
          tokenNumber: Number(r.tokenNumber ?? r.token_no ?? 0),
          patient: {
            id: String(r?.patient?.id ?? ''),
            name: String(r?.patient?.name ?? ''),
            phone: String(r?.patient?.phone ?? ''),
            age: Number(r?.patient?.age ?? 0),
          },
          doctor: selectedDoctor,
          date: String(r.date ?? today),
          timeSlot: {
            id: String(r?.timeSlot?.id ?? ''),
            startTime: String(r?.timeSlot?.startTime ?? ''),
            endTime: String(r?.timeSlot?.endTime ?? ''),
            totalTokens: Number(r?.timeSlot?.totalTokens ?? 0),
            bookedTokens: Number(r?.timeSlot?.bookedTokens ?? 0),
          },
          status: (r.status as Appointment['status']) ?? 'booked',
          arrivalTime: r.arrivalTime,
          consultationStartTime: r.consultationStartTime,
          completedTime: r.completedTime,
          queuePosition: r.queuePosition,
        }));
        setAppointments(mapped);
        toast.success('Queue order saved');
      } else {
        toast.error(res.message ?? 'Failed to save queue order');
      }
    })();
  };

  const handlePriorityInsert = () => {
    if (!selectedAppointment || !selectedDoctor) return;

    // Build current waiting list and insert selected at target position
    const waiting = appointments
      .filter((a) => a.status === 'waiting' && a.doctor.id === selectedDoctor.id && a.date === today)
      .sort((a, b) => (a.queuePosition ?? 0) - (b.queuePosition ?? 0));

    const targetPosition = Math.min(insertAfter, waiting.length);
    const updatedWaiting = waiting.filter((a) => a.id !== selectedAppointment.id);
    updatedWaiting.splice(targetPosition, 0, selectedAppointment);
    updatedWaiting.forEach((apt, idx) => { apt.queuePosition = idx; });

    const newAppointments = appointments.map((apt) => {
      const updated = updatedWaiting.find((w) => w.id === apt.id);
      return updated || apt;
    });
    setAppointments(newAppointments);

    // Persist exact new order to backend
    (async () => {
      const orderedIds = updatedWaiting.map((a) => a.id);
      const res = await updateQueuePositions({
        doctorId: selectedDoctor.id,
        date: today,
        orderedIds,
      });
      if (res.success) {
        const items = Array.isArray(res.data) ? res.data : [];
        const mapped: Appointment[] = items.map((r: any) => ({
          id: String(r.id ?? r.appointment_uid ?? ''),
          tokenNumber: Number(r.tokenNumber ?? r.token_no ?? 0),
          patient: {
            id: String(r?.patient?.id ?? ''),
            name: String(r?.patient?.name ?? ''),
            phone: String(r?.patient?.phone ?? ''),
            age: Number(r?.patient?.age ?? 0),
          },
          doctor: selectedDoctor,
          date: String(r.date ?? today),
          timeSlot: {
            id: String(r?.timeSlot?.id ?? ''),
            startTime: String(r?.timeSlot?.startTime ?? ''),
            endTime: String(r?.timeSlot?.endTime ?? ''),
            totalTokens: Number(r?.timeSlot?.totalTokens ?? 0),
            bookedTokens: Number(r?.timeSlot?.bookedTokens ?? 0),
          },
          status: (r.status as Appointment['status']) ?? 'booked',
          arrivalTime: r.arrivalTime,
          consultationStartTime: r.consultationStartTime,
          completedTime: r.completedTime,
          queuePosition: r.queuePosition,
        }));
        setAppointments(mapped);
        toast.success(`Token #${selectedAppointment.tokenNumber} inserted and saved`);
      } else {
        toast.error(res.message ?? 'Failed to save priority order');
      }
      setPriorityDialogOpen(false);
      setSelectedAppointment(null);
    })();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className=" sticky top-0 z-10  px-4 py-0 max-w-4xl mx-auto">
        <div className="px-4 py-4">
          <h1 className="text-lg font-semibold text-foreground">Manage Patient Appointments</h1>
          {/* <p className="text-xs text-muted-foreground">Manage patient queue and consultations</p>*/}
        </div>

        {/* Doctor Selector */}
        <div className="px-4 pb-4 space-y-3">
          <Select
            value={selectedDoctor?.id ?? ''}
            onValueChange={(id) => {
              const doctor = doctors.find((d) => d.id === id);
              if (doctor) setSelectedDoctor(doctor);
            }}
          >
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="px-4 py-0 max-w-4xl mx-auto">
        {/* Stats Cards 
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="p-4">
            <div className="text-2xl font-bold text-status-arrived">{notArrivedList.length}</div>
            <div className="text-xs text-muted-foreground">Not Arrived</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-status-consultation">{waitingQueue.length}</div>
            <div className="text-xs text-muted-foreground">In Queue</div>
          </Card>
        </div>*/}

        <Tabs defaultValue="booked" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 h-auto gap-2 p-2 md:grid-cols-5">
            <TabsTrigger value="booked" className="text-xs py-3">
              Booked ({bookedList.length})
            </TabsTrigger>
            <TabsTrigger value="arrived" className="text-xs py-3">
              Arrived ({arrivedList.length})
            </TabsTrigger>
            <TabsTrigger value="waiting" className="text-xs py-3">
              Waiting ({waitingQueue.length})
            </TabsTrigger>
            <TabsTrigger value="consultation" className="text-xs py-3">
              Active ({inConsultation.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs py-3">
              Completed ({completed.length})
            </TabsTrigger>
          </TabsList>

          {/* Booked Tab */}
          <TabsContent value="booked" className="space-y-3">
            {bookedList.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No booked patients</p>
              </Card>
            ) : (
              bookedList.map((apt) => (
                <Card key={apt.id} className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary">#{apt.tokenNumber}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{apt.patient.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <span>{apt.patient.phone}</span>
                      </div>
                    </div>
                    <Badge className="bg-muted text-muted-foreground">Booked</Badge>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-yellow-500 text-black hover:bg-yellow-600 focus:ring-yellow-400 focus:ring-2 focus:ring-offset-2"
                    onClick={() => handleMarkArrived(apt.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Arrived
                  </Button>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Arrived Tab */}
          <TabsContent value="arrived" className="space-y-3">
            {arrivedList.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No arrived patients</p>
              </Card>
            ) : (
              arrivedList.map((apt) => (
                <Card key={apt.id} className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-status-arrived/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-status-arrived">#{apt.tokenNumber}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{apt.patient.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <span>{apt.patient.phone}</span>
                      </div>
                      {apt.arrivalTime && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3" />
                          <span>Arrived: {formatDisplayDateTime(apt.arrivalTime)}</span>
                        </div>
                      )}
                    </div>
                    <Badge className="bg-muted text-muted-foreground">Arrived</Badge>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500 focus:ring-2 focus:ring-offset-2"
                    onClick={() => handleMarkToWaiting(apt.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark to Waiting
                  </Button>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Waiting Queue Tab */}
          <TabsContent value="waiting" className="space-y-3">
            {waitingQueue.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No patients in queue</p>
              </Card>
            ) : (
              waitingQueue.map((apt, index) => (
                <Card key={apt.id} className="p-4 relative">
                  {/* Queue Position Badge */}
                  <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-lg">
                    {index + 1}
                  </div>

                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-status-arrived/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-lg font-bold text-status-arrived">#{apt.tokenNumber}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{apt.patient.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <span>{apt.patient.phone}</span>
                      </div>
                      {apt.arrivalTime && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3" />
                          <span>Arrived: {formatDisplayDateTime(apt.arrivalTime)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 gap-2 mb-2">
                    <Button
                      size="sm"
                      className="bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500 focus:ring-2 focus:ring-offset-2"
                      onClick={() => handleStartConsultation(apt.id)}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Start
                    </Button>
                  </div>

                  {/* Reorder Controls */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      disabled={index === 0}
                      onClick={() => handleReorder(apt.id, 'up')}
                    >
                      <ArrowUp className="w-4 h-4 mr-1" />
                      Move Up
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      disabled={index === waitingQueue.length - 1}
                      onClick={() => handleReorder(apt.id, 'down')}
                    >
                      <ArrowDown className="w-4 h-4 mr-1" />
                      Move Down
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedAppointment(apt);
                        setPriorityDialogOpen(true);
                      }}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* In Consultation Tab */}
          <TabsContent value="consultation" className="space-y-3">
            {inConsultation.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No active consultations</p>
              </Card>
            ) : (
              inConsultation.map((apt) => (
                <Card key={apt.id} className="p-4 border-status-consultation">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-status-consultation/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-status-consultation">#{apt.tokenNumber}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{apt.patient.name}</h3>
                      <p className="text-sm text-muted-foreground">{apt.doctor.name}</p>
                      {apt.consultationStartTime && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3" />
                          <span>Started: {formatDisplayDateTime(apt.consultationStartTime)}</span>
                        </div>
                      )}
                    </div>
                    <Badge className="bg-status-consultation text-white">Active</Badge>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 focus:ring-2 focus:ring-offset-2"
                    onClick={() => handleComplete(apt.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Consultation
                  </Button>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Completed Tab */}
          <TabsContent value="completed" className="space-y-3">
            {completed.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No completed consultations</p>
              </Card>
            ) : (
              completed.map((apt) => {
                const arrival = apt.arrivalTime ? new Date(apt.arrivalTime) : null;
                const done = apt.completedTime ? new Date(apt.completedTime) : null;
                let duration = '';
                if (arrival && done) {
                  const diffMs = done.getTime() - arrival.getTime();
                  const mins = Math.max(0, Math.floor(diffMs / 60000));
                  const hours = Math.floor(mins / 60);
                  const remMins = mins % 60;
                  duration = hours > 0 ? `${hours}h ${remMins}m` : `${remMins}m`;
                }

                return (
                  <Card key={apt.id} className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-lg font-bold text-foreground">#{apt.tokenNumber}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">{apt.patient.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span>{apt.patient.phone}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          {apt.arrivalTime && (
                            <span>Arrived: {formatDisplayDateTime(apt.arrivalTime)}</span>
                          )}
                          {apt.completedTime && (
                            <span>Completed: {formatDisplayDateTime(apt.completedTime)}</span>
                          )}
                          {duration && (
                            <span>Taken: {duration}</span>
                          )}
                        </div>
                      </div>
                      <Badge className="bg-muted text-muted-foreground">Completed</Badge>
                    </div>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Priority Insert Dialog */}
      <Dialog open={priorityDialogOpen} onOpenChange={setPriorityDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Queue Priority</DialogTitle>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4">
              <Card className="p-4 bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-bold text-primary">#{selectedAppointment.tokenNumber}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{selectedAppointment.patient.name}</p>
                    <p className="text-sm text-muted-foreground">Current: Position {(selectedAppointment.queuePosition ?? 0) + 1}</p>
                  </div>
                </div>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="insert-after">Insert after next X patients</Label>
                <Input
                  id="insert-after"
                  type="number"
                  min={0}
                  max={waitingQueue.length}
                  value={insertAfter}
                  onChange={(e) => setInsertAfter(parseInt(e.target.value) || 0)}
                  className="h-12 text-center text-lg"
                />
                <p className="text-xs text-muted-foreground">
                  Patient will be placed at position {insertAfter + 1}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPriorityDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePriorityInsert}>
              Apply Priority
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
