import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Input, Button, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui";

export default function ModifyEventsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { day, slots } = location.state || {}; // receive data via state

  const [scheduleSlots, setScheduleSlots] = useState(slots || []);

  const updateSlotField = (id: number, field: string, value: any) => {
    setScheduleSlots((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, [field]: value } : slot))
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Modify Events - {day}</h1>
        <Button onClick={() => navigate(-1)}>Back</Button>
      </div>

      <div className="space-y-4">
        {scheduleSlots.map((slot) => (
          <Card key={slot.id} className="p-4 border shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Shift */}
              <div>
                <Label>Shift / Title</Label>
                <Select
                  value={slot.shiftId || ""}
                  onValueChange={(val) => updateSlotField(slot.id, "shiftId", val)}
                >
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
                  onValueChange={(val) => updateSlotField(slot.id, "eventTypeId", val)}
                >
                  <SelectTrigger className="w-full mt-1"><SelectValue placeholder="Select event type" /></SelectTrigger>
                  <SelectContent>
                    {eventTypeList.map((et) => <SelectItem key={et.eventuid} value={et.eventuid}>{et.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Start & End Time */}
              <div>
                <Label>Start Time</Label>
                <Input type="time" value={slot.startTime} onChange={(e) => updateSlotField(slot.id, "startTime", e.target.value)} />
              </div>
              <div>
                <Label>End Time</Label>
                <Input type="time" value={slot.endTime} onChange={(e) => updateSlotField(slot.id, "endTime", e.target.value)} />
              </div>
            </div>

            {/* Max & Notes */}
            <div className="grid grid-cols-5 gap-4 pt-2">
              <div className="col-span-1">
                <Label>Max Appointments</Label>
                <Input type="number" min={1} max={50} value={slot.maxAppointments} onChange={(e) => updateSlotField(slot.id, "maxAppointments", Number(e.target.value))} />
              </div>
              <div className="col-span-3">
                <Label>Notes</Label>
                <Input type="text" value={slot.notes || ""} onChange={(e) => updateSlotField(slot.id, "notes", e.target.value)} />
              </div>
              <div className="col-span-1 pt-6">
                <Button size="sm" variant="destructive" onClick={() => setScheduleSlots(scheduleSlots.filter(s => s.id !== slot.id))}>Remove</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
