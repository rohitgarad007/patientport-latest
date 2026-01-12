import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2, Clock, Calendar as CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isToday, startOfWeek, endOfWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { fetchDoctorList, saveDoctorSchedule, fetchDoctorEventSchedule } from "@/services/SfstaffUseService";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CalendarEvent {
  id: string;
  type: "visit" | "call" | "task" | "exam" | "surgery" | "meeting" | "holiday" | "personal";
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  doctorName?: string;
}

const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
const daysOfWeekFull = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const initialEvents: CalendarEvent[] = [
  { id: "1", type: "visit", title: "Patient Visit - Olivia Wild", date: "2025-10-01", startTime: "09:00", endTime: "10:00", notes: "Regular checkup", doctorName: "Dr. Lopez" },
  { id: "2", type: "visit", title: "Patient Visit - John Doe", date: "2025-10-01", startTime: "10:30", endTime: "11:30", doctorName: "Dr. Lopez" },
  { id: "3", type: "call", title: "Follow-up Call - I. Flatova", date: "2025-10-01", startTime: "14:00", endTime: "14:30", doctorName: "Dr. Smith" },
  { id: "4", type: "exam", title: "Review Test Results", date: "2025-10-02", startTime: "09:00", endTime: "10:00", doctorName: "Dr. Lopez" },
  { id: "5", type: "visit", title: "Patient Visit - Sarah Chen", date: "2025-10-07", startTime: "11:00", endTime: "12:00", doctorName: "Dr. Lopez" },
  { id: "6", type: "surgery", title: "Surgery - Emergency", date: "2025-10-07", startTime: "15:00", endTime: "17:00", notes: "Operating Room 2", doctorName: "Dr. Lopez" },
  { id: "7", type: "call", title: "Patient Follow-up", date: "2025-10-08", startTime: "10:00", endTime: "10:30", doctorName: "Dr. Smith" },
  { id: "8", type: "visit", title: "Patient Visit - Mike Ross", date: "2025-10-09", startTime: "09:30", endTime: "10:30", doctorName: "Dr. Lopez" },
  { id: "9", type: "meeting", title: "Staff Meeting", date: "2025-10-13", startTime: "13:00", endTime: "14:00", notes: "Monthly review" },
  { id: "10", type: "call", title: "Insurance Call", date: "2025-10-13", startTime: "15:00", endTime: "15:30", doctorName: "Dr. Smith" },
  { id: "11", type: "task", title: "Administrative Task", date: "2025-10-15", startTime: "10:00", endTime: "11:00" },
  { id: "12", type: "visit", title: "Patient Visit - J. Parkins", date: "2025-10-13", startTime: "09:00", endTime: "10:00", doctorName: "Dr. Lopez" },
  { id: "13", type: "visit", title: "New Patient Consultation", date: "2025-10-21", startTime: "11:00", endTime: "12:00", doctorName: "Dr. Lopez" },
  { id: "14", type: "exam", title: "Exam Preparation", date: "2025-10-22", startTime: "09:00", endTime: "10:00", doctorName: "Dr. Lopez" },
  { id: "15", type: "task", title: "Review Patient Files", date: "2025-10-22", startTime: "14:00", endTime: "15:00" },
  { id: "16", type: "call", title: "Call - M. Datsyuk", date: "2025-10-27", startTime: "10:00", endTime: "10:30", doctorName: "Dr. Smith" },
  { id: "17", type: "exam", title: "Get Lab Results", date: "2025-10-28", startTime: "11:00", endTime: "12:00", doctorName: "Dr. Lopez" },
  { id: "18", type: "holiday", title: "Doctor's Day Off", date: "2025-10-25", startTime: "00:00", endTime: "23:59" },
];

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

interface Doctor {
  id: string;
  name: string;
  specialty?: string;
}

interface ScheduleData {
  doctor: string;
}
interface SavedSchedule {
  doctor: string;
  selectedWeekdays: string[];
  slots: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    maxAppointments?: number;
    weekday?: string;
  }[];
}

