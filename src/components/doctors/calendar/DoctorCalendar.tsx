import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, User, Phone, ArrowUp, ArrowDown, Play, CheckCircle, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getMyEventSchedule, getMyUpcomingAppointments, getMyAppointmentsByDate, getMyTodaysAppointmentsGrouped } from "@/services/doctorService";
import { updateAppointmentStatus, updateQueuePositions } from "@/services/SfstaffUseService";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type ScheduleDay = {
  date: string;
  weekday: string;
  is_available: number;
  slots: Array<{
    title: string;
    type: string;
    type_name?: string;
    type_color?: string;
    notes?: string;
    start_time: string;
    end_time: string;
    max_appointments?: number;
  }>;
  source: "event" | "master";
};

type UpcomingItem = {
  id: string;
  date: string;
  patient?: { name?: string };
  timeSlot?: { startTime?: string; endTime?: string };
  status: string;
  durationMinutes?: number;
  type_name?: string;
  type_color?: string;
};

type DoctorAppointment = {
  id: string;
  tokenNumber: number;
  patient: { id?: string; name?: string; phone?: string; age?: number };
  doctor?: { id?: string };
  date: string;
  timeSlot: { id?: string; startTime?: string; endTime?: string; totalTokens?: number; bookedTokens?: number };
  status: 'booked' | 'arrived' | 'waiting' | 'active' | 'completed';
  queuePosition?: number | null;
  arrivalTime?: string;
  consultationStartTime?: string;
  completedTime?: string;
  statusTime?: string;
};

