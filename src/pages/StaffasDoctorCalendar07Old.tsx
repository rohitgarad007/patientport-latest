// StaffasDoctorCalendar.tsx
import { useState, useEffect } from "react";
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
import { fetchDoctorList, fetchDoctorEventSchedule } from "@/services/SfstaffUseService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CalendarEvent {
  id: string;
  type: "visit" | "call" | "task" | "exam" | "surgery" | "meeting" | "holiday" | "personal";
  title: string;
  date: string; // yyyy-MM-dd
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  notes?: string;
  doctorName?: string;
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

interface SavedScheduleSlot {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  maxAppointments?: number;
  notes?: string;
}

interface SavedScheduleDay {
  date: string;
  weekday: string;
  is_available: number;
  source: string;
  slotList: SavedScheduleSlot[];
}

interface SavedSchedule {
  doctor: string;
  slots: SavedScheduleDay[];
}

export default function StaffasDoctorCalendar() {
  const [scheduleData, setScheduleData] = useState<{ doctor: string }>({ doctor: "" });
  const [doctorList, setDoctorList] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [savedSchedule, setSavedSchedule] = useState<SavedSchedule | null>(null);

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const stored = localStorage.getItem("calendarEvents2");
    return stored ? JSON.parse(stored) : [];
  });

  const [currentDate, setCurrentDate] = useState(new Date());
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

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Fetch Doctors
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

  // Fetch saved schedule (90 days from API)
  useEffect(() => {
    if (!scheduleData.doctor) {
      setSavedSchedule(null);
      return;
    }

    const loadSchedule = async () => {
      try {
        toast.loading("Loading schedule...");
        const res = await fetchDoctorEventSchedule(scheduleData.doctor);
        toast.dismiss();
        if (res?.success && Array.isArray(res.data)) {
          const slotsData: SavedScheduleDay[] = res.data.map((dayData: any) => ({
            date: dayData.date,
            weekday: dayData.weekday,
            is_available: dayData.is_available,
            source: dayData.source,
            slotList: (dayData.slots || []).map((slot: any) => ({
              id: Date.now().toString() + Math.random().toString(36).substring(2),
              title: slot.title,
              startTime: slot.start_time,
              endTime: slot.end_time,
              maxAppointments: Number(slot.max_appointments),
              notes: slot.notes || "",
            })),
          }));
          setSavedSchedule({ doctor: scheduleData.doctor, slots: slotsData });
        } else {
          setSavedSchedule(null);
        }
      } catch (err) {
        toast.dismiss();
        console.error(err);
        setSavedSchedule(null);
      }
    };

    loadSchedule();
  }, [scheduleData.doctor]);

  // Persist events locally
  useEffect(() => {
    localStorage.setItem("calendarEvents2", JSON.stringify(events));
  }, [events]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // only current month view (with week padding)
  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const startWeek = startOfWeek(start, { weekStartsOn: 0 });
    const endWeek = endOfWeek(end, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: startWeek, end: endWeek });
  };

  const getEventsForDate = (date: Date) => {
    if (!scheduleData.doctor) return [];

    const dateStr = format(date, "yyyy-MM-dd");
    const normalEvents = events.filter(e => e.date === dateStr);

    const savedEvents: CalendarEvent[] = [];
    if (savedSchedule) {
      const dayData = savedSchedule.slots.find(d => d.date === dateStr);
      if (dayData && dayData.is_available === 1) {
        dayData.slotList.forEach(slot => {
          savedEvents.push({
            id: slot.id,
            type: "visit",
            title: slot.title,
            date: dateStr,
            startTime: slot.startTime,
            endTime: slot.endTime,
            notes: slot.notes,
            doctorName: doctorList.find(d => d.id === savedSchedule.doctor)?.name || "",
          });
        });
      }
    }

    return [...normalEvents, ...savedEvents];
  };


  const isEditableDate = (eventDate: string | Date) => {
    const today = new Date();
    const editableLimit = new Date();
    editableLimit.setDate(today.getDate() - 7); // 7 days before today
    const eventDay = new Date(eventDate);
    return eventDay >= editableLimit; // only allow if event date is within last 7 days or future
  };

  /*const isEditableDate = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // remove time portion

  const limitDate = new Date();
  limitDate.setDate(today.getDate() - 7); // 7 days before today
  limitDate.setHours(0, 0, 0, 0);

  return date >= limitDate;
};*/
  

  const handleAddEvent = () => {
    if (!scheduleData.doctor) {
      toast.error("Select Doctor", { description: "Please select a doctor first." });
      return;
    }
    setEditingEvent(null);
    setFormData({
      title: "",
      type: "visit",
      date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
      startTime: "",
      endTime: "",
      notes: "",
      doctorName: doctorList.find(d => d.id === scheduleData.doctor)?.name || "",
    });
    setShowEventForm(true);
    setShowDayDetails(false);
  };

  

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

  const handleDeleteEvent = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    if (!isEditableDate(event.date)) {
      toast.error("Cannot delete", { description: "This event is too old to delete." });
      return;
    }

    if (confirm("Are you sure you want to delete this event?")) {
      setEvents(events.filter(e => e.id !== eventId));
      toast.success("Event deleted", { description: "The event has been removed from the calendar." });
    }
  };


    const isTimeSlotAvailable = (dateStr: string, start: string, end: string, excludeId?: string) => {
    const dayEvents = getEventsForDate(new Date(dateStr));
    const newStart = parseTime(start);
    const newEnd = parseTime(end);

    return dayEvents.every((e) => {
      if (excludeId && e.id === excludeId) return true; // ignore current event if editing
      const eStart = parseTime(e.startTime);
      const eEnd = parseTime(e.endTime);
      return newEnd <= eStart || newStart >= eEnd; // no overlap
    });
  };

  // Helper: convert HH:mm to minutes
  const parseTime = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };



  const handleSaveEvent = () => {
    if (!formData.title || !formData.date || !formData.startTime || !formData.endTime) {
      toast.error("Missing fields", { description: "Please fill in all required fields." });
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

    if (editingEvent) {
      setEvents(events.map(e => e.id === editingEvent.id ? { ...formData, id: e.id } : e));
      toast.success("Event updated", { description: "The event has been updated successfully." });
    } else {
      setEvents([...events, { ...formData, id: Date.now().toString() }]);
      toast.success("Event added", { description: "The event has been added to the calendar." });
    }

    setShowEventForm(false);
    setFormData({ title: "", type: "visit", date: "", startTime: "", endTime: "", notes: "", doctorName: "" });
    setEditingEvent(null);
  };


  const days = scheduleData.doctor ? getDaysInMonth() : [];
  const selectedDateEvents = scheduleData.doctor && selectedDate ? getEventsForDate(selectedDate) : [];

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
                  onValueChange={(value) => setScheduleData({ ...scheduleData, doctor: value })}
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
                <Button size="sm" variant="outline" className="ml-auto md:ml-0" onClick={handleAddEvent} disabled={!scheduleData.doctor}>
                  <Plus className="w-4 h-4 mr-2" /> Add Event
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Calendar */}
        <Card className="p-3 md:p-6 border border-gray-200 mt-4">
          <div className="grid grid-cols-7 gap-1 md:gap-3 text-center font-semibold text-xs md:text-sm text-muted-foreground mb-2">
            {daysOfWeek.map((d, i) => <div key={i}>{d}</div>)}
          </div>

          {!scheduleData.doctor ? (
            <p className="text-center py-8 text-muted-foreground">Please select a doctor to view the calendar.</p>
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
                    <div className={`text-xs md:text-sm font-bold mb-1 ${isTodayDate ? "text-white" : ""}`}>{format(day, "d")}</div>

                    {/* Mobile dots omitted for brevity in markup; desktop event previews */}
                    {dayEvents.length > 0 && (
                      <div className="hidden md:block space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div key={event.id} className={`text-[10px] px-1.5 py-0.5 rounded font-medium truncate ${isTodayDate ? "bg-white/20 text-white" : getEventBadgeColor(event.type)}`}>
                            {getEventIcon(event.type)} {event.startTime}
                          </div>
                        ))}
                        {dayEvents.length > 2 && <div className={`text-[10px] text-center ${isTodayDate ? "text-white/80" : "text-muted-foreground"}`}>+{dayEvents.length - 2}</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

      {/* Mobile: Use Drawer, Desktop: Use Dialog */}
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
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-lg">{getEventIcon(event.type)}</span>
                          <h3 className="font-semibold text-sm truncate">{event.title}</h3>
                        </div>
                        <Badge className={`${getEventBadgeColor(event.type)} mb-2`}>
                          {event.type}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{event.startTime} - {event.endTime}</span>
                        </div>
                        {event.doctorName && (
                          <p className="text-xs text-muted-foreground mt-1">{event.doctorName}</p>
                        )}
                        {event.notes && (
                          <p className="text-xs mt-2">{event.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditEvent(event)}
                          disabled={!isEditableDate(event.date)}
                          className={!isEditableDate(event.date) ? "opacity-50 cursor-not-allowed h-8 w-8" : "h-8 w-8"}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteEvent(event.id)}
                          disabled={!isEditableDate(event.date)}
                          className={!isEditableDate(event.date) ? "opacity-50 cursor-not-allowed h-8 w-8" : "h-8 w-8"}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <DrawerFooter>
              <Button onClick={handleAddEvent} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Event
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
                  <div key={event.id} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{getEventIcon(event.type)}</span>
                          <h3 className="font-semibold">{event.title}</h3>
                          <Badge className={getEventBadgeColor(event.type)}>{event.type}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Clock className="w-4 h-4" />
                          <span>{event.startTime} - {event.endTime}</span>
                        </div>
                        {event.doctorName && (
                          <p className="text-sm text-muted-foreground">Doctor: {event.doctorName}</p>
                        )}
                        {event.notes && <p className="text-sm mt-2">{event.notes}</p>}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditEvent(event)}
                          disabled={!isEditableDate(event.date)}
                          className={!isEditableDate(event.date) ? "opacity-50 cursor-not-allowed" : ""}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteEvent(event.id)}
                          disabled={!isEditableDate(event.date)}
                          className={!isEditableDate(event.date) ? "opacity-50 cursor-not-allowed" : ""}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <DialogFooter className="mt-6">
              <Button onClick={handleAddEvent}>
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}


        {/* Event Form - Drawer (mobile) & Dialog (desktop) - your provided design preserved */}
        {isMobile ? (
          <Drawer open={showEventForm} onOpenChange={setShowEventForm}>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>{editingEvent ? "Edit Event" : "Add New Event"}</DrawerTitle>
                <DrawerDescription>Fill in the event details</DrawerDescription>
              </DrawerHeader>

              <div className="px-4 pb-4 space-y-3 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="text-sm font-medium mb-1 block">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border bg-background"
                    placeholder="Event title"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as CalendarEvent["type"] })}
                    className="w-full px-3 py-2 rounded-lg border bg-background"
                  >
                    <option value="visit">Patient Visit</option>
                    <option value="surgery">Surgery</option>
                    <option value="call">Follow-up Call</option>
                    <option value="meeting">Staff Meeting</option>
                    <option value="exam">Exam/Review</option>
                    <option value="task">Task</option>
                    <option value="holiday">Holiday</option>
                    <option value="personal">Personal Event</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border bg-background"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Start *</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">End *</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border bg-background"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Doctor Name</label>
                  <input
                    type="text"
                    value={formData.doctorName}
                    readOnly
                    className="w-full px-3 py-2 rounded-lg border bg-background/50 cursor-not-allowed"
                    placeholder="Dr. Name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border bg-background min-h-[80px]"
                    placeholder="Additional notes"
                  />
                </div>
              </div>

              <DrawerFooter>
                <Button onClick={handleSaveEvent} className="w-full">Save Event</Button>
                <DrawerClose asChild>
                  <Button variant="outline" className="w-full">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
            <DialogContent className="w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
              <DialogHeader>
                <DialogTitle>{editingEvent ? "Edit Event" : "Add New Event"}</DialogTitle>
                <DialogDescription>Fill in the details for the event</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border bg-background"
                      placeholder="e.g., Patient Visit - John Doe"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as CalendarEvent["type"] })}
                      className="w-full px-3 py-2 rounded-lg border bg-background"
                    >
                      <option value="visit">Patient Visit</option>
                      <option value="surgery">Surgery</option>
                      <option value="call">Follow-up Call</option>
                      <option value="meeting">Staff Meeting</option>
                      <option value="exam">Exam/Review</option>
                      <option value="task">Task</option>
                      <option value="holiday">Holiday</option>
                      <option value="personal">Personal Event</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Date *</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border bg-background"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Start Time *</label>
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border bg-background"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">End Time *</label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border bg-background"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Doctor Name</label>
                  <input
                    type="text"
                    value={formData.doctorName}
                    readOnly
                    className="w-full px-3 py-2 rounded-lg border bg-background/50 cursor-not-allowed"
                    placeholder="Dr. Smith"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border bg-background"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button onClick={handleSaveEvent} className="w-full sm:w-auto">
                  {editingEvent ? "Update" : "Save"} Event
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
}
