
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Clock, User, Phone, Grid3X3, List, Play, Eye, Calendar as CalendarIcon, ArrowUp, ArrowDown, CheckCircle, PauseCircle, PlayCircle, CheckCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { toast } from "sonner";
import { getMyAppointmentsByDate, getMyEventSchedule, updateMyAppointmentStatus, updateMyQueuePositions } from "@/services/doctorService";
import { useNavigate } from "react-router-dom";
import type { Appointment, AppointmentStatus } from "@/types/appointment";

type SlotKey = "morning" | "afternoon" | "evening";

const DoctorTodayPatientVisit = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [daySlots, setDaySlots] = useState<Array<{ start_time: string; end_time: string; type_name?: string; type_color?: string }>>([]);
  const [activeSlotValue, setActiveSlotValue] = useState<string>("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting": return "bg-warning-light text-warning";
      case "arrived": return "bg-info-light text-info";
      case "booked": return "bg-secondary text-secondary-foreground";
      case "completed": return "bg-success-light text-success";
      default: return "bg-secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const convertTo12Hour = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Derive slot period from timeSlot.startTime or appointment time
  const getSlotKeyForAppointment = (apt: Appointment): SlotKey => {
    const start = apt?.timeSlot?.startTime || "";
    // Expect formats like "07:00" or "2024-12-01 07:00:00"
    const hhmm = start.includes(" ") ? start.split(" ")[1]?.slice(0,5) : start.slice(0,5);
    const h = Number(hhmm?.split(":")[0] || 0);
    if (h < 12) return "morning";
    if (h < 17) return "afternoon";
    return "evening";
  };

  const selectedDateStr = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchesDate = (apt.date || "").slice(0,10) === selectedDateStr;
      const matchesStatus = statusFilter === "all" || apt.status === (statusFilter as AppointmentStatus);
      const matchesSearch = (
        apt.patient?.name?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
        String(apt.id).includes(searchQuery) ||
        String(apt.patient?.phone || "").includes(searchQuery)
      );
      return matchesDate && matchesStatus && matchesSearch;
    });
  }, [appointments, selectedDateStr, statusFilter, searchQuery]);

  const getSlotAppointments = (slot: SlotKey) => filteredAppointments.filter((apt) => getSlotKeyForAppointment(apt) === slot);

  const fmtTime = (t?: string) => {
    if (!t) return "";
    const [hh, mm] = t.split(":");
    let h = parseInt(hh || "0", 10);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${String(h)}:${String(mm ?? "00").padStart(2, "0")} ${ampm}`;
  };

  const timeEq = (a?: string, b?: string) => (a || "").slice(0,5) === (b || "").slice(0,5);
  const slotKey = (s: { start_time: string; end_time: string }) => `${(s.start_time || "").slice(0,5)}-${(s.end_time || "").slice(0,5)}`;
  const getAppointmentsForDaySlot = (s: { start_time: string; end_time: string }) => {
    return filteredAppointments.filter((apt) => {
      const st = apt?.timeSlot?.startTime || "";
      const et = apt?.timeSlot?.endTime || "";
      return timeEq(st, s.start_time) && timeEq(et, s.end_time);
    });
  };

  const groupByStatus = (apts: Appointment[]) => ({
    waiting: apts
      .filter((a) => a.status === "waiting")
      .sort((a, b) => (a.queuePosition ?? 0) - (b.queuePosition ?? 0)),
    arrived: apts.filter((a) => a.status === "arrived"),
    booked: apts.filter((a) => a.status === "booked"),
    active: apts.filter((a) => a.status === "active"),
    draft: apts.filter((a) => a.status === "draft"),
    completed: apts.filter((a) => a.status === "completed"),
  });

  // Load doctorId (self) and appointments for selected date
  const refreshAppointments = async (targetDateStr?: string) => {
    try {
      setLoading(true);
      const dateStr = targetDateStr || selectedDateStr;
      const list = await getMyAppointmentsByDate(dateStr);
      // Expect the backend to return an array of appointment-like objects
      const mapped: Appointment[] = (Array.isArray(list) ? list : []).map((item: any) => ({
        id: String(item?.id ?? item?.appointmentId ?? ""),
        tokenNumber: Number(item?.tokenNumber ?? item?.token ?? 0),
        patient: {
          id: String(item?.patient?.id ?? item?.patientId ?? ""),
          name: String(item?.patient?.name ?? item?.patientName ?? "Unknown"),
          phone: String(item?.patient?.phone ?? item?.patientPhone ?? ""),
          age: Number(item?.patient?.age ?? item?.patientAge ?? 0),
        },
        doctor: {
          id: String(item?.doctor?.id ?? item?.doctorId ?? doctorId ?? ""),
          name: String(item?.doctor?.name ?? item?.doctorName ?? ""),
          specialty: String(item?.doctor?.specialty ?? ""),
          avatar: undefined,
          availableDays: [],
          schedules: [],
        },
        date: String(item?.date ?? item?.appointmentDate ?? dateStr),
        timeSlot: {
          id: String(item?.timeSlot?.id ?? item?.slotId ?? ""),
          startTime: String(item?.timeSlot?.startTime ?? item?.startTime ?? ""),
          endTime: String(item?.timeSlot?.endTime ?? item?.endTime ?? ""),
          totalTokens: Number(item?.timeSlot?.totalTokens ?? item?.totalTokens ?? 0),
          bookedTokens: Number(item?.timeSlot?.bookedTokens ?? item?.bookedTokens ?? 0),
        },
        status: String(item?.status ?? item?.appointmentStatus ?? "booked") as AppointmentStatus,
        arrivalTime: String(item?.arrivalTime ?? ""),
        consultationStartTime: String(item?.consultationStartTime ?? ""),
        completedTime: String(item?.completedTime ?? ""),
        queuePosition: Number(item?.queuePosition ?? 0),
      }));
      setAppointments(mapped);
      // Attempt to derive doctorId from the first mapped appointment if not already set
      if (!doctorId && mapped.length && mapped[0]?.doctor?.id) {
        setDoctorId(String(mapped[0].doctor.id));
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        // Load appointments; doctorId will be inferred from returned items if present
      } catch (e) {
        console.warn("Initial load warning", e);
      } finally {
        // Always attempt to load appointments even if doctorId fallback is missing
        refreshAppointments();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refreshAppointments(selectedDateStr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDateStr]);

  useEffect(() => {
    let mounted = true;
    const loadDaySlots = async () => {
      try {
        const schedule: any[] = await getMyEventSchedule();
        const day = Array.isArray(schedule) ? schedule.find((d: any) => d?.date === selectedDateStr) : null;
        const slots = day?.slots || [];
        if (mounted) {
          setDaySlots(slots);
          setActiveSlotValue(slots.length ? slotKey(slots[0]) : "");
        }
      } catch (e) {
        console.warn("Failed to load day slots", e);
        if (mounted) {
          setDaySlots([]);
          setActiveSlotValue("");
        }
      }
    };
    loadDaySlots();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDateStr]);

  const statusTimeLabel = (apt: Appointment) => {
    const d = (t?: string) => {
      if (!t) return "";
      const hhmm = t.includes(" ") ? t.split(" ")[1]?.slice(0,5) : t.slice(0,5);
      return convertTo12Hour(hhmm || "");
    };
    switch (apt.status) {
      case "arrived": return `Arrived: ${d(apt.arrivalTime)}`;
      case "waiting": return `Waiting since: ${d(apt.arrivalTime)}`;
      case "active": return `Started: ${d(apt.consultationStartTime)}`;
      case "completed": return `Completed: ${d(apt.completedTime)}`;
      default: return `Booked: ${convertTo12Hour((apt.timeSlot?.startTime || "").slice(0,5))}`;
    }
  };

  const withAction = async (apt: Appointment, next: AppointmentStatus) => {
    try {
      await updateMyAppointmentStatus({
        appointmentId: String(apt.id),
        doctorId: doctorId ? String(doctorId) : undefined,
        date: selectedDateStr,
        status: next,
      });
      toast.success(`Updated to ${next}`);
      if (next === "active") {
        // Navigate to treatment page with appointment context
        navigate("/doctor-treatment", { state: { appointment: apt } });
        return;
      }
      await refreshAppointments(selectedDateStr);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to update status");
    }
  };

  const handleReorder = async (apt: Appointment, direction: "up" | "down") => {
    try {
      const waiting = appointments
        .filter((a) => a.status === "waiting" && String(a.timeSlot?.daySlot?.id || "") === String(apt.timeSlot?.daySlot?.id || ""))
        .sort((a,b) => (a.queuePosition || 0) - (b.queuePosition || 0));
      const idx = waiting.findIndex((a) => String(a.id) === String(apt.id));
      if (idx < 0) return;
      const targetIdx = direction === "up" ? Math.max(idx - 1, 0) : Math.min(idx + 1, waiting.length - 1);
      const reordered = [...waiting];
      const [moved] = reordered.splice(idx, 1);
      reordered.splice(targetIdx, 0, moved);
      const orderedIds = reordered.map((a) => String(a.id));
      await updateMyQueuePositions({ doctorId: doctorId ? String(doctorId) : undefined, date: selectedDateStr, orderedIds });
      // Optimistic local update to reflect new positions immediately
      const newPositions = new Map<string, number>();
      reordered.forEach((a, i) => newPositions.set(String(a.id), i + 1));
      setAppointments((prev) => prev.map((a) => {
        const sameSlot = String(a.timeSlot?.daySlot?.id || "") === String(apt.timeSlot?.daySlot?.id || "");
        if (a.status === "waiting" && sameSlot) {
          const pos = newPositions.get(String(a.id));
          return { ...a, queuePosition: pos ?? a.queuePosition };
        }
        return a;
      }));
      await refreshAppointments(selectedDateStr);
      toast.success("Queue updated");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to update queue");
    }
  };

  const PatientCard = ({ apt, isGrid = false }: { apt: Appointment; isGrid?: boolean }) => (
    <Card
      className={`p-4 hover:shadow-md transition-all border-l-4 ${
        apt.status === "waiting"
          ? "border-l-warning"
          : apt.status === "arrived"
          ? "border-l-info"
          : apt.status === "booked"
          ? "border-l-secondary"
          : (apt.status === "active" || apt.status === "draft")
          ? "border-l-primary"
          : "border-l-success"
      }`}
    >
      <div
        className={`flex ${isGrid ? "flex-col" : "flex-col sm:flex-row"} gap-3 items-start ${
          isGrid ? "" : "sm:items-center"
        }`}
      >
        {/* Token Number Bubble (mirroring sf-appointment-list) */}
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
            apt.status === "booked"
              ? "bg-muted text-muted-foreground"
              : apt.status === "arrived" || apt.status === "waiting"
              ? "bg-status-arrived/20 text-status-arrived"
              : (apt.status === "active" || apt.status === "draft")
              ? "bg-status-consultation/20 text-status-consultation"
              : "bg-muted text-foreground"
          }`}
        >
          <span className="text-lg font-bold">#{apt.tokenNumber}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h4 className="font-semibold text-base">{apt.patient?.name || "Patient"}</h4>
              <p className="text-sm text-muted-foreground">{apt.patient?.age || ""} years</p>
            </div>
            <Badge className={getStatusColor(apt.status)}>{getStatusLabel(apt.status)}</Badge>
          </div>

          <div className="space-y-1 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{statusTimeLabel(apt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>{apt.patient?.phone || ""}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {apt.status === "booked" && (
              <Button
                size="sm"
                className="gap-1 w-full sm:w-auto bg-yellow-500 text-black hover:bg-yellow-600 focus:ring-yellow-400 focus:ring-2 focus:ring-offset-2"
                onClick={() => withAction(apt, "arrived")}
              >
                <CheckCircle className="w-3 h-3" /> Mark Arrived
              </Button>
            )}
            {apt.status === "arrived" && (
              <Button
                size="sm"
                className="gap-1 w-full sm:w-auto bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500 focus:ring-2 focus:ring-offset-2"
                onClick={() => withAction(apt, "waiting")}
              >
                <PauseCircle className="w-3 h-3" /> Mark to Waiting
              </Button>
            )}
            {apt.status === "waiting" && (
              <>
                <Button
                  size="sm"
                  className="gap-1 w-full sm:w-auto bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500 focus:ring-2 focus:ring-offset-2"
                  onClick={() => withAction(apt, "active")}
                >
                  <PlayCircle className="w-3 h-3" /> Start Consultation
                </Button>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => handleReorder(apt, "up")}>
                    <ArrowUp className="w-3 h-3" /> Move Up
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => handleReorder(apt, "down")}>
                    <ArrowDown className="w-3 h-3" /> Move Down
                  </Button>
                </div>
              </>
            )}
            {(apt.status === "active" || apt.status === "draft") && (
              <>
                <Button
                  size="sm"
                  className="gap-1 w-full sm:w-auto bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500 focus:ring-2 focus:ring-offset-2"
                  onClick={() => navigate("/doctor-treatment", { state: { appointment: apt } })}
                >
                  <PlayCircle className="w-3 h-3" /> Continue Treatment
                </Button>
                <Button
                  size="sm"
                  className="gap-1 w-full sm:w-auto bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 focus:ring-2 focus:ring-offset-2"
                  onClick={() => withAction(apt, "completed")}
                >
                  <CheckCheck className="w-3 h-3" /> Finish Treatment
                </Button>
              </>
            )}
            <Button size="sm" variant="outline" className="gap-1" onClick={() => navigate(`/doctor-view-patient/${apt.patient?.id}`)}>
              <Eye className="w-3 h-3" /> View Details
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  const StatusSection = ({ title, apts }: { title: string; apts: Appointment[] }) => {
    if (apts.length === 0) return null;
    
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-lg font-heading font-semibold">{title}</h3>
          <Badge variant="outline">{apts.length}</Badge>
        </div>
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
          : "space-y-3"
        }>
          {apts.map(apt => (
            <PatientCard key={apt.id} apt={apt} isGrid={viewMode === "grid"} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-1">
        <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground pb-4">Patients Schedule</h1>
              <p className="text-muted-foreground">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Select Date</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background flex items-center gap-2"
                >
                  <option value="all">All Status</option>
                  <option value="waiting">Waiting</option>
                  <option value="arrived">Arrived</option>
                  <option value="booked">Booked</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Tabs for Time Slots */}
          <Card className="p-4 md:p-6">
            {daySlots.length > 0 ? (
              <Tabs value={activeSlotValue} onValueChange={setActiveSlotValue} className="w-full">
                <TabsList className="w-full flex flex-wrap gap-3 mb-6 justify-start sm:justify-start h-auto">
                  {daySlots.map((s, idx) => {
                    const val = slotKey(s);
                    const count = getAppointmentsForDaySlot(s).length;
                    return (
                      <TabsTrigger
                        key={`${val}-${idx}`}
                        value={val}
                        className="flex flex-col items-start px-3 py-2 gap-1 text-left"
                      >
                        {/* First Row: Time + Count */}
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {fmtTime(s.start_time)} - {fmtTime(s.end_time)}
                          </span>

                          {/* Count Pill */}
                          <Badge
                            variant="secondary"
                            className="ml-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                          >
                            {count}
                          </Badge>
                        </div>

                        {/* Second Row: Type Name */}
                        {s.type_name && (
                          <div className="text-xs text-muted-foreground pl-6">
                            {s.type_name}
                          </div>
                        )}
                      </TabsTrigger>

                    );
                  })}
                </TabsList>
                {daySlots.map((s, idx) => {
                  const val = slotKey(s);
                  const apts = getAppointmentsForDaySlot(s);
                  const grouped = groupByStatus(apts);
                  const booked = grouped.booked;
                  const arrived = grouped.arrived;
                  const waiting = grouped.waiting;
                  const active = grouped.active;
                  const draft = grouped.draft;
                  const completed = grouped.completed;
                  return (
                    <TabsContent key={`${val}-content-${idx}`} value={val}>
                      {/* Status Tabs per selected slot (mirroring /sf-appointment-list) */}
                      <Tabs defaultValue="booked" className="space-y-4">
                        <TabsList className="grid w-full grid-cols-3 h-auto gap-2 p-2 md:grid-cols-5">
                          <TabsTrigger value="booked" className="text-xs py-3">
                            Booked ({booked.length})
                          </TabsTrigger>
                          <TabsTrigger value="arrived" className="text-xs py-3">
                            Arrived ({arrived.length})
                          </TabsTrigger>
                          <TabsTrigger value="waiting" className="text-xs py-3">
                            Waiting ({waiting.length})
                          </TabsTrigger>
                          <TabsTrigger value="consultation" className="text-xs py-3">
                            Active ({active.length})
                          </TabsTrigger>
                          <TabsTrigger value="draft" className="text-xs py-3">
                            Draft ({draft.length})
                          </TabsTrigger>
                          <TabsTrigger value="completed" className="text-xs py-3">
                            Completed ({completed.length})
                          </TabsTrigger>
                        </TabsList>

                        {/* Booked Tab */}
                        <TabsContent value="booked" className="space-y-3">
                          {booked.length === 0 ? (
                            <Card className="p-8 text-center">
                              <p className="text-muted-foreground">No booked patients</p>
                            </Card>
                          ) : (
                            booked.map((apt) => <PatientCard key={apt.id} apt={apt} />)
                          )}
                        </TabsContent>

                        {/* Arrived Tab */}
                        <TabsContent value="arrived" className="space-y-3">
                          {arrived.length === 0 ? (
                            <Card className="p-8 text-center">
                              <p className="text-muted-foreground">No arrived patients</p>
                            </Card>
                          ) : (
                            arrived.map((apt) => <PatientCard key={apt.id} apt={apt} />)
                          )}
                        </TabsContent>

                        {/* Waiting Tab */}
                        <TabsContent value="waiting" className="space-y-3">
                          {waiting.length === 0 ? (
                            <Card className="p-8 text-center">
                              <p className="text-muted-foreground">No patients in queue</p>
                            </Card>
                          ) : (
                            waiting.map((apt, index) => (
                              <div key={apt.id} className="relative">
                                {/* Queue Position Badge */}
                                <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-lg">
                                  {(apt.queuePosition && apt.queuePosition > 0) ? apt.queuePosition : (index + 1)}
                                </div>
                                <PatientCard apt={apt} />
                              </div>
                            ))
                          )}
                        </TabsContent>

                        {/* Active Tab */}
                        <TabsContent value="consultation" className="space-y-3">
                          {active.length === 0 ? (
                            <Card className="p-8 text-center">
                              <p className="text-muted-foreground">No active consultations</p>
                            </Card>
                          ) : (
                            active.map((apt) => <PatientCard key={apt.id} apt={apt} />)
                          )}
                        </TabsContent>

                        {/* Draft Tab */}
                        <TabsContent value="draft" className="space-y-3">
                          {draft.length === 0 ? (
                            <Card className="p-8 text-center">
                              <p className="text-muted-foreground">No draft consultations</p>
                            </Card>
                          ) : (
                            draft.map((apt) => <PatientCard key={apt.id} apt={apt} />)
                          )}
                        </TabsContent>

                        {/* Completed Tab */}
                        <TabsContent value="completed" className="space-y-3">
                          {completed.length === 0 ? (
                            <Card className="p-8 text-center">
                              <p className="text-muted-foreground">No completed consultations</p>
                            </Card>
                          ) : (
                            completed.map((apt) => <PatientCard key={apt.id} apt={apt} />)
                          )}
                        </TabsContent>
                      </Tabs>

                      {apts.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                          No patients found for this slot on selected date
                        </div>
                      )}
                    </TabsContent>
                  );
                })}
              </Tabs>
            ) : (
              <Tabs defaultValue="morning" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="morning" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Morning</span>
                    <Badge variant="secondary" className="ml-1">{getSlotAppointments("morning").length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="afternoon" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Afternoon</span>
                    <Badge variant="secondary" className="ml-1">{getSlotAppointments("afternoon").length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="evening" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Evening</span>
                    <Badge variant="secondary" className="ml-1">{getSlotAppointments("evening").length}</Badge>
                  </TabsTrigger>
                </TabsList>

              <TabsContent value="morning">
                {(() => {
                  const apts = getSlotAppointments("morning");
                  const grouped = groupByStatus(apts);
                  return (
                    <>
                      <StatusSection title="Waiting" apts={grouped.waiting} />
                      <StatusSection title="Arrived" apts={grouped.arrived} />
                      <StatusSection title="Booked" apts={grouped.booked} />
                      <StatusSection title="Active" apts={grouped.active} />
                      <StatusSection title="Draft" apts={grouped.draft} />
                      <StatusSection title="Completed" apts={grouped.completed} />
                      {apts.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                          No patients found for morning slot on this date
                        </div>
                      )}
                    </>
                  );
                })()}
              </TabsContent>

              <TabsContent value="afternoon">
                {(() => {
                  const apts = getSlotAppointments("afternoon");
                  const grouped = groupByStatus(apts);
                  return (
                    <>
                      <StatusSection title="Waiting" apts={grouped.waiting} />
                      <StatusSection title="Arrived" apts={grouped.arrived} />
                      <StatusSection title="Booked" apts={grouped.booked} />
                      <StatusSection title="Active" apts={grouped.active} />
                      <StatusSection title="Draft" apts={grouped.draft} />
                      <StatusSection title="Completed" apts={grouped.completed} />
                      {apts.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                          No patients found for afternoon slot on this date
                        </div>
                      )}
                    </>
                  );
                })()}
              </TabsContent>

              <TabsContent value="evening">
                {(() => {
                  const apts = getSlotAppointments("evening");
                  const grouped = groupByStatus(apts);
                  return (
                    <>
                      <StatusSection title="Waiting" apts={grouped.waiting} />
                      <StatusSection title="Arrived" apts={grouped.arrived} />
                      <StatusSection title="Booked" apts={grouped.booked} />
                      <StatusSection title="Active" apts={grouped.active} />
                      <StatusSection title="Draft" apts={grouped.draft} />
                      <StatusSection title="Completed" apts={grouped.completed} />
                      {apts.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                          No patients found for evening slot on this date
                        </div>
                      )}
                    </>
                  );
                })()}
              </TabsContent>
              </Tabs>
            )}
          </Card>
        </div>
      </main>
    </div>
    
  );
};

export default DoctorTodayPatientVisit;