export default function StaffasDoctorCalendar() {

  const [scheduleData, setScheduleData] = useState<{ doctor: string }>({ doctor: "" });

  const [doctorList, setDoctorList] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const [savedSchedule, setSavedSchedule] = useState<SavedSchedule | null>(null);

  // ✅ Fetch Doctors Dynamically
 useEffect(() => {
  const loadDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const response = await fetchDoctorList();
      if (response?.success && Array.isArray(response.data)) {
        setDoctorList(response.data.map((d: any) => ({
          id: d.docuid,
          name: d.name,
          specialty: d.specialty || ""
        })));
      } else toast.error("Invalid doctor data");
    } catch (err) {
      console.error(err); toast.error("Failed to fetch doctors");
    } finally { setLoadingDoctors(false); }
  };
  loadDoctors();
}, []);


  useEffect(() => {
    const loadSavedSchedule = async () => {
      if (!scheduleData.doctor) return;

      try {
        toast.loading("Loading saved schedule...");
        const response = await fetchDoctorEventSchedule(scheduleData.doctor);
        toast.dismiss();

        if (response?.success && Array.isArray(response.data)) {
          // Prepare weekdays and slots
          const allWeekdays: string[] = [];
          const allSlots: any[] = [];

          response.data.forEach((dayData: any) => {
            const weekday = dayData.weekday;
            if (weekday) allWeekdays.push(weekday);

            const slots = dayData.slots || [];
            slots.forEach((slot: any) => {
              allSlots.push({
                id: Date.now().toString() + Math.random().toString(36).substring(2),
                title: slot.title,
                startTime: slot.start_time,
                endTime: slot.end_time,
                maxAppointments: Number(slot.max_appointments),
                weekday, // optional: to track which day it belongs to
              });
            });
          });

          setSavedSchedule({
            doctor: scheduleData.doctor,
            selectedWeekdays: allWeekdays,
            slots: allSlots,
          });
        } else {
          setSavedSchedule(null);
        }
      } catch (error) {
        toast.dismiss();
        console.error("Error fetching saved schedule:", error);
        setSavedSchedule(null);
      }
    };

    loadSavedSchedule();
  }, [scheduleData.doctor]);






  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 4));
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const stored = localStorage.getItem("calendarEvents2");
    return stored ? JSON.parse(stored) : initialEvents;
  });
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

  useEffect(() => {
    localStorage.setItem("calendarEvents2", JSON.stringify(events));
  }, [events]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const startWeek = startOfWeek(start, { weekStartsOn: 0 });
    const endWeek = endOfWeek(end, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: startWeek, end: endWeek });
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return events.filter(event => event.date === dateStr);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setShowDayDetails(true);
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setFormData({
      title: "",
      type: "visit",
      date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
      startTime: "",
      endTime: "",
      notes: "",
      doctorName: "",
    });
    setShowEventForm(true);
    setShowDayDetails(false);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      type: event.type,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      notes: event.notes || "",
      doctorName: event.doctorName || "",
    });
    setShowEventForm(true);
    setShowDayDetails(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      setEvents(events.filter(e => e.id !== eventId));
      toast.success("Event deleted", { description: "The event has been removed from the calendar." });
    }
  };

  const handleSaveEvent = () => {
    if (!formData.title || !formData.date || !formData.startTime || !formData.endTime) {
      toast.error("Missing fields", { description: "Please fill in all required fields." });
      return;
    }

    if (editingEvent) {
      setEvents(events.map(e => 
        e.id === editingEvent.id ? { ...formData, id: e.id } : e
      ));
      toast.success("Event updated", { description: "The event has been updated successfully." });
    } else {
      const newEvent: CalendarEvent = { ...formData, id: Date.now().toString() };
      setEvents([...events, newEvent]);
      toast.success("Event added", { description: "The event has been added to the calendar." });
    }

    setShowEventForm(false);
    setFormData({
      title: "",
      type: "visit",
      date: "",
      startTime: "",
      endTime: "",
      notes: "",
      doctorName: "",
    });
  };

  const days = getDaysInMonth();
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;


  return (
    <div className="space-y-6">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-1 doc-calendar">
          <div>
              <h1 className="text-2xl font-bold text-foreground pb-4">
                Manage Doctor Calendar
              </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <Card className="p-6 shadow-sm border border-gray-200">
              
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="">
                  <Label>Select Doctor</Label>
                  <Select
                    value={scheduleData.doctor}
                    onValueChange={(value) =>
                      setScheduleData({ ...scheduleData, doctor: value })
                    }
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue
                        placeholder={
                          loadingDoctors
                            ? "Loading doctors..."
                            : "Select a doctor"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {doctorList.length > 0 ? (
                        doctorList.map((doc) => (
                          <SelectItem key={doc.id} value={doc.id}>
                            {doc.name}{" "}
                            {doc.specialty ? `(${doc.specialty})` : ""}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-gray-500">
                          {loadingDoctors
                            ? "Fetching doctors..."
                            : "No doctors available"}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between pt-6 pb-4 gap-4">
                  <div className="flex items-center justify-between md:justify-start gap-4">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-accent rounded-xl transition-colors">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      {format(currentDate, "MMMM yyyy")}
                    </h2>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-accent rounded-xl transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  <Button 
                    onClick={() => {
                      setSelectedDate(new Date());
                      handleAddEvent();
                    }}
                    className="bg-primary hover:bg-primary/90 text-white w-full md:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              </div>
              

              {/* Calendar Grid - Compact Mobile View */}
              <div className=" md:p-6">
                <div className="grid grid-cols-7 gap-1 md:gap-3 mb-2">
                  {(isMobile ? daysOfWeek : daysOfWeekFull).map((day, idx) => (
                    <div key={idx} className="text-center text-xs md:text-sm font-semibold text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

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
                        <div className={`text-xs md:text-sm font-bold mb-1 ${isTodayDate ? "text-white" : ""}`}>
                          {format(day, "d")}
                        </div>
                        
                        {/* Mobile: Show dots for events */}
                        {dayEvents.length > 0 && (
                          <div className="md:hidden flex gap-0.5 flex-wrap">
                            {dayEvents.slice(0, 3).map((event) => (
                              <div
                                key={event.id}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isTodayDate ? "bg-white" : getEventBadgeColor(event.type).split(' ')[0]
                                }`}
                              />
                            ))}
                          </div>
                        )}

                        {/* Desktop: Show event previews */}
                        <div className="hidden md:block space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium truncate ${
                                isTodayDate ? "bg-white/20 text-white" : getEventBadgeColor(event.type)
                              }`}
                            >
                              {getEventIcon(event.type)} {event.startTime}
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
              </div>
            </Card>

          </div>

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
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEditEvent(event)}>
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleDeleteEvent(event.id)}>
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
                            <Button variant="outline" size="icon" onClick={() => handleEditEvent(event)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => handleDeleteEvent(event.id)}>
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

          {/* Event Form - Works for both mobile and desktop */}
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
                    <label className="text-sm font-medium mb-1 block">Doctor</label>
                    <input
                      type="text"
                      value={formData.doctorName}
                      onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border bg-background"
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
                      onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border bg-background"
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