const DoctorCalendar = () => {
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingItem[]>([]);
  const [loading, setLoading] = useState<{ schedule: boolean; upcoming: boolean }>({ schedule: false, upcoming: false });

  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [selectedSlot, setSelectedSlot] = useState<{ start_time?: string; end_time?: string; type_name?: string; type_color?: string } | null>(null);
  const [grouped, setGrouped] = useState<{ active: DoctorAppointment[]; waiting: DoctorAppointment[]; arrived: DoctorAppointment[]; booked: DoctorAppointment[]; completed: DoctorAppointment[] }>({ active: [], waiting: [], arrived: [], booked: [], completed: [] });
  const [doctorIdForActions, setDoctorIdForActions] = useState<string | null>(null);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  const fmtTime = (t?: string) => {
    if (!t) return "";
    // Expect HH:mm:ss or HH:mm
    const [hh, mm] = t.split(":");
    let h = parseInt(hh || "0", 10);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${String(h)}:${String(mm ?? "00").padStart(2, "0")} ${ampm}`;
  };

  const formatDisplayDateTime = (raw?: string) => {
    if (!raw) return '';
    let dt: Date | null = null;
    try {
      // Try parsing common backend format first
      const parts = raw.split(' ');
      if (parts.length >= 2) {
        const [ymd, hms] = parts;
        const [y, m, d] = ymd.split('-').map(x => parseInt(x, 10));
        const [hh, mm, ss] = hms.split(':').map(x => parseInt(x, 10));
        dt = new Date(y, (m - 1), d, hh, mm, ss || 0);
      }
    } catch (_) {
      dt = null;
    }
    if (!dt || isNaN(dt.getTime())) {
      const tmp = new Date(raw);
      dt = isNaN(tmp.getTime()) ? null : tmp;
    }
    if (!dt) return raw;
    const opts: Intl.DateTimeFormatOptions = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Intl.DateTimeFormat(undefined, opts).format(dt);
  };

  // Convert HEX color (e.g., #AABBCC) to rgba with configurable opacity
  // Mirrors the approach in WeeklyCalendar for consistent slot coloring
  const lightenColor = (hex: string, opacity = 0.55) => {
    if (!hex || !hex.startsWith("#") || hex.length !== 7) return hex;
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const scheduleByDate = useMemo(() => {
    const map: Record<string, ScheduleDay> = {};
    for (const d of schedule) {
      map[d.date] = d;
    }
    return map;
  }, [schedule]);

  const getSlotsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const sd = scheduleByDate[dateStr];
    return sd?.slots ?? [];
  };

  const getStatusColor = (status: string) => {
    const s = (status || "").toLowerCase();
    // Map backend statuses to UI color themes
    if (s === "active" || s === "completed") return "bg-success/10 text-success border-success/20";
    if (s === "booked" || s === "waiting" || s === "arrived") return "bg-warning/10 text-warning border-warning/20";
    if (s === "cancelled") return "bg-destructive/10 text-destructive border-destructive/20";
    return "bg-muted text-muted-foreground";
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const dayNumber = i - firstDayOfMonth + 1;
    return dayNumber > 0 && dayNumber <= daysInMonth ? dayNumber : null;
  });

  const goPrevMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };
  const goNextMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  useEffect(() => {
    let mounted = true;
    const loadSchedule = async () => {
      setLoading(prev => ({ ...prev, schedule: true }));
      try {
        const data = await getMyEventSchedule();
        if (mounted) setSchedule(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load schedule", e);
        if (mounted) setSchedule([]);
      } finally {
        if (mounted) setLoading(prev => ({ ...prev, schedule: false }));
      }
    };
    loadSchedule();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadUpcoming = async () => {
      setLoading(prev => ({ ...prev, upcoming: true }));
      try {
        const data = await getMyUpcomingAppointments(30);
        if (mounted) setUpcoming(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load upcoming appointments", e);
        if (mounted) setUpcoming([]);
      } finally {
        if (mounted) setLoading(prev => ({ ...prev, upcoming: false }));
      }
    };
    loadUpcoming();
    return () => { mounted = false; };
  }, []);

  // Load grouped appointments for selected date
  useEffect(() => {
    let mounted = true;
    const loadGrouped = async () => {
      try {
        const data = await getMyTodaysAppointmentsGrouped(selectedDate);
        if (mounted && data) {
          setGrouped(data);
          // Capture doctorId from first item if available for actions
          const anyItem = (data.booked[0] || data.arrived[0] || data.waiting[0] || data.active[0] || data.completed[0]) as DoctorAppointment | undefined;
          setDoctorIdForActions(anyItem?.doctor?.id ?? null);
        }
      } catch (e) {
        console.error('Failed to load grouped appointments', e);
        if (mounted) setGrouped({ active: [], waiting: [], arrived: [], booked: [], completed: [] });
      }
    };
    loadGrouped();
    return () => { mounted = false; };
  }, [selectedDate]);

  const filteredBySlot = (items: DoctorAppointment[]) => {
    if (!selectedSlot?.start_time && !selectedSlot?.end_time) return items;
    return items.filter((it) => {
      const st = it.timeSlot?.startTime ?? '';
      const et = it.timeSlot?.endTime ?? '';
      const matchStart = selectedSlot?.start_time ? st === selectedSlot.start_time : true;
      const matchEnd = selectedSlot?.end_time ? et === selectedSlot.end_time : true;
      return matchStart && matchEnd;
    });
  };

  const refreshGrouped = async () => {
    const data = await getMyTodaysAppointmentsGrouped(selectedDate);
    setGrouped(data || { active: [], waiting: [], arrived: [], booked: [], completed: [] });
  };

  const handleMarkArrived = async (appointmentId: string) => {
    if (!doctorIdForActions) return;
    await updateAppointmentStatus({ appointmentId, doctorId: doctorIdForActions, date: selectedDate, status: 'arrived' });
    await refreshGrouped();
  };

  const handleMarkToWaiting = async (appointmentId: string) => {
    if (!doctorIdForActions) return;
    await updateAppointmentStatus({ appointmentId, doctorId: doctorIdForActions, date: selectedDate, status: 'waiting' });
    await refreshGrouped();
  };

  const handleStartConsultation = async (appointmentId: string) => {
    if (!doctorIdForActions) return;
    await updateAppointmentStatus({ appointmentId, doctorId: doctorIdForActions, date: selectedDate, status: 'active' });
    await refreshGrouped();
  };

  const handleComplete = async (appointmentId: string) => {
    if (!doctorIdForActions) return;
    await updateAppointmentStatus({ appointmentId, doctorId: doctorIdForActions, date: selectedDate, status: 'completed' });
    await refreshGrouped();
  };

  const handleReorder = async (appointmentId: string, direction: 'up' | 'down') => {
    if (!doctorIdForActions) return;
    const waiting = [...filteredBySlot(grouped.waiting)].sort((a, b) => (a.queuePosition ?? 0) - (b.queuePosition ?? 0));
    const index = waiting.findIndex((a) => a.id === appointmentId);
    if (index === -1) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= waiting.length) return;
    [waiting[index], waiting[newIndex]] = [waiting[newIndex], waiting[index]];
    waiting.forEach((apt, idx) => { apt.queuePosition = idx; });
    const orderedIds = waiting.map((a) => a.id);
    await updateQueuePositions({ doctorId: doctorIdForActions, date: selectedDate, orderedIds });
    await refreshGrouped();
  };

  const next7Days = useMemo(() => {
    if (!schedule || schedule.length === 0) return [];
    const todayStr = new Date().toISOString().slice(0, 10);
    const startIndex = schedule.findIndex((d: any) => d.date === todayStr);
    const start = startIndex >= 0 ? startIndex : 0;
    return schedule.slice(start, start + 7);
  }, [schedule]);

  const selectedScheduleDay = useMemo(() => {
    if (!next7Days.length) return null;
    const match = next7Days.find((d: any) => d.date === selectedDate);
    return match || next7Days[0];
  }, [next7Days, selectedDate]);

  const selectedScheduleSlots = useMemo(() => {
    if (!selectedScheduleDay || !Array.isArray(selectedScheduleDay.slots)) return [];
    return selectedScheduleDay.slots;
  }, [selectedScheduleDay]);

  const weeklyMonthLabel = useMemo(() => {
    if (!selectedScheduleDay?.date) return "";
    const dt = new Date(selectedScheduleDay.date);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toLocaleDateString(undefined, { month: "short", year: "numeric" });
  }, [selectedScheduleDay]);

  return (

    <div className="space-y-6">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-24 md:pt-6 md:pb-8">
        <div className="min-h-screen bg-background p-0 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 md:mb-8"
          >
            <h1 className="text-sm font-semibold text-foreground pb-3 md:text-2xl md:font-bold md:pb-4">
              Manage Calendar
            </h1>
          </motion.div>


          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <CalendarIcon className="h-5 w-5" />
                  {monthName}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex gap-1 mr-4">
                    <Button
                      size="sm"
                      variant={view === "day" ? "default" : "outline"}
                      onClick={() => setView("day")}
                    >
                      Day
                    </Button>
                    <Button
                      size="sm"
                      variant={view === "week" ? "default" : "outline"}
                      onClick={() => setView("week")}
                    >
                      Week
                    </Button>
                    <Button
                      size="sm"
                      variant={view === "month" ? "default" : "outline"}
                      onClick={() => setView("month")}
                    >
                      Month
                    </Button>
                  </div>
                  <Button size="icon" variant="outline" onClick={goPrevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={goNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {view === "month" && (
                <div>
                  <div className="md:hidden">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold">Weekly Schedule</p>
                      {weeklyMonthLabel && (
                        <div className="flex items-center gap-1 text-xs text-emerald-700">
                          <CalendarIcon className="w-3 h-3" />
                          <span>{weeklyMonthLabel}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-7 gap-1 pb-1">
                      {next7Days.map((dayItem: any) => {
                        const dayLabel = String(dayItem.weekday || "").substring(0, 3);
                        const dateObj = new Date(dayItem.date);
                        const dateNum = Number.isNaN(dateObj.getTime()) ? "" : dateObj.getDate();
                        const slotsCount = Array.isArray(dayItem.slots) ? dayItem.slots.length : 0;
                        const isSelected = selectedScheduleDay && dayItem.date === selectedScheduleDay.date;

                        return (
                          <button
                            key={dayItem.date}
                            type="button"
                            onClick={() => {
                              setSelectedDate(dayItem.date);
                              setSelectedSlot(null);
                            }}
                            className={cn(
                              "flex flex-col items-center justify-center px-1 py-1.5 rounded-xl text-[10px] leading-tight transition-all border",
                              isSelected
                                ? "bg-emerald-500 text-white border-emerald-500 shadow-md"
                                : "bg-muted text-muted-foreground border-transparent"
                            )}
                          >
                            <span className="text-[10px] uppercase tracking-wide">
                              {dayLabel}
                            </span>
                            <span className="mt-0.5 text-sm font-semibold">{dateNum}</span>
                            <span className="mt-0.5 text-[10px] opacity-80">
                              {slotsCount} slot{slotsCount === 1 ? "" : "s"}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 space-y-2">
                      {selectedScheduleSlots.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          No events scheduled for this day.
                        </p>
                      ) : (
                        selectedScheduleSlots.map((slot: any, index: number) => (
                          <div
                            key={index}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-2xl text-xs shadow-sm border",
                              slot.type_color ? "" : "bg-muted border-border"
                            )}
                            style={
                              slot.type_color
                                ? { backgroundColor: lightenColor(slot.type_color, 0.7) }
                                : undefined
                            }
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/70">
                                <Clock className="w-4 h-4 text-emerald-600" />
                              </div>
                              <div>
                                <p className="text-[11px] font-semibold">
                                  {fmtTime(slot.start_time)} - {fmtTime(slot.end_time)}
                                </p>
                                <p className="text-[11px] opacity-90">
                                  {slot.type_name || slot.title || "Slot"}
                                </p>
                              </div>
                            </div>

                            {typeof slot.max_appointments === "number" && slot.max_appointments > 0 && (
                              <div className="text-right">
                                <p className="text-[10px] font-semibold text-emerald-800">
                                  {slot.max_appointments} slots
                                </p>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="hidden md:block">
                    <div className="grid grid-cols-7 gap-2 mb-2">
                      {days.map(day => (
                        <div key={day} className="text-center p-2 font-semibold text-sm text-muted-foreground">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {calendarDays.map((day, index) => {
                        const slots = day ? getSlotsForDate(day) : [];
                        const iso = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day ?? 0).padStart(2, '0')}`;
                        const isToday = day !== null && new Date().toISOString().slice(0,10) === iso;
                        
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.01 }}
                            className={cn(
                              "min-h-[120px] p-2 rounded-xl border-2 transition-all",
                              day ? "bg-card hover:shadow-md cursor-pointer" : "bg-muted/20 border-transparent",
                              isToday && "border-primary bg-primary/5",
                              !day && "border-transparent"
                            )}
                            onClick={() => { if (day) { setSelectedDate(iso); setSelectedSlot(null); } }}
                          >
                            {day && (
                              <>
                                <div className={cn(
                                  "text-sm font-semibold mb-2",
                                  isToday ? "text-primary" : "text-foreground"
                                )}>
                                  {day}
                                </div>
                                <div className="space-y-1">
                                  {slots.slice(0, 2).map((s, idx) => (
                                    <div
                                      key={`${iso}-${idx}-${s.start_time}-${s.end_time}`}
                                      className={cn(
                                        "text-xs p-1 rounded truncate",
                                        s.type_color ? "" : "bg-muted"
                                      )}
                                      style={
                                        s.type_color
                                          ? { backgroundColor: lightenColor(s.type_color, 0.55) }
                                          : undefined
                                      }
                                      onClick={(e) => { e.stopPropagation(); setSelectedDate(iso); setSelectedSlot({ start_time: s.start_time, end_time: s.end_time, type_name: s.type_name, type_color: s.type_color }); }}
                                    >
                                      {fmtTime(s.start_time)} - {fmtTime(s.end_time)} {s.type_name ? `• ${s.type_name}` : ""}

                                      <p className="text-xs opacity-90">
                                        {s.type_name || s.title || "Slot"}
                                      </p>
                                    </div>
                                  ))}
                                  {slots.length > 2 && (
                                    <div className="text-xs text-muted-foreground">
                                      +{slots.length - 2} more
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Day Patient Lists */}
          <Card className="shadow-card mt-6 mb-4 md:mb-6">
            <CardHeader className="px-3 py-3 md:px-6 md:py-4">
              <CardTitle className="text-sm font-semibold md:text-lg">
                Patients • {selectedDate}
                {selectedSlot && (
                  <span
                    className="ml-2 inline-block text-[11px] md:text-xs px-2 py-1 rounded-md align-middle"
                    style={selectedSlot.type_color ? { backgroundColor: lightenColor(selectedSlot.type_color, 0.55) } : undefined}
                  >
                    {fmtTime(selectedSlot.start_time)} - {fmtTime(selectedSlot.end_time)}{selectedSlot.type_name ? ` • ${selectedSlot.type_name}` : ''}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-4 pt-0 md:px-6 md:pb-6">
              <Tabs defaultValue="booked" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 p-0 bg-transparent h-auto items-stretch">
                  <TabsTrigger
                    value="booked"
                    className="w-full text-xs py-2 px-4 rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-sm data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:border-emerald-500"
                  >
                    Booked ({filteredBySlot(grouped.booked).length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="arrived"
                    className="w-full text-xs py-2 px-4 rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-sm data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:border-emerald-500"
                  >
                    Arrived ({filteredBySlot(grouped.arrived).length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="waiting"
                    className="w-full text-xs py-2 px-4 rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-sm data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:border-emerald-500"
                  >
                    Waiting ({filteredBySlot(grouped.waiting).length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="consultation"
                    className="w-full text-xs py-2 px-4 rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-sm data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:border-emerald-500"
                  >
                    Active ({filteredBySlot(grouped.active).length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="completed"
                    className="w-full text-xs py-2 px-4 rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-sm data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:border-emerald-500"
                  >
                    Completed ({filteredBySlot(grouped.completed).length})
                  </TabsTrigger>
                </TabsList>

                {/* Booked */}
                <TabsContent value="booked" className="space-y-3">
                  {filteredBySlot(grouped.booked).length === 0 ? (
                    <Card className="p-8 text-center"><p className="text-muted-foreground">No booked patients</p></Card>
                  ) : (
                    filteredBySlot(grouped.booked).map((apt) => (
                      <Card
                        key={apt.id}
                        className="p-0 border-0 shadow-none bg-transparent"
                      >
                        <div className="md:hidden space-y-2">
                          <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm border border-emerald-50">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-1 rounded-full bg-emerald-500" />
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-[13px] font-semibold text-white">
                                  {apt.tokenNumber}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {apt.patient?.name ?? "Patient"}
                                  </p>
                                  <p className="text-[11px] text-slate-500">
                                    {apt.patient?.age ? `${apt.patient.age} years` : ""}
                                  </p>
                                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    <span>{apt.patient?.phone}</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                            <span
                              className={cn(
                                "text-xs font-semibold",
                                apt.status === "active"
                                  ? "text-emerald-600"
                                  : apt.status === "waiting" || apt.status === "arrived"
                                  ? "text-amber-600"
                                  : apt.status === "booked"
                                  ? "text-sky-600"
                                  : "text-slate-500"
                              )}
                            >
                              {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            className="w-full bg-yellow-500 text-black hover:bg-yellow-600"
                            onClick={() => handleMarkArrived(apt.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" /> Mark Arrived
                          </Button>
                        </div>

                        <div className="hidden md:block p-4 rounded-xl bg-card">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-lg font-bold text-primary">#{apt.tokenNumber}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground">{apt.patient?.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                <span>{apt.patient?.phone}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="w-full bg-yellow-500 text-black hover:bg-yellow-600"
                            onClick={() => handleMarkArrived(apt.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" /> Mark Arrived
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </TabsContent>

                {/* Arrived */}
                <TabsContent value="arrived" className="space-y-3">
                  {filteredBySlot(grouped.arrived).length === 0 ? (
                    <Card className="p-8 text-center"><p className="text-muted-foreground">No arrived patients</p></Card>
                  ) : (
                    filteredBySlot(grouped.arrived).map((apt) => (
                      <Card
                        key={apt.id}
                        className="p-0 border-0 shadow-none bg-transparent"
                      >
                        <div className="md:hidden space-y-2">
                          <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm border border-emerald-50">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-1 rounded-full bg-emerald-500" />
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-[13px] font-semibold text-white">
                                  {apt.tokenNumber}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {apt.patient?.name ?? "Patient"}
                                  </p>
                                  <p className="text-[11px] text-slate-500">
                                    {apt.patient?.age ? `${apt.patient.age} years` : ""}
                                  </p>
                                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    <span>{apt.patient?.phone}</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                            <span
                              className={cn(
                                "text-xs font-semibold",
                                apt.status === "active"
                                  ? "text-emerald-600"
                                  : apt.status === "waiting" || apt.status === "arrived"
                                  ? "text-amber-600"
                                  : apt.status === "booked"
                                  ? "text-sky-600"
                                  : "text-slate-500"
                              )}
                            >
                              {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            className="w-full bg-cyan-600 text-white hover:bg-cyan-700"
                            onClick={() => handleMarkToWaiting(apt.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" /> Mark to Waiting
                          </Button>
                        </div>

                        <div className="hidden md:block p-4 rounded-xl bg-card">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-status-arrived/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-lg font-bold text-status-arrived">#{apt.tokenNumber}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground">{apt.patient?.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                <span>{apt.patient?.phone}</span>
                              </div>
                              {apt.arrivalTime && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                  <Clock className="w-3 h-3" />
                                  <span>Arrived: {formatDisplayDateTime(apt.arrivalTime)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="w-full bg-cyan-600 text-white hover:bg-cyan-700"
                            onClick={() => handleMarkToWaiting(apt.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" /> Mark to Waiting
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </TabsContent>

                {/* Waiting */}
                <TabsContent value="waiting" className="space-y-3">
                  {filteredBySlot(grouped.waiting).length === 0 ? (
                    <Card className="p-8 text-center"><p className="text-muted-foreground">No patients in queue</p></Card>
                  ) : (
                    filteredBySlot(grouped.waiting).sort((a, b) => (a.queuePosition ?? 0) - (b.queuePosition ?? 0)).map((apt, index, arr) => (
                      <Card
                        key={apt.id}
                        className="p-0 border-0 shadow-none bg-transparent"
                      >
                        <div className="md:hidden">
                          <div className="rounded-2xl bg-white px-4 py-4 shadow-sm border border-emerald-50">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-1 rounded-full bg-emerald-500" />
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-[13px] font-semibold text-white">
                                    {apt.tokenNumber}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                      {apt.patient?.name ?? "Patient"}
                                    </p>
                                    {apt.patient?.age && (
                                      <p className="text-[11px] text-slate-500">
                                        {apt.patient.age} years
                                      </p>
                                    )}
                                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      <span>{apt.patient?.phone}</span>
                                    </p>
                                    <p className="text-[11px] text-slate-400">#{apt.tokenNumber}</p>
                                  </div>
                                </div>
                              </div>
                              <span
                                className={cn(
                                  "text-xs font-semibold",
                                  apt.status === "active"
                                    ? "text-emerald-600"
                                    : apt.status === "waiting" || apt.status === "arrived"
                                    ? "text-amber-600"
                                    : apt.status === "booked"
                                    ? "text-sky-600"
                                    : "text-slate-500"
                                )}
                              >
                                {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                              </span>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                className="bg-emerald-600 text-white hover:bg-emerald-700"
                                onClick={() => handleStartConsultation(apt.id)}
                              >
                                <Play className="w-4 h-4 mr-1" /> Start Consultation
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 min-w-[80px]"
                                disabled={index === 0}
                                onClick={() => handleReorder(apt.id, "up")}
                              >
                                <ArrowUp className="w-4 h-4 mr-1" /> Up
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 min-w-[90px]"
                                disabled={index === arr.length - 1}
                                onClick={() => handleReorder(apt.id, "down")}
                              >
                                <ArrowDown className="w-4 h-4 mr-1" /> Down
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 min-w-[90px]"
                              >
                                Details
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="hidden md:block p-4 rounded-xl bg-card relative">
                          <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-lg">
                            {index + 1}
                          </div>
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-status-arrived/20 flex items-center justify-center flex-shrink-0 mt-1">
                              <span className="text-lg font-bold text-status-arrived">#{apt.tokenNumber}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground">{apt.patient?.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                <span>{apt.patient?.phone}</span>
                              </div>
                              {apt.arrivalTime && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                  <Clock className="w-3 h-3" />
                                  <span>Arrived: {formatDisplayDateTime(apt.arrivalTime)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-2 mb-2">
                            <Button
                              size="sm"
                              className="bg-cyan-600 text-white hover:bg-cyan-700"
                              onClick={() => handleStartConsultation(apt.id)}
                            >
                              <Play className="w-4 h-4 mr-1" /> Start
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              disabled={index === 0}
                              onClick={() => handleReorder(apt.id, "up")}
                            >
                              <ArrowUp className="w-4 h-4 mr-1" /> Move Up
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              disabled={index === arr.length - 1}
                              onClick={() => handleReorder(apt.id, "down")}
                            >
                              <ArrowDown className="w-4 h-4 mr-1" /> Move Down
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </TabsContent>

                {/* Active */}
                <TabsContent value="consultation" className="space-y-3">
                  {filteredBySlot(grouped.active).length === 0 ? (
                    <Card className="p-8 text-center"><p className="text-muted-foreground">No active consultations</p></Card>
                  ) : (
                    filteredBySlot(grouped.active).map((apt) => (
                      <Card
                        key={apt.id}
                        className="p-0 border-0 shadow-none bg-transparent"
                      >
                        <div className="md:hidden space-y-2">
                          <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm border border-emerald-50">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-1 rounded-full bg-emerald-500" />
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-[13px] font-semibold text-white">
                                  {apt.tokenNumber}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {apt.patient?.name ?? "Patient"}
                                  </p>
                                  <p className="text-[11px] text-slate-500">
                                    {apt.patient?.age ? `${apt.patient.age} years` : ""}
                                  </p>
                                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    <span>{apt.patient?.phone}</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                            <span
                              className={cn(
                                "text-xs font-semibold",
                                apt.status === "active"
                                  ? "text-emerald-600"
                                  : apt.status === "waiting" || apt.status === "arrived"
                                  ? "text-amber-600"
                                  : apt.status === "booked"
                                  ? "text-sky-600"
                                  : "text-slate-500"
                              )}
                            >
                              {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            className="w-full bg-green-600 text-white hover:bg-green-700"
                            onClick={() => handleComplete(apt.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" /> Complete Consultation
                          </Button>
                        </div>

                        <div className="hidden md:block p-4 rounded-xl bg-card border-status-consultation">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-status-consultation/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-lg font-bold text-status-consultation">#{apt.tokenNumber}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground">{apt.patient?.name}</h3>
                              {apt.consultationStartTime && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                  <Clock className="w-3 h-3" />
                                  <span>Started: {formatDisplayDateTime(apt.consultationStartTime)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="w-full bg-green-600 text-white hover:bg-green-700"
                            onClick={() => handleComplete(apt.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" /> Complete Consultation
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </TabsContent>

                {/* Completed */}
                <TabsContent value="completed" className="space-y-3">
                  {filteredBySlot(grouped.completed).length === 0 ? (
                    <Card className="p-8 text-center"><p className="text-muted-foreground">No completed consultations</p></Card>
                  ) : (
                    filteredBySlot(grouped.completed).map((apt) => (
                      <Card
                        key={apt.id}
                        className="p-0 border-0 shadow-none bg-transparent"
                      >
                        <div className="md:hidden space-y-2">
                          <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm border border-emerald-50">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-1 rounded-full bg-emerald-500" />
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-[13px] font-semibold text-white">
                                  {apt.tokenNumber}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {apt.patient?.name ?? "Patient"}
                                  </p>
                                  <p className="text-[11px] text-slate-500">
                                    {apt.patient?.age ? `${apt.patient.age} years` : ""}
                                  </p>
                                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    <span>{apt.patient?.phone}</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                            <span
                              className={cn(
                                "text-xs font-semibold",
                                apt.status === "active"
                                  ? "text-emerald-600"
                                  : apt.status === "waiting" || apt.status === "arrived"
                                  ? "text-amber-600"
                                  : apt.status === "booked"
                                  ? "text-sky-600"
                                  : "text-slate-500"
                              )}
                            >
                              {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                            </span>
                          </div>
                        </div>

                        <div className="hidden md:block p-4 rounded-xl bg-card">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                              <span className="text-lg font-bold text-foreground">#{apt.tokenNumber}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground">{apt.patient?.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                <span>{apt.patient?.phone}</span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                {apt.arrivalTime && (<span>Arrived: {formatDisplayDateTime(apt.arrivalTime)}</span>)}
                                {apt.completedTime && (<span>Completed: {formatDisplayDateTime(apt.completedTime)}</span>)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="shadow-card mt-6">
            <CardHeader className="px-3 py-3 md:px-6 md:py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold md:text-lg">
                  Upcoming Appointments
                </CardTitle>
                <span className="text-[11px] md:text-xs font-semibold text-emerald-600 cursor-pointer">
                  View All
                </span>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-4 pt-0 md:px-6 md:pb-6">
              <div className="space-y-3">
                {upcoming.slice(0, 8).map((appointment, index) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-0 md:p-4 md:rounded-xl md:border-2 md:border-border md:bg-card md:hover:shadow-md transition-all"
                  >
                    <div className="md:hidden">
                      <div className="flex items-center justify-between rounded-2xl bg-emerald-50/40 px-3 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-[13px] font-semibold text-emerald-700">
                            {(appointment.patient?.name && appointment.patient.name.length > 0
                              ? appointment.patient.name.charAt(0)
                              : "P"
                            ).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {appointment.patient?.name ?? "Patient"}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {fmtTime(appointment.timeSlot?.startTime)}
                              {appointment.timeSlot?.endTime ? ` - ${fmtTime(appointment.timeSlot.endTime)}` : ""}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full border-0",
                            appointment.status === "waiting"
                              ? "bg-amber-100 text-amber-700"
                              : appointment.status === "booked"
                              ? "bg-sky-100 text-sky-700"
                              : appointment.status === "active"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {String(appointment.status).charAt(0).toUpperCase() + String(appointment.status).slice(1)}
                        </Badge>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 rounded-xl bg-primary/10">
                          <CalendarIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-semibold text-foreground">{appointment.patient?.name ?? "Patient"}</h4>
                            <Badge className={getStatusColor(appointment.status)} variant="outline">
                              {String(appointment.status).toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {appointment.date} • {fmtTime(appointment.timeSlot?.startTime)} -{" "}
                                {fmtTime(appointment.timeSlot?.endTime)}
                              </span>
                            </div>
                            <span>•</span>
                            <span>{appointment.status}</span>
                            <span>•</span>
                            <span>{appointment.durationMinutes ?? 0} min</span>
                          </div>

                          {(appointment.type_name || appointment.type_color) && (
                            <div
                              className="mt-2 inline-block text-xs px-2 py-1 rounded-md"
                              style={
                                appointment.type_color
                                  ? { backgroundColor: lightenColor(appointment.type_color, 0.55) }
                                  : undefined
                              }
                            >
                              {fmtTime(appointment.timeSlot?.startTime)} - {fmtTime(appointment.timeSlot?.endTime)}
                              {appointment.type_name ? ` • ${appointment.type_name}` : ""}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </motion.div>
                ))}
                {upcoming.length === 0 && !loading.upcoming && (
                  <div className="text-sm text-muted-foreground">No upcoming appointments.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DoctorCalendar;
