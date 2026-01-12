
// StaffasDoctorCalendar.tsx
import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2, Clock } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isToday,
  startOfWeek,
  endOfWeek,
  parse
} from "date-fns";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { fetchDoctorList, fetchDoctorEventSchedule  } from "@/services/SfstaffUseService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaIcons } from "@/components/icons/PaIcons";


/**
 * Full calendar component integrated with API endpoints:
 * GET  /getDoctorEventSchedule?doctor_id=...
 * POST /addDoctorEventSchedule
 * POST /updateDoctorEventSchedule
 * POST /deleteDoctorEventSchedule
 *
 * If your backend uses different field names, adapt mappings in api* functions.
 */

interface CalendarEvent {
  id: string;
  backendId?: string | null;
  source?: "local" | "remote";
  type: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  doctorName?: string;
  type_name?: string;    // ✅ add this
  type_color?: string;   // ✅ add this
  max_appointments?: number | string; // ✅ optional, since you also reference it
}


const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
const daysOfWeekFull = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getEventBadgeColor = (type: CalendarEvent["type"]) => {
  switch (type) {
    case "visit": return "bg-visit-light text-visit";
    case "call": return "bg-call-light text-call";
    case "task": return "bg-task-light text-task";
    case "exam": return "bg-exam-light text-exam";
    case "surgery": return "bg-red-100 text-red-700";
    case "meeting": return "bg-blue-100 text-blue-700";
    case "holiday": return "bg-green-100 text-green-700";
    case "personal": return "bg-purple-100 text-purple-700";
  }
};

const getEventIcon = (type: CalendarEvent["type"]) => {
  switch (type) {
    case "visit": return "👩‍⚕️";
    case "surgery": return "🏥";
    case "call": return "📞";
    case "meeting": return "🧠";
    case "holiday": return "🌴";
    case "personal": return "🎉";
    case "exam": return "📋";
    case "task": return "✅";
  }
};

interface Doctor { id: string; name: string; specialty?: string; }

interface ServerSlot {
  // shape expected from GET /getDoctorEventSchedule response (adapt if different)
  id?: string; // backend slot id
  title?: string;
  type?: string;
  type_color?: string;
  type_name?: string;
  start_time: string;
  end_time: string;
  notes?: string;
  max_appointments?: number | string;
  weekday?: string;
  date?: string;
}

interface ServerDay {
  date: string;       // yyyy-MM-dd
  weekday: string;
  is_available: number; // 0|1
  slots: ServerSlot[];
  source?: string;
}

