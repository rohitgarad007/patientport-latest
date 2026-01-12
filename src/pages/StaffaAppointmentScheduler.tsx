// StaffaAppointmentScheduler.tsx
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, Trash2, Save, Eye } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  fetchDoctorList,
  saveDoctorSchedule,
  fetchDoctorSchedule,
  fetchShiftList,
  fetchEventTypeList,
} from "@/services/SfstaffUseService";

// 📅 Constants
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ⏱️ Interfaces
interface Doctor { id: string; name: string; specialty?: string; }
interface Shift { shiftuid: string; shift_name: string; start_time: string; end_time: string; }
interface EventType { 
  eventuid: string; 
  name: string; 
}
interface TimeSlot {
  id: string;
  title: string;
  shiftId?: string;
  startTime: string;
  endTime: string;
  maxAppointments: number;
  notes?: string;
  weekday?: string;
  eventTypeId?: string;
}
interface ScheduleData {
  doctor: string;
  slots: TimeSlot[];
  selectedWeekdays: string[];
}

export default function StaffAppointmentScheduler() {
  const [scheduleData, setScheduleData] = useState<ScheduleData>({
    doctor: "",
    slots: [],
    selectedWeekdays: [],
  });
  const [doctorList, setDoctorList] = useState<Doctor[]>([]);
  const [shiftList, setShiftList] = useState<Shift[]>([]);
  const [eventTypeList, setEventTypeList] = useState<EventType[]>([]);
  const [showPreview, setShowPreview] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [savedSchedule, setSavedSchedule] = useState<ScheduleData | null>(null);

  // ---------------- FETCH DOCTORS ----------------
  useEffect(() => {
    const loadDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const response = await fetchDoctorList();
        if (response?.success && Array.isArray(response.data)) {
          setDoctorList(response.data.map((d: any) => ({
            id: d.docuid,
            name: d.name,
            specialty: d.specialty || "",
          })));
        } else toast.error("Invalid doctor data from API");
      } catch (error) { toast.error("Failed to fetch doctors"); }
      finally { setLoadingDoctors(false); }
    };
    loadDoctors();
  }, []);

  // ---------------- FETCH SHIFTS ----------------
  useEffect(() => {
    const loadShifts = async () => {
      try {
        const response = await fetchShiftList();
        if (response?.success && Array.isArray(response.data)) setShiftList(response.data);
        else toast.error("Failed to fetch shifts");
      } catch (error) { console.error(error); }
    };
    loadShifts();
  }, []);

  // ---------------- FETCH EVENT TYPES ----------------
  useEffect(() => {
    const loadEventTypes = async () => {
      try {
        const response = await fetchEventTypeList();
        if (response?.success && Array.isArray(response.data)) setEventTypeList(response.data);
        else toast.error("Failed to fetch event types");
      } catch (error) { console.error(error); }
    };
    loadEventTypes();
  }, []);

  // ---------------- FETCH SAVED SCHEDULE ----------------
  useEffect(() => {
    if (!scheduleData.doctor) return;
    const loadSavedSchedule = async () => {
      try {
        toast.loading("Loading saved schedule...");
        const response = await fetchDoctorSchedule(scheduleData.doctor);
        toast.dismiss();
        if (response?.success && Array.isArray(response.data)) {
          const allSlots: TimeSlot[] = [];
          const allWeekdays: string[] = [];
          response.data.forEach((dayData: any) => {
            if (dayData.weekday) allWeekdays.push(dayData.weekday);
            (dayData.slots || []).forEach((slot: any) => {
              allSlots.push({
                id: Date.now().toString() + Math.random().toString(36).substring(2),
                title: slot.title,
                type: slot.type,
                type_name: slot.type_name,
                type_color: slot.type_color,
                startTime: slot.start_time,
                endTime: slot.end_time,
                maxAppointments: Number(slot.max_appointments),
                notes: slot.notes || "",
                weekday: dayData.weekday,
                eventTypeId: slot.event_type_id || undefined,
              });
            });
          });
          setSavedSchedule({ doctor: scheduleData.doctor, slots: allSlots, selectedWeekdays: allWeekdays });
        } else setSavedSchedule(null);
      } catch (error) {
        toast.dismiss(); console.error(error); setSavedSchedule(null);
      }
    };
    loadSavedSchedule();
  }, [scheduleData.doctor]);

  // ---------------- ADD SLOT ----------------
  const addSlot = () => {
    const defaultShift = shiftList[0];
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      title: defaultShift?.shift_name || "",
      shiftId: defaultShift?.shiftuid,
      startTime: defaultShift?.start_time || "09:00",
      endTime: defaultShift?.end_time || "10:00",
      maxAppointments: 10,
      notes: "",
      eventTypeId: "",
    };
    setScheduleData({ ...scheduleData, slots: [...scheduleData.slots, newSlot] });
  };

  // ---------------- UPDATE SLOT ----------------
  const updateSlotShift = (slotId: string, shiftId: string) => {
    const shift = shiftList.find((s) => s.shiftuid === shiftId);
    if (!shift) return;

    const updatedSlots = scheduleData.slots.map((slot) =>
      slot.id === slotId
        ? {
            ...slot,
            title: shift.shift_name,
            startTime: shift.start_time,
            endTime: shift.end_time,
            shiftId: shift.shiftuid,
          }
        : slot
    );

    // Overlap check
    const toMinutes = (time: string) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };
    const sorted = [...updatedSlots].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
    for (let i = 0; i < sorted.length - 1; i++) {
      if (toMinutes(sorted[i].endTime) > toMinutes(sorted[i + 1].startTime)) {
        toast.error("Time slots cannot overlap!");
        return;
      }
    }

    setScheduleData({ ...scheduleData, slots: updatedSlots });
  };

  const updateSlotField = (slotId: string, field: keyof TimeSlot, value: any) => {
    setScheduleData({
      ...scheduleData,
      slots: scheduleData.slots.map((s) => (s.id === slotId ? { ...s, [field]: value } : s)),
    });
  };

  // ---------------- DELETE SLOT ----------------
  const deleteSlot = (id: string) => {
    setScheduleData({ ...scheduleData, slots: scheduleData.slots.filter((s) => s.id !== id) });
  };

  // ---------------- TOGGLE WEEKDAY ----------------
  const toggleWeekday = (day: string) => {
    const updated = scheduleData.selectedWeekdays.includes(day)
      ? scheduleData.selectedWeekdays.filter((d) => d !== day)
      : [...scheduleData.selectedWeekdays, day];
    setScheduleData({ ...scheduleData, selectedWeekdays: updated });
  };

  // ---------------- SAVE SCHEDULE ----------------
  const handleSubmit = async () => {
    if (!scheduleData.doctor || scheduleData.selectedWeekdays.length === 0 || scheduleData.slots.length === 0) {
      toast.error("Please complete the form before saving.");
      return;
    }
    try {
      toast.loading("Saving schedule...");
      const payload = {
        doctorId: scheduleData.doctor,
        weekdays: scheduleData.selectedWeekdays,
        slots: scheduleData.slots.map((s) => ({
          title: s.title,
          start_time: s.startTime,
          end_time: s.endTime,
          max_appointments: s.maxAppointments,
          notes: s.notes || "",
          event_type_id: s.eventTypeId || null,
        })),
      };
      const response = await saveDoctorSchedule(payload);
      toast.dismiss();
      if (response?.success) {
        toast.success("✅ Schedule saved successfully!");
        setScheduleData({ doctor: "", slots: [], selectedWeekdays: [] });
      } else toast.error(response?.message || "Failed to save schedule.");
    } catch (error) {
      toast.dismiss();
      console.error(error);
      toast.error("An error occurred while saving schedule.");
    }
  };

  return (
    <div className="space-y-6">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-1">
        <h1 className="text-2xl font-bold text-foreground pb-4">Doctor Master Scheduler</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5" /> Doctor Availability Scheduler
                </h2>
                <Button onClick={() => setShowPreview(!showPreview)} variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  {showPreview ? "Hide Preview" : "Show Preview"}
                </Button>
              </div>

              {/* Doctor Selection */}
              <div className="mb-4">
                <Label>Select Doctor</Label>
                <Select value={scheduleData.doctor} onValueChange={(value) => setScheduleData({ ...scheduleData, doctor: value })}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder={loadingDoctors ? "Loading doctors..." : "Select a doctor"} />
                  </SelectTrigger>
                  <SelectContent>
                    {doctorList.length > 0
                      ? doctorList.map((doc) => <SelectItem key={doc.id} value={doc.id}>{doc.name} {doc.specialty ? `(${doc.specialty})` : ""}</SelectItem>)
                      : <div className="p-2 text-sm text-gray-500">{loadingDoctors ? "Fetching doctors..." : "No doctors available"}</div>
                    }
                  </SelectContent>
                </Select>
              </div>

              {/* Weekdays */}
              <div className="mt-4">
                <Label>Select Weekdays</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => (
                    <Button key={day} variant={scheduleData.selectedWeekdays.includes(day) ? "default" : "outline"} onClick={() => toggleWeekday(day)} size="sm">{day}</Button>
                  ))}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Time Slots */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-lg">Time Slots</h3>
                <Button size="sm" onClick={addSlot}><Plus className="w-4 h-4 mr-2" /> Add Slot</Button>
              </div>

              {scheduleData.slots.length === 0 && <p className="text-gray-500 text-sm">No slots added yet.</p>}

              <div className="space-y-4">


                {scheduleData.slots.map((slot) => {
                  const selectedShift = shiftList.find((s) => s.shiftuid === slot.shiftId);

                  // Helper to convert HH:mm to 12-hour format + period
                  const to12Hour = (time: string) => {
                    const [h, m] = time.split(":").map(Number);
                    const period = h >= 12 ? "PM" : "AM";
                    const hour = h % 12 === 0 ? 12 : h % 12;
                    return { hour: hour.toString().padStart(2, "0"), minute: m.toString().padStart(2, "0"), period };
                  };

                  // Start and end in 12-hour
                  const start = slot.startTime ? to12Hour(slot.startTime) : { hour: "12", minute: "00", period: "AM" };
                  const end = slot.endTime ? to12Hour(slot.endTime) : { hour: "12", minute: "00", period: "PM" };

                  // Shift boundaries in 12-hour
                  const shiftStart = selectedShift ? to12Hour(selectedShift.start_time) : { hour: "12", minute: "00", period: "AM" };
                  const shiftEnd = selectedShift ? to12Hour(selectedShift.end_time) : { hour: "12", minute: "00", period: "PM" };

                  // Convert 12-hour to 24-hour HH:mm
                  const to24Hour = (hour: string, minute: string, period: "AM" | "PM") => {
                    let h = Number(hour);
                    if (period === "PM" && h < 12) h += 12;
                    if (period === "AM" && h === 12) h = 0;
                    return `${h.toString().padStart(2, "0")}:${minute}`;
                  };

                  const updateStartTime = (hour: string, minute: string, period: "AM" | "PM") => {
                    const newTime = to24Hour(hour, minute, period);
                    const shiftStart24 = to24Hour(shiftStart.hour, shiftStart.minute, shiftStart.period as "AM" | "PM");
                    const shiftEnd24 = to24Hour(shiftEnd.hour, shiftEnd.minute, shiftEnd.period as "AM" | "PM");

                    if (newTime < shiftStart24) {
                      toast.error(`Start time cannot be before shift start: ${shiftStart24}`);
                      updateSlotField(slot.id, "startTime", shiftStart24);
                      return;
                    }
                    if (newTime > shiftEnd24) {
                      toast.error(`Start time cannot be after shift end: ${shiftEnd24}`);
                      updateSlotField(slot.id, "startTime", shiftEnd24);
                      return;
                    }
                    if (slot.endTime && newTime > slot.endTime) {
                      toast.error("Start time cannot be after End time");
                      updateSlotField(slot.id, "startTime", slot.endTime);
                      return;
                    }
                    updateSlotField(slot.id, "startTime", newTime);
                  };

                  const updateEndTime = (hour: string, minute: string, period: "AM" | "PM") => {
                    const newTime = to24Hour(hour, minute, period);
                    const shiftStart24 = to24Hour(shiftStart.hour, shiftStart.minute, shiftStart.period as "AM" | "PM");
                    const shiftEnd24 = to24Hour(shiftEnd.hour, shiftEnd.minute, shiftEnd.period as "AM" | "PM");

                    if (newTime < shiftStart24) {
                      toast.error(`End time cannot be before shift start: ${shiftStart24}`);
                      updateSlotField(slot.id, "endTime", shiftStart24);
                      return;
                    }
                    if (newTime > shiftEnd24) {
                      toast.error(`End time cannot be after shift end: ${shiftEnd24}`);
                      updateSlotField(slot.id, "endTime", shiftEnd24);
                      return;
                    }
                    if (slot.startTime && newTime < slot.startTime) {
                      toast.error("End time cannot be before Start time");
                      updateSlotField(slot.id, "endTime", slot.startTime);
                      return;
                    }
                    updateSlotField(slot.id, "endTime", newTime);
                  };

                  return (
                    <Card key={slot.id} className="p-4 border border-gray-100 shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Shift */}
                        <div>
                          <Label>Shift / Title</Label>
                          <Select value={slot.shiftId || ""} onValueChange={(value) => updateSlotShift(slot.id, value)}>
                            <SelectTrigger className="w-full mt-1"><SelectValue placeholder="Select shift" /></SelectTrigger>
                            <SelectContent>
                              {shiftList.map((s) => <SelectItem key={s.shiftuid} value={s.shiftuid}>{s.shift_name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Event Type */}
                       <div>
                        <Label>Event Type</Label>
                        <Select
                          value={slot.eventTypeId || ""}
                          onValueChange={(value) => updateSlotField(slot.id, "eventTypeId", value || "")}
                        >
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                          <SelectContent>
                            {eventTypeList.length > 0 ? (
                              eventTypeList.map((et) => (
                                <SelectItem key={et.eventuid} value={et.eventuid}>
                                  {et.name}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-2 text-sm text-gray-500">
                                No event types available
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>




                        {/* Start Time */}
                        <div>
                          <Label>Start Time</Label>
                          <div className="flex gap-2">
                            <Select value={start.hour} onValueChange={(h) => updateStartTime(h, start.minute, start.period as "AM" | "PM")}>
                              <SelectTrigger className="w-[80px]"><SelectValue placeholder="Hour" /></SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => {
                                  const hr = (i + 1).toString().padStart(2, "0");
                                  return <SelectItem key={hr} value={hr}>{hr}</SelectItem>;
                                })}
                              </SelectContent>
                            </Select>

                            <Select value={start.minute} onValueChange={(m) => updateStartTime(start.hour, m, start.period as "AM" | "PM")}>
                              <SelectTrigger className="w-[80px]"><SelectValue placeholder="Min" /></SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => {
                                  const min = (i * 5).toString().padStart(2, "0");
                                  return <SelectItem key={min} value={min}>{min}</SelectItem>;
                                })}
                              </SelectContent>
                            </Select>

                            <Select value={start.period} onValueChange={(p) => updateStartTime(start.hour, start.minute, p as "AM" | "PM")}>
                              <SelectTrigger className="w-[70px]"><SelectValue placeholder="AM/PM" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AM">AM</SelectItem>
                                <SelectItem value="PM">PM</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* End Time */}
                        <div>
                          <Label>End Time</Label>
                          <div className="flex gap-2">
                            <Select value={end.hour} onValueChange={(h) => updateEndTime(h, end.minute, end.period as "AM" | "PM")}>
                              <SelectTrigger className="w-[80px]"><SelectValue placeholder="Hour" /></SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => {
                                  const hr = (i + 1).toString().padStart(2, "0");
                                  return <SelectItem key={hr} value={hr}>{hr}</SelectItem>;
                                })}
                              </SelectContent>
                            </Select>

                            <Select value={end.minute} onValueChange={(m) => updateEndTime(end.hour, m, end.period as "AM" | "PM")}>
                              <SelectTrigger className="w-[80px]"><SelectValue placeholder="Min" /></SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => {
                                  const min = (i * 5).toString().padStart(2, "0");
                                  return <SelectItem key={min} value={min}>{min}</SelectItem>;
                                })}
                              </SelectContent>
                            </Select>

                            <Select value={end.period} onValueChange={(p) => updateEndTime(end.hour, end.minute, p as "AM" | "PM")}>
                              <SelectTrigger className="w-[70px]"><SelectValue placeholder="AM/PM" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AM">AM</SelectItem>
                                <SelectItem value="PM">PM</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Max & Notes */}
                      <div className="grid grid-cols-5 gap-4 pt-2">
                        <div className="col-span-1">
                          <Label>Max Appointments</Label>
                          <Input type="number" min={1} max={50} value={slot.maxAppointments}
                            onChange={(e) => updateSlotField(slot.id, "maxAppointments", Number(e.target.value))} />
                        </div>
                        <div className="col-span-3">
                          <Label>Notes</Label>
                          <Input type="text" value={slot.notes || ""} onChange={(e) => updateSlotField(slot.id, "notes", e.target.value)} />
                        </div>
                        <div className="col-span-1 pt-6">
                          <Button size="sm" variant="destructive" onClick={() => deleteSlot(slot.id)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Remove
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}


              </div>

              <Separator className="my-6" />
              <div className="flex justify-end">
                <Button onClick={handleSubmit}><Save className="w-4 h-4 mr-2" /> Save Schedule</Button>
              </div>
            </Card>
          </div>

          {/* Preview */}
          <div>
            {showPreview && savedSchedule && savedSchedule.slots.length > 0 && (
              <Card className="p-6 mt-0 border border-green-200 bg-green-50">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-green-700"><Eye className="w-4 h-4" /> Already Saved Schedule</h3>
                <div className="space-y-4">
                  {savedSchedule.selectedWeekdays.map((weekday) => {
                    const slotsForDay = savedSchedule.slots.filter((slot) => slot.weekday === weekday);
                    if (!slotsForDay.length) return null;
                    return (
                      <div key={weekday}>
                        <h4 className="font-semibold text-sm text-gray-700 mb-1">{weekday}</h4>
                        <div className="space-y-2">
                          {slotsForDay.map((slot) => {
                            // Convert 24-hour time to 12-hour format
                            const formatTime = (timeStr) => {
                              if (!timeStr) return "";
                              const [hours, minutes] = timeStr.split(":");
                              const date = new Date();
                              date.setHours(hours, minutes);
                              return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
                            };

                            return (
                              <div
                                key={slot.id}
                                className="border border-green-200 p-3 rounded-md bg-white shadow-sm"
                                style={{
                                  border: `1px solid ${slot.type_color || "#ccc"}`,
                                }}

                              >
                                {/* First line */}
                                <div className="flex flex-wrap items-center gap-3 mb-1">
                                  <Badge
                                    variant="secondary"
                                    style={{
                                      backgroundColor: slot.type_color || "#ccc",
                                      color: "#fff",
                                      borderRadius: '4px',
                                      fontWeight: '400',
                                      fontSize: '13px'
                                    }}
                                  >
                                    {slot.title} {slot.type_name ? `- ${slot.type_name}` : ""}
                                  </Badge>

                                  {slot.eventTypeId && (
                                    <Badge variant="outline" className="ml-1 text-xs">
                                      {eventTypeList.find((et) => et.id === slot.eventTypeId)?.name}
                                    </Badge>
                                  )}
                                </div>

                                {/* Second line — Left: Time | Right: Max */}
                                <div className="flex justify-between items-center text-sm text-gray-500">
                                  <span className="text-gray-700">
                                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                  </span>

                                  <span className="text-gray-500">
                                    Max: <span className="font-medium text-gray-700">{slot.maxAppointments}</span>
                                  </span>
                                </div>
                              </div>
                            );
                          })}


                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
