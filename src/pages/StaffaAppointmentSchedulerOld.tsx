import { useState } from "react";
import { format, addDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Settings, Combine, Split } from "lucide-react";
import { mockDoctors, mockAppointments, Appointment } from "@/data/mockDoctors";
import { AdvancedDayView } from "@/components/scheduler/AdvancedDayView";
import { ScheduleSummary } from "@/components/scheduler/ScheduleSummary";
import { AppointmentDialog } from "@/components/scheduler/AppointmentDialog";
import { toast } from "@/hooks/use-toast";


export default function StaffaAppointmentScheduler() {

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("D001");
  const [slotDuration, setSlotDuration] = useState<number>(30);
  const [customDuration, setCustomDuration] = useState<string>("30");
  const [appointments, setAppointments] = useState(mockAppointments);

  const handleSlotDurationChange = (value: string) => {
    if (value === "custom") {
      setSlotDuration(parseInt(customDuration) || 30);
    } else {
      setSlotDuration(parseInt(value));
    }
  };
  const handleCustomDurationApply = () => {
    const duration = parseInt(customDuration);
    if (duration >= 5 && duration <= 180) {
      setSlotDuration(duration);
      toast({
        title: "Slot Duration Updated",
        description: `Slot duration set to ${duration} minutes.`,
      });
    } else {
      toast({
        title: "Invalid Duration",
        description: "Duration must be between 5 and 180 minutes.",
        variant: "destructive"
      });
    }
  };

  return (
    
    <div className="space-y-6">
     

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-1">
        <div>
          <h1 className="text-2xl font-bold text-foreground pb-4">Appointment Scheduler</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
          <div className="lg:col-span-1 space-y-4">
            {/* Calendar */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="text-lg">Select Date</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
                
                
              </CardContent>
            </Card>

            {/* Doctor Selection */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="text-lg">Select Doctor</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDoctors.map(doctor => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Slot Customization */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Slot Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Slot Duration</Label>
                  <Select 
                    value={slotDuration.toString()} 
                    onValueChange={handleSlotDurationChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Custom Duration (minutes)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="5"
                      max="180"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(e.target.value)}
                      placeholder="30"
                    />
                    <Button 
                      size="sm" 
                      onClick={handleCustomDurationApply}
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                
              </CardContent>
            </Card>
          </div>

        </div>

      </main>
    </div>
    
  );
}
