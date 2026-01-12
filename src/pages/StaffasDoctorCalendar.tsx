
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
import { fetchDoctorList, fetchDoctorEventSchedule, fetchShiftList, fetchEventTypeList, saveDoctorEventSchedule, deleteDoctorEvent } from "@/services/SfstaffUseService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaIcons } from "@/components/icons/PaIcons";

// NEW: inputs & labels for edit modal
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


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

  // NEW: dynamic lists for edit modal
  const [shiftList, setShiftList] = useState<any[]>([]);
  const [eventTypeList, setEventTypeList] = useState<any[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [dayEditEvents, setDayEditEvents] = useState<any[]>([]);
  const [originalDayEditEvents, setOriginalDayEditEvents] = useState<any[]>([]);

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

  // NEW: fetch shifts & event types for edit modal
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [shiftsRes, typesRes] = await Promise.all([fetchShiftList(), fetchEventTypeList()]);
        if (shiftsRes?.success && Array.isArray(shiftsRes.data)) setShiftList(shiftsRes.data);
        if (typesRes?.success && Array.isArray(typesRes.data)) setEventTypeList(typesRes.data);
      } catch (e) {
        console.error(e);
      }
    };
    loadMeta();
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
    const overriddenBackendIds = new Set(local.map(e => e.backendId).filter(Boolean) as string[]);

    // 2️⃣ Server events (from fetchDoctorEventSchedule / serverDays)
    const server: CalendarEvent[] = [];
    if (serverDays) {
      const dayData = serverDays.find(d => d.date === dateStr);

      if (dayData && dayData.slots) {
        dayData.slots.forEach((slot, idx) => {
          // convert 24-hour to 12-hour format
          const startTime = format(parse(slot.start_time, "HH:mm:ss", new Date()), "hh:mm a");
          const endTime = format(parse(slot.end_time, "HH:mm:ss", new Date()), "hh:mm a");

          // skip if overridden by local
          if (slot.id && overriddenBackendIds.has(String(slot.id))) return;

          server.push({
            id: `${dateStr}-${idx}`,
            backendId: slot.id ? String(slot.id) : undefined,
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


  // --- time parsing & overlap detection ---
  const parseTimeToMinutes = (time: string) => {
    const [hh, mm] = time.split(":").map(Number);
    return hh * 60 + mm;
  };

 
  // --- calendar derived data ---
  const days = scheduleData.doctor ? getDaysInMonth() : [];
  const selectedDateEvents = scheduleData.doctor && selectedDate ? getEventsForDate(selectedDate) : [];

  // NEW: Edit Events modal helpers (inside component scope)
  const to12Hour = (time: string) => {
    if (!time) return { hour: "12", minute: "00", period: "AM" };
    if (time.includes(" ")) {
      const [hm, p] = time.split(" ");
      const [h, m] = hm.split(":");
      return { hour: h.padStart(2, "0"), minute: m.padStart(2, "0"), period: p.toUpperCase() };
    }
    const [hStr, mStr] = time.split(":");
    let h = Number(hStr);
    const period = h >= 12 ? "PM" : "AM";
    const hour = h % 12 === 0 ? 12 : h % 12;
    return { hour: String(hour).padStart(2, "0"), minute: mStr.padStart(2, "0"), period };
  };
  const to24Hour = (hour: string, minute: string, period: "AM" | "PM") => {
    let h = Number(hour);
    if (period === "PM" && h < 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}:${minute}`;
  };

  // Validation helpers
  const toMinutesFrom12 = (hour: string, minute: string, period: "AM" | "PM") => {
    const hhmm = to24Hour(hour, minute, period);
    const [hh, mm] = hhmm.split(":").map(Number);
    return hh * 60 + mm;
  };
  const getShiftBounds = (shiftId?: string) => {
    if (!shiftId) return null;
    const s = shiftList.find((x: any) => x.shiftuid === shiftId);
    if (!s) return null;
    const [sh, sm] = (s.start_time || "00:00").slice(0,5).split(":").map(Number);
    const [eh, em] = (s.end_time || "23:59").slice(0,5).split(":").map(Number);
    return { start: sh * 60 + sm, end: eh * 60 + em };
  };
  const eventsOverlap = (a: any, b: any) => {
    const aStart = toMinutesFrom12(a.startHour, a.startMinute, a.startPeriod);
    const aEnd = toMinutesFrom12(a.endHour, a.endMinute, a.endPeriod);
    const bStart = toMinutesFrom12(b.startHour, b.startMinute, b.startPeriod);
    const bEnd = toMinutesFrom12(b.endHour, b.endMinute, b.endPeriod);
    return aStart < bEnd && bStart < aEnd;
  };
  const validateEvent = (candidate: any, allEvents: any[]) => {
    const startMin = toMinutesFrom12(candidate.startHour, candidate.startMinute, candidate.startPeriod);
    const endMin = toMinutesFrom12(candidate.endHour, candidate.endMinute, candidate.endPeriod);
    if (startMin >= endMin) {
      toast.error("Start time must be before end time");
      return false;
    }
    const bounds = getShiftBounds(candidate.shiftId);
    if (bounds) {
      if (startMin < bounds.start || endMin > bounds.end) {
        toast.error("Time must be within selected shift bounds");
        return false;
      }
    }
    // overlap with others
    for (const ev of allEvents) {
      if (ev.id !== candidate.id && eventsOverlap(candidate, ev)) {
        toast.error("Events cannot overlap");
        return false;
      }
    }
    return true;
  };
  const validateAll = (events: any[]) => {
    for (let i = 0; i < events.length; i++) {
      if (!validateEvent(events[i], events.filter((_, idx) => idx !== i))) return false;
    }
    return true;
  };

  const updateEditEventShift = (id: string, shiftId: string) => {
    const shift = shiftList.find((s: any) => s.shiftuid === shiftId);
    if (!shift) return;
    setDayEditEvents((prev) => prev.map((e) =>
      e.id === id
        ? {
            ...e,
            shiftId,
            title: shift.shift_name,
            startHour: to12Hour(shift.start_time).hour,
            startMinute: to12Hour(shift.start_time).minute,
            startPeriod: to12Hour(shift.start_time).period,
            endHour: to12Hour(shift.end_time).hour,
            endMinute: to12Hour(shift.end_time).minute,
            endPeriod: to12Hour(shift.end_time).period,
          }
        : e
    ));
  };

  const updateEditEventField = (id: string, field: string, value: any) => {
    setDayEditEvents((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, [field]: value } : e));
      const candidate = next.find((e) => e.id === id);
      if (!candidate) return prev;
      const isTimeField = ["startHour","startMinute","startPeriod","endHour","endMinute","endPeriod"].includes(field);
      if (!isTimeField) return next;
      if (!validateEvent(candidate, next.filter((ev) => ev.id !== id))) return prev;
      return next;
    });
  };

  const saveEditedEvents = async () => {
    if (!selectedDate) return;
    // Validate all before saving
    if (!validateAll(dayEditEvents)) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const payloadEvents = dayEditEvents.map((e) => {
      const startHHMM = to24Hour(e.startHour, e.startMinute, e.startPeriod);
      const endHHMM = to24Hour(e.endHour, e.endMinute, e.endPeriod);
      return {
        id: e.backendId || undefined,
        date: e.date || dateStr,
        title: e.title,
        type_name: e.eventTypeId ? (eventTypeList.find((t: any) => String(t.eventuid || t.id) === String(e.eventTypeId))?.name || e.type_name) : e.type_name,
        type_color: e.type_color,
        start_time: `${startHHMM}:00`,
        end_time: `${endHHMM}:00`,
        notes: e.notes,
        max_appointments: e.maxAppointments,
        shiftuid: e.shiftId || undefined,
        eventuid: e.eventTypeId || undefined,
      };
    });

    try {
      const res = await saveDoctorEventSchedule({ doctorId: scheduleData.doctor, date: dateStr, events: payloadEvents });
      if (res?.success) {
        toast.success("Changes saved to server");
        // Refresh server days
        const refreshed = await apiFetchSchedule(scheduleData.doctor);
        setServerDays(refreshed || null);
        // Clear local overrides for this date
        setLocalEvents((prev) => prev.filter((ev) => ev.date !== dateStr));
        setShowEditModal(false);
        setShowDayDetails(true);
      } else {
        toast.error(res?.message || "Failed to save changes");
      }
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error while saving");
    }
  };

  const handleDeleteEditEvent = async (id: string) => {
    // Old server-side delete replaced by temp removal per new requirement
    setDayEditEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const addEditSlot = () => {
    if (!selectedDate) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const newId = `tmp-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    setDayEditEvents((prev) => [
      ...prev,
      {
        id: newId,
        backendId: undefined,
        date: dateStr,
        title: "",
        shiftId: "",
        eventTypeId: "",
        startHour: "09",
        startMinute: "00",
        startPeriod: "AM",
        endHour: "10",
        endMinute: "00",
        endPeriod: "AM",
        maxAppointments: 10,
        notes: "",
        type_name: "",
        type_color: "",
        source: "local",
      },
    ]);
  };

  const openEditModal = () => {
    if (!selectedDate) return;
    const events = getEventsForDate(selectedDate).map((ev) => {
      const start = to12Hour(ev.startTime);
      const end = to12Hour(ev.endTime);

      let shiftId = "";
      let title = ev.title || "";
      const evStart24 = to24Hour(start.hour, start.minute, start.period as "AM" | "PM");
      const evEnd24 = to24Hour(end.hour, end.minute, end.period as "AM" | "PM");
      const match = shiftList.find((s: any) => {
        const ss = s.start_time?.slice(0,5);
        const ee = s.end_time?.slice(0,5);
        return evStart24 >= ss && evEnd24 <= ee;
      });
      if (match) { shiftId = match.shiftuid; title = match.shift_name; }

      let eventTypeId = "";
      if (ev.type_name) {
        const t = eventTypeList.find((et: any) => (et.eventuid || et.id) && et.name?.toLowerCase() === ev.type_name?.toLowerCase());
        if (t) eventTypeId = String(t.eventuid || t.id);
      }

      return {
        id: ev.id,
        backendId: ev.backendId,
        date: ev.date,
        title,
        shiftId,
        eventTypeId,
        startHour: start.hour,
        startMinute: start.minute,
        startPeriod: start.period,
        endHour: end.hour,
        endMinute: end.minute,
        endPeriod: end.period,
        maxAppointments: Number(ev.max_appointments || 10),
        notes: ev.notes || "",
        type_name: ev.type_name,
        type_color: ev.type_color,
        source: ev.source,
      };
    });
    setDayEditEvents(events);
    setOriginalDayEditEvents(events);
    setShowDayDetails(false);
    setShowEditModal(true);
  };



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

                    {/* ---------- MOBILE VIEW ---------- */}
                    <div className="md:hidden flex flex-col gap-1">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className="text-[10px] rounded px-1 py-0.5 font-medium"
                          style={{
                            backgroundColor: hexToRgba(event.type_color || "#ccc", 0.7),
                            color: "#fff",
                          }}
                          title={`${event.title} (${event.startTime} - ${event.endTime})`}
                        >
                          {event.type_name || event.title}
                        </div>

                      ))}
                    </div>


                    {/* ---------- DESKTOP / LARGE SCREEN VIEW ---------- */}
                    <div className="hidden md:flex flex-col gap-1 max-h-[calc(100%-1.5rem)] overflow-hidden">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={`text-[12px] px-1.5 py-0.5 rounded font-medium truncate ${
                            isTodayDate ? "bg-white/20 text-white" : getEventBadgeColor(event.type)
                          }`}
                          title={`${event.title} ${event.type_name ? `- ${event.type_name}` : ""} (${event.startTime} - ${event.endTime})`}
                          style={{
                            backgroundColor: hexToRgba(event.type_color || "#ccc", 0.7),
                            color: "#fff",
                          }}
                        >
                          <div className="truncate">
                            {event.title} {event.type_name ? `- ${event.type_name}` : ""}
                          </div>
                          <div className="text-[12px]">
                            ({event.startTime} - {event.endTime})
                          </div>
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div
                          className={`text-[10px] text-center ${
                            isTodayDate ? "text-white/80" : "text-muted-foreground"
                          }`}
                        >
                          +{dayEvents.length - 2} more
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
                          {event.type_name && (
                          <Badge
                            style={{
                              backgroundColor: hexToRgba(
                                event.type_color || "#ccc",
                                0.6
                              ),
                            }}
                          >
                            {event.type_name}
                          </Badge>
                        )}
                        </div>
                        <div className="flex items-center gap-2 mb-1">
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

              <DrawerFooter className="space-y-2">
                <Button  className="w-full" onClick={openEditModal}>
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
              <DialogHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                
                <div>
                  <DialogTitle>
                    {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedDateEvents.length} event
                    {selectedDateEvents.length !== 1 ? "s" : ""} scheduled
                  </DialogDescription>
                </div>

                {/* Right side - Button */}
                <Button className="ml-auto sm:ml-0" style={{ marginRight: "25px" }} onClick={openEditModal}>
                  <Plus className="w-4 h-4 mr-2" />
                  Modify Events
                </Button>
              </DialogHeader>


              <div className="space-y-3 mt-0">
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
                          {event.type_name && (
                          <Badge
                            style={{
                              backgroundColor: hexToRgba(
                                event.type_color || "#ccc",
                                0.6
                              ),
                            }}
                          >
                            {event.type_name}
                          </Badge>
                        )}
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

            </DialogContent>
          </Dialog>
        )}


        {/* Edit Events Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Events</DialogTitle>
              <DialogDescription>
                {selectedDate ? `${format(selectedDate, "EEEE, MMMM d, yyyy")}` : "Select a date to edit events"}
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-end mb-3">
              <Button size="sm" onClick={addEditSlot}>
                <Plus className="w-4 h-4 mr-1" /> Add Slot
              </Button>
            </div>

            {dayEditEvents.length === 0 ? (
              <p className="text-muted-foreground">No events available to edit for this date.</p>
            ) : (
              <div className="space-y-4">
                {dayEditEvents.map((e) => (
                  <div key={e.id} className="rounded-lg border p-3 space-y-3">
                    <div className="flex items-center justify-end">
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteEditEvent(e.id)}>
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Shift / Title</Label>
                        <Select value={e.shiftId || ""} onValueChange={(v) => updateEditEventShift(e.id, v)}>
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Select shift" />
                          </SelectTrigger>
                          <SelectContent>
                            {shiftList.length > 0 ? (
                              shiftList.map((s: any) => (
                                <SelectItem key={s.shiftuid} value={s.shiftuid}>{s.shift_name}</SelectItem>
                              ))
                            ) : (
                              <div className="p-2 text-sm text-gray-500">No shifts available</div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Event Type</Label>
                        <Select value={e.eventTypeId || ""} onValueChange={(v) => updateEditEventField(e.id, "eventTypeId", v)}>
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                          <SelectContent>
                            {eventTypeList.length > 0 ? (
                              eventTypeList.map((t: any) => (
                                <SelectItem key={(t.eventuid || t.id)} value={String(t.eventuid || t.id)}>{t.name}</SelectItem>
                              ))
                            ) : (
                              <div className="p-2 text-sm text-gray-500">No event types available</div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Start and End Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Start Time</Label>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                          <Select value={e.startHour} onValueChange={(v) => updateEditEventField(e.id, "startHour", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {["01","02","03","04","05","06","07","08","09","10","11","12"].map((h) => (
                                <SelectItem key={h} value={h}>{h}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select value={e.startMinute} onValueChange={(v) => updateEditEventField(e.id, "startMinute", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {["00","15","30","45"].map((m) => (
                                <SelectItem key={m} value={m}>{m}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select value={e.startPeriod} onValueChange={(v) => updateEditEventField(e.id, "startPeriod", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AM">AM</SelectItem>
                              <SelectItem value="PM">PM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>End Time</Label>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                          <Select value={e.endHour} onValueChange={(v) => updateEditEventField(e.id, "endHour", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {["01","02","03","04","05","06","07","08","09","10","11","12"].map((h) => (
                                <SelectItem key={h} value={h}>{h}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select value={e.endMinute} onValueChange={(v) => updateEditEventField(e.id, "endMinute", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {["00","15","30","45"].map((m) => (
                                <SelectItem key={m} value={m}>{m}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select value={e.endPeriod} onValueChange={(v) => updateEditEventField(e.id, "endPeriod", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AM">AM</SelectItem>
                              <SelectItem value="PM">PM</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Max appointments and Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Max Appointments</Label>
                        <Input type="number" min={0} value={e.maxAppointments ?? 0} onChange={(ev) => updateEditEventField(e.id, "maxAppointments", Number(ev.target.value))} />
                      </div>
                      <div>
                        <Label>Notes</Label>
                        <Input value={e.notes || ""} onChange={(ev) => updateEditEventField(e.id, "notes", ev.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <DialogFooter>
              <Button onClick={saveEditedEvents}>Save Changes</Button>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


      </main>
    </div>
  );
}
