import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Plus, Trash2, Save, Eye } from "lucide-react";
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
import { fetchDoctorList, saveDoctorSchedule, fetchDoctorSchedule } from "@/services/SfstaffUseService";


// 📅 Constants
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const SLOT_SUGGESTIONS = [
  "Early Morning",
  "Morning",
  "Late Morning",
  "Afternoon",
  "Late Afternoon",
  "Evening",
  "Late Evening",
  "Night",
  "Night Shift",
  "Full Day",
  "Half Day (Morning)",
  "Half Day (Afternoon)",
  "Weekend Shift",
  "Emergency Shift",
  "On-Call Duty",
  "Follow-up Slot",
  "Consultation Hours",
  "Surgery Slot",
  "Teleconsultation",
  "Custom",
];

// ⏱️ Interfaces
interface Doctor {
  id: string;
  name: string;
  specialty?: string;
}

interface TimeSlot {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  maxAppointments: number;
}

interface ScheduleData {
  doctor: string;
  slots: TimeSlot[];
  selectedWeekdays: string[];
}

// 🧠 Component
export default function StaffAppointmentScheduler() {
  const [scheduleData, setScheduleData] = useState<ScheduleData>({
    doctor: "",
    slots: [],
    selectedWeekdays: [],
  });
  const [doctorList, setDoctorList] = useState<Doctor[]>([]);
  const [showPreview, setShowPreview] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const [savedSchedule, setSavedSchedule] = useState<ScheduleData | null>(null);
  
  // ✅ Fetch Doctors Dynamically
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const response = await fetchDoctorList(); // your API service

        if (response?.success && Array.isArray(response.data)) {
          // Map API structure -> expected shape
          const formattedDoctors = response.data.map((doc: any) => ({
            id: doc.docuid, // important: map docuid → id
            name: doc.name,
            specialty: doc.specialty || "", // optional
          }));
          setDoctorList(formattedDoctors);
        } else {
          toast.error("Invalid doctor data format from API");
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast.error("Failed to fetch doctor list");
      } finally {
        setLoadingDoctors(false);
      }
    };

    loadDoctors();
  }, []);


  useEffect(() => {
    const loadSavedSchedule = async () => {
      if (!scheduleData.doctor) return;

      try {
        toast.loading("Loading saved schedule...");
        const response = await fetchDoctorSchedule(scheduleData.doctor);
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





  // ⏰ Utility: convert HH:mm → minutes
  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  // ➕ Add Slot
  const addSlot = () => {
    const slots = scheduleData.slots;
    if (slots.length > 0) {
      const lastSlot = slots[slots.length - 1];
      const lastEnd = timeToMinutes(lastSlot.endTime);

      if (lastEnd >= 24 * 60) {
        toast.error("You’ve reached the end of the day.");
        return;
      }

      const startH = Math.floor(lastEnd / 60);
      const startM = lastEnd % 60;
      const nextStart = `${String(startH).padStart(2, "0")}:${String(
        startM
      ).padStart(2, "0")}`;
      const nextEndMinutes = Math.min(lastEnd + 60, 24 * 60);
      const endH = Math.floor(nextEndMinutes / 60);
      const endM = nextEndMinutes % 60;
      const nextEnd = `${String(endH).padStart(2, "0")}:${String(
        endM
      ).padStart(2, "0")}`;

      const newSlot: TimeSlot = {
        id: Date.now().toString(),
        title: "",
        startTime: nextStart,
        endTime: nextEnd,
        maxAppointments: 10,
      };
      setScheduleData({ ...scheduleData, slots: [...slots, newSlot] });
    } else {
      const newSlot: TimeSlot = {
        id: Date.now().toString(),
        title: "",
        startTime: "09:00",
        endTime: "10:00",
        maxAppointments: 10,
      };
      setScheduleData({ ...scheduleData, slots: [newSlot] });
    }
  };

  // ✏️ Update Slot
  const updateSlot = (
    id: string,
    field: keyof TimeSlot,
    value: string | number
  ) => {
    const updatedSlots = scheduleData.slots.map((slot) =>
      slot.id === id ? { ...slot, [field]: value } : slot
    );

    const slot = updatedSlots.find((s) => s.id === id);
    if (slot) {
      const startMin = timeToMinutes(slot.startTime);
      const endMin = timeToMinutes(slot.endTime);
      if (endMin <= startMin) {
        toast.error("End time must be later than start time!");
        return;
      }

      // Check overlap
      const sorted = [...updatedSlots].sort(
        (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
      );
      for (let i = 0; i < sorted.length - 1; i++) {
        const currEnd = timeToMinutes(sorted[i].endTime);
        const nextStart = timeToMinutes(sorted[i + 1].startTime);
        if (currEnd > nextStart) {
          toast.error("Time slots cannot overlap!");
          return;
        }
      }
    }

    setScheduleData({ ...scheduleData, slots: updatedSlots });
  };

  const deleteSlot = (id: string) => {
    setScheduleData({
      ...scheduleData,
      slots: scheduleData.slots.filter((slot) => slot.id !== id),
    });
  };

  const toggleWeekday = (day: string) => {
    const updated = scheduleData.selectedWeekdays.includes(day)
      ? scheduleData.selectedWeekdays.filter((d) => d !== day)
      : [...scheduleData.selectedWeekdays, day];
    setScheduleData({ ...scheduleData, selectedWeekdays: updated });
  };

  

  const selectedDoctor = doctorList.find(
    (d) => d.id === scheduleData.doctor
  );

  // 💾 Submit Handler with Validation + API Call
  const handleSubmit = async () => {
    // 🧩 Basic validations
    if (!scheduleData.doctor) {
      toast.error("Please select a doctor before saving.");
      return;
    }

    if (scheduleData.selectedWeekdays.length === 0) {
      toast.error("Please select at least one weekday.");
      return;
    }

    if (scheduleData.slots.length === 0) {
      toast.error("Please add at least one time slot.");
      return;
    }

    // 🔍 Validate slot fields
    for (const slot of scheduleData.slots) {
      if (!slot.title) {
        toast.error("Each slot must have a title.");
        return;
      }
      if (!slot.startTime || !slot.endTime) {
        toast.error("Each slot must have valid start and end times.");
        return;
      }
      if (Number(slot.maxAppointments) <= 0) {
        toast.error("Max appointments must be at least 1.");
        return;
      }
    }

    try {
      toast.loading("Saving schedule...");

      // 🔧 Build payload for backend
      const payload = {
        doctorId: scheduleData.doctor,
        weekdays: scheduleData.selectedWeekdays,
        slots: scheduleData.slots.map((s) => ({
          title: s.title,
          start_time: s.startTime,
          end_time: s.endTime,
          max_appointments: s.maxAppointments,
        })),
      };

      const response = await saveDoctorSchedule(payload);

      toast.dismiss(); // remove loading toast

      if (response?.success) {
        toast.success("✅ Schedule saved successfully!");
        console.log("Saved schedule response:", response);

        // reset form if needed
        setScheduleData({
          doctor: "",
          slots: [],
          selectedWeekdays: [],
        });
      } else {
        toast.error(response?.message || "Failed to save schedule.");
      }
    } catch (error: any) {
      toast.dismiss();
      console.error("Save schedule error:", error);
      toast.error("An error occurred while saving schedule.");
    }
  };



  return (
    <div className="space-y-6">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-1">
        <div>
          <h1 className="text-2xl font-bold text-foreground pb-4">
            Doctor Master Scheduler
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Clock className="w-5 h-5" /> Doctor Availability Scheduler
                </h2>
                <Button
                  onClick={() => setShowPreview(!showPreview)}
                  variant="outline"
                  size="sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showPreview ? "Hide Preview" : "Show Preview"}
                </Button>
              </div>

              {/* Doctor Selection */}
              <div className="mb-4">
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

              {/* Weekday Buttons */}
              <div className="mt-4">
                <Label>Select Weekdays</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => (
                    <Button
                      key={day}
                      variant={
                        scheduleData.selectedWeekdays.includes(day)
                          ? "default"
                          : "outline"
                      }
                      onClick={() => toggleWeekday(day)}
                      size="sm"
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Time Slots */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-lg">Time Slots</h3>
                <Button size="sm" onClick={addSlot}>
                  <Plus className="w-4 h-4 mr-2" /> Add Slot
                </Button>
              </div>

              {scheduleData.slots.length === 0 && (
                <p className="text-gray-500 text-sm">No slots added yet.</p>
              )}

              <div className="space-y-4">
                {scheduleData.slots.map((slot) => (
                  <Card
                    key={slot.id}
                    className="p-4 border border-gray-100 shadow-sm"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Title</Label>
                        <Select
                          value={slot.title}
                          onValueChange={(value) =>
                            updateSlot(slot.id, "title", value)
                          }
                        >
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Select title" />
                          </SelectTrigger>
                          <SelectContent>
                            {SLOT_SUGGESTIONS.map((title) => (
                              <SelectItem key={title} value={title}>
                                {title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) =>
                            updateSlot(slot.id, "startTime", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) =>
                            updateSlot(slot.id, "endTime", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <Label>Max Appointments</Label>
                        <Input
                          type="number"
                          min={1}
                          max={50}
                          value={slot.maxAppointments}
                          onChange={(e) =>
                            updateSlot(
                              slot.id,
                              "maxAppointments",
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="flex justify-end mt-3">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteSlot(slot.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Remove
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="flex justify-end">
                <Button onClick={handleSubmit}>
                  <Save className="w-4 h-4 mr-2" /> Save Schedule
                </Button>
              </div>
            </Card>
          </div>

          <div>
            {showPreview && savedSchedule && savedSchedule.slots.length > 0 && (
              <Card className="p-6 mt-0 border border-green-200 bg-green-50">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-green-700">
                  <Eye className="w-4 h-4" /> Already Saved Schedule
                </h3>

                <div className="space-y-4">
                  {savedSchedule.selectedWeekdays.map((weekday) => {
                    const slotsForDay = savedSchedule.slots.filter(
                      (slot) => slot.weekday === weekday
                    );

                    if (slotsForDay.length === 0) return null;

                    return (
                      <div key={weekday}>
                        <h4 className="font-semibold text-sm text-gray-700 mb-1">{weekday}</h4>
                        <div className="space-y-2">
                          {slotsForDay.map((slot) => (
                            <div
                              key={slot.id}
                              className="flex justify-between border border-green-200 p-2 rounded-md bg-white"
                            >
                              <div className="flex items-center gap-3">
                                <Badge variant="secondary">{slot.title}</Badge>
                                <span className="text-sm text-gray-700">
                                  {slot.startTime} - {slot.endTime}
                                </span>
                              </div>
                              <span className="text-sm text-gray-500">
                                Max: {slot.maxAppointments}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}


            {/* Preview Section */}
            {showPreview && scheduleData.slots.length > 0 && (
              <Card className="p-6 mt-0 border border-gray-200">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" /> Schedule Preview
                </h3>
                {selectedDoctor && (
                  <p className="text-sm text-gray-600 mb-3">
                    <strong>Doctor:</strong> {selectedDoctor.name}{" "}
                    
                  </p>
                )}
                <div className="space-y-2">
                  {scheduleData.slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex justify-between border p-2 rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        <Badge>{slot.title || "Untitled"}</Badge>
                        <span className="text-sm text-gray-600">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        Max: {slot.maxAppointments}
                      </span>
                    </div>
                  ))}
                </div>

                {scheduleData.selectedWeekdays.length > 0 && (
                  <div className="mt-4">
                    <Label className="text-sm">Selected Days</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {scheduleData.selectedWeekdays.map((d) => (
                        <Badge key={d} variant="secondary">
                          {d}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>


        </div>
      </main>
    </div>
  );
}