export default function StaffasDoctorCalendar() {
  // ---- doctors + schedule selection ----
  const [scheduleData, setScheduleData] = useState<{ doctor: string }>({ doctor: "" });
  const [doctorList, setDoctorList] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // ---- events: combination of local events and server-provided slots ----
  // local UI events created by user (these also sync to backend)
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>(() => {
    // start with nothing local by default
    return [];
  });

  // serverDays holds raw server schedule days (90 days)
  const [serverDays, setServerDays] = useState<ServerDay[] | null>(null);

  // UI state
  const [currentDate, setCurrentDate] = useState<Date>(new Date()); // month
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDayDetails, setShowDayDetails] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    type: "visit" as CalendarEvent["type"],
    date: "",
    startTime: "",
    endTime: "",
    notes: "",
    doctorName: "",
  });

  const hexToRgba = (hex, opacity = 0.45) => {
    let c = hex.replace("#", "");
    if (c.length === 3) c = c.split("").map((ch) => ch + ch).join("");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };


  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // --- fetch doctor list ---
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const res = await fetchDoctorList();
        if (res?.success && Array.isArray(res.data)) {
          setDoctorList(res.data.map((d: any) => ({ id: d.docuid, name: d.name, specialty: d.specialty || "" })));
        } else {
          toast.error("Invalid doctor data");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch doctors");
      } finally {
        setLoadingDoctors(false);
      }
    };
    loadDoctors();
  }, []);

 

  const apiFetchSchedule = async (doctorId: string) => {
    try {
      const response = await fetchDoctorEventSchedule(doctorId);

      if (response?.success && Array.isArray(response.data)) {
        console.log("✅ Doctor schedule fetched successfully:", response.data);
        return response.data;
      } else {
        console.warn("⚠️ Unexpected schedule response:", response);
        return [];
      }
    } catch (error) {
      console.error("❌ Error fetching doctor schedule:", error);
      return [];
    }
  };

  const apiAddEvent = async (doctorId: string, payload: {
    title: string;
    type: string;
    type_name: string;
    type_color: string;
    date: string;
    start_time: string;
    end_time: string;
    notes?: string;
  }) => {
    // POST /addDoctorEventSchedule
    // Adapt to backend payload names if required
    try {
      const resp = await fetch("/addDoctorEventSchedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctor_id: doctorId, ...payload }),
      });
      const json = await resp.json();
      return json;
    } catch (err) {
      console.error("add event error", err);
      return { success: false, error: err };
    }
  };

  const apiUpdateEvent = async (doctorId: string, backendId: string | undefined, payload: {
    id?: string;
    title: string;
    type: string;
    type_name: string;
    type_color: string;
    date: string;
    start_time: string;
    end_time: string;
    notes?: string;
  }) => {
    // POST /updateDoctorEventSchedule
    try {
      const body: any = { doctor_id: doctorId, ...payload };
      if (backendId) body.id = backendId; // or slot_id depending on backend
      const resp = await fetch("/updateDoctorEventSchedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await resp.json();
      return json;
    } catch (err) {
      console.error("update event error", err);
      return { success: false, error: err };
    }
  };

  const apiDeleteEvent = async (doctorId: string, backendId?: string, localId?: string) => {
    // POST /deleteDoctorEventSchedule
    try {
      const body: any = { doctor_id: doctorId };
      // backendId expected by server; if local-only event, you can pass some local id to delete, but server
      // likely expects backend slot id.
      if (backendId) body.id = backendId;
      else if (localId) body.local_id = localId;
      const resp = await fetch("/deleteDoctorEventSchedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await resp.json();
      return json;
    } catch (err) {
      console.error("delete event error", err);
      return { success: false, error: err };
    }
  };

  // --- load server schedule when doctor changes ---
  useEffect(() => {
    const load = async () => {
      if (!scheduleData.doctor) {
        setServerDays(null);
        return;
      }
      toast.loading("Loading schedule...");
      const data = await apiFetchSchedule(scheduleData.doctor);
      toast.dismiss();
      if (data) {
        setServerDays(data);
      } else {
        setServerDays(null);
        toast.error("Failed to load schedule from server");
      }
    };
    load();
  }, [scheduleData.doctor]);

  // --- helpers to convert server days -> CalendarEvents ---
  const serverDayToEvents = (day: ServerDay): CalendarEvent[] => {
    const dateStr = day.date;
    if (!day.slots || day.is_available !== 1) return [];
    return day.slots.map((slot: ServerSlot, idx) => ({
      id: (slot.id ? String(slot.id) : `${dateStr}-${idx}-${Math.random().toString(36).slice(2)}`),
      backendId: slot.id ? String(slot.id) : undefined,
      source: "remote",
      type: "visit", 
      type_name: slot.type_name || '', 
      type_color: slot.type_color || '', 
      title: slot.title || "Slot",
      date: dateStr,
      startTime: slot.start_time,
      endTime: slot.end_time,
      notes: slot.notes || "",
      doctorName: doctorList.find(d => d.id === scheduleData.doctor)?.name || "",
    }));
  };

    const getEventsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");

    // 1️⃣ Local events stored in UI (created/edited here)
    const local = localEvents.filter(e => e.date === dateStr);

    // 2️⃣ Server events (from fetchDoctorEventSchedule / serverDays)
    const server: CalendarEvent[] = [];
    if (serverDays) {
      const dayData = serverDays.find(d => d.date === dateStr);

      if (dayData && dayData.slots) {
        dayData.slots.forEach((slot, idx) => {
          // convert 24-hour to 12-hour format
          const startTime = format(parse(slot.start_time, "HH:mm:ss", new Date()), "hh:mm a");
          const endTime = format(parse(slot.end_time, "HH:mm:ss", new Date()), "hh:mm a");

          server.push({
            id: `${dateStr}-${idx}`,
            date: dateStr,
            title: slot.title,
            type: slot.type || "",
            type_name: slot.type_name ?? slot.type_name ?? "", 
            type_color: slot.type_color ?? "#ccc",
            notes: slot.notes || "",
            startTime,
            endTime,
            max_appointments: slot.max_appointments,
            source: dayData.source || "server",
          });
        });
      }
    }

    // 3️⃣ Merge local + server events (local first)
    return [...local, ...server];
  };

  // Date range helpers (calendar)
  const handlePrevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const startWeek = startOfWeek(start, { weekStartsOn: 0 });
    const endWeek = endOfWeek(end, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: startWeek, end: endWeek });
  };

  // --- editable date validation (only editable if >= today-7 days) ---
  const isEditableDate = (eventDate: string | Date) => {
    const eventDay = typeof eventDate === "string" ? new Date(eventDate) : eventDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const limit = new Date();
    limit.setDate(today.getDate() - 7);
    limit.setHours(0, 0, 0, 0);
    return eventDay >= limit;
  };

  // --- click handlers ---
  const handleDayClick = (date: Date) => {
    if (!scheduleData.doctor) {
      toast.error("Select Doctor", { description: "Please select a doctor first." });
      return;
    }
    if (!isEditableDate(format(date, "yyyy-MM-dd"))) {
      toast.error("Not editable", { description: "You cannot edit schedules older than 7 days." });
      return;
    }
    setSelectedDate(date);
    setShowDayDetails(true);
  };

  const handleAddEvent = () => {
    if (!scheduleData.doctor) {
      toast.error("Select Doctor", { description: "Please select a doctor first." });
      return;
    }
    setEditingEvent(null);
    setFormData({
      title: "",
      type: "visit",
      date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      startTime: "",
      endTime: "",
      notes: "",
      doctorName: doctorList.find(d => d.id === scheduleData.doctor)?.name || "",
    });
    setShowEventForm(true);
    setShowDayDetails(false);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    if (!isEditableDate(event.date)) {
      toast.error("Cannot edit", { description: "This event is too old to edit." });
      return;
    }
    setEditingEvent(event);
    setFormData({
      title: event.title,
      type: event.type,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      notes: event.notes || "",
      doctorName: event.doctorName || doctorList.find(d => d.id === scheduleData.doctor)?.name || "",
    });
    setShowEventForm(true);
    setShowDayDetails(false);
  };

  const handleDeleteEvent = async (event: CalendarEvent) => {
    if (!isEditableDate(event.date)) {
      toast.error("Cannot delete", { description: "This event is too old to delete." });
      return;
    }
    if (!confirm("Are you sure you want to delete this event?")) return;

    // If it's remote (server slot), call API delete. If local, call delete API or remove locally.
    try {
      toast.loading("Deleting...");
      if (event.source === "remote") {
        const res = await apiDeleteEvent(scheduleData.doctor, event.backendId);
        toast.dismiss();
        if (res?.success) {
          toast.success("Deleted", { description: "Event deleted from server." });
          // refresh server schedule
          const refreshed = await apiFetchSchedule(scheduleData.doctor);
          setServerDays(refreshed || null);
        } else {
          toast.error(res?.message || "Failed to delete on server");
        }
      } else {
        // local event -> attempt delete on server if it has backendId, otherwise remove locally
        if (event.backendId) {
          const res = await apiDeleteEvent(scheduleData.doctor, event.backendId, event.id);
          toast.dismiss();
          if (res?.success) {
            toast.success("Deleted", { description: "Event deleted." });
            setLocalEvents(prev => prev.filter(e => e.id !== event.id));
            // refresh server
            const refreshed = await apiFetchSchedule(scheduleData.doctor);
            setServerDays(refreshed || null);
          } else {
            toast.error(res?.message || "Failed to delete");
          }
        } else {
          // purely local -> remove
          toast.dismiss();
          setLocalEvents(prev => prev.filter(e => e.id !== event.id));
          toast.success("Deleted", { description: "Event removed locally." });
        }
      }
    } catch (err) {
      toast.dismiss();
      console.error(err);
      toast.error("Delete failed");
    }
  };

  // --- time parsing & overlap detection ---
  const parseTimeToMinutes = (time: string) => {
    const [hh, mm] = time.split(":").map(Number);
    return hh * 60 + mm;
  };

  const isTimeSlotAvailable = (dateStr: string, start: string, end: string, excludeId?: string) => {
    if (!start || !end) return false;
    const newStart = parseTimeToMinutes(start);
    const newEnd = parseTimeToMinutes(end);
    if (newStart >= newEnd) return false;

    const dayEvents = getEventsForDate(new Date(dateStr));
    for (const e of dayEvents) {
      if (excludeId && e.id === excludeId) continue;
      const s = parseTimeToMinutes(e.startTime);
      const en = parseTimeToMinutes(e.endTime);
      // overlap if newStart < en && s < newEnd
      if (newStart < en && s < newEnd) return false;
    }
    return true;
  };

  // --- save event (add or update) -->
  const handleSaveEvent = async () => {
    // validations
    if (!formData.title || !formData.date || !formData.startTime || !formData.endTime) {
      toast.error("Missing fields", { description: "Please fill required fields." });
      return;
    }
    if (!scheduleData.doctor) {
      toast.error("Select Doctor", { description: "Please select a doctor first." });
      return;
    }
    if (!isTimeSlotAvailable(formData.date, formData.startTime, formData.endTime, editingEvent?.id)) {
      toast.error("Time conflict", { description: "This time overlaps with another event." });
      return;
    }

    try {
      toast.loading(editingEvent ? "Updating..." : "Saving...");
      // Prepare payload (backend field names)
      const payload = {
        title: formData.title,
        type: formData.type,
        date: formData.date,
        start_time: formData.startTime,
        end_time: formData.endTime,
        notes: formData.notes || "",
      };

      if (editingEvent) {
        // If editing remote event, pass backendId; if editing local with no backendId, we'll call add then delete old local
        const res = await apiUpdateEvent(scheduleData.doctor, editingEvent.backendId, {
          ...(editingEvent.backendId ? {} : { id: editingEvent.id }),
          ...payload,
        });
        toast.dismiss();
        if (res?.success) {
          toast.success("Updated", { description: "Event updated successfully." });
          // if server returns updated schedule or slot id, refresh serverDays
          const refreshed = await apiFetchSchedule(scheduleData.doctor);
          setServerDays(refreshed || null);
          // update localEvents accordingly (if event was local)
          setLocalEvents(prev => prev.map(ev => ev.id === editingEvent.id ? { ...ev, ...formData, id: ev.id } : ev));
        } else {
          toast.error(res?.message || "Update failed");
        }
      } else {
        // add new event
        const res = await apiAddEvent(scheduleData.doctor, payload);
        toast.dismiss();
        if (res?.success) {
          // backend should respond with created id/slot info; if not, we still refresh
          toast.success("Saved", { description: "Event saved to server." });
          const refreshed = await apiFetchSchedule(scheduleData.doctor);
          setServerDays(refreshed || null);

          // If server didn't return the created slot immediately, keep a local copy too (optimistic)
          // but simplest: rely on serverDays refresh for showing event. We'll still remove any stale local events.
          setLocalEvents(prev => prev.filter(ev => !(ev.date === formData.date && ev.startTime === formData.startTime && ev.endTime === formData.endTime && ev.title === formData.title)));
        } else {
          toast.error(res?.message || "Save failed");
        }
      }
    } catch (err) {
      toast.dismiss();
      console.error(err);
      toast.error("Save failed");
    } finally {
      setShowEventForm(false);
      setEditingEvent(null);
      setFormData({ title: "", type: "visit", date: "", startTime: "", endTime: "", notes: "", doctorName: "" });
    }
  };

  // --- calendar derived data ---
  const days = scheduleData.doctor ? getDaysInMonth() : [];
  const selectedDateEvents = scheduleData.doctor && selectedDate ? getEventsForDate(selectedDate) : [];

  // UI render
  return (
    <div className="space-y-6">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-1 doc-calendar">
        <h1 className="text-2xl font-bold text-foreground pb-4">Manage Doctor Calendar</h1>

        <div className="grid grid-cols-1 gap-6">
          <Card className="p-6 shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-1 block">Select Doctor</label>
                <Select
                  value={scheduleData.doctor}
                  onValueChange={(value) => {
                    setScheduleData({ ...scheduleData, doctor: value });
                  }}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder={loadingDoctors ? "Loading doctors..." : "Select a doctor"} />
                  </SelectTrigger>
                  <SelectContent>
                    {doctorList.length > 0 ? doctorList.map(doc => (
                      <SelectItem key={doc.id} value={doc.id}>{doc.name} {doc.specialty ? `(${doc.specialty})` : ""}</SelectItem>
                    )) : (
                      <div className="p-2 text-sm text-gray-500">{loadingDoctors ? "Fetching doctors..." : "No doctors available"}</div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between pt-6 pb-4 gap-4">
                <div className="flex items-center justify-between md:justify-start gap-4">
                  <button onClick={handlePrevMonth} className="p-2 hover:bg-accent rounded-xl transition-all"><ChevronLeft className="h-4 w-4" /></button>
                  <span className="font-bold text-sm md:text-base">{format(currentDate, "MMMM yyyy")}</span>
                  <button onClick={handleNextMonth} className="p-2 hover:bg-accent rounded-xl transition-all"><ChevronRight className="h-4 w-4" /></button>
                </div>
                {/*<Button size="sm" variant="outline" className="ml-auto md:ml-0" onClick={handleAddEvent} disabled={!scheduleData.doctor}>
                  <Plus className="w-4 h-4 mr-2" /> Add Event
                </Button>*/}
              </div>
            </div>
          </Card>
        </div>

       

        <Card className="p-3 md:p-6 border border-gray-200 mt-4">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 md:gap-3 text-center font-semibold text-xs md:text-sm text-muted-foreground mb-2">
            {daysOfWeek.map((d, i) => <div key={i}>{d}</div>)}
          </div>

          {!scheduleData.doctor ? (
            <p className="text-center py-8 text-muted-foreground">
              Please select a doctor to view the calendar.
            </p>
          ) : (
            <div className="grid grid-cols-7 gap-1 md:gap-3">
              {days.map((day, index) => {
                const dayEvents = getEventsForDate(day);
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isTodayDate = isToday(day);

                return (
                  <div
                    key={index}
                    onClick={() => handleDayClick(day)}
                    className={`relative aspect-square md:min-h-[80px] p-1 md:p-2 rounded-lg md:rounded-xl transition-all cursor-pointer ${
                      isTodayDate
                        ? "bg-primary text-white shadow-lg ring-2 ring-primary/50"
                        : isCurrentMonth
                        ? "bg-background hover:bg-accent/50 hover:shadow-md"
                        : "bg-muted/20 text-muted-foreground"
                    }`}
                  >
                    {/* Date number */}
                    <div className={`text-xs md:text-sm font-bold mb-1 ${isTodayDate ? "text-white" : ""}`}>
                      {format(day, "d")}
                    </div>

                    {/* Desktop: show few event previews */}
                    <div className="hidden md:block space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={`text-[12px] px-1.5 py-0.5 rounded font-medium truncate ${isTodayDate ? "bg-white/20 text-white" : getEventBadgeColor(event.type)}`}
                          title={`${event.title} ${event.type ? `- ${event.type}` : ""} (${event.startTime} - ${event.endTime})`}
                        
                          style={{
                            backgroundColor: hexToRgba(event.type_color || "#ccc", 0.7),
                            color: "#fff",
                          }}
                        >
                          <div>
                            {event.title} {event.type_name ? `- ${event.type_name}` : ""}
                          </div>
                          <div className="text-[12px]">
                            ({event.startTime} - {event.endTime})
                          </div>
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className={`text-[10px] text-center ${isTodayDate ? "text-white/80" : "text-muted-foreground"}`}>
                          +{dayEvents.length - 2}
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>


       

        {/* Day details Drawer / Dialog */}
        {isMobile ? (
          <Drawer open={showDayDetails} onOpenChange={setShowDayDetails}>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>
                  {selectedDate && format(selectedDate, "EEEE, MMM d, yyyy")}
                </DrawerTitle>
                <DrawerDescription>
                  {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? "s" : ""}
                </DrawerDescription>
              </DrawerHeader>

              <div className="px-4 pb-4 space-y-3 max-h-[60vh] overflow-y-auto">
                {selectedDateEvents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No events</p>
                ) : (
                  selectedDateEvents.map((event) => (
                    <div key={event.id} className="p-3 rounded-lg border bg-card">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-lg">{getEventIcon(event.type)}</span>
                          <h3 className="font-semibold text-sm truncate">{event.title}</h3>
                          {event.type && <Badge className={`${getEventBadgeColor(event.type)} mb-2`}>{event.type}</Badge>}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>({event.startTime} - {event.endTime})</span>
                        </div>
                        {event.doctorName && <p className="text-xs text-muted-foreground mt-1">{event.doctorName}</p>}
                        {event.notes && <p className="text-xs mt-1">{event.notes}</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <DrawerFooter className="space-y-2">
                <Button onClick={handleAddEvent} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Modify Events
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline" className="w-full">Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog open={showDayDetails} onOpenChange={setShowDayDetails}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
                </DialogTitle>
                <DialogDescription>
                  {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? "s" : ""} scheduled
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 mt-4">
                {selectedDateEvents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No events scheduled</p>
                ) : (
                  selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-2 rounded-lg border bg-card hover:shadow-md transition-shadow"
                      style={{
                        backgroundColor: hexToRgba(event.type_color || "#ccc", 0.7),
                        color: "#fff",
                        textShadow: "1px 2px 4px rgba(0, 0, 0, 0.6)",
                      }}
                    >
                      <div className="flex flex-col gap-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{event.title}</h3>
                          <img src={PaIcons.clock1} alt="clock" className="w-4 h-4" />
                          <span>{event.startTime} - {event.endTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white text-muted-foreground mb-1 capitalize">
                          {event.notes && <p className="text-sm mt-1">{event.notes}</p>}
                        </div>
                      </div>
                    </div>

                  ))
                )}
              </div>

              <DialogFooter className="mt-6">
                <Button onClick={handleAddEvent}>
                  <Plus className="w-4 h-4 mr-2" />
                  Modify Events
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}


      </main>
    </div>
  );
}
